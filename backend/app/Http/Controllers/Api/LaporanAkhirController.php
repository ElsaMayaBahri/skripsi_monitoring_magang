<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LaporanAkhir;
use App\Models\Mentor;
use App\Models\Peserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LaporanAkhirController extends Controller
{
    /**
     * Get all laporan akhir for logged in mentor
     * GET /api/mentor/laporan-akhir
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

            // Get all peserta under this mentor
            $pesertas = Peserta::with('user', 'divisi')
                ->where('id_mentor', $mentor->id_mentor)
                ->get();

            $laporanList = [];

            foreach ($pesertas as $peserta) {
                $laporan = LaporanAkhir::where('id_peserta', $peserta->id_peserta)->first();
                
                $status = 'not_uploaded';
                $fileUrl = null;
                $fileSize = null;
                $uploadedAt = null;
                $judul = null;
                $deskripsi = null;
                $catatan = null;
                $nilai = null;
                $dinilaiOleh = null;
                $dinilaiPada = null;
                $fileLaporan = null;

                if ($laporan) {
                    $status = $laporan->status ?? 'pending';
                    // PERBAIKAN: Gunakan asset() untuk absolute URL
                    $fileUrl = $laporan->file_laporan
                        ? asset('storage/' . $laporan->file_laporan)
                        : null;
                    $fileLaporan = $laporan->file_laporan;
                    $fileSize = $laporan->file_size;
                    $uploadedAt = $laporan->tanggal_upload ?? $laporan->created_at;
                    $judul = $laporan->judul;
                    $deskripsi = $laporan->deskripsi;
                    $catatan = $laporan->catatan_mentor;
                    $nilai = $laporan->nilai_akhir;
                    $dinilaiOleh = $laporan->dinilai_oleh;
                    $dinilaiPada = $laporan->dinilai_pada;
                }

                $laporanList[] = [
                    'id' => $laporan ? $laporan->id_laporan : null,
                    'peserta_id' => $peserta->id_peserta,
                    'peserta_nama' => $peserta->user->nama ?? 'Unknown',
                    'peserta_divisi' => $peserta->divisi ? $peserta->divisi->nama_divisi : '-',
                    'judul' => $judul,
                    'deskripsi' => $deskripsi,
                    'file_laporan' => $fileLaporan,
                    'file_url' => $fileUrl,
                    'file_size' => $fileSize,
                    'uploaded_at' => $uploadedAt,
                    'status' => $status,
                    'catatan' => $catatan,
                    'dinilai_oleh' => $dinilaiOleh,
                    'dinilai_pada' => $dinilaiPada,
                    'progress' => rand(60, 95),
                    'nilai_akhir' => $nilai,
                ];
            }

            // Apply filters
            $filtered = collect($laporanList);
            
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $filtered = $filtered->filter(function ($item) use ($search) {
                    return stripos($item['peserta_nama'], $search) !== false ||
                           ($item['judul'] && stripos($item['judul'], $search) !== false);
                });
            }

            if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
                if ($request->status === 'uploaded') {
                    $filtered = $filtered->filter(function ($item) {
                        return $item['status'] !== 'not_uploaded';
                    });
                } else {
                    $filtered = $filtered->filter(function ($item) use ($request) {
                        return $item['status'] === $request->status;
                    });
                }
            }

            $summary = [
                'total' => count($laporanList),
                'sudahUpload' => collect($laporanList)->filter(function ($item) {
                    return $item['status'] !== 'not_uploaded';
                })->count(),
                'belumUpload' => collect($laporanList)->filter(function ($item) {
                    return $item['status'] === 'not_uploaded';
                })->count(),
                'disetujui' => collect($laporanList)->filter(function ($item) {
                    return $item['status'] === 'approved';
                })->count(),
                'revisi' => collect($laporanList)->filter(function ($item) {
                    return $item['status'] === 'revision';
                })->count(),
                'pending' => collect($laporanList)->filter(function ($item) {
                    return $item['status'] === 'pending';
                })->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $filtered->values(),
                'summary' => $summary,
                'total' => $filtered->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Laporan Akhir Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single laporan detail
     * GET /api/mentor/laporan-akhir/{id}
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

            $laporan = LaporanAkhir::with('peserta.user', 'peserta.divisi')->find($id);
            
            if (!$laporan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $laporan->id_laporan,
                    'peserta_nama' => $laporan->peserta->user->nama ?? 'Unknown',
                    'peserta_divisi' => $laporan->peserta->divisi->nama_divisi ?? '-',
                    'judul' => $laporan->judul,
                    'deskripsi' => $laporan->deskripsi,
                    'file_laporan' => $laporan->file_laporan,
                    'file_url' => $laporan->file_laporan ? asset('storage/' . $laporan->file_laporan) : null,
                    'file_size' => $laporan->file_size,
                    'uploaded_at' => $laporan->tanggal_upload ?? $laporan->created_at,
                    'status' => $laporan->status,
                    'catatan' => $laporan->catatan_mentor,
                    'nilai_akhir' => $laporan->nilai_akhir,
                    'dinilai_oleh' => $laporan->dinilai_oleh,
                    'dinilai_pada' => $laporan->dinilai_pada,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Laporan Akhir Show Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit review for laporan akhir
     * POST /api/mentor/laporan-akhir/{id}/review
     */
    public function submitReview(Request $request, $id)
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

            $request->validate([
                'status' => 'required|in:pending,approved,revision',
                'catatan' => 'nullable|string|max:1000',
            ]);

            $laporan = LaporanAkhir::find($id);
            
            if (!$laporan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan tidak ditemukan'
                ], 404);
            }

            // Verify that this laporan belongs to mentor's peserta
            $peserta = Peserta::where('id_peserta', $laporan->id_peserta)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke laporan ini'
                ], 403);
            }

            $updateData = [
                'status' => $request->status,
                'catatan_mentor' => $request->catatan,
                'dinilai_oleh' => $user->nama,
                'dinilai_pada' => now(),
            ];

            // Jika disetujui, berikan nilai default 85
            if ($request->status === 'approved' && !$laporan->nilai_akhir) {
                $updateData['nilai_akhir'] = 85;
            }

            $laporan->update($updateData);

            return response()->json([
                'success' => true,
                'message' => $request->status === 'approved' ? 'Laporan berhasil disetujui' : 'Review berhasil disimpan',
                'data' => [
                    'id' => $laporan->id_laporan,
                    'status' => $laporan->status,
                    'catatan' => $laporan->catatan_mentor,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Laporan Akhir Review Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan review: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download laporan akhir file
     * GET /api/mentor/laporan-akhir/{id}/download
     */
    public function download($id)
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

            $laporan = LaporanAkhir::find($id);
            
            if (!$laporan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan tidak ditemukan'
                ], 404);
            }

            // Verify that this laporan belongs to mentor's peserta
            $peserta = Peserta::where('id_peserta', $laporan->id_peserta)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();
            
            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke laporan ini'
                ], 403);
            }

            if (!$laporan->file_laporan || !Storage::exists($laporan->file_laporan)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File laporan tidak ditemukan'
                ], 404);
            }

            $filePath = storage_path('app/public/' . $laporan->file_laporan);
            $filename = 'laporan_akhir_' . $peserta->user->nama . '_' . date('Y-m-d') . '.pdf';
            
            return response()->download($filePath, $filename, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"'
            ]);

        } catch (\Exception $e) {
            Log::error('Laporan Akhir Download Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal download file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export laporan akhir to Excel/CSV
     * GET /api/mentor/laporan-akhir/export
     */
    public function export(Request $request)
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

            $pesertas = Peserta::with('user', 'divisi')
                ->where('id_mentor', $mentor->id_mentor)
                ->get();

            $exportData = [];

            foreach ($pesertas as $peserta) {
                $laporan = LaporanAkhir::where('id_peserta', $peserta->id_peserta)->first();
                
                $exportData[] = [
                    'Nama Peserta' => $peserta->user->nama ?? 'Unknown',
                    'Divisi' => $peserta->divisi ? $peserta->divisi->nama_divisi : '-',
                    'Judul Laporan' => $laporan ? $laporan->judul : '-',
                    'Deskripsi' => $laporan ? $laporan->deskripsi : '-',
                    'Tanggal Upload' => $laporan && $laporan->tanggal_upload ? $laporan->tanggal_upload->format('Y-m-d H:i') : ($laporan ? $laporan->created_at->format('Y-m-d H:i') : '-'),
                    'Status' => $laporan ? $this->getStatusText($laporan->status) : 'Belum Upload',
                    'Catatan Mentor' => $laporan ? $laporan->catatan_mentor : '-',
                    'Nilai Akhir' => $laporan ? $laporan->nilai_akhir : '-',
                    'Dinilai Oleh' => $laporan ? $laporan->dinilai_oleh : '-',
                    'Dinilai Pada' => $laporan && $laporan->dinilai_pada ? $laporan->dinilai_pada->format('Y-m-d H:i') : '-',
                ];
            }

            // Apply filters if any
            if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
                if ($request->status === 'uploaded') {
                    $exportData = array_filter($exportData, function($item) {
                        return $item['Status'] !== 'Belum Upload';
                    });
                } else {
                    $statusMap = [
                        'pending' => 'Menunggu Review',
                        'approved' => 'Disetujui',
                        'revision' => 'Revisi',
                    ];
                    $filterStatus = $statusMap[$request->status] ?? $request->status;
                    $exportData = array_filter($exportData, function($item) use ($filterStatus) {
                        return $item['Status'] === $filterStatus;
                    });
                }
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $exportData = array_filter($exportData, function($item) use ($search) {
                    return stripos($item['Nama Peserta'], $search) !== false ||
                           ($item['Judul Laporan'] && stripos($item['Judul Laporan'], $search) !== false);
                });
            }

            $exportData = array_values($exportData);

            // Handle Excel export
            if ($request->format === 'excel') {
                return $this->exportToExcel($exportData);
            }

            // Handle CSV export
            if ($request->format === 'csv') {
                return $this->exportToCsv($exportData);
            }

            // Handle PDF export
            if ($request->format === 'pdf') {
                return $this->exportToPdf($exportData);
            }

            // Default JSON response
            return response()->json([
                'success' => true,
                'data' => $exportData,
                'count' => count($exportData),
                'message' => 'Data berhasil diexport'
            ]);

        } catch (\Exception $e) {
            Log::error('Laporan Akhir Export Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal export data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export to Excel (CSV format)
     */
    private function exportToExcel($data)
    {
        $output = fopen('php://temp', 'r+');
        
        // Add headers
        if (!empty($data)) {
            fputcsv($output, array_keys($data[0]));
        }
        
        // Add data rows
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
        
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);
        
        return response($csv)
            ->withHeaders([
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="laporan_akhir_' . date('Y-m-d') . '.csv"',
                'Cache-Control' => 'max-age=0',
            ]);
    }

    /**
     * Export to CSV
     */
    private function exportToCsv($data)
    {
        $output = fopen('php://temp', 'r+');
        
        // Add headers
        if (!empty($data)) {
            fputcsv($output, array_keys($data[0]));
        }
        
        // Add data rows
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
        
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);
        
        return response($csv)
            ->withHeaders([
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="laporan_akhir_' . date('Y-m-d') . '.csv"',
                'Cache-Control' => 'max-age=0',
            ]);
    }

    /**
     * Export to PDF
     */
    private function exportToPdf($data)
    {
        $html = '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Laporan Akhir Magang</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #1e3a5f; text-align: center; margin-bottom: 20px; }
                h3 { color: #1e3a5f; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
                th { background-color: #1e3a5f; color: white; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
                .date { text-align: right; margin-bottom: 20px; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>LAPORAN AKHIR MAGANG</h1>
            <div class="date">Tanggal: ' . date('d-m-Y H:i:s') . '</div>
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nama Peserta</th>
                        <th>Divisi</th>
                        <th>Judul Laporan</th>
                        <th>Tanggal Upload</th>
                        <th>Status</th>
                        <th>Nilai</th>
                    </tr>
                </thead>
                <tbody>';
        
        foreach ($data as $index => $row) {
            $html .= '<tr>
                        <td>' . ($index + 1) . '</td>
                        <td>' . htmlspecialchars($row['Nama Peserta']) . '</td>
                        <td>' . htmlspecialchars($row['Divisi']) . '</td>
                        <td>' . htmlspecialchars($row['Judul Laporan']) . '</td>
                        <td>' . htmlspecialchars($row['Tanggal Upload']) . '</td>
                        <td>' . htmlspecialchars($row['Status']) . '</td>
                        <td>' . htmlspecialchars($row['Nilai Akhir']) . '</td>
                     </tr>';
        }
        
        $html .= '</tbody>
            </table>
            <div class="footer">
                <p>Dicetak dari Sistem Monitoring Magang - Kuanta Academy</p>
            </div>
        </body>
        </html>';
        
        // Use dompdf if installed, otherwise return HTML
        if (class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
            return $pdf->download('laporan_akhir_' . date('Y-m-d') . '.pdf');
        }
        
        // Fallback: return HTML as response
        return response($html)
            ->withHeaders([
                'Content-Type' => 'text/html',
                'Content-Disposition' => 'attachment; filename="laporan_akhir_' . date('Y-m-d') . '.html"',
            ]);
    }

    /**
     * Get status text
     */
    private function getStatusText($status)
    {
        $statusMap = [
            'pending' => 'Menunggu Review',
            'approved' => 'Disetujui',
            'revision' => 'Revisi',
            'not_uploaded' => 'Belum Upload',
        ];
        return $statusMap[$status] ?? $status;
    }

    // ==================== PESERTA METHODS ====================

    /**
     * Get laporan akhir untuk peserta (logged in peserta)
     * GET /api/peserta/laporan-akhir
     */
    public function getPesertaLaporan()
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

            $laporan = LaporanAkhir::where('id_peserta', $peserta->id_peserta)->first();
            
            if (!$laporan) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'Belum ada laporan'
                ]);
            }

            // PERBAIKAN: Gunakan asset() untuk absolute URL
            $fileUrl = $laporan->file_laporan
                ? asset('storage/' . $laporan->file_laporan)
                : null;

            return response()->json([
                'success' => true,
                'data' => [
                    'id_laporan' => $laporan->id_laporan,
                    'judul' => $laporan->judul,
                    'deskripsi' => $laporan->deskripsi,
                    'file_name' => basename($laporan->file_laporan),
                    'file_laporan' => $laporan->file_laporan,
                    'file_url' => $fileUrl,
                    'file_size' => $laporan->file_size,
                    'created_at' => $laporan->created_at,
                    'tanggal_upload' => $laporan->tanggal_upload ?? $laporan->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get Peserta Laporan Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload or update laporan akhir by peserta
     * POST /api/peserta/laporan-akhir
     */
    public function storePesertaLaporan(Request $request)
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

            $request->validate([
                'judul' => 'required|string|max:255',
                'deskripsi' => 'nullable|string',
                'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            ]);

            $laporan = LaporanAkhir::where('id_peserta', $peserta->id_peserta)->first();
            
            $filePath = null;
            $fileSize = null;

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;
                $filePath = $file->storeAs('laporan_akhir', $fileName, 'public');
                $fileSize = $file->getSize();
            }

            if ($laporan) {
                // Update existing laporan
                if ($request->hasFile('file') && $laporan->file_laporan && Storage::disk('public')->exists($laporan->file_laporan)) {
                    Storage::disk('public')->delete($laporan->file_laporan);
                }

                $laporan->update([
                    'judul' => $request->judul,
                    'deskripsi' => $request->deskripsi ?? $laporan->deskripsi,
                    'file_laporan' => $filePath ?? $laporan->file_laporan,
                    'file_size' => $fileSize ?? $laporan->file_size,
                    'tanggal_upload' => now(),
                ]);
            } else {
                // Create new laporan
                $laporan = LaporanAkhir::create([
                    'id_peserta' => $peserta->id_peserta,
                    'judul' => $request->judul,
                    'deskripsi' => $request->deskripsi,
                    'file_laporan' => $filePath,
                    'file_size' => $fileSize,
                    'tanggal_upload' => now(),
                ]);
            }

            // PERBAIKAN: Gunakan asset() untuk absolute URL pada response
            $fileUrl = $laporan->file_laporan
                ? asset('storage/' . $laporan->file_laporan)
                : null;

            return response()->json([
                'success' => true,
                'message' => 'Laporan akhir berhasil ' . ($laporan->wasRecentlyCreated ? 'diupload' : 'diperbarui'),
                'data' => [
                    'id_laporan' => $laporan->id_laporan,
                    'judul' => $laporan->judul,
                    'deskripsi' => $laporan->deskripsi,
                    'file_name' => basename($laporan->file_laporan),
                    'file_laporan' => $laporan->file_laporan,
                    'file_url' => $fileUrl,
                    'created_at' => $laporan->created_at,
                    'tanggal_upload' => $laporan->tanggal_upload,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Store Peserta Laporan Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan laporan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete laporan akhir by peserta
     * DELETE /api/peserta/laporan-akhir
     */
    public function deletePesertaLaporan()
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

            $laporan = LaporanAkhir::where('id_peserta', $peserta->id_peserta)->first();
            
            if (!$laporan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan tidak ditemukan'
                ], 404);
            }

            if ($laporan->file_laporan && Storage::disk('public')->exists($laporan->file_laporan)) {
                Storage::disk('public')->delete($laporan->file_laporan);
            }

            $laporan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Laporan akhir berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            Log::error('Delete Peserta Laporan Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus laporan: ' . $e->getMessage()
            ], 500);
        }
    }
}