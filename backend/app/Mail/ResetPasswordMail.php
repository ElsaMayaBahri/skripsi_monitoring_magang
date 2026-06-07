<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $namaUser;
    public string $token;
    public string $email;
    public string $frontendUrl;

    public function __construct(string $namaUser, string $token, string $email)
    {
        $this->namaUser = $namaUser;
        $this->token = $token;
        $this->email = $email;
        $this->frontendUrl = config('app.frontend_url', 'http://localhost:5173');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Atur Ulang Password - Sistem Monitoring Magang',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reset-password',
        );
    }
}