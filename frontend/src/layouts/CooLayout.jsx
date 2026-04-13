import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import logo from "../assets/logo.png"

import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart3,
  Menu,
  Bell,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  PlusCircle,
  List,
  FileText,
  HelpCircle,
  User
} from "lucide-react"

function CooLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [time, setTime] = useState(new Date())
  const [materiOpen, setMateriOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)

  const [materiCount, setMateriCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  // Ambil data user dari localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
  const userInitial = currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : "C"

  // Ambil data real (nanti ganti dengan API)
  useEffect(() => {
    const storedMateri = JSON.parse(localStorage.getItem("materi")) || []
    const storedQuiz = JSON.parse(localStorage.getItem("quiz")) || []
    const storedNotif = JSON.parse(localStorage.getItem("notifications")) || []
    
    setMateriCount(storedMateri.length)
    setQuizCount(storedQuiz.length)
    setNotifications(storedNotif)
  }, [])

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Dark mode apply ke HTML root
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  // Cek apakah path aktif
  const isActive = (path) => {
    if (path === "/coo/dashboard" && location.pathname === "/coo/dashboard") return true
    if (path === "/coo/materi" && location.pathname === "/coo/materi") return true
    if (path === "/coo/add-materi" && location.pathname === "/coo/add-materi") return true
    if (path === "/coo/edit-materi" && location.pathname.includes("/coo/edit-materi")) return true
    if (path === "/coo/quiz" && location.pathname === "/coo/quiz") return true
    if (path === "/coo/add-quiz" && location.pathname === "/coo/add-quiz") return true
    if (path === "/coo/add-question" && location.pathname.includes("/coo/add-question")) return true
    if (path === "/coo/quiz-detail" && location.pathname.includes("/coo/quiz/")) return true
    return false
  }

  // Cek apakah menu materi aktif
  const isMateriActive = () => {
    return location.pathname.includes("/coo/materi") || 
           location.pathname.includes("/coo/add-materi") ||
           location.pathname.includes("/coo/edit-materi")
  }

  // Cek apakah menu quiz aktif
  const isQuizActive = () => {
    return location.pathname.includes("/coo/quiz") || 
           location.pathname.includes("/coo/add-quiz") ||
           location.pathname.includes("/coo/add-question") ||
           location.pathname.includes("/coo/quiz/")
  }

  // Get breadcrumb title
  const getBreadcrumbTitle = () => {
    const path = location.pathname.replace("/coo/", "")
    const titles = {
      "dashboard": "Dashboard",
      "materi": "Materi Kompetensi",
      "add-materi": "Tambah Materi",
      "edit-materi": "Edit Materi",
      "quiz": "Kuis",
      "add-quiz": "Tambah Kuis",
      "add-question": "Tambah Soal",
    }
    
    if (path.includes("edit-materi")) return "Edit Materi"
    if (path.includes("quiz/")) return "Detail Kuis"
    if (path.includes("add-question")) return "Tambah Soal"
    
    return titles[path] || path
  }

  // Hitung jumlah notifikasi belum dibaca
  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  return (
    <div className={`h-screen flex ${dark ? 'dark' : ''}`}>
      <div className="h-screen flex bg-[#f5f7fb] dark:bg-gray-900">

        {/* ==================== SIDEBAR ==================== */}
        <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>

          {/* LOGO */}
          <div className="px-4 py-5 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
            <img src={logo} className="w-10 h-10 object-contain" alt="Logo" />
            {!collapsed && (
              <div>
                <h1 className="font-semibold text-gray-800 dark:text-white text-sm">
                  COO Panel
                </h1>
                <p className="text-xs text-gray-400">Monitoring Magang</p>
              </div>
            )}
          </div>

          {/* MENU NAVIGATION */}
          <div className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1 text-sm">

              {/* DASHBOARD */}
              <Link to="/coo/dashboard">
                <li className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  isActive("/coo/dashboard")
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
                  <LayoutDashboard size={18} />
                  {!collapsed && <span>Dashboard</span>}
                </li>
              </Link>

              {/* MATERI MENU (DROPDOWN) */}
              <li>
                <div
                  onClick={() => !collapsed && setMateriOpen(!materiOpen)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    isMateriActive()
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} />
                    {!collapsed && <span>Materi Kompetensi</span>}
                  </div>
                  {!collapsed && (
                    <ChevronRight size={16} className={`transition-transform ${materiOpen ? "rotate-90" : ""}`} />
                  )}
                </div>

                {/* SUBMENU MATERI */}
                {!collapsed && materiOpen && (
                  <ul className="ml-6 mt-1 space-y-1">
                    <Link to="/coo/materi">
                      <li className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive("/coo/materi")
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}>
                        <List size={14} />
                        <span>Daftar Materi</span>
                      </li>
                    </Link>
                    <Link to="/coo/add-materi">
                      <li className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive("/coo/add-materi")
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}>
                        <PlusCircle size={14} />
                        <span>Tambah Materi</span>
                      </li>
                    </Link>
                  </ul>
                )}
              </li>

              {/* QUIZ MENU (DROPDOWN) */}
              <li>
                <div
                  onClick={() => !collapsed && setQuizOpen(!quizOpen)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    isQuizActive()
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList size={18} />
                    {!collapsed && <span>Kuis</span>}
                  </div>
                  {!collapsed && (
                    <ChevronRight size={16} className={`transition-transform ${quizOpen ? "rotate-90" : ""}`} />
                  )}
                </div>

                {/* SUBMENU QUIZ */}
                {!collapsed && quizOpen && (
                  <ul className="ml-6 mt-1 space-y-1">
                    <Link to="/coo/quiz">
                      <li className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive("/coo/quiz")
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}>
                        <List size={14} />
                        <span>Daftar Kuis</span>
                      </li>
                    </Link>
                    <Link to="/coo/add-quiz">
                      <li className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive("/coo/add-quiz")
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}>
                        <PlusCircle size={14} />
                        <span>Tambah Kuis</span>
                      </li>
                    </Link>
                  </ul>
                )}
              </li>

              {/* MONITORING */}
              <li className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                location.pathname.includes("monitoring")
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}>
                <BarChart3 size={18} />
                {!collapsed && <span>Monitoring</span>}
              </li>

            </ul>
          </div>

          {/* STATISTIK SEDERHANA */}
          {!collapsed && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>📚 Materi</span>
                <span className="font-semibold">{materiCount}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>📝 Kuis</span>
                <span className="font-semibold">{quizCount}</span>
              </div>
            </div>
          )}

          {/* LOGOUT BUTTON */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
            >
              <LogOut size={16} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>

          {/* COLLAPSE TOGGLE BUTTON */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-all z-10"
          >
            <ChevronRight size={14} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>

        </div>

        {/* ==================== MAIN CONTENT ==================== */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* TOPBAR */}
          <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">

              {/* MENU BUTTON (mobile) */}
              <button 
                onClick={() => setCollapsed(!collapsed)} 
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden"
              >
                <Menu size={20} />
              </button>

              {/* BREADCRUMB */}
              <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                <span>COO</span>
                <ChevronRight size={14} />
                <span className="text-gray-800 dark:text-white font-medium capitalize">
                  {getBreadcrumbTitle()}
                </span>
              </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">

              {/* STATISTIK SINGKAT */}
              <div className="hidden lg:flex gap-4 text-xs">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <BookOpen size={14} />
                  <span>{materiCount} Materi</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <ClipboardList size={14} />
                  <span>{quizCount} Kuis</span>
                </div>
              </div>

              {/* CLOCK */}
              <div className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                {time.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>

              {/* DARK MODE TOGGLE */}
              <button 
                onClick={() => setDark(!dark)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                {dark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} />}
              </button>

              {/* NOTIFICATION BELL */}
              <div className="relative">
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-medium text-sm">
                      Notifikasi
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          Tidak ada notifikasi
                        </div>
                      ) : (
                        notifications.map((notif, idx) => (
                          <div key={idx} className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="text-sm font-medium">{notif.judul}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.pesan}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.created_at || "Baru saja"}</p>
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
                  className="w-9 h-9 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center rounded-full font-semibold hover:opacity-90 transition-all"
                >
                  {userInitial}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium">{currentUser.nama || "COO User"}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser.email || "coo@mail.com"}</p>
                      <p className="text-xs text-blue-600 mt-1">Role: COO/Mentor</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* PAGE CONTENT */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#f5f7fb] dark:bg-gray-900">
            <Outlet />
          </div>

        </div>

      </div>
    </div>
  )
}

export default CooLayout