<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kuis', function (Blueprint $table) {
            if (!Schema::hasColumn('kuis', 'passing')) {
                $table->integer('passing')->default(75)->after('durasi');
            }
        });
    }

    public function down(): void
    {
        Schema::table('kuis', function (Blueprint $table) {
            if (Schema::hasColumn('kuis', 'passing')) {
                $table->dropColumn('passing');
            }
        });
    }
};