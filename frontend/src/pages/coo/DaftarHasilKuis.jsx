// src/pages/coo/DaftarHasilKuis.jsx
import React, { useState, useEffect } from "react"
import {
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle,
  XCircle,
  X,
  User,
  BookOpen,
  Download,
  Lock,
  ChevronUp,
  ChevronDown,
  Loader,
  Eye,
  Clock
} from "lucide-react"
import api from "../../api/axios"
import { getQuiz } from "../../api/coo/quizService"

function DaftarHasilKuis() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])
  const [divisiList, setDivisiList] = useState([])
  const [allQuizzes, setAllQuizzes] = useState([])
  const [allPeserta, setAllPeserta] = useState([])
  const [selectedDivisi, setSelectedDivisi] = useState("all")
  const [selectedDetailUser, setSelectedDetailUser] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  const perPage = 10
  const TOTAL_LEVELS = 3

  useEffect(() => {
    fetchAllPeserta()
    fetchDivisi()
    fetchAllData()
  }, [])

  const fetchAllPeserta = async () => {
    try {
      const response = await api.get('/peserta')
      if (response.data.success && response.data.data) {
        const aktifPeserta = response.data.data.filter(p => p.status === 'aktif' || !p.status)
        setAllPeserta(aktifPeserta)
      }
    } catch (err) {
      console.error('Error fetching peserta:', err)
      setAllPeserta([])
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const quizzesResponse = await getQuiz()
      let quizzesData = []
      if (quizzesResponse.success && quizzesResponse.data) {
        quizzesData = quizzesResponse.data.filter(q => q.status === "aktif")
        console.log("Jumlah quiz aktif:", quizzesData.length)
        setAllQuizzes(quizzesData)
      }
      
      const jawabanResponse = await api.get('/jawaban-kuis/all')
      
      if (jawabanResponse.data.success && jawabanResponse.data.data) {
        const transformedResults = transformToLevelProgress(jawabanResponse.data.data, quizzesData)
        setResults(transformedResults)
      } else {
        setResults([])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const transformToLevelProgress = (jawabanData, quizzesData) => {
    const quizzesByLevel = {}
    for (const kuis of quizzesData) {
      const level = kuis.level || 1
      if (!quizzesByLevel[level]) {
        quizzesByLevel[level] = []
      }
      quizzesByLevel[level].push({
        id_kuis: kuis.id_kuis,
        judul: kuis.judul_kuis,
        passing: kuis.passing || 75
      })
    }
    
    const userMap = new Map()
    
    for (const jawaban of jawabanData) {
      const userId = jawaban.id_user
      const userName = jawaban.user_name || `User ${userId}`
      const userEmail = jawaban.user_email || `${userName.toLowerCase().replace(/\s/g, '.')}@example.com`
      const userDivisi = jawaban.divisi || 'Umum'
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          user_name: userName,
          user_email: userEmail,
          user_divisi: userDivisi,
          levelProgress: {
            1: { completed: [], scores: [] },
            2: { completed: [], scores: [] },
            3: { completed: [], scores: [] }
          }
        })
      }
      
      const userData = userMap.get(userId)
      const kuis = quizzesData.find(q => Number(q.id_kuis) === Number(jawaban.id_kuis))
      
      if (kuis) {
        const level = kuis.level || 1
        const isPassed = jawaban.skor >= (kuis.passing || 75)
        
        if (!userData.levelProgress[level].completed.includes(kuis.id_kuis)) {
          userData.levelProgress[level].completed.push(kuis.id_kuis)
          userData.levelProgress[level].scores.push({
            id_kuis: kuis.id_kuis,
            judul: kuis.judul_kuis,
            skor: jawaban.skor,
            status: isPassed ? 'lulus' : 'tidak_lulus',
            passing: kuis.passing || 75,
            tanggal: jawaban.created_at
          })
        } else {
          const existingIndex = userData.levelProgress[level].scores.findIndex(s => s.id_kuis === kuis.id_kuis)
          if (existingIndex >= 0 && userData.levelProgress[level].scores[existingIndex].skor < jawaban.skor) {
            userData.levelProgress[level].scores[existingIndex] = {
              id_kuis: kuis.id_kuis,
              judul: kuis.judul_kuis,
              skor: jawaban.skor,
              status: isPassed ? 'lulus' : 'tidak_lulus',
              passing: kuis.passing || 75,
              tanggal: jawaban.created_at
            }
          }
        }
      }
    }
    
    const formattedResults = []
    for (const user of userMap.values()) {
      let currentLevel = 1
      let isBlocked = false
      const levelDetails = {}
      
      for (let level = 1; level <= TOTAL_LEVELS; level++) {
        const totalQuizzesInLevel = quizzesByLevel[level]?.length || 0
        const completedQuizzes = user.levelProgress[level]?.completed.length || 0
        const allPassed = totalQuizzesInLevel > 0 && 
          user.levelProgress[level]?.scores.every(s => s.status === 'lulus') || false
        
        levelDetails[level] = {
          total: totalQuizzesInLevel,
          completed: completedQuizzes,
          passed: allPassed,
          scores: user.levelProgress[level]?.scores || [],
          isUnlocked: !isBlocked
        }
        
        if (!allPassed && totalQuizzesInLevel > 0 && level < TOTAL_LEVELS) {
          isBlocked = true
        }
        
        if (!isBlocked && level < TOTAL_LEVELS) {
          currentLevel = level + 1
        }
      }
      
      let statusText = 'Belum Mengerjakan'
      let statusColor = 'text-slate-500'
      let statusBg = 'bg-slate-100'
      
      if (levelDetails[3]?.passed) {
        statusText = 'Tamat'
        statusColor = 'text-emerald-700'
        statusBg = 'bg-emerald-100'
      } else if (levelDetails[1]?.completed > 0 || levelDetails[2]?.completed > 0 || levelDetails[3]?.completed > 0) {
        statusText = 'Sedang Mengerjakan'
        statusColor = 'text-blue-600'
        statusBg = 'bg-blue-100'
      }
      
      formattedResults.push({
        ...user,
        currentLevel,
        levelDetails,
        statusText,
        statusColor,
        statusBg
      })
    }
    
    return formattedResults
  }

  const fetchDivisi = async () => {
    try {
      const response = await api.get('/divisi')
      if (response.data.success && response.data.data) {
        const aktifDivisi = response.data.data.filter(d => d.status === 'aktif')
        setDivisiList(aktifDivisi.map(d => ({ 
          id_divisi: d.id_divisi, 
          nama_divisi: d.nama_divisi 
        })))
      }
    } catch (err) {
      console.error('Error fetching divisi:', err)
      setDivisiList([])
    }
  }

  // Hitung jumlah quiz unik yang sudah dikerjakan
  const getCompletedQuizCount = (user) => {
    const uniqueQuiz = new Set()
    for (let level = 1; level <= TOTAL_LEVELS; level++) {
      user.levelDetails[level]?.scores?.forEach(score => {
        uniqueQuiz.add(score.id_kuis)
      })
    }
    return uniqueQuiz.size
  }

  // Fungsi baru untuk mendapatkan total quiz berdasarkan divisi
  const getTotalQuizDivisi = (user) => {
    return allQuizzes.filter(
      q =>
        q.status === "aktif" &&
        q.divisi === user.user_divisi
    ).length
  }

  const getProgressPercentage = (user) => {
    const completed = getCompletedQuizCount(user)
    const total = getTotalQuizDivisi(user)
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  const getAverageScore = (user) => {
    let allScores = []
    for (let level = 1; level <= TOTAL_LEVELS; level++) {
      const scores = user.levelDetails[level]?.scores || []
      allScores = [...allScores, ...scores.map(s => s.skor)]
    }
    return allScores.length > 0 
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) 
      : 0
  }

  const filteredResults = results.filter(user => {
    const matchesDivisi = selectedDivisi === "all" || user.user_divisi === selectedDivisi
    const matchesSearch = (user.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (user.user_email || "").toLowerCase().includes(search.toLowerCase())
    
    return matchesDivisi && matchesSearch
  })

  const getGlobalStats = () => {
    const totalPeserta = allPeserta.length > 0 ? allPeserta.length : results.length
    const pesertaYangMengerjakan = new Set(results.map(r => r.id)).size
    const belumMengerjakan = totalPeserta - pesertaYangMengerjakan
    const tamat = results.filter(u => u.statusText === "Tamat").length
    
    return { totalPeserta, belumMengerjakan, tamat }
  }

  const totalPages = Math.ceil(filteredResults.length / perPage)
  const paginatedResults = filteredResults.slice((page - 1) * perPage, page * perPage)
  const globalStats = getGlobalStats()

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    } catch {
      return "-"
    }
  }

  const getStatusBadge = (status) => {
    if (status === "lulus") {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200">
          <CheckCircle size={10} className="text-emerald-600" />
          <span className="text-[10px] font-semibold text-emerald-700">Lulus</span>
        </div>
      )
    }
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 border border-red-200">
        <XCircle size={10} className="text-red-500" />
        <span className="text-[10px] font-semibold text-red-600">Tidak Lulus</span>
      </div>
    )
  }

  const getScoreColor = (score, passing) => {
    if (score >= passing) return "text-emerald-600"
    if (score >= 70) return "text-amber-600"
    return "text-red-500"
  }

  const resetFilters = () => {
    setSearch("")
    setSelectedDivisi("all")
    setPage(1)
  }

  const handleExport = async () => {
    try {
      const exportData = results.map(user => ({
        'Nama Peserta': user.user_name,
        'Email': user.user_email,
        'Divisi': user.user_divisi,
        'Progress': `${getProgressPercentage(user)}%`,
        'Nilai Rata-rata': getAverageScore(user),
        'Status': user.statusText
      }))
      
      const headers = Object.keys(exportData[0] || {})
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => JSON.stringify(row[header] || '')).join(',')
        )
      ]
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'progress_kuis_per_level.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
      alert('Gagal export data')
    }
  }

  const openDetailModal = (user) => {
    setSelectedDetailUser(user)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedDetailUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={36} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Memuat data progress kuis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/10 to-slate-50">
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        {/* HEADER */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-xl">
          <div className="relative px-8 py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    Progress Kuis Kompetensi
                  </h1>
                  <p className="text-indigo-100 text-sm mt-1">
                    Lulus semua kuis di setiap level untuk membuka level berikutnya
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 border border-white/30 rounded-xl text-white text-sm font-medium hover:bg-white/30 transition-all"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* STATISTIK CARD - 3 KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-800">{globalStats.totalPeserta}</p>
                <p className="text-sm text-slate-500 mt-1">Peserta Aktif</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Users size={20} className="text-indigo-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-600">{globalStats.belumMengerjakan}</p>
                <p className="text-sm text-slate-500 mt-1">Belum Mengerjakan</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                <Clock size={20} className="text-orange-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-700">{globalStats.tamat}</p>
                <p className="text-sm text-emerald-600 mt-1">Tamat</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari peserta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-sm"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedDivisi}
              onChange={(e) => setSelectedDivisi(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 cursor-pointer min-w-[140px]"
            >
              <option value="all">Semua Divisi</option>
              {divisiList.map(div => (
                <option key={div.id_divisi} value={div.nama_divisi}>{div.nama_divisi}</option>
              ))}
            </select>
            
            {(selectedDivisi !== "all" || search) && (
              <button
                onClick={resetFilters}
                className="px-5 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <X size={16} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* TABEL */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">Peserta</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">Divisi</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">Progress</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500">Nilai Rata-rata</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedResults.map((user) => {
                  const progress = getProgressPercentage(user)
                  const avgScore = getAverageScore(user)
                  const completedQuiz = getCompletedQuizCount(user)
                  const totalQuizDivisi = getTotalQuizDivisi(user)
                  return (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="text-left px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <User size={16} className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{user.user_name}</p>
                            <p className="text-xs text-slate-400">{user.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-left px-6 py-4">
                        <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                          {user.user_divisi}
                        </span>
                      </td>
                      <td className="text-left px-6 py-4">
                        <div className="w-48">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">{progress}%</span>
                            <span className="text-slate-400">{completedQuiz}/{totalQuizDivisi} Quiz</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-2 bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-center px-6 py-4">
                        <span className={`font-bold text-lg ${avgScore >= 75 ? 'text-emerald-600' : avgScore >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                          {avgScore}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">/100</span>
                      </td>
                      <td className="text-center px-6 py-4">
                        <div className={`inline-flex px-3 py-1.5 rounded-lg ${user.statusBg}`}>
                          <span className={`text-xs font-semibold ${user.statusColor}`}>{user.statusText}</span>
                        </div>
                      </td>
                      <td className="text-center px-6 py-4">
                        <button
                          onClick={() => openDetailModal(user)}
                          className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          <Eye size={16} className="text-indigo-600" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 pt-8">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="py-2 text-sm text-slate-600">Halaman {page} dari {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* MODAL DETAIL PESERTA */}
      {showDetailModal && selectedDetailUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeDetailModal}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Detail Progress Peserta</h2>
                <p className="text-sm text-slate-500">{selectedDetailUser.user_name} - {selectedDetailUser.user_divisi}</p>
              </div>
              <button onClick={closeDetailModal} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <p className={`font-semibold ${selectedDetailUser.statusColor}`}>{selectedDetailUser.statusText}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Nilai Rata-rata</p>
                  <p className="font-semibold text-slate-800">{getAverageScore(selectedDetailUser)}/100</p>
                </div>
              </div>
              
              {[1, 2, 3].map(level => {
                const levelData = selectedDetailUser.levelDetails[level]
                if (!levelData || levelData.total === 0) return null
                return (
                  <div key={level} className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        level === 1 ? 'bg-amber-100 text-amber-700' : 
                        level === 2 ? 'bg-blue-100 text-blue-700' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {level}
                      </div>
                      <h3 className="font-semibold text-slate-800">Level {level}</h3>
                      <span className="text-xs text-slate-500 ml-auto">
                        {levelData.completed}/{levelData.total} Quiz
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {levelData.scores.map((quiz, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="font-medium text-sm mb-2 text-slate-800">{quiz.judul}</p>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-500">{formatDate(quiz.tanggal)}</span>
                            <span className={`font-bold ${getScoreColor(quiz.skor, quiz.passing)}`}>
                              {Math.round(quiz.skor)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            {getStatusBadge(quiz.status)}
                            <span className="text-[10px] text-slate-400">Passing: {quiz.passing}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DaftarHasilKuis