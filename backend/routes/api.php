<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MentorController;
use App\Http\Controllers\Api\PesertaController;
use App\Http\Controllers\Api\DivisiController;
use App\Http\Controllers\Api\MateriPelatihanController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\JamKerjaController;
use App\Http\Controllers\Api\HariLiburController;
use Illuminate\Http\Request; // 🔥 TAMBAHKAN INI - IMPORT CLASS REQUEST
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

// ==================== PUBLIC ROUTES ====================
Route::post('/login', [AuthController::class, 'login']);
Route::get('/divisi-list', [MentorController::class, 'getDivisiList']);

// Route untuk akses file materi (PUBLIC)
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

// ==================== PROTECTED ROUTES (Harus Login) ====================
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
    
    // ==================== MENTOR ROUTES (CRUD - untuk Admin) ====================
    Route::get('/mentors', [MentorController::class, 'index']);
    Route::post('/mentors', [MentorController::class, 'store']);
    Route::put('/mentors/{id}', [MentorController::class, 'update']);
    Route::delete('/mentors/{id}', [MentorController::class, 'destroy']);
    Route::get('/mentor-list', [MentorController::class, 'getMentorList']);
    
    // ==================== PESERTA ROUTES (CRUD - untuk Admin/COO) ====================
    Route::get('/peserta', [PesertaController::class, 'index']);
    Route::post('/peserta', [PesertaController::class, 'store']);
    Route::put('/peserta/{id}', [PesertaController::class, 'update']);
    Route::delete('/peserta/{id}', [PesertaController::class, 'destroy']);
    
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
    
    // ==================== QUIZ ROUTES ====================
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
    
    // ==================== ROUTES SEDERHANA UNTUK MENTOR ====================
    
    // Dashboard sederhana untuk mentor
    Route::get('/mentor/dashboard', function (Request $request) {
        $user = $request->user();
        
        // Validasi role mentor
        if ($user->role !== 'mentor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        // Hitung jumlah peserta bimbingan
        $totalMentees = \App\Models\User::where('id_mentor', $user->id_user)
            ->where('role', 'peserta')
            ->count();
        
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
    
    // Notifikasi sederhana untuk mentor
    Route::get('/mentor/notifications', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'mentor') {
            return response()->json([], 403);
        }
        
        return response()->json([]);
    });
    
    // Daftar peserta bimbingan untuk mentor
    Route::get('/mentor/peserta', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'mentor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $peserta = \App\Models\User::where('id_mentor', $user->id_user)
            ->where('role', 'peserta')
            ->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $peserta->items(),
            'pagination' => [
                'current_page' => $peserta->currentPage(),
                'last_page' => $peserta->lastPage(),
                'per_page' => $peserta->perPage(),
                'total' => $peserta->total()
            ]
        ]);
    });
    
    // Detail profil untuk mentor
    Route::get('/mentor/profile', function (Request $request) {
        $user = $request->user();
        
        if ($user->role !== 'mentor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id_user,
                'nama' => $user->nama,
                'email' => $user->email,
                'no_telepon' => $user->no_telepon,
                'foto_profil' => $user->foto_profil,
                'role' => $user->role,
                'status_akun' => $user->status_akun
            ]
        ]);
    });
    
    // Update profil untuk mentor
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
        
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diupdate',
            'data' => $user
        ]);
    });
});

// ==================== FALLBACK ROUTE ====================
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Route not found'
    ], 404);
});