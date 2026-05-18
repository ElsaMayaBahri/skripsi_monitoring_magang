<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MentorController;
use App\Http\Controllers\Api\PesertaController;
use App\Http\Controllers\Api\DivisiController;
use App\Http\Controllers\Api\MateriPelatihanController;
use App\Http\Controllers\Api\MateriMentorController;
use App\Http\Controllers\Api\MateriPesertaController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\JamKerjaController;
use App\Http\Controllers\Api\HariLiburController;
use App\Http\Controllers\Api\DailyReportController;
use App\Http\Controllers\Api\TugasController;
use App\Http\Controllers\Api\LaporanAkhirController;
use App\Http\Controllers\Api\NilaiController;
use App\Http\Controllers\Api\PresensiController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\LaporanController;     
use App\Http\Controllers\Api\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/sanctum/csrf-cookie', function () {
    return response()->json([
        'message' => 'CSRF cookie set'
    ]);
});

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

// Endpoint untuk mendapatkan daftar divisi (bisa diakses publik)
Route::get('/divisi-list', [MentorController::class, 'getDivisiList']);

// Endpoint untuk mendapatkan divisi aktif saja (untuk dropdown form)
Route::get('/divisi/aktif', [DivisiController::class, 'getActiveDivisi']);

/*
|--------------------------------------------------------------------------
| PUBLIC FILE ACCESS
|--------------------------------------------------------------------------
*/

Route::get('/materi-file/{filename}', function ($filename) {
    // Daftar path yang akan dicari (prioritas dari spesifik ke umum)
    $paths = [
        storage_path('app/public/materi_mentor/documents/' . $filename),
        storage_path('app/public/materi_mentor/videos/' . $filename),
        storage_path('app/public/materi_mentor/' . $filename),
        storage_path('app/public/materi/' . $filename),
        storage_path('app/public/' . $filename),
    ];

    $filePath = null;

    foreach ($paths as $path) {
        if (file_exists($path)) {
            $filePath = $path;
            break;
        }
    }

    if (!$filePath) {
        return response()->json([
            'error' => 'File not found',
            'file' => $filename,
            'searched_paths' => [
                'materi_mentor/documents/' . $filename,
                'materi_mentor/videos/' . $filename,
                'materi_mentor/' . $filename,
                'materi/' . $filename,
                $filename
            ]
        ], 404);
    }

    $mime = mime_content_type($filePath);

    $headers = [
        'Content-Type' => $mime,
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers' => '*',
        'Cache-Control' => 'public, max-age=86400',
    ];

    if ($mime === 'application/pdf') {
        $headers['Content-Disposition'] = 'inline; filename="' . $filename . '"';
    }

    return response()->file($filePath, $headers);
})->where('filename', '.*');

