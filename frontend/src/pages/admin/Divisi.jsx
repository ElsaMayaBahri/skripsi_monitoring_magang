import { useState, useEffect } from "react"
import { api } from "../../utils/api"

function Divisi() {
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [divisi, setDivisi] = useState([])
  const [mentors, setMentors] = useState([])
  const [peserta, setPeserta] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    nama_divisi: "",
    deskripsi: "",
  })

  const [editId, setEditId] = useState(null)

  // LOAD DATA DARI API
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load divisi dari API
      const divisiResponse = await api.getDivisi()
      setDivisi(divisiResponse.data || [])
      
      // Load mentors & peserta from API
      const [mentorsRes, pesertaRes] = await Promise.all([
        api.getMentors(),
        api.getPeserta()
      ])
      
      setMentors(mentorsRes.data || [])
      setPeserta(pesertaRes.data || [])
      
    } catch (err) {
      console.error("Error loading data:", err)
      setError(err.message || "Failed to load data")
      
      // Handle unauthorized
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  // HITUNG PESERTA & MENTOR
  const getStats = (namaDivisi) => {
    // Count peserta in this divisi
    // Check if peserta has divisi property with nama_divisi
    const pesertaCount = peserta.filter((p) => {
      // Check different possible structures
      if (p.divisi && p.divisi.nama_divisi === namaDivisi) return true
      if (p.nama_divisi === namaDivisi) return true
      if (p.divisi_name === namaDivisi) return true
      return false
    }).length

    // Count mentors in this divisi
    const mentorCount = mentors.filter((m) => {
      // Check different possible structures
      if (m.divisi && typeof m.divisi === 'object' && m.divisi.nama_divisi === namaDivisi) return true
      if (m.divisi === namaDivisi) return true
      if (m.nama_divisi === namaDivisi) return true
      return false
    }).length

    return { peserta: pesertaCount, mentor: mentorCount }
  }

  // SAVE DIVISI (CREATE/UPDATE)
  const handleSave = async () => {
    if (!form.nama_divisi) {
      setError("Nama divisi wajib diisi")
      return
    }

    setLoading(true)
    setError("")

    try {
      if (editId !== null) {
        await api.updateDivisi(editId, form)
      } else {
        await api.addDivisi(form)
      }
      
      await loadData()
      
      setForm({ nama_divisi: "", deskripsi: "" })
      setEditId(null)
      setShowForm(false)
      
    } catch (err) {
      console.error("Error saving divisi:", err)
      if (err.message.includes('Validation failed')) {
        setError("Validation error. Please check your input.")
      } else {
        setError(err.message || "Failed to save divisi")
      }
    } finally {
      setLoading(false)
    }
  }

  // EDIT DIVISI
  const handleEdit = (item) => {
    setForm({
      nama_divisi: item.nama_divisi,
      deskripsi: item.deskripsi || "",
    })
    setEditId(item.id_divisi)
    setShowForm(true)
  }

  // DELETE DIVISI
  const handleDelete = async (id, namaDivisi) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus divisi "${namaDivisi}"?`)) {
      return
    }

    setLoading(true)
    setError("")

    try {
      await api.deleteDivisi(id)
      await loadData()
    } catch (err) {
      console.error("Error deleting divisi:", err)
      setError(err.message || "Failed to delete divisi")
    } finally {
      setLoading(false)
    }
  }

  if (loading && divisi.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError("")}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Manajemen Divisi
          </h2>
          <p className="text-sm text-gray-500">
            Kelola divisi dan distribusi peserta serta mentor.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ nama_divisi: "", deskripsi: "" })
            setEditId(null)
            setShowForm(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          disabled={loading}
        >
          + Tambah Divisi
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <input
          type="text"
          placeholder="Cari divisi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg text-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-left px-6 py-3">Divisi</th>
              <th>Deskripsi</th>
              <th>Peserta</th>
              <th>Mentor</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {divisi.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  Belum ada data divisi
                </td>
              </tr>
            ) : (
              divisi
                .filter((d) =>
                  d.nama_divisi.toLowerCase().includes(search.toLowerCase())
                )
                .map((d) => {
                  const stats = getStats(d.nama_divisi)

                  return (
                    <tr key={d.id_divisi} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">
                        {d.nama_divisi}
                      </td>

                      <td className="text-gray-500">
                        {d.deskripsi || "-"}
                      </td>

                      <td className="text-center">
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                          {stats.peserta}
                        </span>
                      </td>

                      <td className="text-center">
                        <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs">
                          {stats.mentor}
                        </span>
                      </td>

                      <td className="text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(d)}
                            className="text-blue-500 hover:underline"
                            disabled={loading}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(d.id_divisi, d.nama_divisi)}
                            className="text-red-500 hover:underline"
                            disabled={loading}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => {
            setShowForm(false)
            setEditId(null)
            setError("")
          }}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editId !== null ? "Edit Divisi" : "Tambah Divisi Baru"}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nama Divisi *"
                value={form.nama_divisi}
                onChange={(e) =>
                  setForm({ ...form, nama_divisi: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />

              <textarea
                placeholder="Deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg text-sm h-24"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditId(null)
                  setError("")
                }}
                className="px-4 py-2 text-sm text-gray-500"
                disabled={loading}
              >
                Batal
              </button>

              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Divisi"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Divisi