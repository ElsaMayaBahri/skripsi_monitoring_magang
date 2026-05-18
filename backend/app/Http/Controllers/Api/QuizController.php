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
                    'level' => $quiz->level ?? 1,  // 🔥 TAMBAHKAN LEVEL
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
     * Get all quiz results for dashboard
     */
    public function getAllResults()
    {
        try {
            if (!Schema::hasTable('jawaban_kuis')) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Tabel jawaban_kuis belum ada'
                ]);
            }
            
            $checkData = DB::table('jawaban_kuis')->count();
            Log::info('Jumlah data jawaban_kuis: ' . $checkData);
            
            if ($checkData == 0) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Belum ada data jawaban kuis'
                ]);
            }
            
            $results = DB::table('jawaban_kuis as jk')
                ->leftJoin('users as u', 'jk.id_user', '=', 'u.id')
                ->leftJoin('kuis as k', 'jk.id_kuis', '=', 'k.id_kuis')
                ->select(
                    'jk.id_jawaban',
                    'jk.id_user',
                    'u.name as user_name',
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
            
            if ($results->isNotEmpty()) {
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
            
            $results = DB::table('jawaban_kuis as jk')
                ->leftJoin('users as u', 'jk.id_user', '=', 'u.id')
                ->select(
                    'jk.id_user',
                    'u.name as user_name',
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
                'level' => 'nullable|integer|min:1|max:3',  // 🔥 TAMBAHKAN VALIDASI LEVEL
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
            
            $judul = $request->judul ?? $request->judul_kuis;
            
            $quiz = Kuis::create([
                'judul_kuis' => $judul,
                'deskripsi' => $request->deskripsi,
                'divisi' => $request->divisi,
                'durasi' => $request->durasi ?? 30,
                'passing' => $request->passing ?? 75,
                'level' => $request->level ?? 1,  // 🔥 TAMBAHKAN LEVEL
                'status' => 'aktif',
                'total_soal' => count($request->questions ?? []),
                'questions' => $request->questions,
                'peserta' => 0,
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Kuis berhasil dibuat',
                'data' => $quiz
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
                    'level' => $quiz->level ?? 1,  // 🔥 TAMBAHKAN LEVEL
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
                'judul' => 'sometimes|string|max:150',
                'judul_kuis' => 'sometimes|string|max:150',
                'deskripsi' => 'nullable|string',
                'divisi' => 'nullable|string|max:100',
                'durasi' => 'nullable|integer|min:1|max:180',
                'passing' => 'nullable|integer|min:0|max:100',
                'level' => 'nullable|integer|min:1|max:3',  // 🔥 TAMBAHKAN VALIDASI LEVEL
                'status' => 'sometimes|in:aktif,nonaktif',
                'questions' => 'nullable|array',
                'tanggal_mulai' => 'nullable|date',
                'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            if ($request->has('judul') || $request->has('judul_kuis')) {
                $quiz->judul_kuis = $request->judul ?? $request->judul_kuis;
            }
            if ($request->has('deskripsi')) $quiz->deskripsi = $request->deskripsi;
            if ($request->has('divisi')) $quiz->divisi = $request->divisi;
            if ($request->has('durasi')) $quiz->durasi = $request->durasi;
            if ($request->has('passing')) $quiz->passing = $request->passing;
            if ($request->has('level')) $quiz->level = $request->level;  // 🔥 TAMBAHKAN UPDATE LEVEL
            if ($request->has('status')) $quiz->status = $request->status;
            if ($request->has('questions')) {
                $quiz->questions = $request->questions;
                $quiz->total_soal = count($request->questions);
            }
            if ($request->has('tanggal_mulai')) $quiz->tanggal_mulai = $request->tanggal_mulai;
            if ($request->has('tanggal_selesai')) $quiz->tanggal_selesai = $request->tanggal_selesai;
            
            $quiz->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Kuis berhasil diupdate',
                'data' => $quiz
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
                    'level' => $quiz->level ?? 1,  // 🔥 TAMBAHKAN LEVEL
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
            $headers = array_map(function($header) {
                return strtolower(trim(str_replace(' ', '_', $header)));
            }, $headers);
            
            $imported = 0;
            $failed = 0;
            $errors = [];
            
            // 🔥 TAMBAHKAN 'level' KE EXPECTED HEADERS
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
                    
                    // 🔥 TAMBAHKAN LEVEL KE CREATE
                    $quiz = Kuis::create([
                        'judul_kuis' => $judul,
                        'deskripsi' => $data['deskripsi'] ?? null,
                        'divisi' => $data['divisi'] ?? null,
                        'durasi' => intval($data['durasi'] ?? 30),
                        'passing' => intval($data['passing'] ?? 75),
                        'level' => intval($data['level'] ?? 1),  // 🔥 TAMBAHKAN LEVEL
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
            // 🔥 TAMBAHKAN 'level' KE HEADERS
            $headers = ['judul_kuis', 'deskripsi', 'divisi', 'durasi', 'passing', 'level', 'questions', 'tanggal_mulai', 'tanggal_selesai'];
            
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
                '1',  // 🔥 TAMBAHKAN LEVEL
                $exampleQuestion,
                date('Y-m-d'),
                date('Y-m-d', strtotime('+30 days'))
            ];
            
            $callback = function() use ($headers, $exampleData) {
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
                    '2',  // 🔥 TAMBAHKAN LEVEL (Level 2 - Menengah)
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
}