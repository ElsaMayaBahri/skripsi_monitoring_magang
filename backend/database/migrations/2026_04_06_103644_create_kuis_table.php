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
            $table->date('tanggal_mulai'); // Tanggal mulai
            $table->date('tanggal_selesai'); // Tanggal selesai
            $table->timestamps(); // created_at dan updated_at
            
            // Index untuk optimasi
            $table->index('judul_kuis');
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
