// frontend/src/pages/coo/Profile.jsx
import { useState, useEffect, useRef } from "react"
import { 
  User, 
  Mail, 
  Shield, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  X,
  Camera,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Upload,
  LayoutDashboard
} from "lucide-react"
import { useNavigate } from "react-router-dom"

function Profile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  
  const [profile, setProfile] = useState({
    nama: "",
    email: "",
    no_telepon: "",
    alamat: "",
    jabatan: "Chief Operating Officer"
  })

  useEffect(() => {
    fetchProfile()
    loadProfileImage()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      setProfile({
        nama: user.nama || "COO Perusahaan",
        email: user.email || "coo@kuanta.id",
        no_telepon: user.no_telepon || "",
        alamat: user.alamat || "",
        jabatan: "Chief Operating Officer"
      })
    } catch (err) {
      console.error("Error fetching profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadProfileImage = () => {
    const savedImage = localStorage.getItem("profile_image")
    if (savedImage) {
      setProfileImagePreview(savedImage)
    }
  }

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran file maksimal 2MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar")
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result)
        setProfileImage(reader.result)
        localStorage.setItem("profile_image", reader.result)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const showPremiumPopup = () => {
    setShowSuccessPopup(true)
  }

  const handleSave = async () => {
    if (!profile.nama.trim()) {
      setError("Nama lengkap wajib diisi")
      return
    }
    if (!profile.email.trim()) {
      setError("Email wajib diisi")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const updatedUser = { 
        ...user, 
        nama: profile.nama,
        email: profile.email,
        no_telepon: profile.no_telepon,
        alamat: profile.alamat
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      
      showPremiumPopup()
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("Gagal menyimpan perubahan profil")
    } finally {
      setSaving(false)
    }
  }

  const handleClosePopup = () => {
    setShowSuccessPopup(false)
  }

  const handleGoToDashboard = () => {
    setShowSuccessPopup(false)
    navigate("/coo/dashboard")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Memuat profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      
      {/* SUCCESS POPUP PREMIUM */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-zoomIn">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-2xl"></div>
              
              <div className="pt-8 pb-4 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-ping"></div>
                  <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                    <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-2 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Profil Berhasil Diperbarui!</h3>
                <div className="w-16 h-0.5 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <p className="text-slate-500 text-sm mb-2">Perubahan profil Anda telah disimpan.</p>
                <p className="text-slate-400 text-xs">Anda dapat melihat perubahan pada halaman ini.</p>
              </div>
              
              <div className="px-6 pb-8 pt-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleClosePopup}
                    className="flex-1 py-3 rounded-xl text-slate-600 text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-all duration-200"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={handleGoToDashboard}
                    className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-r from-teal-600 to-blue-600 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={16} />
                    Ke Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Tanpa Tombol Kembali */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
            <p className="text-sm text-slate-500">Kelola informasi akun Anda</p>
          </div>
        </div>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative h-28 bg-gradient-to-r from-teal-500 to-blue-500"></div>
        
        <div className="relative px-6 pb-6">
          {/* Avatar with Upload */}
          <div className="flex justify-center -mt-14 mb-6">
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
              <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-white bg-gradient-to-br from-teal-500 to-blue-500 overflow-hidden">
                {profileImagePreview ? (
                  <img 
                    src={profileImagePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.nama.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Name and Role */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">{profile.nama}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Shield className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-slate-500">{profile.jabatan}</span>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="nama"
                  value={profile.nama}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                  placeholder="Nama lengkap"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  name="no_telepon"
                  value={profile.no_telepon}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                  placeholder="Nomor telepon"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Jabatan
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={profile.jabatan}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Alamat
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                <textarea
                  name="alamat"
                  value={profile.alamat}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all resize-none"
                  placeholder="Alamat lengkap"
                />
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-700">Informasi Akun</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Akun ini terdaftar sebagai Chief Operating Officer (COO) dengan akses penuh ke dashboard manajemen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => navigate("/coo/dashboard")}
          className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-zoomIn {
          animation: zoomIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Profile