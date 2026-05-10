<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class JamKerja extends Model
{
    use HasFactory;

    protected $table = 'jam_kerjas';
    protected $primaryKey = 'id_jam_kerja';
    
    protected $fillable = [
        'jam_masuk',
        'jam_pulang',
        'batas_terlambat',
    ];

    protected $casts = [
        'jam_masuk' => 'string',
        'jam_pulang' => 'string',
        'batas_terlambat' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Mendapatkan konfigurasi jam kerja (hanya ada 1 record)
     */
    public static function getConfig()
    {
        return self::first();
    }

    /**
     * Cek apakah waktu check in terlambat
     * batas_terlambat dalam format waktu (H:i:s)
     */
    public function isTerlambat($checkInTime)
    {
        $batasWaktu = Carbon::parse($this->batas_terlambat);
        $checkIn = Carbon::parse($checkInTime);
        
        return $checkIn->gt($batasWaktu);
    }

    /**
     * Hitung keterlambatan dalam menit
     */
    public function hitungKeterlambatan($checkInTime)
    {
        if (!$this->isTerlambat($checkInTime)) {
            return 0;
        }
        
        $batasWaktu = Carbon::parse($this->batas_terlambat);
        $checkIn = Carbon::parse($checkInTime);
        
        return $batasWaktu->diffInMinutes($checkIn);
    }

    /**
     * Cek apakah check out lebih awal
     */
    public function isPulangCepat($checkOutTime)
    {
        $jamPulang = Carbon::parse($this->jam_pulang);
        $checkOut = Carbon::parse($checkOutTime);
        
        return $checkOut->lt($jamPulang);
    }
}