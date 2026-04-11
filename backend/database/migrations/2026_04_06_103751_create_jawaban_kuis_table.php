<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jawaban_kuis', function (Blueprint $table) {
            $table->id('id_jawaban'); // Primary key
            $table->unsignedBigInteger('id_soal'); // Foreign key ke tabel soal_kuis
            $table->unsignedBigInteger('id_user'); // Foreign key ke tabel users (peserta)
            $table->unsignedBigInteger('id_kuis'); // Foreign key ke tabel kuis
            $table->char('jawaban', 1); // Jawaban peserta (A, B, C, D)
            $table->integer('skor')->default(0); // Skor yang didapat (0 atau sesuai bobot)
            $table->timestamps(); // created_at dan updated_at
            
            // Foreign keys
            $table->foreign('id_soal')
                  ->references('id_soal')
                  ->on('soal_kuis')
                  ->onDelete('cascade'); // Jika soal dihapus, jawaban ikut terhapus
            
            $table->foreign('id_user')
                  ->references('id_user')
                  ->on('users')
                  ->onDelete('cascade'); // Jika user dihapus, jawaban ikut terhapus
            
            $table->foreign('id_kuis')
                  ->references('id_kuis')
                  ->on('kuis')
                  ->onDelete('cascade'); // Jika kuis dihapus, jawaban ikut terhapus
            
            // Index untuk optimasi
            $table->index('id_soal');
            $table->index('id_user');
            $table->index('id_kuis');
            $table->index('jawaban');
            $table->index('skor');
            
            // Unique constraint untuk mencegah jawaban ganda
            $table->unique(['id_soal', 'id_user', 'id_kuis'], 'unique_jawaban');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jawaban_kuis');
    }
};
