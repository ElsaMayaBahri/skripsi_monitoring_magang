<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('nilai_pesertas', function (Blueprint $table) {
            if (!Schema::hasColumn('nilai_pesertas', 'dinilai_oleh')) {
                $table->string('dinilai_oleh')->nullable()->after('catatan_mentor');
            }
            if (!Schema::hasColumn('nilai_pesertas', 'dinilai_pada')) {
                $table->timestamp('dinilai_pada')->nullable()->after('dinilai_oleh');
            }
        });
    }

    public function down()
    {
        Schema::table('nilai_pesertas', function (Blueprint $table) {
            $table->dropColumn(['dinilai_oleh', 'dinilai_pada']);
        });
    }
};