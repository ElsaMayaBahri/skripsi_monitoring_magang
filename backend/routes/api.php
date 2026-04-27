<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MentorController;
use App\Http\Controllers\Api\PesertaController;
use App\Http\Controllers\Api\DivisiController;
use App\Http\Controllers\Api\MateriPelatihanController;
use Illuminate\Support\Facades\Route;


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
    
    // ================= MATERI PELATIHAN ROUTES =================
    Route::get('/materi', [MateriPelatihanController::class, 'index']);
    Route::post('/materi', [MateriPelatihanController::class, 'store']);
    Route::get('/materi/{id}', [MateriPelatihanController::class, 'show']);
    Route::put('/materi/{id}', [MateriPelatihanController::class, 'update']);
    Route::delete('/materi/{id}', [MateriPelatihanController::class, 'destroy']);
    Route::get('/materi-divisi/{divisi}', [MateriPelatihanController::class, 'getByDivisi']);
    
    
    // Additional list
    Route::get('/mentor-list', [MentorController::class, 'getMentorList']);
});