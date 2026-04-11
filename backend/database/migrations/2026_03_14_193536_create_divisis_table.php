<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('divisis', function (Blueprint $table) {
            $table->id('id_divisi');
            // TAMBAHKAN KOLOM id_mentor (nullable karena akan diisi setelah mentors dibuat)
            $table->unsignedBigInteger('id_mentor')->nullable();
            $table->string('nama_divisi', 100);
            $table->text('deskripsi')->nullable();
            $table->timestamps();
            
            // JANGAN tambahkan foreign key dulu di sini
            // Hanya buat index saja
            $table->index('id_mentor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('divisis');
    }
};