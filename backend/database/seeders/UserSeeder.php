<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'nama' => 'Admin Sistem',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status_akun' => 'aktif',
            ],
            [
                'nama' => 'COO Perusahaan',
                'email' => 'coo@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'coo',
                'status_akun' => 'aktif',
            ],
            [
                'nama' => 'Mentor Lapangan',
                'email' => 'mentor@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'mentor',
                'status_akun' => 'aktif',
            ],
            [
                'nama' => 'Peserta Magang',
                'email' => 'peserta@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'peserta',
                'status_akun' => 'aktif',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user
            );
        }
    }
}