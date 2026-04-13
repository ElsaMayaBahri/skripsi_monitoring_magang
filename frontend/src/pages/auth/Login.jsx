import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import logo from "../../assets/logo.png"
import illustration from "../../assets/login.png"

// 🔥 CONFIG API
const API_URL = "http://localhost:8000/api"

// Setup axios default config
axios.defaults.baseURL = API_URL
axios.defaults.withCredentials = true
axios.defaults.headers.common["Accept"] = "application/json"
axios.defaults.headers.common["Content-Type"] = "application/json"

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // 🔥 Cek apakah sudah login sebelumnya
  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    
    if (token && role) {
      // Redirect sesuai role jika sudah login
      if (role === "admin") {
        navigate("/admin/dashboard")
      } else if (role === "coo" || role === "mentor") {
        navigate("/coo/dashboard")
      }
    }
    
    // 🔥 Load remembered email
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [navigate])

  const handleLogin = async () => {
    // Validasi input
    if (!email.trim()) {
      setError("Email harus diisi")
      return
    }
    if (!password) {
      setError("Password harus diisi")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post("/login", {
        email: email.trim(),
        password
      })

      // 🔥 Kalau login berhasil
      if (response.data.success) {
        // Simpan data ke localStorage
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        localStorage.setItem("role", response.data.role)
        
        // Simpan email jika remember me dicentang
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email.trim())
        } else {
          localStorage.removeItem("rememberedEmail")
        }

        // Set header untuk request berikutnya
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`

        // Redirect berdasarkan role dari backend
        const redirectPath = response.data.redirect
        navigate(redirectPath)
      }

    } catch (err) {
      console.error("Login error:", err)
      
      if (err.response) {
        // Server merespon dengan error
        const status = err.response.status
        const message = err.response.data.message
        
        if (status === 401) {
          setError("Email atau password salah")
        } else if (status === 403) {
          setError("Akun Anda tidak aktif. Silakan hubungi administrator.")
        } else if (status === 422) {
          // Validation error
          const errors = err.response.data.errors
          if (errors) {
            const firstError = Object.values(errors)[0]
            setError(firstError[0])
          } else {
            setError(message || "Validasi gagal")
          }
        } else {
          setError(message || "Login gagal, silakan coba lagi")
        }
      } else if (err.request) {
        // Request dibuat tapi tidak ada response
        setError("Tidak dapat terhubung ke server. Pastikan backend berjalan.")
      } else {
        // Error lain
        setError("Terjadi kesalahan. Silakan coba lagi.")
      }
    } finally {
      setLoading(false)
    }
  }

  // 🔥 Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleLogin()
    }
  }

  // 🔥 Demo accounts untuk testing (sementara, nanti hapus)
  const demoAccounts = [
    { role: "Admin", email: "admin@gmail.com", password: "password", redirect: "/admin/dashboard" },
    { role: "COO/Mentor", email: "coo@gmail.com", password: "password", redirect: "/coo/dashboard" },
    { role: "Peserta", email: "peserta@gmail.com", password: "password", redirect: "/peserta/dashboard" }
  ]

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError("")
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-between px-24 py-12">
        
        <div>
          <img src={logo} alt="logo" className="w-48 brightness-0 invert" />
        </div>

        <div className="flex justify-center items-center flex-1">
          <img
            src={illustration}
            alt="illustration"
            className="w-full max-w-xl object-contain"
          />
        </div>

        <div className="mt-6">
          <h2 className="text-3xl font-bold text-white">
            Sistem Monitoring Magang
          </h2>
          <p className="text-blue-100 text-base mt-3 leading-relaxed max-w-lg">
            Platform terintegrasi untuk memantau kehadiran, aktivitas,
            dan laporan magang mahasiswa secara real-time.
          </p>
        </div>
      </div>

      {/* MOBILE BRANDING (visible di mobile) */}
      <div className="lg:hidden w-full bg-gradient-to-br from-blue-600 to-blue-800 py-8 px-6 text-center">
        <img src={logo} alt="logo" className="w-32 mx-auto brightness-0 invert" />
        <h2 className="text-xl font-bold text-white mt-4">Sistem Monitoring Magang</h2>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-gray-900 px-6 py-12 lg:px-24">
        <div className="w-full max-w-md">
          
          {/* Header Form */}
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Selamat Datang Kembali
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Silakan masuk dengan akun Anda
            </p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <span className="text-sm flex-1">{error}</span>
              <button 
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* EMAIL FIELD */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Terdaftar
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* PASSWORD FIELD */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Kata Sandi
              </label>
              <span className="text-blue-500 cursor-pointer text-xs hover:underline">
                Lupa Kata Sandi?
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* REMEMBER ME & TERMS */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Ingat saya
            </label>
            <a href="#" className="text-xs text-gray-400 hover:text-blue-500">
              Kebijakan Privasi
            </a>
          </div>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              "Masuk ke Sistem"
            )}
          </button>

          {/* DEMO ACCOUNTS (HANYA UNTUK TESTING - HAPUS NANTI) */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 text-center">
              🔐 AKUN DEMO (Testing)
            </p>
            <div className="space-y-2">
              {demoAccounts.map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => fillDemoAccount(demo.email, demo.password)}
                  className="w-full text-left text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition"
                >
                  <span className="font-medium">{demo.role}:</span> {demo.email}
                </button>
              ))}
            </div>
          </div>

          {/* HELP TEXT */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-6 text-center">
            Butuh bantuan?{" "}
            <span className="text-blue-500 cursor-pointer hover:underline">
              Silakan hubungi administrator sistem
            </span>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login