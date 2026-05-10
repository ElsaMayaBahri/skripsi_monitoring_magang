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

Route::get('/divisi-list', [MentorController::class, 'getDivisiList']);

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

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    /*
    |--------------------------------------------------------------------------
    | DIVISI
    |--------------------------------------------------------------------------
    */

    Route::get('/divisi', [DivisiController::class, 'index']);
    Route::post('/divisi', [DivisiController::class, 'store']);
    Route::put('/divisi/{id}', [DivisiController::class, 'update']);
    Route::delete('/divisi/{id}', [DivisiController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | MENTOR CRUD
    |--------------------------------------------------------------------------
    */

    Route::get('/mentors', [MentorController::class, 'index']);
    Route::post('/mentors', [MentorController::class, 'store']);
    Route::put('/mentors/{id}', [MentorController::class, 'update']);
    Route::delete('/mentors/{id}', [MentorController::class, 'destroy']);

    Route::get('/mentor-list', [MentorController::class, 'getMentorList']);

    /*
    |--------------------------------------------------------------------------
    | PESERTA CRUD
    |--------------------------------------------------------------------------
    */

    Route::get('/peserta', [PesertaController::class, 'index']);
    Route::post('/peserta', [PesertaController::class, 'store']);

    /*
    |--------------------------------------------------------------------------
    | PRESENSI STATISTICS
    |--------------------------------------------------------------------------
    */

    Route::get('/presensi/stats', [PresensiController::class, 'getStats']);

    /*
    |--------------------------------------------------------------------------
    | ACTIVITY LOGS
    |--------------------------------------------------------------------------
    */

    Route::get('/activity-logs', [ActivityLogController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | QUIZ RESULTS ALL
    |--------------------------------------------------------------------------
    */

    Route::get('/quiz/results/all', [QuizController::class, 'getAllResults']);

    /*
    |--------------------------------------------------------------------------
    | PESERTA DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::prefix('peserta')->group(function () {
        Route::get('/dashboard', [PesertaController::class, 'dashboard']);
        Route::get('/profile', [PesertaController::class, 'getProfile']);
        Route::put('/profile', [PesertaController::class, 'updateProfile']);
        Route::get('/presensi', [PesertaController::class, 'getPresensi']);
        Route::get('/notifications', [PesertaController::class, 'getNotifications']);
        Route::get('/nilai-akhir', [PesertaController::class, 'getNilaiAkhir']);

        Route::prefix('tugas')->group(function () {
            Route::get('/', [TugasController::class, 'getPesertaTugas']);
            Route::get('/{id}', [TugasController::class, 'getPesertaTugasDetail']);
            Route::post('/{id}/submit', [TugasController::class, 'submitTugas']);
        });

        Route::prefix('presensi')->group(function () {
            Route::get('/', [PresensiController::class, 'getByPeserta']);
            Route::post('/checkin', [PresensiController::class, 'checkIn']);
            Route::post('/checkout', [PresensiController::class, 'checkOut']);
        });

        Route::put('/{id}', [PesertaController::class, 'update']);
        Route::delete('/{id}', [PesertaController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | MATERI PELATIHAN (COO)
    |--------------------------------------------------------------------------
    */

    Route::get('/materi-pelatihan', [MateriPelatihanController::class, 'index']);
    Route::post('/materi-pelatihan', [MateriPelatihanController::class, 'store']);
    Route::get('/materi-pelatihan/{id}', [MateriPelatihanController::class, 'show']);
    Route::post('/materi-pelatihan/{id}', [MateriPelatihanController::class, 'update']);
    Route::delete('/materi-pelatihan/{id}', [MateriPelatihanController::class, 'destroy']);
    Route::get('/materi-pelatihan/{id}/download', [MateriPelatihanController::class, 'download']);
    Route::get('/materi-pelatihan/divisi/{divisi}', [MateriPelatihanController::class, 'getByDivisi']);

    /*
    |--------------------------------------------------------------------------
    | COO DETAIL PESERTA ROUTES
    |--------------------------------------------------------------------------
    */

    Route::prefix('coo')->group(function () {
        Route::get('/peserta/{id}/detail', [PesertaController::class, 'getDetailForCOO']);
        Route::get('/peserta/{id}/kehadiran', [PesertaController::class, 'getKehadiranForCOO']);
        Route::get('/peserta/{id}/progress-tugas', [PesertaController::class, 'getProgressTugasForCOO']);
        Route::get('/peserta/{id}/hasil-kuis', [PesertaController::class, 'getHasilKuisForCOO']);
        Route::get('/peserta/{id}/laporan-akhir', [PesertaController::class, 'getLaporanAkhirForCOO']);
        Route::get('/peserta/{id}/statistik', [PesertaController::class, 'getStatistikForCOO']);
        Route::get('/peserta/{id}/aktivitas', [PesertaController::class, 'getAktivitasForCOO']);
    });

    /*
    |--------------------------------------------------------------------------
    | PRESENSI (COO)
    |--------------------------------------------------------------------------
    */

    Route::get('/presensi', [PresensiController::class, 'index']);
    Route::get('/presensi/export', [PresensiController::class, 'export']);
    Route::get('/presensi/{id}', [PresensiController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | QUIZ (COO)
    |--------------------------------------------------------------------------
    */

    Route::get('/quiz', [QuizController::class, 'index']);
    Route::post('/quiz', [QuizController::class, 'store']);
    Route::get('/quiz/{id}', [QuizController::class, 'show']);
    Route::put('/quiz/{id}', [QuizController::class, 'update']);
    Route::delete('/quiz/{id}', [QuizController::class, 'destroy']);
    Route::get('/quiz/template', [QuizController::class, 'downloadTemplate']);

    /*
    |--------------------------------------------------------------------------
    | JAM KERJA (COO)
    |--------------------------------------------------------------------------
    */

    Route::get('/jam-kerja', [JamKerjaController::class, 'index']);
    Route::post('/jam-kerja', [JamKerjaController::class, 'store']);
    Route::put('/jam-kerja/{id}', [JamKerjaController::class, 'update']);
    Route::delete('/jam-kerja/{id}', [JamKerjaController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | HARI LIBUR (COO)
    |--------------------------------------------------------------------------
    */

    Route::get('/hari-libur', [HariLiburController::class, 'index']);
    Route::post('/hari-libur', [HariLiburController::class, 'store']);
    Route::put('/hari-libur/{id}', [HariLiburController::class, 'update']);
    Route::delete('/hari-libur/{id}', [HariLiburController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | MENTOR ROUTES
    |--------------------------------------------------------------------------
    */

    Route::prefix('mentor')->group(function () {
        Route::get('/dashboard', [MentorController::class, 'dashboard']);
        Route::get('/peserta-list', [MentorController::class, 'getPesertaList']);
        Route::get('/pesertas', [MentorController::class, 'getMyPesertas']);
        Route::get('/pesertas/{id}', [MentorController::class, 'getDetailPeserta']);
        Route::get('/filters', [MentorController::class, 'getFilters']);
        Route::get('/notifications', [MentorController::class, 'getNotifications']);
        Route::get('/peserta', [TugasController::class, 'getPesertaByMentor']);
        
        // Tugas Routes
        Route::get('/tugas', [TugasController::class, 'index']);
        Route::post('/tugas', [TugasController::class, 'store']);
        Route::get('/tugas/{id}', [TugasController::class, 'show']);
        Route::put('/tugas/{id}', [TugasController::class, 'update']);
        Route::delete('/tugas/{id}', [TugasController::class, 'destroy']);
        
        // Materi Routes
        Route::get('/materi', [MateriMentorController::class, 'index']);
        Route::post('/materi', [MateriMentorController::class, 'store']);
        Route::get('/materi/{id}', [MateriMentorController::class, 'show']);
        Route::put('/materi/{id}', [MateriMentorController::class, 'update']);
        Route::delete('/materi/{id}', [MateriMentorController::class, 'destroy']);
        Route::get('/materi/divisi-list', [MateriMentorController::class, 'getDivisiList']);
        
        // Nilai Routes
        Route::get('/nilai', [NilaiController::class, 'index']);
        Route::post('/nilai', [NilaiController::class, 'store']);
        Route::post('/nilai/{id}/finalize', [NilaiController::class, 'finalize']);
        Route::get('/nilai/export', [NilaiController::class, 'export']);
        
        // Laporan Akhir Routes - PASTIKAN INI ADA
        Route::get('/laporan-akhir', [LaporanAkhirController::class, 'index']);
        Route::get('/laporan-akhir/{id}', [LaporanAkhirController::class, 'show']);
        Route::get('/laporan-akhir/{id}/download', [LaporanAkhirController::class, 'download']);
        Route::post('/laporan-akhir/{id}/review', [LaporanAkhirController::class, 'submitReview']);
        Route::get('/laporan-akhir/export', [LaporanAkhirController::class, 'export']); // ← ROUTE EXPORT
    });

    /*
    |--------------------------------------------------------------------------
    | DAILY REPORT ROUTES (MENTOR)
    |--------------------------------------------------------------------------
    */

    Route::prefix('daily-report')->group(function () {
        Route::get('/', [DailyReportController::class, 'getReports']);
        Route::get('/export', [DailyReportController::class, 'exportExcel']);
        Route::get('/{peserta_id}', [DailyReportController::class, 'getReportDetail']);
        Route::post('/{peserta_id}/feedback', [DailyReportController::class, 'submitFeedback']);
    });

    /*
    |--------------------------------------------------------------------------
    | TUGAS REMINDER
    |--------------------------------------------------------------------------
    */

    Route::post('/tugas/reminder', [TugasController::class, 'sendReminder']);
    Route::post('/tugas/{id}/reminder', [TugasController::class, 'sendReminder']);

}); // ← TUTUP Route::middleware('auth:sanctum')

/*
|--------------------------------------------------------------------------
| FALLBACK
|--------------------------------------------------------------------------
*/

Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Route not found'
    ], 404);
});