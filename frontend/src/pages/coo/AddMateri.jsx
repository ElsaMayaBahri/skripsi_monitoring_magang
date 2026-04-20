import { useState } from "react"
import { 
  UploadCloud, FileText, Video, File, Sparkles, 
  ArrowLeft, CheckCircle, AlertCircle, X, 
  Calendar, Users, Tag, BookOpen, Globe,
  Shield, Star, Rocket, Zap, Crown, Gem,
  ArrowRight, Save, Layers, Briefcase
} from "lucide-react"
import { useNavigate } from "react-router-dom"

function AddMateri() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "",
    desc: "",
    divisi: "",
    kategori: ""
  })

  const [files, setFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const newFile = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      progress: 100
    }

    setFiles([...files, newFile])
  }

  const removeFile = (index) => {
    const updated = [...files]
    updated.splice(index, 1)
    setFiles(updated)
  }

  const getIcon = (type) => {
    if (type.includes("pdf")) return { icon: FileText, color: "text-red-500", bg: "bg-red-50", gradient: "from-red-500 to-rose-500" }
    if (type.includes("video")) return { icon: Video, color: "text-blue-500", bg: "bg-blue-50", gradient: "from-blue-500 to-indigo-500" }
    return { icon: File, color: "text-amber-500", bg: "bg-amber-50", gradient: "from-amber-500 to-orange-500" }
  }

  const handleSubmit = () => {
    if (!form.title || files.length === 0) {
      alert("Lengkapi data dan upload file dulu")
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const materi = JSON.parse(localStorage.getItem("materi")) || []

      const newMateri = {
        ...form,
        file: files[0],
        createdAt: new Date().toISOString(),
        views: 0,
        author: "COO",
        date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
      }

      materi.push(newMateri)
      localStorage.setItem("materi", JSON.stringify(materi))

      setIsSubmitting(false)
      navigate("/coo/materi")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* ===== HEADER SECTION ===== */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Tambah Materi Baru
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Lengkapi detail informasi dan unggah berkas materi
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/coo/materi")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft size={16} />
              Kembali ke Materi
            </button>
          </div>
        </div>

        {/* ===== MAIN FORM ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN - FORM */}
          <div className="space-y-6">
            {/* Detail Metadata Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="relative h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Detail Metadata</h3>
                    <p className="text-xs text-slate-400">Informasi dasar materi pelatihan</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Judul Materi <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="title"
                      placeholder="Contoh: Pengenalan Budaya Perusahaan"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Deskripsi Materi
                    </label>
                    <textarea
                      name="desc"
                      placeholder="Jelaskan secara singkat tentang materi ini..."
                      value={form.desc}
                      onChange={handleChange}
                      rows="4"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Divisi <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="divisi"
                        value={form.divisi}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
                      >
                        <option value="">Pilih Divisi</option>
                        <option>CREATIVE TECHNOLOGY</option>
                        <option>SCHOOL DESIGN</option>
                        <option>FINANCE</option>
                        <option>ENGINEERING</option>
                        <option>FRAMES</option>
                        <option>PPTX</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Kategori
                      </label>
                      <input
                        name="kategori"
                        placeholder="Contoh: Video, PDF, Presentasi"
                        value={form.kategori}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-800">Tips Membuat Materi Berkualitas</p>
                  <p className="text-[10px] text-blue-600 mt-1">
                    • Gunakan judul yang jelas dan mudah dipahami<br/>
                    • Sertakan deskripsi singkat tentang isi materi<br/>
                    • Pastikan file yang diunggah dalam format yang tepat
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - UPLOAD */}
          <div className="space-y-6">
            {/* Upload File Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="relative h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-md">
                    <UploadCloud className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Unggah File</h3>
                    <p className="text-xs text-slate-400">Maksimal 50MB • PDF, MP4, PPTX</p>
                  </div>
                </div>

                <label className="relative group block border-2 border-dashed border-slate-200 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFile}
                  />
                  
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="text-blue-500" size={32} />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      Seret & letakkan file di sini
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Atau klik untuk memilih dari komputer
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-full text-slate-500">PDF</span>
                      <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-full text-slate-500">MP4</span>
                      <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-full text-slate-500">PPTX</span>
                    </div>
                  </div>
                </label>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-slate-600">File Terunggah</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {files.length} file
                      </span>
                    </div>
                    <div className="space-y-2">
                      {files.map((f, i) => {
                        const fileInfo = getIcon(f.type)
                        const FileIcon = fileInfo.icon
                        
                        return (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${fileInfo.bg} rounded-xl flex items-center justify-center`}>
                                <FileIcon size={18} className={fileInfo.color} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700">{f.name}</p>
                                <p className="text-[10px] text-slate-400">{f.size}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                  style={{ width: `${f.progress}%` }}
                                ></div>
                              </div>
                              <button
                                onClick={() => removeFile(i)}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                              >
                                <X size={14} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-800">Informasi Penting</p>
                  <p className="text-[10px] text-amber-600 mt-1">
                    Setelah diterbitkan, materi akan langsung tersedia untuk semua peserta magang.
                    Pastikan semua data sudah benar sebelum menerbitkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== ACTION BUTTONS ===== */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={() => navigate("/coo/materi")}
            className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !form.title || files.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Memproses...
              </>
            ) : (
              <>
                <Save size={16} />
                Terbitkan Materi
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        {/* Preview Section (Optional - if file is uploaded) */}
        {files.length > 0 && (
          <div className="mt-6 p-4 bg-slate-50/50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} className="text-emerald-500" />
              <span className="text-xs font-medium text-slate-600">Preview Materi</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {form.title || "Judul akan muncul di sini"}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {form.divisi || "Divisi"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date().toLocaleDateString("id-ID")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddMateri