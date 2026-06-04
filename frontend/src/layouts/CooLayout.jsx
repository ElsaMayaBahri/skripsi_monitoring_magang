// frontend/src/layouts/COOLayout.jsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import logo from "../assets/logo.png"
import { useNotifikasi } from "../context/NotifikasiContext"
import { logout } from "../api/auth/authService"  // ← Pastikan path ini benar

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
  Shield,
  Layers,
  Users,
  BarChart3,
  AlertCircle,
  Award
} from "lucide-react"

function CooLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  // State untuk deteksi preview via body class
  const [isPreviewActive, setIsPreviewActive] = useState(false)

  // Sidebar states
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  const [time, setTime] = useState(new Date())
  const [materiOpen, setMateriOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [presensiOpen, setPresensiOpen] = useState(false)
  const [pengaturanOpen, setPengaturanOpen] = useState(false)
  const [sertifikatOpen, setSertifikatOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const [materiCount, setMateriCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  
  // 🔥 🔥 🔥 PAKAI NOTIFIKASI DARI CONTEXT
  const { notifikasi: notifications, unreadCount } = useNotifikasi()

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
  const userInitial = currentUser.nama
    ? currentUser.nama.charAt(0).toUpperCase()
    : "C"
  const userFullName = currentUser.nama || "COO Perusahaan"
  const userEmail = currentUser.email || "coo@kuanta.id"

  // Monitor body class untuk preview-active
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsPreviewActive(document.body.classList.contains("preview-active"))
    })
    
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] })
    
    // Initial check
    setIsPreviewActive(document.body.classList.contains("preview-active"))
    
    return () => observer.disconnect()
  }, [])

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
        const profileButton = document.getElementById('profile-button-coo')
        const profileDropdown = document.getElementById('profile-dropdown-coo')
        if (profileButton && !profileButton.contains(event.target) && 
            profileDropdown && !profileDropdown.contains(event.target)) {
          setProfileOpen(false)
        }
      }
      if (notifOpen) {
        const notifButton = document.getElementById('notif-button-coo')
        const notifDropdown = document.getElementById('notif-dropdown-coo')
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
    const storedMateri = JSON.parse(localStorage.getItem("materi")) || []
    const storedQuiz = JSON.parse(localStorage.getItem("quiz")) || []

    setMateriCount(storedMateri.length)
    setQuizCount(storedQuiz.length)
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
    if (path === "/coo/dashboard") return location.pathname === "/coo/dashboard"
    if (path === "/coo/materi") return location.pathname.includes("/coo/materi")
    if (path === "/coo/quiz") return location.pathname === "/coo/quiz" || location.pathname === "/coo/add-quiz" || location.pathname.includes("/coo/edit-quiz")
    if (path === "/coo/daftar-hasil-kuis") return location.pathname === "/coo/daftar-hasil-kuis"
    if (path === "/coo/presensi") return location.pathname === "/coo/presensi"
    if (path === "/coo/laporan-presensi") return location.pathname === "/coo/laporan-presensi"
    if (path === "/coo/settings-attendance") return location.pathname === "/coo/settings-attendance"
    if (path === "/coo/kelola-sertifikat") return location.pathname === "/coo/kelola-sertifikat"
    if (path === "/coo/data-management") return location.pathname === "/coo/data-management"
    if (path === "/coo/profile") return location.pathname === "/coo/profile"
    return location.pathname.includes(path)
  }

  const getPageTitle = () => {
    const pathname = location.pathname
    
    if (pathname === "/coo/dashboard") return "Dashboard"
    if (pathname === "/coo/data-management") return "Manajemen Data"
    if (pathname === "/coo/materi") return "Materi Kompetensi"
    if (pathname === "/coo/add-materi") return "Tambah Materi Kompetensi"
    if (pathname.includes("/coo/edit-materi")) return "Edit Materi Kompetensi"
    if (pathname === "/coo/quiz") return "Kuis Kompetensi"
    if (pathname === "/coo/add-quiz") return "Buat Kuis Kompetensi Baru"
    if (pathname === "/coo/daftar-hasil-kuis") return "Hasil Kuis Kompetensi Peserta"
    if (pathname.includes("/coo/edit-quiz")) return "Edit Kuis Kompetensi"
    if (pathname.includes("/coo/quiz/") && pathname.includes("/hasil")) return "Detail Hasil Kuis Kompetensi"
    if (pathname === "/coo/presensi") return "Data Presensi Peserta"
    if (pathname === "/coo/laporan-presensi") return "Laporan Rekap Presensi"
    if (pathname === "/coo/settings-attendance") return "Pengaturan Hari Libur & Jam Kerja"
    if (pathname === "/coo/kelola-sertifikat") return "Kelola Sertifikat"
    if (pathname === "/coo/profile") return "Profil Saya"
    
    const lastPath = pathname.split('/').filter(p => p && !/^\d+$/.test(p)).pop()
    if (lastPath) {
      return lastPath.charAt(0).toUpperCase() + lastPath.slice(1).replace(/-/g, ' ')
    }
    
    return "COO Panel"
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
    setProfileOpen(false)
  }

 
