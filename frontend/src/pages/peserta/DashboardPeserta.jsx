// src/pages/peserta/DashboardPeserta.jsx
import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ClipboardList,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Sparkles,
  BookOpen,
  FileText,
  TrendingUp,
  Library,
  Zap,
  Brain,
  Medal,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { getPesertaDashboard } from "../../api/peserta/dashboardService"

function DashboardPeserta() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalTugas: 0,
      tugasSelesai: 0,
      tugasPending: 0,
      tugasRevisi: 0,
      progress_tugas: 0,
      progress_kuis: 0,
      total_kuis: 0,
      kuis_selesai: 0,
      progress_materi: 0,
      total_materi: 0,
      materi_selesai: 0,
    },
    upcomingDeadlines: []
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setUser(parsed)
      } catch (e) {
        console.error("Error parsing user:", e)
      }
    }
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const dashboardResponse = await getPesertaDashboard()
      
      if (dashboardResponse.success && dashboardResponse.data) {
        const data = dashboardResponse.data
        
        // 🔍 DEBUG: Log untuk melihat data upcoming_deadlines dari backend
        console.log("📊 UPCOMING DEADLINES FROM BACKEND:", data.upcoming_deadlines)
        console.log("📊 FULL DASHBOARD DATA:", data)
        
        setDashboardData({
          stats: {
            totalTugas: Number(data.stats?.total_tugas ?? 0),
            tugasSelesai: Number(data.stats?.tugas_selesai ?? 0),
            tugasPending: Number(data.stats?.tugas_pending ?? 0),
            tugasRevisi: Number(data.stats?.tugas_revisi ?? 0),
            progress_tugas: Number(data.stats?.progress_tugas ?? 0),
            progress_kuis: Number(data.stats?.progress_kuis ?? 0),
            total_kuis: Number(data.stats?.total_kuis ?? 0),
            kuis_selesai: Number(data.stats?.kuis_selesai ?? 0),
            progress_materi: Number(data.stats?.progress_materi ?? 0),
            total_materi: Number(data.stats?.total_materi ?? 0),
            materi_selesai: Number(data.stats?.materi_selesai ?? 0),
          },
          upcomingDeadlines: data.upcoming_deadlines || []
        })
      } else {
        setError(dashboardResponse.message || "Gagal memuat data dashboard")
      }
    } catch (err) {
      console.error("Error loading dashboard:", err)
      setError(err.response?.data?.message || err.message || "Terjadi kesalahan saat memuat data")
    } finally {
      setLoading(false)
    }
  }

  // 🔥 Navigasi ke halaman tugas dengan highlight
  const handleTaskClick = (taskId) => {
    navigate('/peserta/tugas', {
      state: { highlightTaskId: taskId }
    })
  }

  const getCurrentGreeting = () => {
    const now = new Date()
    const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
    const hour = wibTime.getUTCHours()
    if (hour >= 3 && hour < 11) return "Selamat Pagi"
    if (hour >= 11 && hour < 15) return "Selamat Siang"
    if (hour >= 15 && hour < 19) return "Selamat Sore"
    return "Selamat Malam"
  }

  const formatDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const date = new Date()
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const formatDeadline = (deadlineString) => {
    if (!deadlineString) return "-"
    try {
      return new Date(deadlineString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    } catch (e) {
      return deadlineString
    }
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle size="48" className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Gagal Memuat Dashboard</h2>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button onClick={loadDashboardData} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Coba Lagi</button>
        </div>
      </div>
    )
  }

  const stats = dashboardData.stats
  const upcomingDeadlines = dashboardData.upcomingDeadlines

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-5">
      <div className="max-w-[1400px] mx-auto space-y-5">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 to-blue-800 px-6 py-6 shadow-md">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-xl blur-md"></div>
                <div className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">
                  {getCurrentGreeting()}, {user?.nama?.split(' ')[0] || "Peserta"}!
                </h1>
                <div className="mt-1">
                  <p className="text-xs text-white/70">{formatDate()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - 4 Kolom dengan ukuran sama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Progress Tugas Card */}
          <Link to="/peserta/tugas" className="block group">
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <ClipboardList size="18" className="text-white" />
                  </div>
                  <span className="text-2xl font-bold text-teal-600">{stats.progress_tugas}%</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">Progress Tugas</p>
                <p className="text-xs text-gray-400 mt-1">{stats.tugasSelesai} dari {stats.totalTugas} tugas selesai</p>
                <div className="mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${stats.progress_tugas}%` }}></div>
                </div>
              </div>
            </div>
          </Link>

          {/* Progress Kuis Card */}
          <Link to="/peserta/daftar-kuis-kompetensi" className="block group">
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                    <Brain size="18" className="text-white" />
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{stats.progress_kuis}%</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">Progress Kuis</p>
                <p className="text-xs text-gray-400 mt-1">{stats.kuis_selesai} dari {stats.total_kuis} kuis selesai</p>
                <div className="mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${stats.progress_kuis}%` }}></div>
                </div>
              </div>
            </div>
          </Link>

          {/* Tugas Revisi Card */}
          <Link to="/peserta/tugas?status=revisi" className="block group">
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-sm">
                    <RefreshCw size="18" className="text-white" />
                  </div>
                  <span className="text-2xl font-bold text-red-600">{stats.tugasRevisi}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">Tugas Revisi</p>
                <p className="text-xs text-gray-400 mt-1">Perlu perbaikan dari mentor</p>
                {stats.tugasRevisi > 0 && (
                  <div className="mt-2 text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle size="10" />
                    <span>Segera perbaiki!</span>
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Tugas Pending Card */}
          <Link to="/peserta/tugas?status=pending" className="block group">
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                    <Clock size="18" className="text-white" />
                  </div>
                  <span className="text-2xl font-bold text-amber-600">{stats.tugasPending}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">Tugas Pending</p>
                <p className="text-xs text-gray-400 mt-1">Perlu segera dikerjakan</p>
                {stats.tugasPending > 0 && (
                  <div className="mt-2 text-[10px] text-amber-600 flex items-center gap-1">
                    <TrendingUp size="10" />
                    <span>Segera selesaikan!</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Shortcut Cards - 🔥 PERBAIKAN: Ganti "tugas aktif" menjadi jumlah total tugas */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size="14" className="text-teal-500" />
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Akses Cepat</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/peserta/tugas">
              <div className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center group-hover:from-teal-500 group-hover:to-blue-600 transition-all duration-300">
                    <ClipboardList size="18" className="text-teal-600 group-hover:text-white transition-all duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Tugas</p>
                    <p className="text-[10px] text-gray-400">{stats.totalTugas} tugas</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/peserta/materi-kompetensi">
              <div className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300">
                    <BookOpen size="18" className="text-emerald-600 group-hover:text-white transition-all duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Materi</p>
                    <p className="text-[10px] text-gray-400">{stats.total_materi} materi</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/peserta/daftar-kuis-kompetensi">
              <div className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
                    <Brain size="18" className="text-purple-600 group-hover:text-white transition-all duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Kuis</p>
                    <p className="text-[10px] text-gray-400">{stats.total_kuis} kuis</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/peserta/nilai-akhir">
              <div className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:from-amber-500 group-hover:to-orange-500 transition-all duration-300">
                    <Medal size="18" className="text-amber-600 group-hover:text-white transition-all duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Nilai Akhir</p>
                    <p className="text-[10px] text-gray-400">Lihat hasil</p>
                  </div>
                </div>
                <ArrowRight size="14" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
            </Link>
          </div>
        </div>

        {/* Deadline Mendekat - Full Width */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="relative h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
                <AlertCircle size="14" className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Deadline Mendekat</h3>
                <p className="text-[10px] text-gray-400">Tugas yang perlu segera dikerjakan</p>
              </div>
            </div>
            <div className="space-y-2">
              {upcomingDeadlines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <CheckCircle size="32" className="text-gray-300 mb-3" />
                  <p className="text-sm font-medium">Tidak ada deadline mendekat</p>
                  <p className="text-xs text-gray-400 mt-1">Semua tugas masih aman</p>
                </div>
              ) : (
                upcomingDeadlines.slice(0, 5).map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50/30 hover:bg-orange-50 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">{deadline.days_left}</span>
                        <span className="text-[8px] text-orange-500">hari</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{deadline.judul || "Tugas Tanpa Judul"}</p>
                        <p className="text-[11px] text-gray-500">Deadline: {formatDeadline(deadline.deadline)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleTaskClick(deadline.id)}
                      className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-[11px] font-medium hover:shadow-md transition-all"
                    >
                      Kerjakan
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPeserta