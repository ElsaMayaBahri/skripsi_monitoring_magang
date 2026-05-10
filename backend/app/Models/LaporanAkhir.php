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

    /**
     * Accessor untuk status dalam Bahasa Indonesia
     */
    public function getStatusTextAttribute()
    {
        $statusMap = [
            'pending' => 'Menunggu Review',
            'approved' => 'Disetujui',
            'revision' => 'Revisi',
            'not_uploaded' => 'Belum Upload',
        ];
        return $statusMap[$this->status] ?? $this->status;
    }

    /**
     * Accessor untuk badge status (CSS)
     */
    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => 'warning',
            'approved' => 'success',
            'revision' => 'danger',
            'not_uploaded' => 'secondary',
        ];
        return $badges[$this->status] ?? 'secondary';
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

    /**
     * Scope untuk laporan berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk laporan yang sudah direview
     */
    public function scopeSudahDireview($query)
    {
        return $query->whereIn('status', ['approved', 'revision']);
    }

    /**
     * Scope untuk laporan yang belum direview
     */
    public function scopeBelumDireview($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Cek apakah laporan sudah disetujui
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Cek apakah laporan perlu revisi
     */
    public function isRevision()
    {
        return $this->status === 'revision';
    }

    /**
     * Cek apakah laporan masih pending
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }
}