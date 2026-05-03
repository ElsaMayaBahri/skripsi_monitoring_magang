// Quiz.jsx - Halaman Manajemen Kuis
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../utils/api"
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
  TrendingUp,
  Info
} from "lucide-react"

function Quiz() {
  const [quiz, setQuiz] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingQuizId, setDeletingQuizId] = useState(null)
  const [deletingQuizTitle, setDeletingQuizTitle] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const navigate = useNavigate()
  const perPage = 5

  useEffect(() => {
    loadQuizData()
  }, [])

  const loadQuizData = async () => {
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
      
      const transformedData = quizData.map(q => ({
        id: q.id || q.id_kuis,
        judul: q.judul || q.title || q.judul_kuis || "Tanpa Judul",
        divisi: q.divisi || "Umum",
        durasi: q.durasi || q.duration || 30,
        peserta: q.peserta || q.participants || 0,
        total_soal: q.total_soal || q.questions?.length || 0,
        questions: q.questions || [],
        created_at: q.created_at || q.createdAt,
        status: q.status || "aktif",
        passing: q.passing || 75
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
      await api.deleteQuiz(deletingQuizId)
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
      
      const response = await api.importQuiz(formData)
      
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
    q.judul?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPage = Math.ceil(filtered.length / perPage)
  const currentData = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  )

  const totalQuiz = quiz.length
  const totalSoal = quiz.reduce(
    (acc, q) => acc + (q.total_soal || 0),
    0
  )
  const totalPeserta = quiz.reduce(
    (acc, q) => acc + (q.peserta || 0),
    0
  )

  const isEmpty = currentData.length === 0

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

  if (error && quiz.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 p-5 lg:p-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Gagal Memuat Data</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={loadQuizData}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Coba Lagi
            </button>
          </div>
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
                  <p className="text-slate-700 font-medium mb-1">
                    Apakah Anda yakin?
                  </p>
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
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Kelola, pantau, dan optimalkan semua kuis
                  </p>
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
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 w-64 text-sm text-slate-700 shadow-sm"
                />
              </div>
              
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

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
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
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-indigo-500" />
                <span className="text-[10px] text-indigo-600 font-semibold">Aktif</span>
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
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-600 font-semibold">Tersedia</span>
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
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-blue-500" />
                <span className="text-[10px] text-blue-600 font-semibold">Berpartisipasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X size={14} />
            </button>
          </div>
        )}

        {/* TABLE SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Kuis</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Divisi</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Soal</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Dibuat</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isEmpty ? (
                  <tr>
                    <td colSpan="5" className="text-center px-6 py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                          <File size="32" className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">Belum ada data kuis</p>
                        <button
                          onClick={() => navigate("/coo/add-quiz")}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                        >
                          <Plus size={16} />
                          Buat Kuis Sekarang
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentData.map((q) => {
                    const quizId = q.id
                    return (
                      <tr
                        key={quizId}
                        className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/30 transition-all duration-200 group cursor-pointer"
                      >
                        <td 
                          className="text-left px-6 py-4 cursor-pointer"
                          onClick={() => handleViewDetail(quizId)}
                        >
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
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Users size={9} />
                                  {q.peserta} peserta
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <CheckCircle size={9} />
                                  Passing: {q.passing}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td 
                          className="text-center px-6 py-4 cursor-pointer"
                          onClick={() => handleViewDetail(quizId)}
                        >
                          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                            <span className="text-xs font-medium text-slate-600">
                              {q.divisi}
                            </span>
                          </div>
                        </td>
                        <td 
                          className="text-center px-6 py-4 cursor-pointer"
                          onClick={() => handleViewDetail(quizId)}
                        >
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                            <span className="font-bold text-slate-700 text-sm">
                              {q.total_soal}
                            </span>
                            <span className="text-xs text-slate-500">soal</span>
                          </div>
                        </td>
                        <td className="text-center px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                              <Calendar size={12} className="text-slate-500" />
                            </div>
                            <span className="text-sm text-slate-600 font-medium">
                              {formatDate(q.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="text-center px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {!isEmpty && totalPage > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                page === 1
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-1.5">
              {[...Array(Math.min(totalPage, 5))].map((_, i) => {
                let pageNum = i + 1
                if (totalPage > 5 && page > 3) {
                  pageNum = page - 2 + i
                  if (pageNum > totalPage) return null
                }
                if (totalPage > 5 && page > 3 && i === 0 && pageNum > 2) {
                  return (
                    <span key="ellipsis1" className="px-3 py-2 text-slate-400 text-sm">...</span>
                  )
                }
                if (totalPage > 5 && page < totalPage - 2 && i === 3 && pageNum < totalPage - 1) {
                  return (
                    <span key="ellipsis2" className="px-3 py-2 text-slate-400 text-sm">...</span>
                  )
                }
                return (
                  <button
                    key={i}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-xl font-medium text-sm transition-all duration-200 ${
                      page === pageNum
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
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
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                page === totalPage
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* INFO BANNER */}
        <div className="mt-6 bg-slate-100 rounded-xl p-4 border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info size={16} className="text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Informasi</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Klik ikon mata untuk melihat detail kuis, ikon pensil untuk mengedit, 
                dan ikon tempat sampah untuk menghapus kuis. Gunakan tombol Import Excel 
                untuk mengimport banyak kuis sekaligus dengan file CSV/Excel.
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
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
        .slide-in-from-top-2 {
          animation: slideInTop 0.3s ease-out;
        }
        .zoom-in-95 {
          animation: zoomIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInTop {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
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
      `}</style>
    </div>
  )
}

export default Quiz