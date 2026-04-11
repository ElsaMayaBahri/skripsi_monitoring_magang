<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Peserta extends Model
{
    use HasFactory;

    protected $table = 'pesertas';
    protected $primaryKey = 'id_peserta';
    
    protected $fillable = [
        'id_user',
        'id_mentor',
        'id_sertifikat',
        'id_nilai',
        'id_divisi',
        'asal_kampus',
        'tanggal_mulai',
        'tanggal_selesai',
        'status_magang',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function mentor()
    {
        return $this->belongsTo(Mentor::class, 'id_mentor', 'id_mentor');
    }

    public function divisi()
    {
        return $this->belongsTo(Divisi::class, 'id_divisi', 'id_divisi');
    }

    public function nilai()
    {
        return $this->hasOne(NilaiPeserta::class, 'id_peserta', 'id_peserta');
    }

    public function sertifikat()
    {
        return $this->hasOne(Sertifikat::class, 'id_peserta', 'id_peserta');
    }
}