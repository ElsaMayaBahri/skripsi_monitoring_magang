<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SertifikatTemplate;
use App\Models\Sertifikat;
use App\Models\Peserta;
use App\Models\Divisi;
use App\Models\Kuis;
use App\Models\JawabanKuis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use FPDF;
use ZipArchive;

class SertifikatController extends Controller
{
    public function getTemplates(Request $request)
    {
        try {
            $jenis = $request->get('jenis', 'kompetensi');
            
            $templates = SertifikatTemplate::with('divisi')
                ->where('jenis_sertifikat', $jenis)
                ->orderBy('created_at', 'desc')
                ->get();
            
            $templates->each(function ($template) {
                $template->file_url = $template->file_path ? Storage::url($template->file_path) : null;
            });
            
            return response()->json([
                'success' => true,
                'data' => $templates,
                'total' => $templates->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error getTemplates: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get magang certificate template (khusus untuk sertifikat magang)
     * GET /api/sertifikat/magang/template
     */
    public function getMagangTemplate()
    {
        try {
            $template = SertifikatTemplate::where('jenis_sertifikat', 'magang')
                ->where('is_active', true)
                ->first();
            
            if ($template) {
                $template->file_url = $template->file_path ? Storage::url($template->file_path) : null;
            }
            
            return response()->json([
                'success' => true,
                'data' => $template
            ]);
        } catch (\Exception $e) {
            Log::error('Error getMagangTemplate: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil template sertifikat magang: ' . $e->getMessage()
            ], 500);
        }
    }

    public function storeTemplate(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nama_template' => 'required|string|max:255',
                'jenis_sertifikat' => 'required|in:kompetensi,magang',
                'divisi_id' => 'nullable|exists:divisis,id_divisi',
                'bidang_kompetensi' => 'nullable|string|max:255',
                'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
                'keterangan' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $fileSize = $file->getSize();
                
                $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9.]/', '_', $originalName);
                $path = $file->storeAs('sertifikat_templates', $filename, 'public');
                
                if (!$path) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal menyimpan file'
                    ], 500);
                }
                
