import React, { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/notes';

const PASTEL_COLORS = [
  {
    name: 'Lemon Pastel',
    value: 'yellow',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
    swatch: 'bg-amber-300',
  },
  {
    name: 'Mint Pastel',
    value: 'green',
    bg: 'bg-emerald-100',
    border: 'border-emerald-200',
    swatch: 'bg-emerald-300',
  },
  {
    name: 'Sky Pastel',
    value: 'blue',
    bg: 'bg-sky-100',
    border: 'border-sky-200',
    swatch: 'bg-sky-300',
  },
  {
    name: 'Peach Rose Pastel',
    value: 'pink',
    bg: 'bg-rose-100',
    border: 'border-rose-200',
    swatch: 'bg-rose-300',
  },
];

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form tambah catatan
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');
  const [submitting, setSubmitting] = useState(false);

  // Pencarian
  const [search, setSearch] = useState('');

  // Modal edit catatan
  const [editingNote, setEditingNote] = useState(null);
  const [updating, setUpdating] = useState(false);

  const getColorTheme = (colorValue) => {
    return (
      PASTEL_COLORS.find((item) => item.value === colorValue) ||
      PASTEL_COLORS[0]
    );
  };

  // READ: Ambil daftar catatan dari Laravel API
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(API_URL, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Gagal memuat catatan (HTTP ${res.status})`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setNotes(list);
    } catch (err) {
      setError(err.message || 'Gagal terhubung ke API Laravel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // CREATE: Tambah catatan baru
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || 'Tanpa Judul',
          content: content.trim(),
          color,
        }),
      });

      if (!res.ok) {
        throw new Error(`Gagal menambah catatan (HTTP ${res.status})`);
      }

      const created = await res.json();
      const newNote = created.data || created;

      setNotes((prev) => [newNote, ...prev]);
      setTitle('');
      setContent('');
      setColor('yellow');
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan catatan.');
    } finally {
      setSubmitting(false);
    }
  };

  // UPDATE: Simpan perubahan dari modal edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingNote || !editingNote.content.trim()) return;

    try {
      setUpdating(true);
      setError('');
      const res = await fetch(`${API_URL}/${editingNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          title: editingNote.title.trim() || 'Tanpa Judul',
          content: editingNote.content.trim(),
          color: editingNote.color,
        }),
      });

      if (!res.ok) {
        throw new Error(`Gagal memperbarui catatan (HTTP ${res.status})`);
      }

      const updatedRes = await res.json();
      const updatedNote = updatedRes.data || updatedRes;

      setNotes((prev) =>
        prev.map((item) => (item.id === updatedNote.id ? updatedNote : item))
      );
      setEditingNote(null);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memperbarui catatan.');
    } finally {
      setUpdating(false);
    }
  };

  // UPDATE: Ganti warna pastel langsung di kartu
  const handleChangeCardColor = async (note, nextColor) => {
    if (note.color === nextColor) return;

    const snapshot = [...notes];
    setNotes((prev) =>
      prev.map((item) =>
        item.id === note.id ? { ...item, color: nextColor } : item
      )
    );

    try {
      setError('');
      const res = await fetch(`${API_URL}/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          color: nextColor,
        }),
      });

      if (!res.ok) {
        throw new Error(`Gagal mengganti warna catatan (HTTP ${res.status})`);
      }
    } catch (err) {
      setNotes(snapshot);
      setError(err.message || 'Gagal menyimpan warna baru.');
    }
  };

  // DELETE: Hapus catatan
  const handleDeleteNote = async (id) => {
    const confirmed = window.confirm('Hapus catatan ini?');
    if (!confirmed) return;

    const snapshot = [...notes];
    setNotes((prev) => prev.filter((item) => item.id !== id));

    try {
      setError('');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Gagal menghapus catatan (HTTP ${res.status})`);
      }
    } catch (err) {
      setNotes(snapshot);
      setError(err.message || 'Terjadi kesalahan saat menghapus catatan.');
    }
  };

  const filteredNotes = notes.filter((note) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (note.title && note.title.toLowerCase().includes(q)) ||
      (note.content && note.content.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
              QN
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Quick Notes
            </h1>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau isi..."
            className="w-full max-w-xs px-3.5 py-1.5 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Pesan Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-xs font-semibold underline shrink-0"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Form Buat Catatan Baru */}
        <section className="max-w-xl mx-auto mb-10">
          <form
            onSubmit={handleAddNote}
            className={`rounded-2xl p-5 border shadow-sm transition-colors ${
              getColorTheme(color).bg
            } ${getColorTheme(color).border}`}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul catatan (opsional)"
              className="w-full bg-transparent text-slate-900 placeholder-slate-500 font-semibold text-base focus:outline-none mb-2"
            />
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis isi catatan di sini..."
              required
              className="w-full bg-transparent text-slate-700 placeholder-slate-500 text-sm focus:outline-none resize-none leading-relaxed"
            />

            <div className="mt-4 pt-3 border-t border-black/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">
                  Warna pastel:
                </span>
                {PASTEL_COLORS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    title={item.name}
                    onClick={() => setColor(item.value)}
                    className={`w-6 h-6 rounded-full border border-black/20 transition ${
                      item.swatch
                    } ${
                      color === item.value
                        ? 'scale-110 ring-2 ring-slate-900 ring-offset-1'
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {submitting ? 'Menyimpan...' : 'Tambah Catatan'}
              </button>
            </div>
          </form>
        </section>

        {/* Grid Catatan */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            Memuat data catatan...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
            {search
              ? 'Tidak ada catatan yang sesuai dengan kata kunci.'
              : 'Belum ada catatan. Tambahkan catatan pertama Anda.'}
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredNotes.map((note) => {
              const theme = getColorTheme(note.color);
              return (
                <article
                  key={note.id}
                  className={`rounded-2xl p-5 border shadow-sm hover:shadow-md transition flex flex-col justify-between min-h-[210px] ${theme.bg} ${theme.border}`}
                >
                  <div>
                    <h2 className="font-bold text-slate-900 text-base break-words mb-2">
                      {note.title || 'Tanpa Judul'}
                    </h2>
                    <p className="text-slate-700 text-sm whitespace-pre-line break-words leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between gap-2">
                    {/* Ganti 4 Warna Pastel */}
                    <div className="flex items-center gap-1.5">
                      {PASTEL_COLORS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          title={`Ubah ke ${item.name}`}
                          onClick={() => handleChangeCardColor(note, item.value)}
                          className={`w-4 h-4 rounded-full border border-black/20 transition ${
                            item.swatch
                          } ${
                            note.color === item.value
                              ? 'scale-110 ring-1 ring-slate-900'
                              : 'opacity-70 hover:opacity-100 hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Aksi Edit & Hapus */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingNote({ ...note })}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-800 hover:bg-black/10 transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-700 hover:bg-red-500/10 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {/* Modal Edit */}
      {editingNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-2xl p-6 border shadow-xl ${
              getColorTheme(editingNote.color).bg
            } ${getColorTheme(editingNote.color).border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Edit Catatan
              </h3>
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="text-slate-600 hover:text-slate-900 font-bold text-base px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <input
                type="text"
                value={editingNote.title || ''}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, title: e.target.value })
                }
                placeholder="Judul catatan"
                className="w-full bg-transparent text-slate-900 font-bold text-lg focus:outline-none mb-3"
              />
              <textarea
                rows={5}
                value={editingNote.content || ''}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, content: e.target.value })
                }
                placeholder="Isi catatan"
                required
                className="w-full bg-transparent text-slate-800 text-sm focus:outline-none resize-none leading-relaxed"
              />

              <div className="mt-5 pt-4 border-t border-black/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {PASTEL_COLORS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      title={item.name}
                      onClick={() =>
                        setEditingNote({ ...editingNote, color: item.value })
                      }
                      className={`w-6 h-6 rounded-full border border-black/20 transition ${
                        item.swatch
                      } ${
                        editingNote.color === item.value
                          ? 'scale-110 ring-2 ring-slate-900 ring-offset-1'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingNote(null)}
                    className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-black/10 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={updating || !editingNote.content.trim()}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40 transition"
                  >
                    {updating ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
