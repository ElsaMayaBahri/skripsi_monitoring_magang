import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "../../utils/api"
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
  Star,
  BarChart3,
  ChevronRight,
  Edit3  // 🔥 TAMBAHKAN INI
} from "lucide-react"

function QuizDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedQuestions, setExpandedQuestions] = useState({})

  useEffect(() => {
    fetchQuizDetail()
  }, [id])

  const fetchQuizDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.getQuiz()
      console.log("Quiz response:", response)
      
      let quizData = []
      if (response && response.success && response.data) {
        quizData = response.data
      } else if (response && response.data && Array.isArray(response.data)) {
        quizData = response.data
      } else if (Array.isArray(response)) {
        quizData = response
      }
      
      // Cari quiz berdasarkan ID
      const foundQuiz = quizData.find(q => 
        q.id == id || q.id_kuis == id || q.id_quiz == id
      )
      
      if (foundQuiz) {
        // Transform data ke format yang konsisten
        setQuiz({
          id: foundQuiz.id || foundQuiz.id_kuis,
          judul: foundQuiz.judul || foundQuiz.title || foundQuiz.judul_kuis || "Tanpa Judul",
          deskripsi: foundQuiz.deskripsi || "",
          divisi: foundQuiz.divisi || "Umum",
          durasi: foundQuiz.durasi || 30,
          passing: foundQuiz.passing || 75,
          total_soal: foundQuiz.total_soal || foundQuiz.questions?.length || 0,
          questions: foundQuiz.questions || [],
          peserta: foundQuiz.peserta || 0,
          created_at: foundQuiz.created_at || foundQuiz.createdAt,
          status: foundQuiz.status || "aktif"
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
    if (!dateString) return "Tanggal tidak tersedia"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Tanggal tidak valid"
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    } catch {
      return "Tanggal error"
    }
  }

  const getStatusBadge = (status) => {
    if (status === "aktif") {
      return { text: "Aktif", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle }
    } else if (status === "akan_datang") {
      return { text: "Akan Datang", color: "text-amber-600", bg: "bg-amber-50", icon: Clock }
    } else {
      return { text: "Selesai", color: "text-slate-500", bg: "bg-slate-100", icon: XCircle }
    }
  }

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
        
        {/* HEADER SECTION */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/coo/quiz")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 mb-3 transition text-sm"
          >
            <ArrowLeft size={14} />
            Kembali ke Daftar Kuis
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Detail Kuis
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Informasi lengkap tentang kuis
              </p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="space-y-6">
          
          {/* INFO CARD */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Divisi</p>
                    <p className="text-sm font-medium text-slate-700">{quiz.divisi}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Clock size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Durasi</p>
                    <p className="text-sm font-medium text-slate-700">{quiz.durasi} menit</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target size={14} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Passing Grade</p>
                    <p className="text-sm font-medium text-slate-700">{quiz.passing}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Calendar size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Dibuat</p>
                    <p className="text-sm font-medium text-slate-700">{formatDate(quiz.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS CARD */}
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

          {/* QUESTIONS SECTION */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <BookOpen size={14} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-800">Daftar Pertanyaan</h3>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                  {quiz.questions?.length || 0} Soal
                </span>
              </div>
            </div>

            <div className="p-5">
              {(!quiz.questions || quiz.questions.length === 0) ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center bg-slate-50/30">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={28} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Belum ada pertanyaan</p>
                  <p className="text-xs text-slate-300">Kuis ini belum memiliki soal</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quiz.questions.map((q, i) => {
                    const questionId = q.id || i
                    const isExpanded = expandedQuestions[questionId] || false
                    
                    return (
                      <div key={questionId} className="bg-slate-50 rounded-xl overflow-hidden hover:bg-slate-100 transition border border-slate-100">
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer"
                          onClick={() => toggleExpand(questionId)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm">
                              {i + 1}
                            </div>
                            <p className="font-medium text-slate-700 text-sm flex-1">
                              {q.text || q.question || "Pertanyaan tidak valid"}
                            </p>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              Jawab: {q.correctLetter || String.fromCharCode(65 + (q.correct || 0))}
                            </span>
                          </div>
                          <div className="ml-3">
                            {isExpanded ? <ChevronRight size={16} className="text-slate-400 rotate-90" /> : <ChevronRight size={16} className="text-slate-400" />}
                          </div>
                        </div>
                        
                        {isExpanded && q && (
                          <div className="p-4 border-t border-slate-100 bg-white space-y-3">
                            <p className="text-slate-700 text-sm">{q.text || q.question}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(q.options || []).map((opt, idx) => (
                                <div key={idx} className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                                  q.correct === idx ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'
                                }`}>
                                  <span className={`font-medium w-6 ${q.correct === idx ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    {String.fromCharCode(65 + idx)}.
                                  </span>
                                  <span className="text-slate-600 flex-1">{opt}</span>
                                  {q.correct === idx && <CheckCircle size={14} className="text-emerald-500" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate("/coo/quiz")}
              className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 transition"
            >
              Kembali
            </button>
            <button
              onClick={() => navigate(`/coo/edit-quiz/${quiz.id}`)}
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Edit3 size={14} />
              Edit Kuis
            </button>
          </div>

          {/* INFO BANNER */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-blue-500" />
              <p className="text-xs text-blue-700">
                <strong className="font-semibold">Informasi:</strong> Klik pada pertanyaan untuk melihat pilihan jawaban.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizDetail