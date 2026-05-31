<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JamKerja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class JamKerjaController extends Controller
{
    public function index()
    {
        try {
            $jamKerja = JamKerja::first();
            
            if (!$jamKerja) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'jam_masuk' => '08:00',
                        'jam_pulang' => '17:00',
                        'batas_terlambat' => 15
                    ]
                ]);
            }
            
            return response()->json([
                'success' => true,
                'data' => $jamKerja
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching working hours: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'jam_masuk' => 'required|string',
                'jam_pulang' => 'required|string',
                'batas_terlambat' => 'required|integer|min:0|max:120'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $jamKerja = JamKerja::create([
                'jam_masuk' => $request->jam_masuk,
                'jam_pulang' => $request->jam_pulang,
                'batas_terlambat' => $request->batas_terlambat
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Pengaturan jam kerja berhasil disimpan',
                'data' => $jamKerja
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating working hours: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function update(Request $request, $id)
{
    try {
        Log::info('=== UPDATE JAM KERJA ===');
        Log::info('ID: ' . $id);
        Log::info('Request data: ', $request->all());
        
        $jamKerja = JamKerja::find($id);
        
        if (!$jamKerja) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'jam_masuk' => 'required|string',
            'jam_pulang' => 'required|string',
            'batas_terlambat' => 'required|integer|min:0|max:120'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // PERBAIKAN: Format waktu dengan menambahkan detik
        $jamMasuk = $request->jam_masuk;
        $jamPulang = $request->jam_pulang;
        
        // Tambahkan :00 jika tidak ada detik
        if (strlen($jamMasuk) == 5) {
            $jamMasuk = $jamMasuk . ':00';
        }
        if (strlen($jamPulang) == 5) {
            $jamPulang = $jamPulang . ':00';
        }
        
        $updateData = [
            'jam_masuk' => $jamMasuk,
            'jam_pulang' => $jamPulang,
            'batas_terlambat' => (int) $request->batas_terlambat
        ];
        
        Log::info('Data untuk update: ', $updateData);
        
        $jamKerja->update($updateData);
        
        // Refresh dan cek hasil
        $jamKerja->refresh();
        Log::info('Data setelah update: ', $jamKerja->toArray());
        
        return response()->json([
            'success' => true,
            'message' => 'Pengaturan jam kerja berhasil diupdate',
            'data' => $jamKerja
        ]);
    } catch (\Exception $e) {
        Log::error('Error updating working hours: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
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
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }
            
            $jamKerja->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Pengaturan jam kerja berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting working hours: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}