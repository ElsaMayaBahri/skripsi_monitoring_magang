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
        // ... (kode yang sudah ada, jangan diubah)
    }
    
    /**
     * Calculate duration between check_in and check_out
     */
    private function calculateDuration($checkIn, $checkOut)
    {
        // ... (kode yang sudah ada, jangan diubah)
    }
    
    /**
     * Calculate lateness in minutes
     */
    private function calculateLateness($checkIn)
    {
        // ... (kode yang sudah ada, jangan diubah)
    }
    
    /**
     * Get attendance statistics for dashboard
     */
    public function getStats(Request $request)
    {
        // ... (kode yang sudah ada, jangan diubah)
    }
    
    /**
     * Get attendance by peserta (for peserta dashboard)
     */
    public function getByPeserta(Request $request)
    {
        // ... (kode yang sudah ada, jangan diubah)
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
        // ... (kode yang sudah ada, jangan diubah)
    }
    
    /**
     * Get attendance detail by ID
     */
    public function show($id)
    {
        // ... (kode yang sudah ada, jangan diubah)
    }
}