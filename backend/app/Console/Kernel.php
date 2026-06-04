<?php

namespace App\Console;

use App\Services\NotifikasiService;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Jalankan setiap hari pukul 07.00 pagi
        $schedule->call(function () {
            NotifikasiService::cekDeadlineTugas();
            NotifikasiService::cekKuisPeriodeMagang();
        })->dailyAt('07:00')->name('cek-notifikasi-peserta')->withoutOverlapping();

        // Nonaktifkan akun peserta yang periode magangnya sudah selesai (setiap hari jam 00:00)
        $schedule->command('peserta:nonaktifkan-selesai')->dailyAt('00:00')->withoutOverlapping();

        // Jalankan setiap tanggal 1 bulan Januari untuk tahun berjalan + tahun depan
        $schedule->command('libur:sync-nasional')->yearlyOn(1, 1, '00:00');
    }
}
