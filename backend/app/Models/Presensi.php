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
        'status_kehadiran',
        'daily_report',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
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
     * Accessor untuk status kehadiran dalam Bahasa Indonesia
     */
    public function getStatusKehadiranTextAttribute()
    {
        $status = [
            'hadir' => 'Hadir',
            'izin' => 'Izin',
            'sakit' => 'Sakit',
            'alpha' => 'Alpha',
        ];
        
        return $status[$this->status_kehadiran] ?? 'Tidak Diketahui';
    }

    /**
     * Cek apakah terlambat
     */
    public function getIsTerlambatAttribute()
    {
        $jamKerja = JamKerja::first();
        if (!$jamKerja || !$this->check_in) {
            return false;
        }
        
        $batasTerlambat = Carbon::parse($jamKerja->batas_terlambat);
        $checkIn = Carbon::parse($this->check_in);
        
        return $checkIn->gt($batasTerlambat);
    }

    /**
     * Hitung durasi kerja
     */
    public function getDurasiKerjaAttribute()
    {
        if (!$this->check_in || !$this->check_out) {
            return null;
        }
        
        $checkIn = Carbon::parse($this->check_in);
        $checkOut = Carbon::parse($this->check_out);
        
        return $checkIn->diffInHours($checkOut) . ' jam';
    }

    /**
     * Scope untuk presensi berdasarkan rentang tanggal
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal', [$startDate, $endDate]);
    }

    /**
     * Scope untuk presensi berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status_kehadiran', $status);
    }

    /**
     * Scope untuk presensi hari ini
     */
    public function scopeHariIni($query)
    {
        return $query->whereDate('tanggal', Carbon::today());
    }

    /**
     * Scope untuk presensi bulan ini
     */
    public function scopeBulanIni($query)
    {
        return $query->whereMonth('tanggal', Carbon::now()->month)
                     ->whereYear('tanggal', Carbon::now()->year);
    }
}