                $template = SertifikatTemplate::create([
                    'nama_template' => $request->nama_template,
                    'jenis_sertifikat' => $request->jenis_sertifikat,
                    'divisi_id' => $request->divisi_id,
                    'bidang_kompetensi' => $request->bidang_kompetensi,
                    'file_path' => $path,
                    'file_name' => $originalName,
                    'file_extension' => $extension,
                    'file_size' => $fileSize,
                    'is_active' => true,
                    'keterangan' => $request->keterangan
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Template sertifikat berhasil diupload',
                    'data' => $template
                ], 201);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan'
            ], 400);
            
        } catch (\Exception $e) {
            Log::error('Error storeTemplate: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
 * Update template sertifikat by ID
 * POST /api/sertifikat/templates/{id}
 */
public function updateTemplate(Request $request, $id)
{
    try {
        $template = SertifikatTemplate::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'nama_template' => 'required|string|max:255',
            'divisi_id' => 'nullable|exists:divisis,id_divisi',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'keterangan' => 'nullable|string',
            'is_active' => 'nullable|boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Update data template
        $template->nama_template = $request->nama_template;
        $template->divisi_id = $request->divisi_id;
        $template->keterangan = $request->keterangan;
        
        if ($request->has('is_active')) {
            $template->is_active = $request->is_active;
        }
        
        // Handle file upload jika ada file baru
        if ($request->hasFile('file')) {
            // Hapus file lama
            if ($template->file_path && Storage::disk('public')->exists($template->file_path)) {
                Storage::disk('public')->delete($template->file_path);
            }
            
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $fileSize = $file->getSize();
            
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9.]/', '_', $originalName);
            $path = $file->storeAs('sertifikat_templates', $filename, 'public');
            
            if (!$path) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menyimpan file'
                ], 500);
            }
            
            $template->file_path = $path;
            $template->file_name = $originalName;
            $template->file_extension = $extension;
            $template->file_size = $fileSize;
        }
        
        $template->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Template sertifikat berhasil diperbarui',
            'data' => $template
        ]);
        
    } catch (\Exception $e) {
        Log::error('Error updateTemplate: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal memperbarui template: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Toggle template active status (aktif/nonaktif)
     * PUT /api/sertifikat/templates/{id}/toggle-status
     */
    public function toggleTemplateStatus(Request $request, $id)
    {
        try {
            $template = SertifikatTemplate::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'is_active' => 'required|boolean'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $template->is_active = $request->is_active;
            $template->save();
            
            return response()->json([
                'success' => true,
                'message' => $template->is_active ? 'Template berhasil diaktifkan' : 'Template berhasil dinonaktifkan',
                'data' => $template
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error toggleTemplateStatus: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah status template: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteTemplate(int $id)
    {
        try {
            $template = SertifikatTemplate::findOrFail($id);
            
            $usedCount = Sertifikat::where('template_id', $id)->count();
            if ($usedCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Template sedang digunakan oleh {$usedCount} sertifikat, tidak dapat dihapus"
                ], 400);
            }
            
            if ($template->file_path && Storage::disk('public')->exists($template->file_path)) {
                Storage::disk('public')->delete($template->file_path);
            }
            
            $template->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Template sertifikat berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleteTemplate: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus template: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSertifikat(Request $request)
    {
        try {
            $jenis = $request->get('jenis');
            $query = Sertifikat::with(['peserta', 'peserta.divisi', 'peserta.user', 'template']);
            
            if ($jenis) {
                $query->whereHas('template', function ($q) use ($jenis) {
                    $q->where('jenis_sertifikat', $jenis);
                });
            }
            
            $sertifikat = $query->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $sertifikat,
                'total' => $sertifikat->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error getSertifikat: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSertifikatById(int $id)
    {
        try {
            $sertifikat = Sertifikat::with(['peserta', 'peserta.divisi', 'peserta.user', 'template'])
                ->findOrFail($id);
            
            $sertifikat->file_url = $sertifikat->file_sertifikat ? Storage::url($sertifikat->file_sertifikat) : null;
            
            return response()->json([
                'success' => true,
                'data' => $sertifikat
            ]);
        } catch (\Exception $e) {
            Log::error('Error getSertifikatById: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Sertifikat tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Download template file by ID
     * GET /api/sertifikat/templates/download/{id}
     */
    public function downloadTemplate($id)
    {
        try {
            $template = SertifikatTemplate::findOrFail($id);
            
            if (!$template->file_path) {
                return response()->json([
                    'success' => false,
                    'message' => 'File path tidak ditemukan'
                ], 404);
            }
            
            $filePath = storage_path('app/public/' . $template->file_path);
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File template tidak ditemukan di storage'
                ], 404);
            }
            
            $fileName = $template->file_name ?? $template->nama_template . '.' . ($template->file_extension ?? 'pdf');
            
            return response()->download($filePath, $fileName, [
                'Content-Type' => 'application/octet-stream',
                'Access-Control-Allow-Origin' => '*'
            ]);
        } catch (\Exception $e) {
            Log::error('Error downloadTemplate: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal download template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download sertifikat by ID (for COO/Admin)
     * GET /api/sertifikat/download/{id}
     */
    public function downloadSertifikat(int $id)
    {
        try {
            $sertifikat = Sertifikat::with(['peserta', 'peserta.user'])->findOrFail($id);
            
            if (!$sertifikat->file_sertifikat || !Storage::disk('public')->exists($sertifikat->file_sertifikat)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File sertifikat tidak ditemukan'
                ], 404);
            }
            
            $filePath = storage_path('app/public/' . $sertifikat->file_sertifikat);
            $fileName = 'sertifikat_' . ($sertifikat->peserta->user->nama ?? 'peserta') . '.pdf';
            
            return response()->download($filePath, $fileName, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"'
            ]);
        } catch (\Exception $e) {
            Log::error('Error downloadSertifikat: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal download sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download all certificates as ZIP
     * GET /api/sertifikat/download-all?jenis=kompetensi
     */
    public function downloadAllSertifikat(Request $request)
    {
        try {
            $jenis = $request->get('jenis', 'kompetensi');
            
            $sertifikat = Sertifikat::with(['peserta', 'peserta.user'])
                ->whereHas('template', function ($q) use ($jenis) {
                    $q->where('jenis_sertifikat', $jenis);
                })
                ->orderBy('created_at', 'desc')
                ->get();
            
            if ($sertifikat->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Belum ada sertifikat yang diterbitkan'
                ], 404);
            }
            
            // Buat folder temporary untuk ZIP
            $zipFileName = 'sertifikat_' . $jenis . '_' . date('Ymd_His') . '.zip';
            $zipPath = storage_path('app/public/temp/' . $zipFileName);
            
            // Pastikan folder temp ada
            if (!is_dir(storage_path('app/public/temp'))) {
                mkdir(storage_path('app/public/temp'), 0755, true);
            }
            
            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat file ZIP'
                ], 500);
            }
            
            // Tambahkan setiap file sertifikat ke ZIP
            foreach ($sertifikat as $sertif) {
                $filePath = storage_path('app/public/' . $sertif->file_sertifikat);
                if (file_exists($filePath)) {
                    $namaFile = $sertif->peserta->user->nama ?? 'peserta';
                    $namaFile = preg_replace('/[^a-zA-Z0-9]/', '_', $namaFile);
                    $zip->addFile($filePath, $namaFile . '.pdf');
                }
            }
            
            $zip->close();
            
            // Download file ZIP
            return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
            
        } catch (\Exception $e) {
            Log::error('Error downloadAllSertifikat: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal download sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSertifikatPeserta(Request $request)
    {
        try {
            $user = $request->user();
            $peserta = Peserta::where('id_user', $user->id_user)->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }
            
            $quizResults = $this->getQuizResultsPeserta($peserta->id_peserta);
            $rataRata = $quizResults['rata_rata'];
            $totalQuiz = $quizResults['total_quiz'];
            $quizDikerjakan = $quizResults['quiz_dikerjakan'];
            $semuaLulus = $quizResults['semua_lulus'];
            
            $isEligible = $semuaLulus && $totalQuiz > 0 && $quizDikerjakan >= $totalQuiz && $rataRata >= 75;
            
            // Hanya cari sertifikat KOMPETENSI, bukan magang
            $sertifikat = Sertifikat::where('id_peserta', $peserta->id_peserta)
                ->whereHas('template', function ($q) {
                    $q->where('jenis_sertifikat', 'kompetensi');
                })
                ->first();
            
            // Log untuk debugging
            Log::info('Certificate check:', [
                'isEligible' => $isEligible,
                'sertifikat_found' => $sertifikat ? true : false,
                'peserta_id' => $peserta->id_peserta,
                'rata_rata' => $rataRata
            ]);
            
            if ($isEligible && !$sertifikat) {
                Log::info('Generating certificate for eligible participant: ' . $peserta->id_peserta);
                $sertifikat = $this->generateSertifikatKompetensi($peserta, $quizResults);
            }
            
            if ($sertifikat && (!$sertifikat->file_sertifikat || !Storage::disk('public')->exists($sertifikat->file_sertifikat))) {
                Log::info('Certificate exists but file missing, regenerating...');
                $this->generatePdfFromTemplate($sertifikat, $peserta, $quizResults);
                $sertifikat->refresh();
            }
            
            $isAvailable = $isEligible && $sertifikat && $sertifikat->exists && $sertifikat->file_sertifikat;
            $divisiNama = $peserta->divisi ? $peserta->divisi->nama_divisi : 'Umum';
            $bidangKompetensi = $sertifikat && $sertifikat->bidang_kompetensi 
                ? $sertifikat->bidang_kompetensi 
                : ($sertifikat && $sertifikat->template && $sertifikat->template->bidang_kompetensi 
                    ? $sertifikat->template->bidang_kompetensi 
                    : $divisiNama);
            
            $data = [
                'available' => $isAvailable,
                'sertifikat_id' => $sertifikat ? $sertifikat->id_sertifikat : null,
                'title' => 'CERTIFICATE OF COMPETENCY',
                'sub_title' => 'Sertifikat Kompetensi',
                'participant_name' => $user->nama,
                'kompetensi' => "Kompetensi Divisi {$divisiNama}",
                'level' => $rataRata >= 90 ? 'Expert' : ($rataRata >= 80 ? 'Advanced' : 'Intermediate'),
                'description' => 'Telah berhasil menyelesaikan ujian kompetensi bidang ' . $divisiNama . ' dengan hasil yang memuaskan.',
                'division' => $divisiNama,
                'bidang_kompetensi' => $bidangKompetensi,
                'nilai_akhir' => round($rataRata),
                'grade' => $this->getGrade($rataRata),
                'grade_text' => $this->getGradeText($rataRata),
                'issue_date' => $sertifikat && $sertifikat->tanggal_terbit ? $sertifikat->tanggal_terbit->format('Y-m-d') : date('Y-m-d'),
                'certificate_number' => $sertifikat ? $sertifikat->nomor_sertifikat : null,
                'director_name' => 'Dr. Ir. Budi Santoso, M.Kom., IPU',
                'ceo_name' => 'M. FAUZI NUR F.',
                'hasil_kuis' => $quizResults['detail_kuis'],
                'motto' => 'Membangun Generasi Unggul Berbasis Teknologi Digital'
            ];
            
            $requirements = [
                [
                    'name' => 'Menyelesaikan seluruh kuis kompetensi',
                    'status' => $quizDikerjakan >= $totalQuiz,
                    'nilai' => "{$quizDikerjakan}/{$totalQuiz}"
                ],
                [
                    'name' => 'Nilai rata-rata minimal 75',
                    'status' => $rataRata >= 75,
                    'nilai' => round($rataRata) . " / 75"
                ],
                [
                    'name' => 'Semua kuis lulus (nilai ≥ passing grade)',
                    'status' => $semuaLulus,
                    'nilai' => $semuaLulus ? '✓' : '✗'
                ]
            ];
            
            return response()->json([
                'success' => true,
                'data' => $data,
                'requirements' => $requirements,
                'is_eligible' => $isEligible
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error getSertifikatPeserta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getQuizResultsPeserta(int $idPeserta)
    {
        $peserta = Peserta::find($idPeserta);
        if (!$peserta) {
            return [
                'rata_rata' => 0, 
                'total_quiz' => 0, 
                'quiz_dikerjakan' => 0, 
                'semua_lulus' => false, 
                'detail_kuis' => []
            ];
        }
        
        $divisiNama = $peserta->divisi ? trim($peserta->divisi->nama_divisi) : null;
        
        $kuisDikerjakan = JawabanKuis::where('id_user', $peserta->id_user)
            ->select('id_kuis', DB::raw('MAX(skor) as skor_tertinggi'))
            ->groupBy('id_kuis')
            ->get();
        
        $detailKuis = [];
        $totalNilai = 0;
        $quizDikerjakan = 0;
        $semuaLulus = true;
        
        foreach ($kuisDikerjakan as $item) {
            $kuis = Kuis::find($item->id_kuis);
            if (!$kuis) continue;
            
            if ($divisiNama && $kuis->divisi && trim($kuis->divisi) !== $divisiNama) {
                continue;
            }
            
            $nilai = $item->skor_tertinggi;
            $passing = $kuis->passing ?? 75;
            $lulus = $nilai >= $passing;
            
            $quizDikerjakan++;
            $totalNilai += $nilai;
            
            if (!$lulus) {
                $semuaLulus = false;
            }
            
            $detailKuis[] = [
                'nama' => $kuis->judul_kuis,
                'nilai' => round($nilai),
                'passing' => $passing,
                'lulus' => $lulus,
                'grade' => $this->getGrade($nilai),
                'status' => $lulus ? 'Lulus' : 'Tidak Lulus'
            ];
        }
        
        $totalQuiz = $quizDikerjakan;
        $rataRata = $quizDikerjakan > 0 ? $totalNilai / $quizDikerjakan : 0;
        
        return [
            'rata_rata' => $rataRata,
            'total_quiz' => $totalQuiz,
            'quiz_dikerjakan' => $quizDikerjakan,
            'semua_lulus' => $semuaLulus && $quizDikerjakan > 0,
            'detail_kuis' => $detailKuis
        ];
    }

    /**
     * Generate Sertifikat Kompetensi dengan Template
     */
    private function generateSertifikatKompetensi($peserta, $quizResults)
    {
        // Cek sertifikat kompetensi yang sudah ada
        $existing = Sertifikat::where('id_peserta', $peserta->id_peserta)
            ->whereHas('template', function ($q) {
                $q->where('jenis_sertifikat', 'kompetensi');
            })
            ->first();
        
        if ($existing) {
            Log::info('Competency certificate already exists for peserta: ' . $peserta->id_peserta);
            return $existing;
        }
        
        $year = date('Y');
        $month = date('m');
        $lastSertifikat = Sertifikat::whereYear('created_at', $year)
            ->whereHas('template', function ($q) {
                $q->where('jenis_sertifikat', 'kompetensi');
            })
            ->count();
        $number = str_pad($lastSertifikat + 1, 4, '0', STR_PAD_LEFT);
        $nomorSertifikat = "SKL/{$year}/{$month}/{$number}";
        
        $divisiNama = $peserta->divisi ? $peserta->divisi->nama_divisi : 'Umum';
        
        $template = SertifikatTemplate::where('jenis_sertifikat', 'kompetensi')
            ->where(function($q) use ($peserta) {
                $q->where('divisi_id', $peserta->id_divisi)
                  ->orWhereNull('divisi_id');
            })
            ->where('is_active', true)
            ->first();
        
        if (!$template) {
            Log::warning('No active template found for divisi: ' . $peserta->id_divisi);
            return null;
        }
        
        $bidangKompetensi = $template->bidang_kompetensi ?? $divisiNama;
        
        $sertifikat = Sertifikat::create([
            'template_id' => $template->id,
            'id_peserta' => $peserta->id_peserta,
            'nomor_sertifikat' => $nomorSertifikat,
            'bidang_kompetensi' => $bidangKompetensi,
            'tanggal_terbit' => now(),
            'file_sertifikat' => null
        ]);
        
        $this->generatePdfFromTemplate($sertifikat, $peserta, $quizResults);
        $sertifikat->refresh();
        
        return $sertifikat;
    }
    
    /**
     * Generate PDF Sertifikat Magang Dinamis
     * Menampilkan nama peserta, divisi, dan nama mentor
     */
    public function generateSertifikatMagang(Request $request)
    {
        try {
            Log::info('=== START generateSertifikatMagang ===');
            
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan'
                ], 401);
            }
            
            $peserta = Peserta::with(['divisi', 'mentor.user'])->where('id_user', $user->id_user)->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }
            
            Log::info('Peserta ID: ' . $peserta->id_peserta);
            
            // Ambil nama mentor
            $mentorName = '-';
            if ($peserta->mentor && $peserta->mentor->user) {
                $mentorName = $peserta->mentor->user->nama;
            }
            Log::info('Mentor: ' . $mentorName);
            
            // Ambil nama COO dari database
            $coo = User::where('role', 'coo')
                ->where('status_akun', 'aktif')
                ->first();
            $cooName = $coo ? $coo->nama : 'COO';
            
            // Ambil nilai akhir peserta dari tabel nilai_pesertas
            $nilaiAkhir = DB::table('nilai_pesertas')
                ->where('id_peserta', $peserta->id_peserta)
                ->where('status', 'final')
                ->first();
            
            Log::info('Nilai akhir: ' . ($nilaiAkhir ? $nilaiAkhir->nilai_akhir : 'null'));
            
            // Ambil template magang
            $template = SertifikatTemplate::where('jenis_sertifikat', 'magang')
                ->where('is_active', true)
                ->first();
            
            if (!$template) {
                Log::error('Template magang tidak ditemukan di database');
                return response()->json([
                    'success' => false,
                    'message' => 'Template sertifikat magang belum tersedia. Silakan hubungi COO untuk upload template.'
                ], 404);
            }
            
            Log::info('Template ID: ' . $template->id);
            Log::info('Template file_path: ' . $template->file_path);
            
            if (!$template->file_path) {
                Log::error('Template file_path kosong');
                return response()->json([
                    'success' => false,
                    'message' => 'File template tidak ditemukan'
                ], 404);
            }
            
            $templatePath = storage_path('app/public/' . $template->file_path);
            Log::info('Template path absolut: ' . $templatePath);
            
            if (!file_exists($templatePath)) {
                Log::error('Template file tidak ada di path: ' . $templatePath);
                return response()->json([
                    'success' => false,
                    'message' => 'File template tidak ditemukan: ' . $template->file_path
                ], 404);
            }
            
            // Buat direktori jika belum ada
            $sertifikatDir = storage_path('app/public/sertifikat');
            if (!is_dir($sertifikatDir)) {
                mkdir($sertifikatDir, 0755, true);
            }
            
            $divisiNama = $peserta->divisi ? $peserta->divisi->nama_divisi : 'Peserta Magang';
            $tanggal = date('d F Y');
            $nomorSertifikat = "SKL-MAGANG/" . date('Y') . "/" . date('m') . "/" . str_pad($peserta->id_peserta, 4, '0', STR_PAD_LEFT);
            
            $pdfFilename = 'sertifikat/sertifikat_magang_' . $peserta->id_peserta . '_' . date('Ymd') . '.pdf';
            $pdfPath = storage_path('app/public/' . $pdfFilename);
            
            $extension = strtolower($template->file_extension);
            
            if (!in_array($extension, ['png', 'jpg', 'jpeg'])) {
                Log::error('Format file tidak didukung: ' . $extension);
                return response()->json([
                    'success' => false,
                    'message' => 'Format file tidak didukung. Harus PNG, JPG, atau JPEG.'
                ], 500);
            }
            
            // Get image size
            $imageInfo = @getimagesize($templatePath);
            if (!$imageInfo) {
                Log::error('Gagal membaca ukuran gambar: ' . $templatePath);
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membaca file template'
                ], 500);
            }
            
            $pdf = new FPDF('L', 'mm', 'A4');
            $pdf->AddPage();
            
            $pageWidth = 297;
            $pageHeight = 210;
            
            // Pasang template gambar presisi memenuhi kertas A4
            $pdf->Image($templatePath, 0, 0, $pageWidth, $pageHeight);
            
            // Warna teks resmi Kuanta
            $darkBlue = array(21, 58, 123);   // #153A7B
            $charcoal = array(45, 50, 60);    // Abu-abu gelap
            
            // ========== 1. NAMA PESERTA (Y = 78) ==========
            $pdf->SetFont('Helvetica', 'B', 30); 
            $pdf->SetTextColor($darkBlue[0], $darkBlue[1], $darkBlue[2]);
            $pdf->SetXY(0, 78); 
            $pdf->Cell($pageWidth, 12, strtoupper($user->nama), 0, 1, 'C');
            
            // ========== 2. NAMA DIVISI (Y = 130) ==========
            $pdf->SetFont('Helvetica', 'B', 22);
            $pdf->SetTextColor($darkBlue[0], $darkBlue[1], $darkBlue[2]);
            $pdf->SetXY(0, 130); 
            $pdf->Cell($pageWidth, 10, strtoupper($divisiNama), 0, 1, 'C');
            
            // ========== 3. NOMOR SERTIFIKAT (Y = 148) ==========
            $pdf->SetFont('Helvetica', '', 10);
            $pdf->SetTextColor($charcoal[0], $charcoal[1], $charcoal[2]);
            $pdf->SetXY(0, 148); 
            $pdf->Cell($pageWidth, 5, 'No. Sertifikat : ' . $nomorSertifikat, 0, 1, 'C');
            
            // ========== 4. TANGGAL TERBIT (Y = 154) ==========
            $pdf->SetXY(0, 154); 
            $pdf->Cell($pageWidth, 5, 'Surabaya, ' . $tanggal, 0, 1, 'C');
            
            // ========== 5. NAMA MENTOR (Kiri) ==========
            $pdf->SetFont('Helvetica', 'B', 12); 
            $pdf->SetTextColor($darkBlue[0], $darkBlue[1], $darkBlue[2]);
            $pdf->SetXY(32, 177); 
            $pdf->Cell(70, 5, $mentorName, 0, 0, 'C');
            
            // ========== 6. NAMA COO (Kanan) ==========
            $pdf->SetXY(195, 177); 
            $pdf->Cell(70, 5, $cooName, 0, 0, 'C');
            
            // Simpan PDF
            $pdf->Output('F', $pdfPath);
            
            Log::info('PDF berhasil disimpan di: ' . $pdfPath);
            
            // Simpan ke database
            $sertifikat = Sertifikat::updateOrCreate(
                ['id_peserta' => $peserta->id_peserta, 'template_id' => $template->id],
                [
                    'nomor_sertifikat' => $nomorSertifikat,
                    'tanggal_terbit' => now(),
                    'file_sertifikat' => $pdfFilename
                ]
            );
            
            Log::info('Sertifikat berhasil disimpan ke database');
            
            return response()->json([
                'success' => true,
                'message' => 'Sertifikat magang berhasil digenerate',
                'data' => [
                    'id' => $sertifikat->id_sertifikat,
                    'file_url' => Storage::url($pdfFilename),
                    'download_url' => url('/api/peserta/sertifikat-magang/download/' . $sertifikat->id_sertifikat),
                    'certificate_number' => $nomorSertifikat
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error generateSertifikatMagang: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate sertifikat magang: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generate PDF dari Template Baru - HANYA mengisi data variabel
     * Tidak menggambar garis, tidak menulis deskripsi, tidak menulis nama/jabatan CEO
     */
    private function generatePdfFromTemplate($sertifikat, $peserta, $quizResults)
    {
        try {
            Log::info('=== GENERATE PDF (Clean Version) ===');
            
            $template = $sertifikat->template;
            if (!$template || !$template->file_path) {
                Log::error('Template not found');
                return false;
            }
            
            $templatePath = storage_path('app/public/' . $template->file_path);
            if (!file_exists($templatePath)) {
                Log::error('Template file not found: ' . $templatePath);
                return false;
            }
            
            $sertifikatDir = storage_path('app/public/sertifikat');
            if (!is_dir($sertifikatDir)) {
                mkdir($sertifikatDir, 0755, true);
            }
            
            $divisiNama = $peserta->divisi ? strtoupper($peserta->divisi->nama_divisi) : 'UMUM';
            $user = $peserta->user;
            
            // Ambil nama COO dari database untuk sertifikat kompetensi
            $coo = User::where('role', 'coo')
                ->where('status_akun', 'aktif')
                ->first();
            $cooName = $coo ? strtoupper($coo->nama) : 'COO BELUM DI SET';
            
            // Log untuk debugging
            Log::info('COO Name: ' . $cooName);
            
            $pdfFilename = 'sertifikat/sertifikat_' . $sertifikat->id_sertifikat . '.pdf';
            $pdfPath = storage_path('app/public/' . $pdfFilename);
            
            $extension = strtolower($template->file_extension);
            
            if (in_array($extension, ['png', 'jpg', 'jpeg'])) {
                // Gunakan ukuran A4 Landscape (297 x 210 mm)
                $pageWidth = 297;
                $pageHeight = 210;
                
                $pdf = new FPDF('L', 'mm', 'A4');
                $pdf->AddPage();
                
                // Pasang gambar template (SEMUA ELEMEN DESAIN SUDAH ADA DI SINI)
                $pdf->Image($templatePath, 0, 0, $pageWidth, $pageHeight);
                
                // =========================================================
                // HANYA 5 FIELD YANG DIISI:
                // 1. Nama Peserta
                // 2. Bidang Kompetensi (Nama Divisi)
                // 3. Nomor Sertifikat
                // 4. Tanggal Terbit
                // 5. Nama COO (di bawah "Penanggung Jawab Program" - sebelah kanan)
                // =========================================================
                
                // 1. NAMA PESERTA (tanpa garis, tanpa background)
                $pdf->SetFont('Helvetica', 'B', 24);
                $pdf->SetTextColor(21, 58, 123);
                $pdf->SetXY(0, 72);
                $pdf->Cell($pageWidth, 10, strtoupper($user->nama), 0, 1, 'C');
                
                // 2. BIDANG KOMPETENSI
                $pdf->SetFont('Helvetica', 'B', 18);
                $pdf->SetTextColor(21, 58, 123);
                $pdf->SetXY(0, 110);
                $pdf->Cell($pageWidth, 8, strtoupper($divisiNama), 0, 1, 'C');
                
                // 3. NOMOR SERTIFIKAT
                $pdf->SetFont('Helvetica', '', 10);
                $pdf->SetTextColor(45, 50, 60);
                $pdf->SetXY(0, 120);
                $pdf->Cell($pageWidth, 5, 'No. Sertifikat : ' . $sertifikat->nomor_sertifikat, 0, 1, 'C');
                
                // 4. TANGGAL TERBIT
                $pdf->SetXY(0, 126);
                $pdf->Cell($pageWidth, 5, 'Tanggal Terbit : ' . $sertifikat->tanggal_terbit->format('d F Y'), 0, 1, 'C');
                
                // =========================================================
                // 5. NAMA COO (Penanggung Jawab)
                // TULISAN "Penanggung Jawab Program" sudah ada di template
                // Kita hanya perlu menulis nama COO di BAWAHnya (sebelah kanan)
                // =========================================================
                $pdf->SetFont('Helvetica', 'B', 12);
                $pdf->SetTextColor(21, 58, 123);
                $pdf->SetXY(195, 185.99);
                $pdf->Cell(70, 4, $cooName, 0, 0, 'C');
                
                // =========================================================
                // TIDAK ADA KODE LAIN:
                // - Tidak double di kiri
                // - Tidak di atas
                // - Hanya satu di kanan bawah
                // =========================================================
                
                // Save PDF
                $pdf->Output('F', $pdfPath);
                
                $sertifikat->file_sertifikat = $pdfFilename;
                $sertifikat->save();
                
                Log::info('PDF Kompetensi berhasil dibuat dengan COO: ' . $cooName);
                Log::info('PDF saved at: ' . $pdfPath);
                return true;
            }
            
            return false;
            
        } catch (\Exception $e) {
            Log::error('Error generatePdfFromTemplate: ' . $e->getMessage());
            return false;
        }
    }
    
    public function downloadSertifikatPeserta(int $id)
    {
        try {
            Log::info('Download certificate request for ID: ' . $id);
            
            $sertifikat = Sertifikat::with('template')->findOrFail($id);
            
            $user = request()->user();
            $peserta = Peserta::where('id_user', $user->id_user)->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }
            
            if ($sertifikat->id_peserta != $peserta->id_peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            if (!$sertifikat->file_sertifikat || !Storage::disk('public')->exists($sertifikat->file_sertifikat)) {
                Log::info('File not found, generating certificate...');
                $quizResults = $this->getQuizResultsPeserta($peserta->id_peserta);
                $generated = $this->generatePdfFromTemplate($sertifikat, $peserta, $quizResults);
                
                if (!$generated) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal generate sertifikat'
                    ], 500);
                }
                $sertifikat->refresh();
            }
            
            if ($sertifikat->file_sertifikat && Storage::disk('public')->exists($sertifikat->file_sertifikat)) {
                $filePath = storage_path('app/public/' . $sertifikat->file_sertifikat);
                $downloadFileName = basename($sertifikat->file_sertifikat);
                
                return response()->download($filePath, $downloadFileName, [
                    'Content-Type' => 'application/pdf'
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'File sertifikat belum tersedia'
            ], 404);
            
        } catch (\Exception $e) {
            Log::error('Error downloadSertifikatPeserta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal download sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateSertifikatPeserta(Request $request)
    {
        try {
            $user = $request->user();
            $peserta = Peserta::where('id_user', $user->id_user)->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }
            
            $quizResults = $this->getQuizResultsPeserta($peserta->id_peserta);
            $isEligible = $quizResults['semua_lulus'] && $quizResults['rata_rata'] >= 75;
            
            if (!$isEligible) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda belum memenuhi syarat untuk mendapatkan sertifikat'
                ], 400);
            }
            
            $sertifikat = $this->generateSertifikatKompetensi($peserta, $quizResults);
            
            return response()->json([
                'success' => true,
                'message' => 'Sertifikat berhasil digenerate',
                'data' => $sertifikat
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error generateSertifikatPeserta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal generate sertifikat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Force regenerate certificate for debugging
     * GET /api/sertifikat/force-regenerate/{userId}
     */
    public function forceRegenerate($userId)
    {
        try {
            Log::info('=== FORCE REGENERATE CERTIFICATE ===');
            Log::info('User ID: ' . $userId);
            
            // Cari peserta berdasarkan user_id
            $peserta = Peserta::where('id_user', $userId)->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan untuk user ID: ' . $userId
                ], 404);
            }
            
            Log::info('Peserta ditemukan:', [
                'id_peserta' => $peserta->id_peserta,
                'id_divisi' => $peserta->id_divisi
            ]);
            
            // Ambil hasil kuis
            $quizResults = $this->getQuizResultsPeserta($peserta->id_peserta);
            
            Log::info('Quiz Results:', [
                'rata_rata' => $quizResults['rata_rata'],
                'semua_lulus' => $quizResults['semua_lulus'],
                'quiz_dikerjakan' => $quizResults['quiz_dikerjakan']
            ]);
            
            // Cek kelayakan
            $isEligible = $quizResults['semua_lulus'] && $quizResults['rata_rata'] >= 75;
            
            if (!$isEligible) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta belum memenuhi syarat',
                    'rata_rata' => $quizResults['rata_rata'],
                    'semua_lulus' => $quizResults['semua_lulus']
                ]);
            }
            
            // Hapus sertifikat kompetensi lama
            $deleted = Sertifikat::where('id_peserta', $peserta->id_peserta)
                ->whereHas('template', function ($q) {
                    $q->where('jenis_sertifikat', 'kompetensi');
                })
                ->delete();
            
            Log::info('Deleted old certificates: ' . $deleted);
            
            // Generate baru
            $sertifikat = $this->generateSertifikatKompetensi($peserta, $quizResults);
            
            if ($sertifikat) {
                return response()->json([
                    'success' => true,
                    'message' => 'Sertifikat berhasil digenerate',
                    'data' => [
                        'id_sertifikat' => $sertifikat->id_sertifikat,
                        'nomor_sertifikat' => $sertifikat->nomor_sertifikat,
                        'file_url' => $sertifikat->file_sertifikat ? Storage::url($sertifikat->file_sertifikat) : null
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal generate sertifikat - cek log untuk detail'
                ], 500);
            }
            
        } catch (\Exception $e) {
            Log::error('Force Regenerate Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check certificate type for debugging
     */
    public function checkCertificateType(Request $request)
    {
        try {
            $user = $request->user();
            $peserta = Peserta::where('id_user', $user->id_user)->first();
            
            if (!$peserta) {
                return response()->json(['success' => false, 'message' => 'Peserta tidak ditemukan'], 404);
            }
            
            $sertifikatKompetensi = Sertifikat::where('id_peserta', $peserta->id_peserta)
                ->whereHas('template', function ($q) {
                    $q->where('jenis_sertifikat', 'kompetensi');
                })
                ->first();
            
            $sertifikatMagang = Sertifikat::where('id_peserta', $peserta->id_peserta)
                ->whereHas('template', function ($q) {
                    $q->where('jenis_sertifikat', 'magang');
                })
                ->first();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'sertifikat_kompetensi' => $sertifikatKompetensi ? true : false,
                    'sertifikat_magang' => $sertifikatMagang ? true : false,
                    'kompetensi_id' => $sertifikatKompetensi ? $sertifikatKompetensi->id_sertifikat : null,
                    'magang_id' => $sertifikatMagang ? $sertifikatMagang->id_sertifikat : null,
                    'kompetensi_template_id' => $sertifikatKompetensi ? $sertifikatKompetensi->template_id : null,
                    'magang_template_id' => $sertifikatMagang ? $sertifikatMagang->template_id : null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function getGrade(float $nilai): string
    {
        if ($nilai >= 90) return 'A';
        if ($nilai >= 80) return 'B';
        if ($nilai >= 70) return 'C';
        if ($nilai >= 60) return 'D';
        return 'E';
    }

    private function getGradeText(float $nilai): string
    {
        if ($nilai >= 90) return 'Sangat Memuaskan';
        if ($nilai >= 80) return 'Memuaskan';
        if ($nilai >= 70) return 'Cukup';
        if ($nilai >= 60) return 'Kurang';
        return 'Buruk';
    }
}