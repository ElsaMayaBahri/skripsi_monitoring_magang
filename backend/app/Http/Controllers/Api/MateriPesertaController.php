<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MateriMentor;
use App\Models\AksesMateri;
use App\Models\Peserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MateriPesertaController extends Controller
{
    /**
     * Get all materi for logged in peserta
     * GET /api/peserta/materi
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'peserta') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Anda bukan peserta.'
                ], 403);
            }

            $peserta = Peserta::where('id_user', $user->id_user)->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }

            $query = MateriMentor::with(['mentor.user', 'divisi'])
                ->where(function($q) use ($peserta) {
                    $q->where('id_divisi', $peserta->id_divisi)
                      ->orWhereNull('id_divisi');
                });

            if ($request->has('search') && !empty($request->search)) {
                $query->where('judul', 'like', '%' . $request->search . '%');
            }

            if ($request->has('tipe') && !empty($request->tipe) && $request->tipe !== 'all') {
                $query->where('tipe_materi', $request->tipe);
            }

            $materi = $query->orderBy('created_at', 'desc')->get();

            // Get accessed materi for this peserta
            $accessedMateri = AksesMateri::where('id_peserta', $peserta->id_peserta)
                ->pluck('id_materi')
                ->toArray();

            $transformedMateri = $materi->map(function ($item) use ($accessedMateri) {
                $isAccessed = in_array($item->id_materi, $accessedMateri);
                
                return [
                    'id_materi' => $item->id_materi,
                    'judul' => $item->judul,
                    'deskripsi' => $item->deskripsi,
                    'tipe_materi' => $item->tipe_materi ?? 'dokumen',
                    'file_materi' => $item->file_materi,
                    'file_url' => $item->file_materi ? Storage::url($item->file_materi) : null,
                    'link' => $item->link,
                    'id_divisi' => $item->id_divisi,
                    'divisi' => $item->divisi ? $item->divisi->nama_divisi : null,
                    'mentor_name' => $item->mentor && $item->mentor->user ? $item->mentor->user->nama_lengkap : 'Mentor',
                    'views' => $item->views ?? 0,
                    'is_accessed' => $isAccessed,
                    'progress' => $isAccessed ? 100 : 0,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedMateri,
                'total' => $materi->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single materi by ID for peserta
     * GET /api/peserta/materi/{id}
     */
    public function show(string $id)
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'peserta') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $peserta = Peserta::where('id_user', $user->id_user)->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }

            $materi = MateriMentor::with(['mentor.user', 'divisi'])
                ->where('id_materi', $id)
                ->where(function($q) use ($peserta) {
                    $q->where('id_divisi', $peserta->id_divisi)
                      ->orWhereNull('id_divisi');
                })
                ->first();

            if (!$materi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Materi tidak ditemukan'
                ], 404);
            }

            // Increment views
            $materi->increment('views');

            $isAccessed = AksesMateri::where('id_peserta', $peserta->id_peserta)
                ->where('id_materi', $id)
                ->exists();

            return response()->json([
                'success' => true,
                'data' => [
                    'id_materi' => $materi->id_materi,
                    'judul' => $materi->judul,
                    'deskripsi' => $materi->deskripsi,
                    'tipe_materi' => $materi->tipe_materi ?? 'dokumen',
                    'file_url' => $materi->file_materi ? Storage::url($materi->file_materi) : null,
                    'link' => $materi->link,
                    'divisi' => $materi->divisi ? $materi->divisi->nama_divisi : null,
                    'mentor_name' => $materi->mentor && $materi->mentor->user ? $materi->mentor->user->nama_lengkap : 'Mentor',
                    'views' => $materi->views,
                    'is_accessed' => $isAccessed,
                    'created_at' => $materi->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark materi as completed/accessed
     * POST /api/peserta/materi/{id}/selesai
     */
    public function markAsSelesai(string $id)
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'peserta') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $peserta = Peserta::where('id_user', $user->id_user)->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }

            $materi = MateriMentor::find($id);
            
            if (!$materi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Materi tidak ditemukan'
                ], 404);
            }

            // Check if already accessed
            $existing = AksesMateri::where('id_peserta', $peserta->id_peserta)
                ->where('id_materi', $id)
                ->first();

            if (!$existing) {
                AksesMateri::create([
                    'id_peserta' => $peserta->id_peserta,
                    'id_materi' => $id,
                    'tanggal_akses' => now(),
                    'status' => 'selesai'
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Materi berhasil ditandai selesai'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}