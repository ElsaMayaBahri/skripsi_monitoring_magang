<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('kuis', function (Blueprint $table) {
            $table->integer('level')->default(1)->after('passing');
        });
    }

    public function down()
    {
        Schema::table('kuis', function (Blueprint $table) {
            $table->dropColumn('level');
        });
    }
};