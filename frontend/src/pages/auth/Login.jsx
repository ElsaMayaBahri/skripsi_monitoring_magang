import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import logo from "../../assets/logo.png"
import illustration from "../../assets/login.png"

// 🔥 CONFIG API (sesuaikan nanti dengan backend)
const API_URL = "http://localhost:8000/api"

axios.defaults.baseURL = API_URL
axios.defaults.withCredentials = true

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("/login", {
        email,
        password
      })

      // 🔥 kalau login berhasil
      if (response.data.success) {
        // simpan data ke localStorage
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        localStorage.setItem("role", response.data.role)

        // set header untuk request berikutnya
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`

        // redirect dari backend
        navigate(response.data.redirect)
      }

    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Login gagal")
      } else if (err.request) {
        setError("Tidak dapat terhubung ke server")
      } else {
        setError("Terjadi kesalahan")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT */}
      <div className="w-1/2 bg-[#f1f5f9] flex flex-col justify-between px-24 py-12">
        
        <div>
          <img src={logo} alt="logo" className="w-48" />
        </div>

        <div className="flex justify-center items-center flex-1">
          <img
            src={illustration}
            alt="illustration"
            className="w-full max-w-xl object-contain"
          />
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Sistem Monitoring Magang
          </h2>
          <p className="text-gray-500 text-base mt-3 leading-relaxed max-w-lg">
            Platform terintegrasi untuk memantau kehadiran, aktivitas,
            dan laporan magang mahasiswa.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-1/2 flex items-center justify-center bg-white px-24">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            Masuk
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Gunakan akun terdaftar untuk masuk ke sistem.
          </p>

          {/* ERROR */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div className="mb-5">
            <label className="text-sm text-gray-600">
              Email Terdaftar
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <label>Kata Sandi</label>
              <span className="text-blue-500 cursor-pointer text-xs">
                Lupa Kata Sandi?
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk ke Sistem"}
          </button>

          <p className="text-xs text-gray-400 mt-6 text-center">
            Butuh bantuan?{" "}
            <span className="text-blue-500 cursor-pointer">
              Silakan hubungi administrator sistem
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login