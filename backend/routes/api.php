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
    $paths = [
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
            'error' => 'File not found'
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

    Route::get('/mentor/dashboard', [MentorController::class, 'dashboard']);
    Route::get('/mentor/peserta-list', [MentorController::class, 'getPesertaList']);
    Route::get('/mentor/pesertas', [MentorController::class, 'getMyPesertas']);
    Route::get('/mentor/pesertas/{id}', [MentorController::class, 'getDetailPeserta']);
    Route::get('/mentor/filters', [MentorController::class, 'getFilters']);
    Route::get('/mentor/notifications', [MentorController::class, 'getNotifications']);

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
    | MENTOR MATERI ROUTES
    |--------------------------------------------------------------------------
    */

    Route::get('/mentor/materi', [MateriMentorController::class, 'index']);
    Route::post('/mentor/materi', [MateriMentorController::class, 'store']);
    Route::get('/mentor/materi/{id}', [MateriMentorController::class, 'show']);
    Route::put('/mentor/materi/{id}', [MateriMentorController::class, 'update']);
    Route::delete('/mentor/materi/{id}', [MateriMentorController::class, 'destroy']);
    Route::get('/mentor/materi/divisi-list', [MateriMentorController::class, 'getDivisiList']);

    /*
    |--------------------------------------------------------------------------
    | MENTOR NILAI ROUTES
    |--------------------------------------------------------------------------
    */

    Route::prefix('mentor')->group(function () {
        // Nilai routes
        Route::get('/nilai', [App\Http\Controllers\Api\NilaiController::class, 'index']);
        Route::post('/nilai', [App\Http\Controllers\Api\NilaiController::class, 'store']);
        Route::post('/nilai/{id}/finalize', [App\Http\Controllers\Api\NilaiController::class, 'finalize']);
        Route::get('/nilai/export', [App\Http\Controllers\Api\NilaiController::class, 'export']);
    });

    /*
    |--------------------------------------------------------------------------
    | MENTOR LAPORAN AKHIR ROUTES
    |--------------------------------------------------------------------------
    */

    Route::prefix('mentor')->group(function () {
        Route::get('/laporan-akhir', [LaporanAkhirController::class, 'index']);
        Route::get('/laporan-akhir/{id}', [LaporanAkhirController::class, 'show']);
        Route::post('/laporan-akhir/{id}/review', [LaporanAkhirController::class, 'submitReview']);
        Route::get('/laporan-akhir/export', [LaporanAkhirController::class, 'export']);
    });

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