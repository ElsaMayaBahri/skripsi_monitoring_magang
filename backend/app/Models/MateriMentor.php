<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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
            return asset('storage/' . $this->file_materi);
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
        return 'Tidak diketahui';
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
        return $this->mentor ? $this->mentor->nama_lengkap : 'Tidak Diketahui';
    }
}
