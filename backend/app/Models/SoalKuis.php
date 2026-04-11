<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SoalKuis extends Model
{
    use HasFactory;

    protected $table = 'soal_kuis';
    protected $primaryKey = 'id_soal';
    
    protected $fillable = [
        'id_kuis',
        'pertanyaan',
        'opsi_a',
        'opsi_b',
        'opsi_c',
        'opsi_d',
        'jawaban_benar',
    ];

    /**
     * Relasi ke Kuis
     */
    public function kuis()
    {
        return $this->belongsTo(Kuis::class, 'id_kuis', 'id_kuis');
    }

    /**
     * Relasi ke JawabanKuis
     */
    public function jawaban()
    {
        return $this->hasMany(JawabanKuis::class, 'id_soal', 'id_soal');
    }

    /**
     * Mendapatkan semua opsi dalam bentuk array
     */
    public function getOpsiArrayAttribute()
    {
        return [
            'A' => $this->opsi_a,
            'B' => $this->opsi_b,
            'C' => $this->opsi_c,
            'D' => $this->opsi_d,
        ];
    }

    /**
     * Cek apakah jawaban benar
     */
    public function isJawabanBenar($jawaban)
    {
        return strtoupper($jawaban) === $this->jawaban_benar;
    }

    /**
     * Scope untuk mendapatkan soal berdasarkan kuis
     */
    public function scopeByKuis($query, $idKuis)
    {
        return $query->where('id_kuis', $idKuis);
    }
}
