<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('divisis', function (Blueprint $table) {
            // Cek apakah foreign key sudah ada sebelum menambahkan
            $foreignKeys = $this->getForeignKeys('divisis');
            
            if (!in_array('divisis_id_mentor_foreign', $foreignKeys)) {
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
            // Cek apakah foreign key ada sebelum menghapus
            $foreignKeys = $this->getForeignKeys('divisis');
            
            if (in_array('divisis_id_mentor_foreign', $foreignKeys)) {
                $table->dropForeign(['id_mentor']);
            }
        });
    }

    // Helper function untuk mendapatkan daftar foreign keys
    private function getForeignKeys($table)
    {
        $conn = Schema::getConnection();
        $dbName = $conn->getDatabaseName();
        
        $result = $conn->select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = ? 
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ", [$dbName, $table]);
        
        return array_map(function($item) {
            return $item->CONSTRAINT_NAME;
        }, $result);
    }
};