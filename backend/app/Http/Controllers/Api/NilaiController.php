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
                    'nama' => $peserta->user->nama ?? 'Unknown',
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
                'id_peserta' => 'required|exists:pesertas,id_peserta',
                'sikap' => 'required|integer|min:0|max:100',
                'kualitas_kerja' => 'required|integer|min:0|max:100',
                'komunikasi' => 'nullable|integer|min:0|max:100',
                'kreativitas' => 'nullable|integer|min:0|max:100',
                'kerjasama' => 'nullable|integer|min:0|max:100',
                'inisiatif' => 'nullable|integer|min:0|max:100',
                'catatan' => 'nullable|string',
            ]);

            $peserta = Peserta::where('id_peserta', $request->id_peserta)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan atau bukan bimbingan Anda'
                ], 404);
            }

            DB::beginTransaction();

            $nilai = NilaiPeserta::updateOrCreate(
                ['id_peserta' => $request->id_peserta],
                [
                    'sikap' => $request->sikap,
                    'kualitas_kerja' => $request->kualitas_kerja,
                    'komunikasi' => $request->komunikasi,
                    'kreativitas' => $request->kreativitas,
                    'kerjasama' => $request->kerjasama,
                    'inisiatif' => $request->inisiatif,
                    'catatan_mentor' => $request->catatan,
                    'dinilai_oleh' => $user->nama,
                    'dinilai_pada' => now(),
                    'status' => 'pending',
                ]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Nilai berhasil disimpan',
                'data' => [
                    'id' => $peserta->id_peserta,
                    'nama' => $peserta->user->nama,
                    'sikap' => $nilai->sikap,
                    'kualitas_kerja' => $nilai->kualitas_kerja,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Nilai Store Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan nilai: ' . $e->getMessage()
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

            // Cek atau buat data nilai jika belum ada
            $nilai = NilaiPeserta::where('id_peserta', $id)->first();
            
            if (!$nilai) {
                // Buat data nilai baru jika belum ada
                $nilai = NilaiPeserta::create([
                    'id_peserta' => $id,
                    'status' => 'pending'
                ]);
            }

            // Validasi nilai sikap dan kualitas kerja
            if ($nilai->sikap === null || $nilai->kualitas_kerja === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lengkapi nilai sikap dan kualitas kerja terlebih dahulu'
                ], 422);
            }

            DB::beginTransaction();

            // Dapatkan id_user dari peserta
            $idUser = $peserta->id_user;
            
            // Hitung nilai kehadiran
            $kehadiran = $this->hitungKehadiran($idUser);
            
            // Hitung nilai tugas berdasarkan ketepatan waktu
            $nilaiTugas = $this->hitungNilaiTugas($idUser);
            
            // Hitung nilai kuis
            $nilaiKuis = $this->hitungNilaiKuis($idUser);
            
            $bobotKehadiran = 20;
            $bobotTugas = 25;
            $bobotKuis = 15;
            $bobotManual = 40;
            
            $manualValues = [
                $nilai->sikap ?? 0,
                $nilai->kualitas_kerja ?? 0,
                $nilai->komunikasi ?? 0,
                $nilai->kreativitas ?? 0,
                $nilai->kerjasama ?? 0,
                $nilai->inisiatif ?? 0
            ];
            $nilaiManual = round(array_sum($manualValues) / 6, 2);
            
            $nilaiAkhir = round(
                ($kehadiran * $bobotKehadiran / 100) +
                ($nilaiTugas * $bobotTugas / 100) +
                ($nilaiKuis * $bobotKuis / 100) +
                ($nilaiManual * $bobotManual / 100),
                2
            );
            
            // UPDATE menggunakan model (lebih reliable)
            $updateData = [
                'nilai_kehadiran' => $kehadiran,
                'nilai_tugas' => $nilaiTugas,
                'nilai_kuis' => $nilaiKuis,
                'nilai_akhir' => $nilaiAkhir,
                'status' => 'final',
                'finalized_at' => now(),
                'updated_at' => now()
            ];
            
            // Update menggunakan model
            $updated = NilaiPeserta::where('id_peserta', $id)->update($updateData);
            
            Log::info('Finalizing peserta ID: ' . $id);
            Log::info('Update data: ', $updateData);
            Log::info('Update result (rows affected): ' . ($updated ? $updated : 0));
            
            if ($updated === 0) {
                // Coba insert jika update gagal
                NilaiPeserta::updateOrCreate(
                    ['id_peserta' => $id],
                    $updateData
                );
                Log::info('Fallback: Created new record for peserta ID: ' . $id);
            }

            DB::commit();

            // Ambil data terbaru setelah update
            $updatedNilai = NilaiPeserta::where('id_peserta', $id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Nilai berhasil difinalisasi',
                'data' => [
                    'id_peserta' => $id,
                    'nilai_kehadiran' => $kehadiran,
                    'nilai_tugas' => $nilaiTugas,
                    'nilai_kuis' => $nilaiKuis,
                    'nilai_akhir' => $nilaiAkhir,
                    'grade' => $this->getGrade($nilaiAkhir),
                    'status' => $updatedNilai ? $updatedNilai->status : 'final'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Nilai Finalize Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Gagal finalisasi nilai: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hitung kehadiran peserta (persentase) berdasarkan id_user
     */
    private function hitungKehadiran($idUser)
    {
        try {
            // Hitung total hari dalam periode magang (misal: 30 hari)
            // Atau hitung dari tanggal pertama presensi sampai sekarang
            $firstPresensi = Presensi::where('id_user', $idUser)
                ->orderBy('tanggal', 'asc')
                ->first();
                
            if (!$firstPresensi) {
                return 0;
            }
            
            $startDate = Carbon::parse($firstPresensi->tanggal);
            $endDate = Carbon::now();
            $totalHari = $startDate->diffInWeekdays($endDate) + 1; // +1 untuk include start date
            
            $hadir = Presensi::where('id_user', $idUser)
                ->where('status_kehadiran', 'hadir')
                ->count();
            
            return $totalHari > 0 ? round(($hadir / $totalHari) * 100, 2) : 0;
        } catch (\Exception $e) {
            Log::warning('Hitung kehadiran error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Hitung nilai tugas berdasarkan ketepatan waktu pengumpulan
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
     * Hitung nilai kuis peserta (rata-rata dari jawaban kuis) berdasarkan id_user
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
                    'Grade' => $nilai ? $this->getGrade($nilai->nilai_akhir) : '-',
                    'Status' => $nilai && $nilai->status === 'final' ? 'Sudah Final' : 'Belum Final',
                    'Catatan Mentor' => $nilai ? $nilai->catatan_mentor : '-',
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $exportData,
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