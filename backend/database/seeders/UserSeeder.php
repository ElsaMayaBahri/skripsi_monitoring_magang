<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create(['nama' => 'admin', 'email' => 'admin@gmail.com', 'status_akun' => 'aktif', 'role' => 'admin', 'password' => 'admin']);
        User::create(['nama' => 'coo', 'email' => 'coo@gmail.com', 'status_akun' => 'aktif', 'role' => 'coo', 'password' => 'coo']);
        User::create(['nama' => 'mentor', 'email' => 'mentor@gmail.com', 'status_akun' => 'aktif', 'role' => 'mentor', 'password' => 'mentor']);
        User::create(['nama' => 'peserta', 'email' => 'peserta@gmail.com', 'status_akun' => 'aktif', 'role' => 'peserta', 'password' => 'peserta']);
    }
}
