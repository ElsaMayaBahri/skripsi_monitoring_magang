<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sertifikats', function (Blueprint $table) {
            $table->id('id_sertifikat');
            $table->unsignedBigInteger('id_peserta');
            $table->string('nomor_sertifikat', 100)->unique();
            $table->string('file_sertifikat', 255)->nullable();
            $table->date('tanggal_terbit')->nullable();
            $table->timestamps();
            
            // Foreign key akan ditambahkan di migration terakhir
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sertifikats');
    }
};