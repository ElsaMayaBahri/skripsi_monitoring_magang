import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import logo from "../assets/logo.png"

import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Menu,
  Bell,
  LogOut,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  List,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  X,
  UserCheck,
  Download,
  Calendar,
  Clock,
  Shield
} from "lucide-react"

function CooLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState(new Date())
  const [materiOpen, setMateriOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [presensiOpen, setPresensiOpen] = useState(false)
  const [pengaturanOpen, setPengaturanOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const [materiCount, setMateriCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
  const userInitial = currentUser.nama
    ? currentUser.nama.charAt(0).toUpperCase()
    : "C"
  const userFullName = currentUser.nama || "User"
  const userEmail = currentUser.email || "user@kuantaacademy.com"

  useEffect(() => {
    const storedMateri = JSON.parse(localStorage.getItem("materi")) || []
    const storedQuiz = JSON.parse(localStorage.getItem("quiz")) || []
    const storedNotif = JSON.parse(localStorage.getItem("notifications")) || []

    setMateriCount(storedMateri.length)
    setQuizCount(storedQuiz.length)
    setNotifications(storedNotif)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

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

  const isActive = (path) => {
    if (path === "/coo/dashboard") return location.pathname === "/coo/dashboard"
    if (path === "/coo/materi") return location.pathname.includes("/coo/materi")
    if (path === "/coo/quiz") return location.pathname.includes("/coo/quiz")
    if (path === "/coo/presensi") return location.pathname === "/coo/presensi"
    if (path === "/coo/laporan-presensi") return location.pathname === "/coo/laporan-presensi"
    if (path === "/coo/settings-attendance") return location.pathname === "/coo/settings-attendance"
    return location.pathname.includes(path)
  }

  const getPageTitle = () => {
    const path = location.pathname.replace("/coo/", "")
    const titles = {
      "dashboard": "Dashboard",
      "materi": "Materi Kompetensi",
      "add-materi": "Tambah Materi",
      "edit-materi": "Edit Materi",
      "quiz": "Kuis",
      "add-quiz": "Buat Kuis Baru",
      "quiz-detail": "Detail Kuis",
      "add-question": "Tambah Pertanyaan",
      "presensi": "Data Presensi Peserta",
      "laporan-presensi": "Laporan Rekap Presensi",
      "settings-attendance": "Pengaturan Hari Libur & Jam Kerja"
    }
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1)
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleProfile = () => {
    setProfileOpen(false)
    navigate("/coo/profile")
  }

  const handleSettings = () => {
    setProfileOpen(false)
    navigate("/coo/settings")
  }

  const handleHelp = () => {
    setProfileOpen(false)
    navigate("/coo/help")
  }

  const isMateriActive = () => {
    return location.pathname === "/coo/materi" || 
           location.pathname === "/coo/add-materi" || 
           location.pathname.includes("/coo/edit-materi")
  }

  const isQuizActive = () => {
    return location.pathname === "/coo/quiz" || 
           location.pathname === "/coo/add-quiz" || 
           location.pathname.includes("/coo/quiz-detail") ||
           location.pathname.includes("/coo/add-question")
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
      
      {/* DECORATIVE GRADIENT LINE */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-teal-400 z-50"></div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden pt-1">
        
        {/* SIDEBAR */}
        <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-lg shadow-gray-200/50 shrink-0 relative z-20 ${collapsed ? "w-20" : "w-64"}`}>
          
          {/* LOGO */}
          <div className={`px-4 py-5 flex items-center gap-3 border-b border-gray-200 ${collapsed ? "justify-center" : ""}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl blur-md opacity-60"></div>
              <img src={logo} className="relative w-10 h-10 object-contain bg-white rounded-xl p-1.5 shadow-md" alt="Logo" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-gray-800 text-lg tracking-tight">
                  Kuanta <span className="text-teal-500">Academy</span>
                </h1>
                <p className="text-xs text-gray-400 font-medium">COO Panel</p>
              </div>
            )}
          </div>

          {/* MENU NAVIGATION */}
          <div className="px-3 py-6 flex-1 overflow-y-auto">
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Navigasi Utama</p>
              <ul className="space-y-1 text-sm">
                
                <Link to="/coo/dashboard">
                  <li className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive("/coo/dashboard")
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                    <LayoutDashboard size={18} />
                    {!collapsed && <span className="font-medium">Dashboard</span>}
                    {isActive("/coo/dashboard") && !collapsed && (
                      <div className="ml-auto w-1.5 h-5 bg-white rounded-full"></div>
                    )}
                  </li>
                </Link>

                {/* MATERI MENU */}
                <li>
                  <div 
                    onClick={() => !collapsed && setMateriOpen(!materiOpen)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isMateriActive()
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} />
                      {!collapsed && <span className="font-medium">Materi</span>}
                    </div>
                    {!collapsed && (
                      <button onClick={(e) => { e.stopPropagation(); setMateriOpen(!materiOpen); }} className="p-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`transition-transform duration-200 ${materiOpen ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {!collapsed && materiOpen && (
                    <div className="ml-7 mt-2 space-y-1">
                      <Link to="/coo/materi">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/coo/materi"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <List size={14} />
                          <span>Daftar Materi</span>
                        </div>
                      </Link>
                      <Link to="/coo/add-materi">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/coo/add-materi"
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

                {/* QUIZ MENU */}
                <li>
                  <div 
                    onClick={() => !collapsed && setQuizOpen(!quizOpen)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isQuizActive()
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardList size={18} />
                      {!collapsed && <span className="font-medium">Kuis</span>}
                    </div>
                    {!collapsed && (
                      <button onClick={(e) => { e.stopPropagation(); setQuizOpen(!quizOpen); }} className="p-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`transition-transform duration-200 ${quizOpen ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {!collapsed && quizOpen && (
                    <div className="ml-7 mt-2 space-y-1">
                      <Link to="/coo/quiz">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/coo/quiz"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <List size={14} />
                          <span>Daftar Kuis</span>
                        </div>
                      </Link>
                      <Link to="/coo/add-quiz">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/coo/add-quiz"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <PlusCircle size={14} />
                          <span>Buat Kuis</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </li>

                {/* PRESENSI MENU */}
                <li>
                  <div 
                    onClick={() => !collapsed && setPresensiOpen(!presensiOpen)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive("/coo/presensi") || isActive("/coo/laporan-presensi")
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserCheck size={18} />
                      {!collapsed && <span className="font-medium">Presensi</span>}
                    </div>
                    {!collapsed && (
                      <button onClick={(e) => { e.stopPropagation(); setPresensiOpen(!presensiOpen); }} className="p-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`transition-transform duration-200 ${presensiOpen ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {!collapsed && presensiOpen && (
                    <div className="ml-7 mt-2 space-y-1">
                      <Link to="/coo/presensi">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/coo/presensi"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <UserCheck size={14} />
                          <span>Data Presensi</span>
                        </div>
                      </Link>
                      <Link to="/coo/laporan-presensi">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/coo/laporan-presensi"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <Download size={14} />
                          <span>Laporan Rekap</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </li>

                {/* PENGATURAN MENU */}
                <li>
                  <div 
                    onClick={() => !collapsed && setPengaturanOpen(!pengaturanOpen)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive("/coo/settings-attendance")
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={18} />
                      {!collapsed && <span className="font-medium">Pengaturan</span>}
                    </div>
                    {!collapsed && (
                      <button onClick={(e) => { e.stopPropagation(); setPengaturanOpen(!pengaturanOpen); }} className="p-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`transition-transform duration-200 ${pengaturanOpen ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {!collapsed && pengaturanOpen && (
                    <div className="ml-7 mt-2 space-y-1">
                      <Link to="/coo/settings-attendance">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          location.pathname === "/coo/settings-attendance"
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <Calendar size={14} />
                          <span>Hari Libur & Jam Kerja</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </li>

              </ul>
            </div>
          </div>

          {/* LOGOUT BUTTON */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-red-500/20 group"
            >
              <LogOut size={18} className="transition-transform group-hover:scale-110" />
              {!collapsed && <span className="font-medium">Keluar</span>}
            </button>
          </div>

          {/* COLLAPSE BUTTON */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-24 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-100 transition-all z-30 hover:scale-110"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

        </div>

        {/* RIGHT SIDE - LANGSUNG MENYATU TANPA JARAK */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          
          {/* TOPBAR */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
            
            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCollapsed(!collapsed)} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-all lg:hidden"
              >
                <Menu size={18} className="text-gray-600" />
              </button>
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">COO</span>
                  <ChevronRight size={12} className="text-gray-400" />
                  <span className="font-semibold text-gray-800 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    {getPageTitle()}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">
              
              {/* DATE TIME */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Calendar size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Hari Ini</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(time)}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-teal-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Waktu</p>
                    <p className="text-sm font-mono font-semibold text-gray-800">{formatTime(time)}</p>
                  </div>
                </div>
              </div>

              {/* NOTIFICATION BELL */}
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <Bell size={18} className="text-gray-500" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
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
                        notifications.map((notif, idx) => (
                          <div key={idx} className="px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                            <p className="text-sm font-medium text-gray-800">{notif.judul || "Notifikasi"}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.pesan}</p>
                            <p className="text-xs text-gray-400 mt-2">{notif.created_at || "Baru saja"}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* PROFILE DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center rounded-lg font-bold text-sm shadow-md shadow-teal-500/25">
                    {userInitial}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{userFullName}</p>
                    <div className="flex items-center gap-1">
                      <Shield size={10} className="text-teal-500" />
                      <p className="text-xs text-gray-400">COO</p>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] overflow-hidden">
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
                            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">COO</span>
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

                    <div className="py-2 pb-3">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition group"
                      >
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition">
                          <LogOut size={14} className="text-red-500" />
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

          {/* PAGE CONTENT - LANGSUNG MENYATU TANPA PADDING */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
          
        </div>

      </div>

    </div>
  )
}

export default CooLayout