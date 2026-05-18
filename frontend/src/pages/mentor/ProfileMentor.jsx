// src/pages/mentor/ProfileMentor.jsx
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  User, Mail, Phone, Shield, Edit2, X, Camera, CheckCircle,
  AlertCircle, Key, Lock, Eye, EyeOff, RefreshCw, Verified, Briefcase, Award,
  Trash2, Building2
} from "lucide-react"
import axiosInstance from "../../api/axios"

// Reusable CardField Component - PREMIUM (gradient COO style)
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

function ProfileMentor() {
  const navigate = useNavigate()
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
  
  // State untuk password
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
      const response = await axiosInstance.get("/mentor/profile")
      
      if (response.data && response.data.success) {
        const userData = response.data.data || response.data.user || response.data
        setUser(userData)
        setFormData({
          nama: userData.nama || "",
          email: userData.email || "",
          no_telepon: userData.no_telepon || userData.no_hp || "",
          jabatan: userData.jabatan || "",
          divisi: userData.divisi || "",
          foto_profil: userData.foto_profil || ""
        })
        setOriginalData({
          nama: userData.nama || "",
          email: userData.email || "",
          no_telepon: userData.no_telepon || userData.no_hp || "",
          jabatan: userData.jabatan || "",
          divisi: userData.divisi || "",
          foto_profil: userData.foto_profil || ""
        })
        if (userData.foto_profil) {
          setImagePreview(getPhotoUrl(userData.foto_profil))
        }
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
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Format foto harus JPG, JPEG, PNG, GIF, atau WEBP")
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
      const formDataPhoto = new FormData()
      formDataPhoto.append('foto_profil', file)
      
      const response = await axiosInstance.post('/mentor/profile/photo', formDataPhoto, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data && response.data.success) {
        setUser(prev => ({ ...prev, foto_profil: response.data.foto_url }))
        setFormData(prev => ({ ...prev, foto_profil: response.data.foto_url }))
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

  const handleRemovePhoto = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus foto profil?")) return
    
    setUploadingImage(true)
    try {
      const response = await axiosInstance.delete('/mentor/profile/photo')
      
      if (response.data && response.data.success) {
        setUser(prev => ({ ...prev, foto_profil: null }))
        setFormData(prev => ({ ...prev, foto_profil: null }))
        setImagePreview(null)
        setSuccessMessage("Foto profil berhasil dihapus!")
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Gagal menghapus foto")
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
      const response = await axiosInstance.put("/mentor/profile", {
        nama: formData.nama,
        no_telepon: formData.no_telepon
      })

      if (response.data && response.data.success) {
        const updatedUser = { ...user, ...formData }
        setUser(updatedUser)
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
    setImagePreview(originalData.foto_profil ? getPhotoUrl(originalData.foto_profil) : null)
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
      const response = await axiosInstance.post("/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation
      })

      if (response.data && response.data.success) {
        setSuccessMessage("Password berhasil diubah!")
        setIsChangingPassword(false)
        setPasswordForm({
          current_password: "",
          new_password: "",
          new_password_confirmation: ""
        })
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
    if (!name) return "M"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const getPhotoUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `http://localhost:8000/storage/${path}`
  }

  if (isLoadingData || !user) {
    return (
      <div className="w-full px-6 pb-6 pt-2 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
          <p className="text-center text-gray-500 mt-4">Memuat data profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-6 pb-6 pt-2">
      <div className="max-w-5xl mx-auto">
        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl flex items-center gap-2 shadow-sm">
            <CheckCircle size={14} className="text-emerald-500" />
            <p className="text-emerald-700 text-xs">{successMessage}</p>
            <button onClick={() => setSuccessMessage("")} className="ml-auto text-emerald-400 hover:text-emerald-600">
              <X size={12} />
            </button>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl flex items-center gap-2 shadow-sm">
            <AlertCircle size={14} className="text-red-500" />
            <p className="text-red-700 text-xs">{errorMessage}</p>
            <button onClick={() => setErrorMessage("")} className="ml-auto text-red-400 hover:text-red-600">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Photo - h-32 (sweet spot) */}
          <div className="relative h-32 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="relative -mt-14 mb-4">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                {/* Avatar - w-24 h-24 */}
                <div className="relative group">
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg ring-4 ring-white cursor-pointer overflow-hidden"
                       onClick={handleImageClick}>
                    {uploadingImage ? (
                      <RefreshCw size={20} className="text-white animate-spin" />
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
                      <Camera size={18} className="text-white" />
                    </div>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                  {(imagePreview || getPhotoUrl(user.foto_profil)) ? (
                    <button 
                      onClick={handleRemovePhoto}
                      className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all"
                    >
                      <Trash2 size={12} className="text-white" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleImageClick}
                      className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-all"
                    >
                      <Camera size={12} className="text-teal-500" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800">{user.nama || "Mentor"}</h1>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 px-2.5 py-0.5 bg-teal-50 rounded-full">
                          <Shield size={11} className="text-teal-500" />
                          <span className="text-xs font-medium text-teal-600">Mentor</span>
                        </div>
                        {formData.jabatan && (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 rounded-full">
                            <Briefcase size={11} className="text-blue-500" />
                            <span className="text-xs font-medium text-blue-600">{formData.jabatan}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-xs font-medium text-emerald-600">Aktif</span>
                        </div>
                      </div>
                    </div>

                    {!isEditing && !isChangingPassword && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsChangingPassword(true)} 
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                        >
                          <Key size={14} /> Password
                        </button>
                        <button 
                          onClick={() => setIsEditing(true)} 
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all shadow-sm text-sm font-medium"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ganti Password Section */}
            {isChangingPassword && (
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Lock size={14} className="text-amber-500" />
                    Ganti Password
                  </h3>
                  <button onClick={() => {
                    setIsChangingPassword(false)
                    setShowCurrentPassword(false)
                    setShowNewPassword(false)
                    setShowConfirmPassword(false)
                  }} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Password Saat Ini</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPassword ? "text" : "password"} 
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-8"
                        placeholder="Masukkan password saat ini"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showCurrentPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-8"
                        placeholder="Minimal 6 karakter"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showNewPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="new_password_confirmation"
                        value={passwordForm.new_password_confirmation}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pr-8"
                        placeholder="Ulangi password baru"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" })
                        setShowCurrentPassword(false)
                        setShowNewPassword(false)
                        setShowConfirmPassword(false)
                      }}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm font-medium"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50 text-sm font-medium"
                    >
                      {passwordLoading ? <RefreshCw size={14} className="animate-spin mx-auto" /> : "Simpan"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Informasi Pribadi */}
            {!isChangingPassword && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-teal-500 to-blue-500"></div>
                    <h2 className="text-base font-bold text-gray-800">Informasi Pribadi</h2>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <button onClick={handleCancel} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium">
                        Batal
                      </button>
                      <button onClick={handleSave} disabled={loading} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all shadow-sm disabled:opacity-50 text-sm font-medium">
                        {loading ? <RefreshCw size={12} className="animate-spin" /> : "Simpan"}
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
                    icon={<Briefcase size={12} className="text-teal-500" />}
                    label="Jabatan"
                    value={formData.jabatan}
                    editable={false}
                  />

                  <CardField
                    icon={<Building2 size={12} className="text-teal-500" />}
                    label="Divisi"
                    value={formData.divisi}
                    editable={false}
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

                  {/* Status Card - FULL WIDTH */}
                  <div className="md:col-span-2 bg-gradient-to-br from-emerald-50/50 to-emerald-50/30 rounded-lg p-4 border border-emerald-100">
                    <label className="block text-xs font-medium text-emerald-600 mb-1 flex items-center gap-1">
                      <Award size={12} className="text-emerald-500" /> Status Akun
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-gray-800 font-medium text-sm">Aktif</p>
                      <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">Terverifikasi</span>
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

export default ProfileMentor