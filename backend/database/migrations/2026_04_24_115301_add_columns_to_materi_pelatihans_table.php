<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materi_pelatihans', function (Blueprint $table) {
            if (!Schema::hasColumn('materi_pelatihans', 'deskripsi')) {
                $table->text('deskripsi')->nullable()->after('judul');
            }
            if (!Schema::hasColumn('materi_pelatihans', 'divisi')) {
                $table->string('divisi', 100)->nullable()->after('deskripsi');
            }
            if (!Schema::hasColumn('materi_pelatihans', 'kategori')) {
                $table->string('kategori', 50)->nullable()->after('divisi');
            }
            if (!Schema::hasColumn('materi_pelatihans', 'views')) {
                $table->integer('views')->default(0)->after('file_materi');
            }
        });
    }

    public function down(): void
    {
        Schema::table('materi_pelatihans', function (Blueprint $table) {
            $table->dropColumn(['deskripsi', 'divisi', 'kategori', 'views']);
        });
    }
};