// 🔥 ROUTE BARU UNTUK AKSES FILE TUGAS (PREVIEW/DOWNLOAD)
Route::get('/file/{filename}', function ($filename) {
    $paths = [
        storage_path('app/public/tugas/' . $filename),
        storage_path('app/public/' . $filename),
    ];

    $filePath = null;

    foreach ($paths as $path) {
        if (file_exists($path)) {
            $filePath = $path;
            break;
        }
    }

    if (!$filePath) {
        return response()->json([
            'error' => 'File not found'
        ], 404);
    }

    $mime = mime_content_type($filePath);

    return response()->file($filePath, [
        'Content-Type' => $mime,
        'Access-Control-Allow-Origin' => '*',
    ]);
})->where('filename', '.*');

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // ==================== AUTH ROUTES ====================
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    
    // ==================== DIVISI ROUTES ====================
    Route::get('/divisi', [DivisiController::class, 'index']);
    Route::post('/divisi', [DivisiController::class, 'store']);
    Route::put('/divisi/{id}', [DivisiController::class, 'update']);
    Route::delete('/divisi/{id}', [DivisiController::class, 'destroy']);
    
    // ==================== MENTOR ROUTES (CRUD - untuk Admin) ====================
    Route::get('/mentors', [MentorController::class, 'index']);
    Route::post('/mentors', [MentorController::class, 'store']);
    Route::put('/mentors/{id}', [MentorController::class, 'update']);
    Route::delete('/mentors/{id}', [MentorController::class, 'destroy']);

    Route::get('/mentor-list', [MentorController::class, 'getMentorList']);

    // ==================== PRESENSI ROUTES (untuk COO/Admin) ====================
    Route::prefix('presensi')->group(function () {
        Route::get('/', [PresensiController::class, 'index']);
        Route::get('/stats', [PresensiController::class, 'getStats']);
        Route::get('/export', [PresensiController::class, 'export']);
        Route::get('/{id}', [PresensiController::class, 'show']);
    });
    
    // ==================== PESERTA ROUTES (CRUD - untuk Admin/COO) ====================
    Route::get('/peserta', [PesertaController::class, 'index']);
    Route::post('/peserta', [PesertaController::class, 'store']);
    Route::put('/peserta/{id}', [PesertaController::class, 'update']);
    Route::delete('/peserta/{id}', [PesertaController::class, 'destroy']);
    
    // ==================== PESERTA PROFILE ROUTES ====================
    Route::get('/peserta/profile', [PesertaController::class, 'getProfile']);
    
    // ==================== PESERTA PRESENSI ROUTES ====================
    Route::prefix('peserta')->group(function () {
        // Presensi routes
        Route::get('/presensi', [PresensiController::class, 'getByPeserta']);
        Route::get('/presensi/today', [PresensiController::class, 'getTodayPresensi']);
        Route::post('/presensi/checkin', [PresensiController::class, 'checkIn']);
        Route::post('/presensi/checkout', [PresensiController::class, 'checkOut']);
    });
    
    // ==================== JAM KERJA ROUTES ====================
    Route::prefix('jam-kerja')->group(function () {
        Route::get('/', [JamKerjaController::class, 'index']);
        Route::post('/', [JamKerjaController::class, 'store']);
        Route::put('/{id}', [JamKerjaController::class, 'update']);
        Route::delete('/{id}', [JamKerjaController::class, 'destroy']);
    });

    // ==================== HARI LIBUR ROUTES ====================
    Route::prefix('hari-libur')->group(function () {
        Route::get('/', [HariLiburController::class, 'index']);
        Route::post('/', [HariLiburController::class, 'store']);
        Route::put('/{id}', [HariLiburController::class, 'update']);
        Route::delete('/{id}', [HariLiburController::class, 'destroy']);
    });
    
    // ==================== MATERI PELATIHAN ROUTES (untuk COO/Admin) ====================
    Route::prefix('materi-pelatihan')->group(function () {
        Route::get('/', [MateriPelatihanController::class, 'index']);
        Route::post('/', [MateriPelatihanController::class, 'store']);
        Route::get('/{id}', [MateriPelatihanController::class, 'show']);
        Route::put('/{id}', [MateriPelatihanController::class, 'update']);
        Route::delete('/{id}', [MateriPelatihanController::class, 'destroy']);
        Route::get('/divisi/{divisi}', [MateriPelatihanController::class, 'getByDivisi']);
        Route::get('/{id}/download', [MateriPelatihanController::class, 'download']);
    });
    
    // ==================== MATERI MENTOR ROUTES (untuk Mentor) ====================
    Route::prefix('mentor/materi')->group(function () {
        Route::get('/', [MateriMentorController::class, 'index']);
        Route::get('/divisi-list', [MateriMentorController::class, 'getDivisiList']);
        Route::post('/', [MateriMentorController::class, 'store']);
        Route::get('/{id}', [MateriMentorController::class, 'show']);
        Route::put('/{id}', [MateriMentorController::class, 'update']);
        Route::delete('/{id}', [MateriMentorController::class, 'destroy']);
    });
    
    // ==================== MATERI PESERTA ROUTES (untuk Peserta) ====================
    Route::prefix('peserta')->group(function () {
        Route::get('/materi', [MateriPesertaController::class, 'index']);
        Route::get('/materi/{id}', [MateriPesertaController::class, 'show']);
        Route::post('/materi/{id}/selesai', [MateriPesertaController::class, 'markAsSelesai']);
    });
    
    // ==================== TUGAS MENTOR ROUTES ====================
    Route::prefix('mentor/tugas')->group(function () {
        Route::get('/', [TugasController::class, 'index']);
        Route::post('/', [TugasController::class, 'store']);
        Route::get('/{id}', [TugasController::class, 'show']);
        Route::put('/{id}', [TugasController::class, 'update']);
        Route::delete('/{id}', [TugasController::class, 'destroy']);
        Route::post('/reminder', [TugasController::class, 'sendReminder']);
        Route::post('/{id}/reminder', [TugasController::class, 'sendReminder']);
        Route::get('/{id}/submissions', [TugasController::class, 'getSubmissions']);
        Route::put('/submissions/{id}', [TugasController::class, 'updateSubmission']);
    });
    
    // ==================== LAPORAN AKHIR MENTOR ROUTES ====================
    Route::prefix('mentor/laporan-akhir')->group(function () {
        Route::get('/', [LaporanAkhirController::class, 'index']);
        Route::post('/{id}/review', [LaporanAkhirController::class, 'submitReview']);
        Route::get('/export', [LaporanAkhirController::class, 'export']);
    });
    
    // ==================== NILAI MENTOR ROUTES (BARU) ====================
    Route::prefix('mentor/nilai')->group(function () {
        Route::get('/', [NilaiController::class, 'index']);
        Route::post('/', [NilaiController::class, 'store']);
        Route::post('/{id}/finalize', [NilaiController::class, 'finalize']);
        Route::get('/export', [NilaiController::class, 'export']);
    });
    
    // ==================== ACTIVITY LOGS ROUTES ====================
    Route::prefix('activity-logs')->group(function () {
        Route::get('/', [ActivityLogController::class, 'index']);
        Route::post('/', [ActivityLogController::class, 'store']);
    });
    
    // ==================== QUIZ ROUTES ====================
    Route::prefix('quiz')->group(function () {
        Route::get('/', [QuizController::class, 'index']);
        Route::get('/results/all', [QuizController::class, 'getAllResults']);
        Route::post('/', [QuizController::class, 'store']);
        Route::get('/{id}', [QuizController::class, 'show']);
        Route::put('/{id}', [QuizController::class, 'update']);
        Route::delete('/{id}', [QuizController::class, 'destroy']);
        Route::get('/divisi/{divisi}', [QuizController::class, 'getByDivisi']);
        Route::post('/import', [QuizController::class, 'import']);
        Route::get('/template/download', [QuizController::class, 'downloadTemplate']);
    });
    
    // ==================== ROUTES UNTUK MENTOR (PESERTA BIMBINGAN) ====================
    
    // Filter options untuk mentor
    Route::get('/mentor/filters', [MentorController::class, 'getFilters']);
    
    // Daftar peserta bimbingan dengan filter
    Route::get('/mentor/peserta-list', [MentorController::class, 'getPesertaList']);
    
    // Peserta bimbingan mentor (detail)
    Route::get('/mentor/pesertas', [MentorController::class, 'getMyPesertas']);
    Route::get('/mentor/pesertas/{id_peserta}', [MentorController::class, 'getDetailPeserta']);
    
    // ==================== DAILY REPORT ROUTES ====================
    Route::prefix('daily-report')->group(function () {
        Route::get('/', [DailyReportController::class, 'getReports']);
        Route::get('/export', [DailyReportController::class, 'exportExcel']);
        Route::get('/{peserta_id}', [DailyReportController::class, 'getReportDetail']);
        Route::post('/{peserta_id}/feedback', [DailyReportController::class, 'submitFeedback']);
    });
    
    // ==================== ROUTES DASHBOARD MENTOR ====================
    
    Route::get('/mentor/dashboard', [MentorController::class, 'dashboard']);
    
    // Route untuk statistik mentor (profile)
    Route::get('/mentor/stats', [MentorController::class, 'getStats']);
    
    // 🔥 PERBAIKAN: Route profile mentor - SEKARANG PAKAI METHOD CONTROLLER, BUKAN CLOSURE
    Route::get('/mentor/profile', [MentorController::class, 'profile']);
    
    Route::get('/mentor/notifications', [MentorController::class, 'getNotifications']);
    
    // ==================== MENTOR PROFILE UPDATE ROUTE ====================
    Route::put('/mentor/profile', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'mentor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        if ($request->has('nama')) {
            $user->nama = $request->nama;
        }
        
        if ($request->has('no_telepon')) {
            $user->no_telepon = $request->no_telepon;
        }
        
        if ($request->has('alamat')) {
            $user->alamat = $request->alamat;
        }
        
        if ($request->has('keahlian')) {
            $user->keahlian = $request->keahlian;
        }
        
        if ($request->has('pengalaman')) {
            $user->pengalaman = $request->pengalaman;
        }
        
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diupdate',
            'data' => $user
        ]);
    });
    
    // ==================== MENTOR PROFILE PHOTO ROUTES ====================
    // Upload foto profil mentor
    Route::post('/mentor/profile/photo', [MentorController::class, 'updateProfilePhoto']);
    
    // Hapus foto profil mentor
    Route::delete('/mentor/profile/photo', [MentorController::class, 'deleteProfilePhoto']);
});

// ==================== FALLBACK ROUTE ====================
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Route not found'
    ], 404);
});