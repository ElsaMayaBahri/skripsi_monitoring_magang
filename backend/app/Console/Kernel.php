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
    }
}