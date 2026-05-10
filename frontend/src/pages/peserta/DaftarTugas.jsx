// src/pages/peserta/DaftarTugas.jsx
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
  Award
} from "lucide-react"

function DaftarTugas() {
  const [loading, setLoading] = useState(true)
  const [tugasList, setTugasList] = useState([])
  const [filteredTugas, setFilteredTugas] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    loadTugasData()
  }, [])

  const loadTugasData = () => {
    setLoading(true)
    setTimeout(() => {
      const storedTugas = JSON.parse(localStorage.getItem("tugas_peserta")) || []
      const dummyTugas = [
        {
          id: 1,
          judul: "Frontend Development - Week 3",
          deskripsi: "Buat halaman dashboard dengan React JS yang menampilkan data user",
          deadline: "2024-12-20",
          bobot: 30,
          status: "pending",
          submitted_at: null,
          nilai: null,
          catatan: null
        },
        {
          id: 2,
          judul: "Backend API Integration",
          deskripsi: "Buat API endpoint untuk CRUD user dengan Laravel",
          deadline: "2024-12-25",
          bobot: 35,
          status: "pending",
          submitted_at: null,
          nilai: null,
          catatan: null
        },
        {
          id: 3,
          judul: "Database Design",
          deskripsi: "Buat ERD dan implementasi database untuk sistem magang",
          deadline: "2024-12-30",
          bobot: 20,
          status: "revisi",
          submitted_at: "2024-12-28",
          nilai: 70,
          catatan: "Perbaiki relasi tabel dan tambahkan indeks"
        },
        {
          id: 4,
          judul: "UI/UX Design Prototype",
          deskripsi: "Buat prototype aplikasi mobile dengan Figma",
          deadline: "2024-12-18",
          bobot: 25,
          status: "selesai",
          submitted_at: "2024-12-17",
          nilai: 88,
          catatan: "Bagus, pertahankan!"
        }
      ]
      setTugasList(storedTugas.length > 0 ? storedTugas : dummyTugas)
      setFilteredTugas(storedTugas.length > 0 ? storedTugas : dummyTugas)
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    let filtered = [...tugasList]
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(t => t.status === filterStatus)
    }
    
    setFilteredTugas(filtered)
    setCurrentPage(1)
  }, [searchTerm, filterStatus, tugasList])

  const getStatusBadge = (status) => {
    switch(status) {
      case "selesai":
        return { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle, label: "Selesai" }
      case "revisi":
        return { bg: "bg-amber-100", text: "text-amber-700", icon: AlertCircle, label: "Perlu Revisi" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-600", icon: Clock, label: "Belum Dikumpulkan" }
    }
  }

  const getDeadlineStatus = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: "text-red-600", label: "Terlewat" }
    if (diffDays <= 3) return { text: "text-amber-600", label: `${diffDays} hari lagi` }
    return { text: "text-gray-500", label: `${diffDays} hari` }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTugas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTugas.length / itemsPerPage)

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
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
              Daftar Tugas
            </h1>
            <p className="text-sm text-gray-500 mt-1">Kelola dan kumpulkan tugas dari mentor</p>
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
              placeholder="Cari tugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-teal-400"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Belum Dikumpulkan</option>
            <option value="revisi">Perlu Revisi</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-2">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-700">{currentItems.length}</span> dari{" "}
          <span className="font-semibold text-gray-700">{filteredTugas.length}</span> tugas
        </p>
      </div>

      {/* Tugas List */}
      <div className="space-y-4">
        {currentItems.map((tugas) => {
          const status = getStatusBadge(tugas.status)
          const StatusIcon = status.icon
          const deadlineStatus = getDeadlineStatus(tugas.deadline)
          
          return (
            <div key={tugas.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">{tugas.judul}</h3>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                        <StatusIcon size="12" />
                        <span className="text-xs font-medium">{status.label}</span>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 ${deadlineStatus.text}`}>
                        <Calendar size="12" />
                        <span className="text-xs font-medium">Deadline: {deadlineStatus.label}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{tugas.deskripsi}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size="12" />
                        <span>{tugas.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award size="12" />
                        <span>Bobot: {tugas.bobot}%</span>
                      </div>
                      {tugas.nilai && (
                        <div className="flex items-center gap-1">
                          <Star size="12" className="text-amber-500" />
                          <span>Nilai: {tugas.nilai}</span>
                        </div>
                      )}
                    </div>
                    
                    {tugas.catatan && tugas.status === "revisi" && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-xs font-medium text-amber-800">Catatan Revisi:</p>
                        <p className="text-xs text-amber-700">{tugas.catatan}</p>
                      </div>
                    )}
                  </div>
                  
                  <Link to={`/peserta/tugas/${tugas.id}`}>
                    <button className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      tugas.status === "selesai"
                        ? "bg-gray-100 text-gray-500 cursor-default"
                        : "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md hover:shadow-lg"
                    }`} disabled={tugas.status === "selesai"}>
                      {tugas.status === "selesai" ? (
                        <>
                          <CheckCircle size="14" />
                          Sudah Dikumpulkan
                        </>
                      ) : tugas.status === "revisi" ? (
                        <>
                          <FileText size="14" />
                          Unggah Revisi
                        </>
                      ) : (
                        <>
                          <FileText size="14" />
                          Kumpulkan Tugas
                        </>
                      )}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredTugas.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 py-12 text-center">
          <ClipboardList size="48" className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada tugas</p>
          <p className="text-sm text-gray-400 mt-1">Tugas akan muncul setelah mentor memberikannya</p>
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

export default DaftarTugas