// src/layouts/MentorLayout.jsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  User,
  Users,
  CalendarCheck,
  BookOpen,
  ClipboardList,
  CheckCircle,
  FileText,
  Star,
  Target,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  HelpCircle,
  ChevronDown,
  X,
  Shield,
  Calendar,
  Clock,
  PlusCircle,
  List,
  UserCheck,
  Award,
  FileSpreadsheet,
  Power
} from "lucide-react"

function MentorLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [time, setTime] = useState(new Date())
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  
  // Menu dropdown states
  const [presensiOpen, setPresensiOpen] = useState(false)
  const [materiOpen, setMateriOpen] = useState(false)
  const [tugasOpen, setTugasOpen] = useState(false)
  const [penilaianOpen, setPenilaianOpen] = useState(false)

  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    const userData = localStorage.getItem("user")

    if (!token) {
      navigate("/login")
      return
    }

    if (role !== "mentor") {
      if (role === "admin") navigate("/admin/dashboard")
      else if (role === "coo") navigate("/coo/dashboard")
      else if (role === "peserta") navigate("/peserta/dashboard")
      else navigate("/login")
      return
    }

    if (userData) {
      try {
        const parsed = typeof userData === 'string' ? JSON.parse(userData) : userData
        setUser(parsed)
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [navigate])

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/api/mentor/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${dayName}, ${day} ${month} ${year}`
  }

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("token")
      localStorage.removeItem("role")
      localStorage.removeItem("user")
      localStorage.removeItem("rememberedEmail")
      navigate("/login")
    }
  }

  const isActive = (path) => {
    if (path === "/mentor/dashboard") return location.pathname === "/mentor/dashboard"
    if (path === "/mentor/peserta") return location.pathname === "/mentor/peserta"
    if (path === "/mentor/presensi") return location.pathname === "/mentor/presensi"
    if (path === "/mentor/daily-report") return location.pathname === "/mentor/daily-report"
    if (path === "/mentor/materi") return location.pathname === "/mentor/materi" || location.pathname === "/mentor/add-materi" || location.pathname.includes("/mentor/edit-materi")
    if (path === "/mentor/tugas") return location.pathname === "/mentor/tugas" || location.pathname === "/mentor/add-tugas" || location.pathname.includes("/mentor/edit-tugas")
    if (path === "/mentor/validasi-tugas") return location.pathname === "/mentor/validasi-tugas"
    if (path === "/mentor/laporan-akhir") return location.pathname === "/mentor/laporan-akhir"
    if (path === "/mentor/penilaian-manual") return location.pathname === "/mentor/penilaian-manual"
    if (path === "/mentor/nilai-akhir") return location.pathname === "/mentor/nilai-akhir"
    return location.pathname.includes(path)
  }

  const getPageTitle = () => {
    const path = location.pathname.replace("/mentor/", "")
    const titles = {
      "dashboard": "Dashboard",
      "peserta": "Daftar Peserta Bimbingan",
      "presensi": "Presensi Peserta",
      "daily-report": "Daily Report Peserta",
      "materi": "Materi Pembelajaran",
      "add-materi": "Tambah Materi",
      "edit-materi": "Edit Materi",
      "tugas": "Kelola Tugas",
      "add-tugas": "Tambah Tugas",
      "edit-tugas": "Edit Tugas",
      "validasi-tugas": "Validasi Tugas",
      "laporan-akhir": "Laporan Akhir",
      "penilaian-manual": "Input Nilai Manual",
      "nilai-akhir": "Hitung Nilai Akhir"
    }
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1)
  }

  const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}")
  const userInitial = currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : "M"
  const userFullName = currentUser.nama || "Mentor"
  const userEmail = currentUser.email || "mentor@kuantaacademy.com"

  const unreadCount = notifications.filter(n => !n.read).length

  const handleProfile = () => {
    setProfileOpen(false)
    navigate("/mentor/profile")
  }

  const handleSettings = () => {
    setProfileOpen(false)
  }

  const handleHelp = () => {
    setProfileOpen(false)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
      
      {/* DECORATIVE GRADIENT LINE - FULL WIDTH DI ATAS */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-teal-400 z-50"></div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden pt-1">
        
        {/* SIDEBAR */}
        <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-lg shadow-gray-200/50 shrink-0 relative z-20 ${sidebarCollapsed ? "w-20" : "w-64"}`}>
          
          {/* LOGO */}
          <div className={`px-4 py-5 flex items-center gap-3 border-b border-gray-200 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl blur-md opacity-60"></div>
              <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-teal-600 font-bold text-xl">M</span>
              </div>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-gray-800 text-lg tracking-tight">
                  Kuanta <span className="text-teal-500">Academy</span>
                </h1>
                <p className="text-xs text-gray-400 font-medium">Mentor Panel</p>
              </div>
            )}
          </div>

          {/* MENU NAVIGATION */}
          <div className="px-3 py-6 flex-1 overflow-y-auto">
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Navigasi Utama</p>
              <ul className="space-y-1 text-sm">
                
                {/* DASHBOARD */}
                <Link to="/mentor/dashboard">
                  <li className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive("/mentor/dashboard")
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                    <LayoutDashboard size={18} />
                    {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
                    {isActive("/mentor/dashboard") && !sidebarCollapsed && (
                      <div className="ml-auto w-1.5 h-5 bg-white rounded-full"></div>
                    )}
                  </li>
                </Link>

                {/* DAFTAR PESERTA */}
                <Link to="/mentor/peserta">
                  <li className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive("/mentor/peserta")
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                    <Users size={18} />
                    {!sidebarCollapsed && <span className="font-medium">Daftar Peserta</span>}
                    {isActive("/mentor/peserta") && !sidebarCollapsed && (
                      <div className="ml-auto w-1.5 h-5 bg-white rounded-full"></div>
                    )}
                  </li>
                </Link>

                {/* PRESENSI MENU dengan dropdown */}
                <li>
                  <div 
                    onClick={() => !sidebarCollapsed && setPresensiOpen(!presensiOpen)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive("/mentor/presensi") || isActive("/mentor/daily-report")
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarCheck size={18} />
                      {!sidebarCollapsed && <span className="font-medium">Presensi & Daily</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <button onClick={(e) => { e.stopPropagation(); setPresensiOpen(!presensiOpen); }} className="p-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`transition-transform duration-200 ${presensiOpen ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {!sidebarCollapsed && presensiOpen && (
                    <div className="ml-7 mt-2 space-y-1">
                      <Link to="/mentor/presensi">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/mentor/presensi"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <UserCheck size={14} />
                          <span>Presensi</span>
                        </div>
                      </Link>
                      <Link to="/mentor/daily-report">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/mentor/daily-report"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <FileSpreadsheet size={14} />
                          <span>Daily Report</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </li>

                {/* MATERI MENU dengan dropdown */}
                <li>
                  <div 
                    onClick={() => !sidebarCollapsed && setMateriOpen(!materiOpen)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive("/mentor/materi")
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} />
                      {!sidebarCollapsed && <span className="font-medium">Materi</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <button onClick={(e) => { e.stopPropagation(); setMateriOpen(!materiOpen); }} className="p-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`transition-transform duration-200 ${materiOpen ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {!sidebarCollapsed && materiOpen && (
                    <div className="ml-7 mt-2 space-y-1">
                      <Link to="/mentor/materi">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/mentor/materi"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <List size={14} />
                          <span>Daftar Materi</span>
                        </div>
                      </Link>
                      <Link to="/mentor/add-materi">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/mentor/add-materi"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <PlusCircle size={14} />
                          <span>Tambah Materi</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </li>

                {/* TUGAS MENU dengan dropdown */}
                <li>
                  <div 
                    onClick={() => !sidebarCollapsed && setTugasOpen(!tugasOpen)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive("/mentor/tugas")
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardList size={18} />
                      {!sidebarCollapsed && <span className="font-medium">Tugas</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <button onClick={(e) => { e.stopPropagation(); setTugasOpen(!tugasOpen); }} className="p-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`transition-transform duration-200 ${tugasOpen ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {!sidebarCollapsed && tugasOpen && (
                    <div className="ml-7 mt-2 space-y-1">
                      <Link to="/mentor/tugas">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/mentor/tugas"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <List size={14} />
                          <span>Kelola Tugas</span>
                        </div>
                      </Link>
                      <Link to="/mentor/add-tugas">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/mentor/add-tugas"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <PlusCircle size={14} />
                          <span>Tambah Tugas</span>
                        </div>
                      </Link>
                      <Link to="/mentor/validasi-tugas">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/mentor/validasi-tugas"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <CheckCircle size={14} />
                          <span>Validasi Tugas</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </li>

                {/* LAPORAN AKHIR */}
                <Link to="/mentor/laporan-akhir">
                  <li className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive("/mentor/laporan-akhir")
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                    <FileText size={18} />
                    {!sidebarCollapsed && <span className="font-medium">Laporan Akhir</span>}
                    {isActive("/mentor/laporan-akhir") && !sidebarCollapsed && (
                      <div className="ml-auto w-1.5 h-5 bg-white rounded-full"></div>
                    )}
                  </li>
                </Link>

                {/* PENILAIAN MENU dengan dropdown */}
                <li>
                  <div 
                    onClick={() => !sidebarCollapsed && setPenilaianOpen(!penilaianOpen)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive("/mentor/penilaian-manual") || isActive("/mentor/nilai-akhir")
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Star size={18} />
                      {!sidebarCollapsed && <span className="font-medium">Penilaian</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <button onClick={(e) => { e.stopPropagation(); setPenilaianOpen(!penilaianOpen); }} className="p-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`transition-transform duration-200 ${penilaianOpen ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {!sidebarCollapsed && penilaianOpen && (
                    <div className="ml-7 mt-2 space-y-1">
                      <Link to="/mentor/penilaian-manual">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/mentor/penilaian-manual"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <Award size={14} />
                          <span>Input Nilai Manual</span>
                        </div>
                      </Link>
                      <Link to="/mentor/nilai-akhir">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/mentor/nilai-akhir"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <Target size={14} />
                          <span>Hitung Nilai Akhir</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </li>

              </ul>
            </div>
          </div>

          {/* LOGOUT BUTTON - SIDEBAR - PREMIUM */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30"
            >
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              <div className={`relative flex items-center justify-center gap-2 py-2.5 ${sidebarCollapsed ? "px-2" : "px-4"}`}>
                <Power size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                {!sidebarCollapsed && <span className="font-medium">Keluar</span>}
              </div>
            </button>
          </div>

          {/* COLLAPSE BUTTON */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-24 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-100 transition-all z-30 hover:scale-110"
          >
            {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

        </div>

        {/* RIGHT SIDE - Topbar + Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-gradient-to-br from-gray-50 to-gray-100">
          
          {/* TOPBAR PREMIUM */}
          <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 shadow-sm shrink-0 relative z-50">
            
            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-all lg:hidden"
              >
                <Menu size={18} className="text-gray-600" />
              </button>
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Mentor</span>
                  <ChevronRight size={12} className="text-gray-400" />
                  <span className="font-semibold text-gray-800 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    {getPageTitle()}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">
              
              {/* Date Time Card - Bahasa Indonesia */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar size={14} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Hari Ini</span>
                    <span className="text-sm font-medium text-gray-700">{formatDate(time)}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">Waktu</span>
                  <span className="text-sm font-mono font-semibold text-gray-800">{formatTime(time)}</span>
                </div>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <Bell size={18} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white animate-pulse"></span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50/50 to-blue-50/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-gray-800">Notifikasi</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Update terbaru</p>
                        </div>
                        <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Belum ada notifikasi</p>
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className="px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                            <p className="text-sm font-medium text-gray-800">{n.title || "Notifikasi"}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{n.created_at || "Baru saja"}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown Premium */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-all duration-200 group relative z-50"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center rounded-xl font-bold text-sm shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
                    {userInitial}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{userFullName}</p>
                    <p className="text-xs text-gray-400">Mentor</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] overflow-hidden">
                    {/* Header Profile */}
                    <div className="px-5 py-5 border-b border-gray-200 bg-gradient-to-r from-teal-500/10 to-blue-500/10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center rounded-xl font-bold text-xl shadow-lg shadow-teal-500/25">
                          {userInitial}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-base">{userFullName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Shield size={12} className="text-teal-500" />
                            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Mentor</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button 
                        onClick={handleProfile}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition group"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-teal-50 transition">
                          <User size={14} className="text-gray-500 group-hover:text-teal-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Profil Saya</p>
                          <p className="text-xs text-gray-400">Kelola informasi akun Anda</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={handleSettings}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition group"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-teal-50 transition">
                          <Settings size={14} className="text-gray-500 group-hover:text-teal-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Pengaturan</p>
                          <p className="text-xs text-gray-400">Atur preferensi aplikasi</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={handleHelp}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition group"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-teal-50 transition">
                          <HelpCircle size={14} className="text-gray-500 group-hover:text-teal-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Pusat Bantuan</p>
                          <p className="text-xs text-gray-400">Dokumentasi & support</p>
                        </div>
                      </button>
                    </div>

                    <div className="border-t border-gray-200 my-1"></div>

                    <div className="py-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition group"
                      >
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition">
                          <Power size={14} className="text-red-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">Keluar</p>
                          <p className="text-xs text-red-400">Akhiri sesi</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTENT AREA - FULLY INTEGRATED, NO EXTRA CARD */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>

        </div>

      </div>

    </div>
  )
}

export default MentorLayout