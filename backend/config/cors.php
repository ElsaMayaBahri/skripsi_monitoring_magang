<?php

return [
    'paths' => [
        'api/*', 
        'sanctum/csrf-cookie', 
        'login', 
        'logout', 
        'register', 
        'me', 
        'materi-file/*',
        'storage/*',  // 🔥 TAMBAHKAN INI untuk akses file storage
        'laporan/download/*',  // 🔥 TAMBAHKAN untuk download laporan
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:8000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Ubah ke true untuk mendukung credentials/token
    'supports_credentials' => true,
];