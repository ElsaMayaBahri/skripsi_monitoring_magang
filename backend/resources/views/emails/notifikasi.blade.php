<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{{ $judulNotifikasi }}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 28px 32px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; }
    .greeting { font-size: 15px; color: #374151; margin-bottom: 16px; }
    .card { background: #f0f9ff; border-left: 4px solid #2563eb; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
    .card .label { font-size: 11px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .card .judul { font-size: 16px; font-weight: 700; color: #1e3a5f; margin-bottom: 8px; }
    .card .pesan { font-size: 14px; color: #374151; line-height: 1.6; }
    .footer { background: #f8fafc; padding: 18px 32px; border-top: 1px solid #e5e7eb; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 0; }
    .footer a { color: #2563eb; text-decoration: none; }
    .waktu { font-size: 12px; color: #9ca3af; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Sistem Monitoring Magang</h1>
      <p>Notifikasi untuk Anda</p>
    </div>
    <div class="body">
      <p class="greeting">Halo, <strong>{{ $namaUser }}</strong>!</p>
      <div class="card">
        <div class="label">Notifikasi Baru</div>
        <div class="judul">{{ $judulNotifikasi }}</div>
        <div class="pesan">{{ $pesanNotifikasi }}</div>
      </div>
      <p class="waktu">Dikirim pada: {{ now('Asia/Jakarta')->translatedFormat('d F Y, H:i') }} WIB</p>
    </div>
    <div class="footer">
      <p>Email ini dikirim otomatis oleh <strong>Sistem Monitoring Magang</strong>.</p>
      <p style="margin-top: 4px;">Jangan balas email ini.</p>
    </div>
  </div>
</body>
</html>