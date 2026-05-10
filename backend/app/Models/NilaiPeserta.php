<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NilaiPeserta extends Model
{
    protected $primaryKey = 'id_nilai';

    protected $fillable = [
        'id_peserta',
        'sikap',
        'kualitas_kerja',
        'komunikasi',
        'kreativitas',
        'kerjasama',
        'inisiatif',
        'nilai_kehadiran',
        'nilai_tugas',
        'nilai_kuis',
        'nilai_akhir',
        'catatan_mentor',
        'dinilai_oleh',
        'dinilai_pada',
        'status',
        'finalized_at',
    ];

    protected $casts = [
        'dinilai_pada'  => 'datetime',
        'finalized_at'  => 'datetime',
    ];

    public function peserta()
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id_peserta');
    }
}