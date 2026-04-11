<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mentor extends Model
{
    use HasFactory;

    protected $table = 'mentors';
    protected $primaryKey = 'id_mentor';
    
    protected $fillable = [
        'id_user',
        'id_divisi',
        'jabatan',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function divisi()
    {
        return $this->belongsTo(Divisi::class, 'id_divisi', 'id_divisi');
    }

    public function pesertas()
    {
        return $this->hasMany(Peserta::class, 'id_mentor', 'id_mentor');
    }
}