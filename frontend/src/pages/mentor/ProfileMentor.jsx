import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Save, X, Briefcase, Clock, CheckCircle, AlertCircle, Users, BookOpen, Star } from "lucide-react"

function ProfileMentor() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [originalData, setOriginalData] = useState({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setFormData(parsedUser)
      setOriginalData(parsedUser)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      localStorage.setItem("user", JSON.stringify(formData))
      setUser(formData)
      setOriginalData(formData)
      setIsEditing(false)
      setSuccessMessage("Profil berhasil diperbarui!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      setErrorMessage("Gagal memperbarui profil")
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
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-teal-500 to-blue-600"></div>
        
        <div className="relative px-6 pb-6">
          <div className="relative -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg ring-4 ring-white mx-auto md:mx-0">
              <span className="text-white text-3xl font-bold">{userInitial}</span>
            </div>
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