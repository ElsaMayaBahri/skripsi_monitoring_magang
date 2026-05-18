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
  Trophy,
  AlertTriangle,
  Power,
  TrendingUp
} from "lucide-react"

function PesertaLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  // Sidebar states
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  const [time, setTime] = useState(new Date())
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  
  // Menu dropdown states
  const [presensiOpen, setPresensiOpen] = useState(false)
  const [pembelajaranMentorOpen, setPembelajaranMentorOpen] = useState(false)
  const [pelatihanKompetensiOpen, setPelatihanKompetensiOpen] = useState(false)
  const [penilaianOpen, setPenilaianOpen] = useState(false)
  
  const [notifications, setNotifications] = useState([])

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
  const userInitial = currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : "P"
  const userFullName = currentUser.nama || "Peserta Magang"
  const userEmail = currentUser.email || "peserta@kuantaacademy.com"

  // Tutup mobile sidebar saat resize ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileOpen) {
        const profileButton = document.getElementById('profile-button-peserta')
        const profileDropdown = document.getElementById('profile-dropdown-peserta')
        if (profileButton && !profileButton.contains(event.target) && 
            profileDropdown && !profileDropdown.contains(event.target)) {
          setProfileOpen(false)
        }
      }
      if (notifOpen) {
        const notifButton = document.getElementById('notif-button-peserta')
        const notifDropdown = document.getElementById('notif-dropdown-peserta')
        if (notifButton && !notifButton.contains(event.target) && 
            notifDropdown && !notifDropdown.contains(event.target)) {
          setNotifOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileOpen, notifOpen])

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
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  // Cek active untuk menu utama
  const isPresensiActive = () => {
    return location.pathname === "/peserta/presensi" || 
           location.pathname === "/peserta/riwayat-presensi"
  }

  const isPembelajaranMentorActive = () => {
    return location.pathname === "/peserta/materi-mentor" || 
           location.pathname === "/peserta/tugas" ||
           location.pathname.startsWith("/peserta/tugas/")
  }

  const isPelatihanKompetensiActive = () => {
    return location.pathname === "/peserta/materi-kompetensi" || 
           location.pathname === "/peserta/daftar-kuis-kompetensi" ||
           location.pathname === "/peserta/sertifikat"
  }

  const isPenilaianActive = () => {
    return location.pathname === "/peserta/nilai-akhir"
  }

  const getPageTitle = () => {
    const path = location.pathname.replace("/peserta/", "")
    const titles = {
      "dashboard": "Dashboard",
      "presensi": "Check-in / Check-out",
      "riwayat-presensi": "Riwayat Presensi",
      "materi-mentor": "Materi Mentor",
      "tugas": "Daftar Tugas",
      "materi-kompetensi": "Materi Kompetensi",
      "daftar-kuis-kompetensi": "Kuis Kompetensi",
      "sertifikat": "Sertifikat",
      "nilai-akhir": "Nilai Akhir",
      "profile": "Profil Saya",
      "settings": "Pengaturan"
    }
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1)
  }

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true)
    setProfileOpen(false)
  }

  const handleLogoutConfirm = () => {
    localStorage.clear()
    setLogoutConfirmOpen(false)
    navigate("/login")
  }

  const handleLogoutCancel = () => {
    setLogoutConfirmOpen(false)
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

  const handleMenuClick = () => {
    // Tutup mobile sidebar setelah klik menu
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false)
    }
  }

  // Sidebar Content Component (reusable)
  const SidebarContent = ({ collapsed: isCollapsed, onMenuClick }) => (
    <>
      {/* LOGO */}
      <div className={`px-4 py-5 flex items-center gap-3 border-b border-gray-200 ${isCollapsed ? "justify-center" : ""}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl blur-md opacity-60"></div>
          <img src={logo} className="relative w-10 h-10 object-contain bg-white rounded-xl p-1.5 shadow-md" alt="Logo" />
        </div>
        {!isCollapsed && (
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
            <Link to="/peserta/dashboard" onClick={onMenuClick}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive("/peserta/dashboard")
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                  : "text-gray-600 hover:bg-gray-100"
              }`}>
                <LayoutDashboard size={18} />
                {!isCollapsed && <span className="font-medium">Dashboard</span>}
                {isActive("/peserta/dashboard") && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-5 bg-white rounded-full"></div>
                )}
              </div>
            </Link>
          </li>

          {/* PRESENSI MENU */}
          <li>
            <div 
              onClick={() => !isCollapsed && setPresensiOpen(!presensiOpen)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isPresensiActive()
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} />
                {!isCollapsed && <span className="font-medium">Presensi</span>}
              </div>
              {!isCollapsed && (
                <button onClick={(e) => { e.stopPropagation(); setPresensiOpen(!presensiOpen); }} className="p-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform duration-200 ${presensiOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
            </div>

            {!isCollapsed && presensiOpen && (
              <div className="ml-7 mt-2 space-y-1">
                <Link to="/peserta/presensi" onClick={onMenuClick}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                    location.pathname === "/peserta/presensi"
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}>
                    <CheckCircle size={14} />
                    <span>Check-in / Check-out</span>
                  </div>
                </Link>
                <Link to="/peserta/riwayat-presensi" onClick={onMenuClick}>
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

          {/* PEMBELAJARAN MENTOR MENU */}
          <li>
            <div 
              onClick={() => !isCollapsed && setPembelajaranMentorOpen(!pembelajaranMentorOpen)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isPembelajaranMentorActive()
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} />
                {!isCollapsed && <span className="font-medium">Pembelajaran Mentor</span>}
              </div>
              {!isCollapsed && (
                <button onClick={(e) => { e.stopPropagation(); setPembelajaranMentorOpen(!pembelajaranMentorOpen); }} className="p-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform duration-200 ${pembelajaranMentorOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
            </div>

            {!isCollapsed && pembelajaranMentorOpen && (
              <div className="ml-7 mt-2 space-y-1">
                <Link to="/peserta/materi-mentor" onClick={onMenuClick}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                    location.pathname === "/peserta/materi-mentor"
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}>
                    <BookMarked size={14} />
                    <span>Materi Mentor</span>
                  </div>
                </Link>
                <Link to="/peserta/tugas" onClick={onMenuClick}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                    location.pathname === "/peserta/tugas" || location.pathname.startsWith("/peserta/tugas/")
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}>
                    <FileText size={14} />
                    <span>Tugas</span>
                  </div>
                </Link>
              </div>
            )}
          </li>

          {/* PELATIHAN KOMPETENSI MENU */}
          <li>
            <div 
              onClick={() => !isCollapsed && setPelatihanKompetensiOpen(!pelatihanKompetensiOpen)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isPelatihanKompetensiActive()
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap size={18} />
                {!isCollapsed && <span className="font-medium">Pelatihan Kompetensi</span>}
              </div>
              {!isCollapsed && (
                <button onClick={(e) => { e.stopPropagation(); setPelatihanKompetensiOpen(!pelatihanKompetensiOpen); }} className="p-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform duration-200 ${pelatihanKompetensiOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
            </div>

            {!isCollapsed && pelatihanKompetensiOpen && (
              <div className="ml-7 mt-2 space-y-1">
                <Link to="/peserta/materi-kompetensi" onClick={onMenuClick}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                    location.pathname === "/peserta/materi-kompetensi"
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}>
                    <BookOpen size={14} />
                    <span>Materi Kompetensi</span>
                  </div>
                </Link>
                <Link to="/peserta/daftar-kuis-kompetensi" onClick={onMenuClick}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                    location.pathname === "/peserta/daftar-kuis-kompetensi"
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}>
                    <ClipboardList size={14} />
                    <span>Kuis Kompetensi</span>
                  </div>
                </Link>
                <Link to="/peserta/sertifikat" onClick={onMenuClick}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                    location.pathname === "/peserta/sertifikat"
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}>
                    <Trophy size={14} />
                    <span>Sertifikat</span>
                  </div>
                </Link>
              </div>
            )}
          </li>

          {/* PENILAIAN MENU */}
          <li>
            <div 
              onClick={() => !isCollapsed && setPenilaianOpen(!penilaianOpen)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isPenilaianActive()
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Award size={18} />
                {!isCollapsed && <span className="font-medium">Penilaian</span>}
              </div>
              {!isCollapsed && (
                <button onClick={(e) => { e.stopPropagation(); setPenilaianOpen(!penilaianOpen); }} className="p-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform duration-200 ${penilaianOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
            </div>

            {!isCollapsed && penilaianOpen && (
              <div className="ml-7 mt-2 space-y-1">
                <Link to="/peserta/nilai-akhir" onClick={onMenuClick}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                    location.pathname === "/peserta/nilai-akhir"
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}>
                    <Star size={14} />
                    <span>Nilai Akhir</span>
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
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-red-500/20 group"
        >
          <LogOut size={18} className="transition-transform group-hover:scale-110" />
          {!isCollapsed && <span className="font-medium">Keluar</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
      
      {/* DECORATIVE GRADIENT LINE */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-teal-400 z-50"></div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden pt-1">
        
        {/* DESKTOP SIDEBAR - Permanent, hanya tampil di lg ke atas */}
        <div className={`
          hidden lg:flex
          bg-white border-r border-gray-200
          flex-col transition-all duration-300
          shadow-lg shadow-gray-200/50 shrink-0 relative z-20
          ${collapsed ? "w-20" : "w-64"}
        `}>
          <SidebarContent collapsed={collapsed} onMenuClick={() => {}} />
          
          {/* COLLAPSE BUTTON - Hanya di desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-24 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-100 transition-all z-30 hover:scale-110 hidden lg:block"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* MOBILE SIDEBAR - Overlay, hanya tampil saat mobileSidebarOpen true */}
        {mobileSidebarOpen && (
          <>
            {/* BACKDROP */}
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fadeIn"
              onClick={() => setMobileSidebarOpen(false)}
            />
            
            {/* SIDEBAR OVERLAY */}
            <div className="
              fixed left-0 top-0 h-full w-64
              bg-white z-50 shadow-2xl
              lg:hidden
              flex flex-col
              animate-slideInLeft
            ">
              <SidebarContent collapsed={false} onMenuClick={handleMenuClick} />
            </div>
          </>
        )}

        {/* RIGHT SIDE - Topbar + Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white relative z-10">
          
          {/* TOPBAR */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-30">
            
            {/* LEFT SIDE - Hamburger Menu untuk mobile */}
            <div className="flex items-center gap-3">
              {/* Tombol hamburger untuk membuka mobile sidebar */}
              <button 
                onClick={() => setMobileSidebarOpen(true)} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-all lg:hidden"
              >
                <Menu size={20} className="text-gray-600" />
              </button>
              
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Peserta</span>
                  <ChevronRight size={12} className="text-gray-400" />
                  <span className="font-semibold text-gray-800 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    {getPageTitle()}
                  </span>
                </div>
              </div>
              
              {/* Title untuk mobile */}
              <div className="md:hidden">
                <span className="font-semibold text-gray-800 text-sm">{getPageTitle()}</span>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 md:gap-4">
              
              {/* DATE TIME - hide di mobile */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-teal-500" />
                  <span className="text-sm font-medium text-gray-700">{formatDate(time)}</span>
                </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-500" />
                  <span className="text-sm font-mono font-semibold text-gray-800">{formatTime(time)}</span>
                </div>
              </div>

              {/* NOTIFICATION BELL */}
              <div className="relative" style={{ zIndex: 9999 }}>
                <button 
                  id="notif-button-peserta"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <Bell size={18} className="text-gray-500" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                  )}
                </button>

                {notifOpen && (
                  <div 
                    id="notif-dropdown-peserta"
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                    style={{ zIndex: 99999 }}
                  >
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
              <div className="relative" style={{ zIndex: 9999 }}>
                <button
                  id="profile-button-peserta"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center rounded-lg font-bold text-sm shadow-md shadow-teal-500/25">
                    {userInitial}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{userFullName}</p>
                    <div className="flex items-center gap-1">
                      <Shield size={10} className="text-teal-500" />
                      <p className="text-xs text-gray-400">Peserta</p>
                    </div>
                  </div>
                  <ChevronDown size={14} className="hidden md:block text-gray-400 group-hover:text-gray-600 transition" />
                </button>

                {profileOpen && (
                  <div 
                    id="profile-dropdown-peserta"
                    className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                    style={{ zIndex: 99999 }}
                  >
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
                    </div>

                    <div className="border-t border-gray-200 my-1"></div>

                    <div className="py-2 pb-3">
                      <button 
                        onClick={handleLogoutClick}
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
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
          
        </div>

      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-zoomIn">
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Konfirmasi Logout</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Apakah Anda yakin ingin keluar?</p>
                </div>
              </div>
            </div>

            {/* Body Modal */}
            <div className="px-6 py-5">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{userFullName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                  <span>Sesi Anda akan berakhir jika melanjutkan</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleLogoutCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md shadow-red-500/20 flex items-center justify-center gap-2 group"
                >
                  <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                  Keluar Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-zoomIn {
          animation: zoomIn 0.2s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default PesertaLayout