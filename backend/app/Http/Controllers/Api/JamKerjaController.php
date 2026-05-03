<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JamKerja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JamKerjaController extends Controller
{
    public function index()
    {
        try {
            $jamKerja = JamKerja::first();
            
            if (!$jamKerja) {
                // Buat data default jika belum ada
                $jamKerja = JamKerja::create([
                    'jam_masuk' => '08:00:00',
                    'jam_pulang' => '17:00:00',
                    'batas_terlambat' => '00:15:00' // 15 menit dalam format time
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Data jam kerja default berhasil dibuat',
                    'data' => $jamKerja
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Data jam kerja berhasil diambil',
                'data' => $jamKerja
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jam_masuk' => 'required|date_format:H:i',
            'jam_pulang' => 'required|date_format:H:i|after:jam_masuk',
            'batas_terlambat' => 'required|integer|min:0|max:120'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            // Konversi menit ke format waktu H:i:s
            $menit = $request->batas_terlambat;
            $jam = floor($menit / 60);
            $menitSisa = $menit % 60;
            $batasTerlambatFormat = sprintf('%02d:%02d:00', $jam, $menitSisa);
            
            // Hapus data lama karena hanya boleh 1 record
            JamKerja::truncate();
            
            $jamKerja = JamKerja::create([
                'jam_masuk' => $request->jam_masuk . ':00',
                'jam_pulang' => $request->jam_pulang . ':00',
                'batas_terlambat' => $batasTerlambatFormat
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Jam kerja berhasil disimpan',
                'data' => $jamKerja
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'jam_masuk' => 'required|date_format:H:i',
            'jam_pulang' => 'required|date_format:H:i|after:jam_masuk',
            'batas_terlambat' => 'required|integer|min:0|max:120'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $jamKerja = JamKerja::find($id);
            
            if (!$jamKerja) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data jam kerja tidak ditemukan'
                ], 404);
            }
            
            // Konversi menit ke format waktu H:i:s
            $menit = $request->batas_terlambat;
            $jam = floor($menit / 60);
            $menitSisa = $menit % 60;
            $batasTerlambatFormat = sprintf('%02d:%02d:00', $jam, $menitSisa);
            
            $jamKerja->update([
                'jam_masuk' => $request->jam_masuk . ':00',
                'jam_pulang' => $request->jam_pulang . ':00',
                'batas_terlambat' => $batasTerlambatFormat
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Jam kerja berhasil diperbarui',
                'data' => $jamKerja
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $jamKerja = JamKerja::find($id);
            
            if (!$jamKerja) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data jam kerja tidak ditemukan'
                ], 404);
            }
            
            $jamKerja->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Jam kerja berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}