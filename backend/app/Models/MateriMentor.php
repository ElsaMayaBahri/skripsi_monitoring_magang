<?php
// backend/app/Models/MateriMentor.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class MateriMentor extends Model
{
    use HasFactory;

    protected $table = 'materi_mentors';
    protected $primaryKey = 'id_materi';
    
    protected $fillable = [
        'id_mentor',
        'id_divisi',
        'judul',
        'deskripsi',
        'tipe_materi',
        'file_materi',
        'link',
        'views',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'views' => 'integer',
    ];

    public function mentor()
    {
        return $this->belongsTo(Mentor::class, 'id_mentor', 'id_mentor');
    }

    public function divisi()
    {
        return $this->belongsTo(Divisi::class, 'id_divisi', 'id_divisi');
    }

    public function getFileUrlAttribute()
    {
        if ($this->file_materi) {
            return Storage::url($this->file_materi);
        }
        return null;
    }

    public function getFileExtensionAttribute()
    {
        if ($this->file_materi) {
            return pathinfo($this->file_materi, PATHINFO_EXTENSION);
        }
        return null;
    }

    public function isDokumen()
    {
        return $this->tipe_materi === 'dokumen';
    }

    public function isVideo()
    {
        return $this->tipe_materi === 'video';
    }

    public function isLink()
    {
        return $this->tipe_materi === 'link';
    }
}