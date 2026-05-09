<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presensi;
use App\Models\Peserta;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PresensiController extends Controller
{
    /**
     * Get all attendance data
     */
    public function index(Request $request)
    {
        try {
            $query = Presensi::with(['peserta.user', 'peserta.divisi']);
            
            // Filter by tanggal
            if ($request->has('tanggal')) {
                $query->where('tanggal', $request->tanggal);
            }
            
            // Filter by divisi - melalui relasi peserta ke divisi
            if ($request->has('divisi')) {
                $query->whereHas('peserta.divisi', function($q) use ($request) {
                    $q->where('nama_divisi', $request->divisi);
                });
            }
            
            $data = $query->orderBy('tanggal', 'desc')->get();
            
            $formattedData = $data->map(function($item) {
                return [
                    'id' => $item->id_presensi ?? $item->id,
                    'nama' => $item->peserta->user->nama ?? '-',
                    'divisi' => $item->peserta->divisi->nama_divisi ?? '-',
                    'tanggal' => $item->tanggal,
                    'check_in' => $item->check_in,
                    'check_out' => $item->check_out,
                    'status' => $item->status_kehadiran,
                    'durasi' => $this->calculateDuration($item->check_in, $item->check_out),
                    'keterlambatan' => $this->calculateLateness($item->check_in),
                    'device' => 'Web',
                    'lokasi' => $item->lokasi,
                    'daily_report' => $item->daily_report,
                    'peserta' => [
                        'nama' => $item->peserta->user->nama ?? '-',
                        'divisi' => $item->peserta->divisi->nama_divisi ?? '-'
                    ]
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $formattedData
            ]);
        } catch (\Exception $e) {
            Log::error('Error index presensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data presensi',
                'data' => []
            ], 500);
        }
    }
    
    /**
     * Calculate duration between check_in and check_out
     */
    private function calculateDuration($checkIn, $checkOut)
    {
        if (!$checkIn || !$checkOut) return '-';
        $duration = (strtotime($checkOut) - strtotime($checkIn)) / 60;
        $jam = floor($duration / 60);
        $menit = $duration % 60;
        return $jam . ' jam ' . $menit . ' menit';
    }
    
    /**
     * Calculate lateness in minutes
     */
    private function calculateLateness($checkIn)
    {
        if (!$checkIn) return 0;
        $jamMasuk = '08:00:00';
        if ($checkIn <= $jamMasuk) return 0;
        return round((strtotime($checkIn) - strtotime($jamMasuk)) / 60);
    }
    
    /**
     * Get attendance statistics for dashboard
     */
    public function getStats(Request $request)
    {
        try {
            $today = $request->tanggal ?? date('Y-m-d');
            
            // Get total peserta
            try {
                $totalPeserta = Peserta::count();
            } catch (\Exception $e) {
                $totalPeserta = 0;
            }
            
            // Count attendance by status kehadiran
            try {
                $hadir = Presensi::whereDate('tanggal', $today)
                    ->where('status_kehadiran', 'Hadir')
                    ->count();
                    
                $terlambat = Presensi::whereDate('tanggal', $today)
                    ->where('status_kehadiran', 'Terlambat')
                    ->count();
                    
                $tidakHadir = Presensi::whereDate('tanggal', $today)
                    ->where('status_kehadiran', 'Tidak Hadir')
                    ->count();
                    
                $izin = Presensi::whereDate('tanggal', $today)
                    ->where('status_kehadiran', 'Izin')
                    ->count();
            } catch (\Exception $e) {
                $hadir = 0;
                $terlambat = 0;
                $tidakHadir = 0;
                $izin = 0;
            }
            
            // Calculate percentage
            $persentase = $totalPeserta > 0 
                ? round((($hadir + $terlambat) / $totalPeserta) * 100) 
                : 0;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $totalPeserta,
                    'hadir' => $hadir,
                    'terlambat' => $terlambat,
                    'tidak_hadir' => $tidakHadir,
                    'izin' => $izin,
                    'absen' => $tidakHadir,
                    'persentase' => $persentase
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getStats presensi: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data' => [
                    'total' => 0,
                    'hadir' => 0,
                    'terlambat' => 0,
                    'tidak_hadir' => 0,
                    'izin' => 0,
                    'absen' => 0,
                    'persentase' => 0
                ]
            ]);
        }
    }
    
    /**
     * Get attendance by peserta (for peserta dashboard)
     */
    public function getByPeserta(Request $request)
    {
        try {
            $pesertaId = $request->user()->peserta->id_peserta ?? null;
            
            if (!$pesertaId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }
            
            $presensi = Presensi::where('id_peserta', $pesertaId)
                ->orderBy('tanggal', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $presensi
            ]);
        } catch (\Exception $e) {
            Log::error('Error getByPeserta presensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Check in
     */
    public function checkIn(Request $request)
    {
        try {
            $pesertaId = $request->user()->peserta->id_peserta ?? null;
            
            if (!$pesertaId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }
            
            $today = date('Y-m-d');
            $existing = Presensi::where('id_peserta', $pesertaId)
                ->whereDate('tanggal', $today)
                ->first();
            
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan check-in hari ini'
                ], 400);
            }
            
            $checkIn = date('H:i:s');
            $statusKehadiran = 'Hadir';
            $keterlambatan = 0;
            
            // Cek jika terlambat (jam masuk 08:00)
            $jamMasuk = '08:00:00';
            if ($checkIn > $jamMasuk) {
                $keterlambatan = round((strtotime($checkIn) - strtotime($jamMasuk)) / 60);
                if ($keterlambatan > 15) {
                    $statusKehadiran = 'Terlambat';
                }
            }
            
            $presensi = Presensi::create([
                'id_peserta' => $pesertaId,
                'tanggal' => $today,
                'check_in' => $checkIn,
                'status_kehadiran' => $statusKehadiran,
                'lokasi' => $request->lokasi ?? null,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Check-in berhasil',
                'data' => $presensi
            ]);
        } catch (\Exception $e) {
            Log::error('Error checkIn presensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan check-in: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Check out
     */
    public function checkOut(Request $request)
    {
        try {
            $pesertaId = $request->user()->peserta->id_peserta ?? null;
            
            if (!$pesertaId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }
            
            $today = date('Y-m-d');
            $presensi = Presensi::where('id_peserta', $pesertaId)
                ->whereDate('tanggal', $today)
                ->first();
            
            if (!$presensi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda belum check-in hari ini'
                ], 400);
            }
            
            if ($presensi->check_out) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan check-out'
                ], 400);
            }
            
            $checkOut = date('H:i:s');
            $presensi->check_out = $checkOut;
            $presensi->daily_report = $request->daily_report;
            $presensi->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Check-out berhasil',
                'data' => $presensi
            ]);
        } catch (\Exception $e) {
            Log::error('Error checkOut presensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan check-out: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Export attendance report
     */
    public function export(Request $request)
    {
        try {
            $query = Presensi::with(['peserta.user', 'peserta.divisi'])->orderBy('tanggal', 'desc');
            
            if ($request->has('divisi') && $request->divisi && $request->divisi !== 'all') {
                $query->whereHas('peserta.divisi', function($q) use ($request) {
                    $q->where('nama_divisi', $request->divisi);
                });
            }
            
            if ($request->has('tanggal') && $request->tanggal) {
                $query->whereDate('tanggal', $request->tanggal);
            }
            
            if ($request->has('tanggal_mulai') && $request->has('tanggal_selesai')) {
                $query->whereBetween('tanggal', [$request->tanggal_mulai, $request->tanggal_selesai]);
            }
            
            $data = $query->get();
            
            // Generate CSV data
            $csv = "ID,Nama,Divisi,Tanggal,Check In,Check Out,Status,Durasi,Device,Lokasi,Daily Report\n";
            foreach ($data as $item) {
                $csv .= implode(',', [
                    $item->id_presensi,
                    '"' . addslashes($item->peserta->user->nama ?? '-') . '"',
                    '"' . addslashes($item->peserta->divisi->nama_divisi ?? '-') . '"',
                    $item->tanggal,
                    $item->check_in ?? '-',
                    $item->check_out ?? '-',
                    $item->status_kehadiran ?? '-',
                    $this->calculateDuration($item->check_in, $item->check_out),
                    '"' . addslashes($item->lokasi ?? '-') . '"',
                    '"' . addslashes($item->daily_report ?? '-') . '"'
                ]) . "\n";
            }
            
            $filename = 'presensi_' . date('Y-m-d') . '.csv';
            
            return response($csv)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');
        } catch (\Exception $e) {
            Log::error('Error export presensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengekspor data presensi: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get attendance detail by ID
     */
    public function show($id)
    {
        try {
            $presensi = Presensi::with(['peserta.user', 'peserta.divisi'])->find($id);
            
            if (!$presensi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data presensi tidak ditemukan'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $presensi->id_presensi,
                    'nama' => $presensi->peserta->user->nama ?? '-',
                    'divisi' => $presensi->peserta->divisi->nama_divisi ?? '-',
                    'tanggal' => $presensi->tanggal,
                    'check_in' => $presensi->check_in,
                    'check_out' => $presensi->check_out,
                    'status' => $presensi->status_kehadiran,
                    'durasi' => $this->calculateDuration($presensi->check_in, $presensi->check_out),
                    'keterlambatan' => $this->calculateLateness($presensi->check_in),
                    'lokasi' => $presensi->lokasi,
                    'daily_report' => $presensi->daily_report,
                    'peserta' => [
                        'nama' => $presensi->peserta->user->nama ?? '-',
                        'divisi' => $presensi->peserta->divisi->nama_divisi ?? '-'
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error show presensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail presensi'
            ], 500);
        }
    }
}