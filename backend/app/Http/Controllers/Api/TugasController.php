<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use App\Models\Mentor;
use App\Models\Peserta;
use App\Models\PengumpulanTugas;
use App\Models\Notifikasi;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\NotifikasiController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TugasController extends Controller
{
    /**
     * Get all tugas for logged in mentor
     * GET /api/mentor/tugas
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $query = Tugas::with(['divisi'])
                ->where('id_mentor', $mentor->id_mentor);

            if ($request->has('search') && !empty($request->search)) {
                $query->where('judul_tugas', 'like', '%' . $request->search . '%');
            }

            if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
                if ($request->status === 'active') {
                    $query->where('deadline', '>=', now());
                } elseif ($request->status === 'closed') {
                    $query->where('deadline', '<', now());
                }
            }

            $tugas = $query->orderBy('created_at', 'desc')->get();

            $transformedTugas = $tugas->map(function ($item) {
                $pengumpulanList = PengumpulanTugas::with(['peserta.user'])
                    ->where('id_tugas', $item->id_tugas)
                    ->get();

                $submissions = [];
                $totalSubmissions = $pengumpulanList->count();
                $submittedCount = 0;
                $pendingReview = 0;

                foreach ($pengumpulanList as $pengumpulan) {
                    $hasSubmitted = !is_null($pengumpulan->tanggal_kumpul);
                    if ($hasSubmitted) {
                        $submittedCount++;
                        if (in_array($pengumpulan->status, ['dikumpulkan', 'dikumpulkan_revisi'])) {
                            $pendingReview++;
                        }
                    }

                    $submissions[] = [
                        'peserta_id' => $pengumpulan->id_peserta,
                        'peserta_nama' => $pengumpulan->peserta->user->nama ?? 'Unknown',
                        'status' => $pengumpulan->status,
                        'submitted_at' => $pengumpulan->tanggal_kumpul,
                        'nilai' => $pengumpulan->nilai,
                        'catatan' => $pengumpulan->catatan_mentor,
                    ];
                }

                // Parse file URLs
                $fileUrls = [];
                if ($item->file_tugas) {
                    $filePaths = json_decode($item->file_tugas, true);
                    if (is_array($filePaths)) {
                        foreach ($filePaths as $path) {
                            $fileUrls[] = Storage::url($path);
                        }
                    } else {
                        $fileUrls[] = Storage::url($item->file_tugas);
                    }
                }

                // Parse links
                $links = [];
                if ($item->file_link) {
                    $links = json_decode($item->file_link, true);
                    if (!is_array($links)) {
                        $links = [$item->file_link];
                    }
                }

                return [
                    'id_tugas' => $item->id_tugas,
                    'judul' => $item->judul_tugas,
                    'deskripsi' => $item->deskripsi,
                    'deadline' => $item->deadline->format('Y-m-d H:i:s'),
                    'bobot' => 0,
                    'status' => $item->status_tugas ?? (now()->gt($item->deadline) ? 'closed' : 'active'),
                    'created_at' => $item->created_at,
                    'file_tugas' => $item->file_tugas,
                    'file_urls' => $fileUrls,
                    'file_links' => $links,
                    'total_submissions' => $totalSubmissions,
                    'submitted_count' => $submittedCount,
                    'pending_review' => $pendingReview,
                    'submissions' => $submissions,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedTugas,
                'total' => $tugas->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Tugas Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single tugas by ID
     * GET /api/mentor/tugas/{id}
     */
    public function show($id)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $tugas = Tugas::with(['divisi'])
                ->where('id_tugas', $id)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$tugas) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tugas tidak ditemukan'
                ], 404);
            }

            // Parse file URLs
            $fileUrls = [];
            if ($tugas->file_tugas) {
                $filePaths = json_decode($tugas->file_tugas, true);
                if (is_array($filePaths)) {
                    foreach ($filePaths as $path) {
                        $fileUrls[] = Storage::url($path);
                    }
                } else {
                    $fileUrls[] = Storage::url($tugas->file_tugas);
                }
            }

            // Parse links
            $links = [];
            if ($tugas->file_link) {
                $links = json_decode($tugas->file_link, true);
                if (!is_array($links)) {
                    $links = [$tugas->file_link];
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id_tugas' => $tugas->id_tugas,
                    'judul' => $tugas->judul_tugas,
                    'deskripsi' => $tugas->deskripsi,
                    'deadline' => $tugas->deadline->format('Y-m-d H:i:s'),
                    'file_tugas' => $tugas->file_tugas,
                    'file_urls' => $fileUrls,
                    'file_links' => $links,
                    'id_divisi' => $tugas->id_divisi,
                    'divisi' => $tugas->divisi ? $tugas->divisi->nama_divisi : null,
                    'created_at' => $tugas->created_at,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Tugas Show Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new tugas with multiple files and links
     * POST /api/mentor/tugas
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $rules = [
                'judul' => 'required|string|max:255',
                'deskripsi' => 'nullable|string',
                'deadline' => 'required|date',
                'id_peserta' => 'required',
                'file_tugas.*' => 'nullable|file|max:10240',
                'file_links' => 'nullable|string|max:5000',
            ];

            $request->validate($rules);

            DB::beginTransaction();

            // Parse peserta IDs
            $idPesertaList = [];
            if (is_string($request->id_peserta)) {
                $idPesertaList = json_decode($request->id_peserta, true);
                if (!is_array($idPesertaList)) {
                    $idPesertaList = explode(',', $request->id_peserta);
                }
            } elseif (is_array($request->id_peserta)) {
                $idPesertaList = $request->id_peserta;
            }

            $idPesertaList = array_map('intval', $idPesertaList);

            if (empty($idPesertaList)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Daftar peserta tidak valid'
                ], 422);
            }

            // Handle multiple file uploads
            $filePaths = [];
            if ($request->hasFile('file_tugas')) {
                $files = $request->file('file_tugas');

                if (!is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
                        $path = $file->storeAs('tugas', $filename, 'public');
                        $filePaths[] = $path;
                    }
                }
            }

            // Handle multiple links
            $linkList = [];
            if ($request->has('file_links') && !empty($request->file_links)) {
                $linkList = json_decode($request->file_links, true);
                if (!is_array($linkList)) {
                    $linkList = [$request->file_links];
                }
                $linkList = array_filter($linkList, function ($link) {
                    return !empty(trim($link));
                });
            }

            $data = [
                'id_mentor' => $mentor->id_mentor,
                'judul_tugas' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'deadline' => $request->deadline,
                'id_divisi' => $mentor->id_divisi,
                'file_tugas' => !empty($filePaths) ? json_encode($filePaths) : null,
                'file_link' => !empty($linkList) ? json_encode(array_values($linkList)) : null,
            ];

            $tugas = Tugas::create($data);

            // Create submission records for each peserta
            foreach ($idPesertaList as $idPeserta) {
                $peserta = Peserta::where('id_peserta', $idPeserta)
                    ->where('id_mentor', $mentor->id_mentor)
                    ->first();

                if ($peserta) {
                    PengumpulanTugas::create([
                        'id_tugas' => $tugas->id_tugas,
                        'id_peserta' => $idPeserta,
                        'status' => 'belum_dikumpulkan',
                        'tanggal_kumpul' => null,
                        'catatan_mentor' => null,
                        'nilai' => null,
                    ]);
                }
            }

            DB::commit();

            // Send notifications
            foreach ($idPesertaList as $idPeserta) {
                $peserta = Peserta::with('user')
                    ->where('id_peserta', $idPeserta)
                    ->where('id_mentor', $mentor->id_mentor)
                    ->first();

                if ($peserta && $peserta->user) {
                    NotifikasiController::kirim(
                        $peserta->user->id_user,
                        '📋 Tugas Baru',
                        "Mentor {$user->nama} telah memberikan tugas baru: \"{$tugas->judul_tugas}\". Deadline: " . date('d/m/Y', strtotime($tugas->deadline))
                    );
                }
            }

            // Prepare response with file URLs
            $fileUrls = [];
            if ($tugas->file_tugas) {
                $filePathsArray = json_decode($tugas->file_tugas, true);
                if (is_array($filePathsArray)) {
                    foreach ($filePathsArray as $path) {
                        $fileUrls[] = Storage::url($path);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Tugas berhasil ditambahkan',
                'data' => [
                    'id_tugas' => $tugas->id_tugas,
                    'judul' => $tugas->judul_tugas,
                    'file_tugas' => $tugas->file_tugas,
                    'file_urls' => $fileUrls,
                    'file_links' => $tugas->file_link ? json_decode($tugas->file_link, true) : [],
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Tugas Store Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan tugas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update tugas
     * PUT /api/mentor/tugas/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $tugas = Tugas::where('id_tugas', $id)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$tugas) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tugas tidak ditemukan'
                ], 404);
            }

            $rules = [
                'judul' => 'required|string|max:255',
                'deskripsi' => 'nullable|string',
                'deadline' => 'required|date',
                'file_tugas.*' => 'nullable|file|max:10240',
                'file_links' => 'nullable|string|max:5000',
                'remove_files' => 'nullable|boolean',
                'remove_links' => 'nullable|boolean',
            ];

            $request->validate($rules);

            DB::beginTransaction();

            $data = [
                'judul_tugas' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'deadline' => $request->deadline,
                'id_divisi' => $request->id_divisi ?? $mentor->id_divisi,
            ];

            // Handle file updates
            $existingFiles = [];
            if ($tugas->file_tugas) {
                $existingFiles = json_decode($tugas->file_tugas, true) ?? [];
            }

            if ($request->has('remove_files') && $request->remove_files === 'true') {
                foreach ($existingFiles as $filePath) {
                    if (Storage::disk('public')->exists($filePath)) {
                        Storage::disk('public')->delete($filePath);
                    }
                }
                $existingFiles = [];
            }

            if ($request->hasFile('file_tugas')) {
                $files = $request->file('file_tugas');
                if (!is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
                        $path = $file->storeAs('tugas', $filename, 'public');
                        $existingFiles[] = $path;
                    }
                }
            }

            $data['file_tugas'] = !empty($existingFiles) ? json_encode($existingFiles) : null;

            // Handle links updates
            $existingLinks = [];
            if ($tugas->file_link) {
                $existingLinks = json_decode($tugas->file_link, true) ?? [];
            }

            if ($request->has('remove_links') && $request->remove_links === 'true') {
                $existingLinks = [];
            }

            if ($request->has('file_links') && !empty($request->file_links)) {
                $newLinks = json_decode($request->file_links, true);
                if (is_array($newLinks)) {
                    $existingLinks = array_merge($existingLinks, $newLinks);
                } elseif (is_string($newLinks)) {
                    $existingLinks[] = $newLinks;
                }
                $existingLinks = array_unique(array_filter($existingLinks));
            }

            $data['file_link'] = !empty($existingLinks) ? json_encode(array_values($existingLinks)) : null;

            $tugas->update($data);

            DB::commit();

            $fileUrls = [];
            if ($tugas->file_tugas) {
                $filePathsArray = json_decode($tugas->file_tugas, true) ?? [];
                foreach ($filePathsArray as $path) {
                    $fileUrls[] = Storage::url($path);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Tugas berhasil diupdate',
                'data' => [
                    'file_urls' => $fileUrls,
                    'file_links' => $tugas->file_link ? json_decode($tugas->file_link, true) : [],
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Tugas Update Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate tugas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete tugas
     * DELETE /api/mentor/tugas/{id}
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $tugas = Tugas::where('id_tugas', $id)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$tugas) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tugas tidak ditemukan'
                ], 404);
            }

            PengumpulanTugas::where('id_tugas', $id)->delete();

            if ($tugas->file_tugas) {
                $filePaths = json_decode($tugas->file_tugas, true);
                if (is_array($filePaths)) {
                    foreach ($filePaths as $path) {
                        if (Storage::disk('public')->exists($path)) {
                            Storage::disk('public')->delete($path);
                        }
                    }
                } else {
                    if (Storage::disk('public')->exists($tugas->file_tugas)) {
                        Storage::disk('public')->delete($tugas->file_tugas);
                    }
                }
            }

            $tugas->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tugas berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            Log::error('Tugas Destroy Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus tugas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send reminder for tugas - 1 notif per peserta (tidak spam)
     * POST /api/mentor/tugas/reminder or /api/mentor/tugas/{id}/reminder
     */
    public function sendReminder(Request $request, $tugasId = null)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $query = Tugas::where('id_mentor', $mentor->id_mentor);

            if ($tugasId) {
                $query->where('id_tugas', $tugasId);
            }

            $tugasList = $query->get();

            if ($tugasList->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada tugas ditemukan'
                ], 404);
            }

            // SIMPAN PESERTA UNIK
            $pesertaReminder = [];

            foreach ($tugasList as $tugas) {
                $belumKumpul = PengumpulanTugas::where('id_tugas', $tugas->id_tugas)
                    ->whereNull('tanggal_kumpul')
                    ->with(['peserta.user'])
                    ->get();

                foreach ($belumKumpul as $pengumpulan) {
                    $peserta = $pengumpulan->peserta;
                    $userPeserta = $peserta->user ?? null;

                    if ($userPeserta) {
                        $idUser = $userPeserta->id_user;

                        if (!isset($pesertaReminder[$idUser])) {
                            $pesertaReminder[$idUser] = [
                                'nama' => $userPeserta->nama,
                                'tugas' => []
                            ];
                        }

                        $pesertaReminder[$idUser]['tugas'][] = $tugas->judul_tugas;
                    }
                }
            }

            // kirim notif 1x per peserta
            $notifikasiTerkirim = 0;
            foreach ($pesertaReminder as $idUser => $data) {
                $daftarTugas = implode(', ', $data['tugas']);
                $jumlahTugas = count($data['tugas']);

                $pesan = "Halo {$data['nama']}, Anda belum mengumpulkan {$jumlahTugas} tugas: {$daftarTugas}. Segera selesaikan tugas Anda!";

                NotifikasiController::kirim(
                    $idUser,
                    '📋 Pengingat Tugas',
                    $pesan
                );

                $notifikasiTerkirim++;
            }

            Log::info('Reminder sent by mentor', [
                'mentor_id' => $mentor->id_mentor,
                'mentor_name' => $user->nama ?? $user->name,
                'unique_peserta' => count($pesertaReminder),
                'notifikasi_terkirim' => $notifikasiTerkirim,
                'tugas_count' => $tugasList->count(),
            ]);

            if (count($pesertaReminder) === 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Semua peserta sudah mengumpulkan tugas. Tidak ada yang perlu diingatkan.',
                    'sent_count' => 0,
                    'notifikasi_terkirim' => 0
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "Pengingat berhasil dikirim ke " . count($pesertaReminder) . " peserta yang belum mengumpulkan tugas",
                'sent_count' => count($pesertaReminder),
                'notifikasi_terkirim' => $notifikasiTerkirim,
            ]);
        } catch (\Exception $e) {
            Log::error('Send Reminder Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim pengingat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get submissions for a tugas
     * GET /api/mentor/tugas/{id}/submissions
     */
    public function getSubmissions($tugasId)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $tugas = Tugas::where('id_tugas', $tugasId)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$tugas) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tugas tidak ditemukan'
                ], 404);
            }

            $submissions = PengumpulanTugas::with(['peserta.user', 'peserta.divisi'])
                ->where('id_tugas', $tugasId)
                ->get();

            $transformedSubmissions = $submissions->map(function ($item) {
                $isSubmitted = !is_null($item->tanggal_kumpul);

                return [
                    'id_pengumpulan' => $item->id_pengumpulan,
                    'id_peserta' => $item->id_peserta,
                    'peserta_nama' => $item->peserta->user->nama ?? 'Unknown',
                    'peserta_divisi' => $item->peserta->divisi->nama_divisi ?? '',
                    'file_jawaban' => $item->file_jawaban,
                    'file_url' => $item->file_jawaban ? Storage::url($item->file_jawaban) : null,
                    'link_jawaban' => $item->link_jawaban ?? null,
                    'status' => $item->status,
                    'nilai' => $item->nilai,
                    'catatan_mentor' => $item->catatan_mentor,
                    'submitted_at' => $isSubmitted ? $item->tanggal_kumpul : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedSubmissions
            ]);
        } catch (\Exception $e) {
            Log::error('Get Submissions Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get submissions by peserta ID
     * GET /api/mentor/tugas/submissions?id_peserta={pesertaId}
     */
    public function getSubmissionByPeserta(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $pesertaId = $request->query('id_peserta');

            if (!$pesertaId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parameter id_peserta diperlukan'
                ], 400);
            }

            $submissions = PengumpulanTugas::with(['tugas'])
                ->where('id_peserta', $pesertaId)
                ->get();

            Log::info("Get submissions for peserta ID: {$pesertaId}, total: " . $submissions->count());

            $transformedSubmissions = $submissions->map(function ($item) {
                // Parse file URLs for tugas
                $tugasFileUrls = [];
                if ($item->tugas && $item->tugas->file_tugas) {
                    $filePaths = json_decode($item->tugas->file_tugas, true);
                    if (is_array($filePaths)) {
                        foreach ($filePaths as $path) {
                            $tugasFileUrls[] = Storage::url($path);
                        }
                    } else {
                        $tugasFileUrls[] = Storage::url($item->tugas->file_tugas);
                    }
                }

                // Parse links for tugas
                $tugasLinks = [];
                if ($item->tugas && $item->tugas->file_link) {
                    $tugasLinks = json_decode($item->tugas->file_link, true);
                    if (!is_array($tugasLinks)) {
                        $tugasLinks = [$item->tugas->file_link];
                    }
                }

                return [
                    'id_pengumpulan' => $item->id_pengumpulan,
                    'id_tugas' => $item->id_tugas,
                    'judul_tugas' => $item->tugas->judul_tugas ?? 'Tugas',
                    'deskripsi_tugas' => $item->tugas->deskripsi ?? '',
                    'deadline' => $item->tugas->deadline ?? null,
                    'status' => $item->status,
                    'nilai' => $item->nilai,
                    'file_jawaban' => $item->file_jawaban,
                    'file_jawaban_url' => $item->file_jawaban ? Storage::url($item->file_jawaban) : null,
                    'link_jawaban' => $item->link_jawaban,
                    'catatan_mentor' => $item->catatan_mentor,
                    'tanggal_kumpul' => $item->tanggal_kumpul,
                    'tugas_file_urls' => $tugasFileUrls,
                    'tugas_file_links' => $tugasLinks,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedSubmissions,
                'total' => $submissions->count(),
                'peserta_id' => $pesertaId
            ]);
        } catch (\Exception $e) {
            Log::error('Get Submission By Peserta Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get peserta by mentor
     * GET /api/mentor/peserta
     */
    public function getPesertaByMentor()
    {
        try {
            $user = Auth::user();
            $mentor = Mentor::where('id_user', $user->id_user)->first();

            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mentor not found'
                ], 404);
            }

            $peserta = Peserta::with('user')
                ->where('id_mentor', $mentor->id_mentor)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $peserta
            ]);
        } catch (\Exception $e) {
            Log::error('Get Peserta By Mentor Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peserta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update submission
     * PUT /api/mentor/tugas/submissions/{id}
     * 
     * 🔥 DIPERBAIKI: Otomatis mengisi nilai berdasarkan deadline jika mentor tidak mengisi manual
     */
    public function updateSubmission(Request $request, $submissionId)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'mentor') {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $request->validate([
                'status'         => 'nullable|in:dikumpulkan,dikumpulkan_revisi,dinilai,selesai,terlambat,revisi,belum_dikumpulkan',
                'catatan_mentor' => 'nullable|string',
                'nilai'          => 'nullable|numeric|min:0|max:100',
            ]);

            $submission = PengumpulanTugas::with(['peserta.user', 'tugas'])->find($submissionId);

            if (!$submission) {
                return response()->json(['success' => false, 'message' => 'Pengumpulan tidak ditemukan'], 404);
            }

            $statusLama = $submission->status;
            $statusBaru = $request->status ?? $submission->status;

            $updateData = [
                'status'         => $statusBaru,
                'catatan_mentor' => $request->catatan_mentor,
            ];

            // 🔥 PERBAIKAN UTAMA: Hitung nilai otomatis jika mentor tidak mengisi manual
            if ($request->has('nilai') && $request->nilai !== null) {
                // Mentor mengisi nilai manual
                $updateData['nilai'] = $request->nilai;
                Log::info("Update Submission: Mentor mengisi nilai manual {$request->nilai} untuk submission {$submissionId}");
            } elseif (in_array($statusBaru, ['selesai', 'dinilai'])) {
                // Mentor mengubah status menjadi selesai/dinilai tanpa mengisi nilai
                // Hitung nilai otomatis berdasarkan tanggal_kumpul vs deadline

                if ($submission->tanggal_kumpul && $submission->tugas && $submission->tugas->deadline) {
                    $tanggalKumpul = strtotime($submission->tanggal_kumpul);
                    $deadline = strtotime($submission->tugas->deadline);

                    if ($tanggalKumpul > $deadline) {
                        $updateData['nilai'] = 50; // Terlambat
                        Log::info("Update Submission: Nilai otomatis 50 (terlambat) untuk submission {$submissionId}");
                    } else {
                        $updateData['nilai'] = 100; // Tepat waktu
                        Log::info("Update Submission: Nilai otomatis 100 (tepat waktu) untuk submission {$submissionId}");
                    }
                } else {
                    $updateData['nilai'] = 0;
                    Log::info("Update Submission: Nilai otomatis 0 (tidak lengkap) untuk submission {$submissionId}");
                }
            }

            $submission->update($updateData);
            $submission->refresh();

            $idUserPeserta = $submission->peserta->user->id_user ?? null;
            $judulTugas    = $submission->tugas->judul_tugas ?? 'Tugas';

            if ($idUserPeserta) {
                if ($statusBaru === 'revisi' && $statusLama !== 'revisi') {
                    NotifikasiController::kirim(
                        $idUserPeserta,
                        '🔄 Tugas Perlu Revisi',
                        "Tugas \"{$judulTugas}\" perlu direvisi. Catatan: " . ($request->catatan_mentor ?? 'Silakan periksa kembali tugas Anda')
                    );
                }

                if (in_array($statusBaru, ['selesai', 'dinilai']) && !in_array($statusLama, ['selesai', 'dinilai'])) {
                    $nilaiText = isset($updateData['nilai']) ? " Nilai: {$updateData['nilai']}" : "";
                    NotifikasiController::kirim(
                        $idUserPeserta,
                        '✅ Tugas Telah Dinilai',
                        "Tugas \"{$judulTugas}\" telah dinilai oleh mentor." . $nilaiText
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Validasi berhasil disimpan',
                'data'    => $submission
            ]);
        } catch (\Exception $e) {
            Log::error('Update Submission Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get tugas untuk peserta yang login
     * GET /api/peserta/tugas
     * 
     * 🔥 DIPERBAIKI - Status dari database TIDAK direset oleh deadline
     */
    public function getTugasPeserta()
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'peserta') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $peserta = Peserta::where('id_user', $user->id_user)->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }

            $tugas = PengumpulanTugas::with(['tugas'])
                ->where('id_peserta', $peserta->id_peserta)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($item) {
                    // Parse file URLs
                    $fileUrls = [];
                    if ($item->tugas && $item->tugas->file_tugas) {
                        $filePaths = json_decode($item->tugas->file_tugas, true);
                        if (is_array($filePaths)) {
                            foreach ($filePaths as $path) {
                                $fileUrls[] = Storage::url($path);
                            }
                        } else {
                            $fileUrls[] = Storage::url($item->tugas->file_tugas);
                        }
                    }

                    // Parse links
                    $links = [];
                    if ($item->tugas && $item->tugas->file_link) {
                        $links = json_decode($item->tugas->file_link, true);
                        if (!is_array($links)) {
                            $links = [$item->tugas->file_link];
                        }
                    }

                    $deadline = null;
                    if ($item->tugas && $item->tugas->deadline) {
                        $deadline = $item->tugas->deadline->format('Y-m-d H:i:s');
                    }

                    // 🔥 PERBAIKAN UTAMA 🔥
                    // Ambil status dari database (tabel pengumpulan_tugas)
                    $statusFromDb = $item->status;
                    $finalStatus = $statusFromDb;

                    // Hanya status 'belum_dikumpulkan' yang bisa berubah menjadi 'terlambat' jika melewati deadline
                    if ($statusFromDb === 'belum_dikumpulkan') {
                        if ($item->tugas && $item->tugas->deadline) {
                            $deadlineDate = $item->tugas->deadline;
                            if (now()->gt($deadlineDate)) {
                                $finalStatus = 'terlambat';
                            }
                        }
                    }
                    // Status lainnya (dikumpulkan, dikumpulkan_revisi, revisi, dinilai, selesai)
                    // tetap dipertahankan apa adanya - TIDAK diubah oleh deadline!

                    return [
                        'id_pengumpulan' => $item->id_pengumpulan,
                        'id_tugas' => $item->id_tugas,
                        'judul_tugas' => $item->tugas->judul_tugas ?? 'Tugas',
                        'deskripsi' => $item->tugas->deskripsi ?? '',
                        'deadline' => $deadline,
                        'status' => $finalStatus,
                        'nilai' => $item->nilai,
                        'tanggal_kumpul' => $item->tanggal_kumpul,
                        'file_tugas_urls' => $fileUrls,
                        'file_tugas_links' => $links,
                        'file_jawaban_url' => $item->file_jawaban ? Storage::url($item->file_jawaban) : null,
                        'link_jawaban' => $item->link_jawaban,
                        'catatan_mentor' => $item->catatan_mentor,
                    ];
                });

            return response()->json([
                'success' => true,
                'data'    => $tugas,
            ]);
        } catch (\Exception $e) {
            Log::error('Get Tugas Peserta Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detail tugas peserta
     * GET /api/peserta/tugas/{id}
     * 
     * 🔥 DIPERBAIKI - Status dari database TIDAK direset oleh deadline
     */
    public function getTugasDetail($id)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'peserta') {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $peserta = Peserta::where('id_user', $user->id_user)->first();

            if (!$peserta) {
                return response()->json(['success' => false, 'message' => 'Data peserta tidak ditemukan'], 404);
            }

            $pengumpulan = PengumpulanTugas::with(['tugas'])
                ->where('id_pengumpulan', $id)
                ->where('id_peserta', $peserta->id_peserta)
                ->first();

            if (!$pengumpulan) {
                return response()->json(['success' => false, 'message' => 'Tugas tidak ditemukan'], 404);
            }

            // Parse file URLs for tugas
            $tugasFileUrls = [];
            if ($pengumpulan->tugas && $pengumpulan->tugas->file_tugas) {
                $filePaths = json_decode($pengumpulan->tugas->file_tugas, true);
                if (is_array($filePaths)) {
                    foreach ($filePaths as $path) {
                        $tugasFileUrls[] = Storage::url($path);
                    }
                } else {
                    $tugasFileUrls[] = Storage::url($pengumpulan->tugas->file_tugas);
                }
            }

            // Parse links for tugas
            $tugasLinks = [];
            if ($pengumpulan->tugas && $pengumpulan->tugas->file_link) {
                $tugasLinks = json_decode($pengumpulan->tugas->file_link, true);
                if (!is_array($tugasLinks)) {
                    $tugasLinks = [$pengumpulan->tugas->file_link];
                }
            }

            // 🔥 PERBAIKAN UTAMA untuk detail 🔥
            $statusFromDb = $pengumpulan->status;
            $finalStatus = $statusFromDb;

            // Hanya 'belum_dikumpulkan' yang bisa berubah jadi 'terlambat'
            if ($statusFromDb === 'belum_dikumpulkan') {
                if ($pengumpulan->tugas && $pengumpulan->tugas->deadline) {
                    if (now()->gt($pengumpulan->tugas->deadline)) {
                        $finalStatus = 'terlambat';
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $pengumpulan->id_pengumpulan,
                    'id_tugas' => $pengumpulan->id_tugas,
                    'judul' => $pengumpulan->tugas->judul_tugas ?? '-',
                    'deskripsi' => $pengumpulan->tugas->deskripsi ?? '-',
                    'deadline' => $pengumpulan->tugas->deadline ?? null,
                    'status' => $finalStatus,
                    'submitted_at' => $pengumpulan->tanggal_kumpul,
                    'nilai' => $pengumpulan->nilai,
                    'catatan' => $pengumpulan->catatan_mentor,
                    'file_url' => $pengumpulan->file_jawaban ? Storage::url($pengumpulan->file_jawaban) : null,
                    'file_name' => $pengumpulan->file_jawaban ? basename($pengumpulan->file_jawaban) : null,
                    'submission_link' => $pengumpulan->link_jawaban ?? null,
                    'tugas_file_urls' => $tugasFileUrls,
                    'tugas_file_links' => $tugasLinks,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Get Tugas Detail Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Submit tugas peserta (DIPERBAIKI - Mendukung file dan link bersamaan)
     * POST /api/peserta/tugas/{id}/submit
     * 
     * 🔥 PERBAIKAN: Sekarang bisa menyimpan file dan link secara bersamaan
     */
    public function submitTugas(Request $request, $id)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'peserta') {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $peserta = Peserta::with('user')->where('id_user', $user->id_user)->first();

            if (!$peserta) {
                return response()->json(['success' => false, 'message' => 'Data peserta tidak ditemukan'], 404);
            }

            $pengumpulan = PengumpulanTugas::with('tugas')
                ->where('id_pengumpulan', $id)
                ->where('id_peserta', $peserta->id_peserta)
                ->first();

            if (!$pengumpulan) {
                return response()->json(['success' => false, 'message' => 'Tugas tidak ditemukan'], 404);
            }

            // Simpan status SEBELUM update untuk keperluan notifikasi
            $statusSebelumnya = $pengumpulan->status;

            $sekarang  = now();
            $deadline  = $pengumpulan->tugas->deadline;

            // ✅ Tentukan status berdasarkan apakah ini revisi atau bukan
            if ($statusSebelumnya === 'revisi') {
                // Jika sebelumnya revisi, status menjadi 'dikumpulkan_revisi' (menunggu review ulang)
                $statusOtomatis = 'dikumpulkan_revisi';
            } else {
                // Submit pertama kali atau submit ulang setelah deadline
                $statusOtomatis = $sekarang->lte($deadline) ? 'dikumpulkan' : 'terlambat';
            }

            $data = [
                'status'         => $statusOtomatis,
                'tanggal_kumpul' => $sekarang,
                'catatan_mentor' => null, // Reset catatan revisi saat submit ulang
            ];

            // 🔥 PERBAIKAN: Hapus file lama jika ada file baru diupload
            if ($request->hasFile('file_jawaban')) {
                if ($pengumpulan->file_jawaban && Storage::disk('public')->exists($pengumpulan->file_jawaban)) {
                    Storage::disk('public')->delete($pengumpulan->file_jawaban);
                }
                $file     = $request->file('file_jawaban');
                $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
                $path     = $file->storeAs('jawaban_tugas', $filename, 'public');
                $data['file_jawaban'] = $path;
                // 🔥 JANGAN SET link_jawaban = null
            }

            // 🔥 PERBAIKAN: Update link jika ada, JANGAN mengosongkan file_jawaban
            if ($request->has('link_jawaban') && !empty($request->link_jawaban)) {
                $data['link_jawaban'] = $request->link_jawaban;
                // 🔥 HAPUS baris yang mengosongkan file_jawaban
            }

            $pengumpulan->update($data);
            $pengumpulan->refresh();

            $mentor = Mentor::with('user')->where('id_mentor', $peserta->id_mentor)->first();
            if ($mentor && $mentor->user) {
                $statusText = $statusOtomatis === 'terlambat' ? '(Terlambat)' : '(Tepat waktu)';
                $revisiText = $statusSebelumnya === 'revisi' ? ' (Revisi)' : '';

                NotifikasiController::kirim(
                    $mentor->user->id_user,
                    '📝 Tugas Dikumpulkan',
                    "Peserta {$user->nama} telah mengumpulkan tugas \"{$pengumpulan->tugas->judul_tugas}\" {$statusText}{$revisiText}"
                );
            }

            $message = $statusSebelumnya === 'revisi'
                ? 'Revisi tugas berhasil dikirim'
                : 'Tugas berhasil dikumpulkan';

            return response()->json([
                'success' => true,
                'message' => $message,
                'data'    => [
                    'status'          => $pengumpulan->status,
                    'submitted_at'    => $pengumpulan->tanggal_kumpul,
                    'file_url'        => $pengumpulan->file_jawaban ? Storage::url($pengumpulan->file_jawaban) : null,
                    'file_name'       => $pengumpulan->file_jawaban ? basename($pengumpulan->file_jawaban) : null,
                    'submission_link' => $pengumpulan->link_jawaban,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Submit Tugas Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Cancel submission tugas peserta
     * POST /api/peserta/tugas/{id}/cancel
     */
    public function cancelSubmitTugas($id)
    {
        try {
            $user = Auth::user();

            $peserta = Peserta::where('id_user', $user->id_user)->first();

            if (!$peserta) {
                return response()->json(['success' => false, 'message' => 'Data peserta tidak ditemukan'], 404);
            }

            $pengumpulan = PengumpulanTugas::where('id_pengumpulan', $id)
                ->where('id_peserta', $peserta->id_peserta)
                ->first();

            if (!$pengumpulan) {
                return response()->json(['success' => false, 'message' => 'Tugas tidak ditemukan'], 404);
            }

            if ($pengumpulan->file_jawaban && Storage::disk('public')->exists($pengumpulan->file_jawaban)) {
                Storage::disk('public')->delete($pengumpulan->file_jawaban);
            }

            $pengumpulan->update([
                'status'         => 'belum_dikumpulkan',
                'tanggal_kumpul' => null,
                'file_jawaban'   => null,
                'link_jawaban'   => null,
                'catatan_mentor' => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pengumpulan tugas dibatalkan',
            ]);
        } catch (\Exception $e) {
            Log::error('Cancel Submit Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
