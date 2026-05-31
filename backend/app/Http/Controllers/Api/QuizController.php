<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kuis;
use App\Models\JawabanKuis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class QuizController extends Controller
{
    public function index()
    {
        try {
            $quizzes = Kuis::orderBy('created_at', 'desc')->get();

            $quizzes = $quizzes->map(function ($quiz) {
                return [
                    'id' => $quiz->id_kuis,
                    'id_kuis' => $quiz->id_kuis,
                    'title' => $quiz->judul_kuis,
                    'judul' => $quiz->judul_kuis,
                    'judul_kuis' => $quiz->judul_kuis,
                    'deskripsi' => $quiz->deskripsi,
                    'divisi' => $quiz->divisi,
                    'duration' => $quiz->durasi,
                    'durasi' => $quiz->durasi,
                    'passing' => $quiz->passing ?? 75,
                    'level' => $quiz->level ?? 1,
                    'total_soal' => $quiz->total_soal,
                    'questions' => $quiz->questions,
                    'participants' => $quiz->peserta,
                    'peserta' => $quiz->peserta,
                    'tanggal_mulai' => $quiz->tanggal_mulai,
                    'tanggal_selesai' => $quiz->tanggal_selesai,
                    'created_at' => $quiz->created_at,
                    'updated_at' => $quiz->updated_at,
                    'status' => $quiz->status ?? 'nonaktif',
                    'is_aktif' => $quiz->is_aktif,
                    'is_selesai' => $quiz->is_selesai,
                    'is_belum_mulai' => $quiz->is_belum_mulai,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $quizzes
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error index quiz: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kuis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all jawaban kuis with user details
     * GET /api/jawaban-kuis/all
     */
    public function getAllJawabanKuis()
    {
        try {
            if (!Schema::hasTable('jawaban_kuis')) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Tabel jawaban_kuis belum ada'
                ]);
            }

            $jawaban = DB::table('jawaban_kuis as jk')
                ->leftJoin('users as u', 'jk.id_user', '=', 'u.id_user')
                ->leftJoin('pesertas as p', 'u.id_user', '=', 'p.id_user')
                ->leftJoin('divisis as d', 'p.id_divisi', '=', 'd.id_divisi')
                ->select(
                    'jk.id_user',
                    'u.nama as user_name',
                    'u.email as user_email',
                    'd.nama_divisi as divisi',
                    'jk.id_kuis',
                    'jk.skor',
                    'jk.attempt',
                    'jk.created_at'
                )
                ->orderBy('jk.created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $jawaban,
                'total' => $jawaban->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error getAllJawabanKuis: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get jawaban kuis by user ID
     * GET /api/jawaban-kuis/user/{userId}
     */
    public function getJawabanKuisByUser($userId)
    {
        try {
            if (!Schema::hasTable('jawaban_kuis')) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $jawaban = DB::table('jawaban_kuis as jk')
                ->leftJoin('kuis as k', 'jk.id_kuis', '=', 'k.id_kuis')
                ->select(
                    'jk.id_user',
                    'jk.id_kuis',
                    'k.level as quiz_level',
                    'k.judul_kuis as quiz_title',
                    'k.passing as passing_score',
                    'jk.skor',
                    'jk.attempt',
                    'jk.created_at'
                )
                ->where('jk.id_user', $userId)
                ->orderBy('jk.created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $jawaban
            ]);
        } catch (\Exception $e) {
            Log::error('Error getJawabanKuisByUser: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get learning progress per user based on completed levels
     * Returns detailed results for COO dashboard
     */
    public function getAllResults()
    {
        try {
            // Cek apakah tabel jawaban_kuis ada
            if (!Schema::hasTable('jawaban_kuis')) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Tabel jawaban_kuis belum ada'
                ]);
            }

            // Ambil semua data jawaban kuis dengan detail user dan kuis
            $results = DB::table('jawaban_kuis as jk')
                ->leftJoin('users as u', 'jk.id_user', '=', 'u.id_user')
                ->leftJoin('pesertas as p', 'u.id_user', '=', 'p.id_user')
                ->leftJoin('divisis as d', 'p.id_divisi', '=', 'd.id_divisi')
                ->leftJoin('kuis as k', 'jk.id_kuis', '=', 'k.id_kuis')
                ->select(
                    'jk.id_user',
                    'u.nama as user_name',
                    'u.email as user_email',
                    'd.nama_divisi as user_divisi',
                    'k.id_kuis',
                    'k.judul_kuis as quiz_title',
                    'k.level as quiz_level',
                    'k.passing as passing_score',
                    'jk.skor as score',
                    'jk.attempt',
                    'jk.created_at'
                )
                ->orderBy('jk.created_at', 'desc')
                ->get();

            Log::info('Hasil query jawaban_kuis: ' . $results->count() . ' records');

            if ($results->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Belum ada data jawaban kuis'
                ]);
            }

            // Kelompokkan berdasarkan user untuk mendapatkan semua detail
            $userResults = [];
            foreach ($results as $item) {
                $userId = $item->id_user;
                
                if (!isset($userResults[$userId])) {
                    $userResults[$userId] = [
                        'user_id' => $userId,
                        'user_name' => $item->user_name ?? 'Pengguna',
                        'user_email' => $item->user_email ?? '',
                        'divisi' => $item->user_divisi ?? 'Umum',
                        'quizzes' => []
                    ];
                }
                
                // Tambahkan detail kuis
                $userResults[$userId]['quizzes'][] = [
                    'id_kuis' => $item->id_kuis,
                    'quiz_title' => $item->quiz_title ?? 'Kuis',
                    'level' => (int) ($item->quiz_level ?? 1),
                    'score' => (int) ($item->score ?? 0),
                    'passing_score' => (int) ($item->passing_score ?? 75),
                    'status' => ((int) ($item->score ?? 0) >= (int) ($item->passing_score ?? 75)) ? 'lulus' : 'tidak_lulus',
                    'attempt' => $item->attempt ?? 1,
                    'tanggal' => $item->created_at
                ];
            }

            // Untuk setiap user, urutkan quizzes berdasarkan level dan ambil skor tertinggi per level
            $formattedResults = [];
            foreach ($userResults as $user) {
                // Kelompokkan per level dan ambil skor tertinggi
                $bestPerLevel = [];
                foreach ($user['quizzes'] as $quiz) {
                    $level = $quiz['level'];
                    if (!isset($bestPerLevel[$level]) || $quiz['score'] > $bestPerLevel[$level]['score']) {
                        $bestPerLevel[$level] = $quiz;
                    }
                }
                
                // Hitung level tertinggi yang lulus
                $highestPassedLevel = 0;
                $allQuizzes = [];
                foreach ($bestPerLevel as $level => $quiz) {
                    $allQuizzes[] = $quiz;
                    if ($quiz['status'] === 'lulus' && $level > $highestPassedLevel) {
                        $highestPassedLevel = $level;
                    }
                }
                
                // Urutkan berdasarkan level
                usort($allQuizzes, function($a, $b) {
                    return $a['level'] - $b['level'];
                });
                
                $completedLevels = $highestPassedLevel;
                $totalLevels = 4; // Level 1,2,3,4
                $currentLevel = $highestPassedLevel + 1;
                $isLocked = ($currentLevel > 1 && !$this->isLevelUnlocked($allQuizzes, $currentLevel - 1));
                
                $formattedResults[] = [
                    'id' => $user['user_id'],
                    'user_id' => $user['user_id'],
                    'user_name' => $user['user_name'],
                    'user_email' => $user['user_email'],
                    'user_divisi' => $user['divisi'],
                    'quizzes' => $allQuizzes,
                    'completed_levels' => $completedLevels,
                    'total_levels' => $totalLevels,
                    'current_level' => $currentLevel,
                    'is_locked' => $isLocked,
                    'progress' => round(($completedLevels / $totalLevels) * 100),
                    'status' => $completedLevels >= $totalLevels ? 'Completed' : ($completedLevels > 0 ? 'In Progress' : 'Not Started')
                ];
            }

            Log::info('User progress results: ' . count($formattedResults));

            return response()->json([
                'success' => true,
                'data' => $formattedResults,
                'total_users' => count($formattedResults)
            ]);

        } catch (\Exception $e) {
            Log::error('Error getAllResults: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper function to check if a level is unlocked
     */
    private function isLevelUnlocked($quizzes, $level)
    {
        foreach ($quizzes as $quiz) {
            if ($quiz['level'] == $level && $quiz['status'] === 'lulus') {
                return true;
            }
        }
        return false;
    }

    /**
     * Get quiz results by quiz ID
     */
    public function getResultsByQuiz($quizId)
    {
        try {
            if (!Schema::hasTable('jawaban_kuis')) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $results = DB::table('jawaban_kuis as jk')
                ->leftJoin('users as u', 'jk.id_user', '=', 'u.id_user')
                ->leftJoin('pesertas as p', 'u.id_user', '=', 'p.id_user')
                ->leftJoin('divisis as d', 'p.id_divisi', '=', 'd.id_divisi')
                ->select(
                    'jk.id_user',
                    'u.nama as user_name',
                    'd.nama_divisi as divisi',
                    'jk.skor as score',
                    'jk.attempt',
                    'jk.created_at'
                )
                ->where('jk.id_kuis', $quizId)
                ->orderBy('jk.skor', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $results
            ]);
        } catch (\Exception $e) {
            Log::error('Error getResultsByQuiz: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export all quiz results to Excel
     */
    public function exportResults()
    {
        try {
            $results = DB::table('jawaban_kuis as jk')
                ->leftJoin('users as u', 'jk.id_user', '=', 'u.id_user')
                ->leftJoin('pesertas as p', 'u.id_user', '=', 'p.id_user')
                ->leftJoin('divisis as d', 'p.id_divisi', '=', 'd.id_divisi')
                ->leftJoin('kuis as k', 'jk.id_kuis', '=', 'k.id_kuis')
                ->select(
                    'u.nama as nama_peserta',
                    'u.email as email',
                    'd.nama_divisi as divisi',
                    'k.judul_kuis as judul_kuis',
                    'k.level as level',
                    'jk.skor as nilai',
                    'k.passing as passing_score',
                    'jk.attempt as attempt',
                    'jk.created_at as tanggal'
                )
                ->orderBy('jk.created_at', 'desc')
                ->get();

            // Convert to array for export
            $exportArray = $results->map(function ($item) {
                return [
                    'Nama Peserta' => $item->nama_peserta,
                    'Email' => $item->email,
                    'Divisi' => $item->divisi ?? '-',
                    'Judul Kuis' => $item->judul_kuis,
                    'Level' => $item->level,
                    'Nilai' => $item->nilai,
                    'Passing Score' => $item->passing_score,
                    'Status' => ($item->nilai >= $item->passing_score) ? 'Lulus' : 'Tidak Lulus',
                    'Attempt' => $item->attempt,
                    'Tanggal' => $item->tanggal
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $exportArray,
                'count' => $exportArray->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error exportResults: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ========== METHOD LAINNYA (store, show, update, destroy, dll) SAMA PERSIS DENGAN FILE ANDA ==========
    
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'judul' => 'required|string|max:150',
                'judul_kuis' => 'required|string|max:150',
                'deskripsi' => 'nullable|string',
                'divisi' => 'nullable|string|max:100',
                'durasi' => 'nullable|integer|min:1|max:180',
                'passing' => 'nullable|integer|min:0|max:100',
                'level' => 'required|integer|min:1|max:3',
                'questions' => 'nullable|array',
                'total_soal' => 'nullable|integer',
                'tanggal_mulai' => 'required|date',
                'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $cekLevel = Kuis::where('divisi', $request->divisi)
                ->where('level', $request->level)
                ->exists();

            if ($cekLevel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kuis level ' . $request->level . ' untuk divisi ini sudah ada.'
                ], 422);
            }

            $judul = $request->judul ?? $request->judul_kuis;

            $quiz = Kuis::create([
                'judul_kuis'      => $judul,
                'deskripsi'       => $request->deskripsi,
                'divisi'          => $request->divisi,
                'durasi'          => $request->durasi ?? 30,
                'passing'         => $request->passing ?? 75,
                'level'           => $request->level ?? 1,
                'status'          => 'aktif',
                'total_soal'      => count($request->questions ?? []),
                'questions'       => $request->questions,
                'peserta'         => 0,
                'tanggal_mulai'   => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
            ]);

            if ($request->questions && count($request->questions) > 0) {
                foreach ($request->questions as $index => $q) {
                    $options = $q['options'] ?? [];

                    $opsiA = $options[0] ?? '';
                    $opsiB = $options[1] ?? '';
                    $opsiC = $options[2] ?? '';
                    $opsiD = $options[3] ?? '';

                    $correctIndex = $q['correct'] ?? 0;
                    $jawabanBenar = chr(65 + (int)$correctIndex);

                    \App\Models\SoalKuis::create([
                        'id_kuis'       => $quiz->id_kuis,
                        'pertanyaan'    => $q['text'] ?? $q['pertanyaan'] ?? $q['soal'] ?? '',
                        'opsi_a'        => $opsiA,
                        'opsi_b'        => $opsiB,
                        'opsi_c'        => $opsiC,
                        'opsi_d'        => $opsiD,
                        'jawaban_benar' => $jawabanBenar,
                    ]);

                    Log::info("Soal ke-" . ($index + 1) . " berhasil disimpan ke soal_kuis untuk kuis id: " . $quiz->id_kuis);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Kuis berhasil dibuat',
                'data'    => $quiz
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error store quiz: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat kuis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $quiz = Kuis::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $quiz->id_kuis,
                    'id_kuis' => $quiz->id_kuis,
                    'title' => $quiz->judul_kuis,
                    'judul' => $quiz->judul_kuis,
                    'judul_kuis' => $quiz->judul_kuis,
                    'deskripsi' => $quiz->deskripsi,
                    'divisi' => $quiz->divisi,
                    'duration' => $quiz->durasi,
                    'durasi' => $quiz->durasi,
                    'passing' => $quiz->passing ?? 75,
                    'total_soal' => $quiz->total_soal,
                    'questions' => $quiz->questions,
                    'participants' => $quiz->peserta,
                    'peserta' => $quiz->peserta,
                    'tanggal_mulai' => $quiz->tanggal_mulai,
                    'tanggal_selesai' => $quiz->tanggal_selesai,
                    'created_at' => $quiz->created_at,
                    'updated_at' => $quiz->updated_at,
                    'status' => $quiz->status ?? 'nonaktif',
                    'is_aktif' => $quiz->is_aktif,
                    'is_selesai' => $quiz->is_selesai,
                    'is_belum_mulai' => $quiz->is_belum_mulai,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Kuis tidak ditemukan'
            ], 404);
        }
    }

    public function update(Request $request, int $id)
    {
        try {
            $quiz = Kuis::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'judul'          => 'sometimes|string|max:150',
                'judul_kuis'     => 'sometimes|string|max:150',
                'deskripsi'      => 'nullable|string',
                'divisi'         => 'nullable|string|max:100',
                'durasi'         => 'nullable|integer|min:1|max:180',
                'passing'        => 'nullable|integer|min:0|max:100',
                'status'         => 'sometimes|in:aktif,nonaktif',
                'questions'      => 'nullable|array',
                'tanggal_mulai'  => 'nullable|date',
                'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors'  => $validator->errors()
                ], 422);
            }

            if ($request->has('judul') || $request->has('judul_kuis')) {
                $quiz->judul_kuis = $request->judul ?? $request->judul_kuis;
            }
            if ($request->has('deskripsi'))      $quiz->deskripsi       = $request->deskripsi;
            if ($request->has('divisi'))         $quiz->divisi          = $request->divisi;
            if ($request->has('durasi'))         $quiz->durasi          = $request->durasi;
            if ($request->has('passing'))        $quiz->passing         = $request->passing;
            if ($request->has('status'))         $quiz->status          = $request->status;
            if ($request->has('tanggal_mulai'))  $quiz->tanggal_mulai   = $request->tanggal_mulai;
            if ($request->has('tanggal_selesai')) $quiz->tanggal_selesai = $request->tanggal_selesai;

            if ($request->has('questions')) {
                $quiz->questions  = $request->questions;
                $quiz->total_soal = count($request->questions);

                \App\Models\SoalKuis::where('id_kuis', $quiz->id_kuis)->delete();

                foreach ($request->questions as $index => $q) {
                    $options = $q['options'] ?? [];

                    $opsiA = $options[0] ?? '';
                    $opsiB = $options[1] ?? '';
                    $opsiC = $options[2] ?? '';
                    $opsiD = $options[3] ?? '';

                    $correctIndex = $q['correct'] ?? 0;
                    $jawabanBenar = chr(65 + (int)$correctIndex);

                    \App\Models\SoalKuis::create([
                        'id_kuis'       => $quiz->id_kuis,
                        'pertanyaan'    => $q['text'] ?? $q['pertanyaan'] ?? $q['soal'] ?? '',
                        'opsi_a'        => $opsiA,
                        'opsi_b'        => $opsiB,
                        'opsi_c'        => $opsiC,
                        'opsi_d'        => $opsiD,
                        'jawaban_benar' => $jawabanBenar,
                    ]);

                    Log::info("Soal ke-" . ($index + 1) . " berhasil diupdate di soal_kuis untuk kuis id: " . $quiz->id_kuis);
                }
            }

            $quiz->save();

            return response()->json([
                'success' => true,
                'message' => 'Kuis berhasil diupdate',
                'data'    => $quiz
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error update quiz: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate kuis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $quiz = Kuis::findOrFail($id);
            $quiz->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kuis berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus kuis'
            ], 500);
        }
    }

    public function getByDivisi(string $divisi)
    {
        try {
            $quizzes = Kuis::where('divisi', $divisi)
                ->orderBy('created_at', 'desc')
                ->get();

            $quizzes = $quizzes->map(function ($quiz) {
                return [
                    'id' => $quiz->id_kuis,
                    'judul' => $quiz->judul_kuis,
                    'deskripsi' => $quiz->deskripsi,
                    'divisi' => $quiz->divisi,
                    'durasi' => $quiz->durasi,
                    'passing' => $quiz->passing ?? 75,
                    'total_soal' => $quiz->total_soal,
                    'questions' => $quiz->questions,
                    'tanggal_mulai' => $quiz->tanggal_mulai,
                    'tanggal_selesai' => $quiz->tanggal_selesai,
                    'created_at' => $quiz->created_at,
                    'status' => $quiz->status ?? 'nonaktif',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $quizzes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kuis'
            ], 500);
        }
    }

    public function import(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:10240'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();

            if (in_array($extension, ['xlsx', 'xls'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Untuk file Excel, silakan konversi ke format CSV terlebih dahulu'
                ], 400);
            }

            $content = file_get_contents($file->getPathname());

            $encoding = mb_detect_encoding($content, ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
            if ($encoding !== 'UTF-8') {
                $content = mb_convert_encoding($content, 'UTF-8', $encoding);
            }

            if (substr($content, 0, 3) === "\xEF\xBB\xBF") {
                $content = substr($content, 3);
            }

            $lines = explode("\n", trim($content));
            if (count($lines) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'File CSV minimal memiliki 2 baris (header + data)'
                ], 400);
            }

            $headers = str_getcsv(array_shift($lines));
            $headers = array_map(function ($header) {
                return strtolower(trim(str_replace(' ', '_', $header)));
            }, $headers);

            $imported = 0;
            $failed = 0;
            $errors = [];

            $expectedHeaders = ['judul_kuis', 'deskripsi', 'divisi', 'durasi', 'passing', 'level', 'questions', 'tanggal_mulai', 'tanggal_selesai'];
            $missingHeaders = array_diff($expectedHeaders, $headers);
            if (!empty($missingHeaders)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Header file tidak lengkap. Header yang diperlukan: ' . implode(', ', $expectedHeaders),
                    'missing' => $missingHeaders
                ], 400);
            }

            foreach ($lines as $rowIndex => $line) {
                if (empty(trim($line))) continue;

                try {
                    $row = str_getcsv($line);
                    $data = [];

                    foreach ($headers as $idx => $header) {
                        $value = isset($row[$idx]) ? $row[$idx] : null;
                        if ($value !== null && $value !== '') {
                            $data[$header] = $value;
                        }
                    }

                    $judul = $data['judul_kuis'] ?? null;
                    if (!$judul) {
                        $failed++;
                        $errors[] = "Baris " . ($rowIndex + 2) . ": Judul kuis wajib diisi";
                        continue;
                    }

                    $level = isset($data['level']) ? intval($data['level']) : 1;
                    if ($level < 1 || $level > 3) {
                        $level = 1;
                    }

                    $questions = null;
                    if (!empty($data['questions'])) {
                        $questions = json_decode($data['questions'], true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            $parts = explode('|', $data['questions']);
                            if (count($parts) >= 6) {
                                $questions = [[
                                    'text' => $parts[0],
                                    'options' => array_slice($parts, 1, 4),
                                    'correct' => intval($parts[5])
                                ]];
                            } else {
                                $failed++;
                                $errors[] = "Baris " . ($rowIndex + 2) . ": Format questions tidak valid";
                                continue;
                            }
                        }
                    }

                    $existingQuiz = Kuis::where('judul_kuis', $judul)->first();
                    if ($existingQuiz) {
                        $failed++;
                        $errors[] = "Baris " . ($rowIndex + 2) . ": Kuis dengan judul '{$judul}' sudah ada";
                        continue;
                    }

                    $quiz = Kuis::create([
                        'judul_kuis' => $judul,
                        'deskripsi' => $data['deskripsi'] ?? null,
                        'divisi' => $data['divisi'] ?? null,
                        'durasi' => intval($data['durasi'] ?? 30),
                        'passing' => intval($data['passing'] ?? 75),
                        'level' => $level,
                        'status' => 'aktif',
                        'total_soal' => $questions ? count($questions) : 0,
                        'questions' => $questions,
                        'peserta' => 0,
                        'tanggal_mulai' => $data['tanggal_mulai'] ?? date('Y-m-d'),
                        'tanggal_selesai' => $data['tanggal_selesai'] ?? date('Y-m-d', strtotime('+30 days')),
                    ]);

                    if ($quiz) $imported++;
                } catch (\Exception $e) {
                    $failed++;
                    $errors[] = "Baris " . ($rowIndex + 2) . ": " . $e->getMessage();
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Berhasil mengimport {$imported} kuis" . ($failed > 0 ? ", {$failed} gagal" : ""),
                'data' => [
                    'imported' => $imported,
                    'failed' => $failed,
                    'errors' => $errors
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error import quiz: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengimport kuis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $filename = "template_kuis.csv";

            $headers = [
                'Content-Type' => 'text/csv; charset=utf-8',
                'Content-Disposition' => "attachment; filename={$filename}",
                'Cache-Control' => 'private, max-age=0, must-revalidate',
                'Pragma' => 'public',
            ];

            $callback = function () {
                $file = fopen('php://output', 'w');
                
                fputs($file, "\xEF\xBB\xBF");

                fputcsv($file, [
                    'judul_kuis',
                    'deskripsi',
                    'divisi',
                    'durasi',
                    'passing',
                    'level',
                    'questions',
                    'tanggal_mulai',
                    'tanggal_selesai'
                ]);

                $questions = json_encode([
                    [
                        "text" => "Apa ibu kota Indonesia?",
                        "options" => ["Jakarta", "Surabaya", "Bandung", "Medan"],
                        "correct" => 0
                    ],
                    [
                        "text" => "Apa kepanjangan dari HTML?",
                        "options" => [
                            "Hyper Trainer Marking Language",
                            "Hyper Text Markup Language",
                            "High Text Machine Language",
                            "Hyper Tool Multi Language"
                        ],
                        "correct" => 1
                    ]
                ], JSON_UNESCAPED_UNICODE);

                fputcsv($file, [
                    'Quiz Programming Dasar',
                    'Quiz untuk menguji dasar pemrograman (2 soal contoh)',
                    'ENGINEERING',
                    30,
                    75,
                    1,
                    $questions,
                    now()->format('Y-m-d'),
                    now()->addDays(30)->format('Y-m-d')
                ]);

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error('Error downloadTemplate: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendownload template: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getDaftarKuisPeserta(Request $request)
    {
        try {
            $user = $request->user();
            $userId = $user->id_user ?? $user->id;

            $peserta = \App\Models\Peserta::where('id_user', $userId)->first();

            $allMateriCompleted = false;
            $totalMateri = 0;
            $totalMateriSelesai = 0;
            $namaDivisi = null;

            if ($peserta) {
                $divisi = \App\Models\Divisi::where('id_divisi', $peserta->id_divisi)->first();
                $namaDivisi = $divisi ? $divisi->nama_divisi : null;

                $materiQuery = \App\Models\MateriPelatihan::query();

                if ($namaDivisi) {
                    $materiQuery->where(function ($q) use ($namaDivisi) {
                        $q->where('divisi', $namaDivisi)
                            ->orWhereNull('divisi')
                            ->orWhere('divisi', '');
                    });
                }

                $materiIds = $materiQuery->pluck('id_materi_pelatihan')->toArray();

                $totalMateri = count($materiIds);

                if ($totalMateri > 0) {
                    $totalMateriSelesai = DB::table('akses_materi_kompetensi')
                        ->where('id_peserta', $peserta->id_peserta)
                        ->whereIn('id_materi_pelatihan', $materiIds)
                        ->count();
                }

                $allMateriCompleted = $totalMateri > 0 && $totalMateriSelesai >= $totalMateri;
            }

            $kuisQuery = Kuis::where('status', 'aktif')
                ->orderBy('level', 'asc')
                ->orderBy('id_kuis', 'asc');

            if ($namaDivisi) {
                $kuisQuery->where(function ($q) use ($namaDivisi) {
                    $q->where('divisi', $namaDivisi)
                        ->orWhereNull('divisi')
                        ->orWhere('divisi', '');
                });
            }

            $kuisList = $kuisQuery->get();

            $data = $kuisList->map(function ($kuis) use (
                $userId,
                $allMateriCompleted,
                $totalMateri,
                $totalMateriSelesai,
                $namaDivisi
            ) {
                $bestScore = DB::table('jawaban_kuis')
                    ->where('id_user', $userId)
                    ->where('id_kuis', $kuis->id_kuis)
                    ->max('skor');

                $attempt = DB::table('jawaban_kuis')
                    ->where('id_user', $userId)
                    ->where('id_kuis', $kuis->id_kuis)
                    ->max('attempt');

                $isPassed = $bestScore !== null && $bestScore >= ($kuis->passing ?? 75);

                $isLocked = false;
                $lockedMessage = null;

                if (!$allMateriCompleted) {
                    $isLocked = true;
                    $lockedMessage = 'Selesaikan semua materi kompetensi terlebih dahulu sebelum mengerjakan kuis.';
                } else {
                    if ((int) $kuis->level > 1) {
                        $prevKuisQuery = Kuis::where('level', $kuis->level - 1)
                            ->where('status', 'aktif')
                            ->orderBy('id_kuis', 'asc');

                        if ($namaDivisi) {
                            $prevKuisQuery->where(function ($q) use ($namaDivisi) {
                                $q->where('divisi', $namaDivisi)
                                    ->orWhereNull('divisi')
                                    ->orWhere('divisi', '');
                            });
                        }

                        $prevKuis = $prevKuisQuery->first();

                        if ($prevKuis) {
                            $prevBestScore = DB::table('jawaban_kuis')
                                ->where('id_user', $userId)
                                ->where('id_kuis', $prevKuis->id_kuis)
                                ->max('skor');

                            if ($prevBestScore === null || $prevBestScore < ($prevKuis->passing ?? 75)) {
                                $isLocked = true;
                                $lockedMessage = 'Selesaikan dan lulus kuis level ' . ($kuis->level - 1) . ' terlebih dahulu.';
                            }
                        }
                    }
                }

                return [
                    'id' => $kuis->id_kuis,
                    'id_kuis' => $kuis->id_kuis,
                    'judul' => $kuis->judul_kuis,
                    'deskripsi' => $kuis->deskripsi,
                    'divisi' => $kuis->divisi,
                    'durasi' => $kuis->durasi,
                    'passing_score' => $kuis->passing ?? 75,
                    'total_questions' => $kuis->total_soal,
                    'level' => $kuis->level,
                    'score' => $bestScore,
                    'attempt' => $attempt ?? 0,
                    'is_completed' => $isPassed,
                    'is_passed' => $isPassed,
                    'is_locked' => $isLocked,
                    'can_start' => !$isLocked,
                    'can_retake' => !$isLocked && !$isPassed && $bestScore !== null,
                    'locked_message' => $lockedMessage,
                    'materi_completed' => $allMateriCompleted,
                    'total_materi' => $totalMateri,
                    'total_materi_selesai' => $totalMateriSelesai,
                    'tanggal_mulai' => $kuis->tanggal_mulai,
                    'tanggal_selesai' => $kuis->tanggal_selesai,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Error getDaftarKuisPeserta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar kuis: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function getKuisForPeserta(Request $request)
    {
        try {
            $user = $request->user();

            $peserta = \App\Models\Peserta::where('id_user', $user->id_user)->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }

            $divisiPeserta = null;

            if ($peserta->id_divisi) {
                $divisi = \App\Models\Divisi::find($peserta->id_divisi);
                $divisiPeserta = $divisi ? $divisi->nama_divisi : null;
            }

            $query = Kuis::where('status', 'aktif')
                ->where('tanggal_mulai', '<=', now()->toDateString())
                ->where('tanggal_selesai', '>=', now()->toDateString());

            if ($divisiPeserta) {
                $query->where(function ($q) use ($divisiPeserta) {
                    $q->where('divisi', $divisiPeserta)
                        ->orWhereNull('divisi');
                });
            }

            $kuisList = $query->orderBy('created_at', 'desc')->get();

            $sudahDikerjakan = [];
            if (Schema::hasTable('jawaban_kuis')) {
                $sudahDikerjakan = DB::table('jawaban_kuis')
                    ->where('id_user', $user->id_user)
                    ->pluck('id_kuis')
                    ->toArray();
            }

            $skorTerbaik = [];
            if (Schema::hasTable('jawaban_kuis')) {
                $skorData = DB::table('jawaban_kuis')
                    ->where('id_user', $user->id_user)
                    ->select('id_kuis', DB::raw('MAX(skor) as skor_terbaik'))
                    ->groupBy('id_kuis')
                    ->get();
                foreach ($skorData as $s) {
                    $skorTerbaik[$s->id_kuis] = $s->skor_terbaik;
                }
            }

            $kuisList = $kuisList->sortBy('level')->values();

            $result = $kuisList->map(function ($kuis) use ($skorTerbaik) {
                $skor = $skorTerbaik[$kuis->id_kuis] ?? null;
                $sudah = $skor !== null;
                $lulus = $skor !== null ? ($skor >= ($kuis->passing ?? 75)) : false;

                return [
                    'id'           => $kuis->id_kuis,
                    'id_kuis'      => $kuis->id_kuis,
                    'judul'        => $kuis->judul_kuis,
                    'deskripsi'    => $kuis->deskripsi,
                    'divisi'       => $kuis->divisi,
                    'durasi'       => $kuis->durasi,
                    'passing_score' => $kuis->passing ?? 75,
                    'total_soal'   => $kuis->total_soal,
                    'level'        => $kuis->level ?? 1,
                    'tanggal_mulai'   => $kuis->tanggal_mulai,
                    'tanggal_selesai' => $kuis->tanggal_selesai,
                    'sudah_dikerjakan' => $sudah,
                    'skor'         => $skor,
                    'lulus'        => $lulus,
                ];
            });

            $resultWithLock = [];
            foreach ($result as $item) {
                $level = $item['level'];
                $locked = false;

                if ($level > 1) {
                    $prevKuis = $result->first(fn($k) => $k['level'] === $level - 1);
                    if ($prevKuis) {
                        $locked = !$prevKuis['lulus'];
                    }
                }

                $item['is_locked'] = $locked;
                $resultWithLock[] = $item;
            }

            return response()->json([
                'success' => true,
                'data'    => $resultWithLock,
            ]);
        } catch (\Exception $e) {
            Log::error('Error getKuisForPeserta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kuis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSoalForPeserta(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $userId = $user->id_user ?? $user->id;

            $peserta = \App\Models\Peserta::where('id_user', $userId)->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }

            $divisi = \App\Models\Divisi::where('id_divisi', $peserta->id_divisi)->first();
            $namaDivisi = $divisi ? $divisi->nama_divisi : null;

            $materiQuery = \App\Models\MateriPelatihan::query();

            if ($namaDivisi) {
                $materiQuery->where(function ($q) use ($namaDivisi) {
                    $q->where('divisi', $namaDivisi)
                        ->orWhereNull('divisi')
                        ->orWhere('divisi', '');
                });
            }

            $materiIds = $materiQuery->pluck('id_materi_pelatihan')->toArray();

            $totalMateri = count($materiIds);
            $totalMateriSelesai = 0;

            if ($totalMateri > 0) {
                $totalMateriSelesai = DB::table('akses_materi_kompetensi')
                    ->where('id_peserta', $peserta->id_peserta)
                    ->whereIn('id_materi_pelatihan', $materiIds)
                    ->count();
            }

            if ($totalMateri === 0 || $totalMateriSelesai < $totalMateri) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selesaikan semua materi kompetensi terlebih dahulu sebelum mengerjakan kuis.',
                    'is_locked' => true,
                    'total_materi' => $totalMateri,
                    'total_materi_selesai' => $totalMateriSelesai,
                ], 403);
            }

            $kuis = Kuis::findOrFail($id);
            $levelKuis = (int) ($kuis->level ?? 1);

            if ($levelKuis > 1) {
                $prevKuisQuery = Kuis::where('level', $levelKuis - 1)
                    ->where('status', 'aktif')
                    ->orderBy('id_kuis', 'asc');

                if ($namaDivisi) {
                    $prevKuisQuery->where(function ($q) use ($namaDivisi) {
                        $q->where('divisi', $namaDivisi)
                            ->orWhereNull('divisi')
                            ->orWhere('divisi', '');
                    });
                }

                $prevKuis = $prevKuisQuery->first();

                if ($prevKuis) {
                    $skorPrev = DB::table('jawaban_kuis')
                        ->where('id_user', $userId)
                        ->where('id_kuis', $prevKuis->id_kuis)
                        ->max('skor');

                    if ($skorPrev === null || $skorPrev < ($prevKuis->passing ?? 75)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Selesaikan dan lulus kuis level ' . ($levelKuis - 1) . ' terlebih dahulu.',
                            'is_locked' => true
                        ], 403);
                    }
                }
            }

            $questions = $kuis->questions ?? [];

            if (is_string($questions)) {
                $questions = json_decode($questions, true) ?? [];
            }

            $questionsFiltered = [];

            foreach ($questions as $index => $q) {
                $questionsFiltered[] = [
                    'id' => $q['id'] ?? ($index + 1),
                    'text' => $q['text'] ?? $q['pertanyaan'] ?? $q['soal'] ?? $q['question'] ?? '',
                    'options' => $q['options'] ?? $q['pilihan'] ?? $q['choices'] ?? [],
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id_kuis' => $kuis->id_kuis,
                    'judul' => $kuis->judul_kuis,
                    'deskripsi' => $kuis->deskripsi,
                    'durasi' => $kuis->durasi,
                    'passing_score' => $kuis->passing ?? 75,
                    'level' => $kuis->level,
                    'total_soal' => count($questionsFiltered),
                    'questions' => $questionsFiltered,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getSoalForPeserta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Kuis tidak ditemukan: ' . $e->getMessage()
            ], 404);
        }
    }

    public function submitKuisPeserta(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $userId = $user->id_user ?? $user->id;

            $kuis = Kuis::findOrFail($id);

            $jawaban = $request->jawaban ?? [];

            $questions = $kuis->questions ?? [];
            if (is_string($questions)) {
                $questions = json_decode($questions, true) ?? [];
            }

            $benar = 0;
            $total = count($questions);

            foreach ($questions as $index => $q) {
                $qId = (string)($q['id'] ?? ($index + 1));
                $correct = $q['correct'] ?? null;

                if (isset($jawaban[$qId]) && $correct !== null) {
                    if ((int) $jawaban[$qId] === (int) $correct) {
                        $benar++;
                    }
                }
            }

            $skor = $total > 0 ? round(($benar / $total) * 100, 2) : 0;
            $passing = $kuis->passing ?? 75;
            $lulus = $skor >= $passing;

            $lastAttempt = DB::table('jawaban_kuis')
                ->where('id_user', $userId)
                ->where('id_kuis', $id)
                ->max('attempt');

            $attempt = ($lastAttempt ?? 0) + 1;

            DB::table('jawaban_kuis')->insert([
                'id_soal' => null,
                'id_user' => $userId,
                'id_kuis' => $id,
                'jawaban' => json_encode($jawaban),
                'skor' => $skor,
                'attempt' => $attempt,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => $lulus ? 'Selamat! Anda lulus!' : 'Belum lulus, silakan ulangi kuis.',
                'data' => [
                    'skor' => $skor,
                    'benar' => $benar,
                    'salah' => $total - $benar,
                    'total' => $total,
                    'lulus' => $lulus,
                    'passing_score' => $passing,
                    'attempt' => $attempt,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error submitKuisPeserta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal submit kuis: ' . $e->getMessage()
            ], 500);
        }
    }
}