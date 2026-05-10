<?php

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
        'file_materi',
        'tipe_materi',  // ✅ TAMBAHKAN
        'link',         // ✅ TAMBAHKAN
        'views',        // ✅ TAMBAHKAN
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'views' => 'integer',
    ];

    /**
     * Relasi ke Mentor
     */
    public function mentor()
    {
        return $this->belongsTo(Mentor::class, 'id_mentor', 'id_mentor');
    }

    /**
     * Relasi ke Divisi
     */
    public function divisi()
    {
        return $this->belongsTo(Divisi::class, 'id_divisi', 'id_divisi');
    }

    /**
     * Accessor untuk URL file materi
     */
    public function getFileUrlAttribute()
    {
        if ($this->file_materi) {
            return Storage::url($this->file_materi);
        }
        return null;
    }

    /**
     * Accessor untuk URL video
     */
    public function getVideoUrlAttribute()
    {
        if ($this->tipe_materi === 'video' && $this->file_materi) {
            return Storage::url($this->file_materi);
        }
        return null;
    }

    /**
     * Accessor untuk mendapatkan ekstensi file
     */
    public function getFileExtensionAttribute()
    {
        if ($this->file_materi) {
            return pathinfo($this->file_materi, PATHINFO_EXTENSION);
        }
        return null;
    }

    /**
     * Accessor untuk mendapatkan ikon file berdasarkan ekstensi
     */
    public function getFileIconAttribute()
    {
        $ext = $this->file_extension;
        
        $icons = [
            'pdf' => 'file-pdf',
            'doc' => 'file-word',
            'docx' => 'file-word',
            'xls' => 'file-excel',
            'xlsx' => 'file-excel',
            'ppt' => 'file-powerpoint',
            'pptx' => 'file-powerpoint',
            'jpg' => 'file-image',
            'jpeg' => 'file-image',
            'png' => 'file-image',
            'mp4' => 'file-video',
            'mov' => 'file-video',
            'avi' => 'file-video',
            'webm' => 'file-video',
            'zip' => 'file-archive',
            'rar' => 'file-archive',
        ];
        
        return $icons[$ext] ?? 'file-alt';
    }

    /**
     * Scope untuk materi berdasarkan mentor
     */
    public function scopeByMentor($query, $idMentor)
    {
        return $query->where('id_mentor', $idMentor);
    }

    /**
     * Scope untuk materi berdasarkan divisi
     */
    public function scopeByDivisi($query, $idDivisi)
    {
        return $query->where('id_divisi', $idDivisi);
    }

    /**
     * Scope untuk pencarian judul
     */
    public function scopeCariJudul($query, $judul)
    {
        return $query->where('judul', 'like', '%' . $judul . '%');
    }

    /**
     * Scope untuk materi terbaru
     */
    public function scopeTerbaru($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope untuk filter berdasarkan tipe materi
     */
    public function scopeByTipe($query, $tipe)
    {
        return $query->where('tipe_materi', $tipe);
    }

    /**
     * Mendapatkan ukuran file dalam format yang mudah dibaca
     */
    public function getFileSizeAttribute()
    {
        if ($this->file_materi) {
            $path = storage_path('app/public/' . $this->file_materi);
            if (file_exists($path)) {
                $bytes = filesize($path);
                $units = ['B', 'KB', 'MB', 'GB'];
                $i = 0;
                while ($bytes >= 1024 && $i < count($units) - 1) {
                    $bytes /= 1024;
                    $i++;
                }
                return round($bytes, 2) . ' ' . $units[$i];
            }
        }
        return null;
    }

    /**
     * Mendapatkan waktu upload dalam format yang mudah dibaca
     */
    public function getWaktuUploadAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Mendapatkan nama mentor
     */
    public function getNamaMentorAttribute()
    {
        return $this->mentor ? ($this->mentor->user->nama ?? 'Tidak Diketahui') : 'Tidak Diketahui';
    }

    /**
     * Cek apakah materi adalah dokumen
     */
    public function isDokumen()
    {
        return $this->tipe_materi === 'dokumen';
    }

    /**
     * Cek apakah materi adalah video
     */
    public function isVideo()
    {
        return $this->tipe_materi === 'video';
    }

    /**
     * Cek apakah materi adalah link
     */
    public function isLink()
    {
        return $this->tipe_materi === 'link';
    }
}