// src/pages/peserta/LaporanAkhir.jsx
import React, { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  X,
  File,
  Trash2,
  Send,
  Edit3,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileCheck,
  Clock,
  Database,
  Info,
} from "lucide-react";
import { getLaporanAkhir, uploadLaporanAkhir, deleteLaporanAkhir } from "../../api/peserta/laporanAkhirService";

function LaporanAkhir() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [laporan, setLaporan] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadLaporanAkhir();
  }, []);

  const loadLaporanAkhir = async () => {
    setLoading(true);
    try {
      const response = await getLaporanAkhir();
      console.log("Laporan response:", response);
      if (response.success && response.data) {
        setLaporan(response.data);
        setJudul(response.data.judul || "");
        setDeskripsi(response.data.deskripsi || "");
      } else {
        setLaporan(null);
        setJudul("");
        setDeskripsi("");
      }
    } catch (err) {
      console.error("Error load laporan:", err);
      if (err.response?.status !== 404) {
        setErrorMessage("Gagal memuat data laporan");
      }
      setLaporan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    setFileError("");
    
    if (!file) return;
    
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setFileError("Format file harus PDF, DOC, atau DOCX");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setFileError("Ukuran file maksimal 10MB");
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError("");
  };

  const handleSubmit = async () => {
    if (!judul.trim()) {
      setErrorMessage("Judul laporan harus diisi");
      return;
    }
    
    if (!selectedFile && !laporan) {
      setErrorMessage("Silakan pilih file laporan");
      return;
    }
    
    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const formData = new FormData();
      formData.append("judul", judul);
      formData.append("deskripsi", deskripsi);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      
      const response = await uploadLaporanAkhir(formData);
      
      if (response.success) {
        setSuccessMessage("Laporan akhir berhasil diupload!");
        setSelectedFile(null);
        setIsEditing(false);
        await loadLaporanAkhir();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(response.message || "Gagal mengupload laporan");
      }
    } catch (err) {
      console.error("Error upload laporan:", err);
      setErrorMessage(err.response?.data?.message || "Terjadi kesalahan saat mengupload laporan");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLaporan = async () => {
    setShowDeleteConfirm(false);
    
    try {
      const response = await deleteLaporanAkhir();
      if (response.success) {
        setLaporan(null);
        setJudul("");
        setDeskripsi("");
        setSelectedFile(null);
        setSuccessMessage("Laporan berhasil dihapus");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(response.message || "Gagal menghapus laporan");
      }
    } catch (err) {
      console.error("Error delete laporan:", err);
      setErrorMessage("Gagal menghapus laporan");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setFileError("");
    if (laporan) {
      setJudul(laporan.judul || "");
      setDeskripsi(laporan.deskripsi || "");
    }
  };

  const openPreviewModal = () => {
    setShowPreviewModal(true);
    setIsFullscreen(false);
    window.dispatchEvent(new CustomEvent("preview-modal-open"));
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setIsFullscreen(false);
    window.dispatchEvent(new CustomEvent("preview-modal-close"));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownloadFile = async () => {
    if (!laporan?.file_url) return;
    
    try {
      const response = await fetch(laporan.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = laporan.file_name || "laporan_akhir.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      window.open(laporan.file_url, "_blank");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File size={24} />;
    const ext = fileName.split(".").pop().toLowerCase();
    if (ext === "pdf") return <FileText size={24} className="text-red-500" />;
    if (ext === "doc" || ext === "docx") return <FileText size={24} className="text-blue-500" />;
    return <File size={24} className="text-gray-500" />;
  };

  // Mendapatkan status dokumen
  const getDocumentStatus = () => {
    if (isEditing) return { text: "Memperbarui Dokumen", color: "bg-amber-500" };
    if (laporan) return { text: "Tersimpan", color: "bg-emerald-500" };
    return { text: "Belum Upload", color: "bg-slate-400" };
  };

  const status = getDocumentStatus();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  // TAMPILAN LAPORAN YANG SUDAH DIUPLO (MODE VIEW)
  if (laporan && !isEditing) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20 px-6 py-5 xl:px-10">
          <div className="w-full max-w-[1400px] mx-auto">
            {/* Hero Mini Gradient Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-5 mb-6 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FileCheck size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Laporan Akhir Magang</h1>
                    <p className="text-white/80 text-xs">Dokumen resmi penutupan kegiatan magang</p>
                  </div>
                </div>
                <div className={`${status.color} backdrop-blur-sm rounded-full px-3 py-1 shadow-sm`}>
                  <span className="text-xs text-white font-medium">{status.text}</span>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <p className="text-xs text-emerald-600">{successMessage}</p>
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500" />
                <p className="text-xs text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* Detail Laporan Card - Premium dengan Split Layout */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 xl:grid xl:grid-cols-3">
              <div className="relative h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 xl:hidden"></div>
              
              {/* Left Panel - Detail Laporan */}
              <div className="p-6 xl:col-span-2">
                {/* Header dengan status */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                      <CheckCircle size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Laporan Sudah Diupload</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(laporan.tanggal_upload || laporan.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Judul */}
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Judul Laporan</label>
                  <p className="text-lg font-semibold text-gray-800">{laporan.judul || "-"}</p>
                </div>

                {/* Deskripsi */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Deskripsi</label>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{laporan.deskripsi || "-"}</p>
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={handleEdit}
                    className="px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  >
                    <Edit3 size={14} />
                    Edit Laporan
                  </button>
                </div>
              </div>

              {/* Right Panel - File Info Sidebar */}
              <div className="xl:col-span-1 xl:border-l xl:border-slate-100 bg-slate-50/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={16} className="text-teal-500" />
                  <h3 className="text-sm font-semibold text-gray-700">File Laporan</h3>
                </div>
                
                <div className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                      {getFileIcon(laporan.file_name)}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 break-all">{laporan.file_name || "File Laporan"}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Database size={10} />
                        {formatFileSize(laporan.file_size)}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <FileText size={10} />
                        {laporan.file_name?.split('.').pop().toUpperCase() || 'PDF'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={openPreviewModal}
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Lihat PDF
                </button>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-t-2xl"></div>
                  <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                        <Trash2 size={20} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">Hapus Laporan</h3>
                        <p className="text-xs text-slate-400">Konfirmasi penghapusan laporan</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <p className="text-slate-700 font-semibold mb-1">
                      Apakah Anda yakin?
                    </p>
                    <p className="text-sm text-slate-500">
                      Laporan yang sudah dihapus tidak dapat dikembalikan.
                    </p>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteLaporan}
                    className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview PDF Modal */}
        {showPreviewModal && laporan && laporan.file_url && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[10000]"
            onClick={closePreviewModal}
          >
            <div
              className={`bg-white overflow-hidden flex flex-col transition-all duration-300 ${
                isFullscreen ? "w-screen h-screen rounded-none" : "w-[95vw] h-[90vh] rounded-2xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <FileText size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{laporan.judul || "Preview Laporan"}</p>
                    <p className="text-xs text-gray-400">{laporan.file_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 size={18} className="text-gray-500" /> : <Maximize2 size={18} className="text-gray-500" />}
                  </button>
                  <button
                    onClick={handleDownloadFile}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    title="Download"
                  >
                    <Download size={18} className="text-gray-500" />
                  </button>
                  <a
                    href={laporan.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    title="Buka di Tab Baru"
                  >
                    <ExternalLink size={18} className="text-gray-500" />
                  </a>
                  <button
                    onClick={closePreviewModal}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full overflow-hidden bg-slate-800">
                <iframe
                  src={`${laporan.file_url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                  className="w-full h-full border-0"
                  title="Preview PDF"
                  onError={() => console.error("Error loading PDF")}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // TAMPILAN FORM UPLOAD / EDIT
  // Mendapatkan status untuk mode edit/upload
  const editStatus = getDocumentStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20 px-6 py-5 xl:px-10">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Hero Mini Gradient Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-5 mb-6 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FileCheck size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {laporan ? "Edit Laporan Akhir Magang" : "Laporan Akhir Magang"}
                </h1>
                <p className="text-white/80 text-xs">
                  {laporan ? "Perbarui laporan akhir kegiatan magang Anda" : "Upload laporan akhir sebagai dokumen penutupan kegiatan magang"}
                </p>
              </div>
            </div>
            <div className={`${editStatus.color} backdrop-blur-sm rounded-full px-3 py-1 shadow-sm`}>
              <span className="text-xs text-white font-medium">{editStatus.text}</span>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-500" />
            <p className="text-xs text-emerald-600">{successMessage}</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle size={14} className="text-red-500" />
            <p className="text-xs text-red-600">{errorMessage}</p>
          </div>
        )}

        {/* Main Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="relative h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500"></div>
          
          <div className="p-6 space-y-5">
            {/* Judul */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Judul Laporan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Laporan Akhir Magang - Batch 1 2025"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Deskripsi <span className="text-xs text-gray-400">(opsional)</span>
              </label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={3}
                placeholder="Ringkasan kegiatan dan pencapaian selama magang..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition resize-none"
              />
            </div>

            {/* Drag & Drop Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                File Laporan {!laporan && <span className="text-red-500">*</span>}
                {laporan && <span className="text-xs text-gray-400 ml-2">(kosongkan jika tidak ingin mengganti file)</span>}
              </label>
              
              {/* PERINGATAN FILE AKAN DIGANTIKAN - UX ENTERPRISE */}
              {laporan && selectedFile && (
                <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                  <Info size={14} className="text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    File sebelumnya <span className="font-semibold">{laporan.file_name}</span> akan digantikan dengan file baru.
                  </p>
                </div>
              )}
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-teal-500 bg-teal-50"
                    : fileError
                    ? "border-red-300 bg-red-50/30"
                    : "border-slate-300 hover:border-teal-500 hover:bg-teal-50/30"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload size={48} className={`mx-auto mb-3 ${fileError ? "text-red-400" : "text-slate-400"}`} />
                <p className={`text-base font-medium ${fileError ? "text-red-500" : "text-gray-600"}`}>
                  {selectedFile ? selectedFile.name : (laporan ? "Klik atau tarik file baru untuk mengganti" : "Klik atau tarik file ke sini")}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  PDF, DOC, DOCX • Maksimal 10MB
                </p>
              </div>
              {laporan && !selectedFile && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <File size={12} />
                  File saat ini: <span className="font-medium">{laporan.file_name}</span>
                  <span className="text-gray-400 ml-2">({formatFileSize(laporan.file_size)})</span>
                </p>
              )}
              {fileError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {fileError}
                </p>
              )}
              {selectedFile && !fileError && (
                <div className="mt-3 p-3 bg-teal-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button onClick={removeFile} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 justify-end pt-3">
              {laporan && (
                <button
                  onClick={handleCancelEdit}
                  className="px-5 py-2 rounded-xl border border-slate-200 text-gray-600 text-sm font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    {laporan ? "Simpan Perubahan" : "Upload Laporan"}
                  </>
                )}
              </button>
            </div>

            {/* Petunjuk Ringkas */}
            <div className="pt-3 border-t border-slate-100">
              <ul className="text-xs text-slate-400 space-y-1">
                <li className="flex items-center gap-2">• Laporan akhir digunakan sebagai dokumen penutupan kegiatan magang</li>
                <li className="flex items-center gap-2">• File akan diarsipkan dan dapat dilihat oleh mentor untuk bahan penilaian akhir</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LaporanAkhir;