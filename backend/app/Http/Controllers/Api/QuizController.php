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
     * Get all quiz results for dashboard - FIXED with correct column names
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

            // Cek apakah ada data di jawaban_kuis
            $checkData = DB::table('jawaban_kuis')->count();
            Log::info('Jumlah data jawaban_kuis: ' . $checkData);

            if ($checkData == 0) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Belum ada data jawaban kuis'
                ]);
            }

            // FIXED: Gunakan 'id' bukan 'id_user', dan 'name' bukan 'nama'
            $results = DB::table('jawaban_kuis as jk')
                ->leftJoin('users as u', 'jk.id_user', '=', 'u.id')  // FIX: u.id (bukan id_user)
                ->leftJoin('kuis as k', 'jk.id_kuis', '=', 'k.id_kuis')
                ->select(
                    'jk.id_jawaban',
                    'jk.id_user',
                    'u.name as user_name',  // FIX: u.name (bukan u.nama)
                    'u.divisi as user_divisi',
                    'jk.id_kuis',
                    'k.judul_kuis as quiz_title',
                    'k.divisi as quiz_divisi',
                    'jk.skor',
                    'jk.jawaban',
                    'jk.created_at'
                )
                ->orderBy('jk.created_at', 'desc')
                ->get();

            Log::info('Hasil query jawaban_kuis: ' . $results->count() . ' records');

            // Jika ada data, format hasilnya
            if ($results->isNotEmpty()) {
                // Kelompokkan berdasarkan user dan quiz untuk menghitung rata-rata
                $groupedResults = [];

                foreach ($results as $item) {
                    $key = $item->id_user . '_' . $item->id_kuis;

                    if (!isset($groupedResults[$key])) {
                        $groupedResults[$key] = [
                            'user_id' => $item->id_user,
                            'user_name' => $item->user_name ?? 'Pengguna',
                            'quiz_id' => $item->id_kuis,
                            'quiz_title' => $item->quiz_title ?? 'Kuis',
                            'divisi' => $item->user_divisi ?? $item->quiz_divisi ?? 'Umum',
                            'total_score' => 0,
                            'count' => 0,
                            'answers' => []
                        ];
                    }

                    $groupedResults[$key]['total_score'] += $item->skor;
                    $groupedResults[$key]['count']++;
                    $groupedResults[$key]['answers'][] = [
                        'jawaban' => $item->jawaban,
                        'skor' => $item->skor
                    ];
                }

                // Format hasil akhir
                $formattedResults = [];
                foreach ($groupedResults as $group) {
                    $formattedResults[] = [
                        'user_id' => $group['user_id'],
                        'user_name' => $group['user_name'],
                        'quiz_id' => $group['quiz_id'],
                        'quiz_title' => $group['quiz_title'],
                        'divisi' => $group['divisi'],
                        'score' => $group['count'] > 0 ? round($group['total_score'] / $group['count'], 2) : 0,
                        'total_answers' => $group['count'],
                        'created_at' => now()
                    ];
                }

                return response()->json([
                    'success' => true,
                    'data' => $formattedResults,
                    'total' => count($formattedResults),
                    'raw_count' => $results->count()
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'Tidak ada data jawaban kuis ditemukan'
            ]);
        } catch (\Exception $e) {
            Log::error('Error getAllResults: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
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

            // FIX: Gunakan 'id' bukan 'id_user', dan 'name' bukan 'nama'
            $results = DB::table('jawaban_kuis as jk')
                ->leftJoin('users as u', 'jk.id_user', '=', 'u.id')  // FIX: u.id
                ->select(
                    'jk.id_user',
                    'u.name as user_name',  // FIX: u.name
                    'u.divisi',
                    'jk.skor as score',
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

            // ============================================================
            // SINKRONISASI SOAL KE TABEL soal_kuis
            // ============================================================
            if ($request->questions && count($request->questions) > 0) {
                foreach ($request->questions as $index => $q) {
                    $options = $q['options'] ?? [];

                    // Pastikan minimal ada 4 opsi
                    $opsiA = $options[0] ?? '';
                    $opsiB = $options[1] ?? '';
                    $opsiC = $options[2] ?? '';
                    $opsiD = $options[3] ?? '';

                    // correct: 0=A, 1=B, 2=C, 3=D
                    $correctIndex = $q['correct'] ?? 0;
                    $jawabanBenar = chr(65 + (int)$correctIndex); // 0→A, 1→B, 2→C, 3→D

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
            // ============================================================

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

                // ============================================================
                // SINKRONISASI SOAL KE soal_kuis — hapus lama, simpan baru
                // ============================================================
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
                // ============================================================
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

    /**
     * Import quiz from CSV file
     */
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

            $expectedHeaders = ['judul_kuis', 'deskripsi', 'divisi', 'durasi', 'passing', 'questions', 'tanggal_mulai', 'tanggal_selesai'];
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

    /**
     * Download template CSV untuk import
     */
    public function downloadTemplate()
    {
        try {
            $headers = ['judul_kuis', 'deskripsi', 'divisi', 'durasi', 'passing', 'questions', 'tanggal_mulai', 'tanggal_selesai'];

            $exampleQuestion = json_encode([
                [
                    'text' => 'Apa ibu kota Indonesia?',
                    'options' => ['Jakarta', 'Surabaya', 'Bandung', 'Medan'],
                    'correct' => 0
                ]
            ]);

            $exampleData = [
                'Quiz Programming Dasar',
                'Quiz untuk menguji dasar pemrograman',
                'ENGINEERING',
                '30',
                '75',
                $exampleQuestion,
                date('Y-m-d'),
                date('Y-m-d', strtotime('+30 days'))
            ];

            $callback = function () use ($headers, $exampleData) {
                $handle = fopen('php://output', 'w');

                fputs($handle, "\xEF\xBB\xBF");

                fputcsv($handle, $headers);

                fputcsv($handle, $exampleData);

                $multipleQuestions = json_encode([
                    [
                        'text' => 'Apa kepanjangan dari HTML?',
                        'options' => ['Hyper Text Markup Language', 'High Text Markup Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'],
                        'correct' => 0
                    ],
                    [
                        'text' => 'Apa fungsi CSS?',
                        'options' => ['Styling halaman web', 'Database connection', 'Server side scripting', 'Backend logic'],
                        'correct' => 0
                    ]
                ]);

                $secondExample = [
                    'Quiz Web Development',
                    'Quiz untuk menguji pengetahuan web development',
                    'ENGINEERING',
                    '45',
                    '70',
                    $multipleQuestions,
                    date('Y-m-d'),
                    date('Y-m-d', strtotime('+30 days'))
                ];

                fputcsv($handle, $secondExample);

                fclose($handle);
            };

            return response()->stream($callback, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="template_kuis.csv"',
                'Cache-Control' => 'private, max-age=0, must-revalidate',
                'Pragma' => 'public',
            ]);
        } catch (\Exception $e) {
            Log::error('Error download template: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat template: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getDaftarKuisPeserta(Request $request)
    {
        try {
            $user = $request->user();
            $userId = $user->id_user ?? $user->id;

            // ============================================================
            // CEK APAKAH SEMUA MATERI SUDAH DIBACA PESERTA
            // ============================================================
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

            // ============================================================
            // AMBIL KUIS SESUAI DIVISI PESERTA
            // ============================================================
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

            // ============================================================
            // FORMAT DATA KUIS + LOGIC LOCK
            // ============================================================
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

                // Jika semua materi belum selesai, semua kuis dikunci
                if (!$allMateriCompleted) {
                    $isLocked = true;
                    $lockedMessage = 'Selesaikan semua materi kompetensi terlebih dahulu sebelum mengerjakan kuis.';
                } else {
                    // Jika materi sudah selesai, baru cek aturan kuis bertingkat
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

                    // Progress materi
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
    /**
     * Get list kuis kompetensi untuk peserta (filter by divisi)
     * GET /api/peserta/kuis-kompetensi
     */
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

            // Ambil nama divisi dari id_divisi peserta
            $divisiPeserta = null;

            if ($peserta->id_divisi) {
                $divisi = \App\Models\Divisi::find($peserta->id_divisi);
                $divisiPeserta = $divisi ? $divisi->nama_divisi : null;

                Log::info('Divisi peserta: ' . $divisiPeserta);
            }

            Log::info('id_divisi peserta: ' . $peserta->id_divisi);
            Log::info('Mencari kuis untuk divisi: ' . $divisiPeserta);

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

            Log::info('Jumlah kuis ditemukan: ' . $kuisList->count());

            // Cek kuis yang sudah dikerjakan
            $sudahDikerjakan = [];
            if (Schema::hasTable('jawaban_kuis')) {
                $sudahDikerjakan = DB::table('jawaban_kuis')
                    ->where('id_user', $user->id_user)
                    ->pluck('id_kuis')
                    ->toArray();
            }

            // Ambil skor terbaik per kuis untuk user ini
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

            // Urutkan kuis berdasarkan level
            $kuisList = $kuisList->sortBy('level')->values();

            $result = $kuisList->map(function ($kuis) use ($skorTerbaik) {
                $skor = $skorTerbaik[$kuis->id_kuis] ?? null;
                $sudah = $skor !== null;
                $lulus = $skor !== null ? ($skor >= ($kuis->passing ?? 75)) : false;

                // Hitung attempt count
                $attemptCount = DB::table('jawaban_kuis')
                    ->where('id_user', $kuis->id_kuis) // akan diisi nanti
                    ->count();

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
                    // is_locked dihitung setelah map selesai
                ];
            });

            // Hitung is_locked berdasarkan level
            $resultWithLock = [];
            foreach ($result as $item) {
                $level = $item['level'];
                $locked = false;

                if ($level > 1) {
                    // Cari kuis level sebelumnya
                    $prevKuis = $result->first(fn($k) => $k['level'] === $level - 1);
                    if ($prevKuis) {
                        // Terkunci jika kuis level sebelumnya belum lulus
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

            return response()->json([
                'success' => true,
                'data' => $result,
                'debug' => [
                    'id_divisi_peserta' => $peserta->id_divisi,
                    'nama_divisi_peserta' => $divisiPeserta,
                    'total_kuis_ditemukan' => $kuisList->count()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getKuisForPeserta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kuis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get soal kuis untuk peserta
     * GET /api/peserta/kuis-kompetensi/{id}/soal
     */
    public function getSoalForPeserta(Request $request, int $id)
    {
        try {
            $user = $request->user();
            $userId = $user->id_user ?? $user->id;

            // ============================================================
            // CEK APAKAH SEMUA MATERI SUDAH DIBACA
            // Ini untuk mencegah peserta membuka kuis langsung dari URL
            // ============================================================
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

            // ============================================================
            // AMBIL DATA KUIS
            // ============================================================
            $kuis = Kuis::findOrFail($id);
            $levelKuis = (int) ($kuis->level ?? 1);

            // ============================================================
            // CEK KUNCI KUIS BERDASARKAN LEVEL
            // Level 2 harus lulus Level 1
            // Level 3 harus lulus Level 2
            // ============================================================
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

            // ============================================================
            // FORMAT SOAL, JANGAN KIRIM JAWABAN BENAR KE FRONTEND
            // ============================================================
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

    /**
     * Submit jawaban kuis peserta + hitung skor di backend
     * POST /api/peserta/kuis-kompetensi/{id}/submit
     */
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