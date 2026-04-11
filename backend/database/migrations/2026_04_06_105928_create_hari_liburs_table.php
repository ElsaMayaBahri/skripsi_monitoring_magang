<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hari_liburs', function (Blueprint $table) {
            $table->id('id_libur'); // Primary key
            $table->date('tanggal'); // Tanggal libur
            $table->string('keterangan', 150); // Keterangan hari libur
            $table->timestamps(); // created_at dan updated_at
            
            // Index untuk optimasi
            $table->unique('tanggal'); // Mencegah duplikasi tanggal libur
            $table->index('tanggal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hari_liburs');
    }
};
