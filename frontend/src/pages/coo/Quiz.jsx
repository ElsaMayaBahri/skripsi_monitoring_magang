// Quiz.jsx - Halaman Manajemen Kuis untuk COO (Sistem Bertingkat) - FIXED
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getAllQuiz,
  deleteQuiz,
  importQuiz
} from "../../api/coo/quizService"
import axiosInstance from "../../api/axios"
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
  Edit3,
  AlertCircle,
  Loader2,
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  Info,
  Filter,
  SlidersHorizontal,
  Building2,
  Tag,
  BarChart3,
  Crown,
  Star,
  Zap,
  Target,
  Trophy,
  Hash,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Grid3x3,
  List,
  Settings2
} from "lucide-react"

function Quiz() {
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [expandedLevels, setExpandedLevels] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true })
  
  // Filter states
  const [showFilter, setShowFilter] = useState(false)
  const [selectedDivisis, setSelectedDivisis] = useState([])
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [divisiList, setDivisiList] = useState([])
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingQuizId, setDeletingQuizId] = useState(null)
  const [deletingQuizTitle, setDeletingQuizTitle] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadQuizData()
    fetchDivisi()
  }, [])

  const loadQuizData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllQuiz()
      console.log("Quiz response:", response)
      
      let quizData = []
      if (response && response.success && response.data) {
        quizData = response.data
      } else if (response && response.data && Array.isArray(response.data)) {
        quizData = response.data
      } else if (Array.isArray(response)) {
        quizData = response
      }
      
      const transformedData = quizData.map(q => ({
        id: q.id || q.id_kuis,
        judul: q.judul || q.title || q.judul_kuis || "Tanpa Judul",
        divisi: q.divisi || "Umum",
        durasi: q.durasi || q.duration || 30,
        peserta: q.peserta || q.participants || 0,
        total_soal: q.total_soal || q.questions?.length || 0,
        questions: q.questions || [],
        created_at: q.created_at || q.createdAt,
        status: q.status === "aktif" || q.status === "active" ? "aktif" : "nonaktif",
        passing: q.passing || 75,
        level: q.level || 1
      }))
      
      setQuiz(transformedData)
    } catch (err) {
      console.error("Error fetching quiz:", err)
      setError(err.message || "Gagal mengambil data kuis")
      setQuiz([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDivisi = async () => {
    try {
      const response = await axiosInstance.get("/divisi/aktif")
      let divisiData = []
      if (response.data && response.data.success && response.data.data) {
        divisiData = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        divisiData = response.data
      }
      setDivisiList(divisiData)
    } catch (error) {
      console.error("Error fetching divisi:", error)
      setDivisiList([])
    }
  }

  const toggleDivisi = (divisiName) => {
    setSelectedDivisis(prev => {
      if (prev.includes(divisiName)) {
        return prev.filter(d => d !== divisiName)
      } else {
        return [...prev, divisiName]
      }
    })
  }

  const resetDivisiFilters = () => {
    setSelectedDivisis([])
  }

  const openDeleteModal = (id, title, e) => {
    e.stopPropagation()
    setDeletingQuizId(id)
    setDeletingQuizTitle(title)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!deletingQuizId) return
    
    setIsDeleting(true)
    try {
      await deleteQuiz(deletingQuizId)
      await loadQuizData()
      setShowDeleteModal(false)
      showSuccessToastMessage("Kuis berhasil dihapus")
    } catch (err) {
      console.error("Error deleting quiz:", err)
      setError(err.message || "Terjadi kesalahan saat menghapus kuis")
    } finally {
      setIsDeleting(false)
      setDeletingQuizId(null)
      setDeletingQuizTitle("")
    }
  }

  const handleEdit = (id, e) => {
    e.stopPropagation()
    navigate(`/coo/edit-quiz/${id}`)
  }

  const handleViewDetail = (id) => {
    navigate(`/coo/quiz/${id}`)
  }

  const handleViewResults = (id, e) => {
    e.stopPropagation()
    navigate(`/coo/quiz/${id}/hasil`)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const extension = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(extension)) {
      setError("Format file harus .xlsx, .xls, atau .csv")
      return
    }
    
    setImportFile(file)
  }

  const showSuccessToastMessage = (message) => {
    setSuccessMessage(message)
    setShowSuccessToast(true)
    setTimeout(() => {
      setShowSuccessToast(false)
    }, 3000)
  }

  const handleImport = async () => {
    if (!importFile) {
      setError("Pilih file Excel terlebih dahulu")
      return
    }
    
    setImporting(true)
    setImportProgress(0)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append("file", importFile)
      
      const interval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      const response = await importQuiz(formData)
      
      clearInterval(interval)
      setImportProgress(100)
      
      if (response.success) {
        const importedCount = response.data?.imported || response.data?.length || 0
        setShowImportModal(false)
        setImportFile(null)
        setImportProgress(0)
        await loadQuizData()
        showSuccessToastMessage(`${importedCount} kuis berhasil diimport`)
      } else {
        setError(response.message || "Gagal mengimport kuis")
      }
    } catch (err) {
      console.error("Error importing quiz:", err)
      setError(err.message || "Terjadi kesalahan saat mengimport kuis")
    } finally {
      setImporting(false)
    }
  }

  const resetFilters = () => {
    setSelectedDivisis([])
    setSelectedStatus("all")
    setSelectedLevel("all")
    setSearch("")
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
    } catch {
      return "Tanggal error"
    }
  }

  const toggleLevel = (level) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }))
  }

  const getLevelBadge = (level) => {
    const levelConfig = {
      1: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", icon: <Star size={12} className="text-emerald-500" />, label: "Level 1 - Pemula" },
      2: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", icon: <Zap size={12} className="text-blue-500" />, label: "Level 2 - Menengah" },
      3: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", icon: <Target size={12} className="text-purple-500" />, label: "Level 3 - Lanjutan" },
      4: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", icon: <Crown size={12} className="text-amber-500" />, label: "Level 4 - Expert" },
      5: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", icon: <Trophy size={12} className="text-rose-500" />, label: "Level 5 - Master" }
    }
    const config = levelConfig[level] || levelConfig[1]
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
        {config.icon}
        <span className="text-[10px] font-semibold">{config.label}</span>
      </div>
    )
  }

  const getLevelIcon = (level, size = 20) => {
    switch(level) {
      case 1: return <Star size={size} className="text-emerald-500" />
      case 2: return <Zap size={size} className="text-blue-500" />
      case 3: return <Target size={size} className="text-purple-500" />
      case 4: return <Crown size={size} className="text-amber-500" />
      case 5: return <Trophy size={size} className="text-rose-500" />
      default: return <Star size={size} className="text-emerald-500" />
    }
  }

  const getLevelColor = (level) => {
    switch(level) {
      case 1: return "from-emerald-500 to-teal-500"
      case 2: return "from-blue-500 to-cyan-500"
      case 3: return "from-purple-500 to-pink-500"
      case 4: return "from-amber-500 to-orange-500"
      case 5: return "from-rose-500 to-red-500"
      default: return "from-emerald-500 to-teal-500"
    }
  }

  const filtered = quiz.filter(q => {
    const matchesSearch = q.judul?.toLowerCase().includes(search.toLowerCase())
    const matchesDivisi = selectedDivisis.length === 0 || selectedDivisis.includes(q.divisi)
    const matchesStatus = selectedStatus === "all" || q.status === selectedStatus
    const matchesLevel = selectedLevel === "all" || q.level === parseInt(selectedLevel)
    return matchesSearch && matchesDivisi && matchesStatus && matchesLevel
  })

  const groupedQuiz = {}
  filtered.forEach(q => {
    if (!groupedQuiz[q.level]) {
      groupedQuiz[q.level] = []
    }
    groupedQuiz[q.level].push(q)
  })

  const sortedLevels = [1, 2, 3, 4, 5].filter(level => groupedQuiz[level] && groupedQuiz[level].length > 0)
  
  const totalQuiz = quiz.length
  const totalSoal = quiz.reduce((acc, q) => acc + (q.total_soal || 0), 0)
  const totalPeserta = quiz.reduce((acc, q) => acc + (q.peserta || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Memuat data kuis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* SUCCESS TOAST NOTIFICATION */}
        {showSuccessToast && (
          <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-white border-l-4 border-emerald-500 rounded-xl shadow-lg p-4 min-w-[280px]">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">Berhasil</p>
                  <p className="text-slate-500 text-xs">{successMessage}</p>
                </div>
                <button onClick={() => setShowSuccessToast(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-t-2xl"></div>
                <div className="px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Trash2 size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Hapus Kuis</h3>
                      <p className="text-xs text-slate-400">Konfirmasi penghapusan kuis</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                  <p className="text-slate-700 font-medium mb-1">Apakah Anda yakin?</p>
                  <p className="text-sm text-slate-500">
                    Kuis "<span className="font-semibold text-slate-700">{deletingQuizTitle}</span>" akan dihapus secara permanen. 
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingQuizId(null)
                    setDeletingQuizTitle("")
                  }}
                  disabled={isDeleting}
                  className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white transition disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Ya, Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                    Manajemen Kuis
                  </h1>
                
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari judul kuis..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 w-64 text-sm text-slate-700 shadow-sm"
                />
              </div>
              
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  showFilter 
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" 
                    : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                <Filter size={16} />
                Filter
                {(selectedDivisis.length > 0 || selectedStatus !== "all" || selectedLevel !== "all") && (
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                )}
              </button>
              
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all duration-200"
              >
                <FileSpreadsheet size={16} />
                Import Excel
              </button>
              
              <button
                onClick={() => navigate("/coo/add-quiz")}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Plus size={16} />
                Buat Kuis
              </button>
            </div>
          </div>
        </div>

        {/* FILTER PANEL */}
        {showFilter && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 mb-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Filter size={14} className="text-white" />
                </div>
                <h3 className="font-semibold text-slate-800">Filter Kuis</h3>
              </div>
              <button onClick={resetFilters} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-50 transition">
                <X size={12} />
                Reset Semua Filter
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
                  <Building2 size={12} />
                  Divisi
                </label>
                <select
                  value={selectedDivisis.length === 1 ? selectedDivisis[0] : "all"}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "all") {
                      setSelectedDivisis([])
                    } else {
                      setSelectedDivisis([value])
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="all">Semua Divisi</option>
                  {divisiList.map(div => (
                    <option key={div.id_divisi} value={div.nama_divisi}>
                      {div.nama_divisi}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
                  <Hash size={12} />
                  Level Kuis
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="all">Semua Level</option>
                  <option value="1">Level 1 - Pemula</option>
                  <option value="2">Level 2 - Menengah</option>
                  <option value="3">Level 3 - Lanjutan</option>
                  <option value="4">Level 4 - Expert</option>
                  <option value="5">Level 5 - Master</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
                  <Tag size={12} />
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="all">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-800">{totalQuiz}</p>
                <p className="text-sm text-slate-500 mt-1">Total Kuis</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-800">{totalSoal}</p>
                <p className="text-sm text-slate-500 mt-1">Total Soal</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-800">{totalPeserta}</p>
                <p className="text-sm text-slate-500 mt-1">Total Peserta</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-800">{sortedLevels.length}</p>
                <p className="text-sm text-slate-500 mt-1">Level Aktif</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* LEVEL ROADMAP */}
        <div className="mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 border border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Roadmap Kuis Bertingkat</h3>
            <span className="text-xs text-slate-400 ml-2">Peserta harus lulus level sebelumnya untuk melanjutkan</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            {[1, 2, 3, 4, 5].map(level => {
              const hasQuiz = filtered.some(q => q.level === level)
              const quizCount = filtered.filter(q => q.level === level).length
              
              return (
                <div key={level} className="flex flex-col items-center flex-1 min-w-[80px]">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                    hasQuiz 
                      ? `bg-gradient-to-r ${getLevelColor(level)} text-white shadow-lg`
                      : "bg-slate-200 text-slate-400"
                  }`}>
                    {getLevelIcon(level, 24)}
                  </div>
                  <span className="text-xs font-semibold mt-2 text-slate-700">Level {level}</span>
                  <span className="text-[10px] text-slate-400">{quizCount} kuis</span>
                  {level < 5 && (
                    <div className="hidden lg:block w-full h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 mt-2"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* QUIZ LIST GROUPED BY LEVEL */}
        <div className="space-y-5">
          {sortedLevels.map(level => (
            <div key={level} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              {/* Level Header - Clickable to Expand/Collapse */}
              <div 
                className={`px-6 py-4 border-b flex items-center justify-between cursor-pointer transition-all duration-200 hover:opacity-80 ${
                  level === 1 ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50" :
                  level === 2 ? "bg-gradient-to-r from-blue-50 to-blue-100/50" :
                  level === 3 ? "bg-gradient-to-r from-purple-50 to-purple-100/50" :
                  level === 4 ? "bg-gradient-to-r from-amber-50 to-amber-100/50" :
                  "bg-gradient-to-r from-rose-50 to-rose-100/50"
                }`}
                onClick={() => toggleLevel(level)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${getLevelColor(level)} shadow-md`}>
                    {getLevelIcon(level, 18)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-lg">Level {level}</h3>
                      <span className="text-xs text-slate-500 bg-white/50 px-2 py-0.5 rounded-full">
                        {groupedQuiz[level].length} Kuis
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {level === 1 && "Pemula - Dasar-dasar kompetensi yang harus dikuasai"}
                      {level === 2 && "Menengah - Pemahaman lanjutan dan aplikasi dasar"}
                      {level === 3 && "Lanjutan - Analisis dan evaluasi kasus kompleks"}
                      {level === 4 && "Expert - Penguasaan mendalam dan optimalisasi"}
                      {level === 5 && "Master - Kreasi, inovasi, dan kepemimpinan"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users size={14} />
                    <span>{groupedQuiz[level].reduce((sum, q) => sum + (q.peserta || 0), 0)} peserta</span>
                  </div>
                  <div className="w-px h-5 bg-slate-300 mx-2"></div>
                  <div className="text-slate-400">
                    {expandedLevels[level] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>
              
              {/* Level Content - Expandable */}
              {expandedLevels[level] && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kuis</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Soal</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durasi</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Passing</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {groupedQuiz[level].map((q) => {
                        const quizId = q.id
                        return (
                          <tr
                            key={quizId}
                            className="hover:bg-slate-50/70 transition-all duration-200 group cursor-pointer"
                            onClick={() => handleViewDetail(quizId)}
                          >
                            <td className="text-left px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm">
                                  <File size={16} className="text-indigo-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition">
                                    {q.judul}
                                  </p>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <Clock size={9} />
                                      {q.durasi} menit
                                    </span>
                                    <span className="text-[10px] text-slate-400">•</span>
                                    <span className="text-[10px] text-slate-400">
                                      Dibuat: {formatDate(q.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center px-6 py-4">
                              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                                <span className="text-xs font-medium text-slate-600">{q.divisi}</span>
                              </div>
                            </td>
                            <td className="text-center px-6 py-4">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                                <span className="font-bold text-slate-700 text-sm">{q.total_soal}</span>
                                <span className="text-xs text-slate-500">soal</span>
                              </div>
                            </td>
                            <td className="text-center px-6 py-4">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                                <Clock size={12} className="text-slate-500" />
                                <span className="text-xs font-medium text-slate-600">{q.durasi} menit</span>
                              </div>
                            </td>
                            <td className="text-center px-6 py-4">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                                <Users size={12} className="text-slate-500" />
                                <span className="text-xs font-medium text-slate-600">{q.peserta}</span>
                              </div>
                            </td>
                            <td className="text-center px-6 py-4">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                                <Target size={12} className="text-slate-500" />
                                <span className="text-xs font-medium text-slate-600">{q.passing}%</span>
                              </div>
                            </td>
                            <td className="text-center px-6 py-4">
                              {q.status === "aktif" ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-medium text-emerald-600">Aktif</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                  <span className="text-xs font-medium text-slate-500">Nonaktif</span>
                                </div>
                              )}
                            </td>
                            <td className="text-center px-6 py-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={(e) => handleViewResults(quizId, e)}
                                  className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
                                  title="Lihat Hasil Peserta"
                                >
                                  <BarChart3 size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetail(quizId);
                                  }}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                  title="Lihat Detail"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(quizId, e);
                                  }}
                                  className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                                  title="Edit Kuis"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal(quizId, q.judul, e);
                                  }}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="Hapus Kuis"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
          
          {sortedLevels.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <File size="32" className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Tidak ada kuis yang sesuai dengan filter</p>
              <button onClick={resetFilters} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all">
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* INFO BANNER */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Sistem Kuis Bertingkat</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kuis dikelompokkan berdasarkan <strong className="text-indigo-600">Level (1-5)</strong>. 
                Peserta harus menyelesaikan dan <strong className="text-emerald-600">LULUS</strong> (nilai ≥ passing grade) pada level sebelumnya 
                untuk dapat mengakses kuis di level berikutnya. 
                Gunakan ikon <BarChart3 size={12} className="inline text-purple-600" /> untuk melihat hasil dan progress peserta per level.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* IMPORT EXCEL MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-2xl"></div>
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Import Kuis</h3>
                    <p className="text-xs text-slate-400">Upload file Excel atau CSV</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false)
                    setImportFile(null)
                    setImportProgress(0)
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <FileSpreadsheet size={14} />
                  Format File:
                </p>
                <ul className="text-xs text-slate-600 space-y-1 ml-5 list-disc">
                  <li>judul_kuis (wajib) - Judul kuis</li>
                  <li>deskripsi (opsional) - Deskripsi kuis</li>
                  <li>divisi (opsional) - Nama divisi</li>
                  <li>durasi (opsional) - Durasi dalam menit, default 30</li>
                  <li>passing (opsional) - Nilai passing grade, default 75</li>
                  <li>level (opsional) - Level kuis (1-5), default 1</li>
                  <li>questions - JSON array berisi soal</li>
                </ul>
              </div>
              
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih File</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-emerald-600 file:to-teal-600 file:text-white hover:file:opacity-90 transition-all cursor-pointer"
                />
                {importFile && (
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                    <CheckCircle size={12} />
                    {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
              
              {importing && importProgress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Mengimport kuis...</span>
                    <span className="font-semibold text-emerald-600">{importProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportFile(null)
                  setImportProgress(0)
                }}
                className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white transition"
              >
                Batal
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Import Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-in { animation: fadeIn 0.2s ease-out; }
        .slide-in-from-top-2 { animation: slideInTop 0.3s ease-out; }
        .zoom-in-95 { animation: zoomIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInTop { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}

export default Quiz