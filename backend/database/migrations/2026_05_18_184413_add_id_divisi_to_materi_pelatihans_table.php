<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('materi_pelatihans', function (Blueprint $table) {
            // Cek apakah kolom id_divisi sudah ada
            if (!Schema::hasColumn('materi_pelatihans', 'id_divisi')) {
                // Tambah kolom id_divisi
                $table->unsignedBigInteger('id_divisi')->nullable()->after('deskripsi');
                
                // Tambah foreign key constraint (relasi ke tabel divisis)
                $table->foreign('id_divisi')
                      ->references('id_divisi')
                      ->on('divisis')
                      ->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materi_pelatihans', function (Blueprint $table) {
            // Hapus foreign key dulu
            $table->dropForeign(['id_divisi']);
            
            // Hapus kolom id_divisi
            $table->dropColumn('id_divisi');
        });
    }
};