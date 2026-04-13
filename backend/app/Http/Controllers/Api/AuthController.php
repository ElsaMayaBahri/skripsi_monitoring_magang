<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Responses\LoginResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        // Cari user berdasarkan email
        $user = User::where('email', $validated['email'])->first();

        // Cek user exists
        if (!$user) {
            return LoginResponse::error('Email atau password salah', 401);
        }

        // Cek password
        if (!Hash::check($validated['password'], $user->password)) {
            return LoginResponse::error('Email atau password salah', 401);
        }

        // Cek status akun
        if ($user->status_akun === 'non_aktif') {
            return LoginResponse::error('Akun Anda tidak aktif. Silakan hubungi administrator.', 403);
        }

        // Hapus token lama
        $user->tokens()->delete();

        // Buat token baru
        $token = $user->createToken('auth_token', [$user->role])->plainTextToken;

        // Login menggunakan guard
        Auth::login($user);

        return LoginResponse::success($user, $token);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id_user,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'status_akun' => $user->status_akun,
                'foto_profil' => $user->foto_profil,
            ],
            'role' => $user->role,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'nama' => 'sometimes|string|max:100',
            'foto_profil' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->has('nama')) {
            $user->nama = $request->nama;
        }

        if ($request->hasFile('foto_profil')) {
            $path = $request->file('foto_profil')->store('profile-photos', 'public');
            $user->foto_profil = $path;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diupdate',
            'user' => $user
        ]);
    }
}