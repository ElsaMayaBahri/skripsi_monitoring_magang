// src/pages/peserta/ProfilePeserta.jsx
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  User, Mail, Phone, Calendar, Building, GraduationCap,
  Shield, Edit2, X, Camera, Briefcase, CheckCircle,
  AlertCircle, Key, Lock, Eye, EyeOff, RefreshCw, Verified
} from "lucide-react"
import axios from "../../api/axios"

function ProfilePeserta() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [user, setUser] = useState(null)
  const [peserta, setPeserta] = useState(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({})
  const [originalData, setOriginalData] = useState({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsLoadingData(true)
    await Promise.all([fetchUserData(), fetchPesertaData()])
    setIsLoadingData(false)
  }

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/me")
      console.log("User data response:", response.data)
      
      // 🔥 PERBAIKAN: Sesuaikan dengan struktur response
      const userData = response.data.user || response.data
      
      if (userData) {
        setUser(userData)
        setFormData({
          nama: userData.nama || "",
          email: userData.email || "",
          no_telepon: userData.no_telepon || "",
          foto_profil: userData.foto_profil || ""
        })
        setOriginalData({
          nama: userData.nama || "",
          email: userData.email || "",
          no_telepon: userData.no_telepon || "",
          foto_profil: userData.foto_profil || ""
        })
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      console.error("Error response:", error.response?.data)
    }
  }

  const fetchPesertaData = async () => {
    try {
      const response = await axios.get("/peserta/profile")
      console.log("Peserta data response:", response.data)
      
      // 🔥 PERBAIKAN: Sesuaikan dengan struktur response
      if (response.data.success && response.data.data) {
        setPeserta(response.data.data)
      } else if (response.data.data) {
        setPeserta(response.data.data)
      } else {
        setPeserta(response.data)
      }
    } catch (error) {
      console.error("Error fetching peserta data:", error)
      console.error("Error response:", error.response?.data)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Ukuran foto maksimal 2MB")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Format foto harus JPG, JPEG, atau PNG")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
    setProfileImage(file)
    await uploadImage(file)
  }

  const uploadImage = async (file) => {
    setUploadingImage(true)
    try {
      const formDataImg = new FormData()
      formDataImg.append("foto_profil", file)
      
      const response = await axios.post("/profile", formDataImg, {
        headers: { 
          "Content-Type": "multipart/form-data"
        }
      })
      
      console.log("Upload response:", response.data)
      
      if (response.data.success) {
        const userData = response.data.user || response.data
        const photoPath = userData.foto_profil
        
        setUser(prev => ({ ...prev, foto_profil: photoPath }))
        setFormData(prev => ({ ...prev, foto_profil: photoPath }))
        setOriginalData(prev => ({ ...prev, foto_profil: photoPath }))
        setSuccessMessage("Foto profil berhasil diupdate!")
        setTimeout(() => setSuccessMessage(""), 3000)
        setImagePreview(null)
        setProfileImage(null)
      }
    } catch (error) {
      console.error("Upload error:", error)
      console.error("Error response:", error.response?.data)
      setErrorMessage(error.response?.data?.message || "Gagal upload foto")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const response = await axios.put("/profile", {
        nama: formData.nama,
        no_telepon: formData.no_telepon
      })

      console.log("Update profile response:", response.data)

      if (response.data.success) {
        const userData = response.data.user || response.data
        setUser(userData)
        setOriginalData(formData)
        setIsEditing(false)
        setSuccessMessage("Profil berhasil diperbarui!")
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("Update profile error:", error)
      setErrorMessage(error.response?.data?.message || "Gagal memperbarui profil")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setErrorMessage("Password baru tidak cocok")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }
    if (passwordForm.new_password.length < 6) {
      setErrorMessage("Password minimal 6 karakter")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }

    setPasswordLoading(true)

    try {
      const response = await axios.post("/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation
      })

      console.log("Change password response:", response.data)

      if (response.data.success) {
        setSuccessMessage("Password berhasil diubah!")
        setIsChangingPassword(false)
        setPasswordForm({
          current_password: "",
          new_password: "",
          new_password_confirmation: ""
        })
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("Change password error:", error)
      setErrorMessage(error.response?.data?.message || "Gagal mengubah password")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
    setProfileImage(null)
    setImagePreview(null)
  }

  const getPhotoUrl = (path) => {
    if (!path) return null
    if (path.startsWith("http")) return path
    const cleanPath = path.replace(/^\/+/, "")
    return `http://localhost:8000/storage/${cleanPath}`
  }

  // Gunakan data peserta yang sudah di-fetch
  const pesertaData = peserta || {}

  if (isLoadingData || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
          <p className="text-center text-gray-500 mt-4">Memuat data profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-emerald-800 font-semibold">Berhasil!</p>
              <p className="text-emerald-600 text-sm">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage("")} className="ml-auto text-emerald-400 hover:text-emerald-600">
              <X size={16} />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-md">
              <AlertCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-red-800 font-semibold">Gagal!</p>
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage("")} className="ml-auto text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Cover Photo */}
          <div className="relative h-36 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600">
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="relative -mt-28 mb-4">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                {/* Avatar */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-2xl ring-4 ring-white cursor-pointer overflow-hidden"
                       onClick={handleImageClick}>
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center">
                        <RefreshCw size={20} className="text-white animate-spin" />
                      </div>
                    ) : (imagePreview || getPhotoUrl(user.foto_profil)) ? (
                      <img 
                        src={imagePreview || getPhotoUrl(user.foto_profil)} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {user.nama?.charAt(0) || "P"}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg,image/png,image/jpg" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                  <button 
                    onClick={handleImageClick}
                    className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                  >
                    <Camera size={12} className="text-teal-500" />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-white">{user.nama || "Peserta Magang"}</h1>
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                          <Verified size={12} className="text-white" />
                          <span className="text-xs font-medium text-white">Verified</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                          <Shield size={12} className="text-white" />
                          <span className="text-xs font-semibold text-white">Peserta Magang</span>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="text-xs font-semibold text-white">{user.status_akun || "Aktif"}</span>
                        </div>
                        {pesertaData.divisi && (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                            <Briefcase size={12} className="text-white" />
                            <span className="text-xs font-semibold text-white">{pesertaData.divisi}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isEditing && !isChangingPassword && (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setIsChangingPassword(true)} 
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 font-medium text-sm"
                        >
                          <Key size={14} /> Ganti Password
                        </button>
                        <button 
                          onClick={() => setIsEditing(true)} 
                          className="flex items-center gap-2 px-4 py-2 bg-white text-teal-700 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-md font-medium text-sm"
                        >
                          <Edit2 size={14} /> Edit Profil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ganti Password Section */}
            {isChangingPassword && (
              <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                      <Lock size={14} className="text-white" />
                    </div>
                    Ganti Password
                  </h3>
                  <button onClick={() => setIsChangingPassword(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all pr-10"
                        placeholder="Masukkan password saat ini"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all pr-10"
                        placeholder="Minimal 6 karakter"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                    <input 
                      type="password" 
                      name="new_password_confirmation"
                      value={passwordForm.new_password_confirmation}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                  <div className="flex gap-3 items-end">
                    <button 
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" })
                      }}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 font-medium text-sm"
                    >
                      {passwordLoading ? <RefreshCw size={14} className="animate-spin mx-auto" /> : "Simpan Password"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Informasi Pribadi */}
            {!isChangingPassword && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-teal-500 to-blue-500"></div>
                    <h2 className="text-lg font-bold text-gray-800">Informasi Pribadi</h2>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <button onClick={handleCancel} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm">Batal</button>
                      <button onClick={handleSave} disabled={loading} className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 font-medium text-sm">
                        {loading ? <RefreshCw size={12} className="animate-spin" /> : "Simpan Perubahan"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <User size={12} className="text-teal-500" /> Nama Lengkap
                    </label>
                    {isEditing ? (
                      <input type="text" name="nama" value={formData.nama || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm" />
                    ) : (
                      <p className="text-gray-800 font-medium text-sm">{user.nama || "-"}</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Mail size={12} className="text-teal-500" /> Email
                    </label>
                    <p className="text-gray-800 text-sm">{user.email || "-"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Phone size={12} className="text-teal-500" /> No. Telepon
                    </label>
                    {isEditing ? (
                      <input type="tel" name="no_telepon" value={formData.no_telepon || ""} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm" />
                    ) : (
                      <p className="text-gray-800 text-sm">{user.no_telepon || "-"}</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Building size={12} className="text-teal-500" /> Asal Kampus
                    </label>
                    <p className="text-gray-800 text-sm">{pesertaData.asal_kampus || "-"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <GraduationCap size={12} className="text-teal-500" /> Program Studi
                    </label>
                    <p className="text-gray-800 text-sm">{pesertaData.prodi || "-"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Briefcase size={12} className="text-teal-500" /> Divisi Magang
                    </label>
                    <p className="text-gray-800 font-medium text-sm">{pesertaData.divisi || "-"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Calendar size={12} className="text-teal-500" /> Tanggal Mulai
                    </label>
                    <p className="text-gray-800 text-sm">{pesertaData.tanggal_mulai ? new Date(pesertaData.tanggal_mulai).toLocaleDateString('id-ID') : "-"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Calendar size={12} className="text-teal-500" /> Tanggal Selesai
                    </label>
                    <p className="text-gray-800 text-sm">{pesertaData.tanggal_selesai ? new Date(pesertaData.tanggal_selesai).toLocaleDateString('id-ID') : "-"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Shield size={12} className="text-teal-500" /> Mentor
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                        <User size={10} className="text-teal-500" />
                      </div>
                      <p className="text-gray-800 font-medium text-sm">{pesertaData.mentor_nama || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePeserta