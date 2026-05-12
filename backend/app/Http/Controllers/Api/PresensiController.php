<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presensi;
use App\Models\Peserta;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PresensiController extends Controller
{
    /**
     * Get all attendance data
     */
    public function index(Request $request)
    {
        try {
            $query = Presensi::with(['peserta.user']);

            // Filter by date range
            if ($request->has('start_date') && $request->start_date) {
                $query->whereDate('tanggal', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $query->whereDate('tanggal', '<=', $request->end_date);
            }

            // Filter by division
            if ($request->has('divisi') && $request->divisi !== 'all') {
                $query->whereHas('peserta', function($q) use ($request) {
                    $q->where('divisi', $request->divisi);
                });
            }

            $presensi = $query->orderBy('tanggal', 'desc')
                             ->orderBy('created_at', 'desc')
                             ->get();

            // Format response
            $data = $presensi->map(function($item) {
                $peserta = $item->peserta;
                $user = $peserta ? $peserta->user : null;
                
                // Calculate lateness
                $keterlambatan = $this->calculateLateness($item->check_in);
                
                // Determine status
                $status = $item->status_kehadiran;
                if ($item->status_kehadiran === 'Hadir' && $keterlambatan > 15) {
                    $status = 'Terlambat';
                }

                return [
                    'id' => $item->id_presensi,
                    'peserta' => [
                        'id' => $peserta ? $peserta->id_peserta : null,
                        'nama' => $user ? $user->nama : ($peserta ? $peserta->nama : '-'),
                        'divisi' => $peserta ? $peserta->divisi : '-',
                    ],
                    'nama' => $user ? $user->nama : ($peserta ? $peserta->nama : '-'),
                    'divisi' => $peserta ? $peserta->divisi : '-',
                    'tanggal' => $item->tanggal,
                    'check_in' => $item->check_in ? $item->tanggal . ' ' . $item->check_in : null,
                    'check_out' => $item->check_out ? $item->tanggal . ' ' . $item->check_out : null,
                    'status' => $status,
                    'keterlambatan' => $keterlambatan,
                    'device' => $item->device ?? null,
                    'lokasi' => $item->lokasi ?? null,
                    'daily_report' => $item->daily_report ?? null,
                    'foto_checkin' => $item->foto_checkin ? Storage::url($item->foto_checkin) : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Data presensi berhasil diambil'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error index presensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data presensi: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
    
    /**
     * Calculate duration between check_in and check_out
     */
    private function calculateDuration($checkIn, $checkOut)
    {
        if (!$checkIn || !$checkOut) return 0;
        
        $checkInTime = strtotime($checkIn);
        $checkOutTime = strtotime($checkOut);
        
        return round(($checkOutTime - $checkInTime) / 60);
    }
    
    /**
     * Calculate lateness in minutes
     */
    private function calculateLateness($checkIn)
    {
        if (!$checkIn) return 0;
        
        $jamMasuk = '08:00:00';
        $checkInTime = strtotime($checkIn);
        $jamMasukTime = strtotime($jamMasuk);
        
        if ($checkInTime <= $jamMasukTime) return 0;
        
        return round(($checkInTime - $jamMasukTime) / 60);
    }
    
    /**
     * Get attendance statistics for dashboard
     */
    public function getStats(Request $request)
    {
        try {
            $query = Presensi::query();
            
            if ($request->has('start_date') && $request->start_date) {
                $query->whereDate('tanggal', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $query->whereDate('tanggal', '<=', $request->end_date);
            }
            
            $total = $query->count();
            $hadir = $query->clone()->where('status_kehadiran', 'Hadir')->count();
            $terlambat = $query->clone()->where('status_kehadiran', 'Terlambat')->count();
            $tidakHadir = $query->clone()->where('status_kehadiran', 'Tidak Hadir')->count();
            
            $persenKehadiran = $total > 0 ? round((($hadir + $terlambat) / $total) * 100) : 0;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'hadir' => $hadir,
                    'terlambat' => $terlambat,
                    'tidakHadir' => $tidakHadir,
                    'persenKehadiran' => $persenKehadiran
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getStats presensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik presensi'
            ], 500);
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
                ->get()
                ->map(function($item) {
                    return [
                        'id' => $item->id_presensi,
                        'tanggal' => $item->tanggal,
                        'check_in' => $item->check_in,
                        'check_out' => $item->check_out,
                        'status_kehadiran' => $item->status_kehadiran,
                        'keterlambatan' => $this->calculateLateness($item->check_in),
                        'daily_report' => $item->daily_report,
                        'lokasi' => $item->lokasi,
                        'foto_checkin' => $item->foto_checkin ? Storage::url($item->foto_checkin) : null,
                    ];
                });
            
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
     * Get today's presensi status for current peserta
     */
    public function getTodayPresensi(Request $request)
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
                    'success' => true,
                    'data' => null
                ]);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $presensi->id_presensi,
                    'tanggal' => $presensi->tanggal,
                    'check_in' => $presensi->check_in,
                    'check_out' => $presensi->check_out,
                    'foto_checkin' => $presensi->foto_checkin,
                    'lokasi' => $presensi->lokasi,
                    'status_kehadiran' => $presensi->status_kehadiran,
                    'daily_report' => $presensi->daily_report
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getTodayPresensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Check in with photo upload
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
            
            if ($existing && $existing->check_in) {
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
            
            // Handle foto upload
            $fotoPath = null;
            if ($request->hasFile('foto')) {
                $file = $request->file('foto');
                $filename = 'presensi_' . $pesertaId . '_' . $today . '_' . time() . '.' . $file->getClientOriginalExtension();
                $fotoPath = $file->storeAs('presensi/foto', $filename, 'public');
            }
            
            $presensi = Presensi::create([
                'id_peserta' => $pesertaId,
                'tanggal' => $today,
                'check_in' => $checkIn,
                'status_kehadiran' => $statusKehadiran,
                'lokasi' => $request->lokasi ?? null,
                'foto_checkin' => $fotoPath,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Check-in berhasil',
                'data' => [
                    'id' => $presensi->id_presensi,
                    'check_in' => $presensi->check_in,
                    'status' => $presensi->status_kehadiran
                ]
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
                'data' => [
                    'id' => $presensi->id_presensi,
                    'check_out' => $presensi->check_out
                ]
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
            $query = Presensi::with(['peserta.user']);
            
            if ($request->has('start_date') && $request->start_date) {
                $query->whereDate('tanggal', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $query->whereDate('tanggal', '<=', $request->end_date);
            }
            
            $presensi = $query->orderBy('tanggal', 'desc')->get();
            
            // Format data untuk export
            $exportData = $presensi->map(function($item, $index) {
                $peserta = $item->peserta;
                $user = $peserta ? $peserta->user : null;
                $keterlambatan = $this->calculateLateness($item->check_in);
                
                return [
                    'No' => $index + 1,
                    'Nama Peserta' => $user ? $user->nama : ($peserta ? $peserta->nama : '-'),
                    'Divisi' => $peserta ? $peserta->divisi : '-',
                    'Tanggal' => $item->tanggal,
                    'Check-In' => $item->check_in,
                    'Check-Out' => $item->check_out ?? '-',
                    'Status' => $item->status_kehadiran,
                    'Keterlambatan' => $keterlambatan . ' menit',
                    'Daily Report' => $item->daily_report ?? '-',
                    'Lokasi' => $item->lokasi ?? '-'
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $exportData
            ]);
        } catch (\Exception $e) {
            Log::error('Error export presensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal export data presensi'
            ], 500);
        }
    }
    
    /**
     * Get attendance detail by ID
     */
    public function show($id)
    {
        try {
            $presensi = Presensi::with(['peserta.user'])->findOrFail($id);
            
            $peserta = $presensi->peserta;
            $user = $peserta ? $peserta->user : null;
            $keterlambatan = $this->calculateLateness($presensi->check_in);
            
            $status = $presensi->status_kehadiran;
            if ($presensi->status_kehadiran === 'Hadir' && $keterlambatan > 15) {
                $status = 'Terlambat';
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $presensi->id_presensi,
                    'peserta' => [
                        'id' => $peserta ? $peserta->id_peserta : null,
                        'nama' => $user ? $user->nama : ($peserta ? $peserta->nama : '-'),
                        'divisi' => $peserta ? $peserta->divisi : '-',
                    ],
                    'nama' => $user ? $user->nama : ($peserta ? $peserta->nama : '-'),
                    'divisi' => $peserta ? $peserta->divisi : '-',
                    'tanggal' => $presensi->tanggal,
                    'check_in' => $presensi->check_in,
                    'check_out' => $presensi->check_out,
                    'status' => $status,
                    'keterlambatan' => $keterlambatan,
                    'daily_report' => $presensi->daily_report,
                    'lokasi' => $presensi->lokasi,
                    'foto_checkin' => $presensi->foto_checkin ? Storage::url($presensi->foto_checkin) : null,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error show presensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Data presensi tidak ditemukan'
            ], 404);
        }
    }
}