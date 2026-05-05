import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import logo from "../../assets/logo.png"

const API_URL = "http://localhost:8000/api"

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

axios.defaults.baseURL = API_URL
axios.defaults.withCredentials = false
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
  const [focusedField, setFocusedField] = useState(null)
  const [activeDemo, setActiveDemo] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // HANYA CEK TOKEN, JANGAN LANGSUNG REDIRECT
  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    
    if (token && role) {
      // Redirect setelah komponen mount, tapi dengan delay kecil
      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin/dashboard", { replace: true })
        } else if (role === "coo") {
          navigate("/coo/dashboard", { replace: true })
        } else if (role === "mentor") {
          navigate("/mentor/dashboard", { replace: true })
        } else if (role === "peserta") {
          navigate("/peserta/dashboard", { replace: true })
        }
      }, 100)
    }
    
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
    
    setIsCheckingAuth(false)
  }, [navigate])

  // Jika sedang mengecek auth, tampilkan loading
  if (isCheckingAuth) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #d4fcff 0%, #b2f0e8 50%, #9be5dc 100%)"
      }}>
        <div>Memuat...</div>
      </div>
    )
  }

  const handleLogin = async () => {
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
      const response = await axiosInstance.post("/login", {
        email: email.trim(),
        password,
      })

      console.log("LOGIN RESPONSE:", response.data)

      const token = response.data.token || response.data.data?.token
      const user = response.data.user || response.data.data?.user
      const role = response.data.role || response.data.data?.role

      if (!token) {
        throw new Error("Token tidak ditemukan dari backend")
      }

      // Simpan data kredensial baru
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("role", role)

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email.trim())
      } else {
        localStorage.removeItem("rememberedEmail")
      }

      axiosInstance.defaults.headers.Authorization = `Bearer ${token}`
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      // Redirect berdasarkan role
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true })
      } else if (role === "coo") {
        navigate("/coo/dashboard", { replace: true })
      } else if (role === "mentor") {
        navigate("/mentor/dashboard", { replace: true })
      } else if (role === "peserta") {
        navigate("/peserta/dashboard", { replace: true })
      } else {
        navigate("/login", { replace: true })
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err)

      if (err.response) {
        const status = err.response.status
        const message = err.response.data?.message

        if (status === 401) {
          setError("Email atau password salah")
        } else if (status === 403) {
          setError("Akun tidak aktif")
        } else if (status === 422) {
          const errors = err.response.data?.errors
          if (errors) {
            const firstError = Object.values(errors)[0]
            setError(Array.isArray(firstError) ? firstError[0] : firstError)
          } else {
            setError(message || "Validasi gagal")
          }
        } else {
          setError(message || "Login gagal")
        }
      } else if (err.request) {
        setError("Tidak bisa connect ke server. Pastikan backend berjalan.")
      } else {
        setError("Terjadi kesalahan: " + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleLogin()
    }
  }

  const demoAccounts = [
    { role: "Administrator", email: "admin@gmail.com", password: "password", color: "#e74c3c" },
    { role: "COO", email: "coo@gmail.com", password: "password", color: "#3498db" },
    { role: "Mentor", email: "mentor@gmail.com", password: "password", color: "#27ae60" },
    { role: "Peserta", email: "peserta@gmail.com", password: "password", color: "#f39c12" }
  ]

  const fillDemoAccount = (demoEmail, demoPassword, roleIndex) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setActiveDemo(roleIndex)
    setError("")
  }

  // SVG Icons
  const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )

  const MonitorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )

  const FileIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )

  const UsersIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )

  const MailIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 7l-10 7L2 7"/>
    </svg>
  )

  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #d4fcff 0%, #b2f0e8 50%, #9be5dc 100%)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "20px"
    },
    patternBg: {
      position: "absolute",
      inset: 0,
      opacity: 0.12,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23006666' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat"
    },
    circle1: {
      position: "absolute",
      top: "-150px",
      left: "-150px",
      width: "400px",
      height: "400px",
      background: "radial-gradient(circle, rgba(0,150,136,0.15) 0%, rgba(0,150,136,0) 70%)",
      borderRadius: "50%",
      animation: "float1 18s infinite ease-in-out"
    },
    circle2: {
      position: "absolute",
      bottom: "-150px",
      right: "-150px",
      width: "450px",
      height: "450px",
      background: "radial-gradient(circle, rgba(0,188,140,0.12) 0%, rgba(0,188,140,0) 70%)",
      borderRadius: "50%",
      animation: "float2 22s infinite ease-in-out"
    },
    mainCard: {
      display: "flex",
      maxWidth: "1060px",
      width: "100%",
      backgroundColor: "white",
      borderRadius: "32px",
      overflow: "hidden",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.2)",
      position: "relative",
      zIndex: 10
    },
    leftPanel: {
      flex: 1.1,
      padding: "44px",
      background: "linear-gradient(135deg, #00897b 0%, #00acc1 100%)",
      color: "white",
      position: "relative"
    },
    leftPattern: {
      position: "absolute",
      inset: 0,
      opacity: 0.08,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z' fill='white' fill-opacity='0.3'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "24px"
    },
    rightPanel: {
      flex: 1,
      padding: "44px",
      background: "white"
    },
    logoContainer: {
      marginBottom: "52px",
      position: "relative",
      zIndex: 2
    },
    logoImage: {
      height: "40px",
      width: "auto",
      objectFit: "contain",
      filter: "brightness(0) invert(1)"
    },
    welcomeText: {
      fontSize: "34px",
      fontWeight: "700",
      marginBottom: "16px",
      lineHeight: 1.25,
      position: "relative",
      zIndex: 2
    },
    description: {
      opacity: 0.85,
      fontSize: "13px",
      lineHeight: 1.6,
      marginBottom: "38px",
      position: "relative",
      zIndex: 2
    },
    featureList: {
      marginBottom: "45px",
      position: "relative",
      zIndex: 2
    },
    featureItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "18px",
      fontSize: "13px"
    },
    featureIcon: {
      width: "30px",
      height: "30px",
      background: "rgba(255,255,255,0.12)",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    contactSection: {
      paddingTop: "32px",
      borderTop: "1px solid rgba(255,255,255,0.2)",
      position: "relative",
      zIndex: 2
    },
    contactItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "12px",
      fontSize: "12px",
      opacity: 0.85
    },
    contactText: {
      fontSize: "12px"
    },
    formTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "8px"
    },
    formSubtitle: {
      color: "#64748b",
      fontSize: "13px",
      marginBottom: "32px"
    },
    inputGroup: {
      marginBottom: "20px"
    },
    label: {
      display: "block",
      color: "#334155",
      fontSize: "12px",
      fontWeight: "600",
      marginBottom: "6px",
      letterSpacing: "0.3px"
    },
    inputWrapper: {
      position: "relative"
    },
    input: (isFocused) => ({
      width: "100%",
      padding: "13px 16px",
      backgroundColor: "#fafcff",
      border: `1.5px solid ${isFocused ? "#00acc1" : "#e2e8f0"}`,
      borderRadius: "14px",
      color: "#1e293b",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s ease",
      boxSizing: "border-box"
    }),
    passwordToggle: {
      position: "absolute",
      right: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px"
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "28px"
    },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#475569",
      fontSize: "13px",
      cursor: "pointer"
    },
    forgotLink: {
      color: "#00acc1",
      fontSize: "12px",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontWeight: "500"
    },
    loginButton: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #00897b, #00acc1)",
      border: "none",
      borderRadius: "14px",
      color: "white",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginBottom: "28px"
    },
    demoSection: {
      background: "#f8fafc",
      borderRadius: "18px",
      padding: "18px"
    },
    demoTitle: {
      fontSize: "10px",
      fontWeight: "700",
      color: "#64748b",
      textAlign: "center",
      letterSpacing: "1.5px",
      marginBottom: "14px"
    },
    demoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "10px"
    },
    demoButton: (isActive, color) => ({
      padding: "10px 12px",
      background: isActive ? `linear-gradient(135deg, ${color}, ${color}cc)` : "white",
      border: isActive ? "none" : "1px solid #e2e8f0",
      borderRadius: "12px",
      color: isActive ? "white" : "#334155",
      fontSize: "12px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      textAlign: "left"
    }),
    helpText: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "11px",
      color: "#94a3b8"
    },
    helpLink: {
      color: "#00acc1",
      cursor: "pointer",
      fontWeight: "500"
    },
    errorAlert: {
      marginBottom: "24px",
      padding: "12px 16px",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "14px",
      color: "#dc2626",
      fontSize: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.patternBg}></div>
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>
      
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(25px, -25px) rotate(5deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-30px, 20px) rotate(-5deg); }
        }
        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px -8px rgba(0,150,136,0.4);
        }
        .demo-btn:hover {
          transform: translateX(3px);
        }
        input::placeholder {
          color: #cbd5e1;
          font-size: 13px;
        }
      `}</style>

      <div style={styles.mainCard}>
        <div style={styles.leftPanel}>
          <div style={styles.leftPattern}></div>
          <div style={styles.logoContainer}>
            <img src={logo} alt="Kuanta Logo" style={styles.logoImage} />
          </div>
          
          <div style={styles.welcomeText}>
            Akses Sistem<br />Terintegrasi
          </div>
          <div style={styles.description}>
            Platform terintegrasi untuk memastikan keandalan, aktivitas, dan kapasitas mengajar mahasiswa secara real-time.
          </div>
          
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}><MonitorIcon /></div>
              <span>Monitoring Real-time</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}><FileIcon /></div>
              <span>Laporan Aktivitas</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}><UsersIcon /></div>
              <span>Multi-role Access</span>
            </div>
          </div>

          <div style={styles.contactSection}>
            <div style={styles.contactItem}>
              <MailIcon />
              <span style={styles.contactText}>training@kuantika.id</span>
            </div>
            <div style={styles.contactItem}>
              <PhoneIcon />
              <span style={styles.contactText}>+62 21 1234 5678</span>
            </div>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.formTitle}>Selamat Datang</div>
          <div style={styles.formSubtitle}>Silakan masuk dengan akun Anda</div>

          {error && (
            <div style={styles.errorAlert}>
              <span>{error}</span>
              <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "18px", fontWeight: "bold" }}>×</button>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Alamat Email</label>
            <div style={styles.inputWrapper}>
              <input
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                style={styles.input(focusedField === "email")}
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Kata Sandi</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={styles.input(focusedField === "password")}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div style={styles.checkboxContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#00acc1", width: "14px", height: "14px" }}
              />
              Ingat saya
            </label>
            <button style={styles.forgotLink}>Lupa sandi?</button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="login-btn"
            style={styles.loginButton}
          >
            {loading ? "Memproses..." : "Masuk ke Sistem"}
          </button>

          <div style={styles.demoSection}>
            <div style={styles.demoTitle}>AKUN DEMO</div>
            <div style={styles.demoGrid}>
              {demoAccounts.map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => fillDemoAccount(demo.email, demo.password, idx)}
                  className="demo-btn"
                  style={styles.demoButton(activeDemo === idx, demo.color)}
                >
                  <div style={{ fontWeight: "600", marginBottom: "2px", fontSize: "12px" }}>{demo.role}</div>
                  <div style={{ fontSize: "10px", opacity: 0.7 }}>{demo.email}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.helpText}>
            Butuh bantuan? <span style={styles.helpLink}>Hubungi Administrator</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login