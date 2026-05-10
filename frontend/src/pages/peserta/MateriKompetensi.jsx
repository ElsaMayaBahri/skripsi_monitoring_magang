// src/pages/peserta/MateriKompetensi.jsx
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  GraduationCap,
  BookOpen,
  Eye,
  Lock,
  CheckCircle,
  Calendar,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
  Zap,
  Sparkles
} from "lucide-react"

function MateriKompetensi() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [materiList, setMateriList] = useState([])
  const [filteredMateri, setFilteredMateri] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [accessedMateri, setAccessedMateri] = useState([])

  useEffect(() => {
    loadMateriData()
    const stored = JSON.parse(localStorage.getItem("materi_kompetensi_accessed") || "[]")
    setAccessedMateri(stored)
  }, [])

  const loadMateriData = () => {
    setLoading(true)
    setTimeout(() => {
      const dummyMateri = [
        {
          id: 1,
          judul: "Fundamental JavaScript",
          deskripsi: "Mempelajari konsep dasar JavaScript untuk pemula",
          divisi: "Frontend Development",
          durasi: "60 menit",
          created_at: "2024-12-01",
          is_accessed: false,
          quiz_available: true,
          quiz_id: 1
        },
        {
          id: 2,
          judul: "React JS Dasar",
          deskripsi: "Pengenalan React JS, komponen, props, dan state",
          divisi: "Frontend Development",
          durasi: "90 menit",
          created_at: "2024-12-05",
          is_accessed: false,
          quiz_available: true,
          quiz_id: 2
        },
        {
          id: 3,
          judul: "Tailwind CSS Framework",
          deskripsi: "Membangun UI modern dengan Tailwind CSS",
          divisi: "Frontend Development",
          durasi: "45 menit",
          created_at: "2024-12-10",
          is_accessed: false,
          quiz_available: true,
          quiz_id: 3
        },
        {
          id: 4,
          judul: "State Management Redux",
          deskripsi: "Mengelola state aplikasi dengan Redux Toolkit",
          divisi: "Frontend Development",
          durasi: "75 menit",
          created_at: "2024-12-15",
          is_accessed: false,
          quiz_available: false,
          quiz_id: null
        },
        {
          id: 5,
          judul: "Next.js Framework",
          deskripsi: "Membangun aplikasi React dengan Next.js",
          divisi: "Frontend Development",
          durasi: "80 menit",
          created_at: "2024-12-18",
          is_accessed: false,
          quiz_available: false,
          quiz_id: null
        },
        {
          id: 6,
          judul: "TypeScript untuk React",
          deskripsi: "Menggunakan TypeScript dalam pengembangan React",
          divisi: "Frontend Development",
          durasi: "60 menit",
          created_at: "2024-12-20",
          is_accessed: false,
          quiz_available: true,
          quiz_id: 4
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
    setFilteredMateri(filtered)
    setCurrentPage(1)
  }, [searchTerm, materiList])

  const markAsAccessed = (materi) => {
    const updatedMateri = materiList.map(m => 
      m.id === materi.id ? { ...m, is_accessed: true } : m
    )
    setMateriList(updatedMateri)
    const newAccessed = [...accessedMateri, materi.id]
    setAccessedMateri(newAccessed)
    localStorage.setItem("materi_kompetensi_accessed", JSON.stringify(newAccessed))
    
    if (materi.quiz_available && materi.quiz_id) {
      setTimeout(() => {
        if (window.confirm("Materi telah diakses! Apakah Anda ingin mengerjakan kuis sekarang?")) {
          navigate(`/peserta/kuis-kompetensi/${materi.quiz_id}`)
        }
      }, 500)
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMateri.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMateri.length / itemsPerPage)

  const accessedCount = materiList.filter(m => m.is_accessed).length
  const totalCount = materiList.length
  const progress = totalCount > 0 ? Math.round((accessedCount / totalCount) * 100) : 0

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
              Materi Kompetensi
            </h1>
            <p className="text-sm text-gray-500 mt-1">Materi pelatihan kompetensi sesuai divisi Anda</p>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-5 border border-purple-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
              <Target size="20" className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Progress Belajar Kompetensi</p>
              <p className="text-2xl font-bold text-purple-600">{progress}%</p>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{accessedCount} dari {totalCount} materi telah diakses</p>
          </div>
          {progress === 100 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100">
              <Award size="16" className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">Siap Ikuti Kuis!</span>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari materi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-2">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-700">{currentItems.length}</span> dari{" "}
          <span className="font-semibold text-gray-700">{filteredMateri.length}</span> materi kompetensi
        </p>
      </div>

      {/* Materi Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((materi, idx) => (
          <div key={materi.id} className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600`}></div>
            
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <BookOpen size="16" className="text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Materi #{idx + 1}</span>
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
              
              <h3 className="font-bold text-gray-800 text-lg mb-2">{materi.judul}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{materi.deskripsi}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size="12" />
                  <span>{materi.created_at}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <Clock size="12" />
                  <span>{materi.durasi}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Target size="12" />
                  <span>Divisi: {materi.divisi}</span>
                </div>
              </div>
              
              {materi.is_accessed ? (
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium cursor-default">
                    <Eye size="14" className="inline mr-1" />
                    Sudah Diakses
                  </button>
                  {materi.quiz_available && materi.quiz_id && (
                    <button
                      onClick={() => navigate(`/peserta/kuis-kompetensi/${materi.quiz_id}`)}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                    >
                      <Zap size="14" />
                      Kuis
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => markAsAccessed(materi)}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles size="14" />
                  Akses Materi
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMateri.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 py-12 text-center">
          <GraduationCap size="48" className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada materi kompetensi</p>
          <p className="text-sm text-gray-400 mt-1">Materi akan muncul sesuai divisi Anda</p>
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
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
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

export default MateriKompetensi