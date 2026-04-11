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
  Sun
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

  const isActive = (path) => location.pathname === path

  // 🔥 ambil data real
  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem("users")) || [])
    setDivisi(JSON.parse(localStorage.getItem("divisi")) || [])
  }, [])

  // 🔥 realtime clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // 🔥 DARK MODE APPLY KE HTML ROOT
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  return (
    <div className="h-screen flex bg-[#f5f7fb] dark:bg-gray-900">

      {/* SIDEBAR */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all ${collapsed ? "w-20" : "w-64"}`}>

        {/* LOGO */}
        <div className="px-4 py-5 flex items-center gap-3">
          <img src={logo} className="w-12 h-12 object-contain" />
          {!collapsed && (
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white">
                Sistem Magang
              </h1>
              <p className="text-xs text-gray-400">Admin Portal</p>
            </div>
          )}
        </div>

        {/* MENU */}
        <div className="px-3 py-4 flex-1">
          <ul className="space-y-2 text-sm">

            <Link to="/admin/dashboard">
              <li className={`flex items-center gap-3 px-3 py-2 rounded-lg relative ${
                isActive("/admin/dashboard")
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}>
                {isActive("/admin/dashboard") && (
                  <div className="absolute left-0 w-1 h-full bg-blue-600 rounded-r"></div>
                )}
                <LayoutDashboard size={18} />
                {!collapsed && "Dashboard"}
              </li>
            </Link>

            <Link to="/admin/users">
              <li className={`flex items-center gap-3 px-3 py-2 rounded-lg relative ${
                isActive("/admin/users")
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}>
                {isActive("/admin/users") && (
                  <div className="absolute left-0 w-1 h-full bg-blue-600"></div>
                )}
                <Users size={18} />
                {!collapsed && "Kelola Akun"}
              </li>
            </Link>

            <Link to="/admin/divisi">
              <li className={`flex items-center gap-3 px-3 py-2 rounded-lg relative ${
                isActive("/admin/divisi")
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}>
                {isActive("/admin/divisi") && (
                  <div className="absolute left-0 w-1 h-full bg-blue-600"></div>
                )}
                <Building2 size={18} />
                {!collapsed && "Kelola Divisi"}
              </li>
            </Link>

          </ul>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              localStorage.clear()
              navigate("/")
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            <LogOut size={16} />
            {!collapsed && "Logout"}
          </button>
        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* 🔥 TOPBAR FIX (NO DOUBLE MENU) */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">

          {/* LEFT */}
          <div className="flex items-center gap-4">

            {/* ✅ SINGLE BUTTON ONLY */}
            <button onClick={() => setCollapsed(!collapsed)}>
              <Menu size={20} />
            </button>

            {/* BREADCRUMB */}
            <div className="flex items-center text-sm text-gray-500 gap-2">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span className="text-gray-800 dark:text-white font-medium capitalize">
                {location.pathname.replace("/admin/", "")}
              </span>
            </div>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-6">

            {/* REAL DATA */}
            <div className="hidden md:flex gap-4 text-xs text-gray-500">
              <span>👥 {users.length} User</span>
              <span>🏢 {divisi.length} Divisi</span>
            </div>

            {/* CLOCK */}
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {time.toLocaleTimeString("id-ID")}
            </div>

            {/* DARK MODE */}
            <button onClick={() => setDark(!dark)}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* NOTIF */}
            <div className="relative">
              <Bell size={18} onClick={() => setNotifOpen(!notifOpen)} />

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-3 text-sm">
                  Tidak ada notifikasi
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="relative">
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 bg-blue-500 text-white flex items-center justify-center rounded-full cursor-pointer"
              >
                A
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                  <div className="p-3 text-sm border-b">Admin</div>
                  <button
                    onClick={() => {
                      localStorage.clear()
                      navigate("/")
                    }}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* CONTENT */}
        <div className="p-8 overflow-y-auto">
          <Outlet />
        </div>

      </div>

    </div>
  )
}

export default AdminLayout