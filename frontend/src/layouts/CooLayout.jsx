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
  PlusCircle,
  List,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  X,
  TrendingUp,
  UserCheck,
  Download,
  Calendar,
  Clock
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

  useEffect(() => {
    const storedMateri = JSON.parse(localStorage.getItem("materi")) || []
    const storedQuiz = JSON.parse(localStorage.getItem("quiz")) || []
    const storedNotif = JSON.parse(localStorage.getItem("notifications")) || []

    setMateriCount(storedMateri.length)
    setQuizCount(storedQuiz.length)
    setNotifications(storedNotif)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

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

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">
      
      {/* SIDEBAR */}
      <aside 
        className={`relative bg-white border-r border-gray-200 
          flex flex-col transition-all duration-300 shadow-sm z-20
          ${collapsed ? "w-20" : "w-64"}`}
      >
        
        {/* LOGO SECTION */}
        <div className={`px-4 py-5 flex items-center gap-3 border-b border-gray-200 
          ${collapsed ? "justify-center" : ""}`}>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            <Menu size={18} className="text-gray-500" />
          </button>
          
          {!collapsed && (
            <>
              <img src={logo} className="w-8 h-8 object-contain" alt="Kuanta Logo" />
              <div className="flex flex-col">
                <h1 className="font-bold text-gray-800 text-sm">
                  Kuanta Academy
                </h1>
                <p className="text-xs text-gray-500">
                  COO Panel
                </p>
              </div>
            </>
          )}
        </div>

        {/* MENU NAVIGATION */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-1.5">
            
            {/* DASHBOARD */}
            <li>
              <Link to="/coo/dashboard">
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive("/coo/dashboard") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-100"}`}>
                  <LayoutDashboard size={20} />
                  {!collapsed && <span className="font-medium">Dashboard</span>}
                  {isActive("/coo/dashboard") && !collapsed && (
                    <div className="ml-auto w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </Link>
            </li>

            {/* MATERI MENU */}
            <li>
              <div
                onClick={() => !collapsed && setMateriOpen(!materiOpen)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive("/coo/materi") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-100"}`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={20} />
                  {!collapsed && <span className="font-medium">Materi</span>}
                </div>
                {!collapsed && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${materiOpen ? "rotate-180" : ""}`}
                  />
                )}
              </div>

              {!collapsed && materiOpen && (
                <ul className="ml-9 mt-1 space-y-1">
                  <Link to="/coo/materi">
                    <li className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                      ${location.pathname === "/coo/materi" 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-500 hover:bg-gray-100"}`}>
                      <List size={14} />
                      <span>Daftar Materi</span>
                    </li>
                  </Link>
                  <Link to="/coo/add-materi">
                    <li className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                      ${location.pathname === "/coo/add-materi" 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-500 hover:bg-gray-100"}`}>
                      <PlusCircle size={14} />
                      <span>Tambah Materi</span>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* QUIZ MENU */}
            <li>
              <div
                onClick={() => !collapsed && setQuizOpen(!quizOpen)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive("/coo/quiz") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-100"}`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList size={20} />
                  {!collapsed && <span className="font-medium">Kuis</span>}
                </div>
                {!collapsed && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${quizOpen ? "rotate-180" : ""}`}
                  />
                )}
              </div>

              {!collapsed && quizOpen && (
                <ul className="ml-9 mt-1 space-y-1">
                  <Link to="/coo/quiz">
                    <li className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                      ${location.pathname === "/coo/quiz" 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-500 hover:bg-gray-100"}`}>
                      <List size={14} />
                      <span>Daftar Kuis</span>
                    </li>
                  </Link>
                  <Link to="/coo/add-quiz">
                    <li className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                      ${location.pathname === "/coo/add-quiz" 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-500 hover:bg-gray-100"}`}>
                      <PlusCircle size={14} />
                      <span>Buat Kuis</span>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

          

            {/* PRESENSI MENU - UPDATED dengan link ke halaman presensi */}
            <li>
              <div
                onClick={() => !collapsed && setPresensiOpen(!presensiOpen)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive("/coo/presensi") || isActive("/coo/laporan-presensi")
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-100"}`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck size={20} />
                  {!collapsed && <span className="font-medium">Presensi</span>}
                </div>
                {!collapsed && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${presensiOpen ? "rotate-180" : ""}`}
                  />
                )}
              </div>

              {!collapsed && presensiOpen && (
                <ul className="ml-9 mt-1 space-y-1">
                  {/* Link ke Data Presensi */}
                  <Link to="/coo/presensi">
                    <li className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                      ${location.pathname === "/coo/presensi" 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-500 hover:bg-gray-100"}`}>
                      <UserCheck size={14} />
                      <span>Data Presensi</span>
                    </li>
                  </Link>
                  {/* Link ke Laporan Rekap Presensi */}
                  <Link to="/coo/laporan-presensi">
                    <li className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                      ${location.pathname === "/coo/laporan-presensi" 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-500 hover:bg-gray-100"}`}>
                      <Download size={14} />
                      <span>Laporan Rekap</span>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* PENGATURAN MENU */}
            <li>
              <div
                onClick={() => !collapsed && setPengaturanOpen(!pengaturanOpen)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive("/coo/settings-attendance") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-100"}`}
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} />
                  {!collapsed && <span className="font-medium">Pengaturan</span>}
                </div>
                {!collapsed && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${pengaturanOpen ? "rotate-180" : ""}`}
                  />
                )}
              </div>

              {!collapsed && pengaturanOpen && (
                <ul className="ml-9 mt-1 space-y-1">
                  <Link to="/coo/settings-attendance">
                    <li className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                      ${location.pathname === "/coo/settings-attendance" 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-500 hover:bg-gray-100"}`}>
                      <Calendar size={14} />
                      <span>Hari Libur & Jam Kerja</span>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

          </ul>
        </nav>

        {/* BOTTOM SECTION - LOGOUT */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              bg-red-50 text-red-600 hover:bg-red-100
              ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={18} />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-gray-200 
          flex items-center justify-between px-6 shadow-sm z-10">
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">COO</span>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-800">
                {getPageTitle()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs text-gray-400">
                {time.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {time.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Bell size={18} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                    <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        Tidak ada notifikasi
                      </div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div key={idx} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition">
                          <p className="text-sm font-medium text-gray-800">{notif.judul}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.pesan}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.created_at || "Baru saja"}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 text-white 
                  flex items-center justify-center rounded-full font-semibold shadow-sm">
                  {userInitial}
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">
                      {currentUser.nama || "COO User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser.email || "coo@kuantaacademy.com"}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">Role: COO/Mentor</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <User size={14} />
                      <span>Profil Saya</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <Settings size={14} />
                      <span>Pengaturan</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                      <HelpCircle size={14} />
                      <span>Bantuan</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-200 pt-2 pb-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </div>
        
      </main>
    </div>
  )
}

export default CooLayout