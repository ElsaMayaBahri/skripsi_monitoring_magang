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
        Schema::table('tugas', function (Blueprint $table) {
            // Menambahkan kolom file_link untuk menyimpan URL/link tugas
            $table->string('file_link', 500)->nullable()->after('file_tugas');
            // Menambahkan kolom link_type untuk menyimpan jenis link (google_doc, google_sheet, dll)
            $table->string('link_type', 50)->nullable()->after('file_link');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tugas', function (Blueprint $table) {
            $table->dropColumn(['file_link', 'link_type']);
        });
    }
};