// src/pages/peserta/MateriMentor.jsx
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BookOpen,
  Download,
  Eye,
  Calendar,
  User,
  FileText,
  Video,
  File,
  ChevronRight,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Lock,
  Play,
  FileArchive
} from "lucide-react"

function MateriMentor() {
  const [loading, setLoading] = useState(true)
  const [materiList, setMateriList] = useState([])
  const [filteredMateri, setFilteredMateri] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    loadMateriData()
  }, [])

  const loadMateriData = () => {
    setLoading(true)
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
          is_accessed: true,
          url: "#",
          progress: 100
        },
        {
          id: 2,
          judul: "Tailwind CSS Mastery",
          deskripsi: "Panduan lengkap menggunakan Tailwind CSS untuk styling modern",
          tipe: "pdf",
          durasi: null,
          file_size: "8.5 MB",
          created_at: "2024-12-05",
          mentor: "Ahmad Budiman, S.Kom",
          is_accessed: true,
          url: "#",
          progress: 100
        },
        {
          id: 3,
          judul: "State Management with Redux",
          deskripsi: "Mengelola state aplikasi React menggunakan Redux Toolkit",
          tipe: "video",
          durasi: "60 menit",
          file_size: "250 MB",
          created_at: "2024-12-10",
          mentor: "Ahmad Budiman, S.Kom",
          is_accessed: false,
          url: "#",
          progress: 0
        },
        {
          id: 4,
          judul: "API Integration Best Practices",
          deskripsi: "Cara terbaik mengintegrasikan API dengan React Query",
          tipe: "pdf",
          durasi: null,
          file_size: "5.2 MB",
          created_at: "2024-12-15",
          mentor: "Ahmad Budiman, S.Kom",
          is_accessed: false,
          url: "#",
          progress: 0
        }
      ]
      setMateriList(dummyMateri)
      setFilteredMateri(dummyMateri)
      setLoading(false)
    }, 500)
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
      default:
        return <File size="16" className="text-gray-500" />
    }
  }

  const getTypeColor = (tipe) => {
    switch(tipe) {
      case "video":
        return "from-blue-500 to-cyan-500"
      case "pdf":
        return "from-red-500 to-orange-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const markAsAccessed = (id) => {
    const updatedMateri = materiList.map(m => 
      m.id === id ? { ...m, is_accessed: true, progress: 100 } : m
    )
    setMateriList(updatedMateri)
    localStorage.setItem("materi_accessed", JSON.stringify(updatedMateri.filter(m => m.is_accessed).map(m => m.id)))
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMateri.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMateri.length / itemsPerPage)

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
    <div className="space-y-6">
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedType === "all"
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedType("video")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedType === "video"
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Video
            </button>
            <button
              onClick={() => setSelectedType("pdf")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedType === "pdf"
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-2">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-700">{currentItems.length}</span> dari{" "}
          <span className="font-semibold text-gray-700">{filteredMateri.length}</span> materi
        </p>
      </div>

      {/* Materi Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((materi) => (
          <div key={materi.id} className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getTypeColor(materi.tipe)}`}></div>
            
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    {getTypeIcon(materi.tipe)}
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase">{materi.tipe}</span>
                </div>
                {materi.is_accessed ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100">
                    <CheckCircle size="10" className="text-emerald-600" />
                    <span className="text-[9px] font-medium text-emerald-600">Sudah Diakses</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100">
                    <Lock size="10" className="text-amber-600" />
                    <span className="text-[9px] font-medium text-amber-600">Belum Diakses</span>
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{materi.judul}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{materi.deskripsi}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size="12" />
                  <span>{materi.created_at}</span>
                  {materi.durasi && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <Clock size="12" />
                      <span>{materi.durasi}</span>
                    </>
                  )}
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <File size="12" />
                  <span>{materi.file_size}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User size="12" />
                  <span>{materi.mentor}</span>
                </div>
              </div>
              
              {materi.is_accessed ? (
                <a href={materi.url} target="_blank" rel="noopener noreferrer">
                  <button className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                    {materi.tipe === "video" ? <Play size="14" /> : <Eye size="14" />}
                    {materi.tipe === "video" ? "Tonton Materi" : "Baca Materi"}
                  </button>
                </a>
              ) : (
                <button
                  onClick={() => markAsAccessed(materi.id)}
                  className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Lock size="14" />
                  Akses Materi
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMateri.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 py-12 text-center">
          <BookOpen size="48" className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada materi</p>
          <p className="text-sm text-gray-400 mt-1">Materi akan muncul setelah mentor membagikannya</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">Halaman {currentPage} dari {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size="18" />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size="18" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MateriMentor