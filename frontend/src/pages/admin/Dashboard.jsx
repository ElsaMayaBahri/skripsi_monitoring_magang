// src/pages/admin/DashboardAdmin.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getPeserta, getMentors, getDivisi } from "../../api/admin/dashboardService"
import { getActivities } from "../../utils/activityLogger"
import {
  Users,
  UserCheck,
  Building2,
  UserX,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Activity,
  Shield,
  Search,
  Layers,
  Clock,
  UserPlus,
  Edit3,
  Trash2,
  ArrowUpRight,
} from "lucide-react"

function DashboardAdmin() {
  const navigate = useNavigate()
  const [pesertaList, setPesertaList] = useState([])
  const [mentorList, setMentorList] = useState([])
  const [divisiList, setDivisiList] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activities, setActivities] = useState([])

  // Load activities dari localStorage
  const loadActivities = () => {
    try {
      const savedActivities = getActivities()
      setActivities(savedActivities || [])
    } catch (err) {
      console.error("Error loading activities:", err)
      setActivities([])
    }
  }

  // Fetch all data from backend
  const fetchAllData = async () => {
    setLoading(true)
    setError("")
    try {
      console.log("=== FETCHING DATA FROM BACKEND ===")
      
      // Panggil API services
      const [pesertaData, mentorData, divisiData] = await Promise.all([
        getPeserta(),
        getMentors(),
        getDivisi(),
      ])
      
      console.log("Peserta data:", pesertaData?.length || 0, "items")
      console.log("Mentor data:", mentorData?.length || 0, "items")
      console.log("Divisi data:", divisiData?.length || 0, "items")
      
      // Set state dengan data yang sudah diolah service
      setPesertaList(Array.isArray(pesertaData) ? pesertaData : [])
      setMentorList(Array.isArray(mentorData) ? mentorData : [])
      setDivisiList(Array.isArray(divisiData) ? divisiData : [])
      
      // Load activities setelah data berhasil
      loadActivities()
      
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Gagal memuat data: " + (err.message || "Koneksi ke server gagal"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    
    // Event listener untuk storage change (activities)
    const handleStorageChange = (e) => {
      if (e.key === "system_activities") {
        loadActivities()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    
    // Refresh activities setiap 10 detik
    const interval = setInterval(() => {
      loadActivities()
    }, 10000)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Hitung statistik
  const totalPeserta = pesertaList.length
  const totalMentor = mentorList.length
  const totalDivisi = divisiList.filter(d => d.status === "aktif" || d.status_akun === "aktif").length
  const totalAkun = totalPeserta + totalMentor

  const nonAktifPeserta = pesertaList.filter((p) => {
    const status = p.user?.status_akun || p.status_akun || p.status
    return status === "non_aktif" || status === "nonaktif" || status === "inactive"
  }).length
  
  const nonAktifMentor = mentorList.filter((m) => {
    const status = m.user?.status_akun || m.status_akun || m.status
    return status === "non_aktif" || status === "nonaktif" || status === "inactive"
  }).length
  
  const nonAktif = nonAktifPeserta + nonAktifMentor
  const aktif = totalAkun - nonAktif

  // Statistik divisi teratas
  const divisiStats = divisiList
    .filter(div => div.status === "aktif" || div.status_akun === "aktif")
    .map((div) => {
      const divisiId = div.id_divisi || div.id
      const divisiName = div.nama_divisi || div.nama || "-"
      
      const pesertaCount = pesertaList.filter(p => {
        const pDivisiId = p.id_divisi || p.divisi?.id_divisi
        const pDivisiName = p.divisi?.nama_divisi || p.nama_divisi
        if (pDivisiId && pDivisiId == divisiId) return true
        if (pDivisiName === divisiName) return true
        return false
      }).length
      
      const mentorCount = mentorList.filter(m => {
        const mDivisiId = m.id_divisi || m.divisi?.id_divisi
        const mDivisiName = m.divisi?.nama_divisi || m.nama_divisi
        if (mDivisiId && mDivisiId == divisiId) return true
        if (mDivisiName === divisiName) return true
        return false
      }).length
      
      return {
        id: divisiId,
        nama: divisiName.length > 18 ? divisiName.substring(0, 16) + "..." : divisiName,
        peserta: pesertaCount,
        mentor: mentorCount,
      }
    })
    .sort((a, b) => b.peserta - a.peserta)
    .slice(0, 3)

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Tanggal tidak valid"
      
      const now = new Date()
      const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return `Hari ini, ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
      } else if (diffDays === 1) {
        return `Kemarin, ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
      } else if (diffDays < 7) {
        return `${diffDays} hari yang lalu`
      } else {
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })
      }
    } catch {
      return "Tanggal error"
    }
  }

  // Get initials dari nama
  const getInitials = (name) => {
    if (!name || name === "-" || name === "") return "?"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  // Gabungkan semua user untuk ditampilkan di tabel
  const allUsers = [
    ...pesertaList.map((p) => {
      const userName = p.user?.nama || p.nama || "-"
      const userEmail = p.user?.email || p.email || "-"
      let divisiName = "-"
      
      const divisiId = p.id_divisi || p.divisi?.id_divisi
      if (divisiId) {
        const foundDivisi = divisiList.find(d => (d.id_divisi || d.id) == divisiId)
        if (foundDivisi) divisiName = foundDivisi.nama_divisi || foundDivisi.nama || "-"
      }
      
      const status = (p.user?.status_akun === "aktif" || p.status_akun === "aktif" || p.status === "aktif")
      
      return {
        id: p.id_peserta || p.id,
        nama: userName,
        email: userEmail,
        role: "peserta",
        divisi: divisiName,
        status: status,
        initials: getInitials(userName),
      }
    }),
    ...mentorList.map((m) => {
      const userName = m.user?.nama || m.nama || m.name || "-"
      const userEmail = m.user?.email || m.email || "-"
      let divisiName = "-"
      
      const divisiId = m.id_divisi || m.divisi?.id_divisi
      if (divisiId) {
        const foundDivisi = divisiList.find(d => (d.id_divisi || d.id) == divisiId)
        if (foundDivisi) divisiName = foundDivisi.nama_divisi || foundDivisi.nama || "-"
      }
      
      const status = (m.user?.status_akun === "aktif" || m.status_akun === "aktif" || m.status === "aktif")
      
      return {
        id: m.id_mentor || m.id_user || m.id,
        nama: userName,
        email: userEmail,
        role: "mentor",
        divisi: divisiName,
        status: status,
        initials: getInitials(userName),
      }
    }),
  ]

  // Filter aktivitas terbaru
  const recentActivities = [...activities]
    .filter(a => a.type === "create" || a.type === "update" || a.type === "delete")
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8)
    .map(item => ({
      ...item,
      formattedDate: formatDate(item.timestamp),
      displayTarget: item.target === "peserta" ? "Peserta" : item.target === "mentor" ? "Mentor" : "Divisi",
      user: item.user === "Admin Sistem" ? "Admin" : (item.user || "Admin")
    }))

  // Filter user berdasarkan search
  const filteredUsers = allUsers.filter((u) =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  // Greeting berdasarkan jam
  const getCurrentGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Selamat Pagi"
    if (hour < 18) return "Selamat Siang"
    return "Selamat Malam"
  }

  // Loading state
  if (loading && allUsers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Memuat data dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    {getCurrentGreeting()}, Admin!
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Pantau aktivitas dan kelola data sistem
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllData}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
                title="Refresh data"
              >
                <RefreshCw size={16} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari pengguna..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-64 text-sm text-slate-700 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle size={16} />
            {error}
            <button onClick={fetchAllData} className="ml-auto underline text-red-600 hover:text-red-800">
              Coba lagi
            </button>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalAkun}</p>
              <p className="text-sm text-slate-500 mt-0.5">Total Akun</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{aktif}</p>
              <p className="text-sm text-slate-500 mt-0.5">Akun Aktif</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{totalDivisi}</p>
              <p className="text-sm text-slate-500 mt-0.5">Divisi Aktif</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                  <UserX className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{nonAktif}</p>
              <p className="text-sm text-slate-500 mt-0.5">Akun Nonaktif</p>
            </div>
          </div>
        </div>

        {/* DISTRIBUSI DIVISI & STATISTIK */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          
          {/* Distribusi Divisi */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">Distribusi Divisi</h3>
                  <p className="text-xs text-slate-400">3 divisi dengan peserta terbanyak</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {divisiStats.length > 0 ? (
                  divisiStats.map((div, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-500' : 'bg-amber-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{div.nama}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Users size={11} className="text-blue-500" />
                          {div.peserta} Peserta
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <UserCheck size={11} className="text-purple-500" />
                          {div.mentor} Mentor
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building2 size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Belum ada data divisi</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistik Pengguna */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">Statistik Pengguna</h3>
                  <p className="text-xs text-slate-400">Total {totalAkun} pengguna terdaftar</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-blue-50 rounded-full flex items-center justify-center">
                    <Users size={28} className="text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{totalPeserta}</p>
                  <p className="text-sm text-slate-500 mt-1">Peserta</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-full">
                    <span className="text-[10px] font-medium text-blue-600">
                      {totalAkun > 0 ? Math.round((totalPeserta / totalAkun) * 100) : 0}%
                    </span>
                  </div>
                </div>
                
                <div className="w-px h-12 bg-slate-200"></div>
                
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-emerald-50 rounded-full flex items-center justify-center">
                    <UserCheck size={28} className="text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{totalMentor}</p>
                  <p className="text-sm text-slate-500 mt-1">Mentor</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-full">
                    <span className="text-[10px] font-medium text-emerald-600">
                      {totalAkun > 0 ? Math.round((totalMentor / totalAkun) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">Total keseluruhan {totalAkun} akun</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL DATA PENGGUNA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="relative h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Data Pengguna</h3>
                  <p className="text-[10px] text-slate-400">Daftar 5 pengguna terbaru dalam sistem</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[10px] font-medium text-blue-600">Total {filteredUsers.length} Pengguna</span>
              </div>
            </div>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Tidak ada data pengguna.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pengguna</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.slice(0, 5).map((u, idx) => (
                    <tr key={`${u.role}-${u.id}-${idx}`} className="hover:bg-slate-50/50 transition group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                            {u.initials}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">{u.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-500">{u.email}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full capitalize font-medium ${
                          u.role === "mentor" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                          u.divisi !== "-" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {u.divisi !== "-" ? u.divisi : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {u.status ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 bg-red-50 text-red-600 rounded-full">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Nonaktif
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {filteredUsers.length > 5 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/30">
              <button 
                onClick={() => navigate("/admin/users")}
                className="w-full text-center text-[11px] text-blue-500 hover:text-blue-600 font-medium py-2 transition-colors flex items-center justify-center gap-1.5 group"
              >
                <span>Lihat semua pengguna</span>
                <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-slate-400">({filteredUsers.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* AKTIVITAS TERBARU */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                  <Activity size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Aktivitas Terbaru</h3>
                  <p className="text-[10px] text-slate-400">Riwayat tambah, edit, dan hapus data</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-medium text-emerald-600">Live</span>
              </div>
            </div>
          </div>
          
          <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto">
            {recentActivities.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity size={28} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Belum ada aktivitas</p>
                <p className="text-xs text-slate-400 mt-1">Aktivitas akan muncul saat ada perubahan data</p>
              </div>
            ) : (
              recentActivities.map((item, idx) => {
                let bgColor = ""
                let icon = null
                let typeText = ""
                
                if (item.type === "create") {
                  bgColor = "bg-emerald-50 text-emerald-600"
                  icon = <UserPlus size={12} />
                  typeText = "Menambahkan"
                } else if (item.type === "update") {
                  bgColor = "bg-blue-50 text-blue-600"
                  icon = <Edit3 size={12} />
                  typeText = "Mengedit"
                } else {
                  bgColor = "bg-red-50 text-red-600"
                  icon = <Trash2 size={12} />
                  typeText = "Menghapus"
                }
                
                return (
                  <div key={`activity-${item.id || idx}`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-slate-100 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm transition-all group-hover:scale-105 ${
                      item.target === "peserta" ? "bg-gradient-to-br from-blue-500 to-indigo-500" :
                      item.target === "mentor" ? "bg-gradient-to-br from-purple-500 to-pink-500" :
                      "bg-gradient-to-br from-slate-500 to-slate-600"
                    }`}>
                      {item.target === "peserta" ? "P" : item.target === "mentor" ? "M" : "D"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-1">
                        <span className="text-sm font-semibold text-slate-800">{item.user || "Admin"}</span>
                        <span className="text-sm text-slate-500">{typeText}</span>
                        <span className="text-sm font-medium capitalize text-blue-600">{item.displayTarget}</span>
                        {item.itemName && (
                          <span className="text-sm font-medium text-emerald-600">"{item.itemName}"</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1">
                        <Clock size={10} />
                        {item.formattedDate || formatDate(item.timestamp)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgColor}`}>
                      {icon}
                      <span className="text-[9px] font-medium uppercase">
                        {item.type === "create" ? "Baru" : item.type === "update" ? "Update" : "Hapus"}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* INFO BANNER */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-white rounded-xl shadow-sm">
              <Shield size={16} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-800">
                <strong className="font-semibold">Informasi:</strong> Dashboard ini menampilkan data real-time dari seluruh sistem. Gunakan menu navigasi untuk mengelola akun peserta, mentor, dan divisi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAdmin