<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * GET /api/notes
     * Menampilkan semua catatan.
     */
    public function index()
    {
        $notes = Note::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Data catatan berhasil diambil',
            'data' => $notes,
        ], 200);
    }

    /**
     * POST /api/notes
     * Menambahkan catatan baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'color' => 'sometimes|string|max:20',
        ]);

        $note = Note::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Catatan berhasil ditambahkan',
            'data' => $note,
        ], 201);
    }

    /**
     * PUT /api/notes/{id}
     * Memperbarui catatan.
     */
    public function update(Request $request, $id)
    {
        $note = Note::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'color' => 'sometimes|string|max:20',
        ]);

        $note->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Catatan berhasil diperbarui',
            'data' => $note,
        ], 200);
    }

    /**
     * DELETE /api/notes/{id}
     * Menghapus catatan.
     */
    public function destroy($id)
    {
        $note = Note::findOrFail($id);

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catatan berhasil dihapus',
        ], 200);
    }
}

