<?php

// app/Models/Notifikasi.php
// CATATAN: Ganti nama class dari "notifikasi" (huruf kecil) menjadi "Notifikasi" (PascalCase)
// agar sesuai konvensi Laravel dan bisa di-resolve dengan benar oleh Eloquent.

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    use HasFactory;

    protected $table      = 'notifikasis';
    protected $primaryKey = 'id_notifikasi';

    protected $fillable = [
        'id_user',
        'judul',
        'pesan',
        'status_baca',
    ];

    protected $casts = [
        'status_baca' => 'boolean',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];

    // ─── Relasi ──────────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeBelumDibaca($query)
    {
        return $query->where('status_baca', false);
    }

    public function scopeSudahDibaca($query)
    {
        return $query->where('status_baca', true);
    }

    public function scopeUntukUser($query, $userId)
    {
        return $query->where('id_user', $userId);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function tandaiDibaca(): void
    {
        $this->update(['status_baca' => true]);
    }

    public function tandaiBelumDibaca(): void
    {
        $this->update(['status_baca' => false]);
    }

    // ─── Accessor ────────────────────────────────────────────────────────────

    /**
     * Waktu relatif (misal: "2 menit yang lalu")
     */
    public function getWaktuAttribute(): string
    {
        return $this->created_at ? $this->created_at->diffForHumans() : '-';
    }
}
