<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Mentor;
use App\Models\Divisi;
use App\Models\Peserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
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
                    'id_mentor' => $user->mentor ? $user->mentor->id_mentor : null,
                    'id_user' => $user->id_user,
                    'email' => $user->email,
                    'name' => $user->nama,
                    'nama' => $user->nama,
                    'phone' => $user->no_telepon,
                    'no_telepon' => $user->no_telepon,
                    'divisi' => $user->mentor && $user->mentor->divisi ? $user->mentor->divisi->nama_divisi : '',
                    'id_divisi' => $user->mentor ? $user->mentor->id_divisi : null,
                    'jabatan' => $user->mentor ? $user->mentor->jabatan : '',
                    'status' => $user->status_akun === 'aktif',
                    'status_akun' => $user->status_akun,
                    'role' => $user->role,
                    'initials' => $this->getInitials($user->nama),
                    'user' => [
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
            $userData = $mentor->user;
            return [
                'id_mentor' => $mentor->id_mentor,
                'id_user' => $mentor->id_user,
                'nama' => $userData ? $userData->nama : null,
                'email' => $userData ? $userData->email : null,
                'no_telepon' => $userData ? $userData->no_telepon : null,
                'status_akun' => $userData ? $userData->status_akun : null,
                'id_divisi' => $mentor->id_divisi,
                'jabatan' => $mentor->jabatan,
                'divisi' => $mentor->divisi ? $mentor->divisi->nama_divisi : null,
                'user' => $userData
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

            $id_divisi = null;
            if ($request->divisi) {
                $divisi = Divisi::where('nama_divisi', $request->divisi)->first();
                if ($divisi) {
                    $id_divisi = $divisi->id_divisi;
                }
            }

            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'nama' => $request->name,
                'no_telepon' => $request->phone,
                'role' => 'mentor',
                'status_akun' => $request->status ? 'aktif' : 'non_aktif',
            ]);

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
                    'id_mentor' => $mentor->id_mentor,
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
                    'user' => [
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
    public function update(Request $request, int $id)
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

            $statusAkun = 'aktif';
            if ($request->has('status')) {
                $statusAkun = $request->status ? 'aktif' : 'non_aktif';
            } elseif ($request->has('status_akun')) {
                $statusAkun = $request->status_akun;
            }

            $user->update([
                'email'      => $request->email,
                'nama'       => $request->name,
                'no_telepon' => $request->phone,
                'status_akun' => $statusAkun,
            ]);

            if ($request->filled('password')) {
                $user->update(['password' => Hash::make($request->password)]);
            }

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
                    'id_mentor' => $mentor->id_mentor,
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
    public function destroy(int $id)
    {
        try {
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
    public function show(int $id)
    {
        try {
            $mentor = Mentor::with('user')->where('id_mentor', $id)->first();
            
            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mentor tidak ditemukan'
                ], 404);
            }
            
            $userData = $mentor->user;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id_mentor' => $mentor->id_mentor,
                    'id_user' => $mentor->id_user,
                    'nama' => $userData ? $userData->nama : null,
                    'email' => $userData ? $userData->email : null,
                    'no_telepon' => $userData ? $userData->no_telepon : null,
                    'status_akun' => $userData ? $userData->status_akun : null,
                    'id_divisi' => $mentor->id_divisi,
                    'jabatan' => $mentor->jabatan,
                    'divisi' => $mentor->divisi ? $mentor->divisi->nama_divisi : null,
                    'user' => $userData
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data mentor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * METHOD UNTUK MENTOR (LIHAT PESERTA BIMBINGAN)
     * ==============================================
     */

    /**
     * Mendapatkan semua peserta yang dibimbing oleh mentor yang login
     * GET /api/mentor/pesertas
     */
    public function getMyPesertas()
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Anda bukan mentor.'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $pesertas = Peserta::with(['user', 'divisi'])
                                ->where('id_mentor', $mentor->id_mentor)
                                ->get()
                                ->map(function ($peserta) {
                                    return [
                                        'id_peserta' => $peserta->id_peserta,
                                        'id_user' => $peserta->id_user,
                                        'id_mentor' => $peserta->id_mentor,
                                        'nama_peserta' => optional($peserta->user)->nama ?? '-',
                                        'email' => optional($peserta->user)->email ?? '-',
                                        'no_telepon' => optional($peserta->user)->no_telepon ?? '-',
                                        'divisi' => optional($peserta->divisi)->nama_divisi ?? '-',
                                        'id_divisi' => $peserta->id_divisi,
                                        'asal_kampus' => $peserta->asal_kampus,
                                        'prodi' => $peserta->prodi,
                                        'tanggal_mulai' => $peserta->tanggal_mulai,
                                        'tanggal_selesai' => $peserta->tanggal_selesai,
                                        'status_magang' => $peserta->status_magang,
                                        'user' => $peserta->user
                                    ];
                                });

            return response()->json([
                'success' => true,
                'data' => $pesertas,
                'message' => 'Data peserta bimbingan berhasil diambil'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan detail satu peserta bimbingan
     * GET /api/mentor/pesertas/{id_peserta}
     */
    public function getDetailPeserta(int $id_peserta)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Anda bukan mentor.'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $peserta = Peserta::with(['user', 'divisi'])
                              ->where('id_mentor', $mentor->id_mentor)
                              ->where('id_peserta', $id_peserta)
                              ->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan atau bukan bimbingan Anda'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id_peserta' => $peserta->id_peserta,
                    'id_user' => $peserta->id_user,
                    'nama_peserta' => optional($peserta->user)->nama ?? '-',
                    'email' => optional($peserta->user)->email ?? '-',
                    'no_telepon' => optional($peserta->user)->no_telepon ?? '-',
                    'divisi' => optional($peserta->divisi)->nama_divisi ?? '-',
                    'asal_kampus' => $peserta->asal_kampus,
                    'prodi' => $peserta->prodi,
                    'tanggal_mulai' => $peserta->tanggal_mulai,
                    'tanggal_selesai' => $peserta->tanggal_selesai,
                    'status_magang' => $peserta->status_magang,
                    'user' => $peserta->user
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ==============================================
     * METHOD UNTUK FILTER DAN PESERTA LIST (UNTUK DAFTAR PESERTA)
     * ==============================================
     */

    /**
     * Get filter options (periode and divisi) for mentor
     * GET /api/mentor/filters
     */
    public function getFilters()
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak.'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            // Ambil daftar periode (tahun) dari tanggal_mulai peserta bimbingan
            $periode = Peserta::where('id_mentor', $mentor->id_mentor)
                ->whereNotNull('tanggal_mulai')
                ->selectRaw('DISTINCT YEAR(tanggal_mulai) as tahun')
                ->pluck('tahun')
                ->sortDesc()
                ->values()
                ->map(function ($tahun) {
                    return (string) $tahun;
                });

            // Ambil daftar divisi dari peserta bimbingan
            $divisi = Peserta::where('id_mentor', $mentor->id_mentor)
                ->with('divisi')
                ->get()
                ->pluck('divisi.nama_divisi')
                ->filter()
                ->unique()
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'periode' => $periode,
                    'divisi' => $divisi
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of peserta dengan filter (search, periode, divisi)
     * GET /api/mentor/peserta-list
     */
    public function getPesertaList(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak.'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            // Query dasar
            $query = Peserta::with(['user', 'divisi'])
                ->where('id_mentor', $mentor->id_mentor);

            // Filter search by nama or email
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filter by periode (tahun dari tanggal_mulai)
            if ($request->has('periode') && !empty($request->periode) && $request->periode !== 'all') {
                $tahun = $request->periode;
                $query->whereYear('tanggal_mulai', $tahun);
            }

            // Filter by divisi
            if ($request->has('divisi') && !empty($request->divisi) && $request->divisi !== 'all') {
                $divisiName = $request->divisi;
                $query->whereHas('divisi', function ($q) use ($divisiName) {
                    $q->where('nama_divisi', $divisiName);
                });
            }

            $pesertas = $query->get()->map(function ($peserta) {
                // Hitung progress contoh (bisa disesuaikan nanti dengan data real)
                $progress = rand(45, 95);
                $kehadiran = rand(60, 100);
                $tugasSelesai = rand(5, 15);
                $totalTugas = 15;
                $nilaiAkhir = rand(65, 95);

                $rank = 'silver';
                if ($nilaiAkhir >= 85) $rank = 'diamond';
                elseif ($nilaiAkhir >= 70) $rank = 'gold';

                return [
                    'id' => $peserta->id_peserta,
                    'id_peserta' => $peserta->id_peserta,
                    'peserta_id' => $peserta->id_peserta,
                    'nama_lengkap' => optional($peserta->user)->nama ?? '-',
                    'nama' => optional($peserta->user)->nama ?? '-',
                    'name' => optional($peserta->user)->nama ?? '-',
                    'email' => optional($peserta->user)->email ?? '-',
                    'periode_magang' => $peserta->tanggal_mulai ? date('Y', strtotime($peserta->tanggal_mulai)) : '-',
                    'divisi' => optional($peserta->divisi)->nama_divisi ?? '-',
                    'peserta_divisi' => optional($peserta->divisi)->nama_divisi ?? '-',
                    'status' => $peserta->status_magang,
                    'status_magang' => $peserta->status_magang,
                    'status_akun' => optional($peserta->user)->status_akun ?? 'non_aktif',
                    'progress' => $progress,
                    'kehadiran_persen' => $kehadiran,
                    'tugas_selesai' => $tugasSelesai,
                    'total_tugas' => $totalTugas,
                    'nilai_akhir' => $nilaiAkhir,
                    'rank' => $rank
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $pesertas
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getInitials(string $name)
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