const handleConfirmLogout = async () => {
    try {
        await logout()  // ← TAMBAHKAN INI
        
        setShowLogoutModal(false)
        localStorage.clear()
        navigate("/login", { replace: true })
    } catch (error) {
        console.error("Logout error:", error)
        localStorage.clear()
        setShowLogoutModal(false)
        navigate("/login", { replace: true })
    }
}

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }

  const handleProfile = () => {
    setProfileOpen(false)
    navigate("/coo/profile")
  }

  const handleMenuClick = () => {
    // Tutup mobile sidebar setelah klik menu
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false)
    }
  }

  const isMateriActive = () => {
    return location.pathname === "/coo/materi" || 
           location.pathname === "/coo/add-materi" || 
           location.pathname.includes("/coo/edit-materi")
  }

  const isQuizActive = () => {
    return location.pathname === "/coo/quiz" || 
           location.pathname === "/coo/add-quiz" || 
           location.pathname.includes("/coo/edit-quiz")
  }

  const isDaftarHasilKuisActive = () => {
    return location.pathname === "/coo/daftar-hasil-kuis"
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
            <p className="text-xs text-gray-400 font-medium">COO Panel</p>
          </div>
        )}
      </div>

      {/* MENU NAVIGATION */}
      <div className="px-3 py-6 flex-1 overflow-y-auto">
        <div className="mb-4">
          <ul className="space-y-1 text-sm">
            
            {/* DASHBOARD */}
            <Link to="/coo/dashboard" onClick={onMenuClick}>
              <li className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive("/coo/dashboard")
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                  : "text-gray-600 hover:bg-gray-100"
              }`}>
                <LayoutDashboard size={18} />
                {!isCollapsed && <span className="font-medium">Dashboard</span>}
                {isActive("/coo/dashboard") && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-5 bg-white rounded-full"></div>
                )}
              </li>
            </Link>

            {/* MANAJEMEN DATA */}
            <Link to="/coo/data-management" onClick={onMenuClick}>
              <li className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive("/coo/data-management")
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                  : "text-gray-600 hover:bg-gray-100"
              }`}>
                <Layers size={18} />
                {!isCollapsed && <span className="font-medium">Manajemen Data</span>}
                {isActive("/coo/data-management") && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-5 bg-white rounded-full"></div>
                )}
              </li>
            </Link>

            {/* MATERI KOMPETENSI MENU */}
            <li>
              <div 
                onClick={() => !isCollapsed && setMateriOpen(!materiOpen)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isMateriActive()
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={18} />
                  {!isCollapsed && <span className="font-medium">Materi Kompetensi</span>}
                </div>
                {!isCollapsed && (
                  <button onClick={(e) => { e.stopPropagation(); setMateriOpen(!materiOpen); }} className="p-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`transition-transform duration-200 ${materiOpen ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
              </div>

              {!isCollapsed && materiOpen && (
                <div className="ml-7 mt-2 space-y-1">
                  <Link to="/coo/materi" onClick={onMenuClick}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                      location.pathname === "/coo/materi"
                        ? "bg-teal-50 text-teal-600 font-medium"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}>
                      <List size={14} />
                      <span>Daftar Materi</span>
                    </div>
                  </Link>
                  <Link to="/coo/add-materi" onClick={onMenuClick}>
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

            {/* KUIS KOMPETENSI MENU */}
            <li>
              <div 
                onClick={() => !isCollapsed && setQuizOpen(!quizOpen)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isQuizActive() || isDaftarHasilKuisActive()
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList size={18} />
                  {!isCollapsed && <span className="font-medium">Kuis Kompetensi</span>}
                </div>
                {!isCollapsed && (
                  <button onClick={(e) => { e.stopPropagation(); setQuizOpen(!quizOpen); }} className="p-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`transition-transform duration-200 ${quizOpen ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
              </div>

              {!isCollapsed && quizOpen && (
                <div className="ml-7 mt-2 space-y-1">
                  <Link to="/coo/quiz" onClick={onMenuClick}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                      location.pathname === "/coo/quiz"
                        ? "bg-teal-50 text-teal-600 font-medium"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}>
                      <List size={14} />
                      <span>Daftar Kuis</span>
                    </div>
                  </Link>
                  <Link to="/coo/add-quiz" onClick={onMenuClick}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                      location.pathname === "/coo/add-quiz"
                        ? "bg-teal-50 text-teal-600 font-medium"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}>
                      <PlusCircle size={14} />
                      <span>Buat Kuis</span>
                    </div>
                  </Link>
                  <Link to="/coo/daftar-hasil-kuis" onClick={onMenuClick}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                      isDaftarHasilKuisActive()
                        ? "bg-teal-50 text-teal-600 font-medium"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}>
                      <BarChart3 size={14} />
                      <span>Hasil Kuis</span>
                    </div>
                  </Link>
                </div>
              )}
            </li>

            {/* PRESENSI MENU */}
            <li>
              <div 
                onClick={() => !isCollapsed && setPresensiOpen(!presensiOpen)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive("/coo/presensi") || isActive("/coo/laporan-presensi")
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck size={18} />
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
                  <Link to="/coo/presensi" onClick={onMenuClick}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                      location.pathname === "/coo/presensi"
                        ? "bg-teal-50 text-teal-600 font-medium"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}>
                      <UserCheck size={14} />
                      <span>Data Presensi</span>
                    </div>
                  </Link>
                  <Link to="/coo/laporan-presensi" onClick={onMenuClick}>
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

            {/* SERTIFIKAT MENU */}
            <li>
              <div 
                onClick={() => !isCollapsed && setSertifikatOpen(!sertifikatOpen)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive("/coo/kelola-sertifikat")
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award size={18} />
                  {!isCollapsed && <span className="font-medium">Sertifikat</span>}
                </div>
                {!isCollapsed && (
                  <button onClick={(e) => { e.stopPropagation(); setSertifikatOpen(!sertifikatOpen); }} className="p-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`transition-transform duration-200 ${sertifikatOpen ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
              </div>

              {!isCollapsed && sertifikatOpen && (
                <div className="ml-7 mt-2 space-y-1">
                  <Link to="/coo/kelola-sertifikat" onClick={onMenuClick}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                      location.pathname === "/coo/kelola-sertifikat"
                        ? "bg-teal-50 text-teal-600 font-medium"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}>
                      <Award size={14} />
                      <span>Kelola Sertifikat</span>
                    </div>
                  </Link>
                </div>
              )}
            </li>

            {/* PENGATURAN MENU */}
            <li>
              <div 
                onClick={() => !isCollapsed && setPengaturanOpen(!pengaturanOpen)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive("/coo/settings-attendance")
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings size={18} />
                  {!isCollapsed && <span className="font-medium">Pengaturan</span>}
                </div>
                {!isCollapsed && (
                  <button onClick={(e) => { e.stopPropagation(); setPengaturanOpen(!pengaturanOpen); }} className="p-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`transition-transform duration-200 ${pengaturanOpen ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
              </div>

              {!isCollapsed && pengaturanOpen && (
                <div className="ml-7 mt-2 space-y-1">
                  <Link to="/coo/settings-attendance" onClick={onMenuClick}>
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
      
      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-zoomIn">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-t-2xl"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <LogOut className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Konfirmasi Keluar</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Apakah Anda yakin ingin mengakhiri sesi ini?
                  <br />
                  <span className="text-sm text-slate-400">Anda akan keluar dari dashboard COO dan perlu login kembali untuk mengaksesnya.</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelLogout}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmLogout}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl text-white font-medium hover:shadow-lg transition-all"
                  >
                    Ya, Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DECORATIVE GRADIENT LINE */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-teal-400 z-50"></div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden pt-1">
        
        {/* DESKTOP SIDEBAR - Hanya tampil jika bukan preview page */}
        {!isPreviewActive && (
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
        )}

        {/* MOBILE SIDEBAR - Overlay, hanya tampil saat mobileSidebarOpen true dan bukan preview */}
        {!isPreviewActive && mobileSidebarOpen && (
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
          
          {/* TOPBAR - Hanya tampil jika bukan preview page */}
          {!isPreviewActive && (
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
                    <span className="text-gray-500">COO</span>
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
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50/80 rounded-xl border border-gray-200/80 shadow-sm">
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

                {/* 🔥 Notification Bell - PAKAI DARI CONTEXT */}
                <div className="relative" style={{ zIndex: 9999 }}>
                  <button 
                    id="notif-button-coo"
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
                      id="notif-dropdown-coo"
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
                              <p className="text-sm font-medium text-gray-800">{notif.judul || notif.title || "Notifikasi"}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.pesan || notif.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{notif.created_at || "Baru saja"}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" style={{ zIndex: 9999 }}>
                  <button
                    id="profile-button-coo"
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
                        <p className="text-xs text-gray-400">COO</p>
                      </div>
                    </div>
                    <ChevronDown size={14} className="hidden md:block text-gray-400 group-hover:text-gray-600 transition" />
                  </button>

                  {profileOpen && (
                    <div 
                      id="profile-dropdown-coo"
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
          )}

          {/* PAGE CONTENT */}
          <div className={`flex-1 ${isPreviewActive ? "overflow-hidden bg-black" : "overflow-auto"}`}>
            <Outlet />
          </div>
          
        </div>

      </div>

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
          animation: zoomIn 0.3s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default CooLayout