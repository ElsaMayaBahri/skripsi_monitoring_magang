import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import logo from "../assets/logo.png"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart3,
  Menu,
  LogOut
} from "lucide-react"

function CooLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState("")

  const isActive = (path) => location.pathname.includes(path)

  // 🔥 REALTIME CLOCK
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setTime(now.toLocaleTimeString())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 🔥 BREADCRUMB DINAMIS
  const getTitle = () => {
    if (location.pathname.includes("materi")) return "Materi"
    if (location.pathname.includes("quiz")) return "Kuis"
    if (location.pathname.includes("monitoring")) return "Monitoring"
    return "Dashboard"
  }

  // 🔥 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("isLogin")
    localStorage.removeItem("role")
    navigate("/")
  }

  return (
    <div className="h-screen flex bg-[#f5f7fb]">

      {/* SIDEBAR */}
      <div
        className={`bg-white border-r flex flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >

        {/* LOGO */}
        <div className="p-5 flex items-center gap-3 border-b">
          <img src={logo} className="w-10" />
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-gray-800">COO Panel</h1>
              <p className="text-xs text-gray-400">Monitoring</p>
            </div>
          )}
        </div>

        {/* MENU */}
        <div className="flex-1 px-3 py-4 space-y-2 text-sm">

          {/* DASHBOARD */}
          <Link to="/coo/dashboard">
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                isActive("dashboard")
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard size={18} />
              {!collapsed && "Dashboard"}
            </div>
          </Link>

          {/* MATERI */}
          <Link to="/coo/materi">
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                isActive("materi")
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <BookOpen size={18} />
              {!collapsed && "Materi Kompetensi"}
            </div>
          </Link>

          {/* 🔥 FIXED: KUIS */}
          <Link to="/coo/quiz">
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                isActive("quiz")
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <ClipboardList size={18} />
              {!collapsed && "Kuis"}
            </div>
          </Link>

          {/* MONITORING */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <BarChart3 size={18} />
            {!collapsed && "Monitoring"}
          </div>

        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg text-sm hover:bg-red-100 transition"
          >
            <LogOut size={16} />
            {!collapsed && "Logout"}
          </button>
        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white border-b px-6 py-3 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <Menu
              className="cursor-pointer"
              onClick={() => setCollapsed(!collapsed)}
            />

            {/* 🔥 BREADCRUMB */}
            <span className="text-sm text-gray-500">
              COO /{" "}
              <span className="text-gray-800 font-medium">
                {getTitle()}
              </span>
            </span>
          </div>

          {/* JAM */}
          <div className="text-sm text-gray-500">
            {time}
          </div>

        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto">
          <Outlet />
        </div>

      </div>

    </div>
  )
}

export default CooLayout