// frontend/src/pages/coo/AddQuiz.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../api/axios"
import * as XLSX from "xlsx"
import { 
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
  Lightbulb,
  Star,
  Zap,
  ArrowLeft
} from "lucide-react"

import { createQuiz } from "../../api/coo/quizService"

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
  
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successDetail, setSuccessDetail] = useState("")
  const [successType, setSuccessType] = useState("")
  
  const [modalError, setModalError] = useState("")
  
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const [fileError, setFileError] = useState(null)

  const [validationErrors, setValidationErrors] = useState({
    judul: false,
    divisi: false,
    tanggal_mulai: false,
    tanggal_selesai: false
  })

  // 🔥 TANGGAL DEFAULT YANG VALID
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }
  
  const getDefaultEndDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 3)
    return date.toISOString().split('T')[0]
  }

  const [quiz, setQuiz] = useState({
    judul: "",
    divisi: "",
    deskripsi: "",
    durasi: 60,
    passing: 75,
    level: 1,
    tanggal_mulai: getTodayDate(),
    tanggal_selesai: getDefaultEndDate(),
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
      const response = await axiosInstance.get("/divisi")
      
      let divisiData = []
      if (response.data && response.data.success && response.data.data) {
        divisiData = response.data.data
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
      setTimeout(() => setShowSuccessPopup(false), 2000)
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
      options: [...qForm.options],
      correct: qForm.correct,
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
    handleImportExcel(file)
  }

  const handleDownloadTemplate = () => {
    setDownloadingTemplate(true)
    
    try {
      const sampleQuestion = [{
        text: "Contoh Soal",
        options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
        correct: 0
      }]
      
      const rowData = {
        judul_kuis: "",
        deskripsi: "",
        divisi: "",
        durasi: 60,
        passing: 75,
        level: 1,
        questions: JSON.stringify(sampleQuestion),
        tanggal_mulai: getTodayDate(),
        tanggal_selesai: getDefaultEndDate()
      }
      
      const headers = [
        'judul_kuis',
        'deskripsi',
        'divisi',
        'durasi',
        'passing',
        'level',
        'questions',
        'tanggal_mulai',
        'tanggal_selesai'
      ]
      
      const escapeCSV = (field) => {
        if (field === null || field === undefined) return '""'
        const stringField = String(field)
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
          return '"' + stringField.replace(/"/g, '""') + '"'
        }
        return stringField
      }
      
      const csvRows = []
      csvRows.push(headers.map(escapeCSV).join(','))
      
      const values = headers.map(header => {
        let value = rowData[header]
        if (header === 'questions') {
          value = JSON.stringify(sampleQuestion)
        }
        return escapeCSV(value)
      })
      csvRows.push(values.join(','))
      
      const csvContent = csvRows.join('\n')
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = 'template_import_kuis.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
      
      const toast = document.createElement('div')
      toast.className = 'fixed bottom-5 right-5 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 animate-in fade-in'
      toast.innerHTML = '✅ Template CSV berhasil diunduh'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 3000)
      
    } catch (err) {
      console.error("Error generating template:", err)
      setError("Gagal membuat template CSV")
      setTimeout(() => setError(null), 3000)
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleImportExcel = async (file) => {
    if (!file) {
      setError("Pilih file terlebih dahulu")
      return
    }

    setImporting(true)
    setError(null)

    try {
      const extension = file.name.split('.').pop().toLowerCase()
      let rows = []

      if (extension === 'csv') {
        const text = await file.text()
        const workbook = XLSX.read(text, { type: "string" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        rows = XLSX.utils.sheet_to_json(worksheet)
      } else {
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        rows = XLSX.utils.sheet_to_json(worksheet)
      }

      if (!rows.length) {
        throw new Error("File kosong atau tidak memiliki data")
      }

      const allImportedQuestions = []
      let quizInfo = null

      rows.forEach((row, index) => {
        const level = Math.min(parseInt(row.level || 1), 3)

        if (index === 0) {
          quizInfo = {
            judul: row.judul_kuis || row.judul || "",
            deskripsi: row.deskripsi || "",
            divisi: row.divisi || "",
            durasi: parseInt(row.durasi || 60),
            passing: parseInt(row.passing || 75),
            level: level,
            tanggal_mulai: row.tanggal_mulai || getTodayDate(),
            tanggal_selesai: row.tanggal_selesai || getDefaultEndDate(),
          }
        }

        let questions = []
        try {
          if (typeof row.questions === 'string') {
            questions = JSON.parse(row.questions || "[]")
          } else if (Array.isArray(row.questions)) {
            questions = row.questions
          }
        } catch (e) {
          console.error("JSON Error:", e)
        }

        const formattedQuestions = questions.map((q, qIdx) => ({
          id: Date.now() + index * 1000 + qIdx,
          text: q.text || q.question || "",
          options: q.options || ["", "", "", ""],
          correct: q.correct || 0,
          correctLetter: String.fromCharCode(65 + (q.correct || 0))
        }))

        allImportedQuestions.push(...formattedQuestions)
      })

      if (allImportedQuestions.length === 0) {
        throw new Error("Tidak ada soal valid dalam file. Pastikan kolom 'questions' berisi JSON array yang valid.")
      }

      setQuiz(prev => ({
        ...prev,
        judul: quizInfo?.judul || prev.judul,
        deskripsi: quizInfo?.deskripsi || prev.deskripsi,
        divisi: quizInfo?.divisi || prev.divisi,
        durasi: quizInfo?.durasi || prev.durasi,
        passing: quizInfo?.passing || prev.passing,
        level: quizInfo?.level || prev.level,
        tanggal_mulai: quizInfo?.tanggal_mulai || prev.tanggal_mulai,
        tanggal_selesai: quizInfo?.tanggal_selesai || prev.tanggal_selesai,
        questions: [...prev.questions, ...allImportedQuestions]
      }))

      const toast = document.createElement('div')
      toast.className = 'fixed bottom-5 right-5 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50'
      toast.innerHTML = `✅ ${allImportedQuestions.length} soal berhasil diimport`
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 3000)

      setImportFile(null)
      setFileError(null)
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ""

    } catch (err) {
      console.error("Error importing quiz:", err)
      setError(err.message || "Gagal import file")
      setTimeout(() => setError(null), 3000)
    } finally {
      setImporting(false)
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

  // 🔥 HANDLE SUBMIT - LANGSUNG REDIRECT TANPA POPUP
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
        deskripsi: quiz.deskripsi || "",
        divisi: quiz.divisi,
        durasi: Number(quiz.durasi),
        passing: Number(quiz.passing),
        level: Math.min(Number(quiz.level), 3),
        tanggal_mulai: quiz.tanggal_mulai,
        tanggal_selesai: quiz.tanggal_selesai,
        questions: quiz.questions.map(q => ({
          text: q.text,
          options: q.options,
          correct: Number(q.correct)
        })),
        total_soal: quiz.questions.length
      }
      
      console.log("Sending data:", formData)
      
      const response = await createQuiz(formData)
      
      if (response.success) {
        // 🔥 LANGSUNG REDIRECT KE HALAMAN QUIZ
        navigate("/coo/quiz")
      } else {
        setError(response.message || "Gagal membuat kuis")
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      console.error("Error creating quiz:", err)
      
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat()
        setError(errorMessages.join(", "))
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(err.message || "Terjadi kesalahan saat membuat kuis")
      }
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const getLevelIcon = (level, size = 12) => {
    switch(level) {
      case 1: return <Star size={size} />
      case 2: return <Zap size={size} />
      case 3: return <Target size={size} />
      default: return <Star size={size} />
    }
  }

  const getLevelColor = (level) => {
    switch(level) {
      case 1: return "from-emerald-500 to-teal-500"
      case 2: return "from-blue-500 to-cyan-500"
      case 3: return "from-purple-500 to-pink-500"
      default: return "from-emerald-500 to-teal-500"
    }
  }

  const getLevelBg = (level) => {
    switch(level) {
      case 1: return "bg-emerald-50"
      case 2: return "bg-blue-50"
      case 3: return "bg-purple-50"
      default: return "bg-emerald-50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* PREMIUM SUCCESS POPUP - HANYA UNTUK TAMBAH/EDIT SOAL */}
        {showSuccessPopup && successType !== "quiz" && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-t-2xl"></div>
                <div className="pt-8 pb-4 text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-ping"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-2 text-center">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{successMessage}</h3>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-4"></div>
                  <p className="text-slate-500 text-sm mb-6">{successDetail}</p>
                </div>
                <div className="px-6 pb-8">
                  <button
                    onClick={() => setShowSuccessPopup(false)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
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
          </div>
        </div>

        {/* STEP PROGRESS */}
        <div className="mb-5">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex">
              <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 transition-all duration-300 ${
                currentStep === 1 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-500' 
                  : currentStep > 1 
                    ? 'border-b-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50'
                    : 'border-b-2 border-transparent'
              }`}>
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 shadow-sm ${
                  currentStep === 1 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-200' 
                    : currentStep > 1 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200'
                      : 'bg-slate-100'
                }`}>
                  {currentStep > 1 ? (
                    <CheckCircle size={14} className="text-white" />
                  ) : (
                    <span className={`text-xs font-bold ${currentStep === 1 ? 'text-white' : 'text-slate-400'}`}>1</span>
                  )}
                </div>
                <div>
                  <p className={`text-[9px] font-semibold tracking-wide ${currentStep === 1 ? 'text-blue-600' : currentStep > 1 ? 'text-emerald-600' : 'text-slate-400'}`}>LANGKAH 1</p>
                  <p className={`text-xs font-semibold ${currentStep === 1 ? 'text-slate-800' : currentStep > 1 ? 'text-slate-700' : 'text-slate-400'}`}>Detail Kuis</p>
                </div>
              </div>

              <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 transition-all duration-300 ${
                currentStep === 2 
                  ? quiz.questions.length > 0
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-500'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-500'
                  : quiz.questions.length > 0 && currentStep === 1
                    ? 'border-b-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50'
                    : 'border-b-2 border-transparent'
              }`}>
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 shadow-sm ${
                  currentStep === 2 
                    ? quiz.questions.length > 0
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-200'
                    : quiz.questions.length > 0 && currentStep === 1
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200'
                      : 'bg-slate-100'
                }`}>
                  {quiz.questions.length > 0 ? (
                    <CheckCircle size={14} className="text-white" />
                  ) : (
                    <span className={`text-xs font-bold ${
                      currentStep === 2 ? 'text-white' : 'text-slate-400'
                    }`}>2</span>
                  )}
                </div>
                <div>
                  <p className={`text-[9px] font-semibold tracking-wide ${
                    currentStep === 2 
                      ? quiz.questions.length > 0 ? 'text-emerald-600' : 'text-blue-600'
                      : quiz.questions.length > 0 ? 'text-emerald-600' : 'text-slate-400'
                  }`}>LANGKAH 2</p>
                  <p className={`text-xs font-semibold ${
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
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={12} className="text-red-500" />
            <p className="text-xs text-red-600 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-xs font-medium">Tutup</button>
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
                      <p className="text-xs text-slate-400">Atur durasi, standar kelulusan, dan level</p>
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

                    {/* LEVEL KUIS */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        <Star className="w-3 h-3 inline mr-1" /> Level Kuis <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setQuiz({ ...quiz, level: level })}
                            className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all duration-200 ${
                              quiz.level === level
                                ? `${getLevelBg(level)} border-${level === 1 ? 'emerald' : level === 2 ? 'blue' : 'purple'}-400 shadow-sm`
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              quiz.level === level
                                ? `bg-gradient-to-r ${getLevelColor(level)} text-white shadow-sm`
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {getLevelIcon(level, 12)}
                            </div>
                            <div className="text-left">
                              <p className={`text-[11px] font-semibold ${quiz.level === level ? 'text-slate-800' : 'text-slate-600'}`}>
                                Level {level}
                              </p>
                              <p className="text-[9px] text-slate-400">
                                {level === 1 ? "Pemula" : level === 2 ? "Menengah" : "Lanjutan"}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
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

        {/* STEP 2: DAFTAR PERTANYAAN - [KONTEN LENGKAP SAMA SEPERTI SEBELUMNYA] */}
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

              {/* IMPORT EXCEL SECTION */}
              {mode === "excel" && (
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <button
                        onClick={handleDownloadTemplate}
                        disabled={downloadingTemplate}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-sm"
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
                      <p className="text-[10px] text-slate-500">
                        Template CSV dengan 1 contoh soal
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-medium text-slate-700 mb-1">
                        Pilih File CSV / Excel
                      </label>
                      <div className="flex gap-2 items-start flex-col sm:flex-row">
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileChange}
                          className="flex-1 text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-medium file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100 transition cursor-pointer"
                        />
                        <button
                          onClick={() => {}}
                          disabled={!importFile || importing}
                          className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-white text-[10px] font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {importing ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                          {importing ? "Memproses..." : "Import"}
                        </button>
                      </div>
                      
                      {importFile && !fileError && (
                        <div className="mt-1.5 p-1.5 bg-emerald-50 rounded-lg flex items-center gap-2">
                          <CheckCircle size={10} className="text-emerald-600" />
                          <span className="text-[9px] text-emerald-700">{importFile.name}</span>
                          <span className="text-[8px] text-emerald-600 ml-auto">{(importFile.size / 1024).toFixed(1)} KB</span>
                          <button onClick={() => {
                            setImportFile(null)
                            setFileError(null)
                            const fileInput = document.querySelector('input[type="file"]')
                            if (fileInput) fileInput.value = ""
                          }} className="text-emerald-600 hover:text-emerald-800">
                            <X size={10} />
                          </button>
                        </div>
                      )}
                      
                      {fileError && (
                        <div className="mt-1.5 p-1.5 bg-red-50 rounded-lg flex items-center gap-2">
                          <AlertCircle size={10} className="text-red-600" />
                          <span className="text-[9px] text-red-600 flex-1">{fileError}</span>
                          <button onClick={() => {
                            setFileError(null)
                            setImportFile(null)
                          }} className="text-red-600 hover:text-red-800">
                            <X size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 flex items-center flex-wrap gap-x-3 gap-y-1">
                      <Lightbulb size={10} className="text-blue-500 flex-shrink-0" />
                      <span className="text-[9px] font-medium text-blue-800">Catatan:</span>
                      <span className="text-[9px] text-blue-600">Kolom "questions" menggunakan format JSON</span>
                      <span className="text-[9px] text-blue-600">• Nilai "correct" = index (0=A,1=B,2=C,3=D)</span>
                      <span className="text-[9px] text-blue-600">• Jangan ubah nama kolom template</span>
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
                              {expandedQuestions[q.id] ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
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

            {/* TOMBOL KEMBALI DAN SIMPAN */}
            <div className="flex justify-between gap-3">
              <button 
                onClick={handlePrevStep} 
                className="px-4 py-2 bg-slate-600 rounded-lg text-white text-xs font-semibold shadow-md hover:bg-slate-700 hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 group"
              >
                <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                Kembali
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading || quiz.questions.length === 0} 
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-white text-xs font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:hover:scale-100 group"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} className="group-hover:scale-110 transition-transform" />}
                {loading ? "Menyimpan..." : "Simpan Kuis"}
              </button>
            </div>

            {/* SUMMARY CARD */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-2.5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center">
                    <Clock size={10} className="text-blue-600" />
                  </div>
                  <span className="font-medium text-slate-600 text-[10px]">{quiz.durasi || 0} menit</span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-emerald-100 rounded-md flex items-center justify-center">
                    <Target size={10} className="text-emerald-600" />
                  </div>
                  <span className="font-medium text-slate-600 text-[10px]">Passing: {quiz.passing || 0}%</span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-purple-100 rounded-md flex items-center justify-center">
                    {getLevelIcon(quiz.level, 10)}
                  </div>
                  <span className="font-medium text-slate-600 text-[10px]">Level {quiz.level}</span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-amber-100 rounded-md flex items-center justify-center">
                    <Calendar size={10} className="text-amber-600" />
                  </div>
                  <span className="font-medium text-slate-600 text-[10px]">
                    {quiz.tanggal_mulai && quiz.tanggal_selesai ? (
                      `${new Date(quiz.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric' })} - ${new Date(quiz.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric' })}`
                    ) : '-'}
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-rose-100 rounded-md flex items-center justify-center">
                    <ListChecks size={10} className="text-rose-600" />
                  </div>
                  <span className="font-bold text-slate-700 text-[10px]">{quiz.questions.length} soal</span>
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

      <style>{`
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