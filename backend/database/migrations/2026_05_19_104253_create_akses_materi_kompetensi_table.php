<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('akses_materi_kompetensi', function (Blueprint $table) {
            $table->id('id_akses_materi_kompetensi');

            $table->unsignedBigInteger('id_peserta');
            $table->unsignedBigInteger('id_materi_pelatihan');

            $table->timestamp('tanggal_akses')->nullable();
            $table->enum('status', ['belum', 'selesai'])->default('selesai');

            $table->timestamps();

            $table->unique(
                ['id_peserta', 'id_materi_pelatihan'],
                'unique_akses_materi_kompetensi'
            );

            $table->foreign('id_peserta')
                ->references('id_peserta')
                ->on('pesertas')
                ->onDelete('cascade');

            $table->foreign('id_materi_pelatihan')
                ->references('id_materi_pelatihan')
                ->on('materi_pelatihans')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('akses_materi_kompetensi');
    }
};