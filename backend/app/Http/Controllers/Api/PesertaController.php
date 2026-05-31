<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peserta;
use App\Models\User;
use App\Models\Kuis;
use App\Models\JawabanKuis;
use App\Models\MateriPelatihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PesertaController extends Controller
{
    /**
     * Dashboard for authenticated peserta
     * GET /api/peserta/dashboard
     */
    public function dashboard(Request $request)
    {
        try {
            $user = $request->user();

            $peserta = Peserta::with('divisi')->where('id_user', $user->id_user)->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan'
                ], 404);
            }

            // Ambil nama divisi peserta (untuk filter kuis dan materi)
            $namaDivisi = $peserta->divisi->nama_divisi ?? '';

            // ======================
            // TUGAS - FILTER BERDASARKAN ID DIVISI PESERTA
            // ======================
            $tugas = DB::table('tugas')
                ->where('tugas.id_divisi', $peserta->id_divisi)
                ->leftJoin('pengumpulan_tugas', function ($join) use ($peserta) {
                    $join->on('tugas.id_tugas', '=', 'pengumpulan_tugas.id_tugas')
                         ->where('pengumpulan_tugas.id_peserta', $peserta->id_peserta);
                })
                ->select(
                    'tugas.id_tugas',
                    'tugas.judul_tugas',
                    'tugas.deadline',
                    DB::raw("COALESCE(pengumpulan_tugas.status, 'belum_dikumpulkan') as status_pengumpulan")
                )
                ->orderBy('tugas.deadline', 'asc')
                ->get();

            $totalTugas = $tugas->count();
            $tugasSelesai = $tugas->where('status_pengumpulan', 'selesai')->count();
            $tugasPending = $tugas->filter(function ($item) {
                return $item->status_pengumpulan === 'belum_dikumpulkan'
                    || $item->status_pengumpulan === 'terlambat';
            })->count();
            $tugasRevisi = $tugas->where('status_pengumpulan', 'revisi')->count();

            $progressTugas = $totalTugas > 0 ? round(($tugasSelesai / $totalTugas) * 100) : 0;

            // ======================
            // KUIS - HITUNG PROGRESS KUIS (MENGGUNAKAN NAMA DIVISI)
            // ======================
            // Perbaikan: menggunakan kolom 'divisi' (string) bukan 'id_divisi'
            $semuaKuis = Kuis::where('divisi', $namaDivisi)->get();
            $totalKuis = $semuaKuis->count();
            
            $kuisSelesai = 0;
            $totalNilaiKuis = 0;
            
            foreach ($semuaKuis as $kuis) {
                $jawaban = JawabanKuis::where('id_user', $user->id_user)
                    ->where('id_kuis', $kuis->id_kuis)
                    ->first();
                
                if ($jawaban && $jawaban->skor !== null) {
                    $kuisSelesai++;
                    $totalNilaiKuis += $jawaban->skor;
                }
            }
            
            $progressKuis = $totalKuis > 0 ? round(($kuisSelesai / $totalKuis) * 100) : 0;
            $rataNilaiKuis = $kuisSelesai > 0 ? round($totalNilaiKuis / $kuisSelesai, 2) : 0;

            // ======================
            // MATERI PELATIHAN - FILTER BERDASARKAN NAMA DIVISI
            // ======================
            $totalMateri = MateriPelatihan::where('divisi', $namaDivisi)->count();
            
            // Progress materi (sementara 0 karena tabel progress_materi belum ada)
            $materiSelesai = 0;
            $progressMateri = $totalMateri > 0 ? round(($materiSelesai / $totalMateri) * 100) : 0;

            // ======================
            // UPCOMING DEADLINES (TUGAS DENGAN DEADLINE MENDATAT)
            // 🔥 PERBAIKAN: Hanya tampilkan tugas yang BELUM DIKUMPULKAN atau REVISI
            // ======================
            $today = Carbon::today();
            
            // Tambahkan debug log
            Log::info('TUGAS DASHBOARD BEFORE FILTER:', $tugas->toArray());
            
            $upcomingDeadlines = $tugas
                ->filter(function ($item) use ($today) {
                    // 🔥 PERBAIKAN: Hanya tampilkan tugas yang masih perlu dikerjakan
                    // Status yang berarti tugas sudah selesai/terkirim:
                    // - dikumpulkan
                    // - dikumpulkan_revisi
                    // - review
                    // - selesai
                    $statusSudahDikerjakan = [
                        'dikumpulkan',
                        'dikumpulkan_revisi',
                        'review',
                        'selesai'
                    ];
                    
                    // Jika status sudah termasuk yang sudah dikerjakan, skip
                    if (in_array($item->status_pengumpulan, $statusSudahDikerjakan)) {
                        return false;
                    }
                    
                    // Cek deadline
                    $deadline = Carbon::parse($item->deadline);
                    return $deadline->gte($today);
                })
                ->sortBy(function ($item) {
                    return Carbon::parse($item->deadline);
                })
                ->take(5)
                ->map(function ($item) use ($today) {
                    $deadline = Carbon::parse($item->deadline);
                    $daysLeft = max(0, (int) $today->diffInDays($deadline, false));
                    return [
                        'id' => $item->id_tugas,
                        'judul' => $item->judul_tugas,
                        'deadline' => $deadline->translatedFormat('d F Y'),
                        'days_left' => $daysLeft,
                        'status' => $item->status_pengumpulan, // Tambahkan status untuk debugging
                    ];
                })
                ->values();

            // Debug log setelah filter
            Log::info('UPCOMING DEADLINES AFTER FILTER:', $upcomingDeadlines->toArray());

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_tugas' => $totalTugas,
                        'tugas_selesai' => $tugasSelesai,
                        'tugas_pending' => $tugasPending,
                        'tugas_revisi' => $tugasRevisi,
                        'progress_tugas' => $progressTugas,
                        'rata_nilai_kuis' => $rataNilaiKuis,
                        'progress_kuis' => $progressKuis,
                        'total_kuis' => $totalKuis,
                        'kuis_selesai' => $kuisSelesai,
                        'progress_materi' => $progressMateri,
                        'total_materi' => $totalMateri,
                        'materi_selesai' => $materiSelesai,
                    ],
                    'upcoming_deadlines' => $upcomingDeadlines,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard Error: ' . $e->getMessage());
            Log::error('Dashboard Error Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get profile for authenticated peserta (untuk halaman profile)
     * GET /api/peserta/profile
     */
    public function getProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            $peserta = Peserta::with(['divisi', 'mentor.user'])
                ->where('id_user', $user->id_user)
                ->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }
            
            $namaDivisi = $peserta->divisi->nama_divisi ?? '';
            
            // Hitung statistik
            $totalTugasSelesai = DB::table('pengumpulan_tugas')
                ->where('id_peserta', $peserta->id_peserta)
                ->where('status', 'selesai')
                ->count();
            
            $totalMateri = MateriPelatihan::where('divisi', $namaDivisi)->count();
            
            $semuaKuis = Kuis::where('divisi', $namaDivisi)->get();
            $kuisSelesai = 0;
            foreach ($semuaKuis as $kuis) {
                $jawaban = JawabanKuis::where('id_user', $user->id_user)
                    ->where('id_kuis', $kuis->id_kuis)
                    ->first();
                if ($jawaban && $jawaban->skor !== null) {
                    $kuisSelesai++;
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id_peserta' => $peserta->id_peserta,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'no_telepon' => $user->no_telepon,
                    'asal_kampus' => $peserta->asal_kampus ?? '-',
                    'prodi' => $peserta->prodi ?? '-',
                    'divisi' => $peserta->divisi->nama_divisi ?? '-',
                    'mentor_nama' => $peserta->mentor->user->nama ?? '-',
                    'tanggal_mulai' => $peserta->tanggal_mulai,
                    'tanggal_selesai' => $peserta->tanggal_selesai,
                    'status_magang' => $peserta->status_magang,
                    'total_tugas_selesai' => $totalTugasSelesai,
                    'total_materi' => $totalMateri,
                    'total_kuis_selesai' => $kuisSelesai,
                    'total_kuis' => $semuaKuis->count(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('GetProfile Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data profil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update profile for authenticated peserta
     * PUT /api/peserta/profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            $validated = $request->validate([
                'nama' => 'sometimes|string|max:255',
                'no_telepon' => 'nullable|string|max:15',
                'asal_kampus' => 'nullable|string|max:255',
                'prodi' => 'nullable|string|max:255',
            ]);
            
            if ($request->has('nama')) {
                $user->nama = $request->nama;
            }
            if ($request->has('no_telepon')) {
                $user->no_telepon = $request->no_telepon;
            }
            $user->save();
            
            $peserta = Peserta::where('id_user', $user->id_user)->first();
            if ($peserta) {
                if ($request->has('asal_kampus')) {
                    $peserta->asal_kampus = $request->asal_kampus;
                }
                if ($request->has('prodi')) {
                    $peserta->prodi = $request->prodi;
                }
                $peserta->save();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Profil berhasil diperbarui',
                'data' => [
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'no_telepon' => $user->no_telepon,
                    'asal_kampus' => $peserta->asal_kampus ?? '-',
                    'prodi' => $peserta->prodi ?? '-',
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('UpdateProfile Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui profil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     * GET /api/peserta
     */
    public function index()
    {
        try {
            $peserta = Peserta::with(['user', 'mentor.user', 'divisi'])->get();
            
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
            Log::error('Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peserta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/peserta
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
                'tanggal_mulai' => 'required|date', 
                'tanggal_selesai' => 'nullable|date',
            ]);

            DB::beginTransaction();
            
            $user = User::create([
                'nama' => $validated['nama'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'no_telepon' => $validated['no_telepon'] ?? null,
                'role' => 'peserta',
                'status_akun' => 'aktif',
            ]);

            $peserta = Peserta::create([
                'id_user' => $user->id_user,
                'id_mentor' => $validated['id_mentor'] ?? null,
                'id_divisi' => $validated['id_divisi'] ?? null,
                'asal_kampus' => $validated['asal_kampus'] ?? null,
                'prodi' => $validated['prodi'] ?? null,
                'tanggal_mulai' => $validated['tanggal_mulai'],
                'tanggal_selesai' => $validated['tanggal_selesai'] ?? null,
                'status_magang' => 'aktif',
            ]);

            DB::commit();
            
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
            Log::error('Store Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan peserta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/peserta/{id}
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
            Log::error('Show Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peserta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     * PUT /api/peserta/{id}
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
                'tanggal_mulai' => 'sometimes|date',
                'tanggal_selesai' => 'nullable|date',
            ];
            
            $request->validate($rules);
            
            DB::beginTransaction();
            
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
            
            $pesertaData = [];
            if ($request->has('asal_kampus')) $pesertaData['asal_kampus'] = $request->asal_kampus;
            if ($request->has('prodi')) $pesertaData['prodi'] = $request->prodi;
            if ($request->has('id_divisi')) $pesertaData['id_divisi'] = $request->id_divisi;
            if ($request->has('id_mentor')) $pesertaData['id_mentor'] = $request->id_mentor;
            if ($request->has('status_magang')) $pesertaData['status_magang'] = $request->status_magang;
            if ($request->has('tanggal_mulai')) $pesertaData['tanggal_mulai'] = $request->tanggal_mulai;
            if ($request->has('tanggal_selesai')) {
                $pesertaData['tanggal_selesai'] = $request->tanggal_selesai;
            }
            
            if (!empty($pesertaData)) {
                $peserta->update($pesertaData);
            }
            
            DB::commit();
            
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
            Log::error('Update Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate peserta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/peserta/{id}
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
            $peserta->delete();
            
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
            Log::error('Destroy Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus peserta: ' . $e->getMessage()
            ], 500);
        }
    }
}