<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pesertas', function (Blueprint $table) {
            $table->id('id_peserta');
            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_mentor')->nullable();
            $table->unsignedBigInteger('id_sertifikat')->nullable();
            $table->unsignedBigInteger('id_nilai')->nullable();
            $table->unsignedBigInteger('id_divisi')->nullable();
            $table->string('asal_kampus', 150)->nullable();
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->enum('status_magang', ['aktif', 'selesai', 'berhenti'])->default('aktif');
            $table->timestamps();
            
            $table->foreign('id_user')->references('id_user')->on('users')->onDelete('cascade');
            $table->foreign('id_mentor')->references('id_mentor')->on('mentors')->onDelete('set null');
            $table->foreign('id_divisi')->references('id_divisi')->on('divisis')->onDelete('set null');
            // Foreign key ke sertifikats dan nilai_pesertas akan ditambahkan di migration terakhir
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pesertas');
    }
};