<?php
// backend/database/migrations/2026_04_06_111626_create_materi_mentors_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materi_mentors', function (Blueprint $table) {
            $table->id('id_materi');
            $table->unsignedBigInteger('id_mentor');
            $table->unsignedBigInteger('id_divisi')->nullable();
            $table->string('judul', 255);
            $table->text('deskripsi')->nullable();
            $table->enum('tipe_materi', ['dokumen', 'video', 'link'])->default('dokumen');
            $table->string('file_materi', 500)->nullable();
            $table->string('link', 500)->nullable();
            $table->integer('views')->default(0);
            $table->timestamps();
            
            $table->foreign('id_mentor')
                  ->references('id_mentor')
                  ->on('mentors')
                  ->onDelete('cascade');
            
            $table->foreign('id_divisi')
                  ->references('id_divisi')
                  ->on('divisis')
                  ->onDelete('set null');
            
            $table->index('id_mentor');
            $table->index('id_divisi');
            $table->index('tipe_materi');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materi_mentors');
    }
};