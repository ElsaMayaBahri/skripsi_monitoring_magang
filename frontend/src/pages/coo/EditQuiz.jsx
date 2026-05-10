import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "../../utils/api"
import { 
  ArrowLeft, 
  Save, 
  BookOpen, 
  Layers,
  Sparkles,
  Shield,
  AlertCircle,
  Edit3,
  Clock,
  Target,
  Settings,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CheckCircle,
  X,
  Loader2,
  Eye
} from "lucide-react"

function EditQuiz() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [quiz, setQuiz] = useState({
    id: null,
    judul: "",
    deskripsi: "",
    divisi: "",
    durasi: 30,
    passing: 75,
    questions: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [divisiList, setDivisiList] = useState([])
  const [loadingDivisi, setLoadingDivisi] = useState(true)
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState(null)
  
  const [questionForm, setQuestionForm] = useState({
    text: "",
    options: ["", "", "", ""],
    correct: null
  })

  useEffect(() => {
    fetchQuiz()
    fetchDivisi()
  }, [id])

  const fetchQuiz = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await api.getQuiz()
      
      let quizData = []
      if (response.success && response.data) {
        quizData = response.data
      } else if (Array.isArray(response)) {
        quizData = response
      } else if (response.data && Array.isArray(response.data)) {
        quizData = response.data
      }
      
      const foundQuiz = quizData.find(q => 
        q.id == id || q.id_kuis == id || q.id_quiz == id
      )
      
      if (foundQuiz) {
        const questions = Array.isArray(foundQuiz.questions) ? foundQuiz.questions : []
        
        setQuiz({
          id: foundQuiz.id || foundQuiz.id_kuis,
          judul: foundQuiz.judul || foundQuiz.title || foundQuiz.judul_kuis || "",
          deskripsi: foundQuiz.deskripsi || "",
          divisi: foundQuiz.divisi || "",
          durasi: foundQuiz.durasi || 30,
          passing: foundQuiz.passing || 75,
          questions: questions
        })
      } else {
        setError("Kuis tidak ditemukan")
      }
    } catch (err) {
      console.error("Error fetching quiz:", err)
      setError(err.message || "Gagal mengambil data kuis")
    } finally {
      setLoading(false)
    }
  }

  const fetchDivisi = async () => {
    setLoadingDivisi(true)
    try {
      const response = await api.getDivisi()
      let divisiData = []
      if (response.success && response.data) {
        divisiData = response.data
      } else if (Array.isArray(response)) {
        divisiData = response
      } else if (response.data && Array.isArray(response.data)) {
        divisiData = response.data
      }
      setDivisiList(divisiData)
    } catch (err) {
      console.error("Error fetching divisi:", err)
    } finally {
      setLoadingDivisi(false)
    }
  }

  const handleChange = (e) => {
    setQuiz(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    if (error) setError("")
  }

  const toggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const handleAddQuestion = () => {
    if (!questionForm.text.trim()) {
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
      text: questionForm.text,
      options: [...questionForm.options],
      correct: questionForm.correct,
      correctLetter: String.fromCharCode(65 + questionForm.correct)
    }

    if (editingQuestion !== null) {
      const updatedQuestions = [...quiz.questions]
      updatedQuestions[editingQuestion] = newQuestion
      setQuiz(prev => ({ ...prev, questions: updatedQuestions }))
    } else {
      setQuiz(prev => ({ 
        ...prev, 
        questions: [...(prev.questions || []), newQuestion] 
      }))
    }

    resetQuestionForm()
    setShowQuestionModal(false)
  }

  const handleEditQuestion = (index) => {
    const q = quiz.questions[index]
    if (q) {
      setQuestionForm({
        text: q.text || "",
        options: q.options ? [...q.options] : ["", "", "", ""],
        correct: q.correct !== undefined ? q.correct : null
      })
      setEditingQuestion(index)
      setShowQuestionModal(true)
    }
  }

  const handleDeleteQuestion = (index) => {
    setDeleteIndex(index)
    setShowConfirmDeleteModal(true)
  }

  const confirmDeleteQuestion = () => {
    if (deleteIndex !== null) {
      const updatedQuestions = quiz.questions.filter((_, i) => i !== deleteIndex)
      setQuiz(prev => ({ ...prev, questions: updatedQuestions }))
      setShowConfirmDeleteModal(false)
      setDeleteIndex(null)
    }
  }

  const resetQuestionForm = () => {
    setQuestionForm({
      text: "",
      options: ["", "", "", ""],
      correct: null
    })
    setEditingQuestion(null)
  }

  const handleUpdate = async () => {
    if (!quiz.judul || !quiz.judul.trim()) {
      setError("Judul kuis harus diisi")
      return
    }
    if (!quiz.divisi) {
      setError("Divisi harus dipilih")
      return
    }

    setSaving(true)
    setError("")

    try {
      const formData = {
        judul: quiz.judul,
        deskripsi: quiz.deskripsi || "",
        divisi: quiz.divisi,
        durasi: quiz.durasi,
        passing: quiz.passing,
        questions: (quiz.questions || []).map(q => ({
          text: q.text,
          options: q.options,
          correct: q.correct
        })),
        total_soal: (quiz.questions || []).length
      }

      const response = await api.updateQuiz(quiz.id, formData)
      
      if (response.success) {
        setShowSuccessModal(true)
      } else {
        setError(response.message || "Gagal mengupdate kuis")
      }
    } catch (err) {
      console.error("Error updating quiz:", err)
      setError(err.message || "Terjadi kesalahan saat mengupdate kuis")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={20} className="text-purple-500 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-500 text-sm">Memuat data kuis...</p>
        </div>
      </div>
    )
  }

  if (error && !quiz.judul) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 p-5 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertCircle size={36} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Kuis Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button
              onClick={() => navigate("/coo/quiz")}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
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
        
        {/* SUCCESS MODAL - PREMIUM */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="relative">
                {/* Animated confetti effect */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-t-2xl animate-pulse"></div>
                
                {/* Success Icon */}
                <div className="pt-8 pb-4 text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-ping"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg transform transition-transform duration-300 animate-bounce-in">
                      <CheckCircle size={48} className="text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="px-6 pb-6 text-center">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Update Berhasil!</h3>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-4"></div>
                  <p className="text-slate-500 text-sm mb-2">
                    Kuis telah berhasil diperbarui.
                  </p>
                  <p className="text-slate-400 text-xs">
                    Perubahan pada kuis ini telah tersimpan.
                  </p>
                </div>
                
                {/* Buttons */}
                <div className="px-6 pb-8 flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/coo/quiz")}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Lihat Daftar Kuis
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all duration-200"
                  >
                    Tetap di Halaman Ini
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL - PREMIUM */}
        {showConfirmDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-t-2xl"></div>
                <div className="px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                      <Trash2 size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Hapus Soal</h3>
                      <p className="text-xs text-slate-400">Konfirmasi penghapusan soal</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                  <p className="text-slate-700 font-semibold mb-1">
                    Apakah Anda yakin?
                  </p>
                  <p className="text-sm text-slate-500">
                    Soal ini akan dihapus secara permanen. 
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowConfirmDeleteModal(false)
                    setDeleteIndex(null)
                  }}
                  className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white transition"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteQuestion}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* HEADER SECTION */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-md">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                Edit Kuis
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Perbarui informasi dan pertanyaan kuis
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={16} className="text-red-500" />
            </div>
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={() => setError("")} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition">
              <X size={14} />
            </button>
          </div>
        )}

        {/* MAIN FORM CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
          
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <BookOpen size={12} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Informasi Kuis</h3>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Judul Kuis <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="judul"
                    placeholder="Contoh: Quiz Laravel Basic - Batch 1 2024"
                    value={quiz.judul || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    placeholder="Deskripsi singkat tentang kuis ini..."
                    value={quiz.deskripsi || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition resize-none"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Settings size={12} className="text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Pengaturan</h3>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Divisi <span className="text-red-500">*</span>
                  </label>
                  {loadingDivisi ? (
                    <div className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-slate-400" />
                      <span className="text-sm text-slate-400">Memuat divisi...</span>
                    </div>
                  ) : (
                    <select
                      name="divisi"
                      value={quiz.divisi || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 bg-white"
                    >
                      <option value="">Pilih Divisi</option>
                      {divisiList.map((div) => (
                        <option key={div.id_divisi || div.id} value={div.nama_divisi || div.nama}>
                          {div.nama_divisi || div.nama}
                        </option>
                      ))}
                    </select>
                  )}
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
                      value={quiz.durasi || 30}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
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
                      value={quiz.passing || 75}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QUESTIONS SECTION */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <Layers size={12} className="text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Daftar Pertanyaan</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {quiz.questions?.length || 0} Soal
                  </span>
                </div>
                <button
                  onClick={() => {
                    resetQuestionForm()
                    setShowQuestionModal(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-xs font-semibold shadow-md hover:shadow-lg transition"
                >
                  <Plus size={12} />
                  Tambah Soal
                </button>
              </div>

              {(!quiz.questions || quiz.questions.length === 0) ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/30">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Layers size={20} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Belum ada pertanyaan</p>
                  <p className="text-xs text-slate-300">Tambahkan soal untuk kuis ini</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {quiz.questions.map((q, i) => {
                    const questionId = q?.id || i
                    const isExpanded = expandedQuestions[questionId] || false
                    
                    return (
                      <div key={questionId} className="bg-slate-50 rounded-xl overflow-hidden hover:bg-slate-100 transition border border-slate-100">
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm flex-shrink-0">
                              {i + 1}
                            </div>
                            <p className="font-medium text-slate-700 text-sm flex-1 truncate">
                              {q?.text?.length > 60 ? q.text.substring(0, 60) + "..." : q.text || "Pertanyaan tidak valid"}
                            </p>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                              Jawab: {q?.correctLetter || String.fromCharCode(65 + (q?.correct || 0))}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                            <button
                              onClick={() => toggleExpand(questionId)}
                              className="p-1.5 hover:bg-white rounded-lg transition"
                            >
                              {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
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
                        
                        {isExpanded && q && (
                          <div className="p-3 border-t border-slate-100 bg-white space-y-2">
                            <p className="text-slate-700 text-sm">{q.text || "Pertanyaan tidak valid"}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {q.options && q.options.map((opt, idx) => (
                                <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                  q.correct === idx ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'
                                }`}>
                                  <span className={`font-medium w-5 flex-shrink-0 ${q.correct === idx ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    {String.fromCharCode(65 + idx)}.
                                  </span>
                                  <span className="text-slate-600 flex-1 truncate">{opt}</span>
                                  {q.correct === idx && <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />}
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

          {/* BUTTONS */}
          <div className="px-6 lg:px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
            <button
              onClick={() => navigate("/coo/quiz")}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 transition"
              disabled={saving}
            >
              Batal
            </button>

            <button
              onClick={handleUpdate}
              disabled={saving}
              className="px-7 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </div>

        {/* INFO BANNER */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-blue-600" />
            </div>
            <p className="text-xs text-blue-700">
              <strong className="font-semibold">Tips:</strong> Perubahan akan langsung tersimpan. Pastikan semua data sudah benar sebelum menyimpan.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT SOAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                  {editingQuestion !== null ? <Edit3 size={14} className="text-white" /> : <Plus size={14} className="text-white" />}
                </div>
                <h3 className="font-semibold text-slate-800">
                  {editingQuestion !== null ? "Edit Soal" : "Tambah Soal Baru"}
                </h3>
              </div>
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
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Pertanyaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Masukkan pertanyaan di sini..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 resize-none"
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Pilihan Jawaban <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {questionForm.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-xs font-medium flex-shrink-0">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <input
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
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
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition flex-shrink-0 ${
                          questionForm.correct === i
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"
                        }`}
                      >
                        <CheckCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                  <AlertCircle size={10} />
                  Klik tombol centang hijau untuk menandai jawaban benar
                </p>
              </div>
            </div>
            
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowQuestionModal(false)
                  resetQuestionForm()
                }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 text-xs font-medium hover:bg-white transition"
              >
                Batal
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white text-xs font-semibold shadow-md hover:shadow-lg transition flex items-center gap-1.5"
              >
                <Save size={12} />
                {editingQuestion !== null ? "Update Soal" : "Simpan Soal"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
        .fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .zoom-in-95 {
          animation: zoomIn 0.2s ease-out;
        }
        .bounce-in {
          animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default EditQuiz