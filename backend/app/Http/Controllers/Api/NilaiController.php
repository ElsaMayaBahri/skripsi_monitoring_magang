<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NilaiPeserta;
use App\Models\Mentor;
use App\Models\Peserta;
use App\Models\Presensi;
use App\Models\PengumpulanTugas;
use App\Models\JawabanKuis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NilaiController extends Controller
{
    /**
     * Get all nilai for logged in mentor
     * GET /api/mentor/nilai
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

            $pesertas = Peserta::with('user', 'divisi')
                ->where('id_mentor', $mentor->id_mentor)
                ->get();

            $nilaiList = [];

            foreach ($pesertas as $peserta) {
                $nilai = NilaiPeserta::where('id_peserta', $peserta->id_peserta)->first();
                
                $nilaiList[] = [
                    'id' => $peserta->id_peserta,
                    'id_peserta' => $peserta->id_peserta,
                    'nama' => $peserta->user->nama ?? 'Unknown',
                    'nama_peserta' => $peserta->user->nama ?? 'Unknown',
                    'divisi' => $peserta->divisi ? $peserta->divisi->nama_divisi : '-',
                    'sikap' => $nilai ? $nilai->sikap : null,
                    'kualitas_kerja' => $nilai ? $nilai->kualitas_kerja : null,
                    'komunikasi' => $nilai ? $nilai->komunikasi : null,
                    'kreativitas' => $nilai ? $nilai->kreativitas : null,
                    'kerjasama' => $nilai ? $nilai->kerjasama : null,
                    'inisiatif' => $nilai ? $nilai->inisiatif : null,
                    'nilai_kehadiran' => $nilai ? $nilai->nilai_kehadiran : null,
                    'nilai_tugas' => $nilai ? $nilai->nilai_tugas : null,
                    'nilai_kuis' => $nilai ? $nilai->nilai_kuis : null,
                    'nilai_akhir' => $nilai ? $nilai->nilai_akhir : null,
                    'status' => $nilai && $nilai->status === 'final' ? 'sudah_final' : 'belum_final',
                    'catatan' => $nilai ? $nilai->catatan_mentor : null,
                    'catatan_mentor' => $nilai ? $nilai->catatan_mentor : null,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $nilaiList,
                'total' => count($nilaiList)
            ]);

        } catch (\Exception $e) {
            Log::error('Nilai Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save or update nilai for a peserta
     * POST /api/mentor/nilai
     */
    public function store(Request $request)
{
    try {
        $user = Auth::user();
        
        Log::info('=== STORE NILAI START ===');
        Log::info('Request data:', $request->all());
        Log::info('User ID: ' . ($user->id_user ?? 'null'));
        Log::info('User Role: ' . ($user->role ?? 'null'));
        
        if ($user->role !== 'mentor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $mentor = Mentor::where('id_user', $user->id_user)->first();
        
        Log::info('Mentor found: ' . ($mentor ? 'yes' : 'no'));
        
        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Data mentor tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'id_peserta' => 'required|exists:pesertas,id_peserta',
            'sikap' => 'nullable|integer|min:0|max:100',
            'kualitas_kerja' => 'nullable|integer|min:0|max:100',
            'komunikasi' => 'nullable|integer|min:0|max:100',
            'kreativitas' => 'nullable|integer|min:0|max:100',
            'kerjasama' => 'nullable|integer|min:0|max:100',
            'inisiatif' => 'nullable|integer|min:0|max:100',
            'catatan' => 'nullable|string|max:1000',
        ]);

        Log::info('Validation passed');

        $peserta = Peserta::where('id_peserta', $request->id_peserta)
            ->where('id_mentor', $mentor->id_mentor)
            ->first();

        Log::info('Peserta found: ' . ($peserta ? 'yes, id=' . $peserta->id_peserta : 'no'));

        if (!$peserta) {
            return response()->json([
                'success' => false,
                'message' => 'Peserta tidak ditemukan atau bukan bimbingan Anda'
            ], 404);
        }

        // Cari atau buat data nilai
        $nilai = NilaiPeserta::firstOrNew(['id_peserta' => $request->id_peserta]);
        
        Log::info('Nilai record - existing: ' . ($nilai->exists ? 'yes' : 'no'));
        
        // Update nilai
        $nilai->sikap = $request->sikap;
        $nilai->kualitas_kerja = $request->kualitas_kerja;
        $nilai->komunikasi = $request->komunikasi;
        $nilai->kreativitas = $request->kreativitas;
        $nilai->kerjasama = $request->kerjasama;
        $nilai->inisiatif = $request->inisiatif;
        $nilai->catatan_mentor = $request->catatan;
        $nilai->dinilai_oleh = $user->nama;
        $nilai->dinilai_pada = now();
        
        // Jangan ubah status jika sudah final
        if ($nilai->status !== 'final') {
            $nilai->status = 'pending';
        }
        
        $nilai->save();
        
        Log::info('Nilai saved successfully');

        return response()->json([
            'success' => true,
            'message' => 'Nilai berhasil disimpan',
            'data' => [
                'id_peserta' => $peserta->id_peserta,
                'nama' => $peserta->user->nama,
                'sikap' => $nilai->sikap,
                'kualitas_kerja' => $nilai->kualitas_kerja,
                'status' => $nilai->status,
            ]
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('Validation Error: ' . json_encode($e->errors()));
        return response()->json([
            'success' => false,
            'message' => 'Validasi gagal',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        Log::error('Store Error: ' . $e->getMessage());
        Log::error('Store Error Line: ' . $e->getLine());
        Log::error('Store Error File: ' . $e->getFile());
        Log::error('Stack trace: ' . $e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Gagal menyimpan nilai: ' . $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile()
        ], 500);
    }
}
    /**
     * Finalize nilai for a peserta
     * POST /api/mentor/nilai/{id}/finalize
     */
    public function finalize(Request $request, $id)
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

            // Cek apakah peserta adalah bimbingan mentor ini
            $peserta = Peserta::where('id_peserta', $id)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan atau bukan bimbingan Anda'
                ], 404);
            }

            // Cek data nilai
            $nilai = NilaiPeserta::where('id_peserta', $id)->first();
            
            if (!$nilai) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data nilai tidak ditemukan, input nilai terlebih dahulu'
                ], 404);
            }

            // Validasi nilai manual (minimal sikap dan kualitas kerja)
            if ($nilai->sikap === null || $nilai->kualitas_kerja === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lengkapi nilai sikap dan kualitas kerja terlebih dahulu'
                ], 422);
            }

            // Dapatkan id_user dari peserta
            $idUser = $peserta->id_user;
            
            // Hitung nilai kehadiran
            $kehadiran = $this->hitungKehadiran($idUser);
            
            // Hitung nilai tugas
            $nilaiTugas = $this->hitungNilaiTugas($idUser);
            
            // Hitung nilai kuis
            $nilaiKuis = $this->hitungNilaiKuis($idUser);
            
            // Hitung nilai akhir menggunakan method dari model
            $nilaiAkhir = NilaiPeserta::hitungNilaiAkhir(
                $kehadiran, $nilaiTugas, $nilaiKuis,
                $nilai->sikap ?? 0,
                $nilai->kualitas_kerja ?? 0,
                $nilai->komunikasi ?? 0,
                $nilai->kreativitas ?? 0,
                $nilai->kerjasama ?? 0,
                $nilai->inisiatif ?? 0
            );
            
            // Update data nilai
            $nilai->nilai_kehadiran = $kehadiran;
            $nilai->nilai_tugas = $nilaiTugas;
            $nilai->nilai_kuis = $nilaiKuis;
            $nilai->nilai_akhir = $nilaiAkhir;
            $nilai->status = 'final';
            $nilai->save();

            return response()->json([
                'success' => true,
                'message' => 'Nilai berhasil difinalisasi',
                'data' => [
                    'id_peserta' => $id,
                    'nilai_kehadiran' => $kehadiran,
                    'nilai_tugas' => $nilaiTugas,
                    'nilai_kuis' => $nilaiKuis,
                    'nilai_akhir' => $nilaiAkhir,
                    'grade' => $nilai->grade,
                    'status' => $nilai->status
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Nilai Finalize Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Gagal finalisasi nilai: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hitung kehadiran peserta (persentase)
     */
    private function hitungKehadiran($idUser)
    {
        try {
            $presensi = Presensi::where('id_user', $idUser)->get();
            
            if ($presensi->isEmpty()) {
                return 0;
            }
            
            $total = $presensi->count();
            $hadir = $presensi->where('status_kehadiran', 'hadir')->count();
            
            return $total > 0 ? round(($hadir / $total) * 100, 2) : 0;
            
        } catch (\Exception $e) {
            Log::warning('Hitung kehadiran error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Hitung nilai tugas
     */
    private function hitungNilaiTugas($idUser)
    {
        try {
            $pengumpulan = PengumpulanTugas::with('tugas')
                ->where('id_user', $idUser)
                ->get();
            
            if ($pengumpulan->isEmpty()) {
                return 0;
            }
            
            $totalNilai = 0;
            $count = 0;
            
            foreach ($pengumpulan as $item) {
                // Jika tugas sudah dinilai
                if ($item->nilai !== null && $item->nilai > 0) {
                    $totalNilai += $item->nilai;
                    $count++;
                    continue;
                }
                
                // Jika belum kumpul
                if (!$item->tanggal_kumpul) {
                    $totalNilai += 0;
                    $count++;
                    continue;
                }
                
                $deadline = $item->tugas->deadline ?? null;
                if (!$deadline) {
                    $totalNilai += 100;
                    $count++;
                    continue;
                }
                
                $tanggalKumpul = Carbon::parse($item->tanggal_kumpul);
                $deadlineDate = Carbon::parse($deadline);
                $daysLate = $deadlineDate->diffInDays($tanggalKumpul, false);
                
                if ($daysLate <= 0) {
                    $totalNilai += 100;
                } elseif ($daysLate <= 3) {
                    $totalNilai += 70;
                } else {
                    $totalNilai += 50;
                }
                $count++;
            }
            
            return $count > 0 ? round($totalNilai / $count, 2) : 0;
            
        } catch (\Exception $e) {
            Log::warning('Hitung nilai tugas error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Hitung nilai kuis
     */
    private function hitungNilaiKuis($idUser)
    {
        try {
            $jawaban = JawabanKuis::where('id_user', $idUser)
                ->whereNotNull('skor')
                ->get();
            
            if ($jawaban->isNotEmpty()) {
                $totalNilai = $jawaban->sum('skor');
                return round($totalNilai / $jawaban->count(), 2);
            }
            
            return 0;
            
        } catch (\Exception $e) {
            Log::warning('Hitung nilai kuis error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get grade based on score
     */
    private function getGrade($nilai)
    {
        if ($nilai >= 85) return 'A';
        if ($nilai >= 75) return 'B';
        if ($nilai >= 65) return 'C';
        if ($nilai >= 50) return 'D';
        return 'E';
    }

    /**
     * Get rekap nilai for export
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
                $nilai = NilaiPeserta::where('id_peserta', $peserta->id_peserta)->first();
                
                $exportData[] = [
                    'Nama Peserta' => $peserta->user->nama ?? 'Unknown',
                    'Divisi' => $peserta->divisi ? $peserta->divisi->nama_divisi : '-',
                    'Nilai Kehadiran' => $nilai ? $nilai->nilai_kehadiran : '-',
                    'Nilai Tugas' => $nilai ? $nilai->nilai_tugas : '-',
                    'Nilai Kuis' => $nilai ? $nilai->nilai_kuis : '-',
                    'Nilai Sikap' => $nilai ? $nilai->sikap : '-',
                    'Nilai Kualitas Kerja' => $nilai ? $nilai->kualitas_kerja : '-',
                    'Nilai Akhir' => $nilai ? $nilai->nilai_akhir : '-',
                    'Grade' => $nilai ? $nilai->grade : '-',
                    'Status' => $nilai && $nilai->status === 'final' ? 'Sudah Final' : 'Belum Final',
                    'Catatan Mentor' => $nilai ? $nilai->catatan_mentor : '-',
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $exportData,
                'count' => count($exportData)
            ]);

        } catch (\Exception $e) {
            Log::error('Nilai Export Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal export data: ' . $e->getMessage()
            ], 500);
        }
    }
}