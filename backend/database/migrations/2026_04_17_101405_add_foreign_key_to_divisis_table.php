<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('divisis', function (Blueprint $table) {
            // Cek apakah foreign key sudah ada sebelum menambah
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $foreignKeys = $sm->listTableForeignKeys('divisis');
            
            $exists = false;
            foreach ($foreignKeys as $foreignKey) {
                if ($foreignKey->getName() === 'divisis_id_mentor_foreign') {
                    $exists = true;
                    break;
                }
            }
            
            if (!$exists) {
                $table->foreign('id_mentor')
                      ->references('id_mentor')
                      ->on('mentors')
                      ->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('divisis', function (Blueprint $table) {
            $table->dropForeign(['id_mentor']);
        });
    }
};