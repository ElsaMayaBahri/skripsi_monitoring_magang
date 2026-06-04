import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { resetPassword } from "../../api/auth/authService"

function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tokenParam = params.get('token')
    const emailParam = params.get('email')
    
    if (tokenParam && emailParam) {
      setToken(tokenParam)
      setEmail(emailParam)
    } else {
      setError("Link reset password tidak valid")
    }
  }, [location])

  const handleResetPassword = async () => {
    if (!password) {
      setError("Password harus diisi")
      return
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sesuai")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const result = await resetPassword(email, password, confirmPassword, token)
      
      if (result.success) {
        setMessage("✅ Password berhasil direset! Mengalihkan ke halaman login...")
        setTimeout(() => {
          navigate("/login", { replace: true })
        }, 3000)
      } else {
        setError(result.message || "Gagal mereset password")
      }
    } catch (err) {
      console.error("Reset password error:", err)
      setError(err.message || "Terjadi kesalahan, silakan coba lagi")
    } finally {
      setLoading(false)
    }
  }

  // Eye Icons
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

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #d4fcff 0%, #b2f0e8 50%, #9be5dc 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    card: {
      maxWidth: "450px",
      width: "100%",
      backgroundColor: "white",
      borderRadius: "32px",
      padding: "40px",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.2)"
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "8px"
    },
    subtitle: {
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
      marginBottom: "6px"
    },
    inputWrapper: {
      position: "relative"
    },
    input: {
      width: "100%",
      padding: "13px 16px",
      backgroundColor: "#fafcff",
      border: "1.5px solid #e2e8f0",
      borderRadius: "14px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      transition: "all 0.2s ease"
    },
    inputDisabled: {
      width: "100%",
      padding: "13px 16px",
      backgroundColor: "#f3f4f6",
      border: "1.5px solid #e2e8f0",
      borderRadius: "14px",
      fontSize: "14px",
      color: "#6b7280"
    },
    passwordToggle: {
      position: "absolute",
      right: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#94a3b8",
      padding: "4px"
    },
    button: {
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
      marginTop: "8px"
    },
    buttonSecondary: {
      width: "100%",
      padding: "14px",
      background: "white",
      border: "1.5px solid #e2e8f0",
      borderRadius: "14px",
      color: "#64748b",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      marginTop: "12px"
    },
    successAlert: {
      marginBottom: "24px",
      padding: "12px 16px",
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      borderRadius: "14px",
      color: "#166534",
      fontSize: "13px"
    },
    errorAlert: {
      marginBottom: "24px",
      padding: "12px 16px",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "14px",
      color: "#dc2626",
      fontSize: "13px"
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>Reset Password</div>
        <div style={styles.subtitle}>
          Silakan masukkan password baru Anda
        </div>

        {message && (
          <div style={styles.successAlert}>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <div style={styles.inputWrapper}>
            <input
              type="email"
              value={email}
              disabled
              style={styles.inputDisabled}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password Baru</label>
          <div style={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
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

        <div style={styles.inputGroup}>
          <label style={styles.label}>Konfirmasi Password Baru</label>
          <div style={styles.inputWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ketik ulang password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleResetPassword()}
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.passwordToggle}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          onClick={handleResetPassword}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Memproses..." : "Reset Password"}
        </button>

        <button
          onClick={() => navigate("/login")}
          style={styles.buttonSecondary}
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  )
}

export default ResetPassword