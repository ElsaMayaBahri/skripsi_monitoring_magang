<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kuis', function (Blueprint $table) {
            if (!Schema::hasColumn('kuis', 'divisi')) {
                $table->string('divisi', 100)->nullable();
                $table->index('divisi');
            }

            if (!Schema::hasColumn('kuis', 'durasi')) {
                $table->integer('durasi')->default(30);
            }

            if (!Schema::hasColumn('kuis', 'passing')) {
                $table->integer('passing')->default(75);
            }

            if (!Schema::hasColumn('kuis', 'total_soal')) {
                $table->integer('total_soal')->default(0);
            }

            if (!Schema::hasColumn('kuis', 'questions')) {
                $table->json('questions')->nullable();
            }

            if (!Schema::hasColumn('kuis', 'peserta')) {
                $table->integer('peserta')->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('kuis', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('kuis', 'divisi')) {
                $columns[] = 'divisi';
            }
            if (Schema::hasColumn('kuis', 'durasi')) {
                $columns[] = 'durasi';
            }
            if (Schema::hasColumn('kuis', 'passing')) {
                $columns[] = 'passing';
            }
            if (Schema::hasColumn('kuis', 'total_soal')) {
                $columns[] = 'total_soal';
            }
            if (Schema::hasColumn('kuis', 'questions')) {
                $columns[] = 'questions';
            }
            if (Schema::hasColumn('kuis', 'peserta')) {
                $columns[] = 'peserta';
            }

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
