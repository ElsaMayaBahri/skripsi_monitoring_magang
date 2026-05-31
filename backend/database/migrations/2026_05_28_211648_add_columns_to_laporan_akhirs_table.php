<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan_akhirs', function (Blueprint $table) {
            $table->string('judul', 255)->nullable()->after('id_peserta');
            $table->text('deskripsi')->nullable()->after('judul');
            $table->bigInteger('file_size')->nullable()->after('file_laporan');
        });
    }

    public function down(): void
    {
        Schema::table('laporan_akhirs', function (Blueprint $table) {
            $table->dropColumn(['judul', 'deskripsi', 'file_size']);
        });
    }
};