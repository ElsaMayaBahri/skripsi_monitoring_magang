<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NilaiPeserta extends Model
{
    use HasFactory;

    protected $table = 'nilai_pesertas';
    protected $primaryKey = 'id_nilai';
    
    protected $fillable = [
        'id_peserta',
        'nilai_kehadiran',
        'nilai_tugas',
        'nilai_kuis',
        'sikap',
        'kualitas_kerja',
        'komunikasi',
        'kreativitas',
        'kerjasama',
        'inisiatif',
        'nilai_akhir',
        'catatan_mentor',
        'status',
        'dinilai_oleh',
        'dinilai_pada',
    ];

    protected $casts = [
        'nilai_kehadiran' => 'decimal:2',
        'nilai_tugas' => 'decimal:2',
        'nilai_kuis' => 'decimal:2',
        'sikap' => 'integer',
        'kualitas_kerja' => 'integer',
        'komunikasi' => 'integer',
        'kreativitas' => 'integer',
        'kerjasama' => 'integer',
        'inisiatif' => 'integer',
        'nilai_akhir' => 'decimal:2',
        'dinilai_pada' => 'datetime',
    ];

    /**
     * Relasi ke Peserta
     */
    public function peserta()
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id_peserta');
    }

    /**
     * Hitung rata-rata nilai manual
     */
    public function getRataRataManualAttribute()
    {
        $manualValues = array_filter([
            $this->sikap,
            $this->kualitas_kerja,
            $this->komunikasi,
            $this->kreativitas,
            $this->kerjasama,
            $this->inisiatif,
        ]);
        
        if (empty($manualValues)) return null;
        
        return round(array_sum($manualValues) / count($manualValues), 2);
    }

    /**
     * Hitung nilai akhir berdasarkan komponen
     * Bobot: Nilai Otomatis (kehadiran, tugas, kuis) 50%, Nilai Manual 50%
     */
    public static function hitungNilaiAkhir($kehadiran, $tugas, $kuis, $sikap, $kualitasKerja, $komunikasi, $kreativitas, $kerjasama, $inisiatif)
    {
        // Nilai otomatis (kehadiran, tugas, kuis) - 50%
        $nilaiOtomatis = ($kehadiran + $tugas + $kuis) / 3;
        
        // Nilai manual - 50%
        $manualValues = array_filter([$sikap, $kualitasKerja, $komunikasi, $kreativitas, $kerjasama, $inisiatif]);
        $nilaiManual = !empty($manualValues) ? array_sum($manualValues) / count($manualValues) : 0;
        
        // Bobot: Otomatis 50%, Manual 50%
        $nilaiAkhir = ($nilaiOtomatis * 0.5) + ($nilaiManual * 0.5);
        
        return round($nilaiAkhir, 2);
    }

    /**
     * Hitung dan update nilai akhir
     */
    public function hitungDanUpdateNilaiAkhir($kehadiran, $tugas, $kuis)
    {
        $nilaiAkhir = self::hitungNilaiAkhir(
            $kehadiran, $tugas, $kuis,
            $this->sikap ?? 0,
            $this->kualitas_kerja ?? 0,
            $this->komunikasi ?? 0,
            $this->kreativitas ?? 0,
            $this->kerjasama ?? 0,
            $this->inisiatif ?? 0
        );
        
        $this->update(['nilai_akhir' => $nilaiAkhir]);
        
        return $nilaiAkhir;
    }

    /**
     * Mendapatkan grade nilai (A, B, C, D, E)
     */
    public function getGradeAttribute()
    {
        if ($this->nilai_akhir === null) return null;
        
        if ($this->nilai_akhir >= 85) return 'A';
        if ($this->nilai_akhir >= 75) return 'B';
        if ($this->nilai_akhir >= 65) return 'C';
        if ($this->nilai_akhir >= 50) return 'D';
        return 'E';
    }

    /**
     * Mendapatkan deskripsi grade
     */
    public function getGradeDescAttribute()
    {
        $grades = [
            'A' => 'Sangat Baik',
            'B' => 'Baik',
            'C' => 'Cukup',
            'D' => 'Kurang',
            'E' => 'Sangat Kurang',
        ];
        return $grades[$this->grade] ?? '-';
    }

    /**
     * Scope untuk nilai yang sudah final
     */
    public function scopeSudahFinal($query)
    {
        return $query->where('status', 'final');
    }

    /**
     * Scope untuk nilai yang belum final
     */
    public function scopeBelumFinal($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Cek apakah nilai sudah final
     */
    public function isFinal()
    {
        return $this->status === 'final';
    }

    /**
     * Cek apakah nilai manual sudah lengkap
     */
    public function isManualComplete()
    {
        return $this->sikap !== null && 
               $this->kualitas_kerja !== null &&
               $this->komunikasi !== null &&
               $this->kreativitas !== null &&
               $this->kerjasama !== null &&
               $this->inisiatif !== null;
    }
}