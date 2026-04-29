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
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $peserta = Peserta::with(['user', 'mentor.user', 'divisi'])->get();
            
            // Format response agar lebih rapi dan mencakup semua field
            $formattedPeserta = $peserta->map(function ($item) {
                return [
                    'id_peserta' => $item->id_peserta,
                    'id_user' => $item->id_user,
                    'nama' => $item->user->nama ?? null,
                    'email' => $item->user->email ?? null,
                    'no_telepon' => $item->user->no_telepon ?? null,
                    'status_akun' => $item->user->status_akun ?? 'non_aktif',
                    'asal_kampus' => $item->asal_kampus,
                    'prodi' => $item->prodi,
                    'tanggal_mulai' => $item->tanggal_mulai,
                    'tanggal_selesai' => $item->tanggal_selesai,
                    'status_magang' => $item->status_magang,
                    'id_divisi' => $item->id_divisi,
                    'divisi' => $item->divisi ? ($item->divisi->nama_divisi ?? null) : null,
                    'id_mentor' => $item->id_mentor,
                    'mentor' => $item->mentor ? ($item->mentor->user->nama ?? $item->mentor->nama ?? null) : null,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $formattedPeserta
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peserta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'no_telepon' => 'nullable|string|max:15',
                'asal_kampus' => 'nullable|string|max:255',
                'prodi' => 'nullable|string|max:255',
                'id_divisi' => 'nullable|exists:divisis,id_divisi',
                'id_mentor' => 'nullable|exists:mentors,id_mentor',
                'tanggal_mulai' => 'required|date',  // 🔥 TAMBAHKAN INI
                'tanggal_selesai' => 'nullable|date', // 🔥 TAMBAHKAN INI
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

            // 🔥 PERBAIKAN: Create peserta dengan semua field termasuk tanggal
            $peserta = Peserta::create([
                'id_user' => $user->id_user,
                'id_mentor' => $validated['id_mentor'] ?? null,
                'id_divisi' => $validated['id_divisi'] ?? null,
                'asal_kampus' => $validated['asal_kampus'] ?? null,
                'prodi' => $validated['prodi'] ?? null,
                'tanggal_mulai' => $validated['tanggal_mulai'],  // 🔥 TAMBAHKAN INI
                'tanggal_selesai' => $validated['tanggal_selesai'] ?? null,  // 🔥 TAMBAHKAN INI
                'status_magang' => 'aktif',
            ]);

            DB::commit();
            
            // Load relationships
            $peserta->load(['user', 'mentor.user', 'divisi']);
            
            return response()->json([
                'success' => true,
                'message' => 'Peserta berhasil ditambahkan',
                'data' => [
                    'id_peserta' => $peserta->id_peserta,
                    'id_user' => $peserta->id_user,
                    'nama' => $peserta->user->nama ?? null,
                    'email' => $peserta->user->email ?? null,
                    'no_telepon' => $peserta->user->no_telepon ?? null,
                    'status_akun' => $peserta->user->status_akun ?? 'aktif',
                    'asal_kampus' => $peserta->asal_kampus,
                    'prodi' => $peserta->prodi,
                    'tanggal_mulai' => $peserta->tanggal_mulai,
                    'tanggal_selesai' => $peserta->tanggal_selesai,
                    'status_magang' => $peserta->status_magang,
                    'id_divisi' => $peserta->id_divisi,
                    'divisi' => $peserta->divisi ? ($peserta->divisi->nama_divisi ?? null) : null,
                    'id_mentor' => $peserta->id_mentor,
                    'mentor' => $peserta->mentor ? ($peserta->mentor->user->nama ?? $peserta->mentor->nama ?? null) : null,
                ]
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

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $peserta = Peserta::with(['user', 'mentor.user', 'divisi'])
                ->where('id_peserta', $id)
                ->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id_peserta' => $peserta->id_peserta,
                    'id_user' => $peserta->id_user,
                    'nama' => $peserta->user->nama ?? null,
                    'email' => $peserta->user->email ?? null,
                    'no_telepon' => $peserta->user->no_telepon ?? null,
                    'status_akun' => $peserta->user->status_akun ?? 'non_aktif',
                    'asal_kampus' => $peserta->asal_kampus,
                    'prodi' => $peserta->prodi,
                    'tanggal_mulai' => $peserta->tanggal_mulai,
                    'tanggal_selesai' => $peserta->tanggal_selesai,
                    'status_magang' => $peserta->status_magang,
                    'id_divisi' => $peserta->id_divisi,
                    'divisi' => $peserta->divisi ? ($peserta->divisi->nama_divisi ?? null) : null,
                    'id_mentor' => $peserta->id_mentor,
                    'mentor' => $peserta->mentor ? ($peserta->mentor->user->nama ?? $peserta->mentor->nama ?? null) : null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peserta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $peserta = Peserta::with('user')->where('id_peserta', $id)->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan'
                ], 404);
            }
            
            $rules = [
                'nama' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . ($peserta->id_user ?? 'NULL') . ',id_user',
                'no_telepon' => 'nullable|string|max:15',
                'asal_kampus' => 'nullable|string|max:255',
                'prodi' => 'nullable|string|max:255',
                'id_divisi' => 'nullable|exists:divisis,id_divisi',
                'id_mentor' => 'nullable|exists:mentors,id_mentor',
                'status_akun' => 'nullable|in:aktif,non_aktif',
                'status_magang' => 'nullable|in:aktif,non_aktif',
                'tanggal_mulai' => 'sometimes|date',  // 🔥 TAMBAHKAN INI
                'tanggal_selesai' => 'nullable|date', // 🔥 TAMBAHKAN INI
            ];
            
            $request->validate($rules);
            
            DB::beginTransaction();
            
            // Update user jika ada data user
            if ($peserta->user) {
                $userData = [];
                if ($request->has('nama')) $userData['nama'] = $request->nama;
                if ($request->has('email')) $userData['email'] = $request->email;
                if ($request->has('no_telepon')) $userData['no_telepon'] = $request->no_telepon;
                if ($request->has('status_akun')) $userData['status_akun'] = $request->status_akun;
                
                if (!empty($userData)) {
                    $peserta->user->update($userData);
                }
            }
            
            // 🔥 PERBAIKAN: Update peserta termasuk tanggal
            $pesertaData = [];
            if ($request->has('asal_kampus')) $pesertaData['asal_kampus'] = $request->asal_kampus;
            if ($request->has('prodi')) $pesertaData['prodi'] = $request->prodi;
            if ($request->has('id_divisi')) $pesertaData['id_divisi'] = $request->id_divisi;
            if ($request->has('id_mentor')) $pesertaData['id_mentor'] = $request->id_mentor;
            if ($request->has('status_magang')) $pesertaData['status_magang'] = $request->status_magang;
            if ($request->has('tanggal_mulai')) $pesertaData['tanggal_mulai'] = $request->tanggal_mulai;  // 🔥 TAMBAHKAN INI
            if ($request->has('tanggal_selesai')) {
                $pesertaData['tanggal_selesai'] = $request->tanggal_selesai;  // 🔥 TAMBAHKAN INI
            } else if ($request->has('tanggal_selesai') && $request->tanggal_selesai === null) {
                $pesertaData['tanggal_selesai'] = null;
            }
            
            if (!empty($pesertaData)) {
                $peserta->update($pesertaData);
            }
            
            DB::commit();
            
            // Ambil data terbaru dengan relasi
            $updatedPeserta = Peserta::with(['user', 'mentor.user', 'divisi'])
                ->where('id_peserta', $id)
                ->first();
            
            return response()->json([
                'success' => true,
                'message' => 'Peserta berhasil diupdate',
                'data' => [
                    'id_peserta' => $updatedPeserta->id_peserta,
                    'id_user' => $updatedPeserta->id_user,
                    'nama' => $updatedPeserta->user->nama ?? null,
                    'email' => $updatedPeserta->user->email ?? null,
                    'no_telepon' => $updatedPeserta->user->no_telepon ?? null,
                    'status_akun' => $updatedPeserta->user->status_akun ?? 'non_aktif',
                    'asal_kampus' => $updatedPeserta->asal_kampus,
                    'prodi' => $updatedPeserta->prodi,
                    'tanggal_mulai' => $updatedPeserta->tanggal_mulai,
                    'tanggal_selesai' => $updatedPeserta->tanggal_selesai,
                    'status_magang' => $updatedPeserta->status_magang,
                    'id_divisi' => $updatedPeserta->id_divisi,
                    'divisi' => $updatedPeserta->divisi ? ($updatedPeserta->divisi->nama_divisi ?? null) : null,
                    'id_mentor' => $updatedPeserta->id_mentor,
                    'mentor' => $updatedPeserta->mentor ? ($updatedPeserta->mentor->user->nama ?? $updatedPeserta->mentor->nama ?? null) : null,
                ]
            ]);
            
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
                'message' => 'Gagal mengupdate peserta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $peserta = Peserta::where('id_peserta', $id)->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan'
                ], 404);
            }
            
            DB::beginTransaction();
            
            $userId = $peserta->id_user;
            
            // Delete peserta
            $peserta->delete();
            
            // Delete user associated with peserta
            if ($userId) {
                $user = User::where('id_user', $userId)->first();
                if ($user) {
                    $user->delete();
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Peserta berhasil dihapus'
            ]);
            
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus peserta: ' . $e->getMessage()
            ], 500);
        }
    }
}