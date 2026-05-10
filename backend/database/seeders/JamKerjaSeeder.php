<?php

namespace Database\Seeders;

use App\Models\JamKerja;
use Illuminate\Database\Seeder;

class JamKerjaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cek apakah sudah ada data
        if (!JamKerja::first()) {
            JamKerja::create([
                'jam_masuk' => '08:00:00',
                'jam_pulang' => '17:00:00',
                'batas_terlambat' => '15:00:00'
            ]);
            $this->command->info('Data jam kerja berhasil ditambahkan!');
        } else {
            $this->command->info('Data jam kerja sudah ada, tidak perlu ditambahkan.');
        }
    }
}