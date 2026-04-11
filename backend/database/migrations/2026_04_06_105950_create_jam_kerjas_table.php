<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jam_kerjas', function (Blueprint $table) {
            $table->id('id_jam_kerja'); // Primary key
            $table->time('jam_masuk'); // Jam masuk kerja
            $table->time('jam_pulang'); // Jam pulang kerja
            $table->time('batas_terlambat'); // Batas waktu terlambat
            $table->timestamps(); // created_at dan updated_at
            
            // Hanya akan ada 1 record konfigurasi jam kerja
            // Index untuk optimasi
            $table->index('jam_masuk');
            $table->index('jam_pulang');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jam_kerjas');
    }
};
