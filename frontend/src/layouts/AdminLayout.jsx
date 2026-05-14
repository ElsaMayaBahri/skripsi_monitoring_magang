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
  UserPlus,
  GraduationCap,
  X,
  User,
  Settings,
  HelpCircle,
  Calendar,
  ChevronLeft,
  ChevronDown,
  Shield,
  Power,
  Clock,
  AlertTriangle
} from "lucide-react"

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [usersSubmenuOpen, setUsersSubmenuOpen] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  const [notifications, setNotifications] = useState([])

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
  const userInitial = currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : "A"
  const userFullName = currentUser.nama || "Admin Sistem"
  const userEmail = currentUser.email || "admin@kuantaacademy.com"

  useEffect(() => {
    const storedNotif = JSON.parse(localStorage.getItem("notifications") || "[]")
    setNotifications(storedNotif)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (date) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const isActive = (path) => {
    if (path === "/admin/dashboard" && location.pathname === "/admin/dashboard") return true
    if (path === "/admin/users" && location.pathname === "/admin/users") return true
    if (path === "/admin/divisi" && location.pathname === "/admin/divisi") return true
    if (path === "/admin/add-mentor" && location.pathname === "/admin/add-mentor") return true
    if (path === "/admin/add-peserta" && location.pathname === "/admin/add-peserta") return true
    return false
  }

  const isUsersMenuActive = () => {
    return location.pathname === "/admin/users" || 
           location.pathname === "/admin/add-mentor" || 
           location.pathname === "/admin/add-peserta" ||
           location.pathname.includes("/admin/users/edit-peserta") ||
           location.pathname.includes("/admin/users/edit-mentor")
  }

  const isSubmenuActive = (submenuPath) => {
    if (submenuPath === "add-mentor" && location.pathname === "/admin/add-mentor") return true
    if (submenuPath === "add-peserta" && location.pathname === "/admin/add-peserta") return true
    return false
  }

  const getBreadcrumbTitle = () => {
    const path = location.pathname.replace("/admin/", "")
    
    if (location.pathname.includes("/admin/users/edit-peserta/")) {
      return "Edit Peserta"
    }
    if (location.pathname.includes("/admin/users/edit-mentor/")) {
      return "Edit Mentor"
    }
    
    const titles = {
      "dashboard": "Dashboard",
      "users": "Kelola Akun",
      "divisi": "Kelola Divisi",
      "add-mentor": "Tambah Mentor",
      "add-peserta": "Tambah Peserta",
      
    }
    return titles[path] || path
  }

  const getParentPage = () => {
    if (location.pathname.includes("/admin/users/edit")) {
      return "Kelola Akun"
    }
    return null
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true)
    setProfileOpen(false)
  }

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("role")
    localStorage.removeItem("rememberedEmail")
    setLogoutConfirmOpen(false)
    navigate("/login")
  }

  const handleLogoutCancel = () => {
    setLogoutConfirmOpen(false)
  }

  const toggleUsersSubmenu = (e) => {
    e.stopPropagation()
    if (!collapsed) {
      setUsersSubmenuOpen(!usersSubmenuOpen)
    }
  }

  const handleUsersMenuClick = () => {
    navigate("/admin/users")
  }


  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
      
      {/* DECORATIVE GRADIENT LINE - FULL WIDTH DI ATAS */}
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
                <p className="text-xs text-gray-400 font-medium">Admin Portal</p>
              </div>
            )}
          </div>

          {/* MENU */}
          <div className="px-3 py-6 flex-1 overflow-y-auto">
            <div className="mb-4">
              <ul className="space-y-1 text-sm">
                
                <Link to="/admin/dashboard">
                  <li className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive("/admin/dashboard")
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                    <LayoutDashboard size={18} />
                    {!collapsed && <span className="font-medium">Dashboard</span>}
                    {isActive("/admin/dashboard") && !collapsed && (
                      <div className="ml-auto w-1.5 h-5 bg-white rounded-full"></div>
                    )}
                  </li>
                </Link>

                {/* Kelola Akun dengan dropdown */}
                <li>
                  <div 
                    onClick={handleUsersMenuClick}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isUsersMenuActive()
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={18} />
                      {!collapsed && <span className="font-medium">Kelola Akun</span>}
                    </div>
                    {!collapsed && (
                      <button onClick={toggleUsersSubmenu} className="p-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`transition-transform duration-200 ${usersSubmenuOpen ? "rotate-180" : ""}`}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {!collapsed && usersSubmenuOpen && (
                    <div className="ml-7 mt-2 space-y-1">
                      <Link to="/admin/add-mentor">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          isSubmenuActive("add-mentor")
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <UserPlus size={14} />
                          <span>Tambah Mentor</span>
                        </div>
                      </Link>
                      <Link to="/admin/add-peserta">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                          isSubmenuActive("add-peserta")
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}>
                          <GraduationCap size={14} />
                          <span>Tambah Peserta</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </li>

                <Link to="/admin/divisi">
                  <li className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive("/admin/divisi")
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                    <Building2 size={18} />
                    {!collapsed && <span className="font-medium">Kelola Divisi</span>}
                    {isActive("/admin/divisi") && !collapsed && (
                      <div className="ml-auto w-1.5 h-5 bg-white rounded-full"></div>
                    )}
                  </li>
                </Link>

              </ul>
            </div>
          </div>

          {/* LOGOUT BUTTON - SIDEBAR - PREMIUM */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogoutClick}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30"
            >
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              <div className={`relative flex items-center justify-center gap-2 py-2.5 ${collapsed ? "px-2" : "px-4"}`}>
                <Power size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                {!collapsed && <span className="font-medium">Keluar</span>}
              </div>
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

        {/* RIGHT SIDE - Topbar + Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-gradient-to-br from-gray-50 to-gray-100">
          
          {/* TOPBAR PREMIUM */}
          <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 shadow-sm shrink-0 relative z-50">
            
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
                  <span className="text-gray-500">Admin</span>
                  <ChevronRight size={12} className="text-gray-400" />
                  <span className="font-semibold text-gray-800 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    {getBreadcrumbTitle()}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">
              
              {/* Date Time Card - Compact & Premium */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-teal-500" />
                  <span className="text-sm font-medium text-gray-700">{formatDate(currentDateTime)}</span>
                </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-500" />
                  <span className="text-sm font-mono font-semibold text-gray-800">{formatTime(currentDateTime)}</span>
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
                            <p className="text-sm font-medium text-gray-800">{n.judul || "Notifikasi"}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.pesan}</p>
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
                    <p className="text-xs text-gray-400">Administrator</p>
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
                            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Administrator</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LOGOUT BUTTON - PROFILE DROPDOWN - PREMIUM & RATA */}
                    <div className="py-2">
                      <button 
                        onClick={handleLogoutClick}
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

      {/* LOGOUT CONFIRMATION MODAL */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
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
    </div>
  )
}

export default AdminLayout