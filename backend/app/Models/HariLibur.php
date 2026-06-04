<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HariLibur extends Model
{
    use HasFactory;

    protected $fillable = ['tanggal', 'keterangan', 'jenis'];
    protected $casts = [
        'tanggal' => 'date',
        'jenis'   => 'string',
    ];

    // Scope untuk libur nasional
    public function scopeNasional($query)
    {
        return $query->where('jenis', 'nasional');
    }

    // Scope untuk libur perusahaan
    public function scopePerusahaan($query)
    {
        return $query->where('jenis', 'perusahaan');
    }
}
