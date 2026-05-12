// src/pages/peserta/MateriMentor.jsx
import React, { useState, useEffect } from "react"
import {
  BookOpen,
  Eye,
  Calendar,
  User,
  FileText,
  Video,
  File,
  ChevronRight,
  ChevronLeft,
  Search,
  Clock,
  CheckCircle,
  Lock,
  Play,
  AlertCircle,
  Server,
  Download,
  X,
  FileCode,
  FileSpreadsheet,
  FileImage,
  Link as LinkIcon,
  ExternalLink,
  FormInput
} from "lucide-react"

function MateriMentor() {
  const [loading, setLoading] = useState(true)
  const [materiList, setMateriList] = useState([])
  const [filteredMateri, setFilteredMateri] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMateri, setSelectedMateri] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const itemsPerPage = 6

  // FLAG: Ubah ke true jika backend sudah siap
  const USE_REAL_API = false

  useEffect(() => {
    loadMateriData()
  }, [])

  // Load status akses dari localStorage
  useEffect(() => {
    const savedAccessed = localStorage.getItem("materi_accessed_dummy")
    if (savedAccessed && materiList.length > 0) {
      const accessedIds = JSON.parse(savedAccessed)
      const updatedMateri = materiList.map(m => ({
        ...m,
        is_accessed: accessedIds.includes(m.id) || m.is_accessed
      }))
      setMateriList(updatedMateri)
    }
  }, [materiList.length])

  const loadMateriData = () => {
    setLoading(true)
    
    if (USE_REAL_API) {
      setTimeout(() => {
        setMateriList([])
        setFilteredMateri([])
        setLoading(false)
      }, 500)
    } else {
      // DATA DUMMY DENGAN BERBAGAI TIPE MATERI (DIPERBANYAK UNTUK TEST PAGINATION)
      setTimeout(() => {
        const dummyMateri = [
          {
            id: 1,
            judul: "Introduction to React JS",
            deskripsi: "Mempelajari dasar-dasar React JS, komponen, props, dan state management",
            tipe: "video",
            durasi: "45 menit",
            file_size: "120 MB",
            created_at: "2024-12-01",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: false,
            file_url: "https://www.youtube.com/embed/SqcY0GlETPk",
            file_type: "mp4",
            file_name: "react_intro.mp4"
          },
          {
            id: 2,
            judul: "Panduan Magang 2024",
            deskripsi: "Dokumen panduan lengkap kegiatan magang",
            tipe: "pdf",
            durasi: null,
            file_size: "2.5 MB",
            created_at: "2024-12-05",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: false,
            file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            file_type: "pdf",
            file_name: "panduan_magang_2024.pdf"
          },
          {
            id: 3,
            judul: "Template Laporan Magang",
            deskripsi: "Template dokumen Word untuk laporan magang",
            tipe: "doc",
            durasi: null,
            file_size: "1.8 MB",
            created_at: "2024-12-10",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: false,
            file_url: "#",
            file_type: "docx",
            file_name: "template_laporan.docx",
            is_download_only: true
          },
          {
            id: 4,
            judul: "Rekap Data Peserta",
            deskripsi: "Data peserta magang dalam format Excel",
            tipe: "excel",
            durasi: null,
            file_size: "850 KB",
            created_at: "2024-12-12",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: false,
            file_url: "#",
            file_type: "xlsx",
            file_name: "rekap_peserta.xlsx",
            is_download_only: true
          },
          {
            id: 5,
            judul: "State Management with Redux",
            deskripsi: "Mengelola state aplikasi React menggunakan Redux Toolkit",
            tipe: "video",
            durasi: "60 menit",
            file_size: "250 MB",
            created_at: "2024-12-15",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: true,
            file_url: "https://www.youtube.com/embed/CVpUuw9XSjY",
            file_type: "mp4",
            file_name: "redux_tutorial.mp4"
          },
          {
            id: 6,
            judul: "API Integration Best Practices",
            deskripsi: "Cara terbaik mengintegrasikan API dengan React Query",
            tipe: "pdf",
            durasi: null,
            file_size: "5.2 MB",
            created_at: "2024-12-20",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: false,
            file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            file_type: "pdf",
            file_name: "api_best_practices.pdf"
          },
          {
            id: 7,
            judul: "Form Pendaftaran Project",
            deskripsi: "Google Form untuk pendaftaran project akhir magang",
            tipe: "google_form",
            durasi: null,
            file_size: null,
            created_at: "2024-12-22",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: false,
            file_url: "https://docs.google.com/forms/d/e/1FAIpQLSdummy/viewform",
            file_type: "form",
            file_name: null,
            is_external_link: true
          },
          {
            id: 8,
            judul: "Referensi Belajar Online",
            deskripsi: "Kumpulan link referensi belajar programming",
            tipe: "link",
            durasi: null,
            file_size: null,
            created_at: "2024-12-25",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: false,
            file_url: "https://www.w3schools.com/react/",
            file_type: "link",
            file_name: null,
            is_external_link: true
          },
          {
            id: 9,
            judul: "Slide Presentasi Magang",
            deskripsi: "Slide PPT untuk presentasi hasil magang",
            tipe: "ppt",
            durasi: null,
            file_size: "15 MB",
            created_at: "2024-12-28",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: false,
            file_url: "#",
            file_type: "pptx",
            file_name: "presentasi_magang.pptx",
            is_download_only: true
          },
          {
            id: 10,
            judul: "React Router Complete Guide",
            deskripsi: "Panduan lengkap React Router untuk navigasi aplikasi",
            tipe: "video",
            durasi: "55 menit",
            file_size: "180 MB",
            created_at: "2025-01-05",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: false,
            file_url: "https://www.youtube.com/embed/Ul3y1LXxzdU",
            file_type: "mp4",
            file_name: "react_router.mp4"
          },
          {
            id: 11,
            judul: "Database Design Patterns",
            deskripsi: "Pola desain database untuk aplikasi skala besar",
            tipe: "pdf",
            durasi: null,
            file_size: "4.8 MB",
            created_at: "2025-01-10",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: false,
            file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            file_type: "pdf",
            file_name: "database_design.pdf"
          },
          {
            id: 12,
            judul: "Git & GitHub Workshop",
            deskripsi: "Materi workshop version control dengan Git",
            tipe: "pdf",
            durasi: null,
            file_size: "3.2 MB",
            created_at: "2025-01-15",
            mentor: "Ahmad Budiman, S.Kom",
            is_accessed: true,
            file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            file_type: "pdf",
            file_name: "git_workshop.pdf"
          }
        ]
        setMateriList(dummyMateri)
        setFilteredMateri(dummyMateri)
        setLoading(false)
      }, 500)
    }
  }

  useEffect(() => {
    let filtered = [...materiList]
    
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedType !== "all") {
      filtered = filtered.filter(m => m.tipe === selectedType)
    }
    
    setFilteredMateri(filtered)
    setCurrentPage(1)
  }, [searchTerm, selectedType, materiList])

  const getTypeIcon = (tipe) => {
    switch(tipe) {
      case "video":
        return <Video size="16" className="text-blue-500" />
      case "pdf":
        return <FileText size="16" className="text-red-500" />
      case "doc":
        return <FileCode size="16" className="text-blue-600" />
      case "excel":
        return <FileSpreadsheet size="16" className="text-green-600" />
      case "ppt":
        return <FileImage size="16" className="text-orange-600" />
      case "link":
        return <LinkIcon size="16" className="text-purple-500" />
      case "google_form":
        return <FormInput size="16" className="text-indigo-500" />
      default:
        return <File size="16" className="text-gray-500" />
    }
  }

  const getTypeLabel = (tipe) => {
    switch(tipe) {
      case "video": return "Video"
      case "pdf": return "PDF"
      case "doc": return "Word"
      case "excel": return "Excel"
      case "ppt": return "PowerPoint"
      case "link": return "Link"
      case "google_form": return "Google Form"
      default: return "Materi"
    }
  }

  const getTypeColor = (tipe) => {
    switch(tipe) {
      case "video": return "from-blue-500 to-cyan-500"
      case "pdf": return "from-red-500 to-orange-500"
      case "doc": return "from-blue-600 to-indigo-600"
      case "excel": return "from-green-500 to-emerald-500"
      case "ppt": return "from-orange-500 to-red-500"
      case "link": return "from-purple-500 to-pink-500"
      case "google_form": return "from-indigo-500 to-purple-500"
      default: return "from-gray-500 to-gray-600"
    }
  }

  const markAsAccessed = (id) => {
    const updatedMateri = materiList.map(m => 
      m.id === id ? { ...m, is_accessed: true } : m
    )
    setMateriList(updatedMateri)
    const accessedIds = updatedMateri.filter(m => m.is_accessed).map(m => m.id)
    localStorage.setItem("materi_accessed_dummy", JSON.stringify(accessedIds))
  }

  const openMateri = (materi) => {
    setSelectedMateri(materi)
    setShowModal(true)
    
    if (!materi.is_accessed) {
      markAsAccessed(materi.id)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedMateri(null)
  }

  const handleDownload = (materi) => {
    // Untuk dummy, simulasi download
    alert(`📥 Download file: ${materi.file_name || materi.judul}\n\n(Pada implementasi real, file akan didownload dari server)`);
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMateri.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMateri.length / itemsPerPage)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative w-10 h-10 border-2 border-teal-400/30 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-6 py-5 space-y-5 pb-10 min-h-screen">
      {/* NOTE UNTUK BACKEND DEVELOPER */}
      <div className="bg-amber-50/80 border-l-4 border-amber-500 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Server size="16" className="text-amber-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800 text-sm">⚠️ Catatan untuk Backend Developer</h3>
            <div className="mt-2 text-xs text-amber-700 space-y-1">
              <p>📌 Halaman ini MASIH menggunakan <strong>DATA DUMMY</strong></p>
              <p>📌 Tipe materi: Video, PDF, Word, Excel, PPT, Link, Google Form</p>
              <p>📌 Backend perlu membuat 3 endpoint API:</p>
              <div className="bg-amber-100 rounded-md p-2 mt-1 font-mono text-xs">
                <p>1. GET    /api/peserta/materi</p>
                <p>2. GET    /api/peserta/materi/{`{id}`}</p>
                <p>3. POST   /api/peserta/materi/{`{id}`}/selesai</p>
              </div>
              <p>📌 Tabel database: <strong>akses_materi</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/5 to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
              Materi Mentor
            </h1>
            <p className="text-sm text-gray-500 mt-1">Materi pembelajaran dari mentor pembimbing</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari materi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedType("all")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "all" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Semua</button>
            <button onClick={() => setSelectedType("video")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "video" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Video</button>
            <button onClick={() => setSelectedType("pdf")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "pdf" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>PDF</button>
            <button onClick={() => setSelectedType("doc")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "doc" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Word</button>
            <button onClick={() => setSelectedType("excel")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "excel" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Excel</button>
            <button onClick={() => setSelectedType("ppt")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "ppt" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>PPT</button>
            <button onClick={() => setSelectedType("link")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "link" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Link</button>
            <button onClick={() => setSelectedType("google_form")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "google_form" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Form</button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-700">{currentItems.length}</span> dari{" "}
          <span className="font-semibold text-gray-700">{filteredMateri.length}</span> materi
        </p>
        {filteredMateri.length > 0 && (
          <p className="text-xs text-gray-400">Halaman {currentPage} dari {totalPages}</p>
        )}
      </div>

      {/* Materi Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentItems.map((materi) => (
          <div 
            key={materi.id} 
            onClick={() => openMateri(materi)}
            className="group relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getTypeColor(materi.tipe)}`}></div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    {getTypeIcon(materi.tipe)}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 uppercase">{getTypeLabel(materi.tipe)}</span>
                </div>
                {materi.is_accessed ? (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50">
                    <CheckCircle size="8" className="text-emerald-600" />
                    <span className="text-[8px] font-medium text-emerald-600">Sudah</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50">
                    <Lock size="8" className="text-amber-600" />
                    <span className="text-[8px] font-medium text-amber-600">Terkunci</span>
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">{materi.judul}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{materi.deskripsi}</p>
              
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <Calendar size="10" />
                  <span>{materi.created_at}</span>
                  {materi.durasi && <><span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span><Clock size="10" /><span>{materi.durasi}</span></>}
                  {materi.file_size && <><span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span><File size="10" /><span>{materi.file_size}</span></>}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <User size="10" />
                  <span>{materi.mentor}</span>
                </div>
              </div>
              
              <button className="w-full py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2">
                {materi.is_accessed ? (materi.tipe === "video" ? <Play size="14" /> : <Eye size="14" />) : <Lock size="14" />}
                {materi.is_accessed ? "Lihat Materi" : "Akses Materi"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMateri.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 py-12 text-center">
          <BookOpen size="48" className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada materi</p>
          <p className="text-sm text-gray-400 mt-1">Materi akan muncul setelah mentor membagikannya</p>
        </div>
      )}

      {/* Pagination - Untuk materi banyak */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size="18" />
          </button>
          
          <div className="flex gap-1.5">
            {getPageNumbers().map((page, idx) => (
              page === '...' ? (
                <span key={idx} className="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
              ) : (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size="18" />
          </button>
        </div>
      )}

      {/* Modal Detail Materi */}
      {showModal && selectedMateri && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  {getTypeIcon(selectedMateri.tipe)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">{selectedMateri.judul}</h2>
                  <p className="text-xs text-gray-500">Oleh: {selectedMateri.mentor} • {selectedMateri.created_at}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-white/50 transition">
                <X size="20" className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Deskripsi */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 text-sm mb-2">📖 Deskripsi Materi</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedMateri.deskripsi}</p>
              </div>

              {/* Konten Materi */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">📄 Konten Materi</h3>
                
                {/* Video */}
                {selectedMateri.tipe === "video" && (
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <iframe 
                      src={selectedMateri.file_url} 
                      className="w-full h-full" 
                      title={selectedMateri.judul}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  </div>
                )}

                {/* PDF Preview */}
                {selectedMateri.tipe === "pdf" && (
                  <div className="h-[500px] border rounded-lg overflow-hidden">
                    <iframe 
                      src={`${selectedMateri.file_url}#toolbar=1`} 
                      className="w-full h-full" 
                      title={selectedMateri.judul}
                    />
                  </div>
                )}

                {/* Dokumen (Word, Excel, PPT) - Download Only */}
                {["doc", "excel", "ppt"].includes(selectedMateri.tipe) && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      {getTypeIcon(selectedMateri.tipe)}
                    </div>
                    <p className="text-gray-700 font-medium mb-1">{selectedMateri.file_name || selectedMateri.judul}</p>
                    <p className="text-xs text-gray-400 mb-4">Ukuran file: {selectedMateri.file_size}</p>
                    <button 
                      onClick={() => handleDownload(selectedMateri)}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      <Download size="16" />
                      Download File
                    </button>
                    <p className="text-xs text-gray-400 mt-3">⚠️ File perlu didownload untuk dibuka</p>
                  </div>
                )}

                {/* Link & Google Form */}
                {["link", "google_form"].includes(selectedMateri.tipe) && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
                    <LinkIcon size="48" className="text-purple-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      {selectedMateri.tipe === "google_form" ? "📝 Materi berupa Google Form" : "🔗 Materi berupa link eksternal"}
                    </p>
                    <a 
                      href={selectedMateri.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      {selectedMateri.tipe === "google_form" ? "Buka Google Form" : "Buka Link"}
                      <ExternalLink size="14" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer dengan Tombol Download */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              {/* Tombol Download untuk semua tipe yang memiliki file */}
              {selectedMateri.file_url && selectedMateri.file_url !== "#" && selectedMateri.tipe !== "link" && selectedMateri.tipe !== "google_form" && (
                <button 
                  onClick={() => handleDownload(selectedMateri)}
                  className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <Download size="16" />
                  Download
                </button>
              )}
              
              {!selectedMateri.is_accessed && (
                <button 
                  onClick={() => {
                    markAsAccessed(selectedMateri.id)
                    setSelectedMateri({...selectedMateri, is_accessed: true})
                  }}
                  className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                >
                  Tandai Selesai
                </button>
              )}
              
              <button onClick={closeModal} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MateriMentor