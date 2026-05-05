// src/layouts/PesertaLayout.jsx
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
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  X,
  Calendar,
  Clock,
  Shield,
  FileText,
  Award,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  History,
  BookMarked,
  GraduationCap,
  FileCheck,
  Star,
  Trophy
} from "lucide-react"

function PesertaLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState(new Date())
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [presensiOpen, setPresensiOpen] = useState(false)
  const [materiOpen, setMateriOpen] = useState(false)
  const [tugasOpen, setTugasOpen] = useState(false)
  const [penilaianOpen, setPenilaianOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
  const userInitial = currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : "P"
  const userFullName = currentUser.nama || "Peserta Magang"
  const userEmail = currentUser.email || "peserta@kuantaacademy.com"

  useEffect(() => {
    const storedNotif = JSON.parse(localStorage.getItem("notifications")) || []
    const filteredNotif = storedNotif.filter(n => n.target === "peserta" || n.target === "all")
    setNotifications(filteredNotif)
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
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const isPresensiActive = () => {
    return location.pathname === "/peserta/presensi" || 
           location.pathname === "/peserta/riwayat-presensi"
  }

  const isMateriActive = () => {
    return location.pathname === "/peserta/materi-mentor" || 
           location.pathname === "/peserta/materi-kompetensi" ||
           location.pathname === "/peserta/kuis-kompetensi"
  }

  const isTugasActive = () => {
    return location.pathname === "/peserta/tugas" || 
           location.pathname.startsWith("/peserta/tugas/")
  }

  const isPenilaianActive = () => {
    return location.pathname === "/peserta/nilai-akhir" || 
           location.pathname === "/peserta/sertifikat"
  }

  const getPageTitle = () => {
    const path = location.pathname.replace("/peserta/", "")
    const titles = {
      "dashboard": "Dashboard",
      "presensi": "Check-in / Check-out",
      "riwayat-presensi": "Riwayat Presensi",
      "materi-mentor": "Materi Mentor",
      "materi-kompetensi": "Materi Kompetensi",
      "kuis-kompetensi": "Kuis Kompetensi",
      "tugas": "Daftar Tugas",
      "nilai-akhir": "Nilai Akhir",
      "sertifikat": "Sertifikat",
      "profile": "Profil Saya",
      "settings": "Pengaturan",
      "help": "Pusat Bantuan"
    }
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1)
  }

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.clear()
      navigate("/login")
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleProfile = () => {
    setProfileOpen(false)
    navigate("/peserta/profile")
  }

  const handleSettings = () => {
    setProfileOpen(false)
    navigate("/peserta/settings")
  }

  const handleHelp = () => {
    setProfileOpen(false)
    navigate("/peserta/help")
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
                <p className="text-xs text-gray-400 font-medium">Peserta Panel</p>
              </div>
            )}
          </div>

          {/* MENU NAVIGATION */}
          <div className="px-3 py-6 flex-1 overflow-y-auto">
            <ul className="space-y-1 text-sm">
              {/* DASHBOARD */}
              <li>
                <Link to="/peserta/dashboard">
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive("/peserta/dashboard")
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                    <LayoutDashboard size={18} />
                    {!collapsed && <span className="font-medium">Dashboard</span>}
                    {isActive("/peserta/dashboard") && !collapsed && (
                      <div className="ml-auto w-1.5 h-5 bg-white rounded-full"></div>
                    )}
                  </div>
                </Link>
              </li>

              {/* PRESENSI MENU */}
              <li>
                <div 
                  onClick={() => !collapsed && setPresensiOpen(!presensiOpen)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isPresensiActive()
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={18} />
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
                    <Link to="/peserta/presensi">
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                        location.pathname === "/peserta/presensi"
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}>
                        <CheckCircle size={14} />
                        <span>Check-in / Check-out</span>
                      </div>
                    </Link>
                    <Link to="/peserta/riwayat-presensi">
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                        location.pathname === "/peserta/riwayat-presensi"
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}>
                        <History size={14} />
                        <span>Riwayat Presensi</span>
                      </div>
                    </Link>
                  </div>
                )}
              </li>

              {/* MATERI & KUIS MENU */}
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
                    {!collapsed && <span className="font-medium">Materi & Kuis</span>}
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
                    <Link to="/peserta/materi-mentor">
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                        location.pathname === "/peserta/materi-mentor"
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}>
                        <BookMarked size={14} />
                        <span>Materi Mentor</span>
                      </div>
                    </Link>
                    <Link to="/peserta/materi-kompetensi">
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                        location.pathname === "/peserta/materi-kompetensi"
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}>
                        <GraduationCap size={14} />
                        <span>Materi Kompetensi</span>
                      </div>
                    </Link>
                    <Link to="/peserta/kuis-kompetensi">
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                        location.pathname === "/peserta/kuis-kompetensi"
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}>
                        <ClipboardList size={14} />
                        <span>Kuis Kompetensi</span>
                      </div>
                    </Link>
                  </div>
                )}
              </li>

              {/* TUGAS MENU */}
              <li>
                <div 
                  onClick={() => !collapsed && setTugasOpen(!tugasOpen)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isTugasActive()
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} />
                    {!collapsed && <span className="font-medium">Tugas</span>}
                  </div>
                  {!collapsed && (
                    <button onClick={(e) => { e.stopPropagation(); setTugasOpen(!tugasOpen); }} className="p-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className={`transition-transform duration-200 ${tugasOpen ? "rotate-180" : ""}`}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>

                {!collapsed && tugasOpen && (
                  <div className="ml-7 mt-2 space-y-1">
                    <Link to="/peserta/tugas">
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                        location.pathname === "/peserta/tugas"
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}>
                        <FileCheck size={14} />
                        <span>Daftar Tugas</span>
                      </div>
                    </Link>
                  </div>
                )}
              </li>

              {/* PENILAIAN MENU */}
              <li>
                <div 
                  onClick={() => !collapsed && setPenilaianOpen(!penilaianOpen)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isPenilaianActive()
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award size={18} />
                    {!collapsed && <span className="font-medium">Penilaian</span>}
                  </div>
                  {!collapsed && (
                    <button onClick={(e) => { e.stopPropagation(); setPenilaianOpen(!penilaianOpen); }} className="p-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className={`transition-transform duration-200 ${penilaianOpen ? "rotate-180" : ""}`}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>

                {!collapsed && penilaianOpen && (
                  <div className="ml-7 mt-2 space-y-1">
                    <Link to="/peserta/nilai-akhir">
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                        location.pathname === "/peserta/nilai-akhir"
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}>
                        <Star size={14} />
                        <span>Nilai Akhir</span>
                      </div>
                    </Link>
                    <Link to="/peserta/sertifikat">
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                        location.pathname === "/peserta/sertifikat"
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}>
                        <Trophy size={14} />
                        <span>Unduh Sertifikat</span>
                      </div>
                    </Link>
                  </div>
                )}
              </li>
            </ul>
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

        {/* RIGHT SIDE */}
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
                  <span className="text-gray-500">Peserta</span>
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
                      <p className="text-xs text-gray-400">Peserta</p>
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
                            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Peserta</span>
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

          {/* PAGE CONTENT */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
          
        </div>

      </div>

    </div>
  )
}

export default PesertaLayout