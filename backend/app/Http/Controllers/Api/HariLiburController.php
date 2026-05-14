<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HariLibur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class HariLiburController extends Controller
{
    public function index()
    {
        try {
            $hariLibur = HariLibur::orderBy('tanggal', 'asc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $hariLibur
            ]);
        } catch (\Exception $e) {
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
                'tanggal' => 'required|date|unique:hari_liburs,tanggal',
                'keterangan' => 'required|string|max:255'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
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
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function update(Request $request, $id)
    {
        try {
            $hariLibur = HariLibur::find($id);
            
            if (!$hariLibur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }
            
            $validator = Validator::make($request->all(), [
                'tanggal' => 'required|date|unique:hari_liburs,tanggal,' . $id,
                'keterangan' => 'required|string|max:255'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $hariLibur->update([
                'tanggal' => $request->tanggal,
                'keterangan' => $request->keterangan
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Hari libur berhasil diupdate',
                'data' => $hariLibur
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function destroy($id)
    {
        try {
            $hariLibur = HariLibur::find($id);
            
            if (!$hariLibur) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak ditemukan'
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
                'message' => $e->getMessage()
            ], 500);
        }
    }
}