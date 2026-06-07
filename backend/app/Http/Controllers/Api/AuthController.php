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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Mail;

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

    /**
     * Update user profile including photo
     */
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
            $file = $request->file('foto_profil');
            
            Log::info('Uploading photo', [
                'user_id' => $user->id_user,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'file_mime' => $file->getMimeType()
            ]);
            
            if ($user->foto_profil && Storage::disk('public')->exists($user->foto_profil)) {
                Storage::disk('public')->delete($user->foto_profil);
                Log::info('Old photo deleted', ['old_path' => $user->foto_profil]);
            }
            
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
            $path = $file->storeAs('profile-photos', $filename, 'public');
            
            Log::info('Photo saved', ['new_path' => $path]);
            
            $user->foto_profil = $path;
        }

        $user->save();
        $user->refresh();

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

    /**
     * Change user password
     */
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

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $email = $request->email;
        $user = User::where('email', $email)->first();

        DB::table('password_reset_tokens')->where('email', $email)->delete();

        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => $token,
            'created_at' => Carbon::now()
        ]);

        try {
            Mail::to($email)->send(new ResetPasswordMail($user->nama, $token, $email));
        } catch (\Exception $e) {
            Log::error('Gagal kirim email reset password: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email. Silakan coba lagi.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Link reset password telah dikirim ke email Anda.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|min:6|confirmed'
        ]);

        $email = $request->email;
        $token = $request->token;

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('token', $token)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Token reset password tidak valid atau sudah kadaluarsa.'
            ], 400);
        }

        if (Carbon::parse($resetRecord->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Link reset password sudah kadaluarsa. Silakan request ulang.'
            ], 400);
        }

        $user = User::where('email', $email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $email)->delete();
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset. Silakan login dengan password baru.'
        ]);
    }
}