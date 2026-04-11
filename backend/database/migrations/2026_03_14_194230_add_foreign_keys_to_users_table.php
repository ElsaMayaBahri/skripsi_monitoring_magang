<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tambahkan foreign key ke users
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('id_peserta')
                  ->references('id_peserta')
                  ->on('pesertas')
                  ->onDelete('set null');
            
            $table->foreign('id_mentor')
                  ->references('id_mentor')
                  ->on('mentors')
                  ->onDelete('set null');
        });

        // 2. Tambahkan foreign key ke sertifikats
        Schema::table('sertifikats', function (Blueprint $table) {
            $table->foreign('id_peserta')
                  ->references('id_peserta')
                  ->on('pesertas')
                  ->onDelete('cascade');
        });

        // 3. Tambahkan foreign key ke nilai_pesertas
        Schema::table('nilai_pesertas', function (Blueprint $table) {
            $table->foreign('id_peserta')
                  ->references('id_peserta')
                  ->on('pesertas')
                  ->onDelete('cascade');
        });

        // 4. Tambahkan foreign key ke divisis (SEKARANG KOLOM id_mentor SUDAH ADA)
        Schema::table('divisis', function (Blueprint $table) {
            // HAPUS baris modify karena kolom sudah ada
            // Langsung tambahkan foreign key
            $table->foreign('id_mentor')
                  ->references('id_mentor')
                  ->on('mentors')
                  ->onDelete('set null');
        });

        // 5. Tambahkan foreign key ke pesertas (untuk id_sertifikat dan id_nilai)
        Schema::table('pesertas', function (Blueprint $table) {
            $table->foreign('id_sertifikat')
                  ->references('id_sertifikat')
                  ->on('sertifikats')
                  ->onDelete('set null');
            
            $table->foreign('id_nilai')
                  ->references('id_nilai')
                  ->on('nilai_pesertas')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        // Hapus foreign key dari divisis
        Schema::table('divisis', function (Blueprint $table) {
            $table->dropForeign(['id_mentor']);
        });

        // Hapus foreign key dari pesertas
        Schema::table('pesertas', function (Blueprint $table) {
            $table->dropForeign(['id_sertifikat']);
            $table->dropForeign(['id_nilai']);
        });

        // Hapus foreign key dari sertifikats
        Schema::table('sertifikats', function (Blueprint $table) {
            $table->dropForeign(['id_peserta']);
        });

        // Hapus foreign key dari nilai_pesertas
        Schema::table('nilai_pesertas', function (Blueprint $table) {
            $table->dropForeign(['id_peserta']);
        });

        // Hapus foreign key dari users
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['id_peserta']);
            $table->dropForeign(['id_mentor']);
        });
    }
};