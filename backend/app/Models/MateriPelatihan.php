<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class MateriPelatihan extends Model
{
    use HasFactory;

    protected $table = 'materi_pelatihans';
    protected $primaryKey = 'id_materi_pelatihan';
    
    protected $fillable = [
        'judul',
        'deskripsi',
        'divisi',
        'kategori',
        'file_materi',
        'views'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'views' => 'integer'
    ];

    protected $appends = ['file_url']; // Tambahkan ini

public function getFileUrlAttribute()
{
    if ($this->file_materi) {
        return asset('storage/' . $this->file_materi);
    }
    return null;
}
    
    /**
     * Get file size in human readable format
     */
    public function getFileSizeAttribute()
    {
        if ($this->file_materi && Storage::disk('public')->exists($this->file_materi)) {
            $size = Storage::disk('public')->size($this->file_materi);
            $units = ['B', 'KB', 'MB', 'GB'];
            $i = 0;
            while ($size >= 1024 && $i < count($units) - 1) {
                $size /= 1024;
                $i++;
            }
            return round($size, 2) . ' ' . $units[$i];
        }
        return '0 B';
    }
    
    /**
     * Get file type
     */
    public function getFileTypeAttribute()
    {
        if ($this->file_materi) {
            $extension = pathinfo($this->file_materi, PATHINFO_EXTENSION);
            return strtoupper($extension);
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
    
    /**
     * Scope untuk filter divisi
     */
    public function scopeByDivisi($query, $divisi)
    {
        return $query->where('divisi', $divisi);
    }
    
    /**
     * Scope untuk filter kategori
     */
    public function scopeByKategori($query, $kategori)
    {
        return $query->where('kategori', $kategori);
    }
}