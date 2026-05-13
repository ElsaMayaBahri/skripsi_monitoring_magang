// src/pages/coo/DaftarHasilKuis.jsx
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  FileText,
  Calendar,
  BarChart3,
  TrendingUp,
  CheckCircle,
  XCircle,
  Filter,
  X,
  User,
  BookOpen,
  Download,
  Award,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown as ChevronDownIcon
} from "lucide-react"

function DaftarHasilKuis() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showFilter, setShowFilter] = useState(false)
  
  // MULTIPLE SELECT FILTERS
  const [selectedDivisis, setSelectedDivisis] = useState([])
  const [selectedLevels, setSelectedLevels] = useState([])
  
  const [expandedUser, setExpandedUser] = useState(null)
  
  const perPage = 5

  // 🔥 DATA DUMMY DENGAN TINGKATAN KUIS
  const results = [
    {
      id: 1,
      user_name: "Ahmad Rizki",
      user_email: "ahmad.rizki@example.com",
      user_divisi: "Product Design",
      quizzes: [
        { level: 1, quiz_title: "Dasar UI/UX", score: 85, status: "lulus", passing: 70, tanggal: "2024-01-10T10:30:00.000Z", can_proceed: true },
        { level: 2, quiz_title: "Prinsip Desain", score: 78, status: "lulus", passing: 75, tanggal: "2024-01-15T11:20:00.000Z", can_proceed: true },
        { level: 3, quiz_title: "Design Thinking", score: 68, status: "tidak_lulus", passing: 75, tanggal: "2024-01-20T09:45:00.000Z", can_proceed: false }
      ]
    },
    {
      id: 2,
      user_name: "Siti Nurhaliza",
      user_email: "siti.nur@example.com",
      user_divisi: "Product Design",
      quizzes: [
        { level: 1, quiz_title: "Dasar UI/UX", score: 92, status: "lulus", passing: 70, tanggal: "2024-01-09T13:30:00.000Z", can_proceed: true },
        { level: 2, quiz_title: "Prinsip Desain", score: 88, status: "lulus", passing: 75, tanggal: "2024-01-12T14:15:00.000Z", can_proceed: true },
        { level: 3, quiz_title: "Design Thinking", score: 85, status: "lulus", passing: 75, tanggal: "2024-01-18T10:00:00.000Z", can_proceed: true },
        { level: 4, quiz_title: "Prototyping", score: 76, status: "lulus", passing: 70, tanggal: "2024-01-22T11:30:00.000Z", can_proceed: true }
      ]
    },
    {
      id: 3,
      user_name: "Budi Santoso",
      user_email: "budi.santoso@example.com",
      user_divisi: "UI/UX Design",
      quizzes: [
        { level: 1, quiz_title: "Dasar UI/UX", score: 68, status: "tidak_lulus", passing: 70, tanggal: "2024-01-08T08:45:00.000Z", can_proceed: false },
        { level: 1, quiz_title: "Dasar UI/UX (Ulangan)", score: 72, status: "lulus", passing: 70, tanggal: "2024-01-12T09:30:00.000Z", can_proceed: true },
        { level: 2, quiz_title: "Prinsip Desain", score: 65, status: "tidak_lulus", passing: 75, tanggal: "2024-01-18T10:15:00.000Z", can_proceed: false }
      ]
    },
    {
      id: 4,
      user_name: "Dewi Kartika",
      user_email: "dewi.kartika@example.com",
      user_divisi: "UI/UX Design",
      quizzes: [
        { level: 1, quiz_title: "Dasar UI/UX", score: 88, status: "lulus", passing: 70, tanggal: "2024-01-10T14:00:00.000Z", can_proceed: true },
        { level: 2, quiz_title: "Prinsip Desain", score: 82, status: "lulus", passing: 75, tanggal: "2024-01-15T09:45:00.000Z", can_proceed: true },
        { level: 3, quiz_title: "Design Thinking", score: 79, status: "lulus", passing: 75, tanggal: "2024-01-20T13:20:00.000Z", can_proceed: true }
      ]
    },
    {
      id: 5,
      user_name: "Eko Prasetyo",
      user_email: "eko.prasetyo@example.com",
      user_divisi: "Product Development",
      quizzes: [
        { level: 1, quiz_title: "Dasar Programming", score: 55, status: "tidak_lulus", passing: 70, tanggal: "2024-01-05T09:00:00.000Z", can_proceed: false },
        { level: 1, quiz_title: "Dasar Programming (Ulangan)", score: 60, status: "tidak_lulus", passing: 70, tanggal: "2024-01-10T10:00:00.000Z", can_proceed: false }
      ]
    },
    {
      id: 6,
      user_name: "Fitri Amelia",
      user_email: "fitri.amelia@example.com",
      user_divisi: "Product Development",
      quizzes: [
        { level: 1, quiz_title: "Dasar Programming", score: 88, status: "lulus", passing: 70, tanggal: "2024-01-08T11:30:00.000Z", can_proceed: true },
        { level: 2, quiz_title: "Algoritma", score: 85, status: "lulus", passing: 75, tanggal: "2024-01-12T14:00:00.000Z", can_proceed: true },
        { level: 3, quiz_title: "Data Structure", score: 72, status: "tidak_lulus", passing: 75, tanggal: "2024-01-18T09:30:00.000Z", can_proceed: false }
      ]
    },
    {
      id: 7,
      user_name: "Gunawan Wijaya",
      user_email: "gunawan@example.com",
      user_divisi: "Digital Marketing",
      quizzes: [
        { level: 1, quiz_title: "Digital Marketing Basic", score: 72, status: "lulus", passing: 70, tanggal: "2024-01-21T09:00:00.000Z", can_proceed: true },
        { level: 2, quiz_title: "SEO Fundamentals", score: 68, status: "tidak_lulus", passing: 75, tanggal: "2024-01-24T10:30:00.000Z", can_proceed: false }
      ]
    },
    {
      id: 8,
      user_name: "Hana Pratiwi",
      user_email: "hana.pratiwi@example.com",
      user_divisi: "Digital Marketing",
      quizzes: [
        { level: 1, quiz_title: "Digital Marketing Basic", score: 95, status: "lulus", passing: 70, tanggal: "2024-01-21T10:15:00.000Z", can_proceed: true },
        { level: 2, quiz_title: "SEO Fundamentals", score: 88, status: "lulus", passing: 75, tanggal: "2024-01-23T11:00:00.000Z", can_proceed: true },
        { level: 3, quiz_title: "Social Media Strategy", score: 82, status: "lulus", passing: 75, tanggal: "2024-01-26T09:45:00.000Z", can_proceed: true }
      ]
    },
    {
      id: 9,
      user_name: "Irfan Hakim",
      user_email: "irfan.hakim@example.com",
      user_divisi: "Finance",
      quizzes: [
        { level: 1, quiz_title: "Financial Basic", score: 62, status: "tidak_lulus", passing: 70, tanggal: "2024-01-21T11:00:00.000Z", can_proceed: false }
      ]
    },
    {
      id: 10,
      user_name: "Jasmine Putri",
      user_email: "jasmine@example.com",
      user_divisi: "Finance",
      quizzes: [
        { level: 1, quiz_title: "Financial Basic", score: 82, status: "lulus", passing: 70, tanggal: "2024-01-21T13:45:00.000Z", can_proceed: true },
        { level: 2, quiz_title: "Financial Analysis", score: 76, status: "lulus", passing: 75, tanggal: "2024-01-23T14:00:00.000Z", can_proceed: true },
        { level: 3, quiz_title: "Investment Strategy", score: 70, status: "tidak_lulus", passing: 75, tanggal: "2024-01-26T10:15:00.000Z", can_proceed: false }
      ]
    }
  ]

  const divisiList = [
    { id_divisi: 1, nama_divisi: "Product Design" },
    { id_divisi: 2, nama_divisi: "UI/UX Design" },
    { id_divisi: 3, nama_divisi: "Product Development" },
    { id_divisi: 4, nama_divisi: "Digital Marketing" },
    { id_divisi: 5, nama_divisi: "Finance" }
  ]

  const levelOptions = [1, 2, 3, 4]

  const toggleDivisi = (divisi) => {
    setSelectedDivisis(prev => 
      prev.includes(divisi) 
        ? prev.filter(d => d !== divisi)
        : [...prev, divisi]
    )
    setPage(1)
  }

  const toggleLevel = (level) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    )
    setPage(1)
  }

  const filteredResults = results.filter(user => {
    const matchesDivisi = selectedDivisis.length === 0 || selectedDivisis.includes(user.user_divisi)
    const matchesSearch = (user.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (user.user_email || "").toLowerCase().includes(search.toLowerCase())
    const matchesLevel = selectedLevels.length === 0 || user.quizzes.some(q => selectedLevels.includes(q.level))
    return matchesDivisi && matchesSearch && matchesLevel
  })

  const totalPages = Math.ceil(filteredResults.length / perPage)
  const paginatedResults = filteredResults.slice((page - 1) * perPage, page * perPage)

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    } catch {
      return "-"
    }
  }

  const getStatusBadge = (status) => {
    if (status === "lulus") {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          <CheckCircle size={12} className="text-emerald-500" />
          <span className="text-xs font-medium text-emerald-600">Lulus</span>
        </div>
      )
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200">
        <XCircle size={12} className="text-red-500" />
        <span className="text-xs font-medium text-red-600">Tidak Lulus</span>
      </div>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 90) return "text-yellow-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-emerald-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getLevelProgress = (quizzes) => {
    const completedLevels = quizzes.filter(q => q.status === "lulus").length
    const totalAttempts = quizzes.length
    const highestLevel = Math.max(...quizzes.map(q => q.level), 0)
    const currentLevel = highestLevel + 1
    const isBlocked = quizzes.some(q => q.status === "tidak_lulus" && q === quizzes[quizzes.length - 1])
    return { completedLevels, totalAttempts, currentLevel, isBlocked }
  }

  const resetFilters = () => {
    setSearch("")
    setSelectedDivisis([])
    setSelectedLevels([])
    setPage(1)
  }

  const handleExport = () => {
    alert("Demo: Export Excel akan tersedia setelah backend siap")
  }

  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

  const totalPeserta = results.length
  const totalKuis = [...new Set(results.flatMap(r => r.quizzes.map(q => q.quiz_title)))].length
  const rataRata = results.flatMap(r => r.quizzes.map(q => q.score)).reduce((a, b) => a + b, 0) / results.flatMap(r => r.quizzes).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">

        {/* NOTIFICATION */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800">Mode Demo - Sistem Tingkatan Kuis</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Peserta harus lulus kuis level 1 untuk bisa mengerjakan level 2, dan seterusnya.
              Filter dapat memilih lebih dari 1 divisi dan level.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              📊 {totalPeserta} peserta | {totalKuis} total kuis | Rata-rata nilai: {Math.round(rataRata)}
            </p>
          </div>
        </div>

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                    Progress Kuis Peserta
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Sistem tingkatan: lulus level N untuk membuka level N+1
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all duration-200"
              >
                <Download size={16} />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalPeserta}</p>
                <p className="text-xs text-slate-500">Total Peserta</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Users size={18} className="text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalKuis}</p>
                <p className="text-xs text-slate-500">Total Kuis</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{Math.round(rataRata)}</p>
                <p className="text-xs text-slate-500">Rata-rata Nilai</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {results.filter(u => u.quizzes.some(q => q.status === "lulus" && q.level === 3)).length}
                </p>
                <p className="text-xs text-slate-500">Lulus Level 3</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award size={18} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari peserta..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              showFilter ? "bg-indigo-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            <Filter size={16} />
            Filter
            {(selectedDivisis.length > 0 || selectedLevels.length > 0) && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* FILTER PANEL */}
        {showFilter && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-6 flex-wrap">
                {/* Filter Divisi */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-2 flex items-center gap-1">
                    <Building2 size={12} />
                    Divisi (Pilih lebih dari 1)
                  </label>
                  
                  {selectedDivisis.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {selectedDivisis.map(div => (
                        <span key={div} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">
                          {div}
                          <button onClick={() => toggleDivisi(div)} className="hover:text-indigo-900">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        if (selectedDivisis.length === divisiList.length) {
                          setSelectedDivisis([])
                        } else {
                          setSelectedDivisis(divisiList.map(d => d.nama_divisi))
                        }
                        setPage(1)
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      {selectedDivisis.length === divisiList.length ? "Hapus Semua" : "Pilih Semua"}
                    </button>
                    
                    {divisiList.map(div => (
                      <button
                        key={div.id_divisi}
                        onClick={() => toggleDivisi(div.nama_divisi)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          selectedDivisis.includes(div.nama_divisi)
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {div.nama_divisi}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Pilih {selectedDivisis.length} dari {divisiList.length} divisi</p>
                </div>
                
                {/* Filter Level */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-2 flex items-center gap-1">
                    <Award size={12} />
                    Level (Pilih lebih dari 1)
                  </label>
                  
                  {selectedLevels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {selectedLevels.map(level => (
                        <span key={level} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px]">
                          Level {level}
                          <button onClick={() => toggleLevel(level)} className="hover:text-purple-900">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        if (selectedLevels.length === levelOptions.length) {
                          setSelectedLevels([])
                        } else {
                          setSelectedLevels([...levelOptions])
                        }
                        setPage(1)
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      {selectedLevels.length === levelOptions.length ? "Hapus Semua" : "Pilih Semua"}
                    </button>
                    
                    {levelOptions.map(level => (
                      <button
                        key={level}
                        onClick={() => toggleLevel(level)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          selectedLevels.includes(level)
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Level {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Pilih {selectedLevels.length} dari {levelOptions.length} level</p>
                </div>
              </div>
              <button 
  onClick={resetFilters} 
  className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-medium rounded-lg hover:shadow-md hover:from-red-600 hover:to-rose-600 transition-all duration-200 flex items-center gap-1.5"
>
  <X size={12} />
  Reset Semua Filter
  {(selectedDivisis.length > 0 || selectedLevels.length > 0) && (
    <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-[10px]">
      {selectedDivisis.length + selectedLevels.length}
    </span>
  )}
</button>
            </div>
          </div>
        )}

        {/* RESULTS TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 w-10"></th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">Peserta</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600">Divisi</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-600">Progress</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-600">Level Saat Ini</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-600">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-600">Kuis Terakhir</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-600">Nilai Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedResults.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <BarChart3 size={40} className="text-slate-300" />
                        <p className="text-slate-500">Tidak ada data peserta</p>
                        <button onClick={resetFilters} className="text-indigo-600 text-sm">Reset Filter</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedResults.map((user) => {
                    const progress = getLevelProgress(user.quizzes)
                    const latestQuiz = user.quizzes[user.quizzes.length - 1]
                    const isExpanded = expandedUser === user.id
                    const isLocked = progress.isBlocked
                    
                    return (
                      <React.Fragment key={user.id}>
                        <tr 
                          className="hover:bg-slate-50 transition cursor-pointer"
                          onClick={() => toggleExpand(user.id)}
                        >
                          <td className="text-left px-5 py-3">
                            {isExpanded ? (
                              <ChevronUp size={18} className="text-slate-400" />
                            ) : (
                              <ChevronDownIcon size={18} className="text-slate-400" />
                            )}
                          </td>
                          <td className="text-left px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <User size={14} className="text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 text-sm">{user.user_name}</p>
                                <p className="text-xs text-slate-400">{user.user_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-left px-5 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                              <Building2 size={10} />
                              {user.user_divisi}
                            </span>
                          </td>
                          <td className="text-center px-5 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Award size={14} className="text-purple-500" />
                              <span className="text-sm font-semibold text-slate-700">
                                {progress.completedLevels} / {user.quizzes.length}
                              </span>
                            </div>
                          </td>
                          <td className="text-center px-5 py-3">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              isLocked 
                                ? "bg-red-100 text-red-600" 
                                : "bg-emerald-100 text-emerald-600"
                            }`}>
                              {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                              Level {progress.currentLevel}
                            </div>
                          </td>
                          <td className="text-center px-5 py-3">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                              isLocked 
                                ? "bg-red-50 border border-red-200" 
                                : "bg-emerald-50 border border-emerald-200"
                            }`}>
                              {isLocked ? (
                                <>
                                  <Lock size={12} className="text-red-500" />
                                  <span className="text-xs font-medium text-red-600">Terkunci</span>
                                </>
                              ) : (
                                <>
                                  <Unlock size={12} className="text-emerald-500" />
                                  <span className="text-xs font-medium text-emerald-600">Terbuka</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="text-center px-5 py-3">
                            <span className="text-sm text-slate-600">
                              {latestQuiz?.quiz_title || "-"}
                            </span>
                          </td>
                          <td className="text-center px-5 py-3">
                            {latestQuiz ? (
                              <span className={`font-bold text-lg ${getScoreColor(latestQuiz.score)}`}>
                                {Math.round(latestQuiz.score)}
                              </span>
                            ) : "-"}
                          </td>
                        </tr>
                        
                        {/* EXPANDED ROW */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50">
                            <td colSpan="8" className="px-5 py-4">
                              <div className="ml-8">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                                  <h4 className="text-sm font-semibold text-slate-700">Detail Kuis per Level</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {user.quizzes.map((quiz, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`p-3 rounded-lg border ${
                                        quiz.status === "lulus" 
                                          ? "bg-emerald-50 border-emerald-200" 
                                          : "bg-red-50 border-red-200"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            quiz.status === "lulus" 
                                              ? "bg-emerald-500 text-white" 
                                              : "bg-red-500 text-white"
                                          }`}>
                                            {quiz.level}
                                          </div>
                                          <span className="text-sm font-medium text-slate-700">{quiz.quiz_title}</span>
                                        </div>
                                        {getStatusBadge(quiz.status)}
                                      </div>
                                      <div className="flex justify-between items-center mt-2 text-xs">
                                        <span className="text-slate-500">
                                          <Calendar size={10} className="inline mr-1" />
                                          {formatDate(quiz.tanggal)}
                                        </span>
                                        <span className={`font-bold ${getScoreColor(quiz.score)}`}>
                                          {Math.round(quiz.score)} / {quiz.passing}
                                        </span>
                                      </div>
                                      {quiz.status !== "lulus" && quiz.level > 1 && (
                                        <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                          <Lock size={10} />
                                          <span>Harus lulus level {quiz.level - 1} terlebih dahulu</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-2 rounded-xl border transition-all ${
                page === 1 ? "border-slate-200 text-slate-300" : "border-slate-200 text-slate-600 hover:border-indigo-300"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-600">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-xl border transition-all ${
                page === totalPages ? "border-slate-200 text-slate-300" : "border-slate-200 text-slate-600 hover:border-indigo-300"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* LEGEND */}
        <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-700">Keterangan Sistem Tingkatan Kuis</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Lulus - Peserta berhasil melewati level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Tidak Lulus - Peserta harus mengulang</span>
                </div>
                <div className="flex items-center gap-2">
                  <Unlock size={12} className="text-emerald-500" />
                  <span className="text-xs text-slate-600">Terbuka - Level dapat dikerjakan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={12} className="text-red-500" />
                  <span className="text-xs text-slate-600">Terkunci - Harus lulus level sebelumnya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DaftarHasilKuis