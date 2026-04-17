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
                    'id_user' => $user->id_user,
                    'email' => $user->email,
                    'name' => $user->nama,
                    'phone' => $user->no_telepon,
                    'divisi' => $user->mentor && $user->mentor->divisi ? $user->mentor->divisi->nama_divisi : '',
                    'jabatan' => $user->mentor ? $user->mentor->jabatan : '',
                    'status' => $user->status_akun === 'aktif',
                    'role' => $user->role,
                    'initials' => $this->getInitials($user->nama)
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
        return response()->json([
            'success' => true,
            'data' => $mentors
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
                    'id_user' => $user->id_user,
                    'email' => $user->email,
                    'name' => $user->nama,
                    'phone' => $user->no_telepon,
                    'divisi' => $request->divisi,
                    'jabatan' => $request->jabatan,
                    'status' => $user->status_akun === 'aktif',
                    'initials' => $this->getInitials($user->nama)
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
            'status'    => 'nullable|boolean',      // ✅ boolean dari frontend
            'status_akun' => 'nullable|in:aktif,non_aktif', // ✅ fallback string
        ]);

        try {
            DB::beginTransaction();

            // ✅ Resolve status_akun dari boolean 'status' ATAU string 'status_akun'
            $statusAkun = 'aktif'; // default
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
                'status_akun' => $statusAkun,      // ✅ nilai pasti valid
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
            Mentor::updateOrCreate(
                ['id_user' => $user->id_user],
                [
                    'id_divisi' => $id_divisi,
                    'jabatan'   => $request->jabatan,
                ]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mentor berhasil diupdate'
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
            $user = User::where('id_user', $id)->where('role', 'mentor')->firstOrFail();
            $user->delete();

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
