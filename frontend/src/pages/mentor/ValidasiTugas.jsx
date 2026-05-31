// src/pages/mentor/ValidasiTugas.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  MessageSquare,
  Send,
  X,
  Eye,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Shield,
  Zap,
  Activity,
  SortAsc,
  SortDesc,
  CheckCheck,
  ExternalLink,
  Maximize2,
  Minimize2,
  UserX,
  RefreshCw
} from "lucide-react";
import { getTugasSubmissions, updateTugasSubmission } from "../../api/mentor/tugasService";
import axiosInstance from "../../api/axios";

const BASE_URL = "http://localhost:8000";

// Helper function untuk mendapatkan URL preview yang benar
const getPreviewUrl = (filePath) => {
  if (!filePath) return null;

  if (filePath.startsWith("http")) {
    return filePath;
  }

  let cleanPath = filePath.replace(/^\/?storage\//, "");
  return `${BASE_URL}/api/storage/preview/${cleanPath}`;
};

// Helper function untuk mendapatkan URL download yang benar
const getDownloadUrl = (filePath) => {
  if (!filePath) return null;

  if (filePath.startsWith("http")) {
    return filePath;
  }

  let cleanPath = filePath.replace(/^\/?storage\//, "");
  return `${BASE_URL}/api/storage/download/${cleanPath}`;
};

// Helper untuk mendapatkan nama file dari path
const getFileNameFromPath = (filePath) => {
  if (!filePath) return null;
  const parts = filePath.split('/');
  return parts[parts.length - 1];
};

// Deteksi tipe file berdasarkan ekstensi
const getFileTypeFromName = (fileName) => {
  if (!fileName) return "other";
  const ext = fileName.split('.').pop().toLowerCase();
  
  if (ext === "pdf") return "pdf";
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return "image";
  if (['doc', 'docx'].includes(ext)) return "document";
  if (['xls', 'xlsx', 'csv'].includes(ext)) return "spreadsheet";
  
  return "other";
};

function ValidasiTugas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({
    catatan: "",
    status: "selesai"
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloading, setDownloading] = useState(null);
  const [itemsPerPage] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fungsi untuk mengecek apakah sudah submit berdasarkan status
  const isSubmissionSubmitted = (submission) => {
    return submission.status !== "belum_dikumpulkan" && submission.submitted_at !== null;
  };

  // 🔥 PERBAIKAN: Fungsi Preview - HANYA untuk file, TIDAK untuk link
  const handlePreview = (submission) => {
    // Cek apakah ada file
    if (!submission.file_path) {
      alert("Tidak ada file untuk dipreview");
      return;
    }

    const fileName = getFileNameFromPath(submission.file_path);
    const fileType = getFileTypeFromName(fileName);
    const previewUrlFile = getPreviewUrl(submission.file_path);
    
    if (fileType === "pdf" || fileType === "image") {
      setPreviewUrl(previewUrlFile);
      setPreviewType(fileType);
      setPreviewFileName(fileName || "file");
      setShowPreview(true);
    } else {
      alert("File jenis ini tidak dapat dipreview. Silakan download untuk melihat.");
    }
  };

  // 🔥 PERBAIKAN: Fungsi Download dengan Axios Blob (LANGSUNG DOWNLOAD, TANPA BUKA TAB BARU)
  const handleDownload = async (submission) => {
    if (!submission.file_path) {
      alert("File tidak tersedia");
      return;
    }

    setDownloading(submission.id_pengumpulan);

    try {
      const fileName = getFileNameFromPath(submission.file_path);
      const downloadUrl = getDownloadUrl(submission.file_path);
      
      // Gunakan axios dengan responseType blob untuk download langsung
      const response = await axiosInstance.get(downloadUrl, {
        responseType: "blob"
      });
      
      // Buat blob dari response
      const blob = new Blob([response.data]);
      
      // Buat URL object untuk blob
      const url = window.URL.createObjectURL(blob);
      
      // Buat link download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download";
      
      // Append ke body, click, lalu remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke URL object untuk membersihkan memory
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh file. Silakan coba lagi.");
    } finally {
      setDownloading(null);
    }
  };

  // 🔥 PERBAIKAN: Fungsi Download dari preview modal
  const handleDownloadFromPreview = async () => {
    if (!previewUrl) return;
    
    try {
      // Ambil URL download yang benar (ganti preview dengan download)
      let downloadPath = previewUrl.replace('/api/storage/preview/', '/api/storage/download/');
      
      const response = await axiosInstance.get(downloadPath, {
        responseType: "blob"
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = previewFileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh file");
    }
  };

  // 🔥 Fungsi Buka Link - KHUSUS untuk link (membuka tab baru, ini sudah benar)
  const handleOpenLink = (link) => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  const loadSubmissions = async () => {
    if (!id) {
      console.error("ID Tugas tidak ditemukan di URL");
      return;
    }
    try {
      setLoading(true);
      const response = await getTugasSubmissions(id);
      console.log("Submissions response:", response);
      
      if (response.success && response.data) {
        const formattedData = response.data.map(item => {
          return {
            id_pengumpulan: item.id_pengumpulan,
            peserta_id: item.id_peserta,
            peserta_nama: item.peserta_nama || "Tidak diketahui",
            peserta_divisi: item.peserta_divisi || "",
            tugas_judul: "Tugas",
            status: item.status,
            submitted_at: item.submitted_at,
            file_path: item.file_jawaban || item.file_url,
            file_name: item.file_jawaban ? getFileNameFromPath(item.file_jawaban) : null,
            catatan_mentor: item.catatan_mentor || null,
            link_jawaban: item.link_jawaban || null
          };
        });
        setSubmissions(formattedData);
        setFilteredSubmissions(formattedData);
      } else {
        setSubmissions([]);
        setFilteredSubmissions([]);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
      setSubmissions([]);
      setFilteredSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadSubmissions();
  }, [id]);

  // Filter dan sorting submissions
  useEffect(() => {
    let filtered = [...submissions];
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.peserta_nama?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
    
    // Sorting: yang sudah submit di atas, yang belum di bawah
    filtered.sort((a, b) => {
      const aSubmitted = isSubmissionSubmitted(a);
      const bSubmitted = isSubmissionSubmitted(b);
      
      if (aSubmitted && !bSubmitted) return -1;
      if (!aSubmitted && bSubmitted) return 1;
      if (!aSubmitted && !bSubmitted) return 0;
      
      // Kedua sudah submit, sorting berdasarkan tanggal
      const dateA = new Date(a.submitted_at);
      const dateB = new Date(b.submitted_at);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredSubmissions(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortOrder, submissions]);

  const handleOpenModal = (submission) => {
    setSelectedSubmission(submission);
    setReviewForm({
      catatan: submission.catatan_mentor || "",
      status: "selesai"
    });
    setShowModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedSubmission) return;
    setSubmitting(true);
    try {
      const response = await updateTugasSubmission(selectedSubmission.id_pengumpulan, {
        status: reviewForm.status,
        catatan_mentor: reviewForm.catatan
      });
      if (response && response.success) {
        const updatedSubmissions = submissions.map(s => 
          s.id_pengumpulan === selectedSubmission.id_pengumpulan 
            ? { ...s, catatan_mentor: reviewForm.catatan, status: reviewForm.status }
            : s
        );
        setSubmissions(updatedSubmissions);
        setShowModal(false);
        const statusText = reviewForm.status === "selesai" ? "diselesaikan" : "direvisi";
        setSuccessMessage(`Tugas ${selectedSubmission.peserta_nama} berhasil ${statusText}!`);
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        alert("Gagal menyimpan review: " + (response?.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Terjadi kesalahan saat menyimpan review");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (submission) => {
    const isSubmitted = isSubmissionSubmitted(submission);
    
    if (!isSubmitted) {
      return { 
        bg: "bg-gradient-to-r from-slate-500/20 to-slate-600/20", 
        text: "text-slate-500", 
        icon: UserX, 
        label: "Belum Kumpul", 
        border: "border-slate-200" 
      };
    }
    
    switch(submission.status) {
      case "selesai":
        return { bg: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20", text: "text-emerald-600", icon: CheckCircle, label: "Selesai", border: "border-emerald-200" };
      case "revisi":
        return { bg: "bg-gradient-to-r from-purple-500/20 to-purple-600/20", text: "text-purple-600", icon: AlertCircle, label: "Menunggu Revisi", border: "border-purple-200" };
      case "dikumpulkan_revisi":
        return { bg: "bg-gradient-to-r from-orange-500/20 to-amber-500/20", text: "text-orange-600", icon: RefreshCw, label: "Review Revisi", border: "border-orange-200" };
      case "dikumpulkan":
        return { bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20", text: "text-blue-600", icon: Clock, label: "Menunggu Review", border: "border-blue-200" };
      default:
        return { bg: "bg-gradient-to-r from-slate-500/10 to-slate-600/10", text: "text-slate-500", icon: Clock, label: "Menunggu", border: "border-slate-200" };
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    try {
      return new Date(dateTime).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewUrl("");
    setPreviewType("");
    setPreviewFileName("");

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    const previewElement = document.getElementById("preview-container");

    if (!isFullscreen) {
      if (previewElement?.requestFullscreen) {
        previewElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }

    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  // Statistik
  const statsCount = {
    all: submissions.length,
    dikumpulkan: submissions.filter(s => s.status === "dikumpulkan").length,
    dikumpulkan_revisi: submissions.filter(s => s.status === "dikumpulkan_revisi").length,
    revisi: submissions.filter(s => s.status === "revisi").length,
    selesai: submissions.filter(s => s.status === "selesai").length,
    belum_kumpul: submissions.filter(s => !isSubmissionSubmitted(s)).length
  };

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => isSubmissionSubmitted(s)).length,
    notSubmitted: submissions.filter(s => !isSubmissionSubmitted(s)).length,
    pending: submissions.filter(s => s.status === "dikumpulkan").length,
    pendingRevisi: submissions.filter(s => s.status === "dikumpulkan_revisi").length,
    revision: submissions.filter(s => s.status === "revisi").length,
    completed: submissions.filter(s => s.status === "selesai").length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      {showSuccessPopup && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-2xl p-4 flex items-center gap-3 min-w-[320px]">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Validasi Berhasil!</p>
              <p className="text-white/80 text-xs">{successMessage}</p>
            </div>
            <button onClick={() => setShowSuccessPopup(false)} className="text-white/70 hover:text-white">
              <X size="16" />
            </button>
          </div>
        </div>
      )}
      
      <div className="relative p-6 lg:p-8 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="relative mb-6 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate("/mentor/daftar-tugas")}
                  className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors group"
                >
                  <ArrowLeft size="20" className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Kembali ke Daftar Tugas</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur-md opacity-50"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                  Validasi Tugas
                </h1>
                <p className="text-sm text-slate-500 mt-1">Review dan validasi tugas yang telah dikumpulkan peserta</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="relative p-3 text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{stats.total}</p>
              <p className="text-[10px] text-slate-500 mt-1">Total</p>
            </div>
          </div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="relative p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              <p className="text-[10px] text-slate-500 mt-1">Menunggu</p>
            </div>
          </div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="relative p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.revision}</p>
              <p className="text-[10px] text-slate-500 mt-1">Revisi</p>
            </div>
          </div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="relative p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pendingRevisi}</p>
              <p className="text-[10px] text-slate-500 mt-1">Review Revisi</p>
            </div>
          </div>
          <div className="relative group overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="relative p-3 text-center">
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-[10px] text-white/80 mt-1">Selesai</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari peserta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setSortOrder("newest")} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${sortOrder === "newest" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}>
                  <SortDesc size="12" /> Terbaru
                </button>
                <button onClick={() => setSortOrder("oldest")} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${sortOrder === "oldest" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}>
                  <SortAsc size="12" /> Terlama
                </button>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setFilterStatus("all")} className={`px-4 py-2 rounded-lg text-xs font-medium ${filterStatus === "all" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}>
                  Semua ({statsCount.all})
                </button>
                <button onClick={() => setFilterStatus("dikumpulkan")} className={`px-4 py-2 rounded-lg text-xs font-medium ${filterStatus === "dikumpulkan" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}>
                  Menunggu ({statsCount.dikumpulkan})
                </button>
                <button onClick={() => setFilterStatus("revisi")} className={`px-4 py-2 rounded-lg text-xs font-medium ${filterStatus === "revisi" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}>
                  Revisi ({statsCount.revisi})
                </button>
                <button onClick={() => setFilterStatus("dikumpulkan_revisi")} className={`px-4 py-2 rounded-lg text-xs font-medium ${filterStatus === "dikumpulkan_revisi" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}>
                  Review Revisi ({statsCount.dikumpulkan_revisi})
                </button>
                <button onClick={() => setFilterStatus("selesai")} className={`px-4 py-2 rounded-lg text-xs font-medium ${filterStatus === "selesai" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}>
                  Selesai ({statsCount.selesai})
                </button>
                <button onClick={() => setFilterStatus("belum_dikumpulkan")} className={`px-4 py-2 rounded-lg text-xs font-medium ${filterStatus === "belum_dikumpulkan" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}>
                  Belum Kumpul ({statsCount.belum_kumpul})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-5">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Sparkles size="14" className="text-teal-500" />
            Menampilkan {currentItems.length} dari {filteredSubmissions.length} peserta
          </p>
        </div>

        {/* Submissions Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tgl Kumpul</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((sub) => {
                  const isSubmitted = isSubmissionSubmitted(sub);
                  const status = getStatusBadge(sub);
                  const StatusIcon = status.icon;
                  const isDownloading = downloading === sub.id_pengumpulan;
                  const hasFile = sub.file_path && isSubmitted;
                  const hasLink = sub.link_jawaban && isSubmitted;
                  
                  // Tentukan teks tombol berdasarkan status
                  const getButtonText = () => {
                    if (sub.status === "dikumpulkan_revisi") return "Review Revisi";
                    if (sub.status === "revisi") return "Menunggu Upload";
                    return "Review";
                  };
                  
                  return (
                    <tr key={sub.id_pengumpulan || sub.peserta_id} className="transition-all duration-300 group hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {sub.peserta_nama?.charAt(0) || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{sub.peserta_nama}</p>
                            <p className="text-[9px] text-slate-400">{sub.peserta_divisi}</p>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        {isSubmitted && sub.submitted_at ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                              <Calendar size="12" className="text-teal-500" />
                            </div>
                            <span className="text-xs font-medium text-slate-600">{formatDateTime(sub.submitted_at)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                              <Clock size="12" className="text-slate-400" />
                            </div>
                            Belum kumpul
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${status.bg} ${status.text} border ${status.border} shadow-sm`}>
                          <StatusIcon size="10" />
                          <span className="text-[10px] font-semibold">{status.label}</span>
                        </div>
                        {sub.status === "revisi" && sub.catatan_mentor && (
                          <div className="mt-1 text-[9px] text-purple-500 max-w-[180px] truncate">
                            Catatan: {sub.catatan_mentor}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isSubmitted ? (
                            <>
                              {/* 🔥 PERBAIKAN: Tombol Preview HANYA untuk file (Eye) */}
                              {hasFile && (
                                <>
                                  <button 
                                    onClick={() => handlePreview(sub)} 
                                    className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white transition-all duration-200" 
                                    title="Preview File"
                                  >
                                    <Eye size="14" />
                                  </button>
                                  <button 
                                    onClick={() => handleDownload(sub)} 
                                    disabled={isDownloading} 
                                    className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white transition-all duration-200 disabled:opacity-50" 
                                    title="Download File"
                                  >
                                    {isDownloading ? <Loader2 size="14" className="animate-spin" /> : <Download size="14" />}
                                  </button>
                                </>
                              )}
                              
                              {/* 🔥 Tombol Buka Link (ExternalLink) */}
                              {hasLink && (
                                <button 
                                  onClick={() => handleOpenLink(sub.link_jawaban)} 
                                  className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200" 
                                  title="Buka Link Jawaban"
                                >
                                  <ExternalLink size="14" />
                                </button>
                              )}
                              
                              {/* Tombol Review (MessageSquare) */}
                              {sub.status !== "revisi" && (
                                <button 
                                  onClick={() => handleOpenModal(sub)} 
                                  className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-xs font-semibold text-white shadow-md hover:shadow-xl transition-all duration-300"
                                >
                                  <MessageSquare size="12" className="mr-1" />
                                  {getButtonText()}
                                </button>
                              )}
                              
                              {sub.status === "revisi" && (
                                <span className="text-xs text-purple-500 italic bg-purple-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                  <RefreshCw size="12" />
                                  Menunggu Upload
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="text-xs text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-lg">
                              Belum mengumpulkan tugas
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="py-16 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto">
                  <FileText size="32" className="text-slate-400" />
                </div>
              </div>
              <p className="text-slate-600 font-semibold mt-4">Tidak ada data peserta</p>
              <p className="text-sm text-slate-400 mt-1">Belum ada peserta yang terdaftar untuk tugas ini</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Zap size="14" className="text-teal-500" />
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                  <ChevronLeft size="18" />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`relative w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-105" : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                  <ChevronRight size="18" />
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>

      {/* Review Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-md">
                    <ClipboardList size="16" className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Review Tugas</h3>
                </div>
                <p className="text-sm text-slate-500">{selectedSubmission.peserta_nama}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X size="18" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedSubmission.submitted_at && (
                <div className="bg-gradient-to-r from-teal-50 to-white rounded-xl p-4 border border-teal-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-100"><Calendar size="16" className="text-teal-600" /></div>
                    <div>
                      <p className="text-xs text-slate-500">Tanggal Pengumpulan</p>
                      <p className="text-sm font-semibold text-slate-700">{formatDateTime(selectedSubmission.submitted_at)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-teal-50"><Activity size="12" className="text-teal-500" /></div>
                  Status Validasi <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setReviewForm(prev => ({ ...prev, status: "selesai" }))} className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${reviewForm.status === "selesai" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md" : "border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    <CheckCircle size="16" /> Selesai
                  </button>
                  <button onClick={() => setReviewForm(prev => ({ ...prev, status: "revisi" }))} className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${reviewForm.status === "revisi" ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md" : "border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    <AlertCircle size="16" /> Revisi
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  {reviewForm.status === "revisi" ? "⚠️ Pilih Revisi jika tugas perlu perbaikan. Peserta akan mengumpulkan ulang." : "✅ Pilih Selesai jika tugas sudah sesuai."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-blue-50"><MessageSquare size="12" className="text-blue-500" /></div>
                  Catatan / Feedback
                </label>
                <textarea
                  value={reviewForm.catatan}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, catatan: e.target.value }))}
                  rows="4"
                  placeholder="Berikan catatan atau masukan yang konstruktif untuk peserta..."
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400 resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-2">
                  Catatan akan dikirim ke peserta sebagai bahan perbaikan.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold">Batal</button>
              <button onClick={handleSubmitReview} disabled={submitting} className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2">
                {submitting ? <Loader2 size="16" className="animate-spin" /> : <Send size="16" />}
                {submitting ? "Menyimpan..." : "Simpan Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL MENGGUNAKAN PORTAL */}
      {showPreview &&
        ReactDOM.createPortal(
          <div
            id="preview-container"
            className="fixed inset-0 z-[99999999] bg-[#0b1120] flex flex-col"
          >
            <div className="h-20 bg-gradient-to-r from-[#0f172a] to-[#111827] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <FileText className="text-white" size={22} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-white font-bold text-lg truncate">{previewFileName}</h2>
                  <p className="text-white/60 text-sm">Preview Dokumen</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={toggleFullscreen} className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
                  {isFullscreen ? <Minimize2 className="text-white" size={20} /> : <Maximize2 className="text-white" size={20} />}
                </button>
                <button onClick={handleDownloadFromPreview} className="px-5 h-12 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold flex items-center gap-2">
                  <Download size={18} /> Download
                </button>
                <button onClick={closePreview} className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-red-500/20 transition flex items-center justify-center">
                  <X className="text-white" size={22} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-[#111827] p-6 overflow-hidden">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {previewType === "pdf" && (
                  <iframe src={previewUrl} title="Preview PDF" className="w-full h-full border-0 bg-white" />
                )}
                {previewType === "image" && (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <img src={previewUrl} alt={previewFileName} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default ValidasiTugas;