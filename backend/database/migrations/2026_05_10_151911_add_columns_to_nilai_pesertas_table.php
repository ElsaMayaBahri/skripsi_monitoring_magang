<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('nilai_pesertas', function (Blueprint $table) {
        $table->decimal('sikap', 5, 2)->nullable()->after('id_peserta');
        $table->decimal('kualitas_kerja', 5, 2)->nullable()->after('sikap');
        $table->decimal('komunikasi', 5, 2)->nullable()->after('kualitas_kerja');
        $table->decimal('kreativitas', 5, 2)->nullable()->after('komunikasi');
        $table->decimal('kerjasama', 5, 2)->nullable()->after('kreativitas');
        $table->decimal('inisiatif', 5, 2)->nullable()->after('kerjasama');
        $table->text('catatan_mentor')->nullable()->after('inisiatif');
        $table->string('dinilai_oleh')->nullable()->after('catatan_mentor');
        $table->timestamp('dinilai_pada')->nullable()->after('dinilai_oleh');
        $table->enum('status', ['pending', 'final'])->default('pending')->after('dinilai_pada');
        $table->timestamp('finalized_at')->nullable()->after('status');
    });
}

public function down(): void
{
    Schema::table('nilai_pesertas', function (Blueprint $table) {
        $table->dropColumn([
            'sikap', 'kualitas_kerja', 'komunikasi', 'kreativitas',
            'kerjasama', 'inisiatif', 'catatan_mentor', 'dinilai_oleh',
            'dinilai_pada', 'status', 'finalized_at'
        ]);
    });
}
};
