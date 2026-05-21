<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presensis', function (Blueprint $table) {
            // Jenis kehadiran: wfo, wfh, izin, sakit
            $table->string('jenis_kehadiran', 20)->default('wfo')->after('status_kehadiran');

            // Alasan jika jenis_kehadiran = izin
            $table->text('alasan_izin')->nullable()->after('jenis_kehadiran');

            // Koordinat GPS (lat,lng) — lokasi teks sudah ada, ini untuk presisi
            $table->string('lokasi_koordinat', 100)->nullable()->after('lokasi');
        });
    }

    public function down(): void
    {
        Schema::table('presensis', function (Blueprint $table) {
            $table->dropColumn(['jenis_kehadiran', 'alasan_izin', 'lokasi_koordinat']);
        });
    }
};
