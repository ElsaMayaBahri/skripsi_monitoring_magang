<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MateriPelatihan;
use App\Models\AksesMateriKompetensi;
use App\Models\Peserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MateriKompetensiController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'peserta') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.'
                ], 403);
            }

            $peserta = Peserta::where('id_user', $user->id_user)->first();
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }

            // Ambil nama divisi dari tabel divisi berdasarkan id_divisi peserta
            $divisi = \App\Models\Divisi::where('id_divisi', $peserta->id_divisi)->first();
            $namaDivisi = $divisi ? $divisi->nama_divisi : null;

            $query = MateriPelatihan::query();

            if ($namaDivisi) {
                $query->where(function ($q) use ($namaDivisi) {
                    $q->where('divisi', $namaDivisi)
                        ->orWhereNull('divisi')
                        ->orWhere('divisi', '');
                });
            }

            if ($request->filled('search')) {
                $query->where('judul', 'like', '%' . $request->search . '%');
            }

            if ($request->filled('kategori') && $request->kategori !== 'all') {
                $query->where('kategori', $request->kategori);
            }

            $materiList = $query
                ->orderBy('urutan', 'asc')
                ->orderBy('id_materi_pelatihan', 'asc')
                ->get();

            $accessedIds = AksesMateriKompetensi::where('id_peserta', $peserta->id_peserta)
                ->pluck('id_materi_pelatihan')
                ->toArray();

            $previousCompleted = true;

            $transformed = $materiList->map(function ($item) use ($accessedIds, &$previousCompleted) {
                $isAccessed = in_array($item->id_materi_pelatihan, $accessedIds);

                $isLocked = !$previousCompleted;

                $data = [
                    'id'          => $item->id_materi_pelatihan,
                    'id_materi'   => $item->id_materi_pelatihan,
                    'judul'       => $item->judul,
                    'deskripsi'   => $item->deskripsi ?? 'Tidak ada deskripsi',
                    'tipe'        => $this->resolveFileType($item),
                    'kategori'    => $item->kategori,
                    'urutan'      => $item->urutan ?? 1,
                    'file_url'    => $item->file_url,
                    'file_name'   => $item->file_materi ? basename($item->file_materi) : null,
                    'file_size'   => $item->file_size,
                    'durasi'      => null,
                    'coo'         => 'COO Kuanta Academy',
                    'divisi'      => $item->divisi,
                    'is_accessed' => $isAccessed,
                    'is_locked'   => $isLocked,
                    'can_access'  => !$isLocked,
                    'locked_message' => $isLocked ? 'Selesaikan materi sebelumnya terlebih dahulu.' : null,
                    'quiz_available' => false,
                    'quiz_id'     => null,
                    'konten'      => $item->deskripsi ?? '',
                    'created_at'  => $item->created_at,
                    'updated_at'  => $item->updated_at,
                ];

                if (!$isAccessed) {
                    $previousCompleted = false;
                }

                return $data;
            });

            return response()->json([
                'success' => true,
                'data'    => $transformed,
                'total'   => $transformed->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'peserta') {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $peserta = Peserta::where('id_user', $user->id_user)->first();
            if (!$peserta) {
                return response()->json(['success' => false, 'message' => 'Data peserta tidak ditemukan'], 404);
            }

            $materi = MateriPelatihan::where('id_materi_pelatihan', $id)->first();
            if (!$materi) {
                return response()->json(['success' => false, 'message' => 'Materi tidak ditemukan'], 404);
            }

            $isAccessed = AksesMateriKompetensi::where('id_peserta', $peserta->id_peserta)
                ->where('id_materi_pelatihan', $id)
                ->exists();

            return response()->json([
                'success' => true,
                'data' => [
                    'id'          => $materi->id_materi_pelatihan,
                    'id_materi'   => $materi->id_materi_pelatihan,
                    'judul'       => $materi->judul,
                    'deskripsi'   => $materi->deskripsi ?? '',
                    'tipe'        => $this->resolveFileType($materi),
                    'file_url'    => $materi->file_url,
                    'file_name'   => $materi->file_materi ? basename($materi->file_materi) : null,
                    'file_size'   => $materi->file_size, // gunakan accessor dari model
                    'coo'         => 'COO Kuanta Academy',
                    'divisi'      => $materi->divisi,
                    'is_accessed' => $isAccessed,
                    'created_at'  => $materi->created_at,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function markAsAccessed(string $id)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'peserta') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $userId = $user->id_user ?? $user->id;

            $peserta = Peserta::where('id_user', $userId)->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }

            $materi = MateriPelatihan::where('id_materi_pelatihan', $id)->first();

            if (!$materi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Materi tidak ditemukan'
                ], 404);
            }

            $existing = AksesMateriKompetensi::where('id_peserta', $peserta->id_peserta)
                ->where('id_materi_pelatihan', $materi->id_materi_pelatihan)
                ->first();

            if (!$existing) {
                AksesMateriKompetensi::create([
                    'id_peserta' => $peserta->id_peserta,
                    'id_materi_pelatihan' => $materi->id_materi_pelatihan,
                    'tanggal_akses' => now(),
                    'status' => 'selesai',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Materi kompetensi berhasil ditandai telah diakses'
            ]);
        } catch (\Exception $e) {
            Log::error('Error markAsAccessed materi kompetensi: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal menandai materi sebagai diakses: ' . $e->getMessage()
            ], 500);
        }
    }

    // ========== HELPER ==========

    private function resolveFileType($item): string
    {
        $kategori = strtolower($item->kategori ?? '');

        $map = [
            'pdf'        => 'pdf',
            'video'      => 'video',
            'doc'        => 'doc',
            'word'       => 'doc',
            'excel'      => 'excel',
            'xls'        => 'excel',
            'ppt'        => 'ppt',
            'powerpoint' => 'ppt',
            'link'       => 'link',
            'google_form' => 'google_form',
        ];

        if (isset($map[$kategori])) {
            return $map[$kategori];
        }

        // Fallback dari ekstensi file
        if ($item->file_materi) {
            $ext = strtolower(pathinfo($item->file_materi, PATHINFO_EXTENSION));
            $extMap = [
                'pdf'  => 'pdf',
                'doc'  => 'doc',
                'docx' => 'doc',
                'xls'  => 'excel',
                'xlsx' => 'excel',
                'ppt'  => 'ppt',
                'pptx' => 'ppt',
                'mp4'  => 'video',
                'mov' => 'video',
                'avi'  => 'video',
                'webm' => 'video',
            ];
            return $extMap[$ext] ?? 'dokumen';
        }

        return 'dokumen';
    }

    public function download($id)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'peserta') {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $materi = MateriPelatihan::findOrFail($id);
            if (!$materi->file_materi) {
                return response()->json(['success' => false, 'message' => 'File tidak tersedia'], 404);
            }

            $filePath = storage_path('app/public/' . $materi->file_materi);
            if (!file_exists($filePath)) {
                // coba cari di folder alternatif
                $altPath = storage_path('app/public/materi_mentor/' . basename($materi->file_materi));
                if (file_exists($altPath)) {
                    $filePath = $altPath;
                } else {
                    return response()->json(['success' => false, 'message' => 'File tidak ditemukan'], 404);
                }
            }

            return response()->download($filePath, basename($materi->file_materi));
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}