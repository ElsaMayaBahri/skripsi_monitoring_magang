<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mentor;
use App\Models\Presensi;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DailyReportController extends Controller
{
    /**
     * Get all daily reports for mentor's participants on a specific date
     * GET /api/daily-report?tanggal=YYYY-MM-DD&search=keyword
     */
    public function getReports(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'search' => 'nullable|string'
        ]);

        $user = Auth::user();
        
        // Check if user is mentor
        if ($user->role !== 'mentor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Anda bukan mentor.'
            ], 403);
        }

        // Get mentor data
        $mentor = Mentor::where('id_user', $user->id_user)->first();
        
        if (!$mentor) {
            return response()->json([
                'success' => false,
                'message' => 'Data mentor tidak ditemukan'
            ], 404);
        }

        $tanggal = Carbon::parse($request->tanggal)->format('Y-m-d');
        $search = $request->search;

        // Query peserta under this mentor ONLY
        $query = DB::table('pesertas')
            ->leftJoin('users', 'pesertas.id_user', '=', 'users.id_user')
            ->leftJoin('divisis', 'pesertas.id_divisi', '=', 'divisis.id_divisi')
            ->where('pesertas.id_mentor', $mentor->id_mentor)
            ->select(
                'pesertas.id_peserta',
                'users.nama as peserta_nama',
                'divisis.nama_divisi as peserta_divisi'
            );

        // Apply search if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('users.nama', 'like', "%{$search}%")
                  ->orWhere('divisis.nama_divisi', 'like', "%{$search}%");
            });
        }

        $pesertas = $query->get();
        $reports = [];

        foreach ($pesertas as $peserta) {
            // Get attendance data for this date
            $presensi = DB::table('presensis')
                ->where('id_peserta', $peserta->id_peserta)
                ->whereDate('tanggal', $tanggal)
                ->first();

            $aktivitas = null;
            $kendala = null;

            // Safe JSON parse for daily_report
            if ($presensi && $presensi->daily_report) {
                $decoded = json_decode($presensi->daily_report, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $aktivitas = $decoded['aktivitas'] ?? null;
                    $kendala = $decoded['kendala'] ?? null;
                } else {
                    $aktivitas = $presensi->daily_report;
                }
            }

            $reports[] = [
                'id' => $peserta->id_peserta,
                'peserta_id' => $peserta->id_peserta,
                'peserta_nama' => $peserta->peserta_nama ?? 'Unknown',
                'peserta_divisi' => $peserta->peserta_divisi ?? '-',
                'check_in' => $presensi->check_in ?? null,
                'check_out' => $presensi->check_out ?? null,
                'status_kehadiran' => $presensi->status_kehadiran ?? 'alpha',
                'aktivitas' => $aktivitas,
                'kendala' => $kendala,
                'lokasi' => $presensi->lokasi ?? '-',
                'device' => $this->getDevice($presensi),
                'rank' => $this->calculateRank($peserta->id_peserta),
                'feedback' => $presensi->feedback_mentor ?? null
            ];
        }

        $sudahMengisi = collect($reports)->filter(function ($r) {
            return !empty($r['aktivitas']);
        })->count();

        $summary = [
            'total' => count($reports),
            'sudahMengisi' => $sudahMengisi,
            'belumMengisi' => count($reports) - $sudahMengisi,
            'persentase' => count($reports) > 0
                ? round(($sudahMengisi / count($reports)) * 100)
                : 0
        ];

        return response()->json([
            'success' => true,
            'data' => $reports,
            'summary' => $summary
        ]);
    }

    /**
     * Get detail of a single daily report
     * GET /api/daily-report/{peserta_id}?tanggal=YYYY-MM-DD
     */
    public function getReportDetail(Request $request, int $peserta_id)
    {
        $request->validate([
            'tanggal' => 'required|date'
        ]);

        $user = Auth::user();
        
        if ($user->role !== 'mentor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $tanggal = Carbon::parse($request->tanggal)->format('Y-m-d');

        // Get peserta data
        $peserta = DB::table('pesertas')
            ->leftJoin('users', 'pesertas.id_user', '=', 'users.id_user')
            ->leftJoin('divisis', 'pesertas.id_divisi', '=', 'divisis.id_divisi')
            ->where('pesertas.id_peserta', $peserta_id)
            ->select(
                'users.nama as nama',
                'divisis.nama_divisi as divisi'
            )
            ->first();

        if (!$peserta) {
            return response()->json([
                'success' => false,
                'message' => 'Peserta tidak ditemukan'
            ], 404);
        }

        // Get presensi data
        $presensi = DB::table('presensis')
            ->where('id_peserta', $peserta_id)
            ->whereDate('tanggal', $tanggal)
            ->first();

        $aktivitas = null;
        $kendala = null;

        if ($presensi && $presensi->daily_report) {
            $decoded = json_decode($presensi->daily_report, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $aktivitas = $decoded['aktivitas'] ?? null;
                $kendala = $decoded['kendala'] ?? null;
            } else {
                $aktivitas = $presensi->daily_report;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'nama' => $peserta->nama ?? 'Unknown',
                'divisi' => $peserta->divisi ?? '-',
                'rank' => $this->calculateRank($peserta_id),
                'check_in' => $presensi->check_in ?? null,
                'check_out' => $presensi->check_out ?? null,
                'status' => $presensi->status_kehadiran ?? 'alpha',
                'aktivitas' => $aktivitas,
                'kendala' => $kendala,
                'lokasi' => $presensi->lokasi ?? '-',
                'device' => $this->getDevice($presensi),
                'feedback' => $presensi->feedback_mentor ?? null
            ]
        ]);
    }

    /**
     * Submit feedback for a daily report
     * POST /api/daily-report/{peserta_id}/feedback
     */
    public function submitFeedback(Request $request, int $peserta_id)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'feedback' => 'required|string'
        ]);

        $user = Auth::user();
        
        if ($user->role !== 'mentor') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $tanggal = $request->tanggal;
        $feedback = $request->feedback;

        // Find existing presensi record
        $presensi = DB::table('presensis')
            ->where('id_peserta', $peserta_id)
            ->whereDate('tanggal', $tanggal)
            ->first();

        if ($presensi) {
            // Update existing record
            DB::table('presensis')
                ->where('id_presensi', $presensi->id_presensi)
                ->update([
                    'feedback_mentor' => $feedback,
                    'updated_at' => now()
                ]);
        } else {
            // Create new record if doesn't exist
            DB::table('presensis')->insert([
                'id_peserta' => $peserta_id,
                'tanggal' => $tanggal,
                'status_kehadiran' => 'alpha',
                'feedback_mentor' => $feedback,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Feedback berhasil disimpan'
        ]);
    }

    /**
     * Export daily report to Excel-ready JSON
     * GET /api/daily-report/export?tanggal=YYYY-MM-DD
     */
    public function exportExcel(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date'
        ]);

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

        $tanggal = Carbon::parse($request->tanggal)->format('Y-m-d');

        $pesertas = DB::table('pesertas')
            ->leftJoin('users', 'pesertas.id_user', '=', 'users.id_user')
            ->leftJoin('divisis', 'pesertas.id_divisi', '=', 'divisis.id_divisi')
            ->where('pesertas.id_mentor', $mentor->id_mentor)
            ->select(
                'pesertas.id_peserta',
                'users.nama as nama',
                'divisis.nama_divisi as divisi'
            )
            ->get();

        $data = [];

        foreach ($pesertas as $peserta) {
            $presensi = DB::table('presensis')
                ->where('id_peserta', $peserta->id_peserta)
                ->whereDate('tanggal', $tanggal)
                ->first();

            $data[] = [
                'Nama Peserta' => $peserta->nama ?? 'Unknown',
                'Divisi' => $peserta->divisi ?? '-',
                'Check In' => $presensi->check_in ?? '-',
                'Check Out' => $presensi->check_out ?? '-',
                'Status Kehadiran' => $presensi->status_kehadiran ?? 'alpha',
                'Lokasi' => $presensi->lokasi ?? '-',
                'Feedback Mentor' => $presensi->feedback_mentor ?? '-'
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'tanggal' => $tanggal
        ]);
    }

    /**
     * Calculate rank based on final score
     * 
     * @param int $pesertaId
     * @return string
     */
    private function calculateRank(int $pesertaId): string
    {
        $nilai = DB::table('nilai_pesertas')
            ->where('id_peserta', $pesertaId)
            ->value('nilai_akhir') ?? 0;

        if ($nilai >= 85) return 'diamond';
        if ($nilai >= 70) return 'gold';
        return 'silver';
    }

    /**
     * Get device type from foto_checkin
     * 
     * @param object|null $presensi
     * @return string
     */
    private function getDevice($presensi): string
    {
        if (!$presensi || !$presensi->foto_checkin) {
            return '-';
        }
        return 'Web';
    }
}