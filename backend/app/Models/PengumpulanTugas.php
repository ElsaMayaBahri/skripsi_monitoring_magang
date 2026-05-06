<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PengumpulanTugas extends Model
{
    use HasFactory;

    protected $table = 'pengumpulan_tugas';
    protected $primaryKey = 'id_pengumpulan';
    
    protected $fillable = [
        'id_tugas',
        'id_peserta',
        'file_jawaban',
        'status',
        'nilai',
        'catatan_mentor',
        'tanggal_kumpul',
    ];

    protected $casts = [
        'tanggal_kumpul' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'nilai' => 'integer',
    ];

    /**
     * Relasi ke Tugas
     */
    public function tugas()
    {
        return $this->belongsTo(Tugas::class, 'id_tugas', 'id_tugas');
    }

    /**
     * Relasi ke Peserta
     */
    public function peserta()
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id_peserta');
    }

    /**
     * Accessor untuk status dalam Bahasa Indonesia (untuk frontend)
     */
    public function getStatusTextAttribute()
    {
        $status = [
            'dikumpulkan' => 'Menunggu Review',
            'dinilai' => 'Sedang Dinilai',
            'selesai' => 'Selesai',
            'revisi' => 'Perlu Revisi',
            'pending' => 'Belum Kumpul',
        ];
        
        return $status[$this->status] ?? 'Tidak Diketahui';
    }

    /**
     * Accessor untuk badge status (CSS color)
     */
    public function getStatusBadgeAttribute()
    {
        $badges = [
            'dikumpulkan' => 'warning',
            'dinilai' => 'info',
            'selesai' => 'success',
            'revisi' => 'danger',
            'pending' => 'secondary',
        ];
        
        return $badges[$this->status] ?? 'secondary';
    }

    /**
     * Accessor untuk badge warna (Tailwind)
     */
    public function getStatusColorAttribute()
    {
        $colors = [
            'dikumpulkan' => 'bg-amber-100 text-amber-800',
            'dinilai' => 'bg-blue-100 text-blue-800',
            'selesai' => 'bg-emerald-100 text-emerald-800',
            'revisi' => 'bg-purple-100 text-purple-800',
            'pending' => 'bg-slate-100 text-slate-800',
        ];
        
        return $colors[$this->status] ?? 'bg-slate-100 text-slate-800';
    }

    /**
     * Cek apakah pengumpulan terlambat
     */
    public function getIsTerlambatAttribute()
    {
        if (!$this->tugas) {
            return false;
        }
        
        return Carbon::parse($this->tanggal_kumpul)->gt($this->tugas->deadline);
    }

    /**
     * Mendapatkan URL file jawaban
     */
    public function getFileUrlAttribute()
    {
        if ($this->file_jawaban) {
            return asset('storage/' . $this->file_jawaban);
        }
        return null;
    }

    /**
     * Mendapatkan keterlambatan dalam hari
     */
    public function getKeterlambatanAttribute()
    {
        if (!$this->is_terlambat || !$this->tugas) {
            return 0;
        }
        
        return $this->tugas->deadline->diffInDays($this->tanggal_kumpul);
    }

    /**
     * Mendapatkan format tanggal kumpul
     */
    public function getTanggalKumpulFormattedAttribute()
    {
        if (!$this->tanggal_kumpul) {
            return '-';
        }
        return $this->tanggal_kumpul->format('d/m/Y H:i');
    }

    /**
     * Cek apakah sudah dinilai
     */
    public function getIsDinilaiAttribute()
    {
        return in_array($this->status, ['selesai', 'dinilai']);
    }

    /**
     * Scope untuk pengumpulan berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk pengumpulan yang belum dinilai
     */
    public function scopeBelumDinilai($query)
    {
        return $query->where('status', 'dikumpulkan');
    }

    /**
     * Scope untuk pengumpulan berdasarkan tugas
     */
    public function scopeByTugas($query, $idTugas)
    {
        return $query->where('id_tugas', $idTugas);
    }

    /**
     * Scope untuk pengumpulan berdasarkan peserta
     */
    public function scopeByPeserta($query, $idPeserta)
    {
        return $query->where('id_peserta', $idPeserta);
    }

    /**
     * Scope untuk pengumpulan yang sudah dinilai
     */
    public function scopeSudahDinilai($query)
    {
        return $query->whereIn('status', ['selesai', 'dinilai']);
    }

    /**
     * Update status menjadi dinilai
     */
    public function setDinilai()
    {
        $this->update(['status' => 'dinilai']);
    }

    /**
     * Update status menjadi selesai dengan nilai dan catatan
     */
    public function setSelesai($nilai = null, $catatan = null)
    {
        $data = ['status' => 'selesai'];
        if ($nilai !== null) {
            $data['nilai'] = $nilai;
        }
        if ($catatan) {
            $data['catatan_mentor'] = $catatan;
        }
        $this->update($data);
    }

    /**
     * Update status menjadi revisi dengan catatan
     */
    public function setRevisi($catatan = null)
    {
        $data = ['status' => 'revisi'];
        if ($catatan) {
            $data['catatan_mentor'] = $catatan;
        }
        $this->update($data);
    }

    /**
     * Update nilai dan status
     */
    public function updateNilai($nilai, $catatan = null)
    {
        $data = [
            'nilai' => $nilai,
            'status' => 'selesai',
        ];
        if ($catatan) {
            $data['catatan_mentor'] = $catatan;
        }
        $this->update($data);
    }

    /**
     * Mendapatkan nilai dalam huruf (A, B, C, D)
     */
    public function getNilaiHurufAttribute()
    {
        if ($this->nilai === null) return '-';
        
        if ($this->nilai >= 85) return 'A';
        if ($this->nilai >= 70) return 'B';
        if ($this->nilai >= 60) return 'C';
        if ($this->nilai >= 50) return 'D';
        return 'E';
    }
}