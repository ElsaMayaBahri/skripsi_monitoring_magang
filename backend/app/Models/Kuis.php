<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Kuis extends Model
{
    use HasFactory;

    protected $table = 'kuis';
    protected $primaryKey = 'id_kuis';
    
    protected $fillable = [
        'judul_kuis',
        'deskripsi',
        'tanggal_mulai',
        'tanggal_selesai',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi ke SoalKuis
     */
    public function soal()
    {
        return $this->hasMany(SoalKuis::class, 'id_kuis', 'id_kuis');
    }

    /**
     * Relasi ke JawabanKuis
     */
    public function jawaban()
    {
        return $this->hasMany(JawabanKuis::class, 'id_kuis', 'id_kuis');
    }

    /**
     * Cek apakah kuis sedang aktif
     */
    public function getIsAktifAttribute()
    {
        $now = Carbon::now();
        $mulai = Carbon::parse($this->tanggal_mulai);
        $selesai = Carbon::parse($this->tanggal_selesai);
        
        return $now->between($mulai, $selesai);
    }

    /**
     * Cek apakah kuis sudah selesai
     */
    public function getIsSelesaiAttribute()
    {
        return Carbon::now()->gt(Carbon::parse($this->tanggal_selesai));
    }

    /**
     * Cek apakah kuis belum dimulai
     */
    public function getIsBelumMulaiAttribute()
    {
        return Carbon::now()->lt(Carbon::parse($this->tanggal_mulai));
    }

    /**
     * Scope untuk kuis yang aktif
     */
    public function scopeAktif($query)
    {
        $now = Carbon::now();
        return $query->where('tanggal_mulai', '<=', $now)
                     ->where('tanggal_selesai', '>=', $now);
    }

    /**
     * Scope untuk kuis yang sudah selesai
     */
    public function scopeSelesai($query)
    {
        return $query->where('tanggal_selesai', '<', Carbon::now());
    }

    /**
     * Scope untuk kuis yang akan datang
     */
    public function scopeAkanDatang($query)
    {
        return $query->where('tanggal_mulai', '>', Carbon::now());
    }

    /**
     * Mendapatkan total skor maksimal
     */
    public function getTotalSkorMaksimalAttribute()
    {
        return $this->soal()->count(); // Asumsikan setiap soal bernilai 1
    }
}
