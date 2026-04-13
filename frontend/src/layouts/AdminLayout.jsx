import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import logo from "../assets/logo.png"

import {
  LayoutDashboard,
  Users,
  Building2,
  Menu,
  Bell,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  UserPlus,
  GraduationCap
} from "lucide-react"

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [time, setTime] = useState(new Date())

  const [users, setUsers] = useState([])
  const [divisi, setDivisi] = useState([])
  const [notifications, setNotifications] = useState([])

  // Ambil data user dari localStorage (atau API nanti)
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
  const userInitial = currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : "A"

  // Ambil data real
  useEffect(() => {
    // 🔥 Nanti ganti dengan API call
    const storedUsers = JSON.parse(localStorage.getItem("users")) || []
    const storedDivisi = JSON.parse(localStorage.getItem("divisi")) || []
    const storedNotif = JSON.parse(localStorage.getItem("notifications")) || []
    
    setUsers(storedUsers)
    setDivisi(storedDivisi)
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
    if (path === "/admin/dashboard" && location.pathname === "/admin/dashboard") return true
    if (path === "/admin/users" && location.pathname === "/admin/users") return true
    if (path === "/admin/divisi" && location.pathname === "/admin/divisi") return true
    if (path === "/admin/add-mentor" && location.pathname === "/admin/add-mentor") return true
    if (path === "/admin/add-peserta" && location.pathname === "/admin/add-peserta") return true
    return false
  }

  // Get breadcrumb title
  const getBreadcrumbTitle = () => {
    const path = location.pathname.replace("/admin/", "")
    const titles = {
      "dashboard": "Dashboard",
      "users": "Kelola Akun",
      "divisi": "Kelola Divisi",
      "add-mentor": "Tambah Mentor",
      "add-peserta": "Tambah Peserta",
      "edit-user": "Edit User"
    }
    return titles[path] || path
  }

  // Hitung jumlah notifikasi belum dibaca
  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  return (
    <div className="h-screen flex bg-[#f5f7fb] dark:bg-gray-900">

      {/* ==================== SIDEBAR ==================== */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>

        {/* LOGO */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
          <img src={logo} className="w-10 h-10 object-contain" alt="Logo" />
          {!collapsed && (
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white text-sm">
                Sistem Magang
              </h1>
              <p className="text-xs text-gray-400">Admin Portal</p>
            </div>
          )}
        </div>

        {/* MENU NAVIGATION */}
        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <ul className="space-y-1 text-sm">
            
            {/* DASHBOARD */}
            <Link to="/admin/dashboard">
              <li className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive("/admin/dashboard")
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}>
                <LayoutDashboard size={18} />
                {!collapsed && <span>Dashboard</span>}
                {isActive("/admin/dashboard") && !collapsed && (
                  <div className="ml-auto w-1.5 h-5 bg-blue-600 rounded-full"></div>
                )}
              </li>
            </Link>

            {/* KELOLA AKUN */}
            <Link to="/admin/users">
              <li className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive("/admin/users")
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}>
                <Users size={18} />
                {!collapsed && <span>Kelola Akun</span>}
              </li>
            </Link>

            {/* TAMBAH MENTOR - SUBMENU */}
            <Link to="/admin/add-mentor">
              <li className={`flex items-center gap-3 px-3 py-2 pl-9 rounded-lg transition-all ${
                isActive("/admin/add-mentor")
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}>
                <UserPlus size={16} />
                {!collapsed && <span className="text-xs">Tambah Mentor</span>}
              </li>
            </Link>

            {/* TAMBAH PESERTA - SUBMENU */}
            <Link to="/admin/add-peserta">
              <li className={`flex items-center gap-3 px-3 py-2 pl-9 rounded-lg transition-all ${
                isActive("/admin/add-peserta")
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}>
                <GraduationCap size={16} />
                {!collapsed && <span className="text-xs">Tambah Peserta</span>}
              </li>
            </Link>

            {/* KELOLA DIVISI */}
            <Link to="/admin/divisi">
              <li className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive("/admin/divisi")
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}>
                <Building2 size={18} />
                {!collapsed && <span>Kelola Divisi</span>}
              </li>
            </Link>

          </ul>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-all"
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* COLLAPSE TOGGLE BUTTON (FLOATING) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
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

            {/* MENU BUTTON (untuk collapsed) - sudah ada di sidebar, ini tambahan */}
            <button 
              onClick={() => setCollapsed(!collapsed)} 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* BREADCRUMB */}
            <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
              <span>Admin</span>
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
                <Users size={14} />
                <span>{users.length} User</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Building2 size={14} />
                <span>{divisi.length} Divisi</span>
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
                        <div key={idx} className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <p className="text-sm font-medium">{notif.judul}</p>
                          <p className="text-xs text-gray-500">{notif.pesan}</p>
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
                    <p className="text-sm font-medium">{currentUser.nama || "Administrator"}</p>
                    <p className="text-xs text-gray-500">{currentUser.email || "admin@mail.com"}</p>
                    <p className="text-xs text-blue-600 mt-1">Role: Admin</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>

      </div>

    </div>
  )
}

export default AdminLayout