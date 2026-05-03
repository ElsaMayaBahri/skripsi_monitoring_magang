import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../utils/api"
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
  Sparkles,
  Layers,
  Calendar,
  Users,
  Loader2,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Check,
  Eye,
  Lightbulb
} from "lucide-react"

function AddQuiz() {
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [mode, setMode] = useState("manual")
  const [showModal, setShowModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [divisiList, setDivisiList] = useState([])
  const [loadingDivisi, setLoadingDivisi] = useState(true)
  
  // Premium success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successDetail, setSuccessDetail] = useState("")
  const [successType, setSuccessType] = useState("")
  
  // Modal error state
  const [modalError, setModalError] = useState("")
  
  // State untuk import Excel
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [showImportModal, setShowImportModal] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [fileError, setFileError] = useState(null)

  const [validationErrors, setValidationErrors] = useState({
    judul: false,
    divisi: false,
    tanggal_mulai: false,
    tanggal_selesai: false
  })

  const [quiz, setQuiz] = useState({
    judul: "",
    divisi: "",
    deskripsi: "",
    durasi: 60,
    passing: 75,
    tanggal_mulai: "",
    tanggal_selesai: "",
    questions: []
  })

  const [qForm, setQForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: null
  })

  useEffect(() => {
    fetchDivisi()
  }, [])

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
      
      const aktifDivisi = divisiData.filter(div => {
        const status = div.status_akun || div.status || div.is_active
        if (status === "aktif" || status === "active" || status === true) {
          return true
        }
        return false
      })
      
      setDivisiList(aktifDivisi)
    } catch (err) {
      console.error("Error fetching divisi:", err)
      setError("Gagal mengambil data divisi")
    } finally {
      setLoadingDivisi(false)
    }
  }

  const toggleExpand = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const showPremiumPopup = (message, detail, type = "question") => {
    setSuccessMessage(message)
    setSuccessDetail(detail)
    setSuccessType(type)
    setShowSuccessPopup(true)
    if (type !== "quiz") {
      setTimeout(() => setShowSuccessPopup(false), 2500)
    }
  }

  const handleAddQuestion = () => {
    setModalError("")
    
    if (!qForm.question.trim()) {
      setModalError("Pertanyaan harus diisi")
      return
    }
    if (qForm.options.some(opt => !opt.trim())) {
      setModalError("Semua pilihan jawaban harus diisi")
      return
    }
    if (qForm.correct === null) {
      setModalError("Pilih jawaban yang benar terlebih dahulu")
      return
    }

    const newQ = { 
      id: Date.now(), 
      text: qForm.question,
      options: qForm.options,
      correct: qForm.correct,
      correctLetter: String.fromCharCode(65 + qForm.correct)
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...quiz.questions]
      updatedQuestions[editingIndex] = newQ
      setQuiz({ ...quiz, questions: updatedQuestions })
      setEditingIndex(null)
      showPremiumPopup("Soal Berhasil Diupdate", `"${qForm.question.substring(0, 50)}..." telah diperbarui`, "question")
    } else {
      setQuiz({
        ...quiz,
        questions: [...quiz.questions, newQ]
      })
      showPremiumPopup("Soal Berhasil Ditambahkan", `${quiz.questions.length + 1} soal dalam kuis ini`, "question")
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
      question: q.text,
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
      showPremiumPopup("Soal Berhasil Dihapus", `Sisa ${updatedQuestions.length} soal dalam kuis`, "question")
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) {
      setImportFile(null)
      setFileError(null)
      return
    }
    
    const extension = file.name.split('.').pop().toLowerCase()
    const allowedExtensions = ['xlsx', 'xls', 'csv']
    
    if (!allowedExtensions.includes(extension)) {
      setFileError(`Format file harus: ${allowedExtensions.join(', ')}`)
      setImportFile(null)
      e.target.value = ""
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setFileError("Ukuran file maksimal 10MB")
      setImportFile(null)
      e.target.value = ""
      return
    }
    
    setFileError(null)
    setImportFile(file)
  }

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true)
    try {
      const blob = await api.downloadQuizTemplate()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'template_kuis.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading template:", err)
      setError("Gagal mendownload template")
      setTimeout(() => setError(null), 3000)
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const parseCSVLine = (line) => {
    const result = []
    let current = ""
    let inQuotes = false
    let i = 0
    
    while (i < line.length) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i += 2
          continue
        }
        inQuotes = !inQuotes
        i++
        continue
      }
      
      if (char === ',' && !inQuotes) {
        let val = current.trim()
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1)
        }
        result.push(val.replace(/""/g, '"'))
        current = ""
        i++
        continue
      }
      
      current += char
      i++
    }
    
    let val = current.trim()
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1)
    }
    result.push(val.replace(/""/g, '"'))
    return result
  }

  const handleImportExcel = async () => {
    if (!importFile) {
      setError("Pilih file terlebih dahulu")
      setTimeout(() => setError(null), 3000)
      return
    }
    
    setImporting(true)
    setImportProgress(0)
    setError(null)
    
    try {
      const fileContent = await importFile.text()
      setImportProgress(20)
      
      const lines = fileContent.split(/\r?\n/).filter(line => line.trim())
      if (lines.length < 2) {
        throw new Error("File minimal memiliki 2 baris (header + data)")
      }
      
      const headers = parseCSVLine(lines[0])
      
      const judulIndex = headers.findIndex(h => h === 'judul_kuis' || h === 'judul')
      const deskripsiIndex = headers.findIndex(h => h === 'deskripsi')
      const divisiIndex = headers.findIndex(h => h === 'divisi')
      const durasiIndex = headers.findIndex(h => h === 'durasi')
      const passingIndex = headers.findIndex(h => h === 'passing')
      const questionsIndex = headers.findIndex(h => h === 'questions')
      const tglMulaiIndex = headers.findIndex(h => h === 'tanggal_mulai')
      const tglSelesaiIndex = headers.findIndex(h => h === 'tanggal_selesai')
      
      setImportProgress(40)
      
      const allImportedQuestions = []
      let quizInfo = null
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        try {
          const values = parseCSVLine(line)
          
          const judul = judulIndex >= 0 ? values[judulIndex] : ""
          const deskripsi = deskripsiIndex >= 0 ? values[deskripsiIndex] : ""
          const divisi = divisiIndex >= 0 ? values[divisiIndex] : ""
          const durasi = durasiIndex >= 0 ? parseInt(values[durasiIndex]) || 60 : 60
          const passing = passingIndex >= 0 ? parseInt(values[passingIndex]) || 75 : 75
          const questionsStr = questionsIndex >= 0 ? values[questionsIndex] : ""
          const tglMulai = tglMulaiIndex >= 0 ? values[tglMulaiIndex] : ""
          const tglSelesai = tglSelesaiIndex >= 0 ? values[tglSelesaiIndex] : ""
          
          if (i === 1 && judul) {
            quizInfo = {
              judul: judul,
              deskripsi: deskripsi,
              divisi: divisi,
              durasi: durasi,
              passing: passing,
              tanggal_mulai: tglMulai,
              tanggal_selesai: tglSelesai
            }
          }
          
          let questions = []
          if (questionsStr) {
            try {
              questions = JSON.parse(questionsStr)
            } catch (jsonError) {
              let fixedStr = questionsStr
                .replace(/""/g, '"')
                .replace(/\\/g, '')
                .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
              
              try {
                questions = JSON.parse(fixedStr)
              } catch (e) {
                console.error(`Gagal parse JSON di baris ${i}:`, e)
                questions = []
              }
            }
          }
          
          if (questions.length === 0) continue
          
          const formattedQuestions = questions.map((q, qIdx) => ({
            id: Date.now() + i * 1000 + qIdx,
            text: q.text || q.question || "",
            options: q.options || ["", "", "", ""],
            correct: q.correct || 0,
            correctLetter: String.fromCharCode(65 + (q.correct || 0))
          }))
          
          allImportedQuestions.push(...formattedQuestions)
          
        } catch (rowError) {
          console.error(`Error processing row ${i}:`, rowError)
        }
      }
      
      setImportProgress(80)
      
      if (allImportedQuestions.length === 0) {
        throw new Error("Tidak ada soal yang valid ditemukan dalam file. Pastikan kolom 'questions' berisi JSON array yang valid.")
      }
      
      setQuiz(prev => ({
        ...prev,
        judul: quizInfo?.judul || prev.judul,
        deskripsi: quizInfo?.deskripsi || prev.deskripsi,
        divisi: quizInfo?.divisi || prev.divisi,
        durasi: quizInfo?.durasi || prev.durasi,
        passing: quizInfo?.passing || prev.passing,
        tanggal_mulai: quizInfo?.tanggal_mulai || prev.tanggal_mulai,
        tanggal_selesai: quizInfo?.tanggal_selesai || prev.tanggal_selesai,
        questions: [...prev.questions, ...allImportedQuestions]
      }))
      
      setImportProgress(100)
      
      showPremiumPopup("Import Berhasil", `${allImportedQuestions.length} soal berhasil ditambahkan ke kuis`, "question")
      
      setShowImportModal(false)
      setImportFile(null)
      setFileError(null)
      
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ""
      
    } catch (err) {
      console.error("Error importing quiz:", err)
      setError(err.message || "Terjadi kesalahan saat mengimport kuis")
      setTimeout(() => setError(null), 3000)
    } finally {
      setImporting(false)
      setImportProgress(0)
    }
  }

  const validateStep1 = () => {
    const errors = {
      judul: !quiz.judul.trim(),
      divisi: !quiz.divisi,
      tanggal_mulai: !quiz.tanggal_mulai,
      tanggal_selesai: !quiz.tanggal_selesai
    }
    
    setValidationErrors(errors)
    
    if (errors.judul) {
      setError("Judul kuis harus diisi")
      setTimeout(() => setError(null), 3000)
      return false
    }
    if (errors.divisi) {
      setError("Pilih divisi")
      setTimeout(() => setError(null), 3000)
      return false
    }
    if (errors.tanggal_mulai) {
      setError("Tanggal mulai harus diisi")
      setTimeout(() => setError(null), 3000)
      return false
    }
    if (errors.tanggal_selesai) {
      setError("Tanggal selesai harus diisi")
      setTimeout(() => setError(null), 3000)
      return false
    }
    
    if (quiz.tanggal_mulai && quiz.tanggal_selesai) {
      const startDate = new Date(quiz.tanggal_mulai)
      const endDate = new Date(quiz.tanggal_selesai)
      if (endDate < startDate) {
        setError("Tanggal selesai harus setelah atau sama dengan tanggal mulai")
        setTimeout(() => setError(null), 3000)
        return false
      }
    }
    
    return true
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(1)
    setValidationErrors({
      judul: false,
      divisi: false,
      tanggal_mulai: false,
      tanggal_selesai: false
    })
  }

  const handleSubmit = async () => {
    if (quiz.questions.length === 0) {
      setError("Minimal 1 soal harus ditambahkan")
      setTimeout(() => setError(null), 3000)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const formData = {
        judul: quiz.judul,
        judul_kuis: quiz.judul,
        deskripsi: quiz.deskripsi,
        divisi: quiz.divisi,
        durasi: quiz.durasi,
        passing: quiz.passing,
        tanggal_mulai: quiz.tanggal_mulai,
        tanggal_selesai: quiz.tanggal_selesai,
        questions: quiz.questions.map(q => ({
          text: q.text,
          options: q.options,
          correct: q.correct
        })),
        total_soal: quiz.questions.length
      }
      
      const response = await api.createQuiz(formData)
      
      if (response.success) {
        showPremiumPopup("Kuis Berhasil Dibuat", `${quiz.judul} · ${quiz.questions.length} soal · ${quiz.durasi} menit`, "quiz")
      } else {
        setError(response.message || "Gagal membuat kuis")
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error("Error creating quiz:", err)
      setError(err.message || "Terjadi kesalahan saat membuat kuis")
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* PREMIUM SUCCESS POPUP */}
        {showSuccessPopup && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-t-2xl"></div>
                  
                  <div className="pt-8 pb-4 text-center">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-ping"></div>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg transform transition-transform duration-300">
                        <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-2 text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{successMessage}</h3>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-4"></div>
                    <p className="text-slate-500 text-sm mb-6">{successDetail}</p>
                  </div>
                  
                  <div className="px-6 pb-8 flex flex-col gap-3">
                    {successType === "quiz" ? (
                      <>
                        <button
                          onClick={() => {
                            setShowSuccessPopup(false)
                            navigate("/coo/quiz")
                          }}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          Lihat Daftar Kuis
                        </button>
                        <button
                          onClick={() => setShowSuccessPopup(false)}
                          className="w-full py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all duration-200"
                        >
                          Tetap di Halaman Ini
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowSuccessPopup(false)}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        Tutup
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

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
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>
          </div>
        </div>

        {/* STEP PROGRESS */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex">
              {/* STEP 1 */}
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

              {/* STEP 2 */}
              <div className={`flex-1 flex items-center gap-3 px-5 py-4 transition-all duration-300 ${
                currentStep === 2 
                  ? quiz.questions.length > 0
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-500'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-500'
                  : quiz.questions.length > 0 && currentStep === 1
                    ? 'border-b-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50'
                    : 'border-b-2 border-transparent'
              }`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 shadow-sm ${
                  currentStep === 2 
                    ? quiz.questions.length > 0
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-200'
                    : quiz.questions.length > 0 && currentStep === 1
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200'
                      : 'bg-slate-100'
                }`}>
                  {quiz.questions.length > 0 ? (
                    <CheckCircle size={18} className="text-white" />
                  ) : (
                    <span className={`text-sm font-bold ${
                      currentStep === 2 ? 'text-white' : 'text-slate-400'
                    }`}>2</span>
                  )}
                </div>
                <div>
                  <p className={`text-[10px] font-semibold tracking-wide ${
                    currentStep === 2 
                      ? quiz.questions.length > 0 ? 'text-emerald-600' : 'text-blue-600'
                      : quiz.questions.length > 0 ? 'text-emerald-600' : 'text-slate-400'
                  }`}>LANGKAH 2</p>
                  <p className={`text-sm font-semibold ${
                    currentStep === 2 
                      ? quiz.questions.length > 0 ? 'text-emerald-700' : 'text-slate-800'
                      : quiz.questions.length > 0 ? 'text-emerald-700' : 'text-slate-400'
                  }`}>Daftar Pertanyaan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="p-1 bg-red-100 rounded-full"><AlertCircle size={14} className="text-red-500" /></div>
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-sm font-medium">Tutup</button>
          </div>
        )}

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
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Judul Kuis <span className="text-red-500">*</span>
                      </label>
                      <input 
                        placeholder="Contoh: Quiz Laravel Basic - Batch 1 2024" 
                        className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition ${
                          validationErrors.judul ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                        }`}
                        value={quiz.judul}
                        onChange={(e) => {
                          setQuiz({ ...quiz, judul: e.target.value })
                          if (validationErrors.judul) setValidationErrors({ ...validationErrors, judul: false })
                        }} 
                      />
                      {validationErrors.judul && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> Judul kuis harus diisi
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          Divisi <span className="text-red-500">*</span>
                        </label>
                        {loadingDivisi ? (
                          <div className="w-full border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 bg-slate-50">
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                            <span className="text-sm text-slate-400">Memuat divisi...</span>
                          </div>
                        ) : (
                          <select 
                            className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white ${
                              validationErrors.divisi ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                            }`}
                            value={quiz.divisi}
                            onChange={(e) => {
                              setQuiz({ ...quiz, divisi: e.target.value })
                              if (validationErrors.divisi) setValidationErrors({ ...validationErrors, divisi: false })
                            }}
                          >
                            <option value="">Pilih Divisi</option>
                            {divisiList.map((div) => (
                              <option key={div.id_divisi || div.id} value={div.nama_divisi || div.nama}>
                                {div.nama_divisi || div.nama}
                              </option>
                            ))}
                          </select>
                        )}
                        {validationErrors.divisi && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={10} /> Pilih divisi terlebih dahulu
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Deskripsi</label>
                        <textarea 
                          placeholder="Deskripsi singkat tentang kuis ini..." 
                          rows={1} 
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none" 
                          value={quiz.deskripsi}
                          onChange={(e) => setQuiz({ ...quiz, deskripsi: e.target.value })} 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          <Calendar size={12} className="inline mr-1" /> Tanggal Mulai <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="date" 
                          className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${
                            validationErrors.tanggal_mulai ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                          }`}
                          value={quiz.tanggal_mulai}
                          onChange={(e) => {
                            setQuiz({ ...quiz, tanggal_mulai: e.target.value })
                            if (validationErrors.tanggal_mulai) setValidationErrors({ ...validationErrors, tanggal_mulai: false })
                          }}
                        />
                        {validationErrors.tanggal_mulai && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={10} /> Tanggal mulai harus diisi
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          <Calendar size={12} className="inline mr-1" /> Tanggal Selesai <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="date" 
                          className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 ${
                            validationErrors.tanggal_selesai ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                          }`}
                          value={quiz.tanggal_selesai}
                          onChange={(e) => {
                            setQuiz({ ...quiz, tanggal_selesai: e.target.value })
                            if (validationErrors.tanggal_selesai) setValidationErrors({ ...validationErrors, tanggal_selesai: false })
                          }}
                        />
                        {validationErrors.tanggal_selesai && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={10} /> Tanggal selesai harus diisi
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* TIPS SECTION - Horizontal */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-slate-800">Panduan Membuat Kuis yang Efektif</span>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            Judul spesifik & mudah diingat
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            Pilih divisi sesuai materi
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            Tentukan periode pelaksanaan
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            Passing grade sesuai standar
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden sticky top-6">
                <div className="relative h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-md">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Pengaturan Kuis</h3>
                      <p className="text-xs text-slate-400">Atur durasi dan standar kelulusan</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        <Clock className="w-3 h-3 inline mr-1" /> Durasi Pengerjaan (menit)
                      </label>
                      <input 
                        type="number" 
                        min="1" 
                        max="180" 
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" 
                        value={quiz.durasi} 
                        onChange={(e) => setQuiz({ ...quiz, durasi: parseInt(e.target.value) })} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        <Target className="w-3 h-3 inline mr-1" /> Passing Grade (%) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" 
                        value={quiz.passing} 
                        onChange={(e) => setQuiz({ ...quiz, passing: parseInt(e.target.value) })} 
                      />
                    </div>
                    <button 
                      onClick={handleNextStep} 
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                      Lanjut ke Pertanyaan 
                      <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
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
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                      <ListChecks className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800">Daftar Pertanyaan</h3>
                    <span className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.5 rounded-full font-medium shadow-sm">
                      {quiz.questions.length} Soal
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Kelola pertanyaan untuk kuis ini</p>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    <button 
                      onClick={() => setMode("manual")} 
                      className={`px-3 py-1.5 text-[10px] rounded-md transition font-medium ${
                        mode === "manual" 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Manual
                    </button>
                    <button 
                      onClick={() => setMode("excel")} 
                      className={`px-3 py-1.5 text-[10px] rounded-md transition font-medium ${
                        mode === "excel" 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Import Excel
                    </button>
                  </div>
                  
                  {mode === "manual" && (
                    <button 
                      onClick={() => { 
                        setEditingIndex(null)
                        setModalError("")
                        setQForm({ question: "", options: ["", "", "", ""], correct: null })
                        setShowModal(true)
                      }} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-xs font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      <Plus size={14} /> Tambah Soal
                    </button>
                  )}
                </div>
              </div>

              {mode === "excel" && (
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex flex-col gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1">
                        <FileSpreadsheet size={12} /> Format CSV yang diperlukan:
                      </p>
                      <ul className="text-[10px] text-blue-600 space-y-0.5 ml-4 list-disc">
                        <li>judul_kuis - Judul kuis</li>
                        <li>deskripsi - Deskripsi kuis (opsional)</li>
                        <li>divisi - Nama divisi</li>
                        <li>durasi - Durasi dalam menit</li>
                        <li>passing - Nilai passing grade</li>
                        <li>questions - JSON array berisi soal</li>
                        <li>tanggal_mulai - Tanggal mulai (YYYY-MM-DD)</li>
                        <li>tanggal_selesai - Tanggal selesai (YYYY-MM-DD)</li>
                      </ul>
                      <button
                        onClick={handleDownloadTemplate}
                        disabled={downloadingTemplate}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm"
                      >
                        {downloadingTemplate ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <Download size={12} />
                            Download Template CSV
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Pilih File CSV</label>
                      <div className="flex gap-2 items-start flex-col sm:flex-row">
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileChange}
                          className="flex-1 text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:text-white hover:file:opacity-90 transition cursor-pointer"
                        />
                        <button
                          onClick={() => setShowImportModal(true)}
                          disabled={!importFile || importing}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-white text-xs font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Upload size={14} className="inline mr-1" />
                          Import
                        </button>
                      </div>
                      
                      {importFile && !fileError && (
                        <p className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1">
                          <CheckCircle size={10} />
                          File siap: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                      
                      {fileError && (
                        <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1">
                          <X size={10} />
                          {fileError}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                      <p className="text-[10px] text-amber-700 flex items-center gap-1">
                        <HelpCircle size={10} />
                        <span className="font-medium">Tips:</span> File akan diproses langsung di browser. Pastikan format JSON di kolom questions valid.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-5">
                {quiz.questions.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center bg-slate-50/30">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Layers size={28} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-sm mb-2">Belum ada pertanyaan</p>
                    <p className="text-xs text-slate-300 mb-4">Tambahkan minimal 1 soal untuk kuis ini</p>
                    {mode === "manual" && (
                      <button 
                        onClick={() => {
                          setModalError("")
                          setShowModal(true)
                        }} 
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 mx-auto"
                      >
                        <Plus size={14} /> Tambah Soal Pertama
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quiz.questions.map((q, i) => (
                      <div 
                        key={q.id} 
                        className="bg-slate-50 rounded-xl overflow-hidden hover:bg-slate-100 transition-all duration-200 border border-slate-100 hover:border-slate-200 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm">
                              {i + 1}
                            </div>
                            <p className="font-medium text-slate-700 text-sm flex-1 truncate">
                              {q.text.length > 60 ? q.text.substring(0, 60) + "..." : q.text}
                            </p>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                              Jawab: {q.correctLetter}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 ml-3">
                            <button 
                              onClick={() => toggleExpand(q.id)} 
                              className="p-1.5 hover:bg-white rounded-lg transition"
                            >
                              {expandedQuestions[q.id] ? 
                                <ChevronUp size={14} className="text-slate-500" /> : 
                                <ChevronDown size={14} className="text-slate-500" />
                              }
                            </button>
                            <button 
                              onClick={() => handleEditQuestion(i)} 
                              className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteQuestion(i)} 
                              className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {expandedQuestions[q.id] && (
                          <div className="p-3 border-t border-slate-100 bg-white space-y-3">
                            <p className="text-slate-700 text-sm">{q.text}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, idx) => (
                                <div 
                                  key={idx} 
                                  className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                    q.correct === idx 
                                      ? 'bg-emerald-50 border border-emerald-200' 
                                      : 'bg-slate-50 border border-slate-100'
                                  }`}
                                >
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
                    {mode === "manual" && (
                      <button 
                        onClick={() => { 
                          setEditingIndex(null)
                          setModalError("")
                          setQForm({ question: "", options: ["", "", "", ""], correct: null })
                          setShowModal(true)
                        }} 
                        className="w-full mt-3 border border-dashed border-slate-300 rounded-xl p-3 text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm bg-slate-50/30 hover:bg-blue-50/30"
                      >
                        <Plus size={14} /> Tambah Soal Lagi
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <button 
                onClick={handlePrevStep} 
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center gap-2 text-sm font-medium group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Kembali
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading || quiz.questions.length === 0} 
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 group"
              >
                {loading ? 
                  <Loader2 size={16} className="animate-spin" /> : 
                  <Save size={16} className="group-hover:scale-110 transition-transform" />
                }
                {loading ? "Menyimpan..." : "Simpan Kuis"}
              </button>
            </div>

            {/* SUMMARY CARD - PREMIUM */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock size={12} className="text-blue-600" />
                  </div>
                  <span className="font-medium text-slate-700">{quiz.durasi || 0} menit</span>
                </div>
                <div className="w-px h-5 bg-slate-300"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Target size={12} className="text-emerald-600" />
                  </div>
                  <span className="font-medium text-slate-700">Passing: {quiz.passing || 0}%</span>
                </div>
                <div className="w-px h-5 bg-slate-300"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar size={12} className="text-purple-600" />
                  </div>
                  <span className="font-medium text-slate-700">
                    {quiz.tanggal_mulai || "-"} s.d {quiz.tanggal_selesai || "-"}
                  </span>
                </div>
                <div className="w-px h-5 bg-slate-300"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                    <ListChecks size={12} className="text-amber-600" />
                  </div>
                  <span className="font-bold text-slate-800">{quiz.questions.length} soal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TAMBAH/EDIT SOAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
              <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center rounded-t-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                      {editingIndex !== null ? <Edit size={14} className="text-white" /> : <Plus size={14} className="text-white" />}
                    </div>
                    <h2 className="font-bold text-slate-800">{editingIndex !== null ? "Edit Soal" : "Tambah Soal Baru"}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 ml-8">
                    {editingIndex !== null ? "Ubah pertanyaan dan pilihan jawaban" : "Isi pertanyaan dan pilihan jawaban"}
                  </p>
                </div>
                <button 
                  onClick={() => { 
                    setShowModal(false)
                    setEditingIndex(null)
                    setModalError("")
                    setQForm({ question: "", options: ["", "", "", ""], correct: null })
                  }} 
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-5 space-y-5">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600 flex-1">{modalError}</p>
                    <button onClick={() => setModalError("")} className="text-red-500 hover:text-red-700">
                      <X size={12} />
                    </button>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Pertanyaan <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    placeholder="Masukkan pertanyaan di sini..." 
                    rows={3} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none" 
                    value={qForm.question} 
                    onChange={(e) => {
                      setQForm({ ...qForm, question: e.target.value })
                      if (modalError) setModalError("")
                    }} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Pilihan Jawaban <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {qForm.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-semibold text-slate-600 text-sm">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <input 
                          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm" 
                          placeholder={`Jawaban ${String.fromCharCode(65 + i)}`} 
                          value={opt} 
                          onChange={(e) => { 
                            const newOpt = [...qForm.options]
                            newOpt[i] = e.target.value
                            setQForm({ ...qForm, options: newOpt })
                            if (modalError) setModalError("")
                          }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setQForm({ ...qForm, correct: i })
                            if (modalError) setModalError("")
                          }} 
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            qForm.correct === i 
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm scale-105" 
                              : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"
                          }`}
                        >
                          <CheckCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <HelpCircle size={10} /> Klik tombol centang hijau untuk menandai jawaban benar
                  </p>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                <button 
                  onClick={() => { 
                    setShowModal(false)
                    setEditingIndex(null)
                    setModalError("")
                    setQForm({ question: "", options: ["", "", "", ""], correct: null })
                  }} 
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAddQuestion} 
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg hover:scale-105"
                >
                  <Save size={14} /> {editingIndex !== null ? "Update Soal" : "Simpan Soal"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* IMPORT CONFIRM MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Konfirmasi Import</h3>
                  <p className="text-[10px] text-slate-400">Import soal dari file CSV</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportProgress(0)
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-5">
              <p className="text-sm text-slate-600 mb-4">
                Apakah Anda yakin ingin mengimport soal dari file <strong className="text-blue-600">{importFile?.name}</strong>?
              </p>
              
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-[10px] text-blue-700">
                  <span className="font-medium">Informasi file:</span><br />
                  • Nama: {importFile?.name}<br />
                  • Ukuran: {(importFile?.size / 1024).toFixed(1)} KB
                </p>
              </div>
              
              {importing && importProgress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Memproses file...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportProgress(0)
                }}
                disabled={importing}
                className="px-4 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:bg-white transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleImportExcel}
                disabled={importing}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-white text-xs font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Upload size={12} />
                    Ya, Import
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
        .zoom-in-95 {
          animation: zoomIn95 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

export default AddQuiz