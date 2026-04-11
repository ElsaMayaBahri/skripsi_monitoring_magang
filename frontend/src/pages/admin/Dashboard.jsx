import { useEffect, useState } from "react"

function DashboardAdmin() {
  const [users, setUsers] = useState([])
  const [divisi, setDivisi] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem("users")) || []
    const savedDivisi = JSON.parse(localStorage.getItem("divisi")) || []

    setUsers(savedUsers)
    setDivisi(savedDivisi)
  }, [])

  // 🔥 STATS
  const totalPeserta = users.filter(u => u.role === "peserta").length
  const totalMentor = users.filter(u => u.role === "mentor").length
  const totalDivisi = divisi.length
  const nonAktif = users.filter(u => u.status === false).length

  // 🔥 FILTER USER
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  // 🔥 ACTIVITY
  const recentUsers = [...users].slice(-5).reverse()

  return (
    <div>

      {/* 🔥 TOP BAR (CLEAN VERSION) */}
      <div className="flex justify-start items-center mb-8">
        <input
          type="text"
          placeholder="Cari pengguna..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 px-4 py-2 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Dashboard Admin
        </h2>
        <p className="text-sm text-gray-500">
          Ringkasan data pengguna dan aktivitas terbaru sistem.
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Peserta</p>
          <h2 className="text-2xl font-bold mt-2 text-blue-600">
            {totalPeserta}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Mentor</p>
          <h2 className="text-2xl font-bold mt-2 text-green-600">
            {totalMentor}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Divisi</p>
          <h2 className="text-2xl font-bold mt-2 text-purple-600">
            {totalDivisi}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Akun Non Aktif</p>
          <h2 className="text-2xl font-bold mt-2 text-red-500">
            {nonAktif}
          </h2>
        </div>

      </div>

      {/* USER TABLE */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">

        <h3 className="font-semibold mb-4">
          Data Pengguna
        </h3>

        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left py-2">Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Divisi</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">

                <td className="py-3">{u.name}</td>
                <td>{u.email}</td>
                <td className="capitalize">{u.role}</td>
                <td>{u.divisi}</td>

                <td>
                  {u.status ? (
                    <span className="text-green-600 text-xs">Aktif</span>
                  ) : (
                    <span className="text-red-500 text-xs">Nonaktif</span>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* ACTIVITY */}
      <div className="bg-white p-6 rounded-xl shadow-sm">

        <h3 className="font-semibold mb-4">
          Aktivitas Terbaru
        </h3>

        <div className="space-y-4">
          {recentUsers.map((u, i) => (
            <div key={i} className="flex justify-between items-center">

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">
                  {u.initials || "U"}
                </div>

                <div>
                  <p className="text-sm">
                    {u.name} ditambahkan sebagai {u.role}
                  </p>
                  <p className="text-xs text-gray-400">
                    Data terbaru
                  </p>
                </div>
              </div>

              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                BARU
              </span>

            </div>
          ))}
        </div>

      </div>

    </div>
  )
}

export default DashboardAdmin