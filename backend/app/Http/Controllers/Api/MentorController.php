<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Mentor;
use App\Models\Divisi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MentorController extends Controller
{
    // Mendapatkan semua mentor
    public function index()
    {
        $mentors = User::with('mentor.divisi')
            ->where('role', 'mentor')
            ->get()
            ->map(function ($user) {
                return [
                    'id_mentor' => $user->mentor ? $user->mentor->id_mentor : null,  // 🔥 TAMBAHKAN id_mentor
                    'id_user' => $user->id_user,
                    'email' => $user->email,
                    'name' => $user->nama,
                    'nama' => $user->nama,  // 🔥 TAMBAHKAN alias name/nama
                    'phone' => $user->no_telepon,
                    'no_telepon' => $user->no_telepon,
                    'divisi' => $user->mentor && $user->mentor->divisi ? $user->mentor->divisi->nama_divisi : '',
                    'id_divisi' => $user->mentor ? $user->mentor->id_divisi : null,  // 🔥 TAMBAHKAN id_divisi
                    'jabatan' => $user->mentor ? $user->mentor->jabatan : '',
                    'status' => $user->status_akun === 'aktif',
                    'status_akun' => $user->status_akun,  // 🔥 TAMBAHKAN status_akun
                    'role' => $user->role,
                    'initials' => $this->getInitials($user->nama),
                    'user' => [  // 🔥 TAMBAHKAN object user untuk kompatibilitas frontend
                        'id_user' => $user->id_user,
                        'nama' => $user->nama,
                        'email' => $user->email,
                        'no_telepon' => $user->no_telepon,
                        'status_akun' => $user->status_akun,
                        'role' => $user->role
                    ]
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $mentors
        ]);
    }

    // Mendapatkan list divisi untuk dropdown
    public function getDivisiList()
    {
        $divisi = Divisi::all(['id_divisi', 'nama_divisi']);
        return response()->json([
            'success' => true,
            'data' => $divisi
        ]);
    }

    public function getMentorList()
    {
        $mentors = Mentor::with('user')->get();
        
        $formattedMentors = $mentors->map(function($mentor) {
            return [
                'id_mentor' => $mentor->id_mentor,  // 🔥 PASTIKAN ID MENTOR ADA
                'id_user' => $mentor->id_user,
                'nama' => $mentor->user ? $mentor->user->nama : null,
                'email' => $mentor->user ? $mentor->user->email : null,
                'no_telepon' => $mentor->user ? $mentor->user->no_telepon : null,
                'status_akun' => $mentor->user ? $mentor->user->status_akun : null,
                'id_divisi' => $mentor->id_divisi,
                'jabatan' => $mentor->jabatan,
                'divisi' => $mentor->divisi ? $mentor->divisi->nama_divisi : null,
                'user' => $mentor->user  // 🔥 SERTAKAN USER OBJECT
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $formattedMentors
        ]);
    }

    // Menambahkan mentor baru
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'divisi' => 'nullable|string|exists:divisis,nama_divisi',
            'jabatan' => 'nullable|string|max:100',
            'status' => 'boolean'
        ]);

        try {
            DB::beginTransaction();

            // 1. Cari id_divisi berdasarkan nama
            $id_divisi = null;
            if ($request->divisi) {
                $divisi = Divisi::where('nama_divisi', $request->divisi)->first();
                if ($divisi) {
                    $id_divisi = $divisi->id_divisi;
                }
            }

            // 2. Buat user
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nama' => $request->name,
                'no_telepon' => $request->phone,
                'role' => 'mentor',
                'status_akun' => $request->status ? 'aktif' : 'non_aktif',
            ]);

            // 3. Buat mentor
            $mentor = Mentor::create([
                'id_user' => $user->id_user,
                'id_divisi' => $id_divisi,
                'jabatan' => $request->jabatan,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mentor berhasil ditambahkan',
                'data' => [
                    'id_mentor' => $mentor->id_mentor,  // 🔥 KEMBALIKAN id_mentor
                    'id_user' => $user->id_user,
                    'email' => $user->email,
                    'name' => $user->nama,
                    'phone' => $user->no_telepon,
                    'divisi' => $request->divisi,
                    'id_divisi' => $id_divisi,
                    'jabatan' => $request->jabatan,
                    'status' => $user->status_akun === 'aktif',
                    'status_akun' => $user->status_akun,
                    'initials' => $this->getInitials($user->nama),
                    'user' => [  // 🔥 SERTAKAN USER OBJECT
                        'id_user' => $user->id_user,
                        'nama' => $user->nama,
                        'email' => $user->email,
                        'no_telepon' => $user->no_telepon,
                        'status_akun' => $user->status_akun,
                        'role' => $user->role
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan mentor: ' . $e->getMessage()
            ], 500);
        }
    }

    // Update mentor
    public function update(Request $request, $id)
    {
        $user = User::where('id_user', $id)->where('role', 'mentor')->firstOrFail();

        $request->validate([
            'email'     => ['required', 'email', Rule::unique('users', 'email')->ignore($id, 'id_user')],
            'name'      => 'required|string|max:255',
            'phone'     => 'nullable|string|max:20',
            'divisi'    => 'nullable|string|exists:divisis,nama_divisi',
            'jabatan'   => 'nullable|string|max:100',
            'status'    => 'nullable|boolean',
            'status_akun' => 'nullable|in:aktif,non_aktif',
        ]);

        try {
            DB::beginTransaction();

            // Resolve status_akun
            $statusAkun = 'aktif';
            if ($request->has('status')) {
                $statusAkun = $request->status ? 'aktif' : 'non_aktif';
            } elseif ($request->has('status_akun')) {
                $statusAkun = $request->status_akun;
            }

            // Update user
            $user->update([
                'email'      => $request->email,
                'nama'       => $request->name,
                'no_telepon' => $request->phone,
                'status_akun' => $statusAkun,
            ]);

            if ($request->filled('password')) {
                $user->update(['password' => Hash::make($request->password)]);
            }

            // Update mentor divisi
            $id_divisi = null;
            if ($request->filled('divisi')) {
                $divisi = Divisi::where('nama_divisi', $request->divisi)->first();
                if ($divisi) {
                    $id_divisi = $divisi->id_divisi;
                }
            }
            
            $mentor = Mentor::updateOrCreate(
                ['id_user' => $user->id_user],
                [
                    'id_divisi' => $id_divisi,
                    'jabatan'   => $request->jabatan,
                ]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mentor berhasil diupdate',
                'data' => [
                    'id_mentor' => $mentor->id_mentor,  // 🔥 KEMBALIKAN id_mentor
                    'id_user' => $user->id_user,
                    'name' => $user->nama,
                    'email' => $user->email,
                    'divisi' => $request->divisi,
                    'jabatan' => $request->jabatan,
                    'status_akun' => $user->status_akun
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate mentor: ' . $e->getMessage()
            ], 500);
        }
    }

    // Delete mentor
    public function destroy($id)
    {
        try {
            // Cari mentor berdasarkan id_mentor
            $mentor = Mentor::where('id_mentor', $id)->first();
            
            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mentor tidak ditemukan'
                ], 404);
            }
            
            $user = User::where('id_user', $mentor->id_user)->where('role', 'mentor')->first();
            
            if ($user) {
                $user->delete();
            }
            
            $mentor->delete();

            return response()->json([
                'success' => true,
                'message' => 'Mentor berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus mentor: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get mentor by ID
    public function show($id)
    {
        try {
            $mentor = Mentor::with('user')->where('id_mentor', $id)->first();
            
            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mentor tidak ditemukan'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id_mentor' => $mentor->id_mentor,
                    'id_user' => $mentor->id_user,
                    'nama' => $mentor->user ? $mentor->user->nama : null,
                    'email' => $mentor->user ? $mentor->user->email : null,
                    'no_telepon' => $mentor->user ? $mentor->user->no_telepon : null,
                    'status_akun' => $mentor->user ? $mentor->user->status_akun : null,
                    'id_divisi' => $mentor->id_divisi,
                    'jabatan' => $mentor->jabatan,
                    'divisi' => $mentor->divisi ? $mentor->divisi->nama_divisi : null,
                    'user' => $mentor->user
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data mentor: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getInitials($name)
    {
        $words = explode(' ', $name);
        $initials = '';
        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper($word[0]);
            }
        }
        return $initials ?: 'M';
    }
}