import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Video,
  File,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
  Calendar,
  Users,
  Tag,
  BookOpen,
  Shield,
  Lightbulb,
  ArrowRight,
  Save,
  Loader2,
  PartyPopper,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";

// Mapping ekstensi file ke kategori
const FILE_EXTENSION_TO_KATEGORI = {
  pdf: "PDF",
  mp4: "Video",
  mkv: "Video",
  mov: "Video",
  ppt: "Presentasi",
  pptx: "Presentasi",
  doc: "Dokumen",
  docx: "Dokumen",
};

const KATEGORI_CONFIG = {
  PDF: {
    icon: FileText,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    gradient: "from-red-500 to-red-600",
    label: "PDF",
  },
  Video: {
    icon: Video,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    gradient: "from-blue-500 to-blue-600",
    label: "Video",
  },
  Presentasi: {
    icon: File,
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    gradient: "from-orange-500 to-orange-600",
    label: "Presentasi",
  },
  Dokumen: {
    icon: FileText,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-emerald-600",
    label: "Dokumen",
  },
};

function AddMateri() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ 
    judul: "", 
    deskripsi: "", 
    divisi: "" 
  });
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [detectedKategori, setDetectedKategori] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [divisiList, setDivisiList] = useState([]);
  const [loadingDivisi, setLoadingDivisi] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    fetchDivisi();
  }, []);

  useEffect(() => {
    return () => { 
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl); 
    };
  }, [filePreviewUrl]);

  const fetchDivisi = async () => {
    setLoadingDivisi(true);
    try {
      const response = await axiosInstance.get("/divisi/aktif");
      
      let divisiData = [];
      if (response.data && response.data.success && response.data.data) {
        divisiData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        divisiData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        divisiData = response.data.data;
      }
      
      setDivisiList(divisiData);
    } catch (err) {
      console.error("Error fetching divisi:", err);
      setError("Gagal mengambil data divisi");
    } finally {
      setLoadingDivisi(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const detectKategoriFromFile = (fileName, fileType) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (FILE_EXTENSION_TO_KATEGORI[extension]) {
      return FILE_EXTENSION_TO_KATEGORI[extension];
    }
    
    if (fileType.includes("pdf")) return "PDF";
    if (fileType.includes("video")) return "Video";
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "Presentasi";
    if (fileType.includes("word") || fileType.includes("document")) return "Dokumen";
    
    return null;
  };

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("Ukuran file maksimal 50MB");
      e.target.value = "";
      return;
    }

    // Auto detect kategori dari file
    const kategori = detectKategoriFromFile(selectedFile.name, selectedFile.type);
    
    if (!kategori) {
      setError("Format file tidak dikenali. Silakan upload file PDF, MP4, PPT, PPTX, DOC, atau DOCX");
      e.target.value = "";
      return;
    }

    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    
    if (selectedFile.type === "application/pdf" || selectedFile.type.includes("video")) {
      setFilePreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFilePreviewUrl(null);
    }

    setError(null);
    setFile(selectedFile);
    setDetectedKategori(kategori);
    setFileInfo({
      name: selectedFile.name,
      size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
      type: selectedFile.type,
      kategori: kategori,
    });
    
    e.target.value = "";
  };

  const removeFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFile(null);
    setFileInfo(null);
    setFilePreviewUrl(null);
    setDetectedKategori(null);
  };

  const getFileIcon = () => {
    if (!detectedKategori) return { icon: File, color: "text-slate-500", bg: "bg-slate-50", label: "File" };
    const config = KATEGORI_CONFIG[detectedKategori];
    return {
      icon: config.icon,
      color: config.color,
      bg: config.bg,
      label: config.label,
      border: config.border,
      gradient: config.gradient,
    };
  };

  const handleSubmit = async () => {
    if (!form.judul.trim()) { 
      setError("Judul materi wajib diisi"); 
      return; 
    }
    if (!form.divisi) { 
      setError("Divisi wajib dipilih"); 
      return; 
    }
    if (!file) { 
      setError("File materi wajib diunggah"); 
      return; 
    }
    if (!detectedKategori) {
      setError("Kategori file tidak terdeteksi. Silakan upload file yang valid");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("judul", form.judul.trim());
      formData.append("deskripsi", form.deskripsi || "");
      formData.append("divisi", form.divisi);
      formData.append("kategori", detectedKategori);
      formData.append("file", file);

      const response = await axiosInstance.post("/materi-pelatihan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.data && response.data.success) {
        setSuccessData({
          judul: form.judul.trim(),
          divisi: form.divisi,
          kategori: detectedKategori,
          file_name: file.name,
        });
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setForm({ judul: "", deskripsi: "", divisi: "" });
          removeFile();
        }, 100);
      } else {
        setError(response.data?.message || "Gagal menambahkan materi");
      }
    } catch (err) {
      console.error("Error adding materi:", err);
      setError(err.response?.data?.message || err.message || "Terjadi kesalahan saat menambahkan materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToMateri = () => {
    setShowSuccessModal(false);
    navigate("/coo/materi");
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    setForm({ judul: "", deskripsi: "", divisi: "" });
    removeFile();
  };

  const getDivisiName = (divisiValue) => {
    if (!divisiValue) return "";
    const divisi = divisiList.find(d => d.id_divisi == divisiValue || d.nama_divisi === divisiValue);
    return divisi ? (divisi.nama_divisi || divisi) : divisiValue;
  };

  const fileIconData = getFileIcon();
  const FileIconComponent = fileIconData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Tambah Materi Baru
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                Unggah file, sistem akan otomatis mendeteksi kategori
              </p>
            </div>
          </div>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X size={16} />
            </button>
          </div>
        )}

        {/* FORM - Layout 2 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT PANEL - Metadata */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Informasi Materi</h3>
                  <p className="text-xs text-slate-400">Isi detail materi pelatihan</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Judul Materi <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="judul"
                    placeholder="Contoh: Pengenalan Budaya Perusahaan"
                    value={form.judul}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Deskripsi Materi
                  </label>
                  <textarea
                    name="deskripsi"
                    placeholder="Jelaskan secara singkat tentang materi ini..."
                    value={form.deskripsi}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Divisi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="divisi"
                      value={form.divisi}
                      onChange={handleChange}
                      disabled={loadingDivisi}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white disabled:opacity-60"
                    >
                      <option value="">
                        {loadingDivisi ? "Memuat divisi..." : "Pilih Divisi"}
                      </option>
                      {!loadingDivisi && divisiList.map((divisi) => (
                        <option key={divisi.id_divisi} value={divisi.nama_divisi}>
                          {divisi.nama_divisi}
                        </option>
                      ))}
                    </select>
                    {loadingDivisi && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={14} className="animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>
                  {!loadingDivisi && divisiList.length === 0 && (
                    <p className="mt-1.5 text-[10px] text-amber-600 flex items-center gap-1">
                      <AlertCircle size={10} />
                      <span>Tidak ada divisi aktif</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - File Upload */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-md">
                  <UploadCloud className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Unggah File</h3>
                  <p className="text-xs text-slate-400">
                    Maksimal 50MB • PDF, MP4, PPT, DOC
                  </p>
                </div>
              </div>

              {!fileInfo ? (
                <label className="group block border-2 border-dashed border-slate-200 rounded-xl p-10 transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50/30">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFile}
                    accept=".pdf,.mp4,.ppt,.pptx,.doc,.docx"
                  />
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="text-blue-500" size={32} />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Klik atau seret file ke sini</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, MP4, PPT, DOC, DOCX</p>
                    <div className="flex gap-2 mt-3 flex-wrap justify-center">
                      <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full">PDF</span>
                      <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full">MP4</span>
                      <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full">PPT</span>
                      <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full">DOC</span>
                    </div>
                  </div>
                </label>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-600">File Terunggah</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${fileIconData.bg} ${fileIconData.color}`}>
                      {fileIconData.label} Terdeteksi
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-3 ${fileIconData.bg} rounded-xl border ${fileIconData.border}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${fileIconData.bg} rounded-xl flex items-center justify-center`}>
                        {FileIconComponent && <FileIconComponent size={18} className={fileIconData.color} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{fileInfo.name}</p>
                        <p className="text-[10px] text-slate-400">{fileInfo.size}</p>
                      </div>
                    </div>
                    <button onClick={removeFile} className="p-1.5 hover:bg-red-100 rounded-lg transition">
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>

                  {filePreviewUrl && (
                    <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <span className="text-xs font-medium text-slate-600">Preview File</span>
                      </div>
                      <div className="bg-white" style={{ height: 300 }}>
                        {fileInfo.type === "application/pdf" ? (
                          <iframe src={filePreviewUrl} className="w-full h-full" title="PDF Preview" />
                        ) : fileInfo.type.includes("video") ? (
                          <video src={filePreviewUrl} controls className="w-full h-full" />
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={() => navigate("/coo/materi")}
            className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !form.judul || !file || !form.divisi}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting
              ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
              : <><Save size={16} /> Terbitkan Materi <ArrowRight size={14} /></>
            }
          </button>
        </div>

        {/* PREVIEW STRIP */}
        {(form.judul || fileInfo) && (
          <div className="mt-6 p-4 bg-slate-50/50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} className="text-emerald-500" />
              <span className="text-xs font-medium text-slate-600">Ringkasan Materi</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {form.judul || "Judul akan muncul di sini"}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {getDivisiName(form.divisi) || "Divisi"}
              </span>
              {detectedKategori && (
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  {detectedKategori}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date().toLocaleDateString("id-ID")}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 text-center">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <PartyPopper className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white text-xl font-bold">Materi Berhasil Ditambahkan!</h3>
                <p className="text-emerald-100 text-sm mt-1">Materi telah diterbitkan</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className={`${KATEGORI_CONFIG[successData.kategori]?.bg || 'bg-emerald-50'} rounded-xl p-4 mb-5`}>
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 ${KATEGORI_CONFIG[successData.kategori]?.bg || 'bg-emerald-100'} rounded-lg`}>
                    <CheckCircle className={`w-4 h-4 ${KATEGORI_CONFIG[successData.kategori]?.color || 'text-emerald-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">Detail Materi</p>
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Judul:</span> {successData.judul}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Divisi:</span> {successData.divisi}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Kategori:</span> {successData.kategori}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleAddAnother}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
                >
                  + Tambah Lagi
                </button>
                <button
                  onClick={handleGoToMateri}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} />
                  Lihat Materi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in { animation: fadeIn 0.2s ease-out; }
        .zoom-in { animation: zoomIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default AddMateri;