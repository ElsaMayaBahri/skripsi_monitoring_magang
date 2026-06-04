<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\HariLibur;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncHariLiburNasional extends Command
{
    protected $signature = 'libur:sync-nasional {--year= : Tahun yang akan disinkron (default tahun berjalan dan tahun depan)}';
    protected $description = 'Sinkronisasi hari libur nasional dari api-hari-libur.vercel.app (gratis, tanpa API key)';

    public function handle()
    {
        $yearOption = $this->option('year');
        $yearList = $yearOption
            ? [(int) $yearOption]
            : [Carbon::now()->year, Carbon::now()->addYear()->year];

        foreach ($yearList as $year) {
            $this->info("Mengambil data libur nasional tahun {$year}...");
            $this->syncYear($year);
        }

        $this->info('Selesai sync hari libur nasional.');
        return 0;
    }

    private function syncYear(int $year): void
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders(['Accept' => 'application/json'])
                ->get('https://api-hari-libur.vercel.app/api', [
                    'year' => $year,
                ]);

            if (!$response->successful()) {
                $this->error("  Gagal fetch tahun {$year}. HTTP: " . $response->status());
                $this->error("  Response: " . $response->body());
                Log::error("SyncLiburNasional: Gagal fetch tahun {$year}", [
                    'status'   => $response->status(),
                    'response' => $response->body(),
                ]);
                return;
            }

            $json = $response->json();

            // Validasi response: { "status": "success", "data": [...] }
            if (($json['status'] ?? '') !== 'success' || empty($json['data'])) {
                $this->warn("  Tidak ada data libur untuk tahun {$year}.");
                return;
            }

            $holidays = $json['data'];
            $inserted = 0;
            $updated  = 0;

            foreach ($holidays as $holiday) {
                // Field: "date" (Y-m-d) dan "description"
                $tanggal    = $holiday['date']        ?? null;
                $keterangan = $holiday['description'] ?? 'Libur Nasional';

                if (!$tanggal) continue;

                try {
                    $tanggalFormatted = Carbon::parse($tanggal)->format('Y-m-d');
                } catch (\Exception $e) {
                    $this->warn("  Format tanggal tidak valid: {$tanggal}, dilewati.");
                    continue;
                }

                $result = HariLibur::updateOrCreate(
                    [
                        'tanggal' => $tanggalFormatted,
                        'jenis'   => 'nasional',
                    ],
                    [
                        'keterangan' => $keterangan,
                    ]
                );

                $result->wasRecentlyCreated ? $inserted++ : $updated++;
            }

            $this->info("  Tahun {$year}: {$inserted} ditambahkan, {$updated} diperbarui.");
            Log::info("SyncLiburNasional: Tahun {$year} selesai. Baru: {$inserted}, Update: {$updated}");

        } catch (\Exception $e) {
            $this->error("  Error tahun {$year}: " . $e->getMessage());
            Log::error("SyncLiburNasional: Exception tahun {$year}: " . $e->getMessage());
        }
    }
}