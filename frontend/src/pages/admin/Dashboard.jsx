import { useState, useEffect } from "react"
import { getUsers } from "../../utils/storage"
import {
  Users,
  UserCheck,
  Building2,
  UserX
} from "lucide-react"

function DashboardAdmin() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    setUsers(getUsers())
  }, [])

  // 🔥 STATS
  const totalPeserta = users.filter(u => u.role === "peserta").length
  const totalMentor = users.filter(u => u.role === "mentor").length
  const totalDivisi = [...new Set(users.map(u => u.divisi))].length
  const nonAktif = users.filter(u => !u.status).length

  // 🔥 FILTER
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  const recentUsers = [...users].slice(-5).reverse()

  return (
    <div>

      {/* SEARCH */}
      <div className="mb-8">
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

      {/* 🔥 CARDS PREMIUM */}
      <div className="grid grid-cols-4 gap-6 mb-8">

        <Card
          title="Total Peserta"
          value={totalPeserta}
          icon={<Users size={20} />}
          color="blue"
        />

        <Card
          title="Total Mentor"
          value={totalMentor}
          icon={<UserCheck size={20} />}
          color="green"
        />

        <Card
          title="Total Divisi"
          value={totalDivisi}
          icon={<Building2 size={20} />}
          color="purple"
        />

        <Card
          title="Akun Non Aktif"
          value={nonAktif}
          icon={<UserX size={20} />}
          color="red"
        />

      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border">

        <h3 className="font-semibold mb-4 text-gray-800">
          Data Pengguna
        </h3>

        <table className="w-full text-sm">

          <thead>
            <tr className="text-gray-400 border-b text-xs uppercase tracking-wide">
              <th className="text-left py-3">Nama</th>
              <th className="text-center">Email</th>
              <th className="text-center">Role</th>
              <th className="text-center">Divisi</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition"
              >

                {/* NAMA */}
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {u.initials || "U"}
                    </div>
                    <span className="font-medium text-gray-700">
                      {u.name}
                    </span>
                  </div>
                </td>

                {/* EMAIL */}
                <td className="text-center text-gray-600">
                  {u.email}
                </td>

                {/* ROLE */}
                <td className="text-center capitalize">
                  {u.role}
                </td>

                {/* DIVISI */}
                <td className="text-center">
                  {u.divisi ? (
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs">
                      {u.divisi}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                {/* STATUS */}
                <td className="text-center">
                  {u.status ? (
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                      Aktif
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                      Nonaktif
                    </span>
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* 🔥 ACTIVITY */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-semibold mb-4 text-gray-800">
          Aktivitas Terbaru
        </h3>

        <div className="space-y-4">
          {recentUsers.map((u, i) => (
            <div key={i} className="flex justify-between items-center">

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {u.initials || "U"}
                </div>

                <div>
                  <p className="text-sm text-gray-700">
                    {u.name} ditambahkan sebagai <b>{u.role}</b>
                  </p>
                  <p className="text-xs text-gray-400">
                    Baru saja
                  </p>
                </div>
              </div>

              <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">
                NEW
              </span>

            </div>
          ))}
        </div>

      </div>

    </div>
  )
}

export default DashboardAdmin


// 🔥 CARD COMPONENT (PREMIUM STYLE)
function Card({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600"
  }

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition">

      <div className="flex justify-between items-center mb-4">

        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>

        <span className="text-xs text-gray-400">
          +0%
        </span>

      </div>

      <p className="text-sm text-gray-500">{title}</p>

      <h2 className="text-2xl font-bold mt-1 text-gray-800">
        {value}
      </h2>

      {/* 🔥 PROGRESS BAR */}
      <div className="mt-3 w-full h-1 bg-gray-100 rounded-full">
        <div className={`h-1 rounded-full ${colors[color].split(" ")[0]}`}
             style={{ width: "60%" }}>
        </div>
      </div>

    </div>
  )
}