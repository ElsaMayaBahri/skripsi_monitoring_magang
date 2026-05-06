<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('materi_mentors', function (Blueprint $table) {
            if (!Schema::hasColumn('materi_mentors', 'tipe_materi')) {
                $table->enum('tipe_materi', ['dokumen', 'video', 'link'])->default('dokumen')->after('deskripsi');
            }
            if (!Schema::hasColumn('materi_mentors', 'link')) {
                $table->string('link')->nullable()->after('file_materi');
            }
            if (!Schema::hasColumn('materi_mentors', 'views')) {
                $table->integer('views')->default(0)->after('link');
            }
        });
    }

    public function down()
    {
        Schema::table('materi_mentors', function (Blueprint $table) {
            $table->dropColumn(['tipe_materi', 'link', 'views']);
        });
    }
};