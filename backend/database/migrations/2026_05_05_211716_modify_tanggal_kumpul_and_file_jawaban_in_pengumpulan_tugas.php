<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengumpulan_tugas', function (Blueprint $table) {
            $table->string('file_jawaban', 255)->nullable()->change();
            $table->dateTime('tanggal_kumpul')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('pengumpulan_tugas', function (Blueprint $table) {
            $table->string('file_jawaban', 255)->nullable(false)->change();
            $table->dateTime('tanggal_kumpul')->nullable(false)->change();
        });
    }
};