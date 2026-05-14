<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class LaporanAkhir extends Model
{
    use HasFactory;

    protected $table = 'laporan_akhirs';
    protected $primaryKey = 'id_laporan';
    
    protected $fillable = [
        'id_peserta',
        'judul',
        'file_laporan',
        'status',
        'catatan_mentor',
        'nilai_akhir',
        'dinilai_oleh',
        'dinilai_pada',
        'file_size',
        'tanggal_upload',
    ];

    protected $casts = [
        'tanggal_upload' => 'datetime',
        'dinilai_pada' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi ke Peserta
     */
    public function peserta()
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id_peserta');
    }

    /**
     * Accessor untuk URL file laporan
     */
    public function getFileUrlAttribute()
    {
        if ($this->file_laporan) {
            return asset('storage/' . $this->file_laporan);
        }
        return null;
    }

    /**
     * Accessor untuk tanggal upload terformat
     */
    public function getTanggalUploadFormattedAttribute()
    {
        if (!$this->tanggal_upload) {
            return '-';
        }
        return Carbon::parse($this->tanggal_upload)->format('d F Y H:i');
    }
}