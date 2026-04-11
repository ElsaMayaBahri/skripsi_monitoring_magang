<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MateriPelatihan extends Model
{
    use HasFactory;

    protected $table = 'materi_pelatihans';
    protected $primaryKey = 'id_materi_pelatihan';
    
    protected $fillable = [
        'judul',
        'file_materi',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Accessor untuk mendapatkan URL file materi
     */
    public function getFileUrlAttribute()
    {
        if ($this->file_materi) {
            return asset('storage/' . $this->file_materi);
        }
        return null;
    }

    /**
     * Scope untuk pencarian judul
     */
    public function scopeCariJudul($query, $judul)
    {
        return $query->where('judul', 'like', '%' . $judul . '%');
    }
}