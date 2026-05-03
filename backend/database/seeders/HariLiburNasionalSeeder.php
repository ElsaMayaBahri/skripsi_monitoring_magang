<?php

namespace Database\Seeders;

use App\Models\HariLibur;
use Illuminate\Database\Seeder;

class HariLiburNasionalSeeder extends Seeder
{
    public function run(): void
    {
        // Data khusus untuk tahun 2026 dan 2027
        $hariLibur = [
            // ==================== TAHUN 2026 ====================
            ['tanggal' => '2026-01-01', 'keterangan' => 'Tahun Baru Masehi 2026'],
            ['tanggal' => '2026-01-17', 'keterangan' => 'Isra Mi\'raj Nabi Muhammad SAW 1447 H'],
            ['tanggal' => '2026-02-17', 'keterangan' => 'Tahun Baru Imlek 2577 Kongzili'],
            ['tanggal' => '2026-03-11', 'keterangan' => 'Hari Suci Nyepi (Tahun Baru Saka 1948)'],
            ['tanggal' => '2026-03-20', 'keterangan' => 'Hari Raya Idul Fitri 1447 H'],
            ['tanggal' => '2026-03-21', 'keterangan' => 'Hari Raya Idul Fitri 1447 H'],
            ['tanggal' => '2026-04-03', 'keterangan' => 'Wafat Yesus Kristus'],
            ['tanggal' => '2026-05-01', 'keterangan' => 'Hari Buruh Internasional'],
            ['tanggal' => '2026-05-04', 'keterangan' => 'Hari Raya Waisak 2570'],
            ['tanggal' => '2026-05-14', 'keterangan' => 'Kenaikan Yesus Kristus'],
            ['tanggal' => '2026-06-01', 'keterangan' => 'Hari Lahir Pancasila'],
            ['tanggal' => '2026-05-27', 'keterangan' => 'Hari Raya Idul Adha 1447 H'],
            ['tanggal' => '2026-06-17', 'keterangan' => 'Tahun Baru Islam 1448 H'],
            ['tanggal' => '2026-08-17', 'keterangan' => 'Hari Kemerdekaan Republik Indonesia'],
            ['tanggal' => '2026-08-24', 'keterangan' => 'Maulid Nabi Muhammad SAW'],
            ['tanggal' => '2026-12-25', 'keterangan' => 'Hari Raya Natal'],
            ['tanggal' => '2026-12-26', 'keterangan' => 'Hari Raya Natal'],
            
            // ==================== TAHUN 2027 ====================
            ['tanggal' => '2027-01-01', 'keterangan' => 'Tahun Baru Masehi 2027'],
            ['tanggal' => '2027-01-05', 'keterangan' => 'Isra Mi\'raj Nabi Muhammad SAW 1448 H'],
            ['tanggal' => '2027-02-06', 'keterangan' => 'Tahun Baru Imlek 2578 Kongzili'],
            ['tanggal' => '2027-03-08', 'keterangan' => 'Hari Suci Nyepi (Tahun Baru Saka 1949)'],
            ['tanggal' => '2027-03-10', 'keterangan' => 'Hari Raya Idul Fitri 1448 H'],
            ['tanggal' => '2027-03-11', 'keterangan' => 'Hari Raya Idul Fitri 1448 H'],
            ['tanggal' => '2027-03-26', 'keterangan' => 'Wafat Yesus Kristus'],
            ['tanggal' => '2027-05-01', 'keterangan' => 'Hari Buruh Internasional'],
            ['tanggal' => '2027-05-23', 'keterangan' => 'Hari Raya Waisak 2571'],
            ['tanggal' => '2027-05-06', 'keterangan' => 'Kenaikan Yesus Kristus'],
            ['tanggal' => '2027-06-01', 'keterangan' => 'Hari Lahir Pancasila'],
            ['tanggal' => '2027-05-17', 'keterangan' => 'Hari Raya Idul Adha 1448 H'],
            ['tanggal' => '2027-06-07', 'keterangan' => 'Tahun Baru Islam 1449 H'],
            ['tanggal' => '2027-08-17', 'keterangan' => 'Hari Kemerdekaan Republik Indonesia'],
            ['tanggal' => '2027-08-13', 'keterangan' => 'Maulid Nabi Muhammad SAW'],
            ['tanggal' => '2027-12-25', 'keterangan' => 'Hari Raya Natal'],
            ['tanggal' => '2027-12-26', 'keterangan' => 'Hari Raya Natal'],
        ];

        foreach ($hariLibur as $libur) {
            if (!HariLibur::where('tanggal', $libur['tanggal'])->exists()) {
                HariLibur::create($libur);
                $this->command->info("Menambahkan: {$libur['tanggal']} - {$libur['keterangan']}");
            } else {
                $this->command->info("Data sudah ada: {$libur['tanggal']} - {$libur['keterangan']}");
            }
        }
        
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('Seeder hari libur nasional 2026-2027 selesai!');
        $this->command->info('Total data: ' . count($hariLibur) . ' hari libur');
        $this->command->info('========================================');
    }
}