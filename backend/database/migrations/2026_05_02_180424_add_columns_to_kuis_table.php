<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kuis', function (Blueprint $table) {
            // Tambah kolom divisi
            $table->string('divisi', 100)->nullable()->after('judul_kuis');
            
            // Tambah kolom durasi (menit)
            $table->integer('durasi')->default(30)->after('deskripsi');
            
            // Tambah kolom passing grade
            $table->integer('passing')->default(75)->after('durasi');
            
            // Tambah kolom total soal
            $table->integer('total_soal')->default(0)->after('passing');
            
            // Tambah kolom questions (JSON)
            $table->json('questions')->nullable()->after('total_soal');
            
            // Tambah kolom peserta
            $table->integer('peserta')->default(0)->after('questions');
            
            // Index untuk optimasi query
            $table->index('divisi');
            $table->index('tanggal_mulai');
            $table->index('tanggal_selesai');
        });
    }

    public function down(): void
    {
        Schema::table('kuis', function (Blueprint $table) {
            $table->dropColumn([
                'divisi',
                'durasi',
                'passing',
                'total_soal',
                'questions',
                'peserta'
            ]);
            
            $table->dropIndex(['divisi']);
            $table->dropIndex(['tanggal_mulai']);
            $table->dropIndex(['tanggal_selesai']);
        });
    }
};