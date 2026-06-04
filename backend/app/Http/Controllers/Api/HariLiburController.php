<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HariLibur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class HariLiburController extends Controller
{
    /**
     * Menampilkan semua hari libur (nasional + perusahaan)
     * dengan menambahkan field is_editable untuk frontend.
     */
    public function index()
    {
        try {
            $hariLibur = HariLibur::orderBy('tanggal', 'asc')->get();
            
            $data = $hariLibur->map(function ($item) {
                return [
                    'id'          => $item->id,
                    'tanggal'     => $item->tanggal instanceof \Carbon\Carbon ? $item->tanggal->format('Y-m-d') : $item->tanggal,
                    'keterangan'  => $item->keterangan,
                    'jenis'       => $item->jenis, // 'nasional' atau 'perusahaan'
                    'is_editable' => $item->jenis === 'perusahaan', // hanya libur perusahaan yang bisa diedit/dihapus
                ];
            });
            
            return response()->json([
                'success' => true,
                'data'    => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching holidays: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data hari libur: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Menyimpan hari libur baru (hanya untuk jenis perusahaan).
     * Melarang duplikasi dengan libur nasional atau sesama libur perusahaan.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'tanggal'    => 'required|date',
                'keterangan' => 'required|string|max:255'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors'  => $validator->errors()
                ], 422);
            }
            
            $tanggal = $request->tanggal;
            
            // Cek apakah sudah ada libur nasional pada tanggal yang sama
            $existsNasional = HariLibur::where('tanggal', $tanggal)
                                       ->where('jenis', 'nasional')
                                       ->exists();
            if ($existsNasional) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tanggal ini sudah merupakan libur nasional, tidak perlu ditambahkan manual.'
                ], 422);
            }
            
            // Cek apakah sudah ada libur perusahaan pada tanggal yang sama
            $existsPerusahaan = HariLibur::where('tanggal', $tanggal)
                                         ->where('jenis', 'perusahaan')
                                         ->exists();
            if ($existsPerusahaan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Libur perusahaan untuk tanggal ini sudah ada.'
                ], 422);
            }
            
            $hariLibur = HariLibur::create([
                'tanggal'    => $tanggal,
                'keterangan' => $request->keterangan,
                'jenis'      => 'perusahaan'
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Hari libur perusahaan berhasil ditambahkan',
                'data'    => [
                    'id'          => $hariLibur->id,
                    'tanggal'     => $hariLibur->tanggal instanceof \Carbon\Carbon ? $hariLibur->tanggal->format('Y-m-d') : $hariLibur->tanggal,
                    'keterangan'  => $hariLibur->keterangan,
                    'jenis'       => $hariLibur->jenis,
                    'is_editable' => true,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating holiday: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan hari libur: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Memperbarui hari libur (hanya untuk jenis perusahaan).
     */
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
            
            // Hanya libur perusahaan yang boleh diedit
            if ($hariLibur->jenis !== 'perusahaan') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat mengedit libur nasional'
                ], 403);
            }
            
            $validator = Validator::make($request->all(), [
                'tanggal'    => 'required|date',
                'keterangan' => 'required|string|max:255'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors'  => $validator->errors()
                ], 422);
            }
            
            $tanggal = $request->tanggal;
            
            // Cek duplikasi dengan libur nasional (kecuali dirinya sendiri)
            $existsNasional = HariLibur::where('tanggal', $tanggal)
                                       ->where('jenis', 'nasional')
                                       ->where('id', '!=', $id)
                                       ->exists();
            if ($existsNasional) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tanggal ini sudah merupakan libur nasional, tidak dapat diubah menjadi tanggal tersebut.'
                ], 422);
            }
            
            // Cek duplikasi dengan libur perusahaan lain
            $existsPerusahaan = HariLibur::where('tanggal', $tanggal)
                                         ->where('jenis', 'perusahaan')
                                         ->where('id', '!=', $id)
                                         ->exists();
            if ($existsPerusahaan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sudah ada libur perusahaan untuk tanggal ini.'
                ], 422);
            }
            
            $hariLibur->update([
                'tanggal'    => $tanggal,
                'keterangan' => $request->keterangan
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Hari libur perusahaan berhasil diperbarui',
                'data'    => [
                    'id'          => $hariLibur->id,
                    'tanggal'     => $hariLibur->tanggal instanceof \Carbon\Carbon ? $hariLibur->tanggal->format('Y-m-d') : $hariLibur->tanggal,
                    'keterangan'  => $hariLibur->keterangan,
                    'jenis'       => $hariLibur->jenis,
                    'is_editable' => true,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating holiday: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui hari libur: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Menghapus hari libur (hanya untuk jenis perusahaan).
     */
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
            
            if ($hariLibur->jenis !== 'perusahaan') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus libur nasional'
                ], 403);
            }
            
            $hariLibur->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Hari libur perusahaan berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting holiday: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus hari libur: ' . $e->getMessage()
            ], 500);
        }
    }
}