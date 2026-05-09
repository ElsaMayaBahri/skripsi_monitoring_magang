import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getPeserta, getMentors, getDivisi } from "../../api/admin/dashboardService"
import { getQuizDetail } from "../../api/coo/quizService"
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Calendar,
  Award,
  Sparkles,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Target,
  ChevronRight,
  CalendarRange,
  PlayCircle,
  Flag,
  Building2,
  Timer,
  Trophy,
  FileQuestion,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"

function QuizDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedQuestions, setExpandedQuestions] = useState({})
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const questionsPerPage = 10

  useEffect(() => {
    fetchQuizDetail()
  }, [id])

  const fetchQuizDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getQuizDetail(id)
      console.log("Quiz detail response:", response)
      
      if (response && response.success && response.data) {
        const data = response.data
        
        setQuiz({
          id: data.id_kuis || data.id,
          judul: data.judul || data.title || "Tanpa Judul",
          deskripsi: data.deskripsi || "",
          divisi: data.divisi || "Umum",
          durasi: data.durasi || 30,
          passing: data.passing_grade || data.passing || 75,
          total_soal: data.total_soal || data.questions?.length || 0,
          questions: data.questions || [],
          peserta: data.peserta_count || data.peserta || 0,
          created_at: data.created_at,
          status: data.status || "aktif",
          tanggal_mulai: data.tanggal_mulai || data.start_date || null,
          tanggal_selesai: data.tanggal_selesai || data.end_date || null
        })
      } else {
        setError("Kuis tidak ditemukan")
      }
    } catch (err) {
      console.error("Error fetching quiz detail:", err)
      setError(err.message || "Gagal mengambil detail kuis")
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "-"
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    } catch {
      return "-"
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "-"
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return "-"
    }
  }

  const getStatusBadge = (status) => {
    if (status === "aktif") {
      return { text: "Aktif", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle }
    } else if (status === "akan_datang") {
      return { text: "Akan Datang", color: "text-amber-600", bg: "bg-amber-50", icon: Clock }
    } else if (status === "selesai") {
      return { text: "Selesai", color: "text-slate-500", bg: "bg-slate-100", icon: Flag }
    } else {
      return { text: status || "Unknown", color: "text-slate-500", bg: "bg-slate-100", icon: XCircle }
    }
  }

  // Pagination logic
  const totalQuestions = quiz?.questions?.length || 0
  const totalPages = Math.ceil(totalQuestions / questionsPerPage)
  const startIndex = (currentPage - 1) * questionsPerPage
  const endIndex = startIndex + questionsPerPage
  const currentQuestions = quiz?.questions?.slice(startIndex, endIndex) || []

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    setExpandedQuestions({}) // Close all expanded questions when changing page
  }

  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(totalPages)
  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPrevPage = () => goToPage(currentPage - 1)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="text-slate-500 text-sm">Memuat detail kuis...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
        <div className="p-5 lg:p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Kuis Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-6">{error || "Kuis yang Anda cari tidak ada"}</p>
            <button
              onClick={() => navigate("/coo/quiz")}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-sm font-semibold"
            >
              Kembali ke Daftar Kuis
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(quiz.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-6xl mx-auto">
        
        {/* HEADER SECTION - Tanpa tombol kembali di atas */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Detail Kuis
              </h1>
              <p className="text-xs text-slate-500">Informasi lengkap tentang kuis</p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="space-y-6">
          
          {/* INFO CARD */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <div className="p-6">
              {/* Judul, Deskripsi, Status */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={18} className="text-blue-500" />
                    <h2 className="text-xl font-bold text-slate-800">{quiz.judul}</h2>
                  </div>
                  {quiz.deskripsi && (
                    <p className="text-slate-500 text-sm mt-2">{quiz.deskripsi}</p>
                  )}
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusBadge.bg}`}>
                  {statusBadge.icon && <statusBadge.icon size={14} className={statusBadge.color} />}
                  <span className={`text-xs font-medium ${statusBadge.color}`}>{statusBadge.text}</span>
                </div>
              </div>

              {/* Grid Info - 2 kolom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide">Divisi</span>
                  <span className="text-base font-semibold text-slate-800 mt-1">{quiz.divisi}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide">Durasi</span>
                  <span className="text-base font-semibold text-slate-800 mt-1">{quiz.durasi} menit</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide">Passing Grade</span>
                  <span className="text-base font-semibold text-slate-800 mt-1">{quiz.passing}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide">Total Soal</span>
                  <span className="text-base font-semibold text-slate-800 mt-1">{quiz.total_soal} soal</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide">Tanggal Mulai</span>
                  <span className="text-base font-semibold text-slate-800 mt-1">{formatDateTime(quiz.tanggal_mulai)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide">Tanggal Selesai</span>
                  <span className="text-base font-semibold text-slate-800 mt-1">{formatDateTime(quiz.tanggal_selesai)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide">Dibuat pada</span>
                  <span className="text-base font-semibold text-slate-800 mt-1">{formatDate(quiz.created_at)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide">Total Peserta</span>
                  <span className="text-base font-semibold text-slate-800 mt-1">{quiz.peserta} peserta</span>
                </div>
              </div>
            </div>
          </div>

          {/* STATS CARD - 3 kolom */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{quiz.total_soal}</p>
                  <p className="text-xs text-slate-500">Total Soal</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{quiz.peserta}</p>
                  <p className="text-xs text-slate-500">Total Peserta</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{quiz.passing}%</p>
                  <p className="text-xs text-slate-500">Passing Grade</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award size={18} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* QUESTIONS SECTION WITH PAGINATION */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-purple-600" />
                  <h3 className="font-semibold text-sm text-slate-800">Daftar Pertanyaan</h3>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {totalQuestions} Soal
                  </span>
                </div>
                {/* Info halaman */}
                {totalPages > 1 && (
                  <span className="text-[10px] text-slate-400">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4">
              {(!quiz.questions || quiz.questions.length === 0) ? (
                <div className="text-center py-8">
                  <FileText size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Belum ada pertanyaan</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {currentQuestions.map((q, i) => {
                      const actualIndex = startIndex + i
                      const questionId = q.id || actualIndex
                      const isExpanded = expandedQuestions[questionId] || false
                      
                      return (
                        <div key={questionId} className="border border-slate-100 rounded-lg overflow-hidden">
                          <div 
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition"
                            onClick={() => toggleExpand(questionId)}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <span className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                                {actualIndex + 1}
                              </span>
                              <p className="text-sm text-slate-700 flex-1 line-clamp-1">
                                {q.text || q.question || "Pertanyaan tidak valid"}
                              </p>
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                {q.correctLetter || String.fromCharCode(65 + (q.correct || 0))}
                              </span>
                            </div>
                            <ChevronRight size={14} className={`text-slate-400 transition-transform duration-200 ml-2 ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                          
                          {isExpanded && q && (
                            <div className="p-3 border-t border-slate-100 bg-slate-50/30">
                              <p className="text-sm text-slate-700 mb-2">{q.text || q.question}</p>
                              <div className="space-y-1">
                                {(q.options || []).map((opt, idx) => (
                                  <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                    q.correct === idx ? 'bg-emerald-50' : 'bg-white'
                                  }`}>
                                    <span className={`text-xs font-semibold w-5 ${q.correct === idx ? 'text-emerald-600' : 'text-slate-500'}`}>
                                      {String.fromCharCode(65 + idx)}.
                                    </span>
                                    <span className="text-xs text-slate-600 flex-1">{opt}</span>
                                    {q.correct === idx && <CheckCircle size={12} className="text-emerald-500" />}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* PAGINATION COMPONENT */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
                      <div className="text-[10px] text-slate-400">
                        Menampilkan {startIndex + 1} - {Math.min(endIndex, totalQuestions)} dari {totalQuestions} soal
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                          className={`p-1.5 rounded-lg transition ${
                            currentPage === 1 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <ChevronsLeft size={14} />
                        </button>
                        <button
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className={`p-1.5 rounded-lg transition ${
                            currentPage === 1 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        
                        {/* Page numbers */}
                        <div className="flex items-center gap-1 mx-1">
                          {(() => {
                            const pages = []
                            const maxVisible = 5
                            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                            let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                            
                            if (endPage - startPage + 1 < maxVisible) {
                              startPage = Math.max(1, endPage - maxVisible + 1)
                            }
                            
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(
                                <button
                                  key={i}
                                  onClick={() => goToPage(i)}
                                  className={`w-6 h-6 text-xs rounded-lg transition ${
                                    currentPage === i
                                      ? 'bg-blue-600 text-white'
                                      : 'text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {i}
                                </button>
                              )
                            }
                            return pages
                          })()}
                        </div>
                        
                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className={`p-1.5 rounded-lg transition ${
                            currentPage === totalPages 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <ChevronRight size={14} />
                        </button>
                        <button
                          onClick={goToLastPage}
                          disabled={currentPage === totalPages}
                          className={`p-1.5 rounded-lg transition ${
                            currentPage === totalPages 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <ChevronsRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ACTION BUTTON - Hanya tombol kembali di bawah */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate("/coo/quiz")}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 transition"
            >
              <ArrowLeft size={14} />
              Kembali ke Daftar Kuis
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default QuizDetail