import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { addQuiz } from "../../utils/storage"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Clock,
  Target,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  HelpCircle,
  FileText,
  Settings,
  ListChecks,
  Zap,
  Sparkles,
  Trophy,
  Layers,
  Shield,
  Calendar,
  Users,
  Award,
  Star,
  Rocket,
  Gem,
  Crown
} from "lucide-react"

function AddQuiz() {
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [mode, setMode] = useState("manual")
  const [showModal, setShowModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [expandedQuestions, setExpandedQuestions] = useState({})

  const [quiz, setQuiz] = useState({
    id: Date.now().toString(),
    title: "",
    divisi: "",
    deskripsi: "",
    durasi: 60,
    passing: 75,
    questions: []
  })

  const [qForm, setQForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: null
  })

  const toggleExpand = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleAddQuestion = () => {
    if (!qForm.question.trim()) {
      alert("Pertanyaan harus diisi")
      return
    }
    if (qForm.options.some(opt => !opt.trim())) {
      alert("Semua pilihan jawaban harus diisi")
      return
    }
    if (qForm.correct === null) {
      alert("Pilih jawaban yang benar")
      return
    }

    const newQ = { 
      id: Date.now(), 
      ...qForm,
      correctLetter: String.fromCharCode(65 + qForm.correct)
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...quiz.questions]
      updatedQuestions[editingIndex] = newQ
      setQuiz({ ...quiz, questions: updatedQuestions })
      setEditingIndex(null)
    } else {
      setQuiz({
        ...quiz,
        questions: [...quiz.questions, newQ]
      })
    }

    setQForm({
      question: "",
      options: ["", "", "", ""],
      correct: null
    })

    setShowModal(false)
  }

  const handleEditQuestion = (index) => {
    const q = quiz.questions[index]
    setQForm({
      question: q.question,
      options: [...q.options],
      correct: q.correct
    })
    setEditingIndex(index)
    setShowModal(true)
  }

  const handleDeleteQuestion = (index) => {
    if (window.confirm("Yakin ingin menghapus soal ini?")) {
      const updatedQuestions = quiz.questions.filter((_, i) => i !== index)
      setQuiz({ ...quiz, questions: updatedQuestions })
    }
  }

  const handleNextStep = () => {
    if (!quiz.title.trim()) {
      alert("Judul kuis harus diisi")
      return
    }
    if (!quiz.divisi) {
      alert("Pilih divisi")
      return
    }
    setCurrentStep(2)
  }

  const handlePrevStep = () => {
    setCurrentStep(1)
  }

  const handleSubmit = () => {
    if (quiz.questions.length === 0) {
      alert("Minimal 1 soal harus ditambahkan")
      return
    }
    
    addQuiz(quiz)
    navigate("/coo/quiz")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Buat Kuis Baru
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Rancang kuis interaktif untuk mengukur kompetensi peserta
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/coo/quiz")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
          </div>
        </div>

        {/* STEP PROGRESS */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex">
              <div className={`flex-1 flex items-center gap-3 px-5 py-4 transition-all duration-300 ${
                currentStep === 1 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-500' 
                  : currentStep > 1 
                    ? 'border-b-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50'
                    : 'border-b-2 border-transparent'
              }`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 shadow-sm ${
                  currentStep === 1 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-200' 
                    : currentStep > 1 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200'
                      : 'bg-slate-100'
                }`}>
                  {currentStep > 1 ? (
                    <CheckCircle size={18} className="text-white" />
                  ) : (
                    <span className={`text-sm font-bold ${currentStep === 1 ? 'text-white' : 'text-slate-400'}`}>1</span>
                  )}
                </div>
                <div>
                  <p className={`text-[10px] font-semibold tracking-wide ${currentStep === 1 ? 'text-blue-600' : currentStep > 1 ? 'text-emerald-600' : 'text-slate-400'}`}>LANGKAH 1</p>
                  <p className={`text-sm font-semibold ${currentStep === 1 ? 'text-slate-800' : currentStep > 1 ? 'text-slate-700' : 'text-slate-400'}`}>Detail Kuis</p>
                </div>
              </div>

              <div className={`flex-1 flex items-center gap-3 px-5 py-4 transition-all duration-300 ${
                currentStep === 2 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-500' 
                  : 'border-b-2 border-transparent'
              }`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 shadow-sm ${
                  currentStep === 2 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-200' 
                    : 'bg-slate-100'
                }`}>
                  <span className={`text-sm font-bold ${currentStep === 2 ? 'text-white' : 'text-slate-400'}`}>2</span>
                </div>
                <div>
                  <p className={`text-[10px] font-semibold tracking-wide ${currentStep === 2 ? 'text-blue-600' : 'text-slate-400'}`}>LANGKAH 2</p>
                  <p className={`text-sm font-semibold ${currentStep === 2 ? 'text-slate-800' : 'text-slate-400'}`}>Daftar Pertanyaan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: DETAIL KUIS */}
        {currentStep === 1 && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="relative h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Informasi Dasar Kuis</h3>
                      <p className="text-xs text-slate-400">Isi informasi berikut dengan lengkap</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Judul Kuis <span className="text-red-500">*</span></label>
                      <input placeholder="Contoh: Quiz Laravel Basic - Batch 1 2024" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition" onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} />
                      <p className="text-[10px] text-slate-400 mt-1">Gunakan judul yang jelas dan mudah dipahami</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Divisi <span className="text-red-500">*</span></label>
                        <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white" onChange={(e) => setQuiz({ ...quiz, divisi: e.target.value })}>
                          <option value="">Pilih Divisi</option>
                          <option>CREATIVE TECHNOLOGY</option>
                          <option>SCHOOL DESIGN</option>
                          <option>FINANCE</option>
                          <option>ENGINEERING</option>
                          <option>FRAMES</option>
                          <option>PPTX</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Deskripsi</label>
                        <textarea placeholder="Deskripsi singkat tentang kuis ini..." rows={1} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none" onChange={(e) => setQuiz({ ...quiz, deskripsi: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg"><HelpCircle className="w-4 h-4 text-blue-600" /></div>
                  <div><p className="text-xs font-semibold text-blue-800">Panduan Cepat</p><p className="text-[10px] text-blue-600 mt-1">• Gunakan judul yang spesifik dan mudah diingat<br/>• Pilih divisi yang sesuai dengan materi kuis<br/>• Tentukan durasi dan passing grade yang realistis</p></div>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden sticky top-6">
                <div className="relative h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-md"><Settings className="w-4 h-4 text-white" /></div>
                    <div><h3 className="font-bold text-slate-800">Pengaturan Kuis</h3><p className="text-xs text-slate-400">Atur durasi dan standar kelulusan</p></div>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-xs font-medium text-slate-600 mb-1.5"><Clock className="w-3 h-3 inline mr-1" /> Durasi Pengerjaan (menit)</label><input type="number" min="1" max="180" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" value={quiz.durasi} onChange={(e) => setQuiz({ ...quiz, durasi: parseInt(e.target.value) })} /><p className="text-[10px] text-slate-400 mt-1">Waktu yang diberikan untuk peserta</p></div>
                    <div><label className="block text-xs font-medium text-slate-600 mb-1.5"><Target className="w-3 h-3 inline mr-1" /> Passing Grade (%)</label><input type="number" min="0" max="100" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" value={quiz.passing} onChange={(e) => setQuiz({ ...quiz, passing: parseInt(e.target.value) })} /><p className="text-[10px] text-slate-400 mt-1">Nilai minimal untuk dinyatakan lulus</p></div>
                    <button onClick={handleNextStep} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">Lanjut ke Pertanyaan <ChevronDown size={16} /></button>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100"><div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /><p className="text-[10px] text-slate-600">Kuis yang baik adalah kuis yang terukur dan relevan</p></div></div>
            </div>
          </div>
        )}

        {/* STEP 2: DAFTAR PERTANYAAN */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="relative h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md"><ListChecks className="w-4 h-4 text-white" /></div>
                    <h3 className="font-bold text-slate-800">Daftar Pertanyaan</h3>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">{quiz.questions.length} Soal</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Kelola pertanyaan untuk kuis ini</p>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    <button onClick={() => setMode("manual")} className={`px-3 py-1.5 text-[10px] rounded-md transition font-medium ${mode === "manual" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Manual</button>
                    <button onClick={() => setMode("excel")} className={`px-3 py-1.5 text-[10px] rounded-md transition font-medium ${mode === "excel" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Import Excel</button>
                  </div>
                  
                  {mode === "manual" && (
                    <button onClick={() => { setEditingIndex(null); setQForm({ question: "", options: ["", "", "", ""], correct: null }); setShowModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200"><Plus size={14} /> Tambah Soal</button>
                  )}
                </div>
              </div>

              {/* AREA IMPORT EXCEL */}
              {mode === "excel" && (
                <div className="px-5 py-4 text-center border-b border-slate-100 bg-slate-50">
                  <p className="text-xs text-slate-500">Fitur Import Excel akan tersedia pada versi berikutnya.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Untuk sementara, gunakan mode Manual.</p>
                </div>
              )}
              
              <div className="p-5">
                {quiz.questions.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center bg-slate-50/30">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3"><Layers size={28} className="text-slate-300" /></div>
                    <p className="text-slate-400 text-sm mb-2">Belum ada pertanyaan</p>
                    <p className="text-xs text-slate-300 mb-4">Tambahkan minimal 1 soal untuk kuis ini</p>
                    {mode === "manual" && (
                      <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 mx-auto"><Plus size={14} /> Tambah Soal Pertama</button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quiz.questions.map((q, i) => (
                      <div key={q.id} className="bg-slate-50 rounded-xl overflow-hidden hover:bg-slate-100 transition-all duration-200 border border-slate-100">
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm">{i + 1}</div>
                            <p className="font-medium text-slate-700 text-sm flex-1 truncate">{q.question.length > 60 ? q.question.substring(0, 60) + "..." : q.question}</p>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Jawab: {q.correctLetter}</span>
                          </div>
                          <div className="flex items-center gap-1 ml-3">
                            <button onClick={() => toggleExpand(q.id)} className="p-1.5 hover:bg-white rounded-lg transition">{expandedQuestions[q.id] ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}</button>
                            <button onClick={() => handleEditQuestion(i)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteQuestion(i)} className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        {expandedQuestions[q.id] && (
                          <div className="p-3 border-t border-slate-100 bg-white space-y-3">
                            <p className="text-slate-700 text-sm">{q.question}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, idx) => (
                                <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${q.correct === idx ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'}`}>
                                  <span className={`font-medium w-5 ${q.correct === idx ? 'text-emerald-600' : 'text-slate-500'}`}>{String.fromCharCode(65 + idx)}.</span>
                                  <span className="text-slate-600 flex-1">{opt}</span>
                                  {q.correct === idx && <CheckCircle size={12} className="text-emerald-500" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {mode === "manual" && (
                      <button onClick={() => { setEditingIndex(null); setQForm({ question: "", options: ["", "", "", ""], correct: null }); setShowModal(true); }} className="w-full mt-3 border border-dashed border-slate-300 rounded-xl p-3 text-slate-400 hover:border-blue-300 hover:text-blue-600 transition flex items-center justify-center gap-2 text-sm bg-slate-50/30"><Plus size={14} /> Tambah Soal Lagi</button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              <button onClick={handlePrevStep} className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 text-sm font-medium"><ArrowLeft size={16} /> Kembali</button>
              <button onClick={handleSubmit} disabled={quiz.questions.length === 0} className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"><Save size={16} /> Simpan Kuis</button>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                <span className="flex items-center gap-1"><FileText size={10} className="text-slate-400" /> {quiz.title || "Belum diisi"}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1"><Users size={10} className="text-slate-400" /> {quiz.divisi || "Belum dipilih"}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1"><Clock size={10} className="text-slate-400" /> {quiz.durasi} menit</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1"><Target size={10} className="text-slate-400" /> Passing: {quiz.passing}%</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1"><ListChecks size={10} className="text-slate-400" /> {quiz.questions.length} soal</span>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TAMBAH/EDIT SOAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
              <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center rounded-t-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">{editingIndex !== null ? <Edit size={14} className="text-white" /> : <Plus size={14} className="text-white" />}</div>
                    <h2 className="font-bold text-slate-800">{editingIndex !== null ? "Edit Soal" : "Tambah Soal Baru"}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 ml-8">{editingIndex !== null ? "Ubah pertanyaan dan pilihan jawaban" : "Isi pertanyaan dan pilihan jawaban"}</p>
                </div>
                <button onClick={() => { setShowModal(false); setEditingIndex(null); setQForm({ question: "", options: ["", "", "", ""], correct: null }); }} className="p-2 hover:bg-slate-100 rounded-lg transition"><X size={18} className="text-slate-400" /></button>
              </div>
              <div className="p-5 space-y-5">
                <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Pertanyaan <span className="text-red-500">*</span></label><textarea placeholder="Masukkan pertanyaan di sini..." rows={3} className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none" value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1.5">Pilihan Jawaban <span className="text-red-500">*</span></label>
                  <div className="space-y-2">
                    {qForm.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-semibold text-slate-600 text-sm">{String.fromCharCode(65 + i)}</div>
                        <input className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm" placeholder={`Jawaban ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => { const newOpt = [...qForm.options]; newOpt[i] = e.target.value; setQForm({ ...qForm, options: newOpt }); }} />
                        <button type="button" onClick={() => setQForm({ ...qForm, correct: i })} className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${qForm.correct === i ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"}`}><CheckCircle size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><HelpCircle size={10} /> Klik tombol centang hijau untuk menandai jawaban benar</p>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                <button onClick={() => { setShowModal(false); setEditingIndex(null); setQForm({ question: "", options: ["", "", "", ""], correct: null }); }} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition text-sm font-medium">Batal</button>
                <button onClick={handleAddQuestion} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition flex items-center gap-2 text-sm font-medium shadow-md"><Save size={14} /> {editingIndex !== null ? "Update Soal" : "Simpan Soal"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddQuiz