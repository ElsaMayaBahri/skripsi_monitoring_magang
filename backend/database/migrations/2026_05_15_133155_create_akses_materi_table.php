<?php
// database/migrations/yyyy_mm_dd_create_akses_materi_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('akses_materi', function (Blueprint $table) {
            $table->id('id_akses');
            $table->unsignedBigInteger('id_peserta');
            $table->unsignedBigInteger('id_materi');
            $table->timestamp('tanggal_akses')->nullable();
            $table->enum('status', ['belum', 'selesai'])->default('belum');
            $table->timestamps();
            
            $table->foreign('id_peserta')->references('id_peserta')->on('pesertas')->onDelete('cascade');
            $table->foreign('id_materi')->references('id_materi')->on('materi_mentors')->onDelete('cascade');
            
            $table->unique(['id_peserta', 'id_materi']);
            $table->index('id_peserta');
            $table->index('id_materi');
        });
    }

    public function down()
    {
        Schema::dropIfExists('akses_materi');
    }
};