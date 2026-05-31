<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SertifikatTemplate extends Model
{
    use HasFactory;

    protected $table = 'sertifikat_templates';

    protected $fillable = [
        'nama_template',
        'jenis_sertifikat',
        'divisi_id',
        'bidang_kompetensi',
        'file_path',
        'file_name',
        'file_extension',
        'file_size',
        'is_active',
        'keterangan'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'file_size' => 'integer'
    ];

    public function divisi()
    {
        return $this->belongsTo(Divisi::class, 'divisi_id', 'id_divisi');
    }

    public function sertifikats()
    {
        return $this->hasMany(Sertifikat::class, 'template_id', 'id');
    }

    public function getFileUrlAttribute()
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }
}