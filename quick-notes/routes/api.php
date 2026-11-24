<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NoteController;

// Menampilkan semua catatan
Route::get('/notes', [NoteController::class, 'index']);

// Menambahkan catatan
Route::post('/notes', [NoteController::class, 'store']);

// Memperbarui catatan
Route::put('/notes/{id}', [NoteController::class, 'update']);

// Menghapus catatan
Route::delete('/notes/{id}', [NoteController::class, 'destroy']);
