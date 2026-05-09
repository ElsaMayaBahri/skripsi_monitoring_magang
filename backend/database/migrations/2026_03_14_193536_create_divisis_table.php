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
            $table->unsignedBigInteger('id_mentor')->nullable();
            $table->string('nama_divisi', 100);
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['aktif', 'non_aktif'])->default('aktif');
            $table->timestamps();

            $table->index('id_mentor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('divisis');
    }
};
