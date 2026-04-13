<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'id_user';
    
    protected $fillable = [
        'id_peserta',
        'id_mentor',
        'nama',
        'email',
        'password',
        'role',
        'status_akun',
        'foto_profil',
        'remember_token',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relasi
    public function peserta()
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id_peserta');
    }

    public function mentor()
    {
        return $this->belongsTo(Mentor::class, 'id_mentor', 'id_mentor');
    }

    // Role check methods
    public function isCoo(): bool { return $this->role === 'coo'; }
    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function isMentor(): bool { return $this->role === 'mentor'; }
    public function isPeserta(): bool { return $this->role === 'peserta'; }
    public function isAktif(): bool { return $this->status_akun === 'aktif'; }
}