<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NilaiPeserta extends Model
{
    use HasFactory;

    protected $table = 'nilai_pesertas';
    protected $primaryKey = 'id_nilai';
    
    protected $fillable = [
        'id_peserta',
        'nilai_kehadiran',
        'nilai_tugas',
        'nilai_kuis',
        'nilai_mentor',
        'nilai_akhir',
    ];

    public function peserta()
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id_peserta');
    }
}