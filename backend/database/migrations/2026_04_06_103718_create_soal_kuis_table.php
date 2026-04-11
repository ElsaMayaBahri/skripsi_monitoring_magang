<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('soal_kuis', function (Blueprint $table) {
            $table->id('id_soal'); // Primary key
            $table->unsignedBigInteger('id_kuis'); // Foreign key ke tabel kuis
            $table->text('pertanyaan'); // Pertanyaan soal
            $table->string('opsi_a', 255); // Opsi A
            $table->string('opsi_b', 255); // Opsi B
            $table->string('opsi_c', 255); // Opsi C
            $table->string('opsi_d', 255); // Opsi D
            $table->char('jawaban_benar', 1); // Jawaban benar (A, B, C, D)
            $table->timestamps(); // created_at dan updated_at
            
            // Foreign key ke tabel kuis
            $table->foreign('id_kuis')
                  ->references('id_kuis')
                  ->on('kuis')
                  ->onDelete('cascade'); // Jika kuis dihapus, soal ikut terhapus
            
            // Index untuk optimasi
            $table->index('id_kuis');
            $table->index('jawaban_benar');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soal_kuis');
    }
};
