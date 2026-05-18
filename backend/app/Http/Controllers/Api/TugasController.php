<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use App\Models\Mentor;
use App\Models\Peserta;
use App\Models\PengumpulanTugas;
use Illuminate\Http\Request;
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
                // Ambil data pengumpulan untuk tugas ini (hanya peserta yang ditujukan)
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
                        if ($pengumpulan->status === 'dikumpulkan') {
                            $pendingReview++;
                        }
                    }
                    
                    $submissions[] = [
                        'peserta_id' => $pengumpulan->id_peserta,
                        'peserta_nama' => $pengumpulan->peserta->user->nama ?? 'Unknown',
                        'status' => $pengumpulan->status,
                        'submitted_at' => $pengumpulan->tanggal_kumpul,
                        'catatan' => $pengumpulan->catatan_mentor,
                    ];
                }

                return [
                    'id_tugas' => $item->id_tugas,
                    'judul' => $item->judul_tugas,
                    'deskripsi' => $item->deskripsi,
                    'deadline' => $item->deadline->format('Y-m-d'),
                    'bobot' => 0,
                    'status' => $item->status_tugas,
                    'created_at' => $item->created_at,
                    'file_tugas' => $item->file_tugas,
                    'file_url' => $item->file_tugas ? Storage::url($item->file_tugas) : null,
                    'file_link' => $item->file_link,
                    'link_type' => $item->link_type,
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

            return response()->json([
                'success' => true,
                'data' => [
                    'id_tugas' => $tugas->id_tugas,
                    'judul' => $tugas->judul_tugas,
                    'deskripsi' => $tugas->deskripsi,
                    'deadline' => $tugas->deadline->format('Y-m-d'),
                    'file_tugas' => $tugas->file_tugas,
                    'file_url' => $tugas->file_tugas ? Storage::url($tugas->file_tugas) : null,
                    'file_link' => $tugas->file_link,
                    'link_type' => $tugas->link_type,
                    'id_divisi' => $tugas->id_divisi,
                    'divisi' => $tugas->divisi ? $tugas->divisi->nama_divisi : null,
                    'created_at' => $tugas->created_at,
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
     * Create new tugas
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

            // Validasi
            $rules = [
                'judul' => 'required|string|max:255',
                'deskripsi' => 'nullable|string',
                'deadline' => 'required|date',
                'id_peserta' => 'required',
                'file_tugas' => 'nullable|file|max:10240',
                'file_link' => 'nullable|string|max:500',
                'link_type' => 'nullable|string|max:50',
            ];

            $request->validate($rules);

            DB::beginTransaction();

            // Parse id_peserta
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

            // Data tugas
            $data = [
                'id_mentor' => $mentor->id_mentor,
                'judul_tugas' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'deadline' => $request->deadline,
                'id_divisi' => $mentor->id_divisi,
            ];

            // Handle file upload
            if ($request->hasFile('file_tugas')) {
                $file = $request->file('file_tugas');
                $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
                $path = $file->storeAs('tugas', $filename, 'public');
                $data['file_tugas'] = $path;
            }
            
            // Handle file link
            if ($request->has('file_link') && !empty($request->file_link)) {
                $data['file_link'] = $request->file_link;
                $data['link_type'] = $request->link_type ?? null;
            }

            // Buat tugas
            $tugas = Tugas::create($data);

            // Buat pengumpulan tugas untuk setiap peserta
            foreach ($idPesertaList as $idPeserta) {
                // Cek apakah peserta ada di bawah bimbingan mentor ini
                $peserta = Peserta::where('id_peserta', $idPeserta)
                    ->where('id_mentor', $mentor->id_mentor)
                    ->first();
                
                if ($peserta) {
                    PengumpulanTugas::create([
                        'id_tugas' => $tugas->id_tugas,
                        'id_peserta' => $idPeserta,
                        'status' => 'dikumpulkan',
                        'tanggal_kumpul' => null,
                        'catatan_mentor' => null,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tugas berhasil ditambahkan',
                'data' => [
                    'id_tugas' => $tugas->id_tugas,
                    'judul' => $tugas->judul_tugas,
                    'file_tugas' => $tugas->file_tugas,
                    'file_url' => $tugas->file_tugas ? Storage::url($tugas->file_tugas) : null,
                    'file_link' => $tugas->file_link,
                    'link_type' => $tugas->link_type,
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
                'file_tugas' => 'nullable|file|max:10240',
                'id_divisi' => 'nullable|exists:divisis,id_divisi',
                'file_link' => 'nullable|string|max:500',
                'link_type' => 'nullable|string|max:50',
            ];

            $request->validate($rules);

            DB::beginTransaction();

            $data = [
                'judul_tugas' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'deadline' => $request->deadline,
                'id_divisi' => $request->id_divisi ?? $mentor->id_divisi,
            ];

            if ($request->hasFile('file_tugas')) {
                if ($tugas->file_tugas && Storage::disk('public')->exists($tugas->file_tugas)) {
                    Storage::disk('public')->delete($tugas->file_tugas);
                }
                
                $file = $request->file('file_tugas');
                $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
                $path = $file->storeAs('tugas', $filename, 'public');
                $data['file_tugas'] = $path;
                
                // Hapus link jika upload file baru
                $data['file_link'] = null;
                $data['link_type'] = null;
            }
            
            // Handle file link update
            if ($request->has('file_link') && !empty($request->file_link)) {
                $data['file_link'] = $request->file_link;
                $data['link_type'] = $request->link_type ?? null;
                
                // Hapus file jika ada link baru
                if ($tugas->file_tugas && Storage::disk('public')->exists($tugas->file_tugas)) {
                    Storage::disk('public')->delete($tugas->file_tugas);
                }
                $data['file_tugas'] = null;
            }

            $tugas->update($data);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tugas berhasil diupdate'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
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

            // Hapus semua pengumpulan tugas terkait
            PengumpulanTugas::where('id_tugas', $id)->delete();

            // Hapus file jika ada
            if ($tugas->file_tugas && Storage::disk('public')->exists($tugas->file_tugas)) {
                Storage::disk('public')->delete($tugas->file_tugas);
            }

            // Hapus tugas
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
     * Send reminder for tugas
     * POST /api/mentor/tugas/reminder
     * POST /api/mentor/tugas/{id}/reminder
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

            // Ambil daftar tugas
            $query = Tugas::where('id_mentor', $mentor->id_mentor);
            
            // Jika ada tugasId spesifik, filter berdasarkan id
            if ($tugasId) {
                $query->where('id_tugas', $tugasId);
            }
            
            $tugasList = $query->get();
            
            if ($tugasList->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada tugas yang ditemukan'
                ], 404);
            }
            
            $reminderDetails = [];
            $totalPeserta = 0;
            
            foreach ($tugasList as $tugas) {
                // Ambil peserta yang BELUM mengumpulkan tugas
                $belumKumpul = PengumpulanTugas::where('id_tugas', $tugas->id_tugas)
                    ->whereNull('tanggal_kumpul')
                    ->with(['peserta.user'])
                    ->get();
                
                foreach ($belumKumpul as $pengumpulan) {
                    $peserta = $pengumpulan->peserta;
                    $userPeserta = $peserta->user ?? null;
                    
                    $reminderDetails[] = [
                        'tugas_id' => $tugas->id_tugas,
                        'tugas_judul' => $tugas->judul_tugas,
                        'peserta_id' => $peserta->id_peserta,
                        'peserta_nama' => $peserta->nama ?? ($userPeserta->nama ?? 'Unknown'),
                        'peserta_email' => $userPeserta->email ?? '-',
                        'deadline' => $tugas->deadline->format('Y-m-d H:i:s'),
                    ];
                    
                    $totalPeserta++;
                }
            }

            // Log pengiriman reminder
            Log::info('Reminder sent by mentor', [
                'mentor_id' => $mentor->id_mentor,
                'mentor_name' => $user->nama ?? $user->name,
                'total_reminders' => $totalPeserta,
                'tugas_count' => $tugasList->count(),
                'details' => $reminderDetails
            ]);

            if ($totalPeserta === 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Semua peserta sudah mengumpulkan tugas. Tidak ada yang perlu diingatkan.',
                    'data' => [
                        'total_reminders' => 0,
                        'reminders' => []
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "Pengingat berhasil dikirim untuk {$totalPeserta} peserta yang belum mengumpulkan tugas",
                'data' => [
                    'total_reminders' => $totalPeserta,
                    'tugas_count' => $tugasList->count(),
                    'reminders' => $reminderDetails
                ]
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

            $submissions = PengumpulanTugas::with(['peserta.user'])
                ->where('id_tugas', $tugasId)
                ->get();

            $transformedSubmissions = $submissions->map(function ($item) {
                return [
                    'id_pengumpulan' => $item->id_pengumpulan,
                    'id_peserta' => $item->id_peserta,
                    'peserta_nama' => $item->peserta->user->nama ?? 'Unknown',
                    'file_jawaban' => $item->file_jawaban,
                    'file_url' => $item->file_jawaban ? Storage::url($item->file_jawaban) : null,
                    'link_jawaban' => $item->link_jawaban,
                    'status' => $item->status,
                    'catatan_mentor' => $item->catatan_mentor,
                    'submitted_at' => $item->tanggal_kumpul ?? $item->created_at,
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
     * Update submission (status and feedback only - NO nilai)
     * PUT /api/mentor/tugas/submissions/{id}
     */
    public function updateSubmission(Request $request, $submissionId)
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // 🔥 VALIDASI - HAPUS VALIDASI NILAI KARENA KOLOM NILAI TIDAK ADA
            $request->validate([
                'status' => 'nullable|in:dikumpulkan,dinilai,selesai,terlambat,revisi',
                'catatan_mentor' => 'nullable|string',
            ]);

            $submission = PengumpulanTugas::find($submissionId);
            
            if (!$submission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengumpulan tidak ditemukan'
                ], 404);
            }

            // 🔥 UPDATE - HAPUS NILAI KARENA KOLOM NILAI TIDAK ADA
            $submission->update([
                'status' => $request->status ?? $submission->status,
                'catatan_mentor' => $request->catatan_mentor,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Review berhasil disimpan',
                'data' => $submission
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Update Submission Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan review: ' . $e->getMessage()
            ], 500);
        }
    }
}