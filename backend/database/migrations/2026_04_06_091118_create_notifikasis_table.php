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
        Schema::create('notifikasis', function (Blueprint $table) {
            $table->id('id_notifikasi'); // Primary key
            $table->unsignedBigInteger('id_user'); // Foreign key ke users
            $table->string('judul', 150); // Judul notifikasi max 150 chars
            $table->text('pesan'); // Pesan notifikasi (text)
            $table->boolean('status_baca')->default(false); // Status baca (bool)
            $table->timestamps(); // created_at dan updated_at
            
            // Foreign key ke tabel users
            $table->foreign('id_user')
                  ->references('id_user')
                  ->on('users')
                  ->onDelete('cascade'); // Jika user dihapus, notifikasi ikut terhapus
            
            // Index untuk optimasi query
            $table->index('id_user');
            $table->index('status_baca');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifikasis');
    }
};
