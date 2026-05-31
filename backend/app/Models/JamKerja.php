<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JamKerja extends Model
{
    use HasFactory;

    protected $table = 'jam_kerjas';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'jam_masuk',
        'jam_pulang',
        'batas_terlambat'
    ];
    
    protected $casts = [
        'batas_terlambat' => 'integer',
        'jam_masuk' => 'string',
        'jam_pulang' => 'string',
    ];
    
    // Mutator untuk memastikan format waktu selalu dengan detik
    public function setJamMasukAttribute($value)
    {
        if (strlen($value) == 5) {
            $this->attributes['jam_masuk'] = $value . ':00';
        } else {
            $this->attributes['jam_masuk'] = $value;
        }
    }
    
    public function setJamPulangAttribute($value)
    {
        if (strlen($value) == 5) {
            $this->attributes['jam_pulang'] = $value . ':00';
        } else {
            $this->attributes['jam_pulang'] = $value;
        }
    }
    
    // Accessor untuk mengembalikan format tanpa detik (HH:MM)
    public function getJamMasukAttribute($value)
    {
        if ($value && strlen($value) >= 5) {
            return substr($value, 0, 5);
        }
        return $value;
    }
    
    public function getJamPulangAttribute($value)
    {
        if ($value && strlen($value) >= 5) {
            return substr($value, 0, 5);
        }
        return $value;
    }
}