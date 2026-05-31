<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NilaiPeserta extends Model
{
    protected $table = 'nilai_pesertas';
    protected $primaryKey = 'id_nilai';

    protected $fillable = [
        'id_peserta',
        'sikap',
        'kualitas_kerja',
        'komunikasi',
        'kreativitas',
        'kerjasama',
        'inisiatif',
        'nilai_kehadiran',
        'nilai_tugas',
        'nilai_kuis',
        'nilai_manual',
        'nilai_akhir',
        'catatan_mentor',
        'dinilai_oleh',
        'dinilai_pada',
        'status',
        'finalized_at',
    ];

    protected $casts = [
        'nilai_kehadiran' => 'decimal:2',
        'nilai_tugas' => 'decimal:2',
        'nilai_kuis' => 'decimal:2',
        'nilai_manual' => 'decimal:2',
        'nilai_akhir' => 'decimal:2',
        'dinilai_pada' => 'datetime',
        'finalized_at' => 'datetime',
    ];

    public function peserta()
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id_peserta');
    }

    public static function hitungNilaiManual(
        $sikap,
        $kualitasKerja,
        $komunikasi,
        $kreativitas,
        $kerjasama,
        $inisiatif
    ) {
        $nilai = [
            $sikap ?? 0,
            $kualitasKerja ?? 0,
            $komunikasi ?? 0,
            $kreativitas ?? 0,
            $kerjasama ?? 0,
            $inisiatif ?? 0,
        ];

        return round(array_sum($nilai) / count($nilai), 2);
    }

    public static function hitungNilaiAkhir(
        $nilaiKehadiran,
        $nilaiTugas,
        $nilaiKuis,
        $sikap,
        $kualitasKerja,
        $komunikasi,
        $kreativitas,
        $kerjasama,
        $inisiatif
    ) {
        $nilaiManual = self::hitungNilaiManual(
            $sikap,
            $kualitasKerja,
            $komunikasi,
            $kreativitas,
            $kerjasama,
            $inisiatif
        );

        return round(
            (($nilaiKehadiran ?? 0) * 0.20) +
                (($nilaiTugas ?? 0) * 0.25) +
                (($nilaiKuis ?? 0) * 0.15) +
                ($nilaiManual * 0.40),
            2
        );
    }

    public function getGradeAttribute()
    {
        $nilai = $this->nilai_akhir;

        if ($nilai >= 85) return 'A';
        if ($nilai >= 75) return 'B';
        if ($nilai >= 65) return 'C';
        if ($nilai >= 50) return 'D';

        return 'E';
    }
}