import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getQuiz, updateQuiz } from "../../utils/storage"
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  BarChart3, 
  Clock, 
  Target,
  Plus,
  Trash2,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Save,
  X
} from "lucide-react"

function QuizDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [questionForm, setQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: null
  })

  useEffect(() => {
    // Cari berdasarkan id atau index
    const allQuiz = getQuiz()
    let foundQuiz = null
    
    // Coba cari berdasarkan property id
    foundQuiz = allQuiz.find(q => q.id && q.id.toString() === id.toString())
    
    // Jika tidak ditemukan, coba berdasarkan index
    if (!foundQuiz && allQuiz[id]) {
      foundQuiz = allQuiz[id]
    }
    
    setQuiz(foundQuiz)
    setLoading(false)
  }, [id])

  const toggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const handleAddQuestion = () => {
    if (!questionForm.question.trim()) {
      alert("Pertanyaan harus diisi")
      return
    }
    if (questionForm.options.some(opt => !opt.trim())) {
      alert("Semua pilihan jawaban harus diisi")
      return
    }
    if (questionForm.correct === null) {
      alert("Pilih jawaban yang benar")
      return
    }

    const newQuestion = {
      id: Date.now(),
      ...questionForm,
      correctLetter: String.fromCharCode(65 + questionForm.correct)
    }

    let updatedQuestions
    if (editingQuestion !== null) {
      updatedQuestions = [...quiz.questions]
      updatedQuestions[editingQuestion] = newQuestion
    } else {
      updatedQuestions = [...(quiz.questions || []), newQuestion]
    }

    const updatedQuiz = { ...quiz, questions: updatedQuestions }
    setQuiz(updatedQuiz)
    updateQuiz(id, updatedQuiz)

    resetQuestionForm()
    setShowQuestionModal(false)
  }

  const handleEditQuestion = (index) => {
    const q = quiz.questions[index]
    setQuestionForm({
      question: q.question,
      options: [...q.options],
      correct: q.correct
    })
    setEditingQuestion(index)
    setShowQuestionModal(true)
  }

  const handleDeleteQuestion = (index) => {
    if (window.confirm("Yakin ingin menghapus soal ini?")) {
      const updatedQuestions = quiz.questions.filter((_, i) => i !== index)
      const updatedQuiz = { ...quiz, questions: updatedQuestions }
      setQuiz(updatedQuiz)
      updateQuiz(id, updatedQuiz)
    }
  }

  const resetQuestionForm = () => {
    setQuestionForm({
      question: "",
      options: ["", "", "", ""],
      correct: null
    })
    setEditingQuestion(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Memuat detail kuis...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
        <div className="p-5 lg:p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Kuis Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-6">Kuis yang Anda cari tidak tersedia</p>
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

  const totalSoal = quiz.questions?.length || 0
  const totalPeserta = quiz.participants || 0
  const passingGrade = quiz.passing || 75

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-5xl mx-auto">
        
        {/* ===== HEADER SECTION ===== */}
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
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Detail Kuis
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Lihat informasi lengkap dan kelola pertanyaan kuis
              </p>
            </div>
          </div>
        </div>

        {/* ===== INFO CARD ===== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="relative h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div className="p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">{quiz.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                    <Layers size={12} />
                    {quiz.divisi || "Umum"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium">
                    <Clock size={12} />
                    {quiz.durasi || 30} menit
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium">
                    <Target size={12} />
                    Passing: {passingGrade}%
                  </span>
                </div>
                {quiz.deskripsi && (
                  <p className="text-slate-500 text-sm mt-3">{quiz.deskripsi}</p>
                )}
              </div>
              <button
                onClick={() => navigate(`/coo/edit-quiz/${id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
              >
                <Edit3 size={14} />
                Edit Kuis
              </button>
            </div>
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalSoal}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Soal</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalPeserta}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Peserta</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users size={18} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">-</p>
                <p className="text-xs text-slate-500 mt-0.5">Rata-rata Nilai</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 size={18} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ===== QUESTIONS SECTION ===== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Daftar Pertanyaan</h3>
                <p className="text-xs text-slate-400">Kelola soal untuk kuis ini</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetQuestionForm()
                setShowQuestionModal(true)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-xs font-medium shadow-sm hover:shadow-md transition"
            >
              <Plus size={12} />
              Tambah Soal
            </button>
          </div>
          
          <div className="p-5">
            {totalSoal === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center bg-slate-50/30">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Layers size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm mb-2">Belum ada pertanyaan</p>
                <p className="text-xs text-slate-300 mb-4">Tambahkan soal untuk kuis ini</p>
                <button
                  onClick={() => {
                    resetQuestionForm()
                    setShowQuestionModal(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-sm font-medium mx-auto"
                >
                  <Plus size={14} />
                  Tambah Soal Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {quiz.questions.map((q, i) => (
                  <div key={q.id || i} className="bg-slate-50 rounded-xl overflow-hidden hover:bg-slate-100 transition border border-slate-100">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm">
                          {i + 1}
                        </div>
                        <p className="font-medium text-slate-700 text-sm flex-1">
                          {q.question}
                        </p>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Jawab: {q.correctLetter}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <button
                          onClick={() => toggleExpand(q.id || i)}
                          className="p-1.5 hover:bg-white rounded-lg transition"
                        >
                          {expandedQuestions[q.id || i] ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                        </button>
                        <button
                          onClick={() => handleEditQuestion(i)}
                          className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(i)}
                          className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {expandedQuestions[q.id || i] && (
                      <div className="p-4 border-t border-slate-100 bg-white space-y-3">
                        <p className="text-slate-700 text-sm">{q.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options.map((opt, idx) => (
                            <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== INFO BANNER ===== */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-500" />
            <p className="text-xs text-blue-700">
              <strong className="font-semibold">Tips:</strong> Klik tombol ✏️ untuk mengedit soal, 🗑️ untuk menghapus, dan klik panah untuk melihat pilihan jawaban.
            </p>
          </div>
        </div>
      </div>

      {/* ===== MODAL TAMBAH/EDIT SOAL ===== */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white px-5 py-3 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">
                {editingQuestion !== null ? "Edit Soal" : "Tambah Soal Baru"}
              </h3>
              <button
                onClick={() => {
                  setShowQuestionModal(false)
                  resetQuestionForm()
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Pertanyaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Masukkan pertanyaan di sini..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Pilihan Jawaban <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {questionForm.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-xs font-medium">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <input
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        placeholder={`Jawaban ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpt = [...questionForm.options]
                          newOpt[i] = e.target.value
                          setQuestionForm({ ...questionForm, options: newOpt })
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setQuestionForm({ ...questionForm, correct: i })}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                          questionForm.correct === i
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"
                        }`}
                      >
                        <CheckCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowQuestionModal(false)
                  resetQuestionForm()
                }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-white transition"
              >
                Batal
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-xs font-medium transition flex items-center gap-1"
              >
                <Save size={12} />
                {editingQuestion !== null ? "Update" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizDetail