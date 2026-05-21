<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JawabanKuis extends Model
{
    use HasFactory;

    protected $table = 'jawaban_kuis';
    protected $primaryKey = 'id_jawaban';
    
    protected $fillable = [
        'id_soal',
        'id_user',
        'id_kuis',
        'jawaban',
        'skor',
        'attempt',
    ];

    protected $casts = [
        'skor' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi ke SoalKuis
     */
    public function soal()
    {
        return $this->belongsTo(SoalKuis::class, 'id_soal', 'id_soal');
    }

    /**
     * Relasi ke User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    /**
     * Relasi ke Kuis
     */
    public function kuis()
    {
        return $this->belongsTo(Kuis::class, 'id_kuis', 'id_kuis');
    }

    /**
     * Scope untuk jawaban user pada kuis tertentu
     */
    public function scopeByUserAndKuis($query, $userId, $kuisId)
    {
        return $query->where('id_user', $userId)
                     ->where('id_kuis', $kuisId);
    }

    /**
     * Mendapatkan total skor user untuk kuis tertentu
     */
    public static function getTotalSkor($userId, $kuisId)
    {
        return self::byUserAndKuis($userId, $kuisId)->sum('skor');
    }
}
