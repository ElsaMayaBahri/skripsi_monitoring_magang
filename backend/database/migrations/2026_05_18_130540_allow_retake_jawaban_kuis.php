<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jawaban_kuis', function (Blueprint $table) {
            // Hapus unique constraint lama yang mencegah jawaban ganda per soal
            $table->dropUnique('unique_jawaban');

            // Tambah kolom attempt untuk melacak percobaan ke-berapa
            $table->integer('attempt')->default(1)->after('skor');
        });
    }

    public function down(): void
    {
        Schema::table('jawaban_kuis', function (Blueprint $table) {
            // Hapus kolom attempt yang ditambahkan
            $table->dropColumn('attempt');

            // Kembalikan unique constraint seperti semula
            $table->unique(['id_soal', 'id_user', 'id_kuis'], 'unique_jawaban');
        });
    }
};