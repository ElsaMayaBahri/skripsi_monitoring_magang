import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { 
  ArrowLeft, 
  Save, 
  BookOpen, 
  Layers,
  Sparkles,
  Shield,
  AlertCircle,
  Edit3,
  Eye,
  Calendar,
  Clock,
  Target,
  Settings,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CheckCircle,
  X
} from "lucide-react"

function EditQuiz() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [quiz, setQuiz] = useState(null)
  const [quizIndex, setQuizIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [questionForm, setQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: null
  })

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("quiz")) || []
    
    // Cari berdasarkan index atau berdasarkan id
    let foundQuiz = null
    let foundIndex = null
    
    // Coba cari berdasarkan index (id sebagai number index)
    if (data[id]) {
      foundQuiz = data[id]
      foundIndex = id
    } else {
      // Coba cari berdasarkan property id
      for (let i = 0; i < data.length; i++) {
        if (data[i].id && data[i].id.toString() === id.toString()) {
          foundQuiz = data[i]
          foundIndex = i
          break
        }
      }
    }

    if (foundQuiz) {
      setQuiz(foundQuiz)
      setQuizIndex(foundIndex)
    } else {
      setError("Kuis tidak ditemukan")
    }
  }, [id])

  const handleChange = (e) => {
    setQuiz({
      ...quiz,
      [e.target.name]: e.target.value
    })
    if (error) setError("")
  }

  const toggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const handleAddQuestion = () => {
    if (!questionForm.question.trim()) {
      setError("Pertanyaan harus diisi")
      return
    }
    if (questionForm.options.some(opt => !opt.trim())) {
      setError("Semua pilihan jawaban harus diisi")
      return
    }
    if (questionForm.correct === null) {
      setError("Pilih jawaban yang benar")
      return
    }

    const newQuestion = {
      id: Date.now(),
      ...questionForm,
      correctLetter: String.fromCharCode(65 + questionForm.correct)
    }

    if (editingQuestion !== null) {
      const updatedQuestions = [...quiz.questions]
      updatedQuestions[editingQuestion] = newQuestion
      setQuiz({ ...quiz, questions: updatedQuestions })
      setEditingQuestion(null)
    } else {
      setQuiz({
        ...quiz,
        questions: [...(quiz.questions || []), newQuestion]
      })
    }

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
      setQuiz({ ...quiz, questions: updatedQuestions })
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

  const handleUpdate = () => {
    if (!quiz.title.trim()) {
      setError("Judul kuis harus diisi")
      return
    }
    if (!quiz.divisi) {
      setError("Divisi harus dipilih")
      return
    }

    setLoading(true)

    setTimeout(() => {
      const data = JSON.parse(localStorage.getItem("quiz")) || []
      data[quizIndex] = { ...quiz, updatedAt: new Date().toISOString() }
      localStorage.setItem("quiz", JSON.stringify(data))

      setLoading(false)
      navigate("/coo/quiz")
    }, 500)
  }

  const divisiOptions = [
    "CREATIVE TECHNOLOGY",
    "SCHOOL DESIGN",
    "FINANCE",
    "ENGINEERING",
    "FRAMES",
    "PPTX",
    "SOFT SKILL",
    "GENERAL"
  ]

  if (!quiz && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Memuat data kuis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
        <div className="p-5 lg:p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Kuis Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-6">{error}</p>
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
            <div className="p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-md">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                Edit Kuis
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Perbarui informasi dan pertanyaan kuis
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* ===== MAIN FORM CARD ===== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <BookOpen size={12} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Informasi Kuis</h3>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Judul Kuis <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    placeholder="Contoh: Quiz Laravel Basic - Batch 1 2024"
                    value={quiz?.title || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    placeholder="Deskripsi singkat tentang kuis ini..."
                    value={quiz?.deskripsi || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition resize-none"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-purple-100 rounded-lg">
                    <Settings size={12} className="text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Pengaturan</h3>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Divisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="divisi"
                    value={quiz?.divisi || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 bg-white"
                  >
                    <option value="">Pilih Divisi</option>
                    {divisiOptions.map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      <Clock size={12} className="inline mr-1" />
                      Durasi (menit)
                    </label>
                    <input
                      type="number"
                      name="durasi"
                      min="1"
                      max="180"
                      value={quiz?.durasi || 30}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      <Target size={12} className="inline mr-1" />
                      Passing Grade (%)
                    </label>
                    <input
                      type="number"
                      name="passing"
                      min="0"
                      max="100"
                      value={quiz?.passing || 75}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ===== QUESTIONS SECTION ===== */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-emerald-100 rounded-lg">
                    <Layers size={12} className="text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Daftar Pertanyaan</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {quiz?.questions?.length || 0} Soal
                  </span>
                </div>
                <button
                  onClick={() => {
                    resetQuestionForm()
                    setShowQuestionModal(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-xs font-medium shadow-sm hover:shadow-md transition"
                >
                  <Plus size={12} />
                  Tambah Soal
                </button>
              </div>

              {(!quiz?.questions || quiz.questions.length === 0) ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/30">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Layers size={20} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Belum ada pertanyaan</p>
                  <p className="text-xs text-slate-300">Tambahkan soal untuk kuis ini</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {quiz.questions.map((q, i) => (
                    <div key={q.id || i} className="bg-slate-50 rounded-xl overflow-hidden hover:bg-slate-100 transition border border-slate-100">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm">
                            {i + 1}
                          </div>
                          <p className="font-medium text-slate-700 text-sm flex-1 truncate">
                            {q.question.length > 60 ? q.question.substring(0, 60) + "..." : q.question}
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
                        <div className="p-3 border-t border-slate-100 bg-white space-y-2">
                          <p className="text-slate-700 text-sm">{q.question}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, idx) => (
                              <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                q.correct === idx ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'
                              }`}>
                                <span className={`font-medium w-5 ${q.correct === idx ? 'text-emerald-600' : 'text-slate-500'}`}>
                                  {String.fromCharCode(65 + idx)}.
                                </span>
                                <span className="text-slate-600 flex-1">{opt}</span>
                                {q.correct === idx && <CheckCircle size={12} className="text-emerald-500" />}
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

          {/* ===== BUTTONS ===== */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
            <button
              onClick={() => navigate("/coo/quiz")}
              className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 transition"
              disabled={loading}
            >
              Batal
            </button>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Update Kuis
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===== INFO BANNER ===== */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-500" />
            <p className="text-xs text-blue-700">
              <strong className="font-semibold">Tips:</strong> Perubahan akan langsung tersimpan. Pastikan semua data sudah benar sebelum menyimpan.
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
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
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
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
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
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-xs font-medium transition flex items-center gap-1"
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

export default EditQuiz