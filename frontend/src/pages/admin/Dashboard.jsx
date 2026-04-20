import { useState, useEffect } from "react"
import { api } from "../../utils/api"
import {
  Users,
  UserCheck,
  Building2,
  UserX,
  RefreshCw,
  AlertCircle,
} from "lucide-react"

function DashboardAdmin() {
  const [pesertaList, setPesertaList] = useState([])
  const [mentorList, setMentorList] = useState([])
  const [divisiList, setDivisiList] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [pesertaRes, mentorRes, divisiRes] = await Promise.all([
        api.getPeserta(),
        api.getMentors(),
        api.getDivisi(),
      ])
      setPesertaList(pesertaRes.data || [])
      setMentorList(mentorRes.data || [])
      setDivisiList(divisiRes.data || [])
    } catch (err) {
      setError("Gagal memuat data: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // ── STATS ──────────────────────────────────────────
  const totalPeserta = pesertaList.length
  const totalMentor  = mentorList.length
  const totalDivisi  = divisiList.length

  // Peserta non-aktif: status_magang bukan 'aktif', atau status_akun user non_aktif
  const nonAktif = pesertaList.filter(
    (p) => p.user?.status_akun === "non_aktif" || p.status_magang !== "aktif"
  ).length

  // ── GABUNGKAN semua user (peserta + mentor) untuk tabel ──
  const allUsers = [
    ...pesertaList.map((p) => ({
      id: p.id_peserta,
      nama: p.user?.nama || "-",
      email: p.user?.email || "-",
      role: "peserta",
      divisi: p.divisi?.nama_divisi || "-",
      status: p.user?.status_akun === "aktif",
      initials: getInitials(p.user?.nama),
      createdAt: p.created_at,
    })),
    ...mentorList.map((m) => ({
      id: m.id_user,
      nama: m.name || m.nama || "-",
      email: m.email || "-",
      role: "mentor",
      divisi: m.divisi || "-",
      status: m.status,
      initials: getInitials(m.name || m.nama),
      createdAt: m.created_at,
    })),
  ]

  // ── FILTER berdasarkan search ──
  const filteredUsers = allUsers.filter((u) =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  // ── AKTIVITAS TERBARU (5 terakhir berdasarkan created_at) ──
  const recentUsers = [...allUsers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // ── RENDER ──────────────────────────────────────────
  return (
    <div>

      {/* SEARCH + REFRESH */}
      <div className="mb-8 flex items-center gap-3">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 px-4 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard Admin</h2>
        <p className="text-sm text-gray-500">
          Ringkasan data pengguna dan aktivitas terbaru sistem.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
          <button
            onClick={fetchAll}
            className="ml-auto underline text-red-600 hover:text-red-800"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card
          title="Total Peserta"
          value={loading ? "..." : totalPeserta}
          icon={<Users size={20} />}
          color="blue"
        />
        <Card
          title="Total Mentor"
          value={loading ? "..." : totalMentor}
          icon={<UserCheck size={20} />}
          color="green"
        />
        <Card
          title="Total Divisi"
          value={loading ? "..." : totalDivisi}
          icon={<Building2 size={20} />}
          color="purple"
        />
        <Card
          title="Akun Non Aktif"
          value={loading ? "..." : nonAktif}
          icon={<UserX size={20} />}
          color="red"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Data Pengguna</h3>
          <span className="text-xs text-gray-400">
            {filteredUsers.length} pengguna ditemukan
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
            Memuat data...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            Tidak ada data pengguna.
          </div>
        ) : (
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
              {filteredUsers.map((u) => (
                <tr
                  key={`${u.role}-${u.id}`}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {/* NAMA */}
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {u.initials}
                      </div>
                      <span className="font-medium text-gray-700">{u.nama}</span>
                    </div>
                  </td>

                  {/* EMAIL */}
                  <td className="text-center text-gray-600">{u.email}</td>

                  {/* ROLE */}
                  <td className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize font-medium ${
                      u.role === "mentor"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600"
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  {/* DIVISI */}
                  <td className="text-center">
                    {u.divisi && u.divisi !== "-" ? (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {u.divisi}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
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
                        Non Aktif
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* AKTIVITAS TERBARU */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-semibold mb-4 text-gray-800">Aktivitas Terbaru</h3>

        {loading ? (
          <div className="py-6 text-center text-gray-400 text-sm">
            <RefreshCw size={16} className="animate-spin mx-auto mb-2" />
            Memuat...
          </div>
        ) : recentUsers.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada aktivitas.</p>
        ) : (
          <div className="space-y-4">
            {recentUsers.map((u) => (
              <div key={`recent-${u.role}-${u.id}`} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {u.initials}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{u.nama}</span>{" "}
                      ditambahkan sebagai{" "}
                      <span className="font-semibold capitalize">{u.role}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Baru saja"}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  u.role === "mentor"
                    ? "bg-purple-50 text-purple-600"
                    : "bg-blue-50 text-blue-600"
                }`}>
                  {u.role.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default DashboardAdmin


// ── HELPERS ──────────────────────────────────────────
function getInitials(name = "") {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("") || "?"
}


// ── CARD COMPONENT ───────────────────────────────────
function Card({ title, value, icon, color }) {
  const colors = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   bar: "bg-blue-400"   },
    green:  { bg: "bg-green-50",  text: "text-green-600",  bar: "bg-green-400"  },
    purple: { bg: "bg-purple-50", text: "text-purple-600", bar: "bg-purple-400" },
    red:    { bg: "bg-red-50",    text: "text-red-600",    bar: "bg-red-400"    },
  }
  const c = colors[color]

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-center mb-4">
        <div className={`p-2 rounded-lg ${c.bg} ${c.text}`}>{icon}</div>
      </div>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold mt-1 text-gray-800">{value}</h2>
      <div className="mt-3 w-full h-1 bg-gray-100 rounded-full">
        <div className={`h-1 rounded-full ${c.bar}`} style={{ width: "60%" }} />
      </div>
    </div>
  )
}
