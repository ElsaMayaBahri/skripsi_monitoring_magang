import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { api } from "../../utils/api"
import { logActivity } from "../../utils/activityLogger"
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  GraduationCap,
  Users,
  School,
  BookOpen,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Zap,
  CheckCircle,
  AlertTriangle,
  Award,
  BadgeCheck,
  CalendarDays,
  Clock,
  Calendar,
  Flag
} from "lucide-react"

function AddPeserta() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [divisiLoading, setDivisiLoading] = useState(true)
  const [mentorLoading, setMentorLoading] = useState(true)
  const [divisiList, setDivisiList] = useState([])
  const [allMentors, setAllMentors] = useState([])
  const [filteredMentors, setFilteredMentors] = useState([])
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successData, setSuccessData] = useState(null)

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    password_confirmation: false,
    nama: false,
    no_telepon: false,
    id_divisi: false,
    id_mentor: false,
    asal_kampus: false,
    prodi: false,
    tanggal_mulai: false,
    tanggal_selesai: false,
  })

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    nama: "",
    no_telepon: "",
    id_divisi: "",
    id_mentor: "",
    asal_kampus: "",
    prodi: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  })

  useEffect(() => {
    fetchDropdownData()
    // Set default tanggal mulai ke hari ini
    const today = new Date().toISOString().split('T')[0]
    const threeMonthsLater = new Date()
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
    const defaultEndDate = threeMonthsLater.toISOString().split('T')[0]
    
    setForm(prev => ({
      ...prev,
      tanggal_mulai: today,
      tanggal_selesai: defaultEndDate
    }))
  }, [])

  // Filter mentors based on selected division
  useEffect(() => {
    if (form.id_divisi) {
      const selectedDivisi = divisiList.find(d => (d.id_divisi || d.id) == form.id_divisi)
      const selectedDivisiName = selectedDivisi ? (selectedDivisi.nama_divisi || selectedDivisi.nama) : ""
      
      const filtered = allMentors.filter(mentor => {
        if (mentor.divisi_id && mentor.divisi_id == form.id_divisi) {
          return true
        }
        if (selectedDivisiName && mentor.divisi_name && 
            mentor.divisi_name.toLowerCase() === selectedDivisiName.toLowerCase()) {
          return true
        }
        return false
      })
      
      setFilteredMentors(filtered)
      
      if (form.id_mentor) {
        const stillValid = filtered.some(m => m.id == form.id_mentor)
        if (!stillValid) {
          setForm(prev => ({ ...prev, id_mentor: "" }))
        }
      }
    } else {
      setFilteredMentors([])
      if (form.id_mentor) {
        setForm(prev => ({ ...prev, id_mentor: "" }))
      }
    }
  }, [form.id_divisi, allMentors, divisiList])

  const fetchDropdownData = async () => {
    try {
      setDivisiLoading(true)
      const divisiData = await api.getDivisi()
      let divisiArray = []
      if (Array.isArray(divisiData)) {
        divisiArray = divisiData
      } else if (divisiData && divisiData.data && Array.isArray(divisiData.data)) {
        divisiArray = divisiData.data
      }
      setDivisiList(divisiArray)
      console.log("=== DIVISI LOADED ===", divisiArray)
    } catch (error) {
      console.error("Error fetching divisi:", error)
      setDivisiList([])
    } finally {
      setDivisiLoading(false)
    }

    try {
      setMentorLoading(true)
      const mentorData = await api.getMentors()
      
      let mentors = []
      if (Array.isArray(mentorData)) {
        mentors = mentorData
      } else if (mentorData && mentorData.data && Array.isArray(mentorData.data)) {
        mentors = mentorData.data
      }
      
      console.log("=== RAW MENTORS FROM API ===")
      console.log(mentors)
      
      const formattedMentors = mentors
        .filter(mentor => {
          const hasId = mentor.id_mentor !== null && mentor.id_mentor !== undefined
          console.log(`Mentor: ${mentor.nama || mentor.name || 'unknown'}, id_mentor: ${mentor.id_mentor}, hasId: ${hasId}`)
          return hasId
        })
        .map(mentor => {
          let divisiName = null
          let divisiId = null
          
          if (mentor.id_divisi) {
            divisiId = mentor.id_divisi
          }
          if (typeof mentor.divisi === 'string') {
            divisiName = mentor.divisi
          } else if (mentor.divisi?.nama_divisi) {
            divisiName = mentor.divisi.nama_divisi
          }
          
          return {
            id: mentor.id_mentor,
            name: mentor.nama || mentor.name || "Mentor",
            divisi_name: divisiName,
            divisi_id: divisiId,
            email: mentor.email || ""
          }
        })
      
      setAllMentors(formattedMentors)
      console.log("=== FORMATTED MENTORS ===")
      console.log(formattedMentors)
    } catch (error) {
      console.error("Error fetching mentor:", error)
      setAllMentors([])
    } finally {
      setMentorLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "no_telepon") {
      const angkaOnly = value.replace(/[^0-9]/g, "").slice(0, 15)
      setForm({ ...form, [name]: angkaOnly })
    } else {
      setForm({ ...form, [name]: value })
    }
    if (error) setError("")
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
  }

  const isEmailValid = () => {
    if (!form.email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(form.email)
  }

  const isPasswordValid = () => {
    const password = form.password
    if (password.length < 8) return false
    if (!/[A-Z]/.test(password)) return false
    if (!/[a-z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    return true
  }

  const getPasswordStrength = () => {
    const password = form.password
    if (!password) return { level: 0, text: "", color: "" }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    
    if (strength === 4) return { level: 3, text: "Kuat", color: "text-emerald-600 bg-emerald-50" }
    if (strength === 3) return { level: 2, text: "Sedang", color: "text-amber-600 bg-amber-50" }
    return { level: 1, text: "Lemah", color: "text-red-600 bg-red-50" }
  }

  const isPasswordMatch = () => form.password === form.password_confirmation
  const isNameValid = () => form.nama.trim().length > 0
  const isPhoneValid = () => form.no_telepon.length >= 10 && form.no_telepon.length <= 15
  const isDivisiValid = () => form.id_divisi !== "" && form.id_divisi !== null
  const isMentorValid = () => form.id_mentor !== "" && form.id_mentor !== null
  const isKampusValid = () => form.asal_kampus.trim().length > 0
  const isProdiValid = () => form.prodi.trim().length > 0
  const isTanggalMulaiValid = () => form.tanggal_mulai !== ""
  const isTanggalSelesaiValid = () => {
    if (!form.tanggal_selesai) return false
    const mulai = new Date(form.tanggal_mulai)
    const selesai = new Date(form.tanggal_selesai)
    return selesai >= mulai
  }

  const isFormComplete = () => {
    return (
      isEmailValid() &&
      isPasswordValid() &&
      isPasswordMatch() &&
      isNameValid() &&
      isPhoneValid() &&
      isDivisiValid() &&
      isMentorValid() &&
      isKampusValid() &&
      isProdiValid() &&
      isTanggalMulaiValid() &&
      isTanggalSelesaiValid()
    )
  }

  const getFieldError = (field) => {
    if (!touched[field]) return null
    
    switch(field) {
      case 'email':
        if (!form.email) return "Email harus diisi"
        if (!isEmailValid()) return "Email tidak valid"
        return null
      case 'password':
        if (!form.password) return "Password harus diisi"
        if (form.password.length < 8) return "Minimal 8 karakter"
        if (!/[A-Z]/.test(form.password)) return "Harus mengandung huruf BESAR"
        if (!/[a-z]/.test(form.password)) return "Harus mengandung huruf kecil"
        if (!/[0-9]/.test(form.password)) return "Harus mengandung angka"
        return null
      case 'password_confirmation':
        if (!form.password_confirmation) return "Konfirmasi password harus diisi"
        if (form.password !== form.password_confirmation) return "Password tidak cocok"
        return null
      case 'nama':
        if (!form.nama.trim()) return "Nama lengkap harus diisi"
        return null
      case 'no_telepon':
        if (!form.no_telepon) return "Nomor telepon harus diisi"
        if (!isPhoneValid()) return "Harus 10-15 digit angka"
        return null
      case 'id_divisi':
        if (!form.id_divisi) return "Divisi harus dipilih"
        return null
      case 'id_mentor':
        if (!form.id_mentor) return "Mentor harus dipilih"
        return null
      case 'asal_kampus':
        if (!form.asal_kampus.trim()) return "Asal kampus harus diisi"
        return null
      case 'prodi':
        if (!form.prodi.trim()) return "Program studi harus diisi"
        return null
      case 'tanggal_mulai':
        if (!form.tanggal_mulai) return "Tanggal mulai harus diisi"
        return null
      case 'tanggal_selesai':
        if (!form.tanggal_selesai) return "Tanggal selesai harus diisi"
        if (!isTanggalSelesaiValid()) return "Tanggal selesai harus setelah tanggal mulai"
        return null
      default:
        return null
    }
  }

  const calculateDuration = () => {
    if (!form.tanggal_mulai || !form.tanggal_selesai) return null
    const mulai = new Date(form.tanggal_mulai)
    const selesai = new Date(form.tanggal_selesai)
    const diffTime = Math.abs(selesai - mulai)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const validateForm = () => {
    setTouched({
      email: true,
      password: true,
      password_confirmation: true,
      nama: true,
      no_telepon: true,
      id_divisi: true,
      id_mentor: true,
      asal_kampus: true,
      prodi: true,
      tanggal_mulai: true,
      tanggal_selesai: true,
    })

    if (!isEmailValid()) { setError("Email tidak valid"); return false; }
    if (!isPasswordValid()) { setError("Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka"); return false; }
    if (!isPasswordMatch()) { setError("Konfirmasi password tidak cocok"); return false; }
    if (!isNameValid()) { setError("Nama lengkap harus diisi"); return false; }
    if (!isPhoneValid()) { setError("Nomor telepon harus 10-15 digit angka"); return false; }
    if (!isDivisiValid()) { setError("Divisi harus dipilih"); return false; }
    if (!isMentorValid()) { setError("Mentor harus dipilih"); return false; }
    if (!isKampusValid()) { setError("Asal kampus harus diisi"); return false; }
    if (!isProdiValid()) { setError("Program studi harus diisi"); return false; }
    if (!isTanggalMulaiValid()) { setError("Tanggal mulai harus diisi"); return false; }
    if (!isTanggalSelesaiValid()) { setError("Tanggal selesai harus setelah tanggal mulai"); return false; }
    return true
  }

  const getDivisiName = (idDivisi) => {
    const divisi = divisiList.find(d => (d.id_divisi || d.id) == idDivisi)
    return divisi ? (divisi.nama_divisi || divisi.nama) : "-"
  }

  const getMentorName = (idMentor) => {
    const mentor = allMentors.find(m => m.id == idMentor)
    return mentor ? mentor.name : "-"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    setError("")
    
    try {
      const idDivisi = parseInt(form.id_divisi)
      const idMentor = parseInt(form.id_mentor)
      
      const selectedMentor = allMentors.find(m => m.id === idMentor)
      if (!selectedMentor) {
        setError("Mentor yang dipilih tidak valid. Silakan pilih mentor lain.")
        setLoading(false)
        return
      }
      
      const pesertaData = {
        nama: form.nama.trim(),
        email: form.email,
        password: form.password,
        no_telepon: form.no_telepon,
        asal_kampus: form.asal_kampus,
        prodi: form.prodi,
        id_divisi: idDivisi,
        id_mentor: idMentor,
        tanggal_mulai: form.tanggal_mulai,
        tanggal_selesai: form.tanggal_selesai,
        status_akun: "aktif",
      }
      
      console.log("Sending peserta data to API:", pesertaData)
      const response = await api.addPeserta(pesertaData)
      
      if (response && response.success) {
        // 🔥 LOG ACTIVITY - CREATE PESERTA
        logActivity("create", "peserta", form.nama)
        
        setSuccessData({
          name: form.nama,
          email: form.email,
          divisi: getDivisiName(form.id_divisi),
          mentor: selectedMentor.name,
          tanggal_mulai: formatDate(form.tanggal_mulai),
          tanggal_selesai: formatDate(form.tanggal_selesai),
          durasi: calculateDuration(),
        })
        setSuccessMessage(response.message || "Peserta berhasil ditambahkan!")
        setShowSuccessModal(true)
      } else {
        setError(response?.message || "Gagal menambahkan peserta")
      }
    } catch (err) {
      console.error("Error adding peserta:", err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat()
        setError(errors.join("\n"))
      } else if (err.message) {
        setError(err.message)
      } else {
        setError("Terjadi kesalahan saat menyimpan data")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    navigate("/admin/users")
  }

  const requiredFields = {
    email: isEmailValid(),
    password: isPasswordValid(),
    passwordConfirm: isPasswordMatch(),
    nama: isNameValid(),
    phone: isPhoneValid(),
    divisi: isDivisiValid(),
    mentor: isMentorValid(),
    kampus: isKampusValid(),
    prodi: isProdiValid(),
    tanggalMulai: isTanggalMulaiValid(),
    tanggalSelesai: isTanggalSelesaiValid(),
  }
  const completedCount = Object.values(requiredFields).filter(Boolean).length
  const totalRequired = 11
  const passwordStrength = getPasswordStrength()
  const duration = calculateDuration()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
        
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 mb-3 transition text-sm group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Data Pengguna
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-md">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-emerald-800 to-teal-800 bg-clip-text text-transparent">
                Tambah Peserta Baru
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Semua field wajib diisi (*)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
          
          {error && (
            <div className="m-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 whitespace-pre-wrap flex-1">{error}</p>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN - Informasi Akun */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <Mail size={12} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Informasi Akun</h3>
                  <span className="text-[10px] text-red-500">*Wajib</span>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('email') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="email"
                      type="email"
                      placeholder="contoh@email.com"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('email') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.email && isEmailValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading}
                    />
                    {form.email && isEmailValid() && !getFieldError('email') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('email') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('email')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('password') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 8 karakter, huruf besar, huruf kecil, angka"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('password') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.password && isPasswordValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {form.password && isPasswordValid() && !getFieldError('password') && (
                      <CheckCircle size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {form.password && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.level === 3 ? 'w-full bg-emerald-500' :
                            passwordStrength.level === 2 ? 'w-2/3 bg-amber-500' :
                            'w-1/3 bg-red-500'
                          }`}
                        />
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  )}
                  {getFieldError('password') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('password')}
                    </p>
                  )}
                  <p className="text-[9px] text-slate-400 mt-1">
                    Password harus mengandung: huruf besar, huruf kecil, angka, dan minimal 8 karakter
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('password_confirmation') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Konfirmasi password"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password_confirmation')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('password_confirmation') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.password_confirmation && isPasswordMatch()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {form.password_confirmation && isPasswordMatch() && !getFieldError('password_confirmation') && (
                      <CheckCircle size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('password_confirmation') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('password_confirmation')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Divisi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('id_divisi') ? 'text-red-400' : 'text-slate-400'}`} />
                    <select
                      name="id_divisi"
                      value={form.id_divisi}
                      onChange={handleChange}
                      onBlur={() => handleBlur('id_divisi')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition appearance-none bg-white ${
                        getFieldError('id_divisi') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.id_divisi && isDivisiValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading || divisiLoading}
                    >
                      <option value="">Pilih Divisi</option>
                      {divisiLoading ? (
                        <option value="" disabled>Memuat divisi...</option>
                      ) : divisiList.length === 0 ? (
                        <option value="" disabled>Tidak ada divisi tersedia</option>
                      ) : (
                        divisiList.map((divisi) => (
                          <option key={divisi.id_divisi || divisi.id} value={divisi.id_divisi || divisi.id}>
                            {divisi.nama_divisi || divisi.nama}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {form.id_divisi && isDivisiValid() && !getFieldError('id_divisi') && (
                      <CheckCircle size={14} className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('id_divisi') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('id_divisi')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Mentor Pembimbing <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('id_mentor') ? 'text-red-400' : 'text-slate-400'}`} />
                    <select
                      name="id_mentor"
                      value={form.id_mentor}
                      onChange={handleChange}
                      onBlur={() => handleBlur('id_mentor')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition appearance-none bg-white ${
                        getFieldError('id_mentor') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.id_mentor && isMentorValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading || mentorLoading || !form.id_divisi}
                    >
                      <option value="">
                        {!form.id_divisi 
                          ? "Pilih divisi terlebih dahulu" 
                          : mentorLoading 
                            ? "Memuat mentor..." 
                            : filteredMentors.length === 0 
                              ? "Tidak ada mentor di divisi ini" 
                              : "Pilih Mentor"}
                      </option>
                      {filteredMentors.map((mentor) => (
                        <option key={mentor.id} value={mentor.id}>
                          {mentor.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {form.id_mentor && isMentorValid() && !getFieldError('id_mentor') && (
                      <CheckCircle size={14} className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('id_mentor') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('id_mentor')}
                    </p>
                  )}
                  {form.id_divisi && filteredMentors.length === 0 && !mentorLoading && (
                    <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} />
                      Belum ada mentor di divisi ini. 
                      <button 
                        onClick={() => navigate("/admin/add-mentor")}
                        className="text-emerald-600 hover:underline font-medium ml-1"
                      >
                        Tambah mentor sekarang
                      </button>
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Informasi Pribadi */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-emerald-100 rounded-lg">
                    <User size={12} className="text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Informasi Pribadi</h3>
                  <span className="text-[10px] text-red-500">*Wajib</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('nama') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="nama"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={form.nama}
                      onChange={handleChange}
                      onBlur={() => handleBlur('nama')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('nama') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.nama && isNameValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading}
                    />
                    {form.nama && isNameValid() && !getFieldError('nama') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('nama') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('nama')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('no_telepon') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="no_telepon"
                      type="tel"
                      placeholder="81234567890"
                      value={form.no_telepon}
                      onChange={handleChange}
                      onBlur={() => handleBlur('no_telepon')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('no_telepon') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.no_telepon && isPhoneValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading}
                      inputMode="numeric"
                    />
                    {form.no_telepon && isPhoneValid() && !getFieldError('no_telepon') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('no_telepon') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('no_telepon')}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">Hanya angka, 10-15 digit, tanpa 0 di depan</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Asal Kampus / Universitas <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <School size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('asal_kampus') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="asal_kampus"
                      type="text"
                      placeholder="Nama Universitas"
                      value={form.asal_kampus}
                      onChange={handleChange}
                      onBlur={() => handleBlur('asal_kampus')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('asal_kampus') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.asal_kampus && isKampusValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading}
                    />
                    {form.asal_kampus && isKampusValid() && !getFieldError('asal_kampus') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('asal_kampus') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('asal_kampus')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Program Studi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('prodi') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="prodi"
                      type="text"
                      placeholder="Program Studi"
                      value={form.prodi}
                      onChange={handleChange}
                      onBlur={() => handleBlur('prodi')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('prodi') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.prodi && isProdiValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading}
                    />
                    {form.prodi && isProdiValid() && !getFieldError('prodi') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('prodi') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('prodi')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PERIODE MAGANG SECTION */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-sm">
                  <Calendar size={14} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">Periode Magang</h3>
                <span className="text-[10px] text-red-500">*Wajib</span>
                {duration && duration > 0 && (
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                    <Flag size={12} className="text-emerald-600" />
                    <span className="text-[10px] font-semibold text-emerald-700">
                      Durasi: {duration} Hari
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('tanggal_mulai') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="tanggal_mulai"
                      type="date"
                      value={form.tanggal_mulai}
                      onChange={handleChange}
                      onBlur={() => handleBlur('tanggal_mulai')}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('tanggal_mulai') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.tanggal_mulai && isTanggalMulaiValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading}
                    />
                    {form.tanggal_mulai && isTanggalMulaiValid() && !getFieldError('tanggal_mulai') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('tanggal_mulai') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('tanggal_mulai')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('tanggal_selesai') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="tanggal_selesai"
                      type="date"
                      value={form.tanggal_selesai}
                      onChange={handleChange}
                      onBlur={() => handleBlur('tanggal_selesai')}
                      min={form.tanggal_mulai}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('tanggal_selesai') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.tanggal_selesai && isTanggalSelesaiValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/30'
                      }`}
                      disabled={loading}
                    />
                    {form.tanggal_selesai && isTanggalSelesaiValid() && !getFieldError('tanggal_selesai') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('tanggal_selesai') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('tanggal_selesai')}
                    </p>
                  )}
                </div>
              </div>

              {/* Preview Periode */}
              {form.tanggal_mulai && form.tanggal_selesai && isTanggalSelesaiValid() && (
                <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-medium">📅 Periode Magang:</span>
                    <span className="text-slate-600">
                      {formatDate(form.tanggal_mulai)} - {formatDate(form.tanggal_selesai)}
                    </span>
                    <span className="text-emerald-600 font-semibold">
                      ({duration} Hari)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1">
                  <Award size={12} />
                  Progress pengisian form
                </span>
                <span className="font-medium text-emerald-600">
                  {completedCount}/{totalRequired} field wajib terisi
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalRequired) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {isFormComplete() 
                  ? "✓ Semua data telah terisi, siap disimpan!" 
                  : "⚠️ Lengkapi semua field (*) untuk melanjutkan"}
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 transition-all duration-200"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !isFormComplete()}
              className={`px-6 py-2 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 ${
                isFormComplete() && !loading
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 cursor-pointer"
                  : "bg-slate-400 cursor-not-allowed opacity-60"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Simpan Peserta
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-500" />
            <p className="text-xs text-emerald-700">
              <strong className="font-semibold">Tips:</strong> Password minimal 8 karakter, harus mengandung huruf besar, huruf kecil, dan angka.
              <span className="text-red-500 font-medium ml-1">Semua field wajib diisi</span>.
              Nomor telepon hanya angka 10-15 digit tanpa 0 di depan. Periode magang minimal 30 hari.
            </p>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL - With periode magang */}
      {showSuccessModal && successData && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleModalClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
                
                <div className="relative pt-8 pb-4 px-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-xl">
                    <CheckCircle size={42} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-slate-800">Pendaftaran Berhasil!</h3>
                    <p className="text-xs text-slate-500 mt-1">{successMessage}</p>
                  </div>
                </div>
                
                <div className="mx-6 p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                          <User size={20} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{successData.name}</h4>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-emerald-100 rounded-lg">
                      <p className="text-[9px] font-semibold text-emerald-600">PESERTA</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center"><Mail size={13} className="text-blue-600" /></div>
                      <div className="flex-1"><p className="text-[9px] text-slate-400">Email Address</p><p className="text-xs font-medium text-slate-700 truncate">{successData.email}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                      <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center"><Building2 size={13} className="text-purple-600" /></div>
                      <div className="flex-1"><p className="text-[9px] text-slate-400">Divisi</p><p className="text-xs font-medium text-slate-700">{successData.divisi}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                      <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center"><Users size={13} className="text-indigo-600" /></div>
                      <div className="flex-1"><p className="text-[9px] text-slate-400">Mentor</p><p className="text-xs font-medium text-slate-700">{successData.mentor}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                      <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center"><Calendar size={13} className="text-amber-600" /></div>
                      <div className="flex-1">
                        <p className="text-[9px] text-slate-400">Periode Magang</p>
                        <p className="text-xs font-medium text-slate-700">
                          {successData.tanggal_mulai} - {successData.tanggal_selesai}
                        </p>
                      </div>
                      <div className="px-1.5 py-0.5 bg-emerald-100 rounded">
                        <p className="text-[9px] font-semibold text-emerald-600">{successData.durasi} Hari</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 px-6">
                  <div className="flex items-center justify-center gap-2 text-[9px] text-slate-400">
                    <CalendarDays size={10} />
                    <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <Clock size={10} />
                    <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                
                <div className="p-6 pt-4">
                  <button onClick={handleModalClose} className="group relative w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center gap-2"><Users size={16} className="group-hover:translate-x-0.5 transition-transform" /> Lihat Daftar Peserta</span>
                  </button>
                </div>
                
                <div className="pb-5 text-center">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full">
                    <BadgeCheck size={10} className="text-emerald-600" />
                    <span className="text-[9px] text-slate-500">Akun peserta telah aktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AddPeserta