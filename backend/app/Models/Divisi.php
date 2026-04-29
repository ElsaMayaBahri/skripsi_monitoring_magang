<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Divisi extends Model
{
    use HasFactory;

    protected $table = 'divisis';
    protected $primaryKey = 'id_divisi';
    
    protected $fillable = [
        'id_mentor',
        'nama_divisi',
        'deskripsi',
        'status',  // 🔥 TAMBAHKAN FIELD STATUS
    ];
    
    // Default values
    protected $attributes = [
        'status' => 'aktif',
    ];

    public function mentor()
    {
        return $this->belongsTo(Mentor::class, 'id_mentor', 'id_mentor');
    }

    public function mentors()
    {
        return $this->hasMany(Mentor::class, 'id_divisi', 'id_divisi');
    }

    public function pesertas()
    {
        return $this->hasMany(Peserta::class, 'id_divisi', 'id_divisi');
    }
}