<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AksesMateri extends Model
{
    protected $table = 'akses_materi';
    
    protected $fillable = [
        'id_peserta',
        'id_materi',
        'tanggal_akses',
        'status'
    ];
    
    protected $casts = [
        'tanggal_akses' => 'datetime',
    ];
    
    /**
     * Relasi ke model Peserta
     */
    public function peserta(): BelongsTo
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id_peserta');
    }
    
    /**
     * Relasi ke model MateriMentor
     */
    public function materi(): BelongsTo
    {
        return $this->belongsTo(MateriMentor::class, 'id_materi', 'id_materi');
    }
}