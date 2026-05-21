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

                // Ambil id_user peserta untuk menghitung presensi, tugas, dan kuis
                $idUser = $peserta->id_user;

                // Hitung otomatis dari tabel presensi, pengumpulan tugas, dan jawaban kuis
                $nilaiKehadiran = $this->hitungKehadiran($peserta->id_peserta);
                $nilaiTugas = $this->hitungNilaiTugas($peserta->id_peserta);
                $nilaiKuis = $this->hitungNilaiKuis($idUser);

                // Hitung nilai manual dari input mentor
                $nilaiManual = null;
                if ($nilai) {
                    $manualValues = [
                        $nilai->sikap,
                        $nilai->kualitas_kerja,
                        $nilai->komunikasi,
                        $nilai->kreativitas,
                        $nilai->kerjasama,
                        $nilai->inisiatif,
                    ];

                    $manualValues = array_filter($manualValues, function ($value) {
                        return $value !== null;
                    });

                    if (count($manualValues) > 0) {
                        $nilaiManual = round(array_sum($manualValues) / count($manualValues), 2);
                    }
                }

                // Kalau belum final, tampilkan preview nilai akhir otomatis
                $previewNilaiAkhir = null;
                if ($nilaiManual !== null) {
                    $previewNilaiAkhir = round(
                        ($nilaiKehadiran * 0.20) +
                            ($nilaiTugas * 0.25) +
                            ($nilaiKuis * 0.15) +
                            ($nilaiManual * 0.40),
                        2
                    );
                }

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

                    // Nilai otomatis
                    'nilai_kehadiran' => $nilaiKehadiran,
                    'nilai_tugas' => $nilaiTugas,
                    'nilai_kuis' => $nilaiKuis,
                    'nilai_manual' => $nilaiManual,

                    // Kalau sudah final pakai nilai dari database, kalau belum final pakai preview
                    'nilai_akhir' => $nilai && $nilai->status === 'final'
                        ? $nilai->nilai_akhir
                        : $previewNilaiAkhir,

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
     * Get nilai akhir untuk peserta yang sedang login
     * GET /api/peserta/nilai-akhir
     */
    public function getNilaiAkhirPeserta(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'peserta') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $peserta = Peserta::with(['user', 'divisi', 'mentor.user'])
                ->where('id_user', $user->id_user)
                ->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan'
                ], 404);
            }

            $nilai = NilaiPeserta::where('id_peserta', $peserta->id_peserta)
                ->where('status', 'final')
                ->first();

            if (!$nilai) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nilai akhir belum difinalisasi oleh mentor'
                ], 404);
            }

            $nilaiAkhir = (float) $nilai->nilai_akhir;

            if ($nilaiAkhir >= 85) {
                $grade = 'A';
                $predikat = 'Sangat Baik';
                $statusKelulusan = 'lulus';
            } elseif ($nilaiAkhir >= 75) {
                $grade = 'B';
                $predikat = 'Baik';
                $statusKelulusan = 'lulus';
            } elseif ($nilaiAkhir >= 65) {
                $grade = 'C';
                $predikat = 'Cukup';
                $statusKelulusan = 'lulus';
            } elseif ($nilaiAkhir >= 50) {
                $grade = 'D';
                $predikat = 'Kurang';
                $statusKelulusan = 'tidak_lulus';
            } else {
                $grade = 'E';
                $predikat = 'Sangat Kurang';
                $statusKelulusan = 'tidak_lulus';
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $nilaiAkhir,
                    'grade' => $grade,
                    'predikat' => $predikat,
                    'status' => $statusKelulusan,
                    'certificate_available' => $statusKelulusan === 'lulus',

                    'participant_name' => $peserta->user->nama ?? '-',
                    'participant_nim' => $peserta->nim ?? $peserta->npm ?? '-',
                    'participant_program' => $peserta->prodi ?? '-',
                    'institution' => $peserta->asal_kampus ?? '-',

                    'start_date' => $peserta->tanggal_mulai,
                    'end_date' => $peserta->tanggal_selesai,

                    'mentor_name' => $peserta->mentor->user->nama ?? '-',
                    'ceo_name' => 'Kepala Dinas Komunikasi Informatika dan Statistik Kab. Ponorogo',
                    'certificate_number' => 'MAGANG/' . date('Y') . '/' . str_pad($peserta->id_peserta, 3, '0', STR_PAD_LEFT),

                    'components' => [
                        [
                            'name' => 'Kehadiran',
                            'nilai' => (float) $nilai->nilai_kehadiran,
                            'bobot' => 20,
                            'kontribusi' => round(((float) $nilai->nilai_kehadiran * 0.20), 2),
                            'keterangan' => 'Nilai kehadiran selama program magang'
                        ],
                        [
                            'name' => 'Pengumpulan Tugas',
                            'nilai' => (float) $nilai->nilai_tugas,
                            'bobot' => 25,
                            'kontribusi' => round(((float) $nilai->nilai_tugas * 0.25), 2),
                            'keterangan' => 'Nilai penyelesaian dan pengumpulan tugas'
                        ],
                        [
                            'name' => 'Kuis Kompetensi',
                            'nilai' => (float) $nilai->nilai_kuis,
                            'bobot' => 15,
                            'kontribusi' => round(((float) $nilai->nilai_kuis * 0.15), 2),
                            'keterangan' => 'Rata-rata nilai kuis kompetensi'
                        ],
                        [
                            'name' => 'Nilai Manual',
                            'nilai' => (float) $nilai->nilai_mentor,
                            'bobot' => 40,
                            'kontribusi' => round(((float) $nilai->nilai_mentor * 0.40), 2),
                            'keterangan' => 'Nilai sikap, kualitas kerja, komunikasi, kreativitas, kerja sama, dan inisiatif'
                        ],
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Get Nilai Akhir Peserta Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil nilai akhir: ' . $e->getMessage()
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
            Log::info('=== STORE NILAI START ===');
            Log::info('Request data:', $request->all());

            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan'
                ], 401);
            }

            if ($user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - role: ' . $user->role
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

            // Cek apakah peserta adalah bimbingan mentor ini
            $peserta = Peserta::where('id_peserta', $request->id_peserta)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan atau bukan bimbingan Anda'
                ], 404);
            }

            // Cari atau buat data nilai
            $nilai = NilaiPeserta::where('id_peserta', $request->id_peserta)->first();

            if (!$nilai) {
                $nilai = new NilaiPeserta();
                $nilai->id_peserta = $request->id_peserta;
                Log::info('Creating new nilai record for peserta: ' . $request->id_peserta);
            } else {
                Log::info('Updating existing nilai record for peserta: ' . $request->id_peserta);
            }

            // Update nilai
            if ($request->has('sikap')) $nilai->sikap = $request->sikap;
            if ($request->has('kualitas_kerja')) $nilai->kualitas_kerja = $request->kualitas_kerja;
            if ($request->has('komunikasi')) $nilai->komunikasi = $request->komunikasi;
            if ($request->has('kreativitas')) $nilai->kreativitas = $request->kreativitas;
            if ($request->has('kerjasama')) $nilai->kerjasama = $request->kerjasama;
            if ($request->has('inisiatif')) $nilai->inisiatif = $request->inisiatif;
            if ($request->has('catatan')) $nilai->catatan_mentor = $request->catatan;

            $nilai->dinilai_oleh = $user->nama ?? $user->name;
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
                    'nama' => $peserta->user->nama ?? 'Unknown',
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

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan nilai: ' . $e->getMessage(),
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

            if (!$user || $user->role !== 'mentor') {
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

            $peserta = Peserta::where('id_peserta', $id)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$peserta) {
                return response()->json([
                    'success' => false,
                    'message' => 'Peserta tidak ditemukan atau bukan bimbingan Anda'
                ], 404);
            }

            $nilai = NilaiPeserta::where('id_peserta', $id)->first();

            if (!$nilai) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data nilai tidak ditemukan, input nilai terlebih dahulu'
                ], 404);
            }

            if ($nilai->sikap === null || $nilai->kualitas_kerja === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lengkapi nilai sikap dan kualitas kerja terlebih dahulu'
                ], 422);
            }

            $idUser = $peserta->id_user;

            $kehadiran = $this->hitungKehadiran($peserta->id_peserta);
            $nilaiTugas = $this->hitungNilaiTugas($peserta->id_peserta);
            $nilaiKuis = $this->hitungNilaiKuis($idUser);

            $manualValues = [
                $nilai->sikap,
                $nilai->kualitas_kerja,
                $nilai->komunikasi,
                $nilai->kreativitas,
                $nilai->kerjasama,
                $nilai->inisiatif,
            ];

            $manualValues = array_filter($manualValues, function ($value) {
                return $value !== null;
            });

            if (count($manualValues) === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nilai manual belum lengkap'
                ], 422);
            }

            $nilaiManual = round(array_sum($manualValues) / count($manualValues), 2);

            $nilaiAkhir = round(
                ($kehadiran * 0.20) +
                    ($nilaiTugas * 0.25) +
                    ($nilaiKuis * 0.15) +
                    ($nilaiManual * 0.40),
                2
            );

            if ($nilaiAkhir >= 85) {
                $grade = 'A';
            } elseif ($nilaiAkhir >= 75) {
                $grade = 'B';
            } elseif ($nilaiAkhir >= 65) {
                $grade = 'C';
            } elseif ($nilaiAkhir >= 50) {
                $grade = 'D';
            } else {
                $grade = 'E';
            }

            $nilai->nilai_kehadiran = $kehadiran;
            $nilai->nilai_tugas = $nilaiTugas;
            $nilai->nilai_kuis = $nilaiKuis;
            $nilai->nilai_mentor = $nilaiManual;
            $nilai->nilai_akhir = $nilaiAkhir;
            $nilai->status = 'final';
            $nilai->finalized_at = now();
            $nilai->save();

            return response()->json([
                'success' => true,
                'message' => 'Nilai berhasil difinalisasi',
                'data' => [
                    'id_peserta' => $id,
                    'nilai_kehadiran' => $kehadiran,
                    'nilai_tugas' => $nilaiTugas,
                    'nilai_kuis' => $nilaiKuis,
                    'nilai_manual' => $nilaiManual,
                    'nilai_mentor' => $nilaiManual,
                    'nilai_akhir' => $nilaiAkhir,
                    'grade' => $grade,
                    'status' => $nilai->status
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('Nilai Finalize Error: ' . $e->getMessage());
            Log::error('Nilai Finalize Line: ' . $e->getLine());
            Log::error('Nilai Finalize File: ' . $e->getFile());

            return response()->json([
                'success' => false,
                'message' => 'Gagal finalisasi nilai: ' . $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    /**
     * Hitung kehadiran peserta (persentase)
     */
    private function hitungKehadiran($idPeserta)
    {
        try {
            $presensi = Presensi::where('id_peserta', $idPeserta)->get();

            if ($presensi->isEmpty()) {
                return 0;
            }

            $totalNilai = 0;
            $count = 0;

            foreach ($presensi as $item) {
                $status = strtolower(trim($item->status_kehadiran ?? ''));

                if ($status === 'hadir') {
                    $totalNilai += 100;
                } elseif ($status === 'terlambat') {
                    $totalNilai += 50;
                } elseif (
                    $status === 'tidak hadir' ||
                    $status === 'tidak_hadir' ||
                    $status === 'alpha' ||
                    $status === 'izin' ||
                    $status === 'sakit'
                ) {
                    $totalNilai += 0;
                } else {
                    $totalNilai += 0;
                }

                $count++;
            }

            return $count > 0 ? round($totalNilai / $count, 2) : 0;
        } catch (\Exception $e) {
            Log::warning('Hitung kehadiran error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Hitung nilai tugas
     */
    private function hitungNilaiTugas($idPeserta)
    {
        try {
            $pengumpulan = PengumpulanTugas::where('id_peserta', $idPeserta)->get();

            if ($pengumpulan->isEmpty()) {
                return 0;
            }

            $totalNilai = 0;
            $count = 0;

            foreach ($pengumpulan as $item) {
                if ($item->nilai !== null) {
                    $totalNilai += (int) $item->nilai;
                } elseif ($item->status === 'selesai') {
                    $totalNilai += 100;
                } elseif ($item->status === 'terlambat') {
                    $totalNilai += 50;
                } else {
                    $totalNilai += 0;
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
                    'Nilai Manual' => $nilai ? $nilai->nilai_mentor : '-',
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
