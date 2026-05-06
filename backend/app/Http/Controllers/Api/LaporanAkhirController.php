<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LaporanAkhir;
use App\Models\Mentor;
use App\Models\Peserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class LaporanAkhirController extends Controller
{
    /**
     * Get all laporan akhir for logged in mentor
     * GET /api/mentor/laporan-akhir
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();
            
            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            // Get all peserta under this mentor
            $pesertas = Peserta::with('user')
                ->where('id_mentor', $mentor->id_mentor)
                ->get();

            $laporanList = [];

            foreach ($pesertas as $peserta) {
                $laporan = LaporanAkhir::where('id_peserta', $peserta->id_peserta)->first();
                
                $status = 'not_uploaded';
                $fileUrl = null;
                $fileSize = null;
                $uploadedAt = null;
                $judul = null;
                $catatan = null;
                $nilai = null;
                $dinilaiOleh = null;
                $dinilaiPada = null;

                if ($laporan) {
                    $status = $laporan->status;
                    $fileUrl = $laporan->file_laporan ? Storage::url($laporan->file_laporan) : null;
                    $fileSize = $laporan->file_size;
                    $uploadedAt = $laporan->created_at;
                    $judul = $laporan->judul;
                    $catatan = $laporan->catatan_mentor;
                    $nilai = $laporan->nilai_akhir;
                    $dinilaiOleh = $laporan->dinilai_oleh;
                    $dinilaiPada = $laporan->dinilai_pada;
                }

                $laporanList[] = [
                    'id' => $laporan ? $laporan->id_laporan : null,
                    'peserta_id' => $peserta->id_peserta,
                    'peserta_nama' => $peserta->user->nama ?? 'Unknown',
                    'peserta_divisi' => $peserta->divisi ? $peserta->divisi->nama_divisi : '-',
                    'judul' => $judul,
                    'file_url' => $fileUrl,
                    'file_size' => $fileSize,
                    'uploaded_at' => $uploadedAt,
                    'status' => $status,
                    'catatan' => $catatan,
                    'dinilai_oleh' => $dinilaiOleh,
                    'dinilai_pada' => $dinilaiPada,
                    'progress' => rand(60, 95),
                    'nilai_akhir' => $nilai,
                ];
            }

            // Apply filters
            $filtered = collect($laporanList);
            
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $filtered = $filtered->filter(function ($item) use ($search) {
                    return stripos($item['peserta_nama'], $search) !== false ||
                           ($item['judul'] && stripos($item['judul'], $search) !== false);
                });
            }

            if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
                if ($request->status === 'uploaded') {
                    $filtered = $filtered->filter(function ($item) {
                        return $item['status'] !== 'not_uploaded';
                    });
                } else {
                    $filtered = $filtered->filter(function ($item) use ($request) {
                        return $item['status'] === $request->status;
                    });
                }
            }

            $summary = [
                'total' => $laporanListCount = count($laporanList),
                'sudahUpload' => collect($laporanList)->filter(function ($item) {
                    return $item['status'] !== 'not_uploaded';
                })->count(),
                'belumUpload' => collect($laporanList)->filter(function ($item) {
                    return $item['status'] === 'not_uploaded';
                })->count(),
                'disetujui' => collect($laporanList)->filter(function ($item) {
                    return $item['status'] === 'approved';
                })->count(),
                'revisi' => collect($laporanList)->filter(function ($item) {
                    return $item['status'] === 'revision';
                })->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $filtered->values(),
                'summary' => $summary,
                'total' => $filtered->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Laporan Akhir Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit review for laporan akhir
     * POST /api/mentor/laporan-akhir/{id}/review
     */
    public function submitReview(Request $request, $id)
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();
            
            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $request->validate([
                'status' => 'required|in:pending,approved,revision',
                'catatan' => 'nullable|string',
            ]);

            $laporan = LaporanAkhir::find($id);
            
            if (!$laporan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan tidak ditemukan'
                ], 404);
            }

            // Verify that this laporan belongs to mentor's peserta
            $peserta = Peserta::where('id_peserta', $laporan->id_peserta)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke laporan ini'
                ], 403);
            }

            $laporan->update([
                'status' => $request->status,
                'catatan_mentor' => $request->catatan,
                'dinilai_oleh' => $user->nama,
                'dinilai_pada' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Review berhasil disimpan',
                'data' => [
                    'status' => $laporan->status,
                    'catatan' => $laporan->catatan_mentor,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Laporan Akhir Review Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan review: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export laporan akhir to Excel
     * GET /api/mentor/laporan-akhir/export
     */
    public function export(Request $request)
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();
            
            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $pesertas = Peserta::with('user')
                ->where('id_mentor', $mentor->id_mentor)
                ->get();

            $exportData = [];

            foreach ($pesertas as $peserta) {
                $laporan = LaporanAkhir::where('id_peserta', $peserta->id_peserta)->first();
                
                $exportData[] = [
                    'Nama Peserta' => $peserta->user->nama ?? 'Unknown',
                    'Divisi' => $peserta->divisi ? $peserta->divisi->nama_divisi : '-',
                    'Judul Laporan' => $laporan ? $laporan->judul : '-',
                    'Tanggal Upload' => $laporan ? $laporan->created_at->format('Y-m-d H:i') : '-',
                    'Status' => $laporan ? $this->getStatusText($laporan->status) : 'Belum Upload',
                    'Catatan Mentor' => $laporan ? $laporan->catatan_mentor : '-',
                    'Nilai Akhir' => $laporan ? $laporan->nilai_akhir : '-',
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $exportData,
                'message' => 'Data berhasil diexport'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal export data: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getStatusText($status)
    {
        $statusMap = [
            'pending' => 'Menunggu Review',
            'approved' => 'Disetujui',
            'revision' => 'Revisi',
            'not_uploaded' => 'Belum Upload',
        ];
        return $statusMap[$status] ?? $status;
    }
}