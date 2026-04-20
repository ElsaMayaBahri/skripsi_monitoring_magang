import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  BookOpen, 
  Tag, 
  Layers,
  Sparkles,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Edit3,
  Eye,
  Calendar,
  Clock,
  User,
  Briefcase,
  UploadCloud,
  File,
  Video,
  X,
  RefreshCw
} from "lucide-react"

function EditMateri() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState({
    title: "",
    desc: "",
    divisi: "",
    kategori: ""
  })
  const [existingFile, setExistingFile] = useState(null)
  const [newFile, setNewFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("materi")) || []
    const item = data[id]

    if (item) {
      setForm({
        title: item.title || "",
        desc: item.desc || "",
        divisi: item.divisi || "",
        kategori: item.kategori || ""
      })
      if (item.file) {
        setExistingFile(item.file)
      }
    } else {
      setError("Materi tidak ditemukan")
    }
  }, [id])

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

    // Validasi ukuran file (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError("Ukuran file maksimal 50MB")
      return
    }

    // Simulasi upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 50)

    const newFileData = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      url: URL.createObjectURL(file),
      lastModified: new Date().toISOString()
    }
    
    setNewFile(newFileData)
  }

  const removeNewFile = () => {
    setNewFile(null)
    setUploadProgress(0)
  }

  const removeExistingFile = () => {
    setExistingFile(null)
  }

  const getFileIcon = (type) => {
    if (!type) return { icon: File, color: "text-slate-500", bg: "bg-slate-100" }
    if (type.includes("pdf")) return { icon: FileText, color: "text-red-500", bg: "bg-red-50" }
    if (type.includes("video")) return { icon: Video, color: "text-blue-500", bg: "bg-blue-50" }
    return { icon: File, color: "text-amber-500", bg: "bg-amber-50" }
  }

  const handleUpdate = () => {
    if (!form.title.trim()) {
      setError("Judul materi harus diisi")
      return
    }
    if (!form.divisi.trim()) {
      setError("Divisi harus diisi")
      return
    }

    setLoading(true)
    
    setTimeout(() => {
      const data = JSON.parse(localStorage.getItem("materi")) || []
      
      // Update data
      const updatedMateri = {
        ...form,
        file: newFile || existingFile,
        updatedAt: new Date().toISOString()
      }
      
      data[id] = updatedMateri
      localStorage.setItem("materi", JSON.stringify(data))
      
      setLoading(false)
      navigate("/coo/materi")
    }, 500)
  }

  const divisiOptions = [
    "CREATIVE TECHNOLOGY",
    "SCHOOL DESIGN", 
    "FINANCE",
    "ENGINEERING",
    "FRAMES",
    "PPTX"
  ]

  const existingFileInfo = existingFile ? getFileIcon(existingFile.type) : null
  const newFileInfo = newFile ? getFileIcon(newFile.type) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-5xl mx-auto">
        
        {/* ===== HEADER SECTION ===== */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/coo/materi")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 mb-3 transition text-sm"
          >
            <ArrowLeft size={14} />
            Kembali ke Materi
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl shadow-md">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-amber-800 to-orange-800 bg-clip-text text-transparent">
                Edit Materi
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Perbarui informasi dan file materi pelatihan
              </p>
            </div>
          </div>
        </div>

        {/* ===== MAIN FORM CARD ===== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
          
          {/* Error Message */}
          {error && (
            <div className="m-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <FileText size={12} className="text-blue-600" />
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
                      name="title"
                      placeholder="Contoh: Pengenalan Budaya Perusahaan"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
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
                      name="desc"
                      placeholder="Jelaskan secara singkat tentang materi ini..."
                      value={form.desc}
                      onChange={handleChange}
                      rows={4}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-purple-100 rounded-lg">
                    <Briefcase size={12} className="text-purple-600" />
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
                      name="divisi"
                      value={form.divisi}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 bg-white"
                    >
                      <option value="">Pilih Divisi</option>
                      {divisiOptions.map((div) => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Kategori
                  </label>
                  <div className="relative">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="kategori"
                      placeholder="Contoh: Video, PDF, Presentasi"
                      value={form.kategori}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ===== FILE UPLOAD SECTION ===== */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-emerald-100 rounded-lg">
                  <UploadCloud size={12} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">File Materi</h3>
                <span className="text-[10px] text-slate-400">(PDF, MP4, PPTX - maks 50MB)</span>
              </div>

              {/* Existing File */}
              {existingFile && !newFile && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${existingFileInfo?.bg} rounded-lg flex items-center justify-center`}>
                        {existingFileInfo && <existingFileInfo.icon size={18} className={existingFileInfo.color} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{existingFile.name}</p>
                        <p className="text-[10px] text-slate-400">{existingFile.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeExistingFile}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={10} />
                    File saat ini. Upload file baru untuk mengganti.
                  </p>
                </div>
              )}

              {/* Upload Area */}
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all duration-200">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.mp4,.ppt,.pptx"
                  />
                  <UploadCloud size={32} className="text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Klik atau tarik file ke sini</p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF, MP4, PPTX (Maks. 50MB)</p>
                </label>
              </div>

              {/* New File Preview */}
              {newFile && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${newFileInfo?.bg} rounded-lg flex items-center justify-center`}>
                        {newFileInfo && <newFileInfo.icon size={18} className={newFileInfo.color} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{newFile.name}</p>
                        <p className="text-[10px] text-slate-400">{newFile.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeNewFile}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  {/* Upload Progress */}
                  {uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Mengupload...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {uploadProgress === 100 && (
                    <p className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1">
                      <CheckCircle size={10} />
                      File siap diupload
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ===== BUTTONS ===== */}
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
              className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

        {/* ===== PREVIEW SECTION ===== */}
        {form.title && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={14} className="text-amber-600" />
              <h4 className="text-xs font-semibold text-amber-800">Preview Materi</h4>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
              <span className="flex items-center gap-1">
                <FileText size={12} />
                {form.title || "Judul akan muncul di sini"}
              </span>
              <span className="flex items-center gap-1">
                <Layers size={12} />
                {form.divisi || "Divisi"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date().toLocaleDateString("id-ID")}
              </span>
              {(newFile || existingFile) && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle size={12} />
                  File tersedia
                </span>
              )}
            </div>
          </div>
        )}

        {/* ===== INFO BANNER ===== */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-500" />
            <p className="text-xs text-blue-700">
              <strong className="font-semibold">Tips:</strong> Upload file baru akan menggantikan file lama. Pastikan file yang diupload sudah benar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tambahkan komponen Trash2 karena belum diimport
function Trash2(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 4V2h8v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  )
}

export default EditMateri