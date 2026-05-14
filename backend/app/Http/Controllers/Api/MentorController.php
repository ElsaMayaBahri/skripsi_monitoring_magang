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
use App\Models\NilaiPeserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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
     * Update mentor profile photo
     * POST /api/mentor/profile/photo
     */
    public function updateProfilePhoto(Request $request)
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            
            if (!$user || $user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak.'
                ], 403);
            }
            
            $request->validate([
                'foto_profil' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);
            
            // Hapus foto lama jika ada
            if ($user->foto_profil && Storage::disk('public')->exists($user->foto_profil)) {
                Storage::disk('public')->delete($user->foto_profil);
            }
            
            // Upload foto baru
            $file = $request->file('foto_profil');
            $filename = 'mentor_' . $user->id_user . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('mentor/foto', $filename, 'public');
            
            $user->foto_profil = $path;
            $user->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Foto profil berhasil diupdate',
                'foto_url' => Storage::url($path)
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate foto profil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete mentor profile photo
     * DELETE /api/mentor/profile/photo
     */
    public function deleteProfilePhoto(Request $request)
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            
            if (!$user || $user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak.'
                ], 403);
            }
            
            if ($user->foto_profil && Storage::disk('public')->exists($user->foto_profil)) {
                Storage::disk('public')->delete($user->foto_profil);
            }
            
            $user->foto_profil = null;
            $user->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Foto profil berhasil dihapus'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus foto profil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get list of peserta with filter (search, periode, divisi)
     * GET /api/mentor/peserta-list
     * 
     * Menampilkan daftar peserta dengan perhitungan:
     * - Progress tugas (berdasarkan pengumpulan tugas)
     * - Persentase kehadiran (berdasarkan presensi)
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

            $tugasIds = Tugas::where('id_mentor', $mentor->id_mentor)->pluck('id_tugas')->toArray();
            $totalTugasGlobal = count($tugasIds);

            $pesertas = $query->get()->map(function ($peserta) use ($mentor, $tugasIds, $totalTugasGlobal) {
                // =====================================================
                // PERHITUNGAN PROGRESS TUGAS
                // =====================================================
                $totalTugas = $totalTugasGlobal;
                
                $tugasSelesai = PengumpulanTugas::where('id_peserta', $peserta->id_peserta)
                    ->whereIn('id_tugas', $tugasIds)
                    ->whereIn('status', ['dikumpulkan', 'dinilai', 'selesai'])
                    ->count();
                
                $progress = $totalTugas > 0 
                    ? round(($tugasSelesai / $totalTugas) * 100) 
                    : 0;
                
                // =====================================================
                // PERHITUNGAN KEHADIRAN - FIX: menggunakan status_kehadiran
                // =====================================================
                $totalPresensi = Presensi::where('id_peserta', $peserta->id_peserta)->count();
                
                $hadir = Presensi::where('id_peserta', $peserta->id_peserta)
                    ->whereIn('status_kehadiran', ['hadir', 'izin', 'sakit'])
                    ->count();
                
                $kehadiranPersen = $totalPresensi > 0 
                    ? round(($hadir / $totalPresensi) * 100) 
                    : 0;
                
                // =====================================================
                // NILAI AKHIR - AMBIL DARI DATABASE (tabel nilai_pesertas)
                // =====================================================
                $nilaiPeserta = NilaiPeserta::where('id_peserta', $peserta->id_peserta)->first();
                $nilaiAkhir = $nilaiPeserta ? $nilaiPeserta->nilai_akhir : 0;
                
                // =====================================================
                // DETERMINASI RANK berdasarkan nilai akhir dari database
                // =====================================================
                $rank = 'silver';
                if ($nilaiAkhir >= 85) $rank = 'diamond';
                elseif ($nilaiAkhir >= 70) $rank = 'gold';
                elseif ($nilaiAkhir >= 50) $rank = 'silver';
                else $rank = 'bronze';

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
                    'status' => $peserta->status_magang ?? 'aktif',
                    'status_magang' => $peserta->status_magang ?? 'aktif',
                    'status_akun' => optional($peserta->user)->status_akun ?? 'non_aktif',
                    
                    // AMBIL DARI TABEL PESERTAS (bukan dari users)
                    'universitas' => $peserta->asal_kampus ?? '-',
                    'jurusan' => $peserta->prodi ?? '-',
                    
                    'progress' => $progress,
                    'kehadiran_persen' => $kehadiranPersen,
                    'tugas_selesai' => $tugasSelesai,
                    'total_tugas' => $totalTugas,
                    'nilai_akhir' => round($nilaiAkhir, 2),
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
     * Get detail peserta with statistics
     * GET /api/mentor/pesertas/{id}
     */
    public function getDetailPeserta(int $id)
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

            // =====================================================
            // PERHITUNGAN PROGRESS TUGAS
            // =====================================================
            $tugasIds = Tugas::where('id_mentor', $mentor->id_mentor)->pluck('id_tugas')->toArray();
            $totalTugas = count($tugasIds);
            
            $tugasSelesai = PengumpulanTugas::where('id_peserta', $peserta->id_peserta)
                ->whereIn('id_tugas', $tugasIds)
                ->whereIn('status', ['dikumpulkan', 'dinilai', 'selesai'])
                ->count();
            
            $progress = $totalTugas > 0 
                ? round(($tugasSelesai / $totalTugas) * 100) 
                : 0;
            
            // =====================================================
            // PERHITUNGAN KEHADIRAN - FIX: menggunakan status_kehadiran
            // =====================================================
            $totalPresensi = Presensi::where('id_peserta', $peserta->id_peserta)->count();
            
            $hadir = Presensi::where('id_peserta', $peserta->id_peserta)
                ->whereIn('status_kehadiran', ['hadir', 'izin', 'sakit'])
                ->count();
            
            $kehadiranPersen = $totalPresensi > 0 
                ? round(($hadir / $totalPresensi) * 100) 
                : 0;
            
            // =====================================================
            // NILAI AKHIR - AMBIL DARI DATABASE (tabel nilai_pesertas)
            // =====================================================
            $nilaiPeserta = NilaiPeserta::where('id_peserta', $peserta->id_peserta)->first();
            $nilaiAkhir = $nilaiPeserta ? $nilaiPeserta->nilai_akhir : 0;
            
            // =====================================================
            // DETERMINASI RANK berdasarkan nilai akhir dari database
            // =====================================================
            $rank = 'silver';
            if ($nilaiAkhir >= 85) $rank = 'diamond';
            elseif ($nilaiAkhir >= 70) $rank = 'gold';
            elseif ($nilaiAkhir >= 50) $rank = 'silver';
            else $rank = 'bronze';

            // Konversi peserta ke array
            $pesertaArray = $peserta->toArray();
            
            // Tambahkan data statistik
            $pesertaArray['progress'] = $progress;
            $pesertaArray['kehadiran_persen'] = $kehadiranPersen;
            $pesertaArray['tugas_selesai'] = $tugasSelesai;
            $pesertaArray['total_tugas'] = $totalTugas;
            $pesertaArray['nilai_akhir'] = round($nilaiAkhir, 2);
            $pesertaArray['rank'] = $rank;
            
            // Tambahkan universitas dan jurusan dari tabel pesertas
            $pesertaArray['universitas'] = $peserta->asal_kampus ?? '-';
            $pesertaArray['jurusan'] = $peserta->prodi ?? '-';

            return response()->json([
                'success' => true,
                'data' => $pesertaArray
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard statistics with accurate task progress
     * GET /api/mentor/dashboard
     * 
     * Menampilkan monitoring tugas mentor:
     * - Total tugas yang dibuat mentor
     * - Jumlah tugas yang sudah dikumpulkan/dinilai/selesai
     * - Jumlah tugas yang belum dikumpulkan
     * - Progress dalam persen
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

            // 1. Total peserta bimbingan (untuk card 1)
            $totalPeserta = Peserta::where('id_mentor', $mentor->id_mentor)->count();

            // 2. Total tugas yang perlu review (status dikumpulkan/revisi) untuk card 2
            $tugasIds = Tugas::where('id_mentor', $mentor->id_mentor)->pluck('id_tugas');
            
            $totalPerluReview = PengumpulanTugas::whereIn('id_tugas', $tugasIds)
                ->whereIn('status', ['dikumpulkan', 'revisi'])
                ->count();

            // 3. Total tugas yang dibuat mentor (untuk card 3)
            $totalTasks = Tugas::where('id_mentor', $mentor->id_mentor)->count();

            // 4. Tugas yang sudah dikumpulkan/dinilai/selesai
            $completedTasks = PengumpulanTugas::whereIn('id_tugas', $tugasIds)
                ->whereIn('status', ['dikumpulkan', 'dinilai', 'selesai'])
                ->count();

            // 5. Belum selesai (tugas yang belum ada pengumpulan)
            $unfinishedTasks = $totalTasks - $completedTasks;
            
            // Pastikan tidak negatif
            if ($unfinishedTasks < 0) {
                $unfinishedTasks = 0;
            }

            // 6. Progress tugas dalam persen (berdasarkan total tugas, bukan target submission)
            $progressPercentage = $totalTasks > 0 
                ? round(($completedTasks / $totalTasks) * 100) 
                : 0;

            // 7. Rata-rata kehadiran
            $rataRataKehadiran = 0;

            return response()->json([
                'success' => true,
                'stats' => [
                    'totalMentees' => $totalPeserta,
                    'pendingTasks' => $totalPerluReview,
                    'completedTasks' => $completedTasks,
                    'averageScore' => 0,
                    'attendanceRate' => $rataRataKehadiran,
                    'totalTasks' => $totalTasks,
                    'progressPercentage' => $progressPercentage,
                    'unfinishedTasks' => $unfinishedTasks,
                ],
                'recentActivities' => [],
                'upcomingDeadlines' => []
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