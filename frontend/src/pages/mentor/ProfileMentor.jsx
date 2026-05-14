// src/pages/mentor/ProfileMentor.jsx
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Save, X, 
  Briefcase, Clock, CheckCircle, AlertCircle, Users, BookOpen, Star,
  Camera, Upload, Trash2, Loader2 
} from "lucide-react"
import axiosInstance from "../../api/axios"

function ProfileMentor() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [originalData, setOriginalData] = useState({})
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setFormData(parsedUser)
      setOriginalData(parsedUser)
      // Set photo preview jika ada foto
      if (parsedUser.foto_profil) {
        setPhotoPreview(parsedUser.foto_profil)
      }
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Fungsi upload foto profil
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }

    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 2MB")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }

    setUploadingPhoto(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const formDataPhoto = new FormData()
      formDataPhoto.append('foto_profil', file)
      formDataPhoto.append('_method', 'PUT')

      const response = await axiosInstance.post(`/mentor/profile/photo`, formDataPhoto, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        // Update user data di localStorage
        const updatedUser = { ...user, foto_profil: response.data.foto_url }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
        setFormData(updatedUser)
        setPhotoPreview(response.data.foto_url)
        setSuccessMessage("Foto profil berhasil diperbarui!")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        setErrorMessage(response.data.message || "Gagal upload foto")
        setTimeout(() => setErrorMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      setErrorMessage(error.response?.data?.message || "Gagal upload foto")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Fungsi hapus foto profil
  const handleRemovePhoto = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus foto profil?")) return

    setUploadingPhoto(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const response = await axiosInstance.delete('/mentor/profile/photo')

      if (response.data.success) {
        const updatedUser = { ...user, foto_profil: null }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
        setFormData(updatedUser)
        setPhotoPreview(null)
        setSuccessMessage("Foto profil berhasil dihapus!")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        setErrorMessage(response.data.message || "Gagal menghapus foto")
        setTimeout(() => setErrorMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error removing photo:", error)
      setErrorMessage(error.response?.data?.message || "Gagal menghapus foto")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    
    try {
      const response = await axiosInstance.put("/mentor/profile", {
        nama: formData.nama,
        email: formData.email,
        no_telepon: formData.no_hp,
        alamat: formData.alamat,
        keahlian: formData.keahlian,
        pengalaman: formData.pengalaman
      })
      
      if (response.data.success) {
        const updatedUser = { ...user, ...formData }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUser(updatedUser)
        setOriginalData(formData)
        setIsEditing(false)
        setSuccessMessage("Profil berhasil diperbarui!")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        setErrorMessage(response.data.message || "Gagal memperbarui profil")
        setTimeout(() => setErrorMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setErrorMessage(error.response?.data?.message || "Gagal memperbarui profil")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  const userInitial = user.nama ? user.nama.charAt(0).toUpperCase() : "M"

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-teal-500 to-blue-600"></div>
        
        <div className="relative px-6 pb-6">
          {/* Avatar dengan upload foto */}
          <div className="relative -mt-12 mb-4 group">
            <div className="relative inline-block">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt={user.nama || "Profile"} 
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg ring-4 ring-white">
                  <span className="text-white text-3xl font-bold">{userInitial}</span>
                </div>
              )}
              
              {/* Overlay dan tombol upload */}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white rounded-full text-teal-600 hover:bg-teal-50 transition"
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                </button>
              </div>
              
              {/* Tombol hapus foto */}
              {photoPreview && (
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -bottom-1 -right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition shadow-md"
                  disabled={uploadingPhoto}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{user.nama || "Mentor"}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-xs rounded-full">Mentor</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">Aktif</span>
              </div>
            </div>
            
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">
                <Edit2 size={16} /> Edit Profil
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Batal</button>
                <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Pribadi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nama Lengkap</label>
              {isEditing ? (
                <input type="text" name="nama" value={formData.nama || ""} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
              ) : (
                <p className="text-gray-800">{user.nama || "-"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              {isEditing ? (
                <input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
              ) : (
                <p className="text-gray-800">{user.email || "-"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">No. Telepon</label>
              {isEditing ? (
                <input type="tel" name="no_hp" value={formData.no_hp || ""} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
              ) : (
                <p className="text-gray-800">{user.no_hp || "-"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Alamat</label>
              {isEditing ? (
                <textarea name="alamat" value={formData.alamat || ""} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
              ) : (
                <p className="text-gray-800">{user.alamat || "-"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Bidang Keahlian</label>
              {isEditing ? (
                <input type="text" name="keahlian" value={formData.keahlian || ""} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
              ) : (
                <p className="text-gray-800">{user.keahlian || "-"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Pengalaman (Tahun)</label>
              {isEditing ? (
                <input type="number" name="pengalaman" value={formData.pengalaman || ""} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
              ) : (
                <p className="text-gray-800">{user.pengalaman || "-"} tahun</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileMentor