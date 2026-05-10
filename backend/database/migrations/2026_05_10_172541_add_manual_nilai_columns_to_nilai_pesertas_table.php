<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('nilai_pesertas', function (Blueprint $table) {
            // Cek apakah kolom sudah ada sebelum menambah
            if (!Schema::hasColumn('nilai_pesertas', 'sikap')) {
                $table->integer('sikap')->nullable()->after('nilai_mentor');
            }
            if (!Schema::hasColumn('nilai_pesertas', 'kualitas_kerja')) {
                $table->integer('kualitas_kerja')->nullable()->after('sikap');
            }
            if (!Schema::hasColumn('nilai_pesertas', 'komunikasi')) {
                $table->integer('komunikasi')->nullable()->after('kualitas_kerja');
            }
            if (!Schema::hasColumn('nilai_pesertas', 'kreativitas')) {
                $table->integer('kreativitas')->nullable()->after('komunikasi');
            }
            if (!Schema::hasColumn('nilai_pesertas', 'kerjasama')) {
                $table->integer('kerjasama')->nullable()->after('kreativitas');
            }
            if (!Schema::hasColumn('nilai_pesertas', 'inisiatif')) {
                $table->integer('inisiatif')->nullable()->after('kerjasama');
            }
            if (!Schema::hasColumn('nilai_pesertas', 'catatan_mentor')) {
                $table->text('catatan_mentor')->nullable()->after('inisiatif');
            }
            if (!Schema::hasColumn('nilai_pesertas', 'status')) {
                $table->enum('status', ['pending', 'final'])->default('pending')->after('catatan_mentor');
            }
            if (!Schema::hasColumn('nilai_pesertas', 'dinilai_oleh')) {
                $table->string('dinilai_oleh', 100)->nullable()->after('status');
            }
            if (!Schema::hasColumn('nilai_pesertas', 'dinilai_pada')) {
                $table->timestamp('dinilai_pada')->nullable()->after('dinilai_oleh');
            }
        });
    }

    public function down(): void
    {
        Schema::table('nilai_pesertas', function (Blueprint $table) {
            $table->dropColumn([
                'sikap', 'kualitas_kerja', 'komunikasi', 'kreativitas', 
                'kerjasama', 'inisiatif', 'catatan_mentor', 'status', 
                'dinilai_oleh', 'dinilai_pada'
            ]);
        });
    }
};