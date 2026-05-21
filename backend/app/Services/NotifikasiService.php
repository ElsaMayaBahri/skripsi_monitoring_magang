<?php
namespace App\Services;

use App\Models\notifikasi;
use Carbon\Carbon;

class NotifikasiService
{
    /**
     * TRIGGER 2 — Tugas baru diberikan mentor ke peserta
     */
    public static function tugasBaru(int $idPeserta, string $judulTugas, string $namaMentor): void
    {
        notifikasi::create([
            'id_user'     => $idPeserta,
            'judul'       => 'Tugas Baru Tersedia',
            'pesan'       => "Mentor {$namaMentor} memberikan tugas baru: \"{$judulTugas}\". Segera cek dan kerjakan sebelum deadline.",
            'status_baca' => false,
        ]);
    }

    /**
     * TRIGGER 3 — Mentor meminta revisi tugas
     */
    public static function revisiTugas(int $idPeserta, string $judulTugas, string $catatanRevisi = ''): void
    {
        $pesan = "Tugas \"{$judulTugas}\" perlu direvisi.";
        if ($catatanRevisi) {
            $pesan .= " Catatan mentor: {$catatanRevisi}";
        }

        notifikasi::create([
            'id_user'     => $idPeserta,
            'judul'       => 'Tugas Perlu Direvisi',
            'pesan'       => $pesan,
            'status_baca' => false,
        ]);
    }

    /**
     * TRIGGER 4 — Tugas disetujui/di-acc mentor
     */
    public static function tugasDiAcc(int $idPeserta, string $judulTugas, float $nilai = null): void
    {
        $pesan = "Selamat! Tugas \"{$judulTugas}\" telah disetujui oleh mentor.";
        if ($nilai !== null) {
            $pesan .= " Nilai yang diberikan: {$nilai}.";
        }

        notifikasi::create([
            'id_user'     => $idPeserta,
            'judul'       => 'Tugas Disetujui ✓',
            'pesan'       => $pesan,
            'status_baca' => false,
        ]);
    }

    /**
     * TRIGGER 1 — Deadline tugas mendekat (jalankan via scheduler)
     * Cek semua tugas yang deadlinenya H-3, H-1
     */
    public static function cekDeadlineTugas(): void
    {
        // Sesuaikan model Tugas dengan model Anda
        $tugasMendekat = \App\Models\Tugas::with('peserta')
            ->whereIn('status', ['pending', 'revisi'])
            ->whereNotNull('deadline')
            ->get()
            ->filter(function ($tugas) {
                $hariSisa = Carbon::now()->startOfDay()->diffInDays(
                    Carbon::parse($tugas->deadline)->startOfDay(),
                    false
                );
                return in_array($hariSisa, [3, 1]); // notif H-3 dan H-1
            });

        foreach ($tugasMendekat as $tugas) {
            $hariSisa = Carbon::now()->startOfDay()->diffInDays(
                Carbon::parse($tugas->deadline)->startOfDay(),
                false
            );

            // Cek agar tidak double kirim di hari yang sama
            $sudahAda = notifikasi::where('id_user', $tugas->id_user)
                ->where('judul', 'like', '%Deadline Mendekat%')
                ->where('pesan', 'like', "%{$tugas->judul_tugas}%")
                ->whereDate('created_at', Carbon::today())
                ->exists();

            if (!$sudahAda) {
                notifikasi::create([
                    'id_user'     => $tugas->id_user,
                    'judul'       => 'Deadline Mendekat ⚠️',
                    'pesan'       => "Tugas \"{$tugas->judul_tugas}\" akan deadline dalam {$hariSisa} hari lagi ({$tugas->deadline}). Segera selesaikan!",
                    'status_baca' => false,
                ]);
            }
        }
    }

    /**
     * TRIGGER 5 — Peserta belum mengerjakan kuis & periode magang hampir habis
     * Cek peserta yang belum submit kuis & sisa magang <= 7 hari
     */
    public static function cekKuisPeriodeMagang(): void
    {
        // Sesuaikan dengan model Peserta/Magang dan Kuis Anda
        $pesertaAktif = \App\Models\User::where('role', 'peserta')
            ->where('status', 'aktif')
            ->whereNotNull('tanggal_selesai_magang')
            ->get()
            ->filter(function ($peserta) {
                $hariSisa = Carbon::now()->startOfDay()->diffInDays(
                    Carbon::parse($peserta->tanggal_selesai_magang)->startOfDay(),
                    false
                );
                return $hariSisa <= 7 && $hariSisa > 0;
            });

        foreach ($pesertaAktif as $peserta) {
            // Cek apakah peserta sudah mengerjakan semua kuis dari COO
            $kuisBelumDikerjakan = \App\Models\Kuis::where('pembuat_role', 'coo')
                ->whereDoesntHave('submissions', function ($q) use ($peserta) {
                    $q->where('id_user', $peserta->id_user);
                })
                ->count();

            if ($kuisBelumDikerjakan > 0) {
                $hariSisa = Carbon::now()->startOfDay()->diffInDays(
                    Carbon::parse($peserta->tanggal_selesai_magang)->startOfDay(),
                    false
                );

                $sudahAda = notifikasi::where('id_user', $peserta->id_user)
                    ->where('judul', 'like', '%Kuis Belum Dikerjakan%')
                    ->whereDate('created_at', Carbon::today())
                    ->exists();

                if (!$sudahAda) {
                    notifikasi::create([
                        'id_user'     => $peserta->id_user,
                        'judul'       => 'Kuis Belum Dikerjakan ❗',
                        'pesan'       => "Periode magang Anda tersisa {$hariSisa} hari lagi. Anda masih memiliki {$kuisBelumDikerjakan} kuis dari COO yang belum dikerjakan. Segera selesaikan sebelum periode magang berakhir!",
                        'status_baca' => false,
                    ]);
                }
            }
        }
    }
}