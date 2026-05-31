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
        'template_id',        // TAMBAHKAN INI
        'id_peserta',
        'nomor_sertifikat',
        'bidang_kompetensi',  // TAMBAHKAN INI
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

    // TAMBAHKAN RELASI INI
    public function template()
    {
        return $this->belongsTo(SertifikatTemplate::class, 'template_id', 'id');
    }

    public function getUser()
    {
        return $this->hasOneThrough(User::class, Peserta::class, 'id_peserta', 'id_user', 'id_peserta', 'id_user');
    }
}