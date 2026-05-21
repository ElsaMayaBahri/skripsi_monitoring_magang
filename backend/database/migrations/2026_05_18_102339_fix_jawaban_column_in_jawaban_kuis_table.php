<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Hapus index pada kolom jawaban
        DB::statement('ALTER TABLE jawaban_kuis DROP INDEX jawaban_kuis_jawaban_index');

        // Ubah tipe kolom ke TEXT
        DB::statement('ALTER TABLE jawaban_kuis MODIFY COLUMN jawaban TEXT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE jawaban_kuis MODIFY COLUMN jawaban VARCHAR(255) NULL');
        DB::statement('ALTER TABLE jawaban_kuis ADD INDEX jawaban_kuis_jawaban_index (jawaban)');
    }
};
