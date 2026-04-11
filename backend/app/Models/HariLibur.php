<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class HariLibur extends Model
{
    use HasFactory;

    protected $table = 'hari_liburs';
    protected $primaryKey = 'id_libur';
    
    protected $fillable = [
        'tanggal',
        'keterangan',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Cek apakah suatu tanggal adalah hari libur
     */
    public static function isLibur($tanggal)
    {
        return self::whereDate('tanggal', $tanggal)->exists();
    }

    /**
     * Scope untuk libur pada bulan tertentu
     */
    public function scopeBulan($query, $bulan, $tahun = null)
    {
        $tahun = $tahun ?? Carbon::now()->year;
        return $query->whereMonth('tanggal', $bulan)
                     ->whereYear('tanggal', $tahun);
    }

    /**
     * Scope untuk libur pada tahun tertentu
     */
    public function scopeTahun($query, $tahun)
    {
        return $query->whereYear('tanggal', $tahun);
    }

    /**
     * Mendapatkan tanggal libur dalam format array
     */
    public static function getLiburDates($tahun = null)
    {
        $tahun = $tahun ?? Carbon::now()->year;
        return self::whereYear('tanggal', $tahun)
                   ->pluck('tanggal')
                   ->map(function($date) {
                       return $date->format('Y-m-d');
                   })
                   ->toArray();
    }
}
