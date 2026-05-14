// src/pages/mentor/EditMateri.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
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
import { getMentorMateriById, updateMentorMateri } from "../../api/mentor/materiMentorService";

function EditMateri() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formDataState, setFormDataState] = useState({
    judul: "",
    deskripsi: "",
    tipe_materi: "dokumen",
    file_materi: null,
    link: "",
  });
  const [errors, setErrors] = useState({});
  const [oldFile, setOldFile] = useState(null);
  const [oldFileName, setOldFileName] = useState("");

  // Fetch materi data
  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const response = await getMentorMateriById(id);
        console.log("Materi detail:", response);
        if (response && response.success && response.data) {
          const data = response.data;
          setFormDataState({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            tipe_materi: data.tipe_materi || "dokumen",
            file_materi: null,
            link: data.link || "",
          });
          if (data.file_url) {
            setOldFile(data.file_url);
            setOldFileName(data.file_url.split('/').pop());
          }
          if (data.tipe_materi === "video" && data.file_url) {
            setFilePreview(data.file_url);
          }
        } else {
          setError(response?.message || "Gagal mengambil data materi");
        }
      } catch (err) {
        console.error("Error fetching materi:", err);
        setError("Terjadi kesalahan saat mengambil data");
      } finally {
        setFetching(false);
      }
    };
    fetchMateri();
  }, [id]);

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
      if (filePreview && !filePreview.startsWith('http')) {
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
    
    if (formDataState.tipe_materi === "dokumen" && !formDataState.file_materi && !oldFile) {
      newErrors.file_materi = "File wajib diupload";
    }
    if (formDataState.tipe_materi === "video" && !formDataState.file_materi && !oldFile) {
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
    if (filePreview && !filePreview.startsWith('http')) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    
    // Tambahkan _method PUT jika diperlukan (sudah ditangani di service)
    // service sudah menambahkan _method PUT
    
    console.log("Submitting update for materi ID:", id);
    console.log("Data:", {
      judul: formDataState.judul,
      deskripsi: formDataState.deskripsi,
      tipe_materi: formDataState.tipe_materi,
      hasFile: !!formDataState.file_materi,
      hasLink: !!formDataState.link
    });
    
    const response = await updateMentorMateri(id, submitData);
    
    if (response && response.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/mentor/materi");
      }, 1500);
    } else {
      setError(response?.message || "Gagal mengupdate materi");
      if (response?.errors) {
        setErrors(response.errors);
      }
    }
  } catch (err) {
    console.error("Error updating materi:", err);
    
    if (err.response?.status === 405) {
      setError("Method tidak diizinkan. Silahkan coba lagi.");
    } else if (err.response?.status === 422) {
      const errors = err.response.data?.errors;
      if (errors) {
        const errorMessages = Object.values(errors).flat();
        setError(errorMessages.join(", "));
      } else {
        setError(err.response.data?.message || "Validasi gagal");
      }
    } else if (err.response?.status === 404) {
      setError("Materi tidak ditemukan");
    } else {
      setError(err.response?.data?.message || err.message || "Terjadi kesalahan saat mengupdate materi");
    }
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
    setOldFile(null);
    setOldFileName("");
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

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin relative" />
        </div>
        <p className="text-slate-500 mt-6 text-sm font-medium ml-3">Memuat data materi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1000px] mx-auto">
        
        <div className="mb-8">
          <Link to="/mentor/materi" className="group inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-all duration-300 mb-4">
            <div className="p-1 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm group-hover:bg-teal-50 transition-colors">
              <ArrowLeft size={14} />
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
                    Edit Materi
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">Edit materi pembelajaran untuk peserta bimbingan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50/90 to-rose-50/90 backdrop-blur-sm border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
                <AlertCircle size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-800">Gagal mengupdate materi!</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 backdrop-blur-sm border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                <CheckCircle size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">Materi berhasil diupdate!</p>
                <p className="text-xs text-emerald-600">Materi akan segera update</p>
              </div>
            </div>
          </div>
        )}

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
                  {formDataState.tipe_materi === "video" ? "Upload File Video" : "Upload File"}
                </label>
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  errors.file_materi 
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
                  {(formDataState.file_materi || oldFile) && (
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
                            <p className="text-sm font-semibold text-slate-700">
                              {formDataState.file_materi ? formDataState.file_materi.name : oldFileName}
                            </p>
                            {formDataState.file_materi && (
                              <p className="text-xs text-slate-500">{(formDataState.file_materi.size / 1024 / 1024).toFixed(2)} MB</p>
                            )}
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
                      {formDataState.tipe_materi === "video" && filePreview && !filePreview.startsWith('http') && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                          <video controls className="w-full max-h-64">
                            <source src={filePreview} type={formDataState.file_materi?.type} />
                            Browser Anda tidak mendukung video tag.
                          </video>
                        </div>
                      )}
                      {formDataState.tipe_materi === "video" && filePreview && filePreview.startsWith('http') && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                          <video controls className="w-full max-h-64">
                            <source src={filePreview} />
                            Browser Anda tidak mendukung video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  )}
                  {!formDataState.file_materi && !oldFile && (
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
                {errors.file_materi && <p className="text-xs text-red-500 mt-2">{errors.file_materi}</p>}
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
                Batal
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? "Menyimpan..." : "Update Materi"}
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

export default EditMateri;