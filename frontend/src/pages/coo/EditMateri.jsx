import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getDivisi } from "../../api/admin/dashboardService"
import { getMateriById, updateMateri } from "../../api/coo/materiService"
import { 
  Save, 
  FileText, 
  BookOpen, 
  Layers,
  Edit3,
  UploadCloud,
  File,
  Video,
  X,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Image,
  FileCode,
  Presentation
} from "lucide-react"

function EditMateri() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    id_divisi: ""  // Ubah dari divisi ke id_divisi
  })
  const [existingFile, setExistingFile] = useState(null)
  const [newFile, setNewFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [divisiList, setDivisiList] = useState([])

  const BASE_URL = "http://localhost:8000"

  const getFileIconByFileName = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || ''
    if (ext === "pdf") return { icon: FileText, color: "text-red-500", bg: "bg-red-50", label: "PDF" }
    if (ext === "mp4" || ext === "mov" || ext === "avi") return { icon: Video, color: "text-blue-500", bg: "bg-blue-50", label: "Video" }
    if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif") return { icon: Image, color: "text-purple-500", bg: "bg-purple-50", label: "Gambar" }
    if (ext === "doc" || ext === "docx") return { icon: FileText, color: "text-blue-600", bg: "bg-blue-50", label: "Word" }
    if (ext === "ppt" || ext === "pptx") return { icon: Presentation, color: "text-orange-500", bg: "bg-orange-50", label: "PowerPoint" }
    if (ext === "xls" || ext === "xlsx") return { icon: FileCode, color: "text-green-500", bg: "bg-green-50", label: "Excel" }
    return { icon: File, color: "text-slate-500", bg: "bg-slate-100", label: "File" }
  }

  const cleanUrl = (filePath) => {
    if (!filePath) return null
    if (filePath.startsWith('http')) return filePath
    const filename = filePath.split('/').pop()
    return `${BASE_URL}/api/materi-file/${filename}`
  }

  useEffect(() => {
    fetchMateri()
    fetchDivisi()
  }, [id])

  const fetchMateri = async () => {
    setLoading(true)
    try {
      const response = await getMateriById(id)
      console.log("Materi response:", response)
      
      if (response && response.success && response.data) {
        const materiItem = response.data
        
        setForm({
          judul: materiItem.judul || "",
          deskripsi: materiItem.deskripsi || "",
          id_divisi: materiItem.id_divisi || ""  // Gunakan id_divisi dari response
        })
        
        if (materiItem.file_materi) {
          const fileName = materiItem.file_materi.split('/').pop()
          
          setExistingFile({
            name: fileName,
            path: materiItem.file_materi,
            url: materiItem.file_url || cleanUrl(materiItem.file_materi),
            ext: fileName.split('.').pop()?.toLowerCase()
          })
        }
      } else {
        setError("Materi tidak ditemukan")
      }
    } catch (error) {
      console.error("Error fetch materi:", error)
      setError(error.response?.data?.message || error.message || "Terjadi kesalahan saat mengambil data")
    } finally {
      setLoading(false)
    }
  }

  const fetchDivisi = async () => {
    try {
      const response = await getDivisi()
      let divisiData = []
      if (response && response.success && Array.isArray(response.data)) {
        divisiData = response.data
      } else if (Array.isArray(response)) {
        divisiData = response
      }
      // Filter hanya divisi yang aktif
      const aktifDivisi = divisiData.filter(div => {
        const status = div.status
        return status === "aktif" || status === 1 || status === true
      })
      setDivisiList(aktifDivisi)
      console.log("Divisi aktif loaded:", aktifDivisi)
    } catch (error) {
      console.error("Error fetch divisi:", error)
    }
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
    if (error) setError("")
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      setError("Ukuran file maksimal 50MB")
      return
    }

    const newFileData = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      file: file,
      ext: file.name.split('.').pop()?.toLowerCase()
    }
    
    setNewFile(newFileData)
  }

  const removeNewFile = () => {
    setNewFile(null)
  }

  const removeExistingFile = () => {
    setExistingFile(null)
  }

  const handleUpdate = async () => {
    if (!form.judul.trim()) {
      setError("Judul materi harus diisi")
      return
    }
    if (!form.id_divisi) {
      setError("Divisi harus dipilih")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const materiId = parseInt(id)
      
      const formData = new FormData()
      formData.append("judul", form.judul.trim())
      formData.append("deskripsi", form.deskripsi || "")
      formData.append("id_divisi", form.id_divisi)  // Kirim id_divisi, bukan divisi
      
      // Kirim sebagai POST dengan _method PUT untuk mengatasi form-data
      formData.append("_method", "PUT")
      
      if (newFile && newFile.file) {
        formData.append("file", newFile.file)
      }

      console.log("Updating materi ID:", materiId)
      console.log("Data:", {
        judul: form.judul,
        id_divisi: form.id_divisi,
        hasFile: !!(newFile && newFile.file)
      })

      const response = await updateMateri(materiId, formData)
      console.log("Update response:", response)
      
      if (response && response.success) {
        setSuccess(response.message || "Materi berhasil diupdate!")
        // Refresh data materi setelah update
        await fetchMateri()
        setTimeout(() => {
          navigate("/coo/materi")
        }, 1500)
      } else {
        setError(response?.message || "Gagal mengupdate materi")
      }
    } catch (err) {
      console.error("Error updating materi:", err)
      
      if (err.response?.status === 405) {
        setError("Method tidak diizinkan. Pastikan backend mendukung method POST dengan _method PUT.")
      } else if (err.response?.status === 422) {
        const errors = err.response.data?.errors
        if (errors) {
          const errorMessages = Object.values(errors).flat()
          setError(errorMessages.join(", "))
        } else {
          setError(err.response.data?.message || "Validasi gagal")
        }
      } else if (err.response?.status === 404) {
        setError("Materi tidak ditemukan")
      } else {
        setError(err.response?.data?.message || err.message || "Terjadi kesalahan saat mengupdate materi")
      }
    } finally {
      setLoading(false)
    }
  }

  const existingFileInfo = existingFile ? getFileIconByFileName(existingFile.name) : null
  const newFileInfo = newFile ? getFileIconByFileName(newFile.name) : null

  if (loading && !form.judul) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p className="text-slate-500 text-sm">Memuat data materi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200/30">
      <div className="p-5 lg:p-6 max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl shadow-sm">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                Edit Materi
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                Perbarui informasi dan file materi pelatihan
              </p>
            </div>
          </div>
        </div>

        {/* MAIN FORM CARD */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-indigo-600 to-blue-600"></div>
          
          {error && (
            <div className="m-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="m-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              <p className="text-sm text-emerald-600">{success}</p>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-indigo-100 rounded-lg">
                    <FileText size={12} className="text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Informasi Materi</h3>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Judul Materi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="judul"
                      placeholder="Contoh: Pengenalan Budaya Perusahaan"
                      value={form.judul}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Deskripsi Materi
                  </label>
                  <div className="relative">
                    <BookOpen size={14} className="absolute left-3 top-3 text-slate-400" />
                    <textarea
                      name="deskripsi"
                      placeholder="Jelaskan secara singkat tentang materi ini..."
                      value={form.deskripsi}
                      onChange={handleChange}
                      rows={4}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-purple-100 rounded-lg">
                    <Layers size={12} className="text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Klasifikasi</h3>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Divisi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      name="id_divisi"
                      value={form.id_divisi}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white"
                    >
                      <option value="">Pilih Divisi</option>
                      {divisiList.map((div) => (
                        <option key={div.id_divisi || div.id} value={div.id_divisi || div.id}>
                          {div.nama_divisi || div.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">* Hanya menampilkan divisi yang aktif</p>
                </div>
              </div>
            </div>

            {/* FILE UPLOAD SECTION */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-emerald-100 rounded-lg">
                  <UploadCloud size={12} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">File Materi</h3>
                <span className="text-[10px] text-slate-400">(PDF, Word, PPT, Excel, Video, Gambar - maks 50MB)</span>
              </div>

              {existingFile && !newFile && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${existingFileInfo?.bg} rounded-lg flex items-center justify-center`}>
                        {existingFileInfo && <existingFileInfo.icon size={18} className={existingFileInfo.color} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{existingFile.name}</p>
                        <p className="text-[10px] text-slate-400">File saat ini • {existingFileInfo?.label}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeExistingFile}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-indigo-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={10} />
                    Upload file baru untuk mengganti file saat ini.
                  </p>
                </div>
              )}

              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.jpg,.jpeg,.png,.gif"
                  />
                  <UploadCloud size={32} className="text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Klik atau tarik file ke sini</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    PDF, Word, PPT, Excel, Video, Gambar (Maks. 50MB)
                  </p>
                </label>
              </div>

              {newFile && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${newFileInfo?.bg} rounded-lg flex items-center justify-center`}>
                        {newFileInfo && <newFileInfo.icon size={18} className={newFileInfo.color} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{newFile.name}</p>
                        <p className="text-[10px] text-slate-400">{newFile.size} • {newFileInfo?.label}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeNewFile}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1">
                    <CheckCircle size={10} />
                    File siap diupload
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
            <button
              onClick={() => navigate("/coo/materi")}
              className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 transition-all duration-200"
              disabled={loading}
            >
              Batal
            </button>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Update Materi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditMateri