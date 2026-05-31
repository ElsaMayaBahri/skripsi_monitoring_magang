<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('sertifikats', function (Blueprint $table) {
            $table->unsignedBigInteger('template_id')->nullable()->after('id_sertifikat');
            $table->string('bidang_kompetensi')->nullable()->after('nomor_sertifikat');
            $table->foreign('template_id')->references('id')->on('sertifikat_templates')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('sertifikats', function (Blueprint $table) {
            $table->dropForeign(['template_id']);
            $table->dropColumn(['template_id', 'bidang_kompetensi']);
        });
    }
};