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
  PPT: {
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
    kategori: "",
  });
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
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

  // Saat kategori berubah, hapus file yang sudah terunggah
  useEffect(() => {
    if (file) {
      removeFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.kategori]);

  // Fungsi fetch divisi - HANYA AMBIL DIVISI AKTIF
  const fetchDivisi = async () => {
    setLoadingDivisi(true);
    try {
      const response = await axiosInstance.get("/divisi/aktif");

      let divisiData = [];
      if (response.data && response.data.success && response.data.data) {
        divisiData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        divisiData = response.data;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
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

  const activeConfig = form.kategori
    ? KATEGORI_FILE_CONFIG[form.kategori]
    : null;
  const acceptAttr = activeConfig ? activeConfig.accept : "";

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!form.kategori) {
      setError(
        "Silakan pilih kategori terlebih dahulu sebelum mengunggah file",
      );
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("Ukuran file maksimal 50MB");
      e.target.value = "";
      return;
    }

    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = {
      PDF: ["pdf"],
      Video: ["mp4"],
      PPT: ["ppt", "pptx"],
      Dokumen: ["doc", "docx"],
    };

    const currentAllowed = allowedExtensions[form.kategori];
    if (!currentAllowed || !currentAllowed.includes(fileExtension)) {
      setError(
        `Kategori "${form.kategori}" hanya menerima file ${activeConfig?.label}. Silakan pilih file yang sesuai.`,
      );
      e.target.value = "";
      return;
    }

    if (activeConfig && !activeConfig.mimeTypes.includes(selectedFile.type)) {
      setError(
        `Format file tidak sesuai dengan kategori "${form.kategori}". Harus ${activeConfig.label}`,
      );
      e.target.value = "";
      return;
    }

    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);

    if (
      selectedFile.type === "application/pdf" ||
      selectedFile.type.includes("video")
    ) {
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
    if (!type)
      return { icon: File, color: "text-slate-500", bg: "bg-slate-50" };
    if (type.includes("pdf"))
      return { icon: FileText, color: "text-red-500", bg: "bg-red-50" };
    if (type.includes("video"))
      return { icon: Video, color: "text-blue-500", bg: "bg-blue-50" };
    if (type.includes("powerpoint") || type.includes("presentation"))
      return { icon: File, color: "text-orange-500", bg: "bg-orange-50" };
    if (type.includes("word") || type.includes("document"))
      return { icon: File, color: "text-indigo-500", bg: "bg-indigo-50" };
    return { icon: File, color: "text-emerald-500", bg: "bg-emerald-50" };
  };

  // Fungsi submit menggunakan axiosInstance
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
      // urutan tidak dikirim, backend akan mengatur otomatis

      console.log("Submitting data:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await axiosInstance.post("/materi-pelatihan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);

      if (response.data && response.data.success) {
        setSuccessData({
          judul: form.judul.trim(),
          divisi: form.divisi,
          kategori: form.kategori,
          file_name: file.name,
        });
        setShowSuccessModal(true);

        setTimeout(() => {
          setForm({ judul: "", deskripsi: "", divisi: "", kategori: "" });
          removeFile();
        }, 100);
      } else {
        setError(response.data?.message || "Gagal menambahkan materi");
      }
    } catch (err) {
      console.error("Error adding materi:", err);
      
      // TAMPILKAN DETAIL ERROR DARI BACKEND
      if (err.response) {
        console.log("Response data (full):", err.response.data);
        console.log("Response status:", err.response.status);
        
        if (err.response.status === 422 && err.response.data) {
          const errorData = err.response.data;
          
          // Coba berbagai format error
          let errorMessage = "";
          if (errorData.errors) {
            // Format Laravel validation errors
            errorMessage = Object.values(errorData.errors).flat().join(", ");
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else {
            errorMessage = JSON.stringify(errorData);
          }
          
          setError(`Validasi gagal: ${errorMessage}`);
          return;
        }
      }
      
      setError(
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat menambahkan materi",
      );
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
    setForm({ judul: "", deskripsi: "", divisi: "", kategori: "" });
    removeFile();
  };

  const fileIconData = fileInfo ? getFileIcon(fileInfo.type) : null;
  const FileIconComponent = fileIconData?.icon;

  // Supported format list
  const supportedFormats = ["PDF", "Video", "PPT", "DOCX"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
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
                Lengkapi detail informasi dan unggah berkas materi
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
              <p className="text-xs text-red-600 whitespace-pre-wrap break-words mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* FORM - Layout 2 Kolom seimbang */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* LEFT PANEL - Metadata */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    Detail Metadata
                  </h3>
                  <p className="text-xs text-slate-400">
                    Informasi dasar materi pelatihan
                  </p>
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
                          {loadingDivisi
                            ? "Memuat divisi..."
                            : "Pilih Divisi"}
                        </option>
                        {!loadingDivisi &&
                          divisiList.map((divisi) => (
                            <option
                              key={divisi.id_divisi}
                              value={divisi.nama_divisi}
                            >
                              {divisi.nama_divisi}
                            </option>
                          ))}
                      </select>
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
                      <option value="PPT">PPT</option>
                      <option value="Dokumen">Dokumen</option>
                    </select>

                    {activeConfig && (
                      <p className="mt-1.5 text-[10px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle size={10} className="text-emerald-500" />
                        Menerima:{" "}
                        <span className="font-semibold">
                          {activeConfig.label}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - File Upload */}
          <div className="h-full">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="p-5 h-full flex flex-col">
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
                  <div className="flex-1 flex flex-col">
                    <label
                      className={`group flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer min-h-[260px] ${
                        !form.kategori
                          ? "border-slate-200 bg-slate-50/20 cursor-not-allowed opacity-60"
                          : "border-slate-200 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-slate-50/50"
                      }`}
                    >
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFile}
                        accept={acceptAttr}
                        disabled={!form.kategori}
                      />
                      <div className="text-center">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform ${
                            !form.kategori
                              ? "bg-slate-100"
                              : "bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:scale-110"
                          }`}
                        >
                          <UploadCloud
                            className={`${!form.kategori ? "text-slate-400" : "text-blue-500"}`}
                            size={32}
                          />
                        </div>

                        {!form.kategori ? (
                          <>
                            <p className="text-sm font-medium text-slate-500">
                              Pilih kategori terlebih dahulu
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Kategori wajib dipilih sebelum mengunggah file
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-slate-700">
                              Klik atau seret file ke sini
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                              {activeConfig?.label} • Maks. 50MB
                            </p>
                          </>
                        )}

                        <div className="flex flex-wrap gap-2 mt-3 justify-center">
                          {supportedFormats.map((format) => (
                            <span
                              key={format}
                              className="text-[9px] px-2 py-1 bg-slate-100 text-slate-500 rounded-full font-medium"
                            >
                              {format}
                            </span>
                          ))}
                        </div>

                        {activeConfig && (
                          <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-500">
                              <span className="font-semibold">Informasi:</span>{" "}
                              {activeConfig.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-slate-600">
                        File Terunggah
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        1 file
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${fileIconData?.bg} rounded-xl flex items-center justify-center`}
                        >
                          {FileIconComponent && (
                            <FileIconComponent
                              size={18}
                              className={fileIconData?.color}
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {fileInfo.name.length > 25
                              ? fileInfo.name.substring(0, 25) + "..."
                              : fileInfo.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {fileInfo.size}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition"
                      >
                        <X size={14} className="text-red-500" />
                      </button>
                    </div>

                    {filePreviewUrl && (
                      <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200">
                          <span className="text-xs font-medium text-slate-600">
                            Preview File
                          </span>
                        </div>
                        <div className="bg-white" style={{ height: 220 }}>
                          {fileInfo.type === "application/pdf" ? (
                            <iframe
                              src={filePreviewUrl}
                              className="w-full h-full"
                              title="PDF Preview"
                            />
                          ) : fileInfo.type.includes("video") ? (
                            <video
                              src={filePreviewUrl}
                              controls
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                              <div className="text-center">
                                <FileIconComponent
                                  size={40}
                                  className={`${fileIconData?.color} mx-auto mb-2`}
                                />
                                <p className="text-xs text-slate-500">
                                  Preview tidak tersedia
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
            disabled={
              isSubmitting ||
              !form.judul ||
              !file ||
              !form.divisi ||
              !form.kategori
            }
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <Save size={16} /> Terbitkan Materi <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
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
                <h3 className="text-white text-xl font-bold">
                  Materi Berhasil Ditambahkan!
                </h3>
                <p className="text-emerald-100 text-sm mt-1">
                  Materi telah diterbitkan dan tersedia untuk peserta
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-emerald-50 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-800">
                      Detail Materi
                    </p>
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs text-emerald-700">
                        <span className="font-medium">Judul:</span>{" "}
                        {successData.judul}
                      </p>
                      <p className="text-xs text-emerald-700">
                        <span className="font-medium">Divisi:</span>{" "}
                        {successData.divisi}
                      </p>
                      <p className="text-xs text-emerald-700">
                        <span className="font-medium">Kategori:</span>{" "}
                        {successData.kategori}
                      </p>
                      <p className="text-xs text-emerald-700">
                        <span className="font-medium">File:</span>{" "}
                        {successData.file_name}
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