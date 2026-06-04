<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Cek apakah index 'hari_liburs_tanggal_unique' ada
        $indexExists = false;
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            $result = DB::select("SHOW INDEX FROM hari_liburs WHERE Key_name = 'hari_liburs_tanggal_unique'");
            $indexExists = count($result) > 0;
        } elseif ($driver === 'pgsql') {
            $result = DB::select("SELECT 1 FROM pg_indexes WHERE indexname = 'hari_liburs_tanggal_unique'");
            $indexExists = count($result) > 0;
        }

        Schema::table('hari_liburs', function (Blueprint $table) use ($indexExists) {
            if ($indexExists) {
                $table->dropUnique('hari_liburs_tanggal_unique');
            }

            $table->enum('jenis', ['nasional', 'perusahaan'])->default('perusahaan')->after('tanggal');
            $table->unique(['tanggal', 'jenis']);
        });
    }

    public function down()
    {
        Schema::table('hari_liburs', function (Blueprint $table) {
            $table->dropUnique(['tanggal', 'jenis']);
            $table->dropColumn('jenis');
            $table->unique('tanggal');
        });
    }
};