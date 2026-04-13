<?php

namespace App\Http\Responses;

class LoginResponse
{
    public static function success($user, $token)
    {
        $redirect = match($user->role) {
            'admin' => '/admin/dashboard',
            'coo', 'mentor' => '/coo/dashboard',
            'peserta' => '/peserta/dashboard',
            default => '/dashboard'
        };

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => [
                'id' => $user->id_user,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'status_akun' => $user->status_akun,
                'foto_profil' => $user->foto_profil,
            ],
            'role' => $user->role,
            'redirect' => $redirect,
        ], 200);
    }

    public static function error($message, $status = 401)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $status);
    }

    public static function validationError($errors)
    {
        return response()->json([
            'success' => false,
            'message' => 'Validasi gagal',
            'errors' => $errors,
        ], 422);
    }
}