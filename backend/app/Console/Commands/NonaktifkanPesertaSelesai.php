<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Peserta;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NonaktifkanPesertaSelesai extends Command
{
    protected $signature = 'peserta:nonaktifkan-selesai';
    protected $description = 'Nonaktifkan akun peserta yang periode magangnya sudah selesai';

    public function handle()
    {
        $today = Carbon::today();

        // Ambil semua peserta yang:
        // 1. tanggal_selesai-nya sudah lewat (< hari ini)
        // 2. status_magang masih 'aktif'
        $pesertaSelesai = Peserta::with('user')
            ->where('status_magang', 'aktif')
            ->whereNotNull('tanggal_selesai')
            ->whereDate('tanggal_selesai', '<', $today)
            ->get();

        if ($pesertaSelesai->isEmpty()) {
            $this->info('Tidak ada peserta yang perlu dinonaktifkan.');
            return;
        }

        $jumlah = 0;

        foreach ($pesertaSelesai as $peserta) {
            try {
                DB::beginTransaction();

                // Update status_magang di tabel pesertas
                $peserta->update(['status_magang' => 'selesai']);

                // Update status_akun di tabel users menjadi non_aktif
                if ($peserta->user) {
                    $peserta->user->update(['status_akun' => 'non_aktif']);
                }

                DB::commit();
                $jumlah++;

                Log::info("Peserta dinonaktifkan: id_peserta={$peserta->id_peserta}, nama={$peserta->user->nama}, tanggal_selesai={$peserta->tanggal_selesai}");

            } catch (\Exception $e) {
                DB::rollback();
                Log::error("Gagal menonaktifkan peserta id_peserta={$peserta->id_peserta}: " . $e->getMessage());
            }
        }

        $this->info("Berhasil menonaktifkan {$jumlah} peserta.");
    }
}