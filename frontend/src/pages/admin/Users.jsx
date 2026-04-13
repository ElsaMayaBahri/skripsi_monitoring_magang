import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getUsers, deleteUser, updateUser } from "../../utils/storage"

function Users() {
  const navigate = useNavigate()

  const [tab, setTab] = useState("peserta")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [divisiFilter, setDivisiFilter] = useState("all")

  const [data, setData] = useState([])

  // 🔥 LOAD DATA
  useEffect(() => {
    setData(getUsers())
  }, [])

  // 🔥 FILTER
  const filtered = data
    .filter((d) => d.role === tab)
    .filter((d) =>
      d.name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((d) =>
      divisiFilter === "all" ? true : d.divisi === divisiFilter
    )
    .filter((d) => {
      if (statusFilter === "all") return true
      if (statusFilter === "aktif") return d.status === "aktif"
      if (statusFilter === "nonaktif") return d.status === "nonaktif"
    })

  // 🔥 STATS
  const total = filtered.length
  const aktif = filtered.filter((d) => d.status === "aktif").length
  const nonaktif = filtered.filter((d) => d.status === "nonaktif").length

  // 🔥 TOGGLE STATUS
  const toggleStatus = (index) => {
    const user = filtered[index]
    const realIndex = data.findIndex((d) => d === user)

    const updated = [...data]
    updated[realIndex].status =
      updated[realIndex].status === "aktif"
        ? "nonaktif"
        : "aktif"

    updateUser(realIndex, updated[realIndex])
    setData(getUsers())
  }

  // 🔥 DELETE
  const handleDelete = (index) => {
    const user = filtered[index]
    const realIndex = data.findIndex((d) => d === user)

    deleteUser(realIndex)
    setData(getUsers())
  }

  // 🔥 ADD
  const handleAdd = () => {
    if (tab === "mentor") {
      navigate("/admin/add-mentor")
    } else {
      navigate("/admin/add-peserta")
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f5f7fb]">

      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Manajemen Akun
            </h2>
            <p className="text-sm text-gray-500">
              Kelola akun peserta dan mentor dalam sistem.
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            + Tambah {tab === "mentor" ? "Mentor" : "Peserta"}
          </button>
        </div>

        {/* FILTER */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-4 gap-4">

            <input
              type="text"
              placeholder="Cari nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />

            <select
              onChange={(e) => setDivisiFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Semua Divisi</option>
              <option>Engineering</option>
              <option>Product Design</option>
              <option>Marketing</option>
            </select>

            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setTab("peserta")}
                className={`px-3 py-2 rounded ${
                  tab === "peserta"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Peserta
              </button>

              <button
                onClick={() => setTab("mentor")}
                className={`px-3 py-2 rounded ${
                  tab === "mentor"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Mentor
              </button>
            </div>

          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Total Akun</p>
            <h2 className="text-xl font-bold">{total}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Akun Aktif</p>
            <h2 className="text-xl font-bold">{aktif}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Akun Nonaktif</p>
            <h2 className="text-xl font-bold text-orange-500">
              {nonaktif}
            </h2>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-3">Nama</th>
                <th>Email</th>
                <th>Divisi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item, i) => (
                <tr key={i} className="border-b">

                  <td className="py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">
                      {item.initials}
                    </div>
                    {item.name}
                  </td>

                  <td>{item.email}</td>

                  <td>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                      {item.divisi}
                    </span>
                  </td>

                  <td>
                    {item.status === "aktif" ? (
                      <span className="text-green-600 text-xs">
                        ● Aktif
                      </span>
                    ) : (
                      <span className="text-red-500 text-xs">
                        ● Nonaktif
                      </span>
                    )}
                  </td>

                  <td className="flex gap-3 py-3">

                    <button onClick={() => toggleStatus(i)}>
                      🔘
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/admin/edit-user/${i}`)
                      }
                    >
                      ✏️
                    </button>

                    <button onClick={() => handleDelete(i)}>
                      🗑️
                    </button>

                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default Users