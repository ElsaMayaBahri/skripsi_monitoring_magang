<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NotifikasiMail;
use App\Models\Notifikasi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotifikasiController extends Controller
{
    /**
     * GET /api/notifikasi
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
     * Static helper — simpan notifikasi ke DB sekaligus kirim email ke Gmail user.
     *
     * Contoh pemakaian:
     *   NotifikasiController::kirim($userId, 'Judul', 'Pesan notifikasi');
     */
    public static function kirim($idUser, string $judul, string $pesan): ?Notifikasi
    {
        try {
            // 1. Simpan ke database
            $notifikasi = Notifikasi::create([
                'id_user'     => $idUser,
                'judul'       => $judul,
                'pesan'       => $pesan,
                'status_baca' => false,
            ]);

            Log::info("Notifikasi DB tersimpan - user: {$idUser}, judul: {$judul}");

            // 2. Cari user
            $user = User::find($idUser);

            if (!$user) {
                Log::warning("User dengan id {$idUser} tidak ditemukan, skip kirim email.");
                return $notifikasi;
            }

            if (empty($user->email)) {
                Log::warning("User {$idUser} tidak memiliki email, skip kirim email.");
                return $notifikasi;
            }

            // 3. Ambil nama — coba beberapa kemungkinan nama kolom
            $namaUser = $user->nama
                ?? $user->name
                ?? $user->nama_lengkap
                ?? 'Pengguna';

            Log::info("Mencoba kirim email ke: {$user->email}");

            // 4. Kirim email
            Mail::to($user->email)
                ->send(new NotifikasiMail($namaUser, $judul, $pesan));

            Log::info("Email berhasil terkirim ke {$user->email}");

            return $notifikasi;
        } catch (\Symfony\Component\Mailer\Exception\TransportException $e) {
            // Error koneksi SMTP
            Log::error("SMTP Transport Error: " . $e->getMessage());
            return null;
        } catch (\Exception $e) {
            Log::error("Gagal mengirim notifikasi: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }
}
