<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporan_akhirs', function (Blueprint $table) {
            $table->id('id_laporan'); // Primary key
            $table->unsignedBigInteger('id_peserta'); // Foreign key ke peserta
            $table->string('file_laporan', 255); // File laporan akhir (PDF/DOC)
            $table->dateTime('tanggal_upload'); // Tanggal upload laporan
            $table->timestamps(); // created_at dan updated_at
            
            // Foreign key ke tabel peserta
            $table->foreign('id_peserta')
                  ->references('id_peserta')
                  ->on('pesertas')
                  ->onDelete('cascade');
            
            // Index untuk optimasi
            $table->index('id_peserta');
            $table->index('tanggal_upload');
            $table->unique('id_peserta'); // Satu peserta hanya punya satu laporan akhir
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_akhirs');
    }
};
