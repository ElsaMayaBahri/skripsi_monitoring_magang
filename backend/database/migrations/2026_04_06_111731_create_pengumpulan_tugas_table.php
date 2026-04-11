<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengumpulan_tugas', function (Blueprint $table) {
            $table->id('id_pengumpulan'); // Primary key
            $table->unsignedBigInteger('id_tugas'); // Foreign key ke tugas
            $table->unsignedBigInteger('id_peserta'); // Foreign key ke peserta
            $table->string('file_jawaban', 255); // File jawaban tugas
            $table->enum('status', ['dikumpulkan', 'dinilai', 'selesai', 'terlambat'])->default('dikumpulkan'); // Status pengumpulan
            $table->text('catatan_mentor')->nullable(); // Catatan dari mentor
            $table->dateTime('tanggal_kumpul'); // Tanggal pengumpulan
            $table->timestamps(); // created_at dan updated_at
            
            // Foreign key ke tabel tugas
            $table->foreign('id_tugas')
                  ->references('id_tugas')
                  ->on('tugas')
                  ->onDelete('cascade');
            
            // Foreign key ke tabel peserta
            $table->foreign('id_peserta')
                  ->references('id_peserta')
                  ->on('pesertas')
                  ->onDelete('cascade');
            
            // Index untuk optimasi
            $table->index('id_tugas');
            $table->index('id_peserta');
            $table->index('status');
            $table->index('tanggal_kumpul');
            
            // Unique constraint untuk mencegah pengumpulan ganda
            $table->unique(['id_tugas', 'id_peserta'], 'unique_pengumpulan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengumpulan_tugas');
    }
};

