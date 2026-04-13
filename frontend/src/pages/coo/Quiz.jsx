import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getQuiz, deleteQuiz } from "../../utils/storage"
import {
  Search,
  Plus,
  Trash2,
  File
} from "lucide-react"

function Quiz() {
  const [quiz, setQuiz] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const navigate = useNavigate()
  const perPage = 5

  useEffect(() => {
    setQuiz(getQuiz())
  }, [])

  const handleDelete = (id) => {
    if (!confirm("Yakin hapus kuis?")) return
    deleteQuiz(id)
    setQuiz(getQuiz())
  }

  // 🔍 FILTER
  const filtered = quiz.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase())
  )

  // 📄 PAGINATION
  const totalPage = Math.ceil(filtered.length / perPage)
  const currentData = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  )

  // 📊 STAT
  const totalQuiz = quiz.length
  const totalSoal = quiz.reduce(
    (acc, q) => acc + (q.questions?.length || 0),
    0
  )

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            MANAJEMEN KUIS
          </h1>
          <p className="text-sm text-gray-500">
            Kelola dan Pantau Kuis Secara Real Time
          </p>
        </div>

        <button
          onClick={() => navigate("/coo/add-quiz")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Tambah Kuis
        </button>
      </div>

      {/* 🔥 STAT CARD */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Total Kuis</p>
          <h2 className="text-2xl font-bold text-blue-600">
            {totalQuiz}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Total Soal</p>
          <h2 className="text-2xl font-bold text-green-600">
            {totalSoal}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Status</p>
          <h2 className="text-2xl font-bold text-purple-600">
            Aktif
          </h2>
        </div>

      </div>

      {/* SEARCH */}
      <div className="flex items-center bg-white border rounded-lg px-3 max-w-md">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Cari judul kuis..."
          className="w-full px-2 py-2 text-sm outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-500">
            <tr className="text-center">
              <th className="py-3">Judul</th>
              <th>Divisi</th>
              <th>Jumlah Soal</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>

            {currentData.length === 0 && (
              <tr>
                <td colSpan="5" className="py-10 text-gray-400 text-center">
                  Tidak ada data
                </td>
              </tr>
            )}

            {currentData.map((q) => (
              <tr
                key={q.id}
                className="border-t text-center hover:bg-gray-50 cursor-pointer transition"
                onClick={() => navigate(`/coo/quiz/${q.id}`)}
              >

                {/* JUDUL */}
                <td className="py-4 font-medium text-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <File size={16} className="text-gray-400" />
                    {q.title}
                  </div>
                </td>

                {/* DIVISI */}
                <td>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                    {q.divisi || "-"}
                  </span>
                </td>

                {/* JUMLAH SOAL */}
                <td>{q.questions?.length || 0}</td>

                {/* TANGGAL */}
                <td className="text-gray-500 text-xs">
                  {q.createdAt
                    ? new Date(q.createdAt).toLocaleDateString()
                    : "-"
                  }
                </td>

                {/* AKSI */}
                <td
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* 🔥 PAGINATION */}
      <div className="flex justify-center gap-2">

        {[...Array(totalPage)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded text-sm ${
              page === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}

      </div>

    </div>
  )
}

export default Quiz