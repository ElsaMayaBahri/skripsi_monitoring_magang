<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sertifikat extends Model
{
    use HasFactory;

    protected $table = 'sertifikats';
    protected $primaryKey = 'id_sertifikat';
    
    protected $fillable = [
        'id_peserta',
        'nomor_sertifikat',
        'file_sertifikat',
        'tanggal_terbit',
    ];

    protected $casts = [
        'tanggal_terbit' => 'date',
    ];

    public function peserta()
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id_peserta');
    }
}