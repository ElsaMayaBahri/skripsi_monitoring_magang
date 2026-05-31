// src/pages/peserta/DetailTugas.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Upload,
  Download,
  MessageSquare,
  ChevronLeft,
  Loader2,
  Link as LinkIcon,
  Send,
  ExternalLink,
  Flag,
  Target,
  XCircle,
  Timer,
  AlertTriangle,
  Trash2,
  X,
  Paperclip,
} from "lucide-react";
import { 
  getPesertaTugasById, 
  submitPesertaTugas, 
  cancelPesertaTugas 
} from "../../api/peserta/tugasService";

function DetailTugas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tugas, setTugas] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadTugasDetail();
  }, [id]);

  // Countdown timer effect
  useEffect(() => {
    if (!tugas || tugas?.status === "selesai") return;

    const calculateTimeLeft = () => {
      if (!tugas?.deadline) {
        return { isLate: false, text: "No deadline", hours: 0 };
      }
      
      const now = new Date();
      const deadlineDate = new Date(tugas.deadline);
      
      if (isNaN(deadlineDate.getTime())) {
        return { isLate: false, text: "Invalid deadline", hours: 0 };
      }
      
      const diffMs = deadlineDate - now;

      if (diffMs <= 0) {
        const lateMs = Math.abs(diffMs);
        const lateDays = Math.floor(lateMs / (1000 * 60 * 60 * 24));
        const lateHours = Math.floor(
          (lateMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );

        if (lateDays > 0) {
          return {
            isLate: true,
            text: `Terlambat ${lateDays} hari ${lateHours} jam`,
            hours: lateDays * 24 + lateHours,
          };
        } else if (lateHours > 0) {
          return {
            isLate: true,
            text: `Terlambat ${lateHours} jam`,
            hours: lateHours,
          };
        } else {
          return { isLate: true, text: `Terlambat < 1 jam`, hours: 0 };
        }
      } else {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );

        if (days > 0) {
          return {
            isLate: false,
            text: `${days} hari ${hours} jam`,
            hours: days * 24 + hours,
          };
        } else if (hours > 0) {
          return { isLate: false, text: `${hours} jam`, hours: hours };
        } else {
          const minutes = Math.floor(diffMs / (1000 * 60));
          return { isLate: false, text: `${minutes} menit`, hours: 0 };
        }
      }
    };

    const updateTimer = () => {
      const result = calculateTimeLeft();
      setTimeLeft(result);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [tugas]);

  const loadTugasDetail = async () => {
    setLoading(true);
    try {
      const result = await getPesertaTugasById(id);
      console.log("Detail tugas result:", result);

      if (result.success) {
        setTugas(result.data);
      } else {
        console.error("Gagal memuat detail tugas:", result.message);
        alert("Gagal memuat detail tugas: " + result.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan saat memuat detail tugas");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10 MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  // 🔥 PERBAIKAN: Submit bisa file, link, atau keduanya
  const handleSubmit = async () => {
    // Validasi: minimal satu yang diisi (file atau link)
    if (!selectedFile && !submissionLink.trim()) {
      alert("Silakan upload file atau masukkan link tugas");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();

      // Kirim file jika ada
      if (selectedFile) {
        formData.append("file_jawaban", selectedFile);
      }
      
      // Kirim link jika ada
      if (submissionLink.trim()) {
        formData.append("link_jawaban", submissionLink.trim());
      }

      const result = await submitPesertaTugas(id, formData);
      console.log("Submit result:", result);

      if (result.success) {
        setTugas((prev) => ({
          ...prev,
          status: result.data?.status || "dikumpulkan",
          submitted_at: result.data?.submitted_at || new Date().toISOString(),
          file_url: result.data?.file_url || null,
          file_name: result.data?.file_name || null,
          submission_link: result.data?.submission_link || null,
        }));
        setUploadSuccess(true);
        setSelectedFile(null);
        setSubmissionLink("");
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        alert("Gagal mengumpulkan tugas: " + result.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Terjadi kesalahan saat mengumpulkan tugas");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelSubmission = async () => {
    setCancelling(true);
    try {
      const result = await cancelPesertaTugas(id);
      console.log("Cancel result:", result);

      if (result.success) {
        setTugas((prev) => ({
          ...prev,
          status: "belum_dikumpulkan",
          submitted_at: null,
          file_url: null,
          file_name: null,
          submission_link: null,
        }));
        setShowCancelModal(false);
        setCancelSuccess(true);
        setTimeout(() => setCancelSuccess(false), 3000);
      } else {
        alert("Gagal membatalkan: " + result.message);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Terjadi kesalahan");
    } finally {
      setCancelling(false);
    }
  };

  const getDeadlineColor = () => {
    if (!tugas || !tugas.deadline) return "text-gray-500";
    const now = new Date();
    const deadlineDate = new Date(tugas.deadline);
    
    if (isNaN(deadlineDate.getTime())) return "text-gray-500";
    
    const isLate = now > deadlineDate;
    if (isLate) return "text-red-600";
    const diffMs = deadlineDate - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours <= 24) return "text-red-500";
    if (diffHours <= 72) return "text-amber-600";
    return "text-green-600";
  };

  const formatDeadline = (deadlineString) => {
    if (!deadlineString) return "-";
    try {
      const date = new Date(deadlineString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatSubmittedAt = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-6 py-5 space-y-5 pb-10 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const isSubmitted = tugas?.submitted_at !== null;
  const isCompleted = tugas?.status === "selesai";
  const isRevision = tugas?.status === "revisi";
  const isRevisionSubmitted = tugas?.status === "dikumpulkan_revisi";
  
  const hasSubmitted = 
    (isSubmitted && 
     tugas?.status !== "revisi" && 
     !isCompleted) || 
    tugas?.status === "dikumpulkan_revisi";
  
  const deadlineColor = getDeadlineColor();

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-6 py-5 space-y-5 pb-10 min-h-screen">
      {/* Tombol Kembali */}
      <div className="mb-2">
        <button
          onClick={() => navigate("/peserta/tugas", { state: { refresh: true } })}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors duration-200 group"
        >
          <ChevronLeft size="16" className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          <span>Kembali ke Daftar Tugas</span>
        </button>
      </div>

      {/* Upload Success Alert */}
      {uploadSuccess && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-4 flex items-center gap-3 border border-emerald-200/50 backdrop-blur-sm animate-in slide-in-from-top-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle size="16" className="text-white" />
          </div>
          <p className="text-sm text-emerald-700 font-medium">
            {isRevision ? "Revisi tugas berhasil dikirim!" : "Tugas berhasil dikumpulkan!"}
          </p>
        </div>
      )}

      {/* Cancel Success Alert */}
      {cancelSuccess && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-4 flex items-center gap-3 border border-amber-200/50 backdrop-blur-sm animate-in slide-in-from-top-2">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <XCircle size="16" className="text-white" />
          </div>
          <p className="text-sm text-amber-700 font-medium">
            Pengumpulan tugas dibatalkan. Anda dapat mengupload ulang.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/5 to-transparent p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                Detail Tugas
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{tugas?.judul}</p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm ${
              isCompleted
                ? "bg-emerald-100/80 text-emerald-700"
                : isRevision
                  ? "bg-amber-100/80 text-amber-700"
                  : isRevisionSubmitted
                    ? "bg-orange-100/80 text-orange-700"
                    : hasSubmitted
                      ? "bg-blue-100/80 text-blue-700"
                      : "bg-gray-100/80 text-gray-600"
            }`}
          >
            {isCompleted && <CheckCircle size="14" />}
            {isRevision && <AlertCircle size="14" />}
            {isRevisionSubmitted && <Clock size="14" />}
            {hasSubmitted && !isCompleted && !isRevision && !isRevisionSubmitted && <Clock size="14" />}
            {!hasSubmitted && !isRevision && !isCompleted && <Clock size="14" />}
            <span className="text-sm font-medium">
              {isCompleted
                ? "Selesai"
                : isRevision
                  ? "Perlu Revisi"
                  : isRevisionSubmitted
                    ? "Revisi Sedang Ditinjau"
                    : hasSubmitted
                      ? "Menunggu Penilaian"
                      : "Belum Dikumpulkan"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deskripsi */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText size="12" className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">Deskripsi Tugas</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {tugas?.deskripsi || "Tidak ada deskripsi"}
              </p>
            </div>
          </div>

          {/* Upload Section - Disesuaikan untuk revisi */}
          {!isCompleted && (
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="relative h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-5">
                  {hasSubmitted && !isRevisionSubmitted
                    ? isRevision
                      ? "Unggah Revisi"
                      : "Tugas Terkirim"
                    : isRevisionSubmitted
                      ? "Revisi Terkirim - Menunggu Review"
                      : "Kumpulkan Tugas"}
                </h3>

                {/* Status sudah submit tapi belum revisi */}
                {hasSubmitted && !isRevision && !isRevisionSubmitted && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 backdrop-blur-sm">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle size="18" className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800">
                          Tugas Sudah Terkirim
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {formatSubmittedAt(tugas?.submitted_at)}
                        </p>
                      </div>
                    </div>

                    {tugas?.file_url && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FileText size="14" className="text-teal-600" />
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            {tugas.file_name || "File Tugas"}
                          </span>
                        </div>
                        <a
                          href={tugas.file_url}
                          download
                          className="p-2 rounded-xl bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 transition-all duration-200"
                        >
                          <Download size="16" />
                        </a>
                      </div>
                    )}

                    {tugas?.submission_link && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <LinkIcon size="14" className="text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-700 truncate max-w-[200px] font-mono">
                            {tugas.submission_link}
                          </span>
                        </div>
                        <a
                          href={tugas.submission_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-all duration-200"
                        >
                          <ExternalLink size="16" />
                        </a>
                      </div>
                    )}

                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={cancelling}
                      className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold text-sm hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {cancelling ? (
                        <Loader2 size="16" className="animate-spin" />
                      ) : (
                        <Trash2 size="16" />
                      )}
                      Batalkan Kirim
                    </button>
                  </div>
                )}

                {/* Status revisi sudah dikirim - menunggu review */}
                {isRevisionSubmitted && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-200/50 backdrop-blur-sm">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                        <Clock size="18" className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-800">
                          Revisi Terkirim
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          Menunggu review dari mentor
                        </p>
                      </div>
                    </div>

                    {tugas?.file_url && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FileText size="14" className="text-teal-600" />
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            {tugas.file_name || "File Revisi"}
                          </span>
                        </div>
                        <a
                          href={tugas.file_url}
                          download
                          className="p-2 rounded-xl bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 transition-all duration-200"
                        >
                          <Download size="16" />
                        </a>
                      </div>
                    )}

                    {tugas?.submission_link && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <LinkIcon size="14" className="text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-700 truncate max-w-[200px] font-mono">
                            {tugas.submission_link}
                          </span>
                        </div>
                        <a
                          href={tugas.submission_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-all duration-200"
                        >
                          <ExternalLink size="16" />
                        </a>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-gray-50/50 text-center">
                      <p className="text-xs text-gray-500">
                        Revisi Anda telah terkirim. Mentor akan segera melakukan review ulang.
                      </p>
                    </div>
                  </div>
                )}

                {/* 🔥 PERBAIKAN: Form upload (belum submit atau revisi) - TAMPILKAN FILE DAN LINK BERSAMAAN */}
                {!hasSubmitted && !isRevisionSubmitted && (
                  <div className="space-y-5">
                    {/* 🔥 HAPUS tombol switch type - langsung tampilkan keduanya */}
                    
                    {/* Upload File */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Paperclip size="14" className="inline mr-1" />
                        File Jawaban 
                      </label>
                      <div className="border-2 border-dashed border-gray-300/50 rounded-xl p-6 text-center transition-all duration-200 hover:border-teal-400 hover:bg-teal-50/30">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Upload size="20" className="text-teal-600" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          Klik atau drag file ke sini
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF, DOC, DOCX, ZIP (Max 10MB)
                        </p>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.zip,.rar,.7z"
                          className="mt-3 text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-teal-500 file:to-blue-600 file:text-white file:cursor-pointer hover:file:shadow-lg transition-all"
                        />
                      </div>
                    </div>

                    {/* Input Link */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <LinkIcon size="14" className="inline mr-1" />
                        Link Jawaban 
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... atau https://github.com/..."
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Contoh: Google Drive, GitHub, atau link lainnya
                      </p>
                    </div>

                    {/* 🔥 Preview File (jika ada file dipilih) */}
                    {selectedFile && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                            <FileText size="14" className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="p-1 rounded-lg hover:bg-white/50 transition"
                        >
                          <X size="14" className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    )}

                    {/* 🔥 Preview Link (jika ada link diisi) */}
                    {submissionLink && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <LinkIcon size="14" className="text-white" />
                          </div>
                          <span className="text-sm text-gray-700 truncate font-mono">
                            {submissionLink}
                          </span>
                        </div>
                        <button
                          onClick={() => setSubmissionLink("")}
                          className="p-1 rounded-lg hover:bg-white/50 transition"
                        >
                          <X size="14" className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    )}

                    {/* Informasi bahwa bisa kirim keduanya */}
                    <div className="p-3 rounded-xl bg-gray-50/50 text-center">
                      <p className="text-xs text-gray-500">
                        Anda bisa mengisi file, link, atau keduanya
                      </p>
                    </div>

                    {/* 🔥 PERBAIKAN: Tombol Submit - disabled hanya jika kedua field kosong */}
                    <button
                      onClick={handleSubmit}
                      disabled={uploading || (!selectedFile && !submissionLink.trim())}
                      className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold text-sm hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <Loader2 size="18" className="animate-spin" />
                      ) : (
                        <Send size="18" />
                      )}
                      {uploading
                        ? "Mengirim..."
                        : isRevision
                          ? "Kirim Revisi"
                          : "Kumpulkan Tugas"}
                    </button>
                  </div>
                )}

                {/* Catatan Revisi */}
                {isRevision && tugas?.catatan && (
                  <div className="mt-5 p-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                        <MessageSquare size="12" className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-amber-800">
                        Catatan Revisi dari Mentor
                      </span>
                    </div>
                    <p className="text-sm text-amber-700">{tugas.catatan}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nilai & Feedback */}
          {isCompleted && tugas?.nilai && (
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="relative h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Target size="12" className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Hasil Penilaian
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div className="text-center p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                    <div className="text-4xl font-bold text-emerald-600">
                      {tugas.nilai}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Nilai Akhir</p>
                  </div>
                  <div className="text-center p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                    <div className="text-xl font-semibold text-blue-600">
                      {tugas.nilai}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Persentase</p>
                  </div>
                </div>
                {tugas.catatan && (
                  <div className="p-5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size="14" className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Catatan Mentor
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{tugas.catatan}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Card Deadline */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div
                className={`relative h-1 bg-gradient-to-r ${
                  timeLeft?.isLate
                    ? "from-red-500 to-rose-500"
                    : timeLeft?.hours <= 24
                      ? "from-red-500 to-orange-500"
                      : timeLeft?.hours <= 72
                        ? "from-amber-500 to-orange-500"
                        : "from-teal-500 to-blue-600"
                }`}
              ></div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <Flag size="10" className="text-white" />
                    </div>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      DEADLINE
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-base font-bold ${deadlineColor}`}>
                      {formatDeadline(tugas?.deadline)}
                    </span>
                    <div
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                        timeLeft?.isLate
                          ? "bg-red-100 text-red-700"
                          : timeLeft?.hours <= 24
                            ? "bg-red-100 text-red-700"
                            : timeLeft?.hours <= 72
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      {timeLeft?.isLate
                        ? "Terlambat"
                        : timeLeft?.hours <= 24
                          ? "H-1"
                          : timeLeft?.hours <= 72
                            ? "Mendekat"
                            : "Aman"}
                    </div>
                  </div>
                </div>

                {/* Countdown Timer */}
                {!isCompleted && timeLeft && timeLeft.text !== "No deadline" && timeLeft.text !== "Invalid deadline" && (
                  <div
                    className={`p-3 rounded-xl ${
                      timeLeft.isLate
                        ? "bg-gradient-to-r from-red-500/10 to-rose-500/10"
                        : timeLeft.hours <= 24
                          ? "bg-gradient-to-r from-red-500/10 to-orange-500/10"
                          : timeLeft.hours <= 72
                            ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10"
                            : "bg-gradient-to-r from-teal-500/10 to-blue-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Timer
                        size={14}
                        className={
                          timeLeft.isLate
                            ? "text-red-500"
                            : timeLeft.hours <= 24
                              ? "text-red-500"
                              : timeLeft.hours <= 72
                                ? "text-amber-500"
                                : "text-teal-500"
                        }
                      />
                      <p
                        className={`text-[10px] font-medium ${
                          timeLeft.isLate
                            ? "text-red-700"
                            : timeLeft.hours <= 24
                              ? "text-red-700"
                              : timeLeft.hours <= 72
                                ? "text-amber-700"
                                : "text-teal-700"
                        }`}
                      >
                        {timeLeft.isLate ? "Terlambat" : "Sisa Waktu"}
                      </p>
                    </div>
                    <p
                      className={`text-xs font-bold mt-1 ${
                        timeLeft.isLate
                          ? "text-red-700"
                          : timeLeft.hours <= 24
                            ? "text-red-700"
                            : timeLeft.hours <= 72
                              ? "text-amber-700"
                              : "text-teal-700"
                      }`}
                    >
                      {timeLeft.text}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200/50 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <Clock size="10" className="text-white" />
                    </div>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isCompleted
                          ? "bg-emerald-500"
                          : isRevision
                            ? "bg-amber-500"
                            : isRevisionSubmitted
                              ? "bg-orange-500"
                              : hasSubmitted
                                ? "bg-blue-500"
                                : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="text-xs font-medium text-gray-700">
                      {isCompleted
                        ? "Tugas Selesai"
                        : isRevision
                          ? "Perlu Revisi"
                          : isRevisionSubmitted
                            ? "Revisi Sedang Ditinjau"
                            : hasSubmitted
                              ? "Menunggu Penilaian"
                              : "Belum Dikumpulkan"}
                    </span>
                  </div>
                </div>

                {hasSubmitted && tugas?.submitted_at && (
                  <div className="border-t border-gray-200/50 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                        <Calendar size="10" className="text-white" />
                      </div>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        TANGGAL KUMPUL
                      </p>
                    </div>
                    <p className="text-xs text-gray-700 font-medium">
                      {formatSubmittedAt(tugas.submitted_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle size="20" className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Batalkan Pengumpulan
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Apakah Anda yakin ingin membatalkan pengumpulan tugas? File yang
                sudah diupload akan dihapus.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleCancelSubmission}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                >
                  Ya, Batalkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailTugas;