// src/pages/mentor/AddMateri.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  Save,
  X,
  FileText,
  Video,
  Link as LinkIcon,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  File,
  Sparkles,
  Shield,
  Zap
} from "lucide-react";

function AddMateri() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    tipe: "dokumen",
    file: null,
    link: "",
    for_role: "peserta"
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ file: "Format file tidak didukung. Gunakan PDF, DOC, DOCX, PPT, PPTX" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ file: "Ukuran file maksimal 10 MB" });
        return;
      }
      setFormData(prev => ({ ...prev, file }));
      setErrors(prev => ({ ...prev, file: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.judul.trim()) newErrors.judul = "Judul materi wajib diisi";
    if (!formData.deskripsi.trim()) newErrors.deskripsi = "Deskripsi materi wajib diisi";
    
    if (formData.tipe === "dokumen" && !formData.file) {
      newErrors.file = "File wajib diupload";
    }
    if ((formData.tipe === "video" || formData.tipe === "link") && !formData.link.trim()) {
      newErrors.link = "Link URL wajib diisi";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/mentor/materi");
      }, 1500);
    }, 1500);
  };

  const getTipeIcon = (tipe) => {
    switch(tipe) {
      case "dokumen":
        return { icon: FileText, bg: "bg-blue-100", text: "text-blue-600", label: "Dokumen", gradient: "from-blue-500 to-cyan-500" };
      case "video":
        return { icon: Video, bg: "bg-red-100", text: "text-red-600", label: "Video", gradient: "from-red-500 to-rose-500" };
      case "link":
        return { icon: LinkIcon, bg: "bg-green-100", text: "text-green-600", label: "Link", gradient: "from-green-500 to-emerald-500" };
      default:
        return { icon: File, bg: "bg-slate-100", text: "text-slate-600", label: "File", gradient: "from-slate-500 to-gray-500" };
    }
  };

  const currentTipe = getTipeIcon(formData.tipe);
  const TipeIcon = currentTipe.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      {/* Background Decoration */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1000px] mx-auto">
        
        {/* Header Premium */}
        <div className="mb-8">
          <Link to="/mentor/materi" className="group inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-all duration-300 mb-4">
            <div className="p-1 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm group-hover:bg-teal-50 transition-colors">
              <ArrowLeft size="14" />
            </div>
            <span className="text-sm font-medium">Kembali ke Daftar Materi</span>
          </Link>
          
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
            <div className="relative px-6 py-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Tambah Materi Baru
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">Tambahkan materi pembelajaran untuk peserta bimbingan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert Premium */}
        {success && (
          <div className="mb-6 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 backdrop-blur-sm border border-emerald-200 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-30"></div>
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                  <CheckCircle size="14" className="text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">Materi berhasil ditambahkan!</p>
                <p className="text-xs text-emerald-600">Materi akan segera tersedia untuk peserta</p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-blue-600"></div>
          </div>
          
          <div className="p-8 space-y-7">
            {/* Judul */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50">
                  <FileText size="14" className="text-teal-600" />
                </div>
                Judul Materi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  placeholder="Contoh: Pengantar React JS"
                  className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 ${
                    errors.judul 
                      ? "border-red-400 bg-red-50/30" 
                      : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                  }`}
                />
                {!errors.judul && formData.judul && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Sparkles size="16" className="text-teal-400" />
                  </div>
                )}
              </div>
              {errors.judul && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size="10" /> {errors.judul}</p>}
            </div>

            {/* Deskripsi */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50">
                  <FileText size="14" className="text-blue-600" />
                </div>
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows="4"
                placeholder="Jelaskan tentang materi ini..."
                className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 resize-none ${
                  errors.deskripsi 
                    ? "border-red-400 bg-red-50/30" 
                    : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                }`}
              />
              {errors.deskripsi && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size="10" /> {errors.deskripsi}</p>}
            </div>

            {/* Tipe Materi Premium */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50">
                  <Eye size="14" className="text-purple-600" />
                </div>
                Tipe Materi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipe: "dokumen", file: null, link: "" }))}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    formData.tipe === "dokumen"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FileText size="16" />
                  <span>Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipe: "video", file: null, link: "" }))}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    formData.tipe === "video"
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25"
                      : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Video size="16" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipe: "link", file: null, link: "" }))}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    formData.tipe === "link"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                      : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <LinkIcon size="16" />
                  <span>Link</span>
                </button>
              </div>
            </div>

            {/* Upload File Premium */}
            {formData.tipe === "dokumen" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50">
                    <Upload size="14" className="text-emerald-600" />
                  </div>
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  errors.file 
                    ? "border-red-300 bg-red-50/30" 
                    : "border-slate-200 bg-slate-50/30 hover:border-teal-400 hover:bg-teal-50/20"
                }`}>
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                  />
                  {formData.file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                          <FileText size="22" className="text-teal-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-700">{formData.file.name}</p>
                          <p className="text-xs text-slate-500">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                        className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all duration-200"
                      >
                        <X size="16" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file" className="cursor-pointer block">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center mb-3">
                        <Upload size="28" className="text-teal-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Klik untuk upload file</p>
                      <p className="text-xs text-slate-400 mt-2">PDF, DOC, DOCX, PPT, PPTX (Max 10 MB)</p>
                    </label>
                  )}
                </div>
                {errors.file && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size="10" /> {errors.file}</p>}
              </div>
            )}

            {/* Link URL Premium */}
            {(formData.tipe === "video" || formData.tipe === "link") && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50">
                    <LinkIcon size="14" className="text-amber-600" />
                  </div>
                  {formData.tipe === "video" ? "Link Video" : "Link URL"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder={formData.tipe === "video" ? "https://www.youtube.com/embed/..." : "https://example.com/materi"}
                  className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 ${
                    errors.link 
                      ? "border-red-400 bg-red-50/30" 
                      : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                  }`}
                />
                {errors.link && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size="10" /> {errors.link}</p>}
                {formData.tipe === "video" && formData.link && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-slate-50/80 to-white rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1"><Eye size="10" /> Preview Link:</p>
                    <div className="text-xs text-teal-600 break-all font-mono">{formData.link}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons Premium */}
          <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100 flex justify-end gap-4">
            <Link to="/mentor/materi">
              <button type="button" className="px-6 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all duration-200">
                Batal
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <Loader2 size="16" className="animate-spin" /> : <Save size="16" />}
                {loading ? "Menyimpan..." : "Simpan Materi"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </form>

        {/* Info Box Premium */}
        <div className="mt-8 bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div>
              <div className="relative p-2.5 bg-white rounded-xl shadow-md">
                <Shield size="16" className="text-teal-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-teal-800">Informasi</p>
              <p className="text-xs text-teal-700 mt-1 leading-relaxed">
                Materi yang ditambahkan akan langsung tersedia untuk semua peserta bimbingan Anda.
                Peserta dapat mengakses materi melalui menu pembelajaran. Pastikan file dan link yang diunggah valid.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-from-top-2 {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
      `}</style>
    </div>
  );
}

export default AddMateri;