<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Tugas extends Model
{
    use HasFactory;

    protected $table = 'tugas';
    protected $primaryKey = 'id_tugas';
    
    protected $fillable = [
        'id_mentor',
        'id_divisi',
        'judul_tugas',
        'deskripsi',
        'deadline',
        'file_tugas',
        'file_link',     
        'link_type',
    ];

    protected $casts = [
        'deadline' => 'datetime',
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
     * Relasi ke PengumpulanTugas
     */
    public function pengumpulan()
    {
        return $this->hasMany(PengumpulanTugas::class, 'id_tugas', 'id_tugas');
    }

    /**
     * Relasi ke PengumpulanTugas yang sudah dinilai
     */
    public function pengumpulanDinilai()
    {
        return $this->hasMany(PengumpulanTugas::class, 'id_tugas', 'id_tugas')
                    ->where('status', 'selesai');
    }

    /**
     * Relasi ke PengumpulanTugas yang belum dinilai
     */
    public function pengumpulanBelumDinilai()
    {
        return $this->hasMany(PengumpulanTugas::class, 'id_tugas', 'id_tugas')
                    ->where('status', 'dikumpulkan');
    }

    /**
     * Cek apakah tugas sudah melewati deadline
     */
    public function getIsTerlambatAttribute()
    {
        return Carbon::now()->gt($this->deadline);
    }

    /**
     * Cek apakah tugas masih dalam batas waktu
     */
    public function getIsAktifAttribute()
    {
        return Carbon::now()->lt($this->deadline);
    }

    /**
     * Mendapatkan sisa waktu deadline
     */
    public function getSisaWaktuAttribute()
    {
        if ($this->is_terlambat) {
            return 'Melewati deadline';
        }
        
        $diff = Carbon::now()->diff($this->deadline);
        $days = $diff->d;
        $hours = $diff->h;
        $minutes = $diff->i;
        
        if ($days > 0) {
            return $days . ' hari ' . $hours . ' jam';
        } elseif ($hours > 0) {
            return $hours . ' jam ' . $minutes . ' menit';
        } else {
            return $minutes . ' menit';
        }
    }

    /**
     * Mendapatkan URL file tugas
     */
    public function getFileUrlAttribute()
    {
        if ($this->file_tugas) {
            return asset('storage/' . $this->file_tugas);
        }
        return null;
    }

    /**
     * Mendapatkan jumlah peserta yang mengumpulkan
     */
    public function getJumlahPengumpulanAttribute()
    {
        return $this->pengumpulan()->count();
    }

    /**
     * Mendapatkan jumlah peserta yang sudah dinilai
     */
    public function getJumlahDinilaiAttribute()
    {
        return $this->pengumpulan()->where('status', 'selesai')->count();
    }

    /**
     * Mendapatkan jumlah peserta yang belum mengumpulkan
     */
    public function getJumlahBelumKumpulAttribute()
    {
        // Ini perlu dihitung dari jumlah peserta bimbingan
        return 0; // placeholder
    }

    /**
     * Scope untuk tugas yang aktif (belum deadline)
     */
    public function scopeAktif($query)
    {
        return $query->where('deadline', '>', Carbon::now());
    }

    /**
     * Scope untuk tugas yang sudah deadline
     */
    public function scopeTerlambat($query)
    {
        return $query->where('deadline', '<', Carbon::now());
    }

    /**
     * Scope untuk tugas berdasarkan mentor
     */
    public function scopeByMentor($query, $idMentor)
    {
        return $query->where('id_mentor', $idMentor);
    }

    /**
     * Scope untuk tugas berdasarkan divisi
     */
    public function scopeByDivisi($query, $idDivisi)
    {
        return $query->where('id_divisi', $idDivisi);
    }

    /**
     * Cek apakah peserta sudah mengumpulkan tugas
     */
    public function sudahMengumpulkan($idPeserta)
    {
        return $this->pengumpulan()
                    ->where('id_peserta', $idPeserta)
                    ->exists();
    }

    /**
     * Mendapatkan pengumpulan tugas peserta tertentu
     */
    public function getPengumpulanByPeserta($idPeserta)
    {
        return $this->pengumpulan()
                    ->where('id_peserta', $idPeserta)
                    ->first();
    }

    /**
     * Mendapatkan status tugas (active/closed)
     */
    public function getStatusTugasAttribute()
    {
        return $this->is_terlambat ? 'closed' : 'active';
    }

    /**
     * Mendapatkan bobot tugas (default 0, bisa ditambahkan nanti)
     */
    public function getBobotAttribute()
    {
        return 0;
    }

    /**
     * Mendapatkan deskripsi singkat
     */
    public function getDeskripsiSingkatAttribute()
    {
        return strlen($this->deskripsi) > 100 
            ? substr($this->deskripsi, 0, 100) . '...' 
            : $this->deskripsi;
    }
}