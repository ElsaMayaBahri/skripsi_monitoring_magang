// src/pages/peserta/DashboardPeserta.jsx
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Target,
  Shield,
  Sparkles,
  BookOpen,
  FileText,
  Trophy,
  Bell,
  Activity,
  Zap,
  Gem,
  Crown
} from "lucide-react"

function DashboardPeserta() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalTugas: 0,
    tugasSelesai: 0,
    tugasPending: 0,
    tugasRevisi: 0,
    persentase: 0,
    kehadiran: 0,
    kehadiranBulanIni: 0,
    totalHari: 0,
    rataRataNilai: 0,
    peringkat: 3,
    totalPeserta: 25
  })
  const [recentTasks, setRecentTasks] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [notifications, setNotifications] = useState([])

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

  const loadDashboardData = () => {
    setLoading(true)
    setTimeout(() => {
      const storedTugas = JSON.parse(localStorage.getItem("tugas_peserta")) || []
      const tugasSelesai = storedTugas.filter(t => t.status === "selesai").length
      const tugasRevisi = storedTugas.filter(t => t.status === "revisi").length
      const tugasPending = storedTugas.filter(t => t.status === "pending").length
      
      const storedPresensi = JSON.parse(localStorage.getItem("presensi_peserta")) || []
      const bulanIni = new Date().getMonth()
      const presensiBulanIni = storedPresensi.filter(p => new Date(p.tanggal).getMonth() === bulanIni)
      const hadirCount = presensiBulanIni.filter(p => p.status === "hadir" || p.status === "terlambat").length
      const kehadiran = presensiBulanIni.length > 0 ? Math.round((hadirCount / presensiBulanIni.length) * 100) : 0
      
      setStats({
        totalTugas: storedTugas.length || 12,
        tugasSelesai: tugasSelesai || 8,
        tugasPending: tugasPending || 2,
        tugasRevisi: tugasRevisi || 2,
        persentase: storedTugas.length > 0 ? Math.round((tugasSelesai / storedTugas.length) * 100) : 67,
        kehadiran: kehadiran || 92,
        kehadiranBulanIni: hadirCount || 18,
        totalHari: presensiBulanIni.length || 20,
        rataRataNilai: 85.5,
        peringkat: 3,
        totalPeserta: 25
      })
      
      setRecentTasks([
        { id: 1, judul: "Frontend Development - Week 3", deadline: "2024-12-20", status: "pending", progress: 60 },
        { id: 2, judul: "Backend API Integration", deadline: "2024-12-25", status: "pending", progress: 30 },
        { id: 3, judul: "Database Design", deadline: "2024-12-30", status: "selesai", progress: 100 },
      ])
      
      setUpcomingDeadlines([
        { id: 1, judul: "UI/UX Design Prototype", deadline: "2024-12-18", daysLeft: 2 },
        { id: 2, judul: "Frontend Development - Week 3", deadline: "2024-12-20", daysLeft: 4 },
      ])
      
      setRecentActivities([
        { id: 1, action: "Mengumpulkan tugas Frontend", time: "2 jam lalu", type: "tugas" },
        { id: 2, action: "Check-in hari ini", time: "08:15", type: "presensi" },
        { id: 3, action: "Mendapat notifikasi revisi tugas", time: "kemarin", type: "notif" },
      ])
      
      const storedNotif = JSON.parse(localStorage.getItem("notifications")) || []
      setNotifications(storedNotif.filter(n => n.target === "peserta" || n.target === "all").slice(0, 3))
      
      setLoading(false)
    }, 500)
  }

  const getCurrentGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Selamat Pagi"
    if (hour < 18) return "Selamat Siang"
    return "Selamat Malam"
  }

  const formatDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const date = new Date()
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

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
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                {getCurrentGreeting()}, {user?.nama?.split(' ')[0] || "Peserta"}!
              </h1>
              <p className="text-sm text-gray-500 mt-1">{formatDate()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Progress Belajar</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">{stats.persentase}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-50 flex items-center justify-center">
              <Target size="20" className="text-teal-600" />
            </div>
          </div>
          <div className="relative mt-3">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${stats.persentase}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{stats.tugasSelesai} dari {stats.totalTugas} tugas selesai</p>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Kehadiran Bulan Ini</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.kehadiran}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
              <Calendar size="20" className="text-emerald-600" />
            </div>
          </div>
          <div className="relative mt-3">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${stats.kehadiran}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{stats.kehadiranBulanIni} dari {stats.totalHari} hari hadir</p>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Rata-rata Nilai</p>
              <p className="text-3xl font-bold text-purple-600">{stats.rataRataNilai}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
              <Award size="20" className="text-purple-600" />
            </div>
          </div>
          <div className="relative mt-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} size="14" className={`${stats.rataRataNilai >= star * 20 ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Nilai rata-rata semua tugas</p>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-white/80 font-medium">Peringkat</p>
              <p className="text-3xl font-bold text-white">#{stats.peringkat}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Trophy size="20" className="text-white" />
            </div>
          </div>
          <div className="relative mt-3">
            <p className="text-[10px] text-white/80">dari {stats.totalPeserta} peserta</p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* Recent Tasks & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-md">
                  <ClipboardList size="16" className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Tugas Terbaru</h3>
                  <p className="text-[10px] text-gray-400">Progress tugas yang sedang dikerjakan</p>
                </div>
              </div>
              <Link to="/peserta/tugas" className="text-xs text-teal-600 hover:text-teal-700 font-medium">Lihat semua →</Link>
            </div>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${task.status === "selesai" ? "bg-emerald-100" : "bg-amber-100"}`}>
                      {task.status === "selesai" ? <CheckCircle size="14" className="text-emerald-600" /> : <Clock size="14" className="text-amber-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">{task.judul}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full" style={{ width: `${task.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] font-medium text-teal-600">{task.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-blue-500 to-teal-500"></div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-teal-600 shadow-md">
                <Activity size="16" className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Aktivitas Terbaru</h3>
                <p className="text-[10px] text-gray-400">Riwayat aktivitas Anda</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all duration-200">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    {activity.type === "tugas" && <FileText size="12" className="text-teal-600" />}
                    {activity.type === "presensi" && <Calendar size="12" className="text-teal-600" />}
                    {activity.type === "notif" && <Bell size="12" className="text-teal-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{activity.action}</p>
                    <p className="text-[10px] text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deadline & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
                <AlertCircle size="16" className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Deadline Mendekat</h3>
                <p className="text-[10px] text-gray-400">Tugas yang perlu segera dikerjakan</p>
              </div>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50/30 hover:bg-red-50 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold text-red-600">{deadline.daysLeft}</span>
                      <span className="text-[8px] text-red-500">hari</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{deadline.judul}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Deadline: {deadline.deadline}</p>
                    </div>
                  </div>
                  <Link to={`/peserta/tugas/${deadline.id}`}>
                    <button className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all">
                      Kerjakan
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md">
                <Bell size="16" className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Notifikasi Terbaru</h3>
                <p className="text-[10px] text-gray-400">Update terbaru untuk Anda</p>
              </div>
              {unreadCount > 0 && (
                <span className="ml-auto text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount} baru</span>
              )}
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Belum ada notifikasi</p>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <div key={idx} className={`p-3 rounded-xl transition-all duration-200 ${!notif.is_read ? 'bg-teal-50/50 border-l-2 border-teal-500' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${!notif.is_read ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-800">{notif.judul}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{notif.pesan}</p>
                        <p className="text-[9px] text-gray-400 mt-1">{notif.created_at || "Baru saja"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/peserta/presensi">
          <button className="w-full py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 hover:text-teal-600">
            <Calendar size="16" />
            <span className="text-sm font-medium">Check-in</span>
          </button>
        </Link>
        <Link to="/peserta/tugas">
          <button className="w-full py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 hover:text-teal-600">
            <FileText size="16" />
            <span className="text-sm font-medium">Tugas</span>
          </button>
        </Link>
        <Link to="/peserta/materi-mentor">
          <button className="w-full py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 hover:text-teal-600">
            <BookOpen size="16" />
            <span className="text-sm font-medium">Materi</span>
          </button>
        </Link>
        <Link to="/peserta/nilai-akhir">
          <button className="w-full py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 hover:text-teal-600">
            <Award size="16" />
            <span className="text-sm font-medium">Nilai Akhir</span>
          </button>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div>
            <div className="relative p-2.5 bg-white rounded-xl shadow-md">
              <Shield size="16" className="text-teal-500" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-teal-800">Informasi Magang</p>
            <p className="text-xs text-teal-700 mt-1 leading-relaxed">
              Pastikan Anda mengumpulkan semua tugas tepat waktu, melakukan check-in setiap hari, 
              dan mengisi daily report sebelum check-out. Jika ada kendala, segera hubungi mentor pembimbing Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPeserta