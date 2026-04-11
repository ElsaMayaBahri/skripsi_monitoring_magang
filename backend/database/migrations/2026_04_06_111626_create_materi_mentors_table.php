<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materi_mentors', function (Blueprint $table) {
            $table->id('id_materi'); // Primary key
            $table->unsignedBigInteger('id_mentor'); // Foreign key ke mentor
            $table->unsignedBigInteger('id_divisi')->nullable(); // Foreign key ke divisi (opsional)
            $table->string('judul', 150); // Judul materi
            $table->text('deskripsi')->nullable(); // Deskripsi materi
            $table->string('file_materi', 255); // File materi
            $table->timestamps(); // created_at dan updated_at
            
            // Foreign key ke tabel mentors
            $table->foreign('id_mentor')
                  ->references('id_mentor')
                  ->on('mentors')
                  ->onDelete('cascade');
            
            // Foreign key ke tabel divisis
            $table->foreign('id_divisi')
                  ->references('id_divisi')
                  ->on('divisis')
                  ->onDelete('set null');
            
            // Index untuk optimasi
            $table->index('id_mentor');
            $table->index('id_divisi');
            $table->index('judul');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materi_mentors');
    }
};
