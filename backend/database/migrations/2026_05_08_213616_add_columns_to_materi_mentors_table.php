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
        Schema::table('materi_mentors', function (Blueprint $table) {

            if (!Schema::hasColumn('materi_mentors', 'id_divisi')) {
                $table->unsignedBigInteger('id_divisi')->nullable()->after('id_mentor');
            }

            if (!Schema::hasColumn('materi_mentors', 'deskripsi')) {
                $table->text('deskripsi')->nullable()->after('judul');
            }

            if (!Schema::hasColumn('materi_mentors', 'tipe_materi')) {
                $table->enum('tipe_materi', ['dokumen', 'video', 'link'])
                    ->default('dokumen')
                    ->after('deskripsi');
            }

            if (!Schema::hasColumn('materi_mentors', 'file_materi')) {
                $table->string('file_materi')->nullable()->after('tipe_materi');
            }

            if (!Schema::hasColumn('materi_mentors', 'link')) {
                $table->string('link', 500)->nullable()->after('file_materi');
            }

            if (!Schema::hasColumn('materi_mentors', 'views')) {
                $table->integer('views')->default(0)->after('link');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materi_mentors', function (Blueprint $table) {

            $columns = [
                'id_divisi',
                'deskripsi',
                'tipe_materi',
                'file_materi',
                'link',
                'views'
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('materi_mentors', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};