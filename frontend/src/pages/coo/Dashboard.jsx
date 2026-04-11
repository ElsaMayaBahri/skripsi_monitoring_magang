function Dashboard() {
  return (
    <div className="min-h-screen flex bg-[#f5f7fb]">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r px-5 py-6 flex flex-col justify-between">
        
        {/* TOP */}
        <div>
          {/* LOGO */}
          <h2 className="text-lg font-bold text-gray-800 mb-8">
            Sistem Magang
          </h2>

          {/* MENU */}
          <ul className="space-y-1 text-sm">
            
            <li className="flex items-center gap-3 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-medium">
              <span>📊</span>
              Dashboard
            </li>

            <li className="flex items-center gap-3 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span>👤</span>
              Kelola Akun
            </li>

            <li className="flex items-center gap-3 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span>🎓</span>
              Peserta
            </li>

            <li className="flex items-center gap-3 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span>🧑‍🏫</span>
              Mentor
            </li>

            <li className="flex items-center gap-3 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span>🏢</span>
              Kelola Divisi
            </li>

            <li className="flex items-center gap-3 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span>📅</span>
              Presensi
            </li>

            <li className="flex items-center gap-3 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span>📚</span>
              Materi
            </li>

            <li className="flex items-center gap-3 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span>📝</span>
              Kuis
            </li>

            <li className="flex items-center gap-3 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <span>🎖️</span>
              Sertifikat
            </li>

          </ul>
        </div>

        {/* BOTTOM */}
        <div>
          <div className="flex items-center gap-3 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 cursor-pointer">
            <span>🚪</span>
            Logout
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Admin</span>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Peserta", value: "1,240" },
            { title: "Total Mentor", value: "3" },
            { title: "Total Divisi", value: "3" },
            { title: "Peserta Aktif", value: "30" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow-sm border"
            >
              <p className="text-sm text-gray-500">{item.title}</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Belum Absen Hari Ini
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-3">Nama Peserta</th>
                <th className="text-left">Divisi</th>
                <th className="text-left">Mentor</th>
                <th className="text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3">Ahmad Subarjo</td>
                <td>
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                    Engineering
                  </span>
                </td>
                <td>Arsyad</td>
                <td>
                  <button className="text-blue-600 hover:underline">
                    Ingatkan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default Dashboard