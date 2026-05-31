<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Mentor;
use App\Models\Divisi;
use App\Models\Peserta;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use App\Models\Presensi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class MentorController extends Controller
{
    // Mendapatkan semua mentor (untuk admin)
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
     * Get mentor profile data (for logged in mentor)
     * GET /api/mentor/profile
     */
    public function profile(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || $user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Hanya untuk mentor.'
                ], 403);
            }

            // 🔥 PERBAIKAN: Gunakan Eloquent relationship yang sudah ada
            $mentor = Mentor::with(['user', 'divisi'])
                ->where('id_user', $user->id_user)
                ->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'nama' => $mentor->user->nama ?? '-',
                    'email' => $mentor->user->email ?? '-',
                    'no_telepon' => $mentor->user->no_telepon ?? '-',
                    'jabatan' => $mentor->jabatan ?? 'Mentor',
                    'divisi' => $mentor->divisi->nama_divisi ?? '-',
                    'status_akun' => $mentor->user->status_akun ?? 'aktif',
                    'foto_profil' => $mentor->user->foto_profil ?? null,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in mentor profile: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format periode magang dari tanggal mulai dan selesai
     */
    private function formatPeriodeMagang($tanggalMulai, $tanggalSelesai)
    {
        if (!$tanggalMulai || !$tanggalSelesai) {
            return '-';
        }

        $bulanIndo = [
            'January' => 'Januari', 'February' => 'Februari', 'March' => 'Maret',
            'April' => 'April', 'May' => 'Mei', 'June' => 'Juni',
            'July' => 'Juli', 'August' => 'Agustus', 'September' => 'September',
            'October' => 'Oktober', 'November' => 'November', 'December' => 'Desember'
        ];

        $start = new \DateTime($tanggalMulai);
        $end = new \DateTime($tanggalSelesai);
        
        $bulanMulai = $bulanIndo[$start->format('F')] ?? $start->format('F');
        $tahunMulai = $start->format('Y');
        $bulanSelesai = $bulanIndo[$end->format('F')] ?? $end->format('F');
        $tahunSelesai = $end->format('Y');
        
        if ($tahunMulai == $tahunSelesai) {
            return $bulanMulai . ' - ' . $bulanSelesai . ' ' . $tahunMulai;
        }
        
        return $bulanMulai . ' ' . $tahunMulai . ' - ' . $bulanSelesai . ' ' . $tahunSelesai;
    }

    /**
     * Get list of peserta with filter (search, periode, divisi)
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

            $query = Peserta::with(['user', 'divisi'])
                ->where('id_mentor', $mentor->id_mentor);

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->has('periode') && !empty($request->periode) && $request->periode !== 'all') {
                $tahun = $request->periode;
                $query->whereYear('tanggal_mulai', $tahun);
            }

            if ($request->has('divisi') && !empty($request->divisi) && $request->divisi !== 'all') {
                $divisiName = $request->divisi;
                $query->whereHas('divisi', function ($q) use ($divisiName) {
                    $q->where('nama_divisi', $divisiName);
                });
            }

            // Ambil semua tugas mentor untuk menghitung progress
            $allTugas = Tugas::where('id_mentor', $mentor->id_mentor)->get();
            $totalTugasMentor = $allTugas->count();

            $pesertas = $query->get()->map(function ($peserta) use ($totalTugasMentor) {
                // Hitung progress REAL dari database
                $pengumpulan = PengumpulanTugas::where('id_peserta', $peserta->id_peserta)->get();
                
                // Hitung tugas yang sudah dikumpulkan (tanggal_kumpul tidak NULL)
                $tugasSelesai = $pengumpulan->filter(function ($item) {
                    return !is_null($item->tanggal_kumpul);
                })->count();
                
                // Progress = (tugas selesai / total tugas mentor) * 100
                $progress = $totalTugasMentor > 0 ? round(($tugasSelesai / $totalTugasMentor) * 100) : 0;
                
                // Hitung kehadiran REAL dari database
                $presensiList = Presensi::where('id_peserta', $peserta->id_peserta)->get();
                $totalPresensi = $presensiList->count();
                
                // Hitung kehadiran (status Hadir atau Terlambat)
                $hadirCount = $presensiList->filter(function ($item) {
                    return in_array($item->status_kehadiran, ['Hadir', 'Terlambat']);
                })->count();
                
                $kehadiranPersen = $totalPresensi > 0 ? round(($hadirCount / $totalPresensi) * 100) : 0;
                
                // Hitung nilai akhir dari rata-rata nilai tugas
                $nilaiAkhir = 0;
                $totalNilai = 0;
                $nilaiCount = 0;
                foreach ($pengumpulan as $item) {
                    if ($item->nilai !== null && $item->nilai > 0) {
                        $totalNilai += $item->nilai;
                        $nilaiCount++;
                    }
                }
                $nilaiAkhir = $nilaiCount > 0 ? round($totalNilai / $nilaiCount) : 0;
                
                $rank = 'silver';
                if ($nilaiAkhir >= 85) $rank = 'diamond';
                elseif ($nilaiAkhir >= 70) $rank = 'gold';

                // Format periode magang
                $periodeMagang = $this->formatPeriodeMagang($peserta->tanggal_mulai, $peserta->tanggal_selesai);

                return [
                    'id' => $peserta->id_peserta,
                    'id_peserta' => $peserta->id_peserta,
                    'peserta_id' => $peserta->id_peserta,
                    'nama_lengkap' => optional($peserta->user)->nama ?? '-',
                    'nama' => optional($peserta->user)->nama ?? '-',
                    'name' => optional($peserta->user)->nama ?? '-',
                    'email' => optional($peserta->user)->email ?? '-',
                    'periode_magang' => $periodeMagang,
                    'divisi' => optional($peserta->divisi)->nama_divisi ?? '-',
                    'peserta_divisi' => optional($peserta->divisi)->nama_divisi ?? '-',
                    'status' => $peserta->status_magang ?? 'aktif',
                    'status_magang' => $peserta->status_magang ?? 'aktif',
                    'status_akun' => optional($peserta->user)->status_akun ?? 'non_aktif',
                    'asal_kampus' => $peserta->asal_kampus ?? '-',
                    'prodi' => $peserta->prodi ?? '-',
                    'progress' => $progress,
                    'kehadiran_persen' => $kehadiranPersen,
                    'tugas_selesai' => $tugasSelesai,
                    'total_tugas' => $totalTugasMentor,
                    'nilai_akhir' => $nilaiAkhir,
                    'rank' => $rank
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $pesertas
            ]);

        } catch (\Exception $e) {
            Log::error('Error in getPesertaList: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get filter options for mentor
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

            $periode = Peserta::where('id_mentor', $mentor->id_mentor)
                ->whereNotNull('tanggal_mulai')
                ->selectRaw('DISTINCT YEAR(tanggal_mulai) as tahun')
                ->pluck('tahun')
                ->sortDesc()
                ->values()
                ->map(function ($tahun) {
                    return (string) $tahun;
                });

            if ($periode->isEmpty()) {
                $periode = collect([date('Y'), date('Y') - 1]);
            }

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
     * Get my peserta list
     * GET /api/mentor/pesertas
     */
    public function getMyPesertas()
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

            $pesertas = Peserta::with(['user', 'divisi'])
                ->where('id_mentor', $mentor->id_mentor)
                ->get();

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

    /**
     * Get detail peserta
     * GET /api/mentor/pesertas/{id}
     */
    public function getDetailPeserta($id)
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

            $peserta = Peserta::with(['user', 'divisi'])
                ->where('id_mentor', $mentor->id_mentor)
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
                'data' => $peserta
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard statistics
     * GET /api/mentor/dashboard
     */
    public function dashboard()
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

            $totalPeserta = Peserta::where('id_mentor', $mentor->id_mentor)->count();
            
            $totalTugas = Tugas::where('id_mentor', $mentor->id_mentor)->count();
            
            $totalPengumpulan = PengumpulanTugas::whereHas('tugas', function($q) use ($mentor) {
                $q->where('id_mentor', $mentor->id_mentor);
            })->count();
            
            $allPresensi = Presensi::whereHas('peserta', function($q) use ($mentor) {
                $q->where('id_mentor', $mentor->id_mentor);
            })->get();
            
            $totalHadir = $allPresensi->filter(function($item) {
                return in_array($item->status_kehadiran, ['Hadir', 'Terlambat']);
            })->count();
            
            $rataKehadiran = $allPresensi->count() > 0 ? round(($totalHadir / $allPresensi->count()) * 100) : 0;
            
            return response()->json([
                'success' => true,
                'stats' => [
                    'totalMentees' => $totalPeserta,
                    'pendingTasks' => 0,
                    'completedTasks' => 0,
                    'attendanceRate' => $rataKehadiran,
                    'totalTasks' => $totalTugas,
                    'unfinishedTasks' => 0
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get notifications
     * GET /api/mentor/notifications
     */
    public function getNotifications()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    ['id' => 1, 'message' => 'Selamat datang di dashboard mentor', 'type' => 'info', 'created_at' => now(), 'is_read' => false],
                    ['id' => 2, 'message' => 'Ada peserta baru yang mendaftar', 'type' => 'success', 'created_at' => now(), 'is_read' => false]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
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