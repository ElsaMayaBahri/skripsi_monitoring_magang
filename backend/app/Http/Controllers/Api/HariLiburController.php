<?php
// app/Http/Controllers/Api/HariLiburController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HariLibur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HariLiburController extends Controller
{
    /**
     * Mendapatkan semua data hari libur
     */
    public function index()
    {
        try {
            $hariLibur = HariLibur::orderBy('tanggal', 'asc')->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Data hari libur berhasil diambil',
                'data' => $hariLibur
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Menyimpan data hari libur baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date|unique:hari_liburs,tanggal',
            'keterangan' => 'required|string|max:150'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $hariLibur = HariLibur::create([
                'tanggal' => $request->tanggal,
                'keterangan' => $request->keterangan
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Hari libur berhasil ditambahkan',
                'data' => $hariLibur
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Memperbarui data hari libur
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'tanggal' => 'required|date|unique:hari_liburs,tanggal,' . $id . ',id_libur',
            'keterangan' => 'required|string|max:150'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $hariLibur = HariLibur::find($id);
            
            if (!$hariLibur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data hari libur tidak ditemukan'
                ], 404);
            }
            
            $hariLibur->update([
                'tanggal' => $request->tanggal,
                'keterangan' => $request->keterangan
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Hari libur berhasil diperbarui',
                'data' => $hariLibur
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Menghapus data hari libur
     */
    public function destroy($id)
    {
        try {
            $hariLibur = HariLibur::find($id);
            
            if (!$hariLibur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data hari libur tidak ditemukan'
                ], 404);
            }
            
            $hariLibur->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Hari libur berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}