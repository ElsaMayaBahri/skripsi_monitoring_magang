<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MentorController;
use App\Http\Controllers\Api\PesertaController;
use App\Http\Controllers\Api\DivisiController;
use App\Http\Controllers\Api\MateriPelatihanController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\JamKerjaController;
use App\Http\Controllers\Api\HariLiburController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Route untuk mengambil CSRF cookie 
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/divisi-list', [MentorController::class, 'getDivisiList']);

// 🔥 ROUTE UNTUK AKSES FILE MATERI (PUBLIC)
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
        return response()->json(['error' => 'File not found'], 404);
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

// Protected routes 
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // Divisi routes
    Route::get('/divisi', [DivisiController::class, 'index']);
    Route::post('/divisi', [DivisiController::class, 'store']);
    Route::put('/divisi/{id}', [DivisiController::class, 'update']);
    Route::delete('/divisi/{id}', [DivisiController::class, 'destroy']);
    
    // Mentor routes
    Route::get('/mentors', [MentorController::class, 'index']);
    Route::post('/mentors', [MentorController::class, 'store']);     
    Route::put('/mentors/{id}', [MentorController::class, 'update']);
    Route::delete('/mentors/{id}', [MentorController::class, 'destroy']);
    
    // Peserta routes
    Route::get('/peserta', [PesertaController::class, 'index']);
    Route::post('/peserta', [PesertaController::class, 'store']);
    Route::put('/peserta/{id}', [PesertaController::class, 'update']);
    Route::delete('/peserta/{id}', [PesertaController::class, 'destroy']);
    
    // 🔥 JAM KERJA ROUTES (Working Hours)
    Route::prefix('jam-kerja')->group(function () {
        Route::get('/', [JamKerjaController::class, 'index']);
        Route::post('/', [JamKerjaController::class, 'store']);
        Route::put('/{id}', [JamKerjaController::class, 'update']);
        Route::delete('/{id}', [JamKerjaController::class, 'destroy']);
    });
    
    // 🔥 HARI LIBUR ROUTES (Holidays)
    Route::prefix('hari-libur')->group(function () {
        Route::get('/', [HariLiburController::class, 'index']);
        Route::post('/', [HariLiburController::class, 'store']);
        Route::put('/{id}', [HariLiburController::class, 'update']);
        Route::delete('/{id}', [HariLiburController::class, 'destroy']);
    });
    
    // Materi Pelatihan routes
    Route::prefix('materi-pelatihan')->group(function () {
        Route::get('/', [MateriPelatihanController::class, 'index']);
        Route::post('/', [MateriPelatihanController::class, 'store']);
        Route::get('/{id}', [MateriPelatihanController::class, 'show']);
        Route::put('/{id}', [MateriPelatihanController::class, 'update']);
        Route::post('/{id}', [MateriPelatihanController::class, 'update']);
        Route::delete('/{id}', [MateriPelatihanController::class, 'destroy']);
        Route::get('/divisi/{divisi}', [MateriPelatihanController::class, 'getByDivisi']);
        Route::get('/{id}/download', [MateriPelatihanController::class, 'download']);
    });
    
    // 🔥 QUIZ ROUTES
    Route::prefix('quiz')->group(function () {
        Route::get('/', [QuizController::class, 'index']);
        Route::post('/', [QuizController::class, 'store']);
        Route::get('/{id}', [QuizController::class, 'show']);
        Route::put('/{id}', [QuizController::class, 'update']);
        Route::delete('/{id}', [QuizController::class, 'destroy']);
        Route::get('/divisi/{divisi}', [QuizController::class, 'getByDivisi']);
        Route::post('/import', [QuizController::class, 'import']);
        Route::get('/template/download', [QuizController::class, 'downloadTemplate']);
    });
    
    // Additional list
    Route::get('/mentor-list', [MentorController::class, 'getMentorList']);
});

// Fallback untuk route yang tidak ditemukan
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Route not found'
    ], 404);
});