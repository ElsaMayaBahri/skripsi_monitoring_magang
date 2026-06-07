<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Reset Password</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #00897b, #00acc1); padding: 24px 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; }
        .body { padding: 32px; }
        .button { display: inline-block; background: #00897b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
        .warning { font-size: 12px; color: #dc2626; margin-top: 16px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Sistem Monitoring Magang</h1>
    </div>
    <div class="body">
        <p>Halo <strong>{{ $namaUser }}</strong>,</p>
        <p>Kami menerima permintaan untuk mengatur ulang password akun Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
        <p style="text-align: center;">
            <a href="{{ $frontendUrl }}/reset-password?token={{ $token }}&email={{ urlencode($email) }}" class="button">Reset Password</a>
        </p>
        <p>Jika Anda tidak merasa meminta reset password, abaikan email ini.</p>
        <p class="warning">Link ini akan kadaluarsa dalam 60 menit.</p>
    </div>
    <div class="footer">
        &copy; {{ date('Y') }} Sistem Monitoring Magang. Semua hak dilindungi.
    </div>
</div>
</body>
</html>