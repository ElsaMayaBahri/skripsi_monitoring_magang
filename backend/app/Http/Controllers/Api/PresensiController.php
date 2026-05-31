<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presensi;
use App\Models\JamKerja;
use App\Models\Peserta;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

class PresensiController extends Controller
{
    // ==================== HELPER ====================

    /**
     * Hitung keterlambatan dalam menit.
     * $checkIn bertipe string "HH:MM:SS" (bukan datetime).
     */
    private function calculateLateness(?string $checkIn = null, ?string $jamMasuk = '08:00:00'): int
    {
        if (!$checkIn) {
            return 0;
        }

        $checkIn = substr($checkIn, 0, 5);
        $jamMasuk = substr($jamMasuk ?: '08:00:00', 0, 5);

        [$checkInHour, $checkInMinute] = array_map('intval', explode(':', $checkIn));
        [$jamMasukHour, $jamMasukMinute] = array_map('intval', explode(':', $jamMasuk));

        $checkInMinutes = ($checkInHour * 60) + $checkInMinute;
        $jamMasukMinutes = ($jamMasukHour * 60) + $jamMasukMinute;

        if ($checkInMinutes <= $jamMasukMinutes) {
            return 0;
        }

        return $checkInMinutes - $jamMasukMinutes;
    }

    private function getFotoCheckinUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $path = trim($path);

        // Jika sudah URL lengkap
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // Normalisasi jika data lama tersimpan sebagai /storage/...
        $path = ltrim($path, '/');

        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        if (str_starts_with($path, 'public/')) {
            $path = substr($path, strlen('public/'));
        }

        return url('/storage/' . $path);
    }

    private function parseBatasTerlambat($value): int
    {
        if ($value === null || $value === '') {
            return 15;
        }

        // Jika isinya angka biasa, contoh: 30
        if (is_numeric($value)) {
            return (int) $value;
        }

        // Jika isinya format waktu, contoh: 00:30:00
        if (is_string($value) && str_contains($value, ':')) {
            $parts = explode(':', $value);

            $jam = (int) ($parts[0] ?? 0);
            $menit = (int) ($parts[1] ?? 0);

            return ($jam * 60) + $menit;
        }

        return 15;
    }

    /**
     * Tentukan status kehadiran berdasarkan status database, jenis kehadiran, dan keterlambatan.
     */
    private function resolveStatus(
        ?string $statusDatabase,
        string $jenisKehadiran,
        int $keterlambatan,
        int $batasTerlambat = 15
    ): string
    {
        // Prioritas ambil dari database
        if (!empty($statusDatabase)) {
            return match(strtolower($statusDatabase)) {
                'hadir' => 'Hadir',
                'terlambat' => 'Terlambat',
                'izin' => 'Izin',
                'sakit' => 'Sakit',
                'alpha', 'tidak_hadir', 'tidak hadir' => 'Tidak Hadir',
                default => ucfirst($statusDatabase)
            };
        }

        // Fallback otomatis
        if ($jenisKehadiran === 'izin') {
            return 'Izin';
        }

        if ($jenisKehadiran === 'sakit') {
            return 'Sakit';
        }

        return $keterlambatan > $batasTerlambat
            ? 'Terlambat'
            : 'Hadir';
    }

    /**
     * Format satu record presensi untuk response.
     */
    private function formatRecord(Presensi $item): array
    {
        $peserta = $item->peserta;
        $user    = $peserta?->user;

        $jamKerja   = JamKerja::first();
        $jamMasuk   = $jamKerja?->jam_masuk ?? '08:00:00';
        $batasMenit = $this->parseBatasTerlambat($jamKerja?->batas_terlambat ?? 15);

        $keterlambatan = $this->calculateLateness($item->check_in, $jamMasuk);

        $status = $this->resolveStatus(
            $item->status_kehadiran,
            $item->jenis_kehadiran ?? 'wfo',
            $keterlambatan,
            $batasMenit
        );

        return [
            'id'           => $item->id_presensi,
            'peserta'      => [
                'id'   => $peserta?->id_peserta,
                'nama' => $user?->nama ?? $peserta?->nama ?? '-',
                'divisi' => [
                    'id_divisi'   => $peserta?->divisi?->id_divisi,
                    'nama_divisi' => $peserta?->divisi?->nama_divisi ?? '-',
                ],
            ],
            'nama'             => $user?->nama ?? $peserta?->nama ?? '-',
            'divisi'           => [
                'id_divisi'   => $peserta?->divisi?->id_divisi,
                'nama_divisi' => $peserta?->divisi?->nama_divisi ?? '-',
            ],
            'tanggal'          => $item->tanggal instanceof \Illuminate\Support\Carbon
                ? $item->tanggal->format('Y-m-d')
                : $item->tanggal,
            'check_in'         => $item->check_in,
            'check_out'        => $item->check_out,
            'status'           => $status,
            'jenis_kehadiran'  => $item->jenis_kehadiran ?? 'wfo',
            'keterlambatan'    => $keterlambatan,
            'lokasi'           => $item->lokasi,
            'lokasi_koordinat' => $item->lokasi_koordinat,
            'daily_report'     => $item->daily_report,
            'foto_checkin' => $this->getFotoCheckinUrl($item->foto_checkin),
        ];
    }

    // ==================== ADMIN / COO ====================

    /**
     * Daftar semua presensi (untuk admin/COO).
     */
    public function index(Request $request)
    {
        try {
            $query = Presensi::with([
                'peserta.user',
                'peserta.divisi'
            ]);

            // ========== PERBAIKAN: Tambahkan filter single date ==========
            if ($request->filled('tanggal')) {
                $query->whereDate('tanggal', $request->tanggal);
            }
            // ============================================================

            if ($request->filled('start_date')) {
                $query->whereDate('tanggal', '>=', $request->start_date);
            }
            if ($request->filled('end_date')) {
                $query->whereDate('tanggal', '<=', $request->end_date);
            }
            if ($request->filled('divisi') && $request->divisi !== 'all') {
                $query->whereHas('peserta.divisi', function ($q) use ($request) {
                    $q->where('nama_divisi', $request->divisi);
                });
            }

            $data = $query->orderBy('tanggal', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($item) => $this->formatRecord($item));

            return response()->json([
                'success' => true,
                'data'    => $data,
                'message' => 'Data presensi berhasil diambil',
            ]);
        } catch (\Exception $e) {
            Log::error('PresensiController@index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data presensi: ' . $e->getMessage(),
                'data'    => [],
            ], 500);
        }
    }

    /**
     * Detail satu record presensi.
     */
    public function show($id)
    {
        try {
            $item = Presensi::with([
                'peserta.user',
                'peserta.divisi'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data'    => $this->formatRecord($item),
            ]);
        } catch (\Exception $e) {
            Log::error('PresensiController@show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Data presensi tidak ditemukan',
            ], 404);
        }
    }

    /**
     * Statistik ringkas presensi.
     */
    public function getStats(Request $request)
    {
        try {
            $query = Presensi::query();

            // ========== PERBAIKAN: Tambahkan filter single date ==========
            if ($request->filled('tanggal')) {
                $query->whereDate('tanggal', $request->tanggal);
            }
            // ============================================================

            if ($request->filled('start_date')) {
                $query->whereDate('tanggal', '>=', $request->start_date);
            }
            if ($request->filled('end_date')) {
                $query->whereDate('tanggal', '<=', $request->end_date);
            }

            $total      = $query->count();
            $hadir      = (clone $query)->where('status_kehadiran', 'Hadir')->count();
            $terlambat  = (clone $query)->where('status_kehadiran', 'Terlambat')->count();
            $izin       = (clone $query)->where('status_kehadiran', 'Izin')->count();
            $sakit      = (clone $query)->where('status_kehadiran', 'Sakit')->count();
            $tidakHadir = (clone $query)->where('status_kehadiran', 'Tidak Hadir')->count();

            $persenKehadiran = $total > 0
                ? round((($hadir + $terlambat) / $total) * 100)
                : 0;

            return response()->json([
                'success' => true,
                'data'    => compact('total', 'hadir', 'terlambat', 'izin', 'sakit', 'tidakHadir', 'persenKehadiran'),
            ]);
        } catch (\Exception $e) {
            Log::error('PresensiController@getStats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik presensi',
            ], 500);
        }
    }

    /**
     * Export data presensi.
     */
    public function export(Request $request)
    {
        try {
            $query = Presensi::with([
                'peserta.user',
                'peserta.divisi'
            ]);

            // ========== PERBAIKAN: Tambahkan filter single date ==========
            if ($request->filled('tanggal')) {
                $query->whereDate('tanggal', $request->tanggal);
            }
            // ============================================================

            if ($request->filled('start_date')) {
                $query->whereDate('tanggal', '>=', $request->start_date);
            }
            if ($request->filled('end_date')) {
                $query->whereDate('tanggal', '<=', $request->end_date);
            }

            $data = $query->orderBy('tanggal', 'desc')
                ->get()
                ->map(function ($item, $idx) {
                    $peserta       = $item->peserta;
                    $user          = $peserta?->user;
                    $keterlambatan = $this->calculateLateness($item->check_in);

                    return [
                        'No'              => $idx + 1,
                        'Nama Peserta'    => $user?->nama ?? $peserta?->nama ?? '-',
                        'Divisi'          => $peserta?->divisi?->nama_divisi ?? '-',
                        'Tanggal'         => $item->tanggal,
                        'Jenis Kehadiran' => strtoupper($item->jenis_kehadiran ?? 'wfo'),
                        'Check-In'        => $item->check_in ?? '-',
                        'Check-Out'       => $item->check_out ?? '-',
                        'Status'          => $item->status_kehadiran,
                        'Keterlambatan'   => $keterlambatan . ' menit',
                        'Daily Report'    => $item->daily_report ?? '-',
                        'Lokasi'          => $item->lokasi ?? '-',
                    ];
                });

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            Log::error('PresensiController@export: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal export data presensi',
            ], 500);
        }
    }

    /**
     * Daftar peserta yang belum absen hari ini - FIXED VERSION
     */
    public function belumAbsen(Request $request)
    {
        try {
            $today = now('Asia/Jakarta')->toDateString();

            // Ambil id_peserta yang SUDAH presensi hari ini
            $sudahAbsen = Presensi::whereDate('tanggal', $today)
                ->pluck('id_peserta')
                ->toArray();

            // Query untuk peserta yang BELUM absen
            // Gunakan relasi user dan divisi untuk mendapatkan nama
            $belumAbsen = Peserta::with(['user', 'divisi'])
                ->whereNotIn('id_peserta', $sudahAbsen)
                ->get()
                ->map(function ($peserta) {
                    return [
                        'id_peserta' => $peserta->id_peserta,
                        'nama' => $peserta->user?->nama ?? $peserta->user?->name ?? '-',
                        'divisi' => $peserta->divisi?->nama_divisi ?? $peserta->divisi ?? '-',
                        'email' => $peserta->user?->email ?? '-',
                        'foto_profil' => $peserta->user?->foto_profil ?? null,
                    ];
                });

            // Statistik
            $totalPeserta = Peserta::count();
            $totalSudahAbsen = count($sudahAbsen);
            $totalBelumAbsen = $belumAbsen->count();

            return response()->json([
                'success' => true,
                'data' => $belumAbsen,
                'stats' => [
                    'total_peserta' => $totalPeserta,
                    'total_sudah_absen' => $totalSudahAbsen,
                    'total_belum_absen' => $totalBelumAbsen,
                    'persentase_kehadiran' => $totalPeserta > 0 
                        ? round(($totalSudahAbsen / $totalPeserta) * 100) 
                        : 0,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('PresensiController@belumAbsen: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peserta yang belum absen: ' . $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    // ==================== PESERTA ====================

    /**
     * Riwayat presensi untuk peserta yang sedang login.
     */
    public function getByPeserta(Request $request)
    {
        try {
            $pesertaId = $this->getPesertaId($request);

            if (!$pesertaId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan',
                ], 404);
            }

            $jamKerja   = JamKerja::first();
            $jamMasuk   = $jamKerja?->jam_masuk ?? '08:00:00';
            $batasMenit = $this->parseBatasTerlambat($jamKerja?->batas_terlambat ?? 15);

            $data = Presensi::where('id_peserta', $pesertaId)
                ->orderBy('tanggal', 'desc')
                ->get()
                ->map(function ($item) use ($jamMasuk, $batasMenit) {
                    $keterlambatan = $this->calculateLateness($item->check_in, $jamMasuk);

                    $status = $this->resolveStatus(
                        $item->status_kehadiran,
                        $item->jenis_kehadiran ?? 'wfo',
                        $keterlambatan,
                        $batasMenit
                    );

                    return [
                        'id'               => $item->id_presensi,
                        'tanggal'          => $item->tanggal instanceof \Illuminate\Support\Carbon
                            ? $item->tanggal->format('Y-m-d')
                            : $item->tanggal,
                        'check_in'         => $item->check_in,
                        'check_out'        => $item->check_out,
                        'status_kehadiran' => $status,
                        'status_database'  => $item->status_kehadiran,
                        'jenis_kehadiran'  => $item->jenis_kehadiran ?? 'wfo',
                        'keterlambatan'    => $keterlambatan,
                        'batas_terlambat'  => $batasMenit,
                        'jam_masuk'        => $jamMasuk,
                        'is_late'          => $keterlambatan > $batasMenit,
                        'daily_report'     => $item->daily_report,
                        'lokasi'           => $item->lokasi,
                        'foto_checkin'     => $this->getFotoCheckinUrl($item->foto_checkin),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('PresensiController@getByPeserta: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Status presensi hari ini untuk peserta yang sedang login.
     */
    public function getTodayPresensi(Request $request)
    {
        try {
            $pesertaId = $this->getPesertaId($request);

            if (!$pesertaId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan',
                ], 404);
            }

            $today = now('Asia/Jakarta')->toDateString();
            $presensi = Presensi::where('id_peserta', $pesertaId)
                ->whereDate('tanggal', $today)
                ->first();

            if (!$presensi) {
                return response()->json(['success' => true, 'data' => null]);
            }

            return response()->json([
                'success' => true,
                'data'    => [
                    'id'               => $presensi->id_presensi,
                    'tanggal'          => $presensi->tanggal instanceof \Illuminate\Support\Carbon
                        ? $presensi->tanggal->format('Y-m-d')
                        : $presensi->tanggal,
                    'check_in'         => $presensi->check_in,
                    'check_out'        => $presensi->check_out,
                    'foto_checkin' => $this->getFotoCheckinUrl($presensi->foto_checkin),
                    'lokasi'           => $presensi->lokasi,
                    'status_kehadiran' => $presensi->status_kehadiran,
                    'jenis_kehadiran'  => $presensi->jenis_kehadiran ?? 'wfo',
                    'daily_report'     => $presensi->daily_report,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('PresensiController@getTodayPresensi: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Check-in peserta.
     *
     * Body (multipart/form-data):
     *   - foto            : file gambar (wajib)
     *   - lokasi          : string alamat (wajib)
     *   - lokasi_koordinat: "lat,lng" (opsional)
     *   - jenis_kehadiran : wfo|wfh|izin|sakit (default: wfo)
     *   - alasan_izin     : string (wajib jika jenis_kehadiran=izin)
     */
    public function checkIn(Request $request)
    {
        try {
            $pesertaId = $this->getPesertaId($request);

            if (!$pesertaId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan',
                ], 404);
            }

            // Cegah double check-in
            $today = now('Asia/Jakarta')->toDateString();
            $existing = Presensi::where('id_peserta', $pesertaId)
                ->whereDate('tanggal', $today)
                ->first();

            if ($existing && $existing->check_in) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan check-in hari ini',
                ], 400);
            }

            // Validasi input
            $request->validate([
                'foto'             => 'required|image|max:5120', // maks 5 MB
                'lokasi'           => 'required|string|max:500',
                'jenis_kehadiran'  => 'nullable|in:wfo,wfh,izin,sakit',
                'alasan_izin'      => 'nullable|string|max:1000',
                'lokasi_koordinat' => 'nullable|string|max:100',
            ]);

            $jenisKehadiran = $request->input('jenis_kehadiran', 'wfo');
            $alasanIzin     = $request->input('alasan_izin');

            // Validasi alasan izin
            if ($jenisKehadiran === 'izin' && empty(trim($alasanIzin ?? ''))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alasan izin wajib diisi',
                ], 422);
            }

            // Hitung waktu & keterlambatan
            // PENTING: simpan hanya jam (H:i:s), bukan datetime lengkap
            $checkInTime = now('Asia/Jakarta')->format('H:i:s');

            // Ambil jam kerja dari DB (jika ada), fallback ke default
            $jamKerja   = JamKerja::first();
            $jamMasuk   = $jamKerja?->jam_masuk ?? '08:00:00';
            $batasMenit = $this->parseBatasTerlambat($jamKerja?->batas_terlambat ?? 15);

            $keterlambatan   = $this->calculateLateness($checkInTime, $jamMasuk);
            $statusKehadiran = $this->resolveStatus(null, $jenisKehadiran, $keterlambatan, $batasMenit);

            // Upload foto
            $fotoPath = null;
            if ($request->hasFile('foto') && $request->file('foto')->isValid()) {
                $file     = $request->file('foto');
                $filename = 'presensi_' . $pesertaId . '_' . $today . '_' . time()
                    . '.' . $file->getClientOriginalExtension();

                // Simpan ke storage/app/public/presensi/foto/
                $fotoPath = $file->storeAs('presensi/foto', $filename, 'public');
            }

            // Simpan ke database
            $presensi = Presensi::create([
                'id_peserta'       => $pesertaId,
                'tanggal'          => $today,
                'check_in'         => $checkInTime,   // string "HH:MM:SS"
                'foto_checkin'     => $fotoPath,
                'lokasi'           => $request->input('lokasi'),
                'lokasi_koordinat' => $request->input('lokasi_koordinat'),
                'status_kehadiran' => $statusKehadiran,
                'jenis_kehadiran'  => $jenisKehadiran,
                'alasan_izin'      => $alasanIzin,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Check-in berhasil',
                'data'    => [
                    'id'               => $presensi->id_presensi,
                    'check_in'         => $presensi->check_in,
                    'status'           => $presensi->status_kehadiran,
                    'jenis_kehadiran'  => $presensi->jenis_kehadiran,
                    'keterlambatan'    => $keterlambatan,
                    'batas_terlambat'  => $batasMenit,
                    'jam_masuk'        => $jamMasuk,
                    'is_late'          => $keterlambatan > $batasMenit,
                    'foto_checkin'     => $this->getFotoCheckinUrl($fotoPath),
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('PresensiController@checkIn: ' . $e->getMessage() . ' | ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan check-in: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check-out peserta.
     *
     * Body (JSON atau form):
     *   - daily_report: string JSON berisi aktivitas, kendala, rencana
     */
    public function checkOut(Request $request)
    {
        try {
            $pesertaId = $this->getPesertaId($request);

            if (!$pesertaId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data peserta tidak ditemukan',
                ], 404);
            }

            $today = now('Asia/Jakarta')->toDateString();
            $presensi = Presensi::where('id_peserta', $pesertaId)
                ->whereDate('tanggal', $today)
                ->first();

            if (!$presensi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda belum melakukan check-in hari ini',
                ], 400);
            }

            if ($presensi->check_out) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan check-out hari ini',
                ], 400);
            }

            // Validasi daily report wajib ada isinya
            $dailyReport = $request->input('daily_report');
            if (!$dailyReport) {
                return response()->json([
                    'success' => false,
                    'message' => 'Daily report wajib diisi sebelum check-out',
                ], 422);
            }

            // Jika dikirim sebagai string JSON, parse dulu untuk validasi
            if (is_string($dailyReport)) {
                $parsed = json_decode($dailyReport, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    if (empty(trim($parsed['aktivitas'] ?? ''))) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Aktivitas hari ini wajib diisi',
                        ], 422);
                    }
                }
            }

            // Simpan check_out sebagai string "HH:MM:SS"
            $checkOutTime = now('Asia/Jakarta')->format('H:i:s');
            $presensi->check_out    = $checkOutTime;
            $presensi->daily_report = $dailyReport;
            $presensi->save();

            return response()->json([
                'success' => true,
                'message' => 'Check-out berhasil',
                'data'    => [
                    'id'        => $presensi->id_presensi,
                    'check_in'  => $presensi->check_in,
                    'check_out' => $presensi->check_out,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('PresensiController@checkOut: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan check-out: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getPesertaId(Request $request): ?int
    {
        $user = $request->user();

        if (!$user) {
            Log::warning('Presensi gagal: user belum login / token tidak valid');
            return null;
        }

        if (strtolower($user->role) !== 'peserta') {
            Log::warning('Presensi gagal: role bukan peserta', [
                'id_user' => $user->id_user ?? null,
                'role' => $user->role ?? null,
            ]);
            return null;
        }

        // Cara utama: ambil dari kolom users.id_peserta
        if (!empty($user->id_peserta)) {
            $peserta = Peserta::where('id_peserta', $user->id_peserta)->first();

            if ($peserta) {
                return (int) $peserta->id_peserta;
            }

            Log::warning('Presensi gagal: users.id_peserta ada, tetapi tidak ditemukan di tabel pesertas', [
                'id_user' => $user->id_user ?? null,
                'id_peserta' => $user->id_peserta,
            ]);
        }

        // Fallback jika tabel pesertas punya kolom id_user
        if (Schema::hasColumn('pesertas', 'id_user')) {
            $peserta = Peserta::where('id_user', $user->id_user)->first();

            if ($peserta) {
                return (int) $peserta->id_peserta;
            }
        }

        Log::warning('Presensi gagal: data peserta tidak ditemukan untuk user login', [
            'id_user' => $user->id_user ?? null,
            'email' => $user->email ?? null,
            'role' => $user->role ?? null,
            'id_peserta' => $user->id_peserta ?? null,
        ]);

        return null;
    }
}