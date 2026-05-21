<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Peserta;
use App\Models\Divisi;
use Illuminate\Database\Seeder;

class PesertaSeeder extends Seeder
{
    public function run(): void
    {
        // Get user peserta
        $userPeserta = User::where('email', 'peserta@gmail.com')->first();
        
        if (!$userPeserta) {
            return;
        }

        // Get first divisi (atau create default)
        $divisi = Divisi::first();
        if (!$divisi) {
            $divisi = Divisi::create([
                'nama_divisi' => 'General',
                'deskripsi' => 'Divisi Umum',
                'status' => 'aktif',
            ]);
        }

        // Create peserta if not exists
        Peserta::updateOrCreate(
            ['id_user' => $userPeserta->id_user],
            [
                'id_divisi' => $divisi->id_divisi,
                'asal_kampus' => 'Universitas Test',
                'prodi' => 'Teknik Informatika',
                'tanggal_mulai' => now(),
                'tanggal_selesai' => now()->addMonths(3),
                'status_magang' => 'aktif',
            ]
        );
    }
}
