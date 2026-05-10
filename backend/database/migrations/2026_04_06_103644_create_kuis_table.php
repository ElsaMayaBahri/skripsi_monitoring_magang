<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuis', function (Blueprint $table) {
            $table->id('id_kuis'); // Primary key
            $table->string('judul_kuis', 150); // Judul kuis
            $table->text('deskripsi')->nullable(); // Deskripsi kuis
            $table->string('divisi', 100)->nullable(); // Divisi
            $table->integer('durasi')->default(30); // Durasi dalam menit
            $table->integer('passing')->default(75); // Passing grade (nilai minimal lulus) dalam persen
            $table->integer('total_soal')->default(0); // Total soal
            $table->json('questions')->nullable(); // Soal-soal dalam format JSON
            $table->integer('peserta')->default(0); // Jumlah peserta
            $table->date('tanggal_mulai')->nullable(); // Tanggal mulai
            $table->date('tanggal_selesai')->nullable(); // Tanggal selesai
            $table->timestamps(); // created_at dan updated_at
            
            // Index untuk optimasi
            $table->index('judul_kuis');
            $table->index('divisi');
            $table->index('tanggal_mulai');
            $table->index('tanggal_selesai');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuis');
    }
};