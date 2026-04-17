<?php

namespace Database\Seeders;

use App\Models\Divisi;
use Illuminate\Database\Seeder;

class DivisiSeeder extends Seeder
{
    public function run(): void
    {
        $divisis = [
            ['nama_divisi' => 'Engineering', 'deskripsi' => 'Software Engineering & Development'],
            ['nama_divisi' => 'Product Design', 'deskripsi' => 'UI/UX Design & Product Development'],
            ['nama_divisi' => 'Marketing', 'deskripsi' => 'Digital Marketing & Branding'],
            ['nama_divisi' => 'Human Resources', 'deskripsi' => 'HR & Recruitment'],
            ['nama_divisi' => 'Finance', 'deskripsi' => 'Accounting & Finance'],
            ['nama_divisi' => 'Operations', 'deskripsi' => 'Business Operations'],
        ];

        foreach ($divisis as $divisi) {
            Divisi::updateOrCreate(
                ['nama_divisi' => $divisi['nama_divisi']],
                $divisi
            );
        }
    }
}