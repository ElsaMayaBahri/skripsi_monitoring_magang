<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

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

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'id_peserta' => 'integer',
            'id_mentor' => 'integer',
        ];
    }

    // Relasi
    public function peserta()
    {
        return $this->belongsTo(Peserta::class, 'id_peserta', 'id_peserta');
    }

    public function mentor()
    {
        return $this->belongsTo(Mentor::class, 'id_mentor', 'id_mentor');
    }

    // Method untuk mengecek role
    public function isCoo(): bool
    {
        return $this->role === 'coo';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isMentor(): bool
    {
        return $this->role === 'mentor';
    }

    public function isPeserta(): bool
    {
        return $this->role === 'peserta';
    }

    // Method untuk mengecek status akun
    public function isAktif(): bool
    {
        return $this->status_akun === 'aktif';
    }

    public function isNonAktif(): bool
    {
        return $this->status_akun === 'non_aktif';
    }

    // Method untuk mengubah status akun
    public function aktifkanAkun(): void
    {
        $this->update(['status_akun' => 'aktif']);
    }

    public function nonAktifkanAkun(): void
    {
        $this->update(['status_akun' => 'non_aktif']);
    }

    // Method untuk mengubah role
    public function ubahRole(string $role): void
    {
        if (in_array($role, ['coo', 'admin', 'mentor', 'peserta'])) {
            $this->update(['role' => $role]);
        }
    }

    // Method untuk verifikasi email
    public function hasVerifiedEmail(): bool
    {
        return ! is_null($this->email_verified_at);
    }

    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    public function sendEmailVerificationNotification(): void
    {
        // Kirim notifikasi verifikasi email
        $this->notify(new \Illuminate\Auth\Notifications\VerifyEmail);
    }

    // Method untuk password reset
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \Illuminate\Auth\Notifications\ResetPassword($token));
    }

    // Scope untuk filtering
    public function scopeAktif($query)
    {
        return $query->where('status_akun', 'aktif');
    }

    public function scopeNonAktif($query)
    {
        return $query->where('status_akun', 'non_aktif');
    }

    public function scopeRoleCoo($query)
    {
        return $query->where('role', 'coo');
    }

    public function scopeRoleAdmin($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeRoleMentor($query)
    {
        return $query->where('role', 'mentor');
    }

    public function scopeRolePeserta($query)
    {
        return $query->where('role', 'peserta');
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    public function scopeUnverified($query)
    {
        return $query->whereNull('email_verified_at');
    }
}