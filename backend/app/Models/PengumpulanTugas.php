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
        'catatan_mentor',
        'tanggal_kumpul',
    ];

    protected $casts = [
        'tanggal_kumpul' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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
     * Accessor untuk status dalam Bahasa Indonesia
     */
    public function getStatusTextAttribute()
    {
        $status = [
            'dikumpulkan' => 'Sudah Dikumpulkan',
            'dinilai' => 'Sedang Dinilai',
            'selesai' => 'Selesai Dinilai',
            'terlambat' => 'Terlambat',
        ];
        
        return $status[$this->status] ?? 'Tidak Diketahui';
    }

    /**
     * Accessor untuk badge status (CSS)
     */
    public function getStatusBadgeAttribute()
    {
        $badges = [
            'dikumpulkan' => 'warning',
            'dinilai' => 'info',
            'selesai' => 'success',
            'terlambat' => 'danger',
        ];
        
        return $badges[$this->status] ?? 'secondary';
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
        if (!$this->is_terlambat) {
            return 0;
        }
        
        return $this->tugas->deadline->diffInDays($this->tanggal_kumpul);
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
     * Update status menjadi dinilai
     */
    public function setDinilai()
    {
        $this->update(['status' => 'dinilai']);
    }

    /**
     * Update status menjadi selesai dengan catatan mentor
     */
    public function setSelesai($catatan = null)
    {
        $data = ['status' => 'selesai'];
        if ($catatan) {
            $data['catatan_mentor'] = $catatan;
        }
        $this->update($data);
    }
}
