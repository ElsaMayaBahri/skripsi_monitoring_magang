import { useState, useEffect } from "react"
import { getUsers, getDivisi, saveDivisi } from "../../utils/storage"

function Divisi() {
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [divisi, setDivisi] = useState([])
  const [users, setUsers] = useState([])

  const [form, setForm] = useState({
    name: "",
    desc: "",
  })

  const [editIndex, setEditIndex] = useState(null)

  // 🔥 LOAD DATA (PAKAI STORAGE.JS)
  useEffect(() => {
    setDivisi(getDivisi())
    setUsers(getUsers())
  }, [])

  // 🔥 HITUNG PESERTA & MENTOR
  const getStats = (namaDivisi) => {
    const peserta = users.filter(
      (u) => u.divisi === namaDivisi && u.role === "peserta"
    ).length

    const mentor = users.filter(
      (u) => u.divisi === namaDivisi && u.role === "mentor"
    ).length

    return { peserta, mentor }
  }

  // 🔥 SAVE
  const handleSave = () => {
    if (!form.name) return

    let updated = [...divisi]

    if (editIndex !== null) {
      updated[editIndex] = form
    } else {
      updated.push(form)
    }

    saveDivisi(updated) // 🔥 pake helper
    setDivisi(updated)

    setForm({ name: "", desc: "" })
    setEditIndex(null)
    setShowForm(false)
  }

  // 🔥 EDIT
  const handleEdit = (index) => {
    setForm(divisi[index])
    setEditIndex(index)
    setShowForm(true)
  }

  // 🔥 DELETE
  const handleDelete = (index) => {
    const updated = divisi.filter((_, i) => i !== index)
    saveDivisi(updated) // 🔥 pake helper
    setDivisi(updated)
  }

  return (
    <div>

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
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
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
            {divisi
              .filter((d) =>
                d.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((d, i) => {
                const stats = getStats(d.name)

                return (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">
                      {d.name}
                    </td>

                    <td className="text-gray-500">
                      {d.desc}
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
                          onClick={() => handleEdit(i)}
                          className="text-blue-500 hover:underline"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(i)}
                          className="text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => {
            setShowForm(false)
            setEditIndex(null)
          }}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editIndex !== null
                ? "Edit Divisi"
                : "Tambah Divisi Baru"}
            </h3>

            <div className="space-y-3">

              <input
                type="text"
                placeholder="Nama Divisi"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />

              <textarea
                placeholder="Deskripsi"
                value={form.desc}
                onChange={(e) =>
                  setForm({ ...form, desc: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg text-sm h-24"
              />

            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditIndex(null)
                }}
                className="px-4 py-2 text-sm text-gray-500"
              >
                Batal
              </button>

              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Simpan Divisi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Divisi