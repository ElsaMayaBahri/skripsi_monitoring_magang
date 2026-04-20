import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getQuiz, deleteQuiz } from "../../utils/storage"
import {
  Search,
  Plus,
  Trash2,
  File,
  Layers,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Users,
  Sparkles,
  Eye,
  Clock,
  Calendar,
  Shield,
  Edit3
} from "lucide-react"

function Quiz() {
  const [quiz, setQuiz] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const navigate = useNavigate()
  const perPage = 5

  useEffect(() => {
    loadQuizData()
  }, [])

  const loadQuizData = () => {
    let existingQuiz = getQuiz()
    
    if (existingQuiz.length === 0) {
      const dummyQuiz = [
        {
          id: 1,
          title: "Evaluasi Dasar Teknik Sipil",
          divisi: "ENGINEERING",
          questions: [
            { id: 1, text: "Apa itu struktur beton bertulang?", options: ["A", "B", "C", "D"], correct: 0 },
            { id: 2, text: "Jelaskan fungsi kolom dalam konstruksi", options: ["A", "B", "C", "D"], correct: 1 }
          ],
          duration: 30,
          participants: 45,
          createdAt: "2024-10-01T00:00:00.000Z"
        },
        {
          id: 2,
          title: "Pemahaman Visi & Misi Perusahaan",
          divisi: "GENERAL",
          questions: [
            { id: 1, text: "Apa visi perusahaan?", options: ["A", "B", "C", "D"], correct: 0 }
          ],
          duration: 15,
          participants: 52,
          createdAt: "2024-10-05T00:00:00.000Z"
        },
        {
          id: 3,
          title: "Manajemen Proyek Konstruksi",
          divisi: "ENGINEERING",
          questions: [
            { id: 1, text: "Apa itu Critical Path Method?", options: ["A", "B", "C", "D"], correct: 0 },
            { id: 2, text: "Jelaskan fungsi Gantt Chart", options: ["A", "B", "C", "D"], correct: 1 },
            { id: 3, text: "Apa perbedaan PERT dan CPM?", options: ["A", "B", "C", "D"], correct: 2 }
          ],
          duration: 25,
          participants: 38,
          createdAt: "2024-10-10T00:00:00.000Z"
        },
        {
          id: 4,
          title: "Komunikasi Efektif dalam Tim",
          divisi: "SOFT SKILL",
          questions: [
            { id: 1, text: "Apa itu active listening?", options: ["A", "B", "C", "D"], correct: 0 },
            { id: 2, text: "Sebutkan 3 hambatan komunikasi", options: ["A", "B", "C", "D"], correct: 1 }
          ],
          duration: 20,
          participants: 41,
          createdAt: "2024-10-15T00:00:00.000Z"
        },
        {
          id: 5,
          title: "Dasar-dasar Akuntansi",
          divisi: "FINANCE",
          questions: [
            { id: 1, text: "Apa itu debit dan kredit?", options: ["A", "B", "C", "D"], correct: 0 }
          ],
          duration: 30,
          participants: 35,
          createdAt: "2024-10-20T00:00:00.000Z"
        }
      ]
      
      localStorage.setItem("quiz", JSON.stringify(dummyQuiz))
      setQuiz(dummyQuiz)
    } else {
      // Pastikan setiap item punya createdAt
      const updatedQuiz = existingQuiz.map(q => {
        if (!q.createdAt) {
          return { ...q, createdAt: new Date().toISOString() }
        }
        return q
      })
      
      if (JSON.stringify(existingQuiz) !== JSON.stringify(updatedQuiz)) {
        localStorage.setItem("quiz", JSON.stringify(updatedQuiz))
      }
      
      setQuiz(updatedQuiz)
    }
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (!confirm("Yakin ingin menghapus kuis ini?")) return
    deleteQuiz(id)
    loadQuizData()
  }

  // 🔥 HANDLE EDIT - ARAH KE EDIT QUIZ
  const handleEdit = (id, e) => {
    e.stopPropagation()
    navigate(`/coo/edit-quiz/${id}`)
  }

  // 🔥 HANDLE VIEW DETAIL - ARAH KE QUIZ DETAIL
  const handleViewDetail = (id) => {
    navigate(`/coo/quiz/${id}`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia"
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Tanggal tidak valid"
      }
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    } catch (error) {
      return "Tanggal error"
    }
  }

  const filtered = quiz.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPage = Math.ceil(filtered.length / perPage)
  const currentData = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  )

  const totalQuiz = quiz.length
  const totalSoal = quiz.reduce(
    (acc, q) => acc + (q.questions?.length || 0),
    0
  )

  const isEmpty = currentData.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* ===== HEADER SECTION ===== */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Manajemen Kuis
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Kelola, pantau, dan optimalkan semua kuis
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari judul kuis..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-60 text-sm text-slate-700 shadow-sm"
                />
              </div>
              
              <button
                onClick={() => navigate("/coo/add-quiz")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Plus size={16} />
                Buat Kuis
              </button>
            </div>
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalQuiz}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Kuis</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Layers className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalSoal}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Soal</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* ===== TABLE SECTION ===== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kuis</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jumlah Soal</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal Dibuat</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isEmpty ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                          <File size="32" className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">Belum ada data kuis</p>
                        <button
                          onClick={() => navigate("/coo/add-quiz")}
                          className="flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:text-blue-700 transition"
                        >
                          <Plus size={14} />
                          Buat kuis pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentData.map((q, idx) => {
                    // Gunakan id jika ada, atau index jika tidak
                    const quizId = q.id !== undefined ? q.id : idx
                    return (
                      <tr
                        key={quizId}
                        className="hover:bg-slate-50/50 transition group cursor-pointer"
                      >
                        <td 
                          className="px-5 py-3 cursor-pointer"
                          onClick={() => handleViewDetail(quizId)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                              <File size={14} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition">
                                {q.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock size={9} />
                                  {q.duration || 30} menit
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Users size={9} />
                                  {q.participants || 0} peserta
                                </span>
                              </div>
                            </div>
                          </div>
                          </td>
                        <td 
                          className="px-5 py-3 cursor-pointer"
                          onClick={() => handleViewDetail(quizId)}
                        >
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                            <Users size={10} />
                            {q.divisi || "Umum"}
                          </span>
                          </td>
                        <td 
                          className="px-5 py-3 text-center cursor-pointer"
                          onClick={() => handleViewDetail(quizId)}
                        >
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg">
                            <span className="font-bold text-emerald-600 text-sm">
                              {q.questions?.length || 0}
                            </span>
                            <span className="text-[10px] text-emerald-500">soal</span>
                          </div>
                          </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            <span className="text-sm text-slate-500">
                              {formatDate(q.createdAt)}
                            </span>
                          </div>
                          </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* 🔥 Tombol Detail - Lihat */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(quizId);
                              }}
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                              title="Lihat Detail"
                            >
                              <Eye size={14} />
                            </button>
                            {/* 🔥 Tombol Edit - Arah ke EditQuiz */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(quizId, e);
                              }}
                              className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                              title="Edit Kuis"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(quizId, e);
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="Hapus Kuis"
                            >
                              <Trash2 size={14} />
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
        </div>

        {/* ===== PAGINATION ===== */}
        {!isEmpty && totalPage > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-2 rounded-xl border transition-all ${
                page === 1
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(totalPage, 5))].map((_, i) => {
                let pageNum = i + 1
                if (totalPage > 5 && page > 3) {
                  pageNum = page - 2 + i
                  if (pageNum > totalPage) return null
                }
                if (totalPage > 5 && page > 3 && i === 0 && pageNum > 2) {
                  return (
                    <span key="ellipsis1" className="px-2 text-slate-400 text-sm">...</span>
                  )
                }
                if (totalPage > 5 && page < totalPage - 2 && i === 3 && pageNum < totalPage - 1) {
                  return (
                    <span key="ellipsis2" className="px-2 text-slate-400 text-sm">...</span>
                  )
                }
                return (
                  <button
                    key={i}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-medium text-sm transition-all duration-200 ${
                      page === pageNum
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPage, page + 1))}
              disabled={page === totalPage}
              className={`p-2 rounded-xl border transition-all ${
                page === totalPage
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ===== INFO BANNER ===== */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-500" />
            <p className="text-xs text-blue-700">
              <strong className="font-semibold">Tips:</strong> Klik tombol <Eye size={10} className="inline" /> untuk melihat detail, <Edit3 size={10} className="inline" /> untuk edit, dan <Trash2 size={10} className="inline" /> untuk menghapus kuis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Quiz