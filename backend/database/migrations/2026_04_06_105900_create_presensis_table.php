<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensis', function (Blueprint $table) {
            $table->id('id_presensi'); // Primary key
            $table->unsignedBigInteger('id_peserta'); // Foreign key ke peserta
            $table->date('tanggal'); // Tanggal presensi
            $table->time('check_in')->nullable(); // Jam check in
            $table->time('check_out')->nullable(); // Jam check out
            $table->string('foto_checkin', 255)->nullable(); // Foto saat check in
            $table->string('lokasi', 255)->nullable(); // Lokasi check in/out
            $table->string('status_kehadiran', 100)->default('hadir'); // hadir, izin, sakit, alpha
            $table->text('daily_report')->nullable(); // Laporan harian
            $table->timestamps(); // created_at dan updated_at
            
            // Foreign key ke tabel peserta
            $table->foreign('id_peserta')
                  ->references('id_peserta')
                  ->on('pesertas')
                  ->onDelete('cascade');
            
            // Index untuk optimasi
            $table->index('id_peserta');
            $table->index('tanggal');
            $table->index('status_kehadiran');
            $table->unique(['id_peserta', 'tanggal'], 'unique_presensi_harian'); // Mencegah double presensi
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presensis');
    }
};