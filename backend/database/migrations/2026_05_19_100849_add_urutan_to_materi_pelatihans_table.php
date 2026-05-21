<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materi_pelatihans', function (Blueprint $table) {
            $table->integer('urutan')->default(1)->after('kategori');
            $table->index('urutan');
        });
    }

    public function down(): void
    {
        Schema::table('materi_pelatihans', function (Blueprint $table) {
            $table->dropIndex(['urutan']);
            $table->dropColumn('urutan');
        });
    }
};