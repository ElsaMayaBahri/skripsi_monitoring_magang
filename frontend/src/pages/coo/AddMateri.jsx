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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

// Mapping kategori ke konfigurasi file yang diizinkan
const KATEGORI_FILE_CONFIG = {
  PDF: {
    accept: ".pdf",
    mimeTypes: ["application/pdf"],
    label: "PDF",
    description: "Hanya file PDF yang diizinkan",
  },
  Video: {
    accept: ".mp4",
    mimeTypes: ["video/mp4"],
    label: "MP4",
    description: "Hanya file video MP4 yang diizinkan",
  },
  Presentasi: {
    accept: ".ppt,.pptx",
    mimeTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    label: "PPT / PPTX",
    description: "Hanya file presentasi PPT/PPTX yang diizinkan",
  },
  Dokumen: {
    accept: ".doc,.docx",
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    label: "DOC / DOCX",
    description: "Hanya file dokumen DOC/DOCX yang diizinkan",
  },
};

function AddMateri() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ 
    judul: "", 
    deskripsi: "", 
    divisi: "", 
    kategori: "" 
  });
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [divisiList, setDivisiList] = useState([]);
  const [loadingDivisi, setLoadingDivisi] = useState(false);

  useEffect(() => { 
    fetchDivisi(); 
  }, []);

  useEffect(() => {
    return () => { 
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl); 
    };
  }, [filePreviewUrl]);

  // Saat kategori berubah, hapus file yang sudah terunggah
  useEffect(() => {
    if (file) {
      removeFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.kategori]);

  const fetchDivisi = async () => {
    setLoadingDivisi(true);
    try {
      const response = await api.getDivisi();
      
      let divisiData = [];
      if (response.success && response.data) {
        divisiData = response.data;
      } else if (Array.isArray(response)) {
        divisiData = response;
      } else if (response.data && Array.isArray(response.data)) {
        divisiData = response.data;
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

  const activeConfig = form.kategori ? KATEGORI_FILE_CONFIG[form.kategori] : null;
  const acceptAttr = activeConfig ? activeConfig.accept : "";

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!form.kategori) {
      setError("Silakan pilih kategori terlebih dahulu sebelum mengunggah file");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("Ukuran file maksimal 50MB");
      e.target.value = "";
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = {
      PDF: ['pdf'],
      Video: ['mp4'],
      Presentasi: ['ppt', 'pptx'],
      Dokumen: ['doc', 'docx']
    };
    
    const currentAllowed = allowedExtensions[form.kategori];
    if (!currentAllowed || !currentAllowed.includes(fileExtension)) {
      setError(`Kategori "${form.kategori}" hanya menerima file ${activeConfig?.label}. Silakan pilih file yang sesuai.`);
      e.target.value = "";
      return;
    }

    if (activeConfig && !activeConfig.mimeTypes.includes(selectedFile.type)) {
      setError(`Format file tidak sesuai dengan kategori "${form.kategori}". Harus ${activeConfig.label}`);
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
    setFileInfo({
      name: selectedFile.name,
      size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
      type: selectedFile.type,
    });
    
    e.target.value = "";
  };

  const removeFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFile(null);
    setFileInfo(null);
    setFilePreviewUrl(null);
  };

  const getFileIcon = (type) => {
    if (!type) return { icon: File, color: "text-slate-500", bg: "bg-slate-50" };
    if (type.includes("pdf")) return { icon: FileText, color: "text-red-500", bg: "bg-red-50" };
    if (type.includes("video")) return { icon: Video, color: "text-blue-500", bg: "bg-blue-50" };
    if (type.includes("powerpoint") || type.includes("presentation"))
      return { icon: File, color: "text-orange-500", bg: "bg-orange-50" };
    return { icon: File, color: "text-emerald-500", bg: "bg-emerald-50" };
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
    if (!form.kategori) { 
      setError("Kategori wajib dipilih"); 
      return; 
    }
    if (!file) { 
      setError("File materi wajib diunggah"); 
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
      formData.append("kategori", form.kategori);
      formData.append("file", file);

      const response = await api.addMateri(formData);
      
      if (response.success) {
        setSuccess("Materi berhasil ditambahkan! Mengalihkan...");
        setTimeout(() => {
          navigate("/coo/materi");
        }, 1500);
      } else {
        setError(response.message || "Gagal menambahkan materi");
      }
    } catch (err) {
      console.error("Error adding materi:", err);
      setError(err.response?.data?.message || err.message || "Terjadi kesalahan saat menambahkan materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileIconData = fileInfo ? getFileIcon(fileInfo.type) : null;
  const FileIconComponent = fileIconData?.icon;

  const getDivisiName = (divisiValue) => {
    if (!divisiValue) return "";
    const divisi = divisiList.find(d => d.id_divisi == divisiValue || d.nama_divisi === divisiValue);
    return divisi ? (divisi.nama_divisi || divisi) : divisiValue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">

        {/* HEADER */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                Lengkapi detail informasi dan unggah berkas materi
              </p>
            </div>
          </div>
          {/* Tombol Kembali Premium */}
          <button
            onClick={() => navigate("/coo/materi")}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali</span>
          </button>
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

        {/* SUCCESS ALERT */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800">Berhasil!</p>
              <p className="text-xs text-emerald-600 mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* FORM - Layout 2 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT PANEL - Metadata */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
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

                  <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Kategori <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="kategori"
                        value={form.kategori}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
                      >
                        <option value="">Pilih Kategori</option>
                        <option value="PDF">PDF</option>
                        <option value="Video">Video</option>
                        <option value="Presentasi">Presentasi</option>
                        <option value="Dokumen">Dokumen</option>
                      </select>

                      {!form.kategori && (
                        <p className="mt-1.5 text-[10px] text-blue-600 flex items-center gap-1">
                          <AlertCircle size={10} className="text-blue-500" />
                          <span>Pilih kategori sebelum mengunggah file</span>
                        </p>
                      )}

                      {activeConfig && (
                        <p className="mt-1.5 text-[10px] text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={10} className="text-emerald-500" />
                          Menerima: <span className="font-semibold">{activeConfig.label}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informasi Penting Card - di kiri bawah */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-800">Informasi Penting</p>
                  <div className="mt-1.5 space-y-1">
                    <p className="text-[11px] text-blue-700 flex items-start gap-1.5">
                      <span className="text-blue-500">•</span>
                      Pilih kategori terlebih dahulu sebelum mengunggah file
                    </p>
                    <p className="text-[11px] text-blue-700 flex items-start gap-1.5">
                      <span className="text-blue-500">•</span>
                      Setelah diterbitkan, materi akan langsung tersedia untuk semua peserta
                    </p>
                    <p className="text-[11px] text-blue-700 flex items-start gap-1.5">
                      <span className="text-blue-500">•</span>
                      Pastikan semua data sudah benar sebelum menerbitkan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - File Upload + Tips */}
          <div className="space-y-6">
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
                      Maksimal 50MB •{" "}
                      {activeConfig
                        ? activeConfig.description
                        : "Pilih kategori terlebih dahulu"}
                    </p>
                  </div>
                </div>

                {!fileInfo ? (
                  <label
                    className={`group block border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                      !form.kategori
                        ? 'border-slate-200 bg-slate-50/20 cursor-not-allowed opacity-60'
                        : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                    }`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFile}
                      accept={acceptAttr}
                      disabled={!form.kategori}
                    />
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform ${
                        !form.kategori 
                          ? 'bg-slate-100' 
                          : 'bg-blue-50 group-hover:scale-110'
                      }`}>
                        <UploadCloud className={`${!form.kategori ? 'text-slate-400' : 'text-blue-500'}`} size={32} />
                      </div>
                      
                      {!form.kategori ? (
                        <>
                          <p className="text-sm font-medium text-slate-500">Pilih kategori terlebih dahulu</p>
                          <p className="text-xs text-slate-400 mt-1">Kategori wajib dipilih sebelum mengunggah file</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-700">Seret & letakkan file di sini</p>
                          <p className="text-xs text-blue-500 mt-1">Atau klik untuk memilih dari komputer</p>
                        </>
                      )}

                      <div className="flex gap-2 mt-3 flex-wrap justify-center">
                        {activeConfig ? (
                          <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-600 rounded-full font-medium">
                            {activeConfig.label}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded-full font-medium">
                            Pilih kategori dulu
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-slate-600">File Terunggah</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">1 file</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${fileIconData?.bg} rounded-xl flex items-center justify-center`}>
                          {FileIconComponent && <FileIconComponent size={18} className={fileIconData?.color} />}
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

            {/* Tips Card - di kanan bawah (sejajar dengan Informasi Penting) */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-800">Tips Membuat Materi Berkualitas</p>
                  <div className="mt-1.5 space-y-1">
                    <p className="text-[11px] text-emerald-700 flex items-start gap-1.5">
                      <span className="text-emerald-500">•</span>
                      Gunakan judul yang jelas dan mudah dipahami
                    </p>
                    <p className="text-[11px] text-emerald-700 flex items-start gap-1.5">
                      <span className="text-emerald-500">•</span>
                      Pastikan file yang diunggah sesuai dengan kategori yang dipilih
                    </p>
                    <p className="text-[11px] text-emerald-700 flex items-start gap-1.5">
                      <span className="text-emerald-500">•</span>
                      Deskripsikan materi dengan detail agar mudah dipahami
                    </p>
                  </div>
                </div>
              </div>
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
            disabled={isSubmitting || !form.judul || !file || !form.divisi || !form.kategori}
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
              <span className="text-xs font-medium text-slate-600">Preview Materi</span>
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
              <span className="flex items-center gap-1">
                <Tag size={12} />
                {form.kategori || "Kategori"}
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
  );
}

export default AddMateri;