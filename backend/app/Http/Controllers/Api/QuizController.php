<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kuis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

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
                    'total_soal' => $quiz->total_soal,
                    'questions' => $quiz->questions,
                    'participants' => $quiz->peserta,
                    'peserta' => $quiz->peserta,
                    'tanggal_mulai' => $quiz->tanggal_mulai,
                    'tanggal_selesai' => $quiz->tanggal_selesai,
                    'created_at' => $quiz->created_at,
                    'updated_at' => $quiz->updated_at,
                    'status' => $quiz->status,
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
                    'total_soal' => $quiz->total_soal,
                    'questions' => $quiz->questions,
                    'participants' => $quiz->peserta,
                    'peserta' => $quiz->peserta,
                    'tanggal_mulai' => $quiz->tanggal_mulai,
                    'tanggal_selesai' => $quiz->tanggal_selesai,
                    'created_at' => $quiz->created_at,
                    'updated_at' => $quiz->updated_at,
                    'status' => $quiz->status,
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
                    'total_soal' => $quiz->total_soal,
                    'questions' => $quiz->questions,
                    'tanggal_mulai' => $quiz->tanggal_mulai,
                    'tanggal_selesai' => $quiz->tanggal_selesai,
                    'created_at' => $quiz->created_at,
                    'status' => $quiz->status,
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
     * Import quiz from CSV file (tanpa library tambahan)
     */
    public function import(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:csv,txt|max:10240'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $file = $request->file('file');
            $content = file_get_contents($file->getPathname());
            
            // Parse CSV
            $lines = explode("\n", trim($content));
            if (count($lines) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'File CSV minimal memiliki 2 baris (header + data)'
                ], 400);
            }
            
            // Ambil header dari baris pertama
            $headers = str_getcsv(array_shift($lines));
            $headers = array_map(function($header) {
                return strtolower(trim(str_replace(' ', '_', $header)));
            }, $headers);
            
            $imported = 0;
            $failed = 0;
            $errors = [];
            
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
                    
                    $judul = $data['judul_kuis'] ?? $data['judul'] ?? null;
                    if (!$judul) {
                        $failed++;
                        $errors[] = "Baris " . ($rowIndex + 2) . ": Judul kuis wajib diisi";
                        continue;
                    }
                    
                    // Parse questions dari JSON
                    $questions = null;
                    if (!empty($data['questions'])) {
                        $questions = json_decode($data['questions'], true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            // Coba format pipe: text|opt0|opt1|opt2|opt3|correct
                            $parts = explode('|', $data['questions']);
                            if (count($parts) >= 6) {
                                $questions = [[
                                    'text' => $parts[0],
                                    'options' => array_slice($parts, 1, 4),
                                    'correct' => intval($parts[5])
                                ]];
                            }
                        }
                    }
                    
                    $quiz = Kuis::create([
                        'judul_kuis' => $judul,
                        'deskripsi' => $data['deskripsi'] ?? null,
                        'divisi' => $data['divisi'] ?? null,
                        'durasi' => intval($data['durasi'] ?? 30),
                        'passing' => intval($data['passing'] ?? 75),
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
            $example = [
                'Quiz Contoh 1',
                'Deskripsi quiz contoh',
                'ENGINEERING',
                '30',
                '75',
                '[{"text":"Soal contoh?","options":["Jawaban A","Jawaban B","Jawaban C","Jawaban D"],"correct":0}]',
                date('Y-m-d'),
                date('Y-m-d', strtotime('+30 days'))
            ];
            
            $callback = function() use ($headers, $example) {
                $handle = fopen('php://output', 'w');
                fputcsv($handle, $headers);
                fputcsv($handle, $example);
                fclose($handle);
            };
            
            return response()->stream($callback, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="template_kuis.csv"',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat template: ' . $e->getMessage()
            ], 500);
        }
    }
}