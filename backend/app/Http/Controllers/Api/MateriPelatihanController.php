<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MateriPelatihan;
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
            $materi = MateriPelatihan::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $materi
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error index materi: ' . $e->getMessage()); // Gunakan Log
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data materi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Log request untuk debugging
            Log::info('Store materi request:', [
                'all_data' => $request->all(),
                'has_file' => $request->hasFile('file'),
                'file_info' => $request->hasFile('file') ? [
                    'name' => $request->file('file')->getClientOriginalName(),
                    'size' => $request->file('file')->getSize(),
                    'mime' => $request->file('file')->getMimeType()
                ] : null
            ]);

            // Validasi input
            $validator = Validator::make($request->all(), [
                'judul' => 'required|string|max:150',
                'deskripsi' => 'nullable|string',
                'divisi' => 'nullable|string|max:100',
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

            // Handle file upload
            if (!$request->hasFile('file')) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan dalam request'
                ], 400);
            }

            $file = $request->file('file');

            // Validasi file benar-benar terupload
            if (!$file->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak valid atau gagal diupload'
                ], 400);
            }

            // Generate unique filename
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;

            // Store file
            $filePath = $file->storeAs('materi', $fileName, 'public');

            if (!$filePath) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menyimpan file'
                ], 500);
            }

            // Create materi pelatihan
            $materi = MateriPelatihan::create([
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'divisi' => $request->divisi,
                'kategori' => $request->kategori,
                'file_materi' => $filePath,
                'views' => 0
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Materi berhasil ditambahkan',
                'data' => $materi
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error store materi: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
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
            $materi = MateriPelatihan::findOrFail($id);

            // Increment views
            $materi->increment('views');

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

            // Update file if new file is uploaded
            if ($request->hasFile('file')) {
                // Delete old file
                if ($materi->file_materi && Storage::disk('public')->exists($materi->file_materi)) {
                    Storage::disk('public')->delete($materi->file_materi);
                    Log::info('Old file deleted: ' . $materi->file_materi);
                }

                $file = $request->file('file');
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;
                $filePath = $file->storeAs('materi', $fileName, 'public');

                $materi->file_materi = $filePath;
                Log::info('New file uploaded: ' . $filePath);
            }

            // Update other fields
            if ($request->has('judul')) $materi->judul = $request->judul;
            if ($request->has('deskripsi')) $materi->deskripsi = $request->deskripsi;
            if ($request->has('divisi')) $materi->divisi = $request->divisi;
            if ($request->has('kategori')) $materi->kategori = $request->kategori;

            $materi->save();

            Log::info('Materi updated successfully: ' . $materi->id_materi_pelatihan);

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

            // Delete file from storage
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
            $materi = MateriPelatihan::where('divisi', $divisi)
                ->orderBy('created_at', 'desc')
                ->get();

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
            return response()->download($fullPath);
        } catch (\Exception $e) {
            Log::error('Error download materi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendownload file: ' . $e->getMessage()
            ], 500);
        }
    }
}
