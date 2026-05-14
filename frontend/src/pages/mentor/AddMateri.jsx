// src/pages/mentor/AddMateri.jsx
import React, { useState, useRef } from "react";
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
  PlayCircle
} from "lucide-react";
import { createMentorMateri } from "../../api/mentor/materiMentorService";

function AddMateri() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formDataState, setFormDataState] = useState({
    judul: "",
    deskripsi: "",
    tipe_materi: "dokumen",
    file_materi: null,
    link: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataState(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
        setFilePreview(null);
      }
      
      if (formDataState.tipe_materi === "dokumen") {
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ];
        if (!allowedTypes.includes(file.type)) {
          setErrors({ file_materi: "Format file tidak didukung. Gunakan PDF, DOC, DOCX, PPT, PPTX" });
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          setErrors({ file_materi: "Ukuran file maksimal 10 MB" });
          return;
        }
      } else if (formDataState.tipe_materi === "video") {
        const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
        if (!allowedTypes.includes(file.type)) {
          setErrors({ file_materi: "Format video tidak didukung. Gunakan MP4, MOV, AVI, WEBM" });
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          setErrors({ file_materi: "Ukuran video maksimal 50 MB" });
          return;
        }
        const previewUrl = URL.createObjectURL(file);
        setFilePreview(previewUrl);
      }
      
      setFormDataState(prev => ({ ...prev, file_materi: file }));
      setErrors(prev => ({ ...prev, file_materi: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formDataState.judul || formDataState.judul.trim() === "") {
      newErrors.judul = "Judul materi wajib diisi";
    }
    if (!formDataState.deskripsi || formDataState.deskripsi.trim() === "") {
      newErrors.deskripsi = "Deskripsi materi wajib diisi";
    }
    
    if (formDataState.tipe_materi === "dokumen" && !formDataState.file_materi) {
      newErrors.file_materi = "File wajib diupload";
    }
    if (formDataState.tipe_materi === "video" && !formDataState.file_materi) {
      newErrors.file_materi = "File video wajib diupload";
    }
    if (formDataState.tipe_materi === "link" && (!formDataState.link || formDataState.link.trim() === "")) {
      newErrors.link = "Link URL wajib diisi";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetFile = () => {
    setFormDataState(prev => ({ ...prev, file_materi: null }));
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setFormDataState({
      judul: "",
      deskripsi: "",
      tipe_materi: "dokumen",
      file_materi: null,
      link: "",
    });
    resetFile();
    setErrors({});
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const submitData = new FormData();
      submitData.append("judul", formDataState.judul);
      submitData.append("deskripsi", formDataState.deskripsi);
      submitData.append("tipe_materi", formDataState.tipe_materi);
      
      if (formDataState.tipe_materi === "dokumen" || formDataState.tipe_materi === "video") {
        if (formDataState.file_materi) {
          submitData.append("file", formDataState.file_materi);
        }
      } else if (formDataState.tipe_materi === "link") {
        submitData.append("link", formDataState.link);
      }
      
      const response = await createMentorMateri(submitData);
      
      if (response.success) {
        setSuccess(true);
        setShowSuccessModal(true);
      } else {
        setError(response.message || "Gagal menambahkan materi");
        if (response.errors) {
          setErrors(response.errors);
        }
        setErrorMessage(response.message || "Gagal menambahkan materi");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Error adding materi:", err);
      let errorMsg = "Terjadi kesalahan saat menambahkan materi";
      
      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        setErrors(backendErrors);
        errorMsg = Object.values(backendErrors).flat().join(", ");
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTipeChange = (tipe) => {
    resetFile();
    setFormDataState(prev => ({ 
      ...prev, 
      tipe_materi: tipe, 
      file_materi: null, 
      link: "" 
    }));
    setErrors({});
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

  const currentTipe = getTipeIcon(formDataState.tipe_materi);
  const TipeIcon = currentTipe.icon;

  // Modal Success Component
  const SuccessModal = () => {
    if (!showSuccessModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in duration-300">
          {/* Header Gradient */}
          <div className="relative h-24 bg-gradient-to-r from-emerald-500 to-teal-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 pb-6 pt-10 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Berhasil!</h3>
            <p className="text-slate-500 text-sm mb-6">
              Materi "{formDataState.judul}" berhasil ditambahkan
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-all duration-200"
              >
                Tambah Lagi
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/mentor/materi");
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                Lihat Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal Error Component
  const ErrorModal = () => {
    if (!showErrorModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in duration-300">
          {/* Header Gradient */}
          <div className="relative h-24 bg-gradient-to-r from-red-500 to-rose-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 pb-6 pt-10 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Gagal!</h3>
            <p className="text-slate-500 text-sm mb-6">
              {errorMessage}
            </p>
            
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      {/* Modal */}
      <SuccessModal />
      <ErrorModal />
      
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1000px] mx-auto">
        
        {/* Header tanpa tombol kembali ke daftar materi */}
        <div className="mb-8">
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

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-blue-600"></div>
          </div>
          
          <div className="p-8 space-y-7">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50">
                  <FileText size={14} className="text-teal-600" />
                </div>
                Judul Materi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judul"
                value={formDataState.judul}
                onChange={handleChange}
                placeholder="Contoh: Pengantar React JS"
                className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 ${
                  errors.judul 
                    ? "border-red-400 bg-red-50/30" 
                    : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                }`}
              />
              {errors.judul && <p className="text-xs text-red-500 mt-2">{errors.judul}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50">
                  <FileText size={14} className="text-blue-600" />
                </div>
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="deskripsi"
                value={formDataState.deskripsi}
                onChange={handleChange}
                rows={4}
                placeholder="Jelaskan tentang materi ini..."
                className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 resize-none ${
                  errors.deskripsi 
                    ? "border-red-400 bg-red-50/30" 
                    : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                }`}
              />
              {errors.deskripsi && <p className="text-xs text-red-500 mt-2">{errors.deskripsi}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50">
                  <Eye size={14} className="text-purple-600" />
                </div>
                Tipe Materi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleTipeChange("dokumen")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    formDataState.tipe_materi === "dokumen"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                      : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FileText size={16} />
                  <span>Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTipeChange("video")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    formDataState.tipe_materi === "video"
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg"
                      : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Video size={16} />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTipeChange("link")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    formDataState.tipe_materi === "link"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                      : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <LinkIcon size={16} />
                  <span>Link</span>
                </button>
              </div>
            </div>

            {(formDataState.tipe_materi === "dokumen" || formDataState.tipe_materi === "video") && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50">
                    <Upload size={14} className="text-emerald-600" />
                  </div>
                  {formDataState.tipe_materi === "video" ? "Upload File Video" : "Upload File"} <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  errors.file_materi || errors.file
                    ? "border-red-300 bg-red-50/30" 
                    : "border-slate-200 bg-slate-50/30 hover:border-teal-400 hover:bg-teal-50/20"
                }`}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file_upload"
                    accept={formDataState.tipe_materi === "video" ? "video/*" : ".pdf,.doc,.docx,.ppt,.pptx"}
                  />
                  {formDataState.file_materi ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                            {formDataState.tipe_materi === "video" ? (
                              <Video size={22} className="text-red-600" />
                            ) : (
                              <FileText size={22} className="text-teal-600" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-700">{formDataState.file_materi.name}</p>
                            <p className="text-xs text-slate-500">{(formDataState.file_materi.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={resetFile}
                          className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all duration-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {formDataState.tipe_materi === "video" && filePreview && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                          <video controls className="w-full max-h-64">
                            <source src={filePreview} type={formDataState.file_materi.type} />
                            Browser Anda tidak mendukung video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label htmlFor="file_upload" className="cursor-pointer block">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center mb-3">
                        {formDataState.tipe_materi === "video" ? (
                          <PlayCircle size={28} className="text-red-600" />
                        ) : (
                          <Upload size={28} className="text-teal-600" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-600">Klik untuk upload {formDataState.tipe_materi === "video" ? "video" : "file"}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {formDataState.tipe_materi === "video" 
                          ? "MP4, MOV, AVI, WEBM (Max 50 MB)" 
                          : "PDF, DOC, DOCX, PPT, PPTX (Max 10 MB)"}
                      </p>
                    </label>
                  )}
                </div>
                {(errors.file_materi || errors.file) && <p className="text-xs text-red-500 mt-2">{errors.file_materi || errors.file}</p>}
              </div>
            )}

            {formDataState.tipe_materi === "link" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50">
                    <LinkIcon size={14} className="text-amber-600" />
                  </div>
                  Link URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="link"
                  value={formDataState.link}
                  onChange={handleChange}
                  placeholder="https://example.com/materi"
                  className={`w-full px-5 py-3.5 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 ${
                    errors.link 
                      ? "border-red-400 bg-red-50/30" 
                      : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                  }`}
                />
                {errors.link && <p className="text-xs text-red-500 mt-2">{errors.link}</p>}
              </div>
            )}
          </div>

          <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100 flex justify-end gap-4">
            <Link to="/mentor/materi">
              <button type="button" className="px-6 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all duration-200">
                Kembali
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? "Menyimpan..." : "Simpan Materi"}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative p-2.5 bg-white rounded-xl shadow-md">
              <Shield size={16} className="text-teal-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-teal-800">Informasi</p>
              <p className="text-xs text-teal-700 mt-1 leading-relaxed">
                {formDataState.tipe_materi === "video" 
                  ? "Upload file video pelatihan langsung. Peserta dapat memutar video di platform. Format: MP4, MOV, AVI, WEBM (Max 50 MB)."
                  : formDataState.tipe_materi === "dokumen"
                  ? "Upload file dokumen pembelajaran. Peserta dapat mengunduh dan membaca dokumen. Format: PDF, DOC, DOCX, PPT, PPTX (Max 10 MB)."
                  : "Masukkan link URL materi eksternal. Peserta akan diarahkan ke halaman tersebut."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMateri;