<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AksesMateriKompetensi extends Model
{
    protected $table = 'akses_materi_kompetensi';
    protected $primaryKey = 'id_akses_materi_kompetensi';

    protected $fillable = [
        'id_peserta',
        'id_materi_pelatihan',
        'tanggal_akses',
        'status',
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
     * Relasi ke model MateriPelatihan
     */
    public function materiPelatihan(): BelongsTo
    {
        return $this->belongsTo(
            MateriPelatihan::class,
            'id_materi_pelatihan',
            'id_materi_pelatihan'
        );
    }
}