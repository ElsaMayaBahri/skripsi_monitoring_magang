<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class notifikasi extends Model
{
     use HasFactory;

    protected $table = 'notifikasis';
    protected $primaryKey = 'id_notifikasi';
    
    protected $fillable = [
        'id_user',
        'judul',
        'pesan',
        'status_baca',
    ];

    protected $casts = [
        'status_baca' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi ke User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    /**
     * Scope untuk notifikasi yang belum dibaca
     */
    public function scopeBelumDibaca($query)
    {
        return $query->where('status_baca', false);
    }

    /**
     * Scope untuk notifikasi yang sudah dibaca
     */
    public function scopeSudahDibaca($query)
    {
        return $query->where('status_baca', true);
    }

    /**
     * Scope untuk notifikasi user tertentu
     */
    public function scopeUntukUser($query, $userId)
    {
        return $query->where('id_user', $userId);
    }

    /**
     * Tandai sebagai sudah dibaca
     */
    public function tandaiDibaca()
    {
        $this->update([
            'status_baca' => true
        ]);
    }

    /**
     * Tandai sebagai belum dibaca
     */
    public function tandaiBelumDibaca()
    {
        $this->update([
            'status_baca' => false
        ]);
    }

    /**
     * Mendapatkan waktu notifikasi dalam format yang mudah dibaca
     */
    public function getWaktuAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}
