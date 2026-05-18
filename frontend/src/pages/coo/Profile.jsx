// frontend/src/pages/coo/Profile.jsx
import { useState, useEffect, useRef } from "react"
import {
  User, Mail, Phone, Shield, Edit2, X, Camera, CheckCircle,
  AlertCircle, Key, Lock, Eye, EyeOff, RefreshCw, Verified, Building2, Award
} from "lucide-react"
import { getProfile, updateProfile, uploadPhoto, changePassword } from "../../api/coo/profileService"

// Reusable CardField Component
function CardField({ icon, label, value, editable, name, onChange, type = "text" }) {
  return (
    <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
      <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
        {icon} {label}
      </label>
      {editable ? (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
        />
      ) : (
        <p className="text-gray-800 font-medium text-sm">{value || "-"}</p>
      )}
    </div>
  )
}

function Profile() {
  const fileInputRef = useRef(null)
  
  const [user, setUser] = useState(null)
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
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // 🔥 PERBAIKAN: State terpisah untuk setiap field password
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setIsLoadingData(true)
    try {
      const response = await getProfile()
      
      if (response && response.success && response.user) {
        setUser(response.user)
        setFormData({
          nama: response.user.nama || "",
          email: response.user.email || "",
          no_telepon: response.user.no_telepon || "",
          foto_profil: response.user.foto_profil || ""
        })
        setOriginalData({
          nama: response.user.nama || "",
          email: response.user.email || "",
          no_telepon: response.user.no_telepon || "",
          foto_profil: response.user.foto_profil || ""
        })
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setErrorMessage("Gagal memuat data profil")
    } finally {
      setIsLoadingData(false)
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
    await uploadImageDirect(file)
  }

  const uploadImageDirect = async (file) => {
    setUploadingImage(true)
    try {
      const response = await uploadPhoto(file)
      
      if (response && response.success) {
        setUser(prev => ({ ...prev, foto_profil: response.user.foto_profil }))
        setFormData(prev => ({ ...prev, foto_profil: response.user.foto_profil }))
        setSuccessMessage("Foto profil berhasil diupdate!")
        setTimeout(() => setSuccessMessage(""), 3000)
        setImagePreview(null)
      }
    } catch (error) {
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
      const response = await updateProfile({
        nama: formData.nama,
        no_telepon: formData.no_telepon
      })

      if (response && response.success) {
        setUser(response.user)
        setOriginalData(formData)
        setIsEditing(false)
        setSuccessMessage("Profil berhasil diperbarui!")
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Gagal memperbarui profil")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
    setProfileImage(null)
    setImagePreview(null)
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
      const response = await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation
      })

      if (response && response.success) {
        setSuccessMessage("Password berhasil diubah!")
        setIsChangingPassword(false)
        setPasswordForm({
          current_password: "",
          new_password: "",
          new_password_confirmation: ""
        })
        // Reset semua show password states
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Gagal mengubah password")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setPasswordLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "C"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const getPhotoUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `http://localhost:8000/storage/${path}`
  }

  if (isLoadingData || !user) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
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
        {/* SUCCESS MESSAGE */}
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

        {/* ERROR MESSAGE */}
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
                      <span className="text-white text-2xl font-bold">{getInitials(user.nama)}</span>
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
                        <h1 className="text-2xl font-bold text-white">{user.nama || "COO"}</h1>
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                          <Verified size={12} className="text-white" />
                          <span className="text-xs font-medium text-white">Verified</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                          <Shield size={12} className="text-white" />
                          <span className="text-xs font-semibold text-white">Chief Operating Officer</span>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="text-xs font-semibold text-white">Aktif</span>
                        </div>
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

            {/* Ganti Password Section - DIPERBAIKI dengan state terpisah */}
            {isChangingPassword && (
              <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                      <Lock size={14} className="text-white" />
                    </div>
                    Ganti Password
                  </h3>
                  <button onClick={() => {
                    setIsChangingPassword(false)
                    setShowCurrentPassword(false)
                    setShowNewPassword(false)
                    setShowConfirmPassword(false)
                  }} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Password Saat Ini */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPassword ? "text" : "password"} 
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all pr-10"
                        placeholder="Masukkan password saat ini"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all"
                      >
                        {showCurrentPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Baru */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all pr-10"
                        placeholder="Minimal 6 karakter"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all"
                      >
                        {showNewPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password Baru - SEKARANG PUNYA TOMBOL EYE SENDIRI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="new_password_confirmation"
                        value={passwordForm.new_password_confirmation}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all pr-10"
                        placeholder="Ulangi password baru"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all"
                      >
                        {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 items-end">
                    <button 
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" })
                        setShowCurrentPassword(false)
                        setShowNewPassword(false)
                        setShowConfirmPassword(false)
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
                      <button onClick={handleCancel} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-sm">
                        Batal
                      </button>
                      <button onClick={handleSave} disabled={loading} className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 font-medium text-sm">
                        {loading ? <RefreshCw size={12} className="animate-spin" /> : "Simpan Perubahan"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CardField
                    icon={<User size={12} className="text-teal-500" />}
                    label="Nama Lengkap"
                    value={formData.nama}
                    editable={isEditing}
                    name="nama"
                    onChange={handleInputChange}
                  />

                  <CardField
                    icon={<Mail size={12} className="text-teal-500" />}
                    label="Email"
                    value={user.email}
                    editable={false}
                  />

                  <CardField
                    icon={<Phone size={12} className="text-teal-500" />}
                    label="No. Telepon"
                    value={formData.no_telepon}
                    editable={isEditing}
                    name="no_telepon"
                    onChange={handleInputChange}
                  />

                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Building2 size={12} className="text-teal-500" /> Perusahaan
                    </label>
                    <p className="text-gray-800 font-medium text-sm">PT Kuanta Prima Indonesia</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-lg p-4 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Award size={12} className="text-teal-500" /> Jabatan
                    </label>
                    <p className="text-gray-800 font-medium text-sm">Chief Operating Officer (COO)</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-50/30 rounded-lg p-4 border border-emerald-100">
                    <label className="block text-xs font-medium text-emerald-600 mb-1 flex items-center gap-1">
                      <CheckCircle size={12} className="text-emerald-500" /> Status Akun
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-gray-800 font-semibold text-sm">Aktif</p>
                      <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full ml-2">Terverifikasi</span>
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

export default Profile