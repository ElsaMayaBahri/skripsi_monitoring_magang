<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NotifikasiMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $judulNotifikasi;
    public string $pesanNotifikasi;
    public string $namaUser;

    public function __construct(string $namaUser, string $judul, string $pesan)
    {
        $this->namaUser        = $namaUser;
        $this->judulNotifikasi = $judul;
        $this->pesanNotifikasi = $pesan;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[Sistem Magang] ' . $this->judulNotifikasi,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.notifikasi',
        );
    }

    public function attachments(): array 
    {
        return [];
    }
}