<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Presensi extends Model
{
    use HasFactory;

    protected $table = 'presensis';
    protected $primaryKey = 'id_presensi';

    protected $fillable = [
        'id_peserta',
        'tanggal',
        'check_in',
        'check_out',
        'foto_checkin',
        'lokasi',
        'lokasi_koordinat',
        'status_kehadiran',
        'jenis_kehadiran',
        'alasan_izin',
        'daily_report',
    ];

    /**
     * PERBAIKAN: check_in dan check_out bertipe TIME di database,
     * jangan di-cast sebagai 'datetime' — itu akan membuatnya menjadi
     * Carbon dengan tanggal 1970-01-01 dan merusak logika perbandingan.
     * Biarkan sebagai string (default), kita parse manual di controller.
     */
    protected $casts = [
        'tanggal' => 'date:Y-m-d',
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
     * Cek apakah terlambat berdasarkan jam masuk
     * @param string $jamMasuk format "HH:MM:SS"
     * @param int $batasMenit
     */
    public function getIsTerlambatAttribute($jamMasuk = '08:00:00', $batasMenit = 15)
    {
        if (!$this->check_in) return false;

        $checkInSec  = strtotime($this->check_in);
        $jamMasukSec = strtotime($jamMasuk);

        return ($checkInSec - $jamMasukSec) / 60 > $batasMenit;
    }

    /**
     * Hitung durasi kerja dalam menit
     */
    public function getDurasiKerjaAttribute()
    {
        if (!$this->check_in || !$this->check_out) return null;

        $durasi = round((strtotime($this->check_out) - strtotime($this->check_in)) / 60);
        $jam    = intdiv($durasi, 60);
        $menit  = $durasi % 60;

        return $jam > 0 ? "{$jam} jam {$menit} menit" : "{$menit} menit";
    }

    /**
     * Hitung keterlambatan dalam menit
     */
    public function getKeterlambatanAttribute()
    {
        if (!$this->check_in) return 0;

        $jamMasuk    = '08:00:00';
        $checkInSec  = strtotime($this->check_in);
        $jamMasukSec = strtotime($jamMasuk);

        if ($checkInSec <= $jamMasukSec) return 0;

        return round(($checkInSec - $jamMasukSec) / 60);
    }

    // ==================== SCOPES ====================

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal', [$startDate, $endDate]);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status_kehadiran', $status);
    }

    public function scopeHariIni($query)
    {
        return $query->whereDate('tanggal', Carbon::today());
    }

    public function scopeBulanIni($query)
    {
        return $query->whereMonth('tanggal', Carbon::now()->month)
                     ->whereYear('tanggal', Carbon::now()->year);
    }
}
