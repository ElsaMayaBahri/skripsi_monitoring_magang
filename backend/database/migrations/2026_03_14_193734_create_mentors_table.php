<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentors', function (Blueprint $table) {
            $table->id('id_mentor');
            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_divisi')->nullable();
            $table->string('jabatan', 100)->nullable();
            $table->timestamps();
            
            $table->foreign('id_user')->references('id_user')->on('users')->onDelete('cascade');
            // Foreign key ke divisis - SEKARANG SUDAH AMAN karena tabel divisis sudah dibuat
            $table->foreign('id_divisi')->references('id_divisi')->on('divisis')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentors');
    }
};