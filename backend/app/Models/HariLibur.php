<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HariLibur extends Model
{
    use HasFactory;
    
    protected $table = 'hari_liburs';
    protected $primaryKey = 'id_libur';
    
    protected $fillable = [
        'tanggal',
        'keterangan'
    ];
    
    protected $casts = [
        'tanggal' => 'date'
    ];
}