<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MateriPelatihan;
use App\Models\AksesMateriKompetensi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MateriPelatihanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            // Cek apakah relasi aksesMateriKompetensi ada
            $hasRelation = method_exists(MateriPelatihan::class, 'aksesMateriKompetensi');
            
            if ($hasRelation) {
                $materi = MateriPelatihan::withCount([
                    'aksesMateriKompetensi as views'
                ])
                ->orderBy('divisi', 'asc')
                ->orderBy('urutan', 'asc')
                ->get();
            } else {
                $materi = MateriPelatihan::orderBy('divisi', 'asc')
                    ->orderBy('urutan', 'asc')
                    ->get();
                // Tambahkan views default 0
                foreach ($materi as $item) {
                    $item->views = 0;
                }
            }

            // Tambahkan URL file yang bisa diakses
            $materi = $materi->map(function ($item) {
                return $this->addFileUrl($item);
            });

            return response()->json([
                'success' => true,
                'data' => $materi
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error index materi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data materi: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Add accessible file URL to materi object
     */
    private function addFileUrl($materi)
    {
        if ($materi->file_materi) {
            // Get filename from path
            $filename = basename($materi->file_materi);
            // Gunakan endpoint preview untuk materi pelatihan
            $materi->file_materi_url = url('/api/materi-file/' . $filename);
            $materi->file_url = url('/api/materi-file/' . $filename);
            $materi->file_preview_url = url('/api/materi-file/' . $filename);
        } else {
            $materi->file_materi_url = null;
            $materi->file_url = null;
            $materi->file_preview_url = null;
        }
        return $materi;
    }

    /**
     * Preview file materi (for thumbnail and embed)
     */
    public function previewFile($filename)
    {
        try {
            // Cari file di storage/app/public/materi/
            $paths = [
                storage_path('app/public/materi/' . $filename),
                storage_path('app/public/' . $filename),
            ];

            $filePath = null;
            foreach ($paths as $path) {
                if (file_exists($path)) {
                    $filePath = $path;
                    break;
                }
            }

            if (!$filePath) {
                Log::warning('File not found: ' . $filename);
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan'
                ], 404);
            }

            // Get mime type
            $mime = mime_content_type($filePath);
            
            // Return file with proper headers
            return response()->file($filePath, [
                'Content-Type' => $mime,
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Expose-Headers' => 'Content-Disposition',
                'Cache-Control' => 'public, max-age=3600',
            ]);
        } catch (\Exception $e) {
            Log::error('Error preview file: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menampilkan file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Store materi request:', [
                'all_data' => $request->all(),
                'has_file' => $request->hasFile('file'),
                'file_info' => $request->hasFile('file') ? [
                    'name' => $request->file('file')->getClientOriginalName(),
                    'size' => $request->file('file')->getSize(),
                    'mime' => $request->file('file')->getMimeType()
                ] : null
            ]);

            $validator = Validator::make($request->all(), [
                'judul' => 'required|string|max:150',
                'deskripsi' => 'nullable|string',
                'divisi' => 'required|string|max:100',
                'kategori' => 'nullable|string|max:50',
                'file' => [
                    'required',
                    'file',
                    'max:51200',
                    function ($attribute, $value, $fail) {
                        $allowedExtensions = ['pdf', 'mp4', 'ppt', 'pptx', 'doc', 'docx'];
                        $extension = strtolower($value->getClientOriginalExtension());

                        if (!in_array($extension, $allowedExtensions)) {
                            $fail('Format file harus PDF, MP4, PPT, PPTX, DOC, atau DOCX.');
                        }
                    },
                ],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!$request->hasFile('file')) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan dalam request'
                ], 400);
            }

            $file = $request->file('file');

            if (!$file->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak valid atau gagal diupload'
                ], 400);
            }

            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;

            $filePath = $file->storeAs('materi', $fileName, 'public');

            if (!$filePath) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menyimpan file'
                ], 500);
            }

            // Ambil urutan terbesar berdasarkan DIVISI yang SAMA
            $maxUrutan = MateriPelatihan::where('divisi', $request->divisi)
                ->max('urutan');
            
            // Jika belum ada data di divisi tersebut maka mulai dari 1
            $nextUrutan = ($maxUrutan ?? 0) + 1;

            $materi = MateriPelatihan::create([
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'divisi' => $request->divisi,
                'kategori' => $request->kategori,
                'urutan' => $nextUrutan,
                'file_materi' => $filePath,
                'views' => 0,
            ]);

            $materi = $this->addFileUrl($materi);

            return response()->json([
                'success' => true,
                'message' => 'Materi berhasil ditambahkan',
                'data' => $materi
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error store materi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan materi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $hasRelation = method_exists(MateriPelatihan::class, 'aksesMateriKompetensi');
            
            if ($hasRelation) {
                $materi = MateriPelatihan::withCount([
                    'aksesMateriKompetensi as views'
                ])->findOrFail($id);
            } else {
                $materi = MateriPelatihan::findOrFail($id);
                $materi->views = $materi->views ?? 0;
            }
            
            $materi->increment('views');
            $materi = $this->addFileUrl($materi);

            return response()->json([
                'success' => true,
                'data' => $materi
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error show materi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Materi tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $materi = MateriPelatihan::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'judul' => 'sometimes|string|max:150',
                'deskripsi' => 'nullable|string',
                'divisi' => 'nullable|string|max:100',
                'kategori' => 'nullable|string|max:50',
                'urutan' => 'nullable|integer|min:1|max:100',
                'file' => [
                    'nullable',
                    'file',
                    'max:51200',
                    function ($attribute, $value, $fail) {
                        if ($value) {
                            $allowedExtensions = ['pdf', 'mp4', 'ppt', 'pptx', 'doc', 'docx'];
                            $extension = strtolower($value->getClientOriginalExtension());
                            if (!in_array($extension, $allowedExtensions)) {
                                $fail('Format file harus PDF, MP4, PPT, PPTX, DOC, atau DOCX.');
                            }
                        }
                    },
                ],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($request->hasFile('file')) {
                if ($materi->file_materi && Storage::disk('public')->exists($materi->file_materi)) {
                    Storage::disk('public')->delete($materi->file_materi);
                }

                $file = $request->file('file');
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;
                $filePath = $file->storeAs('materi', $fileName, 'public');

                $materi->file_materi = $filePath;
            }

            if ($request->has('judul')) $materi->judul = $request->judul;
            if ($request->has('deskripsi')) $materi->deskripsi = $request->deskripsi;
            if ($request->has('divisi')) $materi->divisi = $request->divisi;
            if ($request->has('kategori')) $materi->kategori = $request->kategori;
            if ($request->has('urutan')) $materi->urutan = $request->urutan;

            $materi->save();
            $materi = $this->addFileUrl($materi);

            return response()->json([
                'success' => true,
                'message' => 'Materi berhasil diupdate',
                'data' => $materi
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error update materi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate materi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $materi = MateriPelatihan::findOrFail($id);

            // Cek apakah tabel akses_materi_kompetensi ada
            if (class_exists('App\Models\AksesMateriKompetensi')) {
                try {
                    AksesMateriKompetensi::where('id_materi_pelatihan', $id)->delete();
                } catch (\Exception $e) {
                    Log::warning('Could not delete related access records: ' . $e->getMessage());
                }
            }

            if ($materi->file_materi && Storage::disk('public')->exists($materi->file_materi)) {
                Storage::disk('public')->delete($materi->file_materi);
            }

            $materi->delete();

            return response()->json([
                'success' => true,
                'message' => 'Materi berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error delete materi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus materi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get materi by divisi
     */
    public function getByDivisi($divisi)
    {
        try {
            $hasRelation = method_exists(MateriPelatihan::class, 'aksesMateriKompetensi');
            
            if ($hasRelation) {
                $materi = MateriPelatihan::where('divisi', $divisi)
                    ->withCount([
                        'aksesMateriKompetensi as views'
                    ])
                    ->orderBy('urutan', 'asc')
                    ->get();
            } else {
                $materi = MateriPelatihan::where('divisi', $divisi)
                    ->orderBy('urutan', 'asc')
                    ->get();
                foreach ($materi as $item) {
                    $item->views = 0;
                }
            }

            $materi = $materi->map(function ($item) {
                return $this->addFileUrl($item);
            });

            return response()->json([
                'success' => true,
                'data' => $materi
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error getByDivisi materi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data materi'
            ], 500);
        }
    }

    /**
     * Download file materi
     */
    public function download($id)
    {
        try {
            $materi = MateriPelatihan::findOrFail($id);

            if (!$materi->file_materi || !Storage::disk('public')->exists($materi->file_materi)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan'
                ], 404);
            }

            $fullPath = Storage::disk('public')->path($materi->file_materi);
            $filename = $materi->judul . '.' . pathinfo($fullPath, PATHINFO_EXTENSION);

            return response()->download($fullPath, $filename, [
                'Content-Type' => mime_content_type($fullPath),
                'Access-Control-Allow-Origin' => '*',
            ]);
        } catch (\Exception $e) {
            Log::error('Error download materi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendownload file: ' . $e->getMessage()
            ], 500);
        }
    }
}