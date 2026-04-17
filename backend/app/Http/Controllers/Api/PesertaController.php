<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peserta;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PesertaController extends Controller
{
    public function index()
    {
        $peserta = Peserta::with(['user', 'mentor.user', 'divisi'])->get();
        return response()->json([
            'success' => true,
            'data' => $peserta
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'no_telepon' => 'nullable|string',
                'asal_kampus' => 'nullable|string',
                'prodi' => 'nullable|string',
                'id_divisi' => 'nullable|exists:divisis,id_divisi',
                'id_mentor' => 'nullable|exists:mentors,id_mentor',
            ]);

            DB::beginTransaction();
            
            // Create user
            $user = User::create([
                'nama' => $validated['nama'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'no_telepon' => $validated['no_telepon'] ?? null,
                'role' => 'peserta',
                'status_akun' => 'aktif',
            ]);

            // Create peserta
            $peserta = Peserta::create([
                'id_user' => $user->id_user,
                'id_mentor' => $validated['id_mentor'] ?? null,
                'id_divisi' => $validated['id_divisi'] ?? null,
                'asal_kampus' => $validated['asal_kampus'] ?? null,
                'prodi' => $validated['prodi'] ?? null,
                'tanggal_mulai' => now(),
                'status_magang' => 'aktif',
            ]);

            DB::commit();
            
            // Load relationships
            $peserta->load(['user', 'mentor.user', 'divisi']);
            
            return response()->json([
                'success' => true,
                'message' => 'Peserta berhasil ditambahkan',
                'data' => $peserta
            ], 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan peserta: ' . $e->getMessage()
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        $peserta = Peserta::with('user')->findOrFail($id);
        
        $request->validate([
            'nama' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $peserta->id_user . ',id_user',
            'no_telepon' => 'nullable|string',
            'asal_kampus' => 'nullable|string',
            'prodi' => 'nullable|string',
            'id_divisi' => 'nullable|exists:divisis,id_divisi',
            'id_mentor' => 'nullable|exists:mentors,id_mentor',
            'status_akun' => 'nullable|in:aktif,non_aktif',
            'status_magang' => 'nullable|in:aktif,non_aktif',
        ]);

        DB::beginTransaction();
        try {
            // Update user
            if ($request->has('nama') || $request->has('email') || $request->has('no_telepon') || $request->has('status_akun')) {
                $userData = [];
                if ($request->has('nama')) $userData['nama'] = $request->nama;
                if ($request->has('email')) $userData['email'] = $request->email;
                if ($request->has('no_telepon')) $userData['no_telepon'] = $request->no_telepon;
                if ($request->has('status_akun')) $userData['status_akun'] = $request->status_akun;
                
                $peserta->user->update($userData);
            }
            
            // Update peserta
            $pesertaData = [];
            if ($request->has('asal_kampus')) $pesertaData['asal_kampus'] = $request->asal_kampus;
            if ($request->has('prodi')) $pesertaData['prodi'] = $request->prodi;
            if ($request->has('id_divisi')) $pesertaData['id_divisi'] = $request->id_divisi;
            if ($request->has('id_mentor')) $pesertaData['id_mentor'] = $request->id_mentor;
            if ($request->has('status_magang')) $pesertaData['status_magang'] = $request->status_magang;
            
            $peserta->update($pesertaData);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Peserta berhasil diupdate',
                'data' => $peserta->fresh(['user', 'mentor', 'divisi'])
            ]);
            
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate peserta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $peserta = Peserta::findOrFail($id);
        
        DB::beginTransaction();
        try {
            // Delete user associated with peserta
            if ($peserta->id_user) {
                User::find($peserta->id_user)->delete();
            }
            $peserta->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Peserta berhasil dihapus'
            ]);
            
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus peserta',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}