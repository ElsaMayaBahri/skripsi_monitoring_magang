<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tugas', function (Blueprint $table) {
            $table->id('id_tugas'); // Primary key
            $table->unsignedBigInteger('id_mentor'); // Foreign key ke mentor
            $table->unsignedBigInteger('id_divisi')->nullable(); // Foreign key ke divisi (opsional)
            $table->string('judul_tugas', 150); // Judul tugas
            $table->text('deskripsi')->nullable(); // Deskripsi tugas
            $table->dateTime('deadline'); // Deadline pengumpulan
            $table->string('file_tugas', 255)->nullable(); // File tugas (opsional)
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
            $table->index('judul_tugas');
            $table->index('deadline');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tugas');
    }
};
