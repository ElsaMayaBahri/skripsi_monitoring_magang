import { useState, useEffect } from "react"
import { getUsers } from "../../utils/storage"
import {
  Users,
  UserCheck,
  Building2,
  Activity
} from "lucide-react"

function DashboardCOO() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    setUsers(getUsers())
  }, [])

  const peserta = users.filter(u => u.role === "peserta")
  const mentor = users.filter(u => u.role === "mentor")

  const pesertaAktif = peserta.filter(u => u.status).length
  const totalDivisi = [...new Set(users.map(u => u.divisi))].length

  return (
    <div>

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Real-time overview of the internship ecosystem status.
        </p>
      </div>

      {/* 🔥 CARD PREMIUM */}
      <div className="grid grid-cols-4 gap-6 mb-8">

        <Card
          title="Total Peserta"
          value={peserta.length}
          icon={<Users size={20} />}
          color="blue"
        />

        <Card
          title="Total Mentor"
          value={mentor.length}
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
          title="Peserta Aktif"
          value={pesertaAktif}
          icon={<Activity size={20} />}
          color="blue"
        />

      </div>

      {/* 🔥 CHART + PROGRESS */}
      <div className="grid grid-cols-2 gap-6 mb-8">

        {/* PRESENSI */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2 text-gray-800">
            Presensi Hari Ini
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Data real-time kehadiran peserta
          </p>

          <div className="flex items-center gap-6">

            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              No Data
            </div>

            <div className="text-sm space-y-2 text-gray-600">
              <p>Hadir - 0%</p>
              <p>Absen - 0%</p>
              <p>Terlambat - 0%</p>
            </div>

          </div>
        </div>

        {/* PROGRESS */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold text-gray-800">
              Progres Kuis Kompetensi
            </h3>
            <span className="text-blue-500 text-xs cursor-pointer">
              Lihat Detail
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Status penyelesaian kuis
          </p>

          <Progress label="Selesai" value={0} />
          <Progress label="Dalam Proses" value={0} />
          <Progress label="Belum Mulai" value={0} />

        </div>

      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-4 text-gray-800">
          Belum Absen Hari Ini
        </h3>

        {peserta.length === 0 ? (
          <p className="text-sm text-gray-400">
            Belum ada data peserta
          </p>
        ) : (
          <table className="w-full text-sm">

            <thead>
              <tr className="text-gray-400 border-b text-xs uppercase tracking-wide">
                <th className="text-left py-3">Nama Peserta</th>
                <th className="text-center">Divisi</th>
                <th className="text-center">Mentor</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {peserta.slice(0, 5).map((u, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">

                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {u.initials || "U"}
                      </div>
                      <span className="font-medium text-gray-700">
                        {u.name}
                      </span>
                    </div>
                  </td>

                  <td className="text-center">
                    {u.divisi ? (
                      <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                        {u.divisi}
                      </span>
                    ) : "-"}
                  </td>

                  <td className="text-center text-gray-600">
                    {u.mentor || "-"}
                  </td>

                  <td className="text-center">
                    <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                      Ingatkan
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

    </div>
  )
}

export default DashboardCOO


// 🔥 CARD PREMIUM (ICON + PROGRESS)
function Card({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600"
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
        <div
          className={`h-1 rounded-full ${colors[color].split(" ")[0]}`}
          style={{ width: "60%" }}
        ></div>
      </div>

    </div>
  )
}


// 🔥 PROGRESS BAR
function Progress({ label, value }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1 text-gray-600">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full">
        <div
          className="h-2 bg-blue-500 rounded-full"
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  )
}