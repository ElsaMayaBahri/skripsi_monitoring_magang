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
        'file_laporan',
        'tanggal_upload',
    ];

    protected $casts = [
        'tanggal_upload' => 'datetime',
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
        return Carbon::parse($this->tanggal_upload)->format('d F Y H:i');
    }

    /**
     * Scope untuk laporan berdasarkan tahun
     */
    public function scopeTahun($query, $tahun)
    {
        return $query->whereYear('tanggal_upload', $tahun);
    }

    /**
     * Scope untuk laporan berdasarkan bulan
     */
    public function scopeBulan($query, $bulan, $tahun = null)
    {
        $tahun = $tahun ?? Carbon::now()->year;
        return $query->whereMonth('tanggal_upload', $bulan)
                     ->whereYear('tanggal_upload', $tahun);
    }
}
