<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kuis', function (Blueprint $table) {
            $table->integer('level')->default(1)->after('status');
            // Level 1 = bebas, Level 2 = butuh level 1 lulus, dst.
            $table->index('level');
        });
    }

    public function down(): void
    {
        Schema::table('kuis', function (Blueprint $table) {
            $table->dropColumn('level');
        });
    }
};
