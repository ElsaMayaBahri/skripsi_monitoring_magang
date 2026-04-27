<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materi_pelatihans', function (Blueprint $table) {
            $table->id('id_materi_pelatihan'); // Primary key
            $table->string('judul', 150); // Judul materi
            $table->string('file_materi', 255)->nullable(); // File materi (PDF/DOC)
            $table->timestamps(); // created_at dan updated_at
            
            // Index untuk optimasi
            $table->index('judul');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materi_pelatihans');
    }
};