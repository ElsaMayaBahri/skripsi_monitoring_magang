<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jawaban_kuis', function (Blueprint $table) {
            // Hapus foreign key id_soal dulu jika masih ada
            $table->dropForeign(['id_soal']);
        });

        Schema::table('jawaban_kuis', function (Blueprint $table) {
            // Karena jawaban disimpan 1 baris per kuis/attempt, id_soal boleh null
            $table->unsignedBigInteger('id_soal')->nullable()->change();

            // Karena jawaban dikirim dalam bentuk object/JSON, jangan char(1)
            $table->text('jawaban')->change();

            // Tambahkan ulang foreign key dengan nullable
            $table->foreign('id_soal')
                ->references('id_soal')
                ->on('soal_kuis')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('jawaban_kuis', function (Blueprint $table) {
            $table->dropForeign(['id_soal']);
            $table->unsignedBigInteger('id_soal')->nullable(false)->change();
            $table->char('jawaban', 1)->change();

            $table->foreign('id_soal')
                ->references('id_soal')
                ->on('soal_kuis')
                ->onDelete('cascade');
        });
    }
};