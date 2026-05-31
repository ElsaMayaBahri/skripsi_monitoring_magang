<?php
// app/Http/Controllers/Api/NotifikasiController.php

namespace App\Http\Controllers\Api;

use App\Models\notifikasi;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotifikasiController extends Controller
{
    // Ambil semua notifikasi milik user yang login
    public function index()
    {
        try {
            $notifikasi = notifikasi::untukUser(Auth::id())
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'id_notifikasi' => $item->id_notifikasi,
                        'judul'         => $item->judul,
                        'pesan'         => $item->pesan,
                        'status_baca'   => (bool) $item->status_baca,
                        'waktu'         => $item->waktu,
                        'created_at'    => $item->created_at->toDateTimeString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data'    => $notifikasi,
                'unread'  => $notifikasi->where('status_baca', false)->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil notifikasi: ' . $e->getMessage()
            ], 500);
        }
    }

    // Tandai satu notifikasi sebagai sudah dibaca
    public function markAsRead($id)
    {
        try {
            $notifikasi = notifikasi::where('id_notifikasi', $id)
                ->where('id_user', Auth::id())
                ->firstOrFail();

            $notifikasi->tandaiDibaca();

            return response()->json([
                'success' => true, 
                'message' => 'Notifikasi ditandai sudah dibaca'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan'
            ], 404);
        }
    }

    // Tandai semua notifikasi user sebagai sudah dibaca
    public function markAllAsRead()
    {
        try {
            notifikasi::untukUser(Auth::id())
                ->belumDibaca()
                ->update(['status_baca' => true]);

            return response()->json([
                'success' => true, 
                'message' => 'Semua notifikasi ditandai sudah dibaca'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menandai semua notifikasi: ' . $e->getMessage()
            ], 500);
        }
    }

    // Hapus satu notifikasi
    public function destroy($id)
    {
        try {
            $notifikasi = notifikasi::where('id_notifikasi', $id)
                ->where('id_user', Auth::id())
                ->firstOrFail();

            $notifikasi->delete();

            return response()->json([
                'success' => true, 
                'message' => 'Notifikasi dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan'
            ], 404);
        }
    }

    // Helper statis untuk membuat notifikasi (dipakai di service/controller lain)
    public static function kirim(int $idUser, string $judul, string $pesan): notifikasi
    {
        return notifikasi::create([
            'id_user'     => $idUser,
            'judul'       => $judul,
            'pesan'       => $pesan,
            'status_baca' => false,
        ]);
    }
}