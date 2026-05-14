<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->get('limit', 10);
        
        // Ambil dari database jika ada tabel activity_logs
        try {
            if (Schema::hasTable('activity_logs')) {
                $logs = DB::table('activity_logs')
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get();
                    
                if ($logs->count() > 0) {
                    return response()->json([
                        'success' => true,
                        'data' => $logs
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Table tidak ada, lanjut ke data dummy
        }
        
        // Data dummy sementara
        $activities = [
            ['id' => 1, 'user' => 'Admin', 'action' => 'Login ke sistem', 'time' => '5 menit lalu', 'type' => 'success', 'detail' => 'Berhasil login', 'created_at' => now()],
            ['id' => 2, 'user' => 'COO', 'action' => 'Membuka dashboard', 'time' => '10 menit lalu', 'type' => 'info', 'detail' => 'Melihat laporan presensi', 'created_at' => now()],
            ['id' => 3, 'user' => 'Mentor', 'action' => 'Menambah materi baru', 'time' => '30 menit lalu', 'type' => 'success', 'detail' => 'Materi ditambahkan', 'created_at' => now()],
            ['id' => 4, 'user' => 'Peserta', 'action' => 'Mengumpulkan tugas', 'time' => '2 jam lalu', 'type' => 'info', 'detail' => 'Tugas dikumpulkan', 'created_at' => now()],
            ['id' => 5, 'user' => 'Mentor', 'action' => 'Mengedit kuis', 'time' => '5 jam lalu', 'type' => 'warning', 'detail' => 'Kuis diperbarui', 'created_at' => now()],
            ['id' => 6, 'user' => 'Admin', 'action' => 'Menambah peserta baru', 'time' => '8 jam lalu', 'type' => 'success', 'detail' => 'Peserta ditambahkan', 'created_at' => now()],
            ['id' => 7, 'user' => 'COO', 'action' => 'Mengekspor laporan', 'time' => '12 jam lalu', 'type' => 'info', 'detail' => 'Laporan kehadiran diekspor', 'created_at' => now()],
            ['id' => 8, 'user' => 'Mentor', 'action' => 'Menilai tugas', 'time' => '1 hari lalu', 'type' => 'success', 'detail' => '15 tugas telah dinilai', 'created_at' => now()],
        ];
        
        return response()->json([
            'success' => true,
            'data' => array_slice($activities, 0, $limit)
        ]);
    }
    
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'user' => 'required|string',
                'action' => 'required|string',
                'type' => 'nullable|string',
                'detail' => 'nullable|string'
            ]);
            
            if (Schema::hasTable('activity_logs')) {
                DB::table('activity_logs')->insert([
                    'user' => $data['user'],
                    'action' => $data['action'],
                    'type' => $data['type'] ?? 'info',
                    'detail' => $data['detail'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Activity log saved'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}