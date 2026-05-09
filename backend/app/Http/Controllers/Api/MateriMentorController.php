<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MateriMentor;
use App\Models\Mentor;
use App\Models\Divisi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MateriMentorController extends Controller
{
    /**
     * Get all materi for logged in mentor
     * GET /api/mentor/materi
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Anda bukan mentor.'
                ], 403);
            }

            $mentor = Mentor::where('id_user', $user->id_user)->first();
            
            if (!$mentor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data mentor tidak ditemukan'
                ], 404);
            }

            $query = MateriMentor::with(['divisi'])
                ->where('id_mentor', $mentor->id_mentor);

            if ($request->has('search') && !empty($request->search)) {
                $query->where('judul', 'like', '%' . $request->search . '%');
            }

            if ($request->has('tipe') && !empty($request->tipe) && $request->tipe !== 'all') {
                $query->where('tipe_materi', $request->tipe);
            }

            $materi = $query->orderBy('created_at', 'desc')->get();

            $transformedMateri = $materi->map(function ($item) {
                return [
                    'id_materi' => $item->id_materi,
                    'judul' => $item->judul,
                    'deskripsi' => $item->deskripsi,
                    'tipe_materi' => $item->tipe_materi ?? 'dokumen',
                    'file_materi' => $item->file_materi,
                    'file_url' => $item->file_materi ? Storage::url($item->file_materi) : null,
                    'link' => $item->link,
                    'id_divisi' => $item->id_divisi,
                    'divisi' => $item->divisi ? $item->divisi->nama_divisi : null,
                    'views' => $item->views ?? 0,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedMateri,
                'total' => $materi->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single materi by ID
     * GET /api/mentor/materi/{id}
     */
    public function show($id)
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

            $materi = MateriMentor::with(['divisi', 'mentor'])
                ->where('id_materi', $id)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$materi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Materi tidak ditemukan'
                ], 404);
            }

            $materi->increment('views');

            return response()->json([
                'success' => true,
                'data' => [
                    'id_materi' => $materi->id_materi,
                    'judul' => $materi->judul,
                    'deskripsi' => $materi->deskripsi,
                    'tipe_materi' => $materi->tipe_materi ?? 'dokumen',
                    'file_materi' => $materi->file_materi,
                    'file_url' => $materi->file_materi ? Storage::url($materi->file_materi) : null,
                    'link' => $materi->link,
                    'id_divisi' => $materi->id_divisi,
                    'divisi' => $materi->divisi ? $materi->divisi->nama_divisi : null,
                    'views' => $materi->views,
                    'created_at' => $materi->created_at,
                    'updated_at' => $materi->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new materi
     * POST /api/mentor/materi
     */
    public function store(Request $request)
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

            $rules = [
                'judul' => 'required|string|max:255',
                'deskripsi' => 'nullable|string',
                'tipe_materi' => 'required|in:dokumen,video,link',
                'id_divisi' => 'nullable|exists:divisis,id_divisi',
            ];

            if ($request->tipe_materi === 'dokumen') {
                $rules['file'] = 'required|file|mimes:pdf,doc,docx,ppt,pptx|max:10240';
            } elseif ($request->tipe_materi === 'video') {
                $rules['file'] = 'required|file|mimes:mp4,mov,avi,webm|max:51200';
            } elseif ($request->tipe_materi === 'link') {
                $rules['link'] = 'required|url|max:500';
            }

            $request->validate($rules);

            DB::beginTransaction();

            $data = [
                'id_mentor' => $mentor->id_mentor,
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'tipe_materi' => $request->tipe_materi,
                'id_divisi' => $request->id_divisi,
                'views' => 0,
            ];

            if (in_array($request->tipe_materi, ['dokumen', 'video']) && $request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $folder = $request->tipe_materi === 'video' ? 'materi_mentor/videos' : 'materi_mentor/documents';
                $path = $file->storeAs($folder, $filename, 'public');
                $data['file_materi'] = $path;
            }

            if ($request->tipe_materi === 'link') {
                $data['link'] = $request->link;
            }

            $materi = MateriMentor::create($data);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Materi berhasil ditambahkan',
                'data' => $materi
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan materi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update materi
     * PUT /api/mentor/materi/{id}
     */
    public function update(Request $request, $id)
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

            $materi = MateriMentor::where('id_materi', $id)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$materi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Materi tidak ditemukan'
                ], 404);
            }

            $rules = [
                'judul' => 'required|string|max:255',
                'deskripsi' => 'nullable|string',
                'tipe_materi' => 'required|in:dokumen,video,link',
                'id_divisi' => 'nullable|exists:divisis,id_divisi',
            ];

            if ($request->tipe_materi === 'dokumen') {
                $rules['file'] = 'nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:10240';
            } elseif ($request->tipe_materi === 'video') {
                $rules['file'] = 'nullable|file|mimes:mp4,mov,avi,webm|max:51200';
            } elseif ($request->tipe_materi === 'link') {
                $rules['link'] = 'nullable|url|max:500';
            }

            $request->validate($rules);

            DB::beginTransaction();

            $data = [
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'tipe_materi' => $request->tipe_materi,
                'id_divisi' => $request->id_divisi,
            ];

            if (in_array($request->tipe_materi, ['dokumen', 'video']) && $request->hasFile('file')) {
                if ($materi->file_materi && Storage::disk('public')->exists($materi->file_materi)) {
                    Storage::disk('public')->delete($materi->file_materi);
                }
                
                $file = $request->file('file');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $folder = $request->tipe_materi === 'video' ? 'materi_mentor/videos' : 'materi_mentor/documents';
                $path = $file->storeAs($folder, $filename, 'public');
                $data['file_materi'] = $path;
                $data['link'] = null;
            } else {
                $data['file_materi'] = $materi->file_materi;
            }

            if ($request->tipe_materi === 'link') {
                $data['link'] = $request->link;
                $data['file_materi'] = null;
            }

            $materi->update($data);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Materi berhasil diupdate'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate materi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete materi
     * DELETE /api/mentor/materi/{id}
     */
    public function destroy($id)
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

            $materi = MateriMentor::where('id_materi', $id)
                ->where('id_mentor', $mentor->id_mentor)
                ->first();

            if (!$materi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Materi tidak ditemukan'
                ], 404);
            }

            if ($materi->file_materi && Storage::disk('public')->exists($materi->file_materi)) {
                Storage::disk('public')->delete($materi->file_materi);
            }

            $materi->delete();

            return response()->json([
                'success' => true,
                'message' => 'Materi berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus materi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get divisi list for dropdown
     * GET /api/mentor/materi/divisi-list
     */
    public function getDivisiList()
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'mentor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $divisilist = Divisi::where('status', 'aktif')
                ->orWhere('status_akun', 'aktif')
                ->get(['id_divisi', 'nama_divisi']);

            return response()->json([
                'success' => true,
                'data' => $divisilist
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}