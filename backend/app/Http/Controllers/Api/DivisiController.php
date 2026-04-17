<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Divisi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DivisiController extends Controller
{
    public function index()
    {
        try {
            $divisi = Divisi::with(['mentors', 'pesertas'])->get();
            
            return response()->json([
                'success' => true,
                'data' => $divisi
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch divisi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_divisi' => 'required|string|max:100|unique:divisis,nama_divisi',
            'deskripsi' => 'nullable|string',
            'id_mentor' => 'nullable|exists:mentors,id_mentor'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $divisi = Divisi::create([
                'nama_divisi' => $request->nama_divisi,
                'deskripsi' => $request->deskripsi,
                'id_mentor' => $request->id_mentor
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Divisi created successfully',
                'data' => $divisi
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create divisi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nama_divisi' => 'required|string|max:100|unique:divisis,nama_divisi,' . $id . ',id_divisi',
            'deskripsi' => 'nullable|string',
            'id_mentor' => 'nullable|exists:mentors,id_mentor'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $divisi = Divisi::findOrFail($id);
            
            $divisi->update([
                'nama_divisi' => $request->nama_divisi,
                'deskripsi' => $request->deskripsi,
                'id_mentor' => $request->id_mentor
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Divisi updated successfully',
                'data' => $divisi
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update divisi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $divisi = Divisi::findOrFail($id);
            
            // Check if divisi has mentors or peserta
            if ($divisi->mentors()->count() > 0 || $divisi->pesertas()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete divisi because it has mentors or peserta assigned'
                ], 400);
            }
            
            $divisi->delete();

            return response()->json([
                'success' => true,
                'message' => 'Divisi deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete divisi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}