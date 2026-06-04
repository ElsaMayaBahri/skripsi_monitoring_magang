<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotifikasiController extends Controller
{
    /**
     * GET /api/notifikasi
     * Ambil semua notifikasi milik user yang sedang login
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $notifikasi = Notifikasi::where('id_user', $user->id_user)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
                ->map(function ($item) {
                    return [
                        'id_notifikasi' => $item->id_notifikasi,
                        'judul'         => $item->judul,
                        'pesan'         => $item->pesan,
                        'status_baca'   => (bool) $item->status_baca,
                        'waktu'         => $item->created_at
                            ? $item->created_at->diffForHumans()
                            : '-',
                        'created_at'    => $item->created_at,
                    ];
                });

            $unreadCount = Notifikasi::where('id_user', $user->id_user)
                ->where('status_baca', false)
                ->count();

            return response()->json([
                'success'      => true,
                'data'         => $notifikasi,
                'unread_count' => $unreadCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Error index notifikasi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil notifikasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PATCH /api/notifikasi/{id}/read
     * Tandai satu notifikasi sebagai sudah dibaca
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            $user = $request->user();

            $notifikasi = Notifikasi::where('id_notifikasi', $id)
                ->where('id_user', $user->id_user)
                ->first();

            if (!$notifikasi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notifikasi tidak ditemukan',
                ], 404);
            }

            $notifikasi->update(['status_baca' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi ditandai sudah dibaca',
            ]);
        } catch (\Exception $e) {
            Log::error('Error markAsRead notifikasi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menandai notifikasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PATCH /api/notifikasi/read-all
     * Tandai semua notifikasi milik user sebagai sudah dibaca
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $user = $request->user();

            Notifikasi::where('id_user', $user->id_user)
                ->where('status_baca', false)
                ->update(['status_baca' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Semua notifikasi ditandai sudah dibaca',
            ]);
        } catch (\Exception $e) {
            Log::error('Error markAllAsRead notifikasi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menandai semua notifikasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/notifikasi/{id}
     * Hapus satu notifikasi
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();

            $notifikasi = Notifikasi::where('id_notifikasi', $id)
                ->where('id_user', $user->id_user)
                ->first();

            if (!$notifikasi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notifikasi tidak ditemukan',
                ], 404);
            }

            $notifikasi->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            Log::error('Error destroy notifikasi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus notifikasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Static helper — dipanggil dari controller lain untuk mengirim notifikasi.
     *
     * Contoh pemakaian:
     *   NotifikasiController::kirim($userId, 'Judul', 'Pesan notifikasi');
     *
     * @param  int|string  $idUser
     * @param  string      $judul
     * @param  string      $pesan
     * @return \App\Models\Notifikasi|null
     */
    public static function kirim($idUser, string $judul, string $pesan): ?Notifikasi
    {
        try {
            $notifikasi = Notifikasi::create([
                'id_user'     => $idUser,
                'judul'       => $judul,
                'pesan'       => $pesan,
                'status_baca' => false,
            ]);

            Log::info("Notifikasi terkirim ke user {$idUser}: {$judul}");

            return $notifikasi;
        } catch (\Exception $e) {
            Log::error('Gagal mengirim notifikasi: ' . $e->getMessage());
            return null;
        }
    }
}
