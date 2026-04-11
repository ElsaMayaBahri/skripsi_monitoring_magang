<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nilai_pesertas', function (Blueprint $table) {
            $table->id('id_nilai');
            $table->unsignedBigInteger('id_peserta');
            $table->decimal('nilai_kehadiran', 5, 2)->default(0);
            $table->decimal('nilai_tugas', 5, 2)->default(0);
            $table->decimal('nilai_kuis', 5, 2)->default(0);
            $table->decimal('nilai_mentor', 5, 2)->default(0);
            $table->decimal('nilai_akhir', 5, 2)->default(0);
            $table->timestamps();
            
            // Foreign key akan ditambahkan di migration terakhir
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nilai_pesertas');
    }
};