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
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\MateriKompetensiController;
use App\Http\Controllers\Api\SertifikatController;

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
| PUBLIC FILE ACCESS - STORAGE FILES (URUTAN PENTING! PREVIEW/DOWNLOAD HARUS DI ATAS)
|--------------------------------------------------------------------------
*/

// !!! URUTAN PENTING !!!
// Route preview harus di ATAS route general /storage/{path}
// Karena Laravel membaca dari atas ke bawah

// Route untuk preview file (inline) - HARUS DI ATAS
Route::get('/storage/preview/{path}', function ($path) {
    $decodedPath = urldecode($path);
    $fullPath = storage_path('app/public/' . $decodedPath);
    
    if (!file_exists($fullPath)) {
        abort(404, 'File not found');
    }
    
    $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
    
    // Untuk PDF, tampilkan inline
    if ($extension === 'pdf') {
        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . basename($fullPath) . '"',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
    
    // Untuk gambar, tampilkan inline
    if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'])) {
        return response()->file($fullPath, [
            'Content-Type' => mime_content_type($fullPath),
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
    
    // Untuk file lain, force download
    return response()->download($fullPath, basename($fullPath), [
        'Access-Control-Allow-Origin' => '*',
    ]);
})->where('path', '.*');

// Route untuk download file - HARUS DI ATAS
Route::get('/storage/download/{path}', function ($path) {
    $decodedPath = urldecode($path);
    $fullPath = storage_path('app/public/' . $decodedPath);
    
    if (!file_exists($fullPath)) {
        abort(404, 'File not found');
    }
    
    return response()->download($fullPath, basename($fullPath), [
        'Access-Control-Allow-Origin' => '*',
    ]);
})->where('path', '.*');

// ==================== ROUTE DOWNLOAD LAPORAN AKHIR ====================
// Route untuk download laporan akhir dari folder laporan_akhir
Route::get('/laporan/download/{filename}', function ($filename) {
    // Cari file di folder storage/app/public/laporan_akhir/
    $path = 'laporan_akhir/' . $filename;
    $fullPath = storage_path('app/public/' . $path);
    
    if (!file_exists($fullPath)) {
        return response()->json([
            'success' => false,
            'message' => 'File tidak ditemukan'
        ], 404);
    }
    
    // Download file menggunakan response()->download() langsung dari path lengkap
    return response()->download($fullPath, $filename, [
        'Access-Control-Allow-Origin' => '*',
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'attachment; filename="' . $filename . '"',
    ]);
});

// Route untuk akses file storage umum - DITARUH PALING BAWAH
Route::get('/storage/{path}', function ($path) {
    $decodedPath = urldecode($path);
    $fullPath = storage_path('app/public/' . $decodedPath);
    
    if (!file_exists($fullPath)) {
        return response()->json([
            'success' => false,
            'message' => 'File not found'
        ], 404);
    }
    
    $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
    $mimeTypes = [
        'pdf' => 'application/pdf',
        'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
        'png' => 'image/png', 'gif' => 'image/gif',
        'webp' => 'image/webp', 'bmp' => 'image/bmp',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls' => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt' => 'application/vnd.ms-powerpoint',
        'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'zip' => 'application/zip',
        'rar' => 'application/x-rar-compressed',
    ];
    
    $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
    
    return response()->file($fullPath, [
        'Content-Type' => $mimeType,
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
    ]);
})->where('path', '.*');

/*
|--------------------------------------------------------------------------
| PUBLIC FILE ACCESS - MATERI PREVIEW
|--------------------------------------------------------------------------
*/

Route::get('/materi-file/{filename}', [MateriPelatihanController::class, 'previewFile'])
    ->where('filename', '.*');

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
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // ==================== DIVISI ROUTES ====================
    Route::get('/divisi', [DivisiController::class, 'index']);
    Route::post('/divisi', [DivisiController::class, 'store']);
    Route::put('/divisi/{id}', [DivisiController::class, 'update']);
    Route::delete('/divisi/{id}', [DivisiController::class, 'destroy']);

    // ==================== MENTOR ROUTES ====================
    Route::get('/mentors', [MentorController::class, 'index']);
    Route::post('/mentors', [MentorController::class, 'store']);
    Route::put('/mentors/{id}', [MentorController::class, 'update']);
    Route::delete('/mentors/{id}', [MentorController::class, 'destroy']);
    Route::get('/mentor-list', [MentorController::class, 'getMentorList']);
    
    // ==================== MENTOR PROFILE ROUTE (HANYA SATU - MENGGUNAKAN CONTROLLER) ====================
    Route::get('/mentor/profile', [MentorController::class, 'profile']);

    // ==================== PRESENSI ROUTES ====================
    Route::prefix('presensi')->group(function () {
        Route::get('/', [PresensiController::class, 'index']);
        Route::get('/stats', [PresensiController::class, 'getStats']);
        Route::get('/export', [PresensiController::class, 'export']);
        Route::get('/belum-absen', [PresensiController::class, 'belumAbsen']);
        Route::get('/{id}', [PresensiController::class, 'show']);
    });

    // ==================== PRESENSI MENTOR ROUTES ====================
    Route::prefix('mentor/presensi')->group(function () {
        Route::get('/', [PresensiController::class, 'index']);
        Route::get('/summary', [PresensiController::class, 'getStats']);
        Route::get('/export', [PresensiController::class, 'export']);
        Route::get('/date/{date}', [PresensiController::class, 'getByDate']);
        Route::get('/peserta/{pesertaId}', [PresensiController::class, 'getByPeserta']);
        Route::get('/stats', [PresensiController::class, 'getStats']);
    });

    // ==================== PESERTA ROUTES ====================
    Route::get('/peserta', [PesertaController::class, 'index']);
    Route::post('/peserta', [PesertaController::class, 'store']);
    Route::put('/peserta/{id}', [PesertaController::class, 'update']);
    Route::delete('/peserta/{id}', [PesertaController::class, 'destroy']);
    Route::get('/peserta/profile', [PesertaController::class, 'getProfile']);
    Route::get('/peserta/nilai-akhir', [NilaiController::class, 'getNilaiAkhirPeserta']);

    // ==================== PESERTA PRESENSI ROUTES ====================
    Route::prefix('peserta')->group(function () {
        Route::get('/presensi/today', [\App\Http\Controllers\Api\PresensiController::class, 'getTodayPresensi']);
        Route::get('/presensi', [\App\Http\Controllers\Api\PresensiController::class, 'getByPeserta']);
        Route::post('/presensi/checkin', [\App\Http\Controllers\Api\PresensiController::class, 'checkIn']);
        Route::post('/presensi/checkout', [\App\Http\Controllers\Api\PresensiController::class, 'checkOut']);
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

    // ==================== MATERI PELATIHAN ROUTES ====================
    Route::prefix('materi-pelatihan')->group(function () {
        Route::get('/', [MateriPelatihanController::class, 'index']);
        Route::post('/', [MateriPelatihanController::class, 'store']);
        Route::get('/{id}', [MateriPelatihanController::class, 'show']);
        Route::put('/{id}', [MateriPelatihanController::class, 'update']);
        Route::delete('/{id}', [MateriPelatihanController::class, 'destroy']);
        Route::get('/divisi/{divisi}', [MateriPelatihanController::class, 'getByDivisi']);
        Route::get('/{id}/download', [MateriPelatihanController::class, 'download']);
    });

    // ==================== MATERI MENTOR ROUTES ====================
    Route::prefix('mentor/materi')->group(function () {
        Route::get('/', [MateriMentorController::class, 'index']);
        Route::get('/mentor-info', [MateriMentorController::class, 'getMentorInfo']);
        Route::get('/divisi-list', [MateriMentorController::class, 'getDivisiList']);
        Route::post('/', [MateriMentorController::class, 'store']);
        Route::get('/{id}', [MateriMentorController::class, 'show']);
        Route::put('/{id}', [MateriMentorController::class, 'update']);
        Route::delete('/{id}', [MateriMentorController::class, 'destroy']);
    });

    // ==================== KUIS KOMPETENSI PESERTA ROUTES ====================
    Route::prefix('peserta')->group(function () {
        Route::get('/kuis-kompetensi', [QuizController::class, 'getDaftarKuisPeserta']);
        Route::get('/kuis-kompetensi/{id}/soal', [QuizController::class, 'getSoalForPeserta']);
        Route::post('/kuis-kompetensi/{id}/submit', [QuizController::class, 'submitKuisPeserta']);
    });

    // ==================== MATERI PESERTA ROUTES ====================
    Route::prefix('peserta/materi')->group(function () {
        Route::get('/', [MateriPesertaController::class, 'index']);
        Route::get('/{id}', [MateriPesertaController::class, 'show']);
        Route::post('/{id}/selesai', [MateriPesertaController::class, 'markAsSelesai']);
    });

    // ==================== TUGAS PESERTA ROUTES ====================
    Route::prefix('peserta/tugas')->group(function () {
        Route::get('/', [TugasController::class, 'getTugasPeserta']);
        Route::get('/{id}', [TugasController::class, 'getTugasDetail']);
        Route::post('/{id}/submit', [TugasController::class, 'submitTugas']);
        Route::post('/{id}/cancel', [TugasController::class, 'cancelSubmitTugas']);
    });

    // ==================== MATERI KOMPETENSI PESERTA ROUTES ====================
    Route::prefix('peserta/materi-kompetensi')->group(function () {
        Route::get('/', [MateriKompetensiController::class, 'index']);
        Route::get('/{id}', [MateriKompetensiController::class, 'show']);
        Route::post('/{id}/akses', [MateriKompetensiController::class, 'markAsAccessed']);
        Route::get('/{id}/download', [MateriKompetensiController::class, 'download']);
    });

    // ==================== TUGAS MENTOR ROUTES ====================
    Route::prefix('mentor/tugas')->group(function () {
        Route::get('/', [TugasController::class, 'index']);
        Route::post('/', [TugasController::class, 'store']);
        
        Route::get('/submissions', [TugasController::class, 'getSubmissionByPeserta']);
        
        Route::get('/{id}', [TugasController::class, 'show']);
        Route::put('/{id}', [TugasController::class, 'update']);
        Route::delete('/{id}', [TugasController::class, 'destroy']);
        Route::post('/reminder', [TugasController::class, 'sendReminder']);
        Route::post('/{id}/reminder', [TugasController::class, 'sendReminder']);
        Route::get('/{id}/submissions', [TugasController::class, 'getSubmissions']);
        Route::put('/submissions/{id}', [TugasController::class, 'updateSubmission']);
    });

    Route::get('/mentor/peserta', [TugasController::class, 'getPesertaByMentor']);

    // ==================== LAPORAN AKHIR MENTOR ROUTES ====================
    Route::prefix('mentor/laporan-akhir')->group(function () {
        Route::get('/', [LaporanAkhirController::class, 'index']);
        Route::get('/export', [LaporanAkhirController::class, 'export']);
        Route::get('/{id}', [LaporanAkhirController::class, 'show']);
        Route::post('/{id}/review', [LaporanAkhirController::class, 'submitReview']);
        Route::get('/{id}/download', [LaporanAkhirController::class, 'download']);
    });

    // ==================== LAPORAN AKHIR PESERTA ROUTES ====================
    Route::prefix('peserta')->group(function () {
        Route::get('/laporan-akhir', [LaporanAkhirController::class, 'getPesertaLaporan']);
        Route::post('/laporan-akhir', [LaporanAkhirController::class, 'storePesertaLaporan']);
        Route::delete('/laporan-akhir', [LaporanAkhirController::class, 'deletePesertaLaporan']);
    });

    // ==================== NILAI MENTOR ROUTES ====================
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
        Route::get('/results/all', [QuizController::class, 'getAllResults']);
        Route::get('/results/export', [QuizController::class, 'exportResults']);
        Route::get('/results/quiz/{quizId}', [QuizController::class, 'getResultsByQuiz']);
        Route::post('/import', [QuizController::class, 'import']);
        Route::get('/template', [QuizController::class, 'downloadTemplate']);
        Route::get('/divisi/{divisi}', [QuizController::class, 'getByDivisi']);
        Route::get('/{id}', [QuizController::class, 'show']);
        Route::put('/{id}', [QuizController::class, 'update']);
        Route::delete('/{id}', [QuizController::class, 'destroy']);
        Route::get('/', [QuizController::class, 'index']);
        Route::post('/', [QuizController::class, 'store']);
    });

    // ==================== JAWABAN KUIS ROUTES ====================
    Route::prefix('jawaban-kuis')->group(function () {
        Route::get('/all', [QuizController::class, 'getAllJawabanKuis']);
        Route::get('/user/{userId}', [QuizController::class, 'getJawabanKuisByUser']);
    });

    // ==================== SERTIFIKAT ROUTES ====================
Route::prefix('sertifikat')->group(function () {
    // ROUTE SPESIFIK HARUS DI ATAS ROUTE DENGAN PARAMETER {id}
    Route::get('/templates', [SertifikatController::class, 'getTemplates']);
    Route::post('/templates', [SertifikatController::class, 'storeTemplate']);
    Route::post('/templates/{id}', [SertifikatController::class, 'updateTemplate']); // UPDATE - PAKAI POST
    Route::put('/templates/{id}/toggle-status', [SertifikatController::class, 'toggleTemplateStatus']);
    Route::delete('/templates/{id}', [SertifikatController::class, 'deleteTemplate']);
    Route::get('/templates/download/{id}', [SertifikatController::class, 'downloadTemplate']);
    Route::get('/magang/template', [SertifikatController::class, 'getMagangTemplate']);
    Route::get('/peserta-info', [SertifikatController::class, 'getSertifikatPeserta']);
    Route::get('/download/{id}', [SertifikatController::class, 'downloadSertifikat']);
    Route::get('/download-all', [SertifikatController::class, 'downloadAllSertifikat']);
    Route::get('/force-regenerate/{userId}', [SertifikatController::class, 'forceRegenerate']);
    Route::get('/check', [SertifikatController::class, 'checkCertificateType']);
    Route::get('/', [SertifikatController::class, 'getSertifikat']);
    Route::get('/{id}', [SertifikatController::class, 'getSertifikatById']);
});

    // Sertifikat untuk peserta (KOMPETENSI)
    Route::prefix('peserta')->group(function () {
        Route::get('/sertifikat-kompetensi-info', [SertifikatController::class, 'getSertifikatPeserta']);
        Route::post('/sertifikat-kompetensi/generate', [SertifikatController::class, 'generateSertifikatPeserta']);
        Route::get('/sertifikat-kompetensi/download/{id}', [SertifikatController::class, 'downloadSertifikatPeserta']);
        Route::post('/sertifikat-magang/generate', [SertifikatController::class, 'generateSertifikatMagang']);
        Route::get('/sertifikat-magang/download/{id}', [SertifikatController::class, 'downloadSertifikatPeserta']);
    });

    // ==================== ROUTES UNTUK MENTOR ====================
    Route::get('/mentor/filters', [MentorController::class, 'getFilters']);
    Route::get('/mentor/peserta-list', [MentorController::class, 'getPesertaList']);
    Route::get('/mentor/pesertas', [MentorController::class, 'getMyPesertas']);
    Route::get('/mentor/pesertas/{id_peserta}', [MentorController::class, 'getDetailPeserta']);
    
    // ==================== DAILY REPORT ROUTES ====================
    Route::prefix('daily-report')->group(function () {
        Route::get('/', [DailyReportController::class, 'getReports']);
        Route::get('/export', [DailyReportController::class, 'exportExcel']);
        Route::get('/{peserta_id}', [DailyReportController::class, 'getReportDetail']);
        Route::post('/{peserta_id}/feedback', [DailyReportController::class, 'submitFeedback']);
    });

    // ==================== DASHBOARD MENTOR ROUTES ====================
    Route::get('/mentor/dashboard', function (Request $request) {
        $user = $request->user();
        if ($user->role !== 'mentor') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        $mentor = \App\Models\Mentor::where('id_user', $user->id_user)->first();
        $totalMentees = $mentor ? \App\Models\Peserta::where('id_mentor', $mentor->id_mentor)->count() : 0;
        return response()->json([
            'success' => true,
            'stats' => [
                'totalMentees' => $totalMentees,
                'pendingValidations' => 0,
                'completedTasks' => 0,
                'averageScore' => 0,
                'attendanceRate' => 0,
                'pendingTasks' => 0
            ],
            'recentActivities' => [],
            'upcomingDeadlines' => []
        ]);
    });

    // ==================== DASHBOARD PESERTA ROUTES ====================
    Route::get('/peserta/dashboard', [PesertaController::class, 'dashboard']);

    Route::get('/mentor/notifications', function () {
        return response()->json([]);
    });

    // ==================== PROFILE UPDATE ROUTES ====================
    Route::put('/mentor/profile', [MentorController::class, 'updateProfile']);
    
    // ==================== NOTIFIKASI ROUTES ====================
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::patch('/notifikasi/read-all', [NotifikasiController::class, 'markAllAsRead']);
    Route::patch('/notifikasi/{id}/read', [NotifikasiController::class, 'markAsRead']);
    Route::delete('/notifikasi/{id}', [NotifikasiController::class, 'destroy']);
});

// ==================== FALLBACK ROUTE ====================
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Route not found'
    ], 404);
});