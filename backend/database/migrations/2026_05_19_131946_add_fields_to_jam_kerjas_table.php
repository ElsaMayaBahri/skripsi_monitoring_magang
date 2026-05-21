<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jam_kerjas', function (Blueprint $table) {
            $table->time('jam_masuk')->nullable()->after('id');
            $table->time('jam_pulang')->nullable()->after('jam_masuk');
            $table->integer('batas_terlambat')->default(15)->after('jam_pulang');
        });
    }

    public function down(): void
    {
        Schema::table('jam_kerjas', function (Blueprint $table) {
            $table->dropColumn([
                'jam_masuk',
                'jam_pulang',
                'batas_terlambat'
            ]);
        });
    }
};
