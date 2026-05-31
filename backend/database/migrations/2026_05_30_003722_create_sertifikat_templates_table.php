<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sertifikat_templates', function (Blueprint $table) {
            $table->id();
            $table->string('nama_template');
            $table->enum('jenis_sertifikat', ['kompetensi', 'magang'])->default('kompetensi');
            $table->unsignedBigInteger('divisi_id')->nullable();
            $table->string('bidang_kompetensi')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_extension', 10);
            $table->integer('file_size')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            $table->foreign('divisi_id')->references('id_divisi')->on('divisis')->onDelete('set null');
            $table->index(['jenis_sertifikat', 'is_active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('sertifikat_templates');
    }
};