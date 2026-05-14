<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Responses\LoginResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return LoginResponse::error('Email atau password salah', 401);
        }

        if (!Hash::check($validated['password'], $user->password)) {
            return LoginResponse::error('Email atau password salah', 401);
        }

        if ($user->status_akun === 'non_aktif') {
            return LoginResponse::error('Akun Anda tidak aktif. Silakan hubungi administrator.', 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token', [$user->role])->plainTextToken;
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
                'no_telepon' => $user->no_telepon,
                'alamat' => $user->alamat,
            ],
            'role' => $user->role,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'nama' => 'nullable|string|max:100',
            'no_telepon' => 'nullable|string|max:15',
            'alamat' => 'nullable|string',
            'foto_profil' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->has('nama')) {
            $user->nama = $request->nama;
        }

        if ($request->has('no_telepon')) {
            $user->no_telepon = $request->no_telepon;
        }

        if ($request->has('alamat')) {
            $user->alamat = $request->alamat;
        }

        if ($request->hasFile('foto_profil')) {
            // Hapus foto lama jika ada
            if ($user->foto_profil && Storage::disk('public')->exists($user->foto_profil)) {
                Storage::disk('public')->delete($user->foto_profil);
            }
            
            $path = $request->file('foto_profil')->store('profile-photos', 'public');
            $user->foto_profil = $path;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diupdate',
            'user' => [
                'id' => $user->id_user,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'status_akun' => $user->status_akun,
                'foto_profil' => $user->foto_profil,
                'no_telepon' => $user->no_telepon,
                'alamat' => $user->alamat,
            ]
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password saat ini salah'
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah'
        ]);
    }
}