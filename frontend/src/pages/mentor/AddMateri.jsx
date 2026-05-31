// src/pages/mentor/AddMateri.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
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
  Shield,
  PlayCircle,
  Users,
  Building2
} from "lucide-react";
import { createMentorMateri, getMentorInfo } from "../../api/mentor/materiMentorService";

function AddMateri() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMentorInfo, setLoadingMentorInfo] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [mentorInfo, setMentorInfo] = useState(null);
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

  // Fetch mentor info on component mount
  useEffect(() => {
    fetchMentorInfo();
  }, []);

  const fetchMentorInfo = async () => {
    setLoadingMentorInfo(true);
    try {
      const response = await getMentorInfo();
      if (response.success && response.data) {
        setMentorInfo(response.data);
      }
    } catch (err) {
      console.error("Error fetching mentor info:", err);
      setErrorMessage("Gagal memuat informasi mentor");
      setShowErrorModal(true);
    } finally {
      setLoadingMentorInfo(false);
    }
  };

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

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in duration-300">
          <div className="relative h-24 bg-gradient-to-r from-emerald-500 to-teal-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
          </div>
          
          <div className="px-6 pb-6 pt-10 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Berhasil!</h3>
            <p className="text-slate-500 text-sm mb-4">
              Materi "{formDataState.judul}" berhasil ditambahkan
            </p>
            {mentorInfo && (
              <div className="bg-teal-50 rounded-xl p-3 mb-6">
                <p className="text-xs text-teal-700">
                  <Building2 className="inline w-3 h-3 mr-1" />
                  Materi ini akan muncul untuk semua peserta bimbingan Anda di divisi: <strong>{mentorInfo.nama_divisi || "Belum ada divisi"}</strong>
                </p>
                <p className="text-xs text-teal-600 mt-1">
                  <Users className="inline w-3 h-3 mr-1" />
                  Total peserta: Menyesuaikan dengan peserta bimbingan Anda
                </p>
              </div>
            )}
            
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

  // Error Modal Component
  const ErrorModal = () => {
    if (!showErrorModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in duration-300">
          <div className="relative h-24 bg-gradient-to-r from-red-500 to-rose-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>
          
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

  if (loadingMentorInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-slate-600">Memuat informasi mentor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <SuccessModal />
      <ErrorModal />
      
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1400px] mx-auto">
        
        {/* Header - Lebih lebar */}
        <div className="mb-6">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
            <div className="relative px-6 py-4">
              <div className="flex items-center gap-3">
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
          
          {/* Layout 2 kolom untuk form yang lebih lebar */}
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kolom Kiri */}
              <div className="space-y-5">
                {/* Judul Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-teal-50">
                      <FileText size={12} className="text-teal-600" />
                    </div>
                    Judul Materi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="judul"
                    value={formDataState.judul}
                    onChange={handleChange}
                    placeholder="Contoh: Pengantar React JS"
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 ${
                      errors.judul 
                        ? "border-red-400 bg-red-50/30" 
                        : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                    }`}
                  />
                  {errors.judul && <p className="text-xs text-red-500 mt-1">{errors.judul}</p>}
                </div>

                {/* Tipe Materi Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-purple-50">
                      <Eye size={12} className="text-purple-600" />
                    </div>
                    Tipe Materi <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTipeChange("dokumen")}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
                        formDataState.tipe_materi === "dokumen"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                          : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <FileText size={14} />
                      <span>Dokumen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTipeChange("video")}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
                        formDataState.tipe_materi === "video"
                          ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg"
                          : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Video size={14} />
                      <span>Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTipeChange("link")}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
                        formDataState.tipe_materi === "link"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                          : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <LinkIcon size={14} />
                      <span>Link</span>
                    </button>
                  </div>
                </div>

                {/* Link URL Section */}
                {formDataState.tipe_materi === "link" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-amber-50">
                        <LinkIcon size={12} className="text-amber-600" />
                      </div>
                      Link URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="link"
                      value={formDataState.link}
                      onChange={handleChange}
                      placeholder="https://example.com/materi"
                      className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 ${
                        errors.link 
                          ? "border-red-400 bg-red-50/30" 
                          : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                      }`}
                    />
                    {errors.link && <p className="text-xs text-red-500 mt-1">{errors.link}</p>}
                  </div>
                )}
              </div>

              {/* Kolom Kanan */}
              <div className="space-y-5">
                {/* Deskripsi Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-blue-50">
                      <FileText size={12} className="text-blue-600" />
                    </div>
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formDataState.deskripsi}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Jelaskan tentang materi ini..."
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-200 resize-none ${
                      errors.deskripsi 
                        ? "border-red-400 bg-red-50/30" 
                        : "border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                    }`}
                  />
                  {errors.deskripsi && <p className="text-xs text-red-500 mt-1">{errors.deskripsi}</p>}
                </div>

                {/* File Upload Section */}
                {(formDataState.tipe_materi === "dokumen" || formDataState.tipe_materi === "video") && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-emerald-50">
                        <Upload size={12} className="text-emerald-600" />
                      </div>
                      {formDataState.tipe_materi === "video" ? "Upload File Video" : "Upload File"} <span className="text-red-500">*</span>
                    </label>
                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
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
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                                {formDataState.tipe_materi === "video" ? (
                                  <Video size={18} className="text-red-600" />
                                ) : (
                                  <FileText size={18} className="text-teal-600" />
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
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all duration-200"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          {formDataState.tipe_materi === "video" && filePreview && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                              <video controls className="w-full max-h-48">
                                <source src={filePreview} type={formDataState.file_materi.type} />
                                Browser Anda tidak mendukung video tag.
                              </video>
                            </div>
                          )}
                        </div>
                      ) : (
                        <label htmlFor="file_upload" className="cursor-pointer block">
                          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center mb-2">
                            {formDataState.tipe_materi === "video" ? (
                              <PlayCircle size={22} className="text-red-600" />
                            ) : (
                              <Upload size={22} className="text-teal-600" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-600">Klik untuk upload {formDataState.tipe_materi === "video" ? "video" : "file"}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formDataState.tipe_materi === "video" 
                              ? "MP4, MOV, AVI, WEBM (Max 50 MB)" 
                              : "PDF, DOC, DOCX, PPT, PPTX (Max 10 MB)"}
                          </p>
                        </label>
                      )}
                    </div>
                    {(errors.file_materi || errors.file) && <p className="text-xs text-red-500 mt-1">{errors.file_materi || errors.file}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="px-6 lg:px-8 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100 flex justify-end gap-3">
            <Link to="/mentor/materi">
              <button type="button" className="px-5 py-2 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all duration-200 text-sm">
                Kembali
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="relative group overflow-hidden px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {loading ? "Menyimpan..." : "Simpan Materi"}
            </button>
          </div>
        </form>

        {/* Informasi Penting - Lebih kompak */}
        <div className="mt-6 bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-xl p-4 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative p-2 bg-white rounded-lg shadow-md">
              <Shield size={14} className="text-teal-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-teal-800">Informasi Penting</p>
              <p className="text-xs text-teal-700 mt-0.5 leading-relaxed">
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