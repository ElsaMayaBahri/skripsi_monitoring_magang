// src/pages/peserta/DaftarTugas.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Upload,
  Link as LinkIcon,
  X,
  Paperclip,
  Download,
  ExternalLink,
  User,
  FileWarning,
  RotateCcw,
  CalendarCheck,
  FileCheck,
} from "lucide-react";
import { getPesertaTugas } from "../../api/peserta/tugasService";

function DaftarTugas() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [tugasList, setTugasList] = useState([]);
  const [filteredTugas, setFilteredTugas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    loadTugasData();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      loadTugasData();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTugasData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const formatDeadline = (deadlineString) => {
    if (!deadlineString || deadlineString === "-" || deadlineString === null) return "-";
    try {
      let date;
      if (typeof deadlineString === "string") {
        if (deadlineString.includes(" ")) {
          const [datePart] = deadlineString.split(" ");
          const [year, month, day] = datePart.split("-");
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(deadlineString);
        }
      } else {
        date = new Date(deadlineString);
      }
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "-";
    }
  };

  // Fungsi untuk mengecek apakah tugas terlambat (melewati deadline)
  const isLateSubmission = (deadlineRaw, submittedAt) => {
    if (!deadlineRaw || deadlineRaw === "-" || deadlineRaw === null) return false;
    if (!submittedAt) return false;
    
    try {
      const deadline = new Date(deadlineRaw);
      const submitted = new Date(submittedAt);
      
      if (isNaN(deadline.getTime()) || isNaN(submitted.getTime())) return false;
      
      return submitted > deadline;
    } catch (error) {
      return false;
    }
  };

  const handleDownloadFile = (fileUrl) => {
    if (!fileUrl) return;
    
    try {
      let cleanPath = fileUrl;
      if (cleanPath.startsWith('http://localhost:8000/storage/')) {
        cleanPath = cleanPath.replace('http://localhost:8000/storage/', '');
      } else if (cleanPath.startsWith('/storage/')) {
        cleanPath = cleanPath.replace('/storage/', '');
      } else if (cleanPath.startsWith('storage/')) {
        cleanPath = cleanPath.replace('storage/', '');
      }
      
      const downloadUrl = `http://localhost:8000/api/storage/download/${encodeURIComponent(cleanPath)}`;
      window.location.href = downloadUrl;
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const openPreview = (fileUrl, fileName) => {
    if (!fileUrl) return;
    
    let cleanPath = fileUrl;
    if (cleanPath.startsWith('http://localhost:8000/storage/')) {
      cleanPath = cleanPath.replace('http://localhost:8000/storage/', '');
    } else if (cleanPath.startsWith('/storage/')) {
      cleanPath = cleanPath.replace('/storage/', '');
    } else if (cleanPath.startsWith('storage/')) {
      cleanPath = cleanPath.replace('storage/', '');
    }
    
    const previewUrl = `http://localhost:8000/api/storage/preview/${encodeURIComponent(cleanPath)}`;
    
    window.dispatchEvent(new Event("preview-modal-open"));
    
    setPreviewFile({
      url: previewUrl,
      name: fileName || 'Preview',
    });
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
    window.dispatchEvent(new Event("preview-modal-close"));
  };

  const loadTugasData = async () => {
    setLoading(true);
    try {
      const result = await getPesertaTugas();
      console.log("📦 Raw API Response:", result);

      if (result.success && Array.isArray(result.data)) {
        const transformed = result.data.map((t) => {
          const attachments = [];
          
          if (t.file_tugas_urls && Array.isArray(t.file_tugas_urls)) {
            t.file_tugas_urls.forEach((url) => {
              if (url && url !== "null" && url !== "undefined") {
                attachments.push({
                  type: "file",
                  name: url.split("/").pop() || "File Tugas",
                  url: url,
                });
              }
            });
          }
          
          if (t.file_tugas_links && Array.isArray(t.file_tugas_links)) {
            t.file_tugas_links.forEach((link) => {
              if (link && link !== "null" && link !== "undefined" && link.trim() !== "") {
                attachments.push({
                  type: "link",
                  name: "Link Referensi",
                  url: link,
                  external: true,
                });
              }
            });
          }
          
          if (t.file_links && Array.isArray(t.file_links)) {
            t.file_links.forEach((link) => {
              if (link && link !== "null" && link !== "undefined" && link.trim() !== "") {
                attachments.push({
                  type: "link",
                  name: "Link Referensi",
                  url: link,
                  external: true,
                });
              }
            });
          }
          
          if (t.link_materi && t.link_materi.trim() !== "") {
            attachments.push({
              type: "link",
              name: "Link Materi",
              url: t.link_materi,
              external: true,
            });
          }
          
          // Cek apakah tugas dikumpulkan terlambat (tanpa mengubah status utama)
          let isLate = false;
          const submittedStatuses = ["dikumpulkan", "dikumpulkan_revisi", "selesai"];
          if (submittedStatuses.includes(t.status) && t.tanggal_kumpul && t.deadline) {
            isLate = isLateSubmission(t.deadline, t.tanggal_kumpul);
          }
          
          return {
            id: t.id_pengumpulan,
            id_tugas: t.id_tugas,
            judul: t.judul_tugas || "Tanpa Judul",
            instruksi: t.deskripsi || "-",
            cara_pengerjaan: t.cara_pengerjaan || "",
            deadline_display: formatDeadline(t.deadline),
            deadline_raw: t.deadline,
            status: t.status,
            isLate: isLate, // Flag untuk keterlambatan
            submitted_at: t.tanggal_kumpul || null,
            nilai: t.nilai || null,
            dinilai_pada: t.dinilai_pada || null,
            catatan_mentor: t.catatan_mentor || null,
            attachments: attachments,
            file_jawaban_url: t.file_jawaban_url || null,
            link_jawaban: t.link_jawaban || null,
            mentor_name: t.mentor_name || "Mentor",
          };
        });
        setTugasList(transformed);
        setFilteredTugas(transformed);
      } else {
        console.error("Response tidak sesuai:", result);
        setTugasList([]);
        setFilteredTugas([]);
      }
    } catch (err) {
      console.error("Gagal memuat tugas:", err);
      setTugasList([]);
      setFilteredTugas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...tugasList];
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.instruksi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => {
        if (filterStatus === "dikumpulkan") {
          return t.status === "dikumpulkan" || t.status === "dikumpulkan_revisi";
        }
        if (filterStatus === "revisi") {
          return t.status === "revisi";
        }
        return t.status === filterStatus;
      });
    }
    setFilteredTugas(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, tugasList]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "selesai":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          icon: CheckCircle,
          label: "Selesai",
        };
      case "revisi":
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          icon: RotateCcw,
          label: "Perlu Revisi",
        };
      case "dikumpulkan_revisi":
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          icon: RotateCcw,
          label: "Review Revisi",
        };
      case "dikumpulkan":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          icon: Clock,
          label: "Dikumpulkan",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          icon: FileWarning,
          label: "Belum",
        };
    }
  };

  const getDeadlineStatus = (deadlineRaw) => {
    if (!deadlineRaw || deadlineRaw === "-" || deadlineRaw === null) {
      return { text: "text-gray-500", label: "-", color: "gray" };
    }
    try {
      let deadlineDate;
      if (typeof deadlineRaw === "string") {
        if (deadlineRaw.includes(" ")) {
          const [datePart] = deadlineRaw.split(" ");
          const [year, month, day] = datePart.split("-");
          deadlineDate = new Date(year, month - 1, day);
        } else {
          deadlineDate = new Date(deadlineRaw);
        }
      } else {
        deadlineDate = new Date(deadlineRaw);
      }
      if (isNaN(deadlineDate.getTime())) {
        return { text: "text-gray-500", label: "-", color: "gray" };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { text: "text-red-600", label: "Terlewat", color: "red" };
      if (diffDays === 0) return { text: "text-red-500", label: "Hari Ini!", color: "red" };
      if (diffDays <= 3) return { text: "text-amber-600", label: `${diffDays} hari`, color: "amber" };
      return { text: "text-green-600", label: `${diffDays} hari`, color: "green" };
    } catch (error) {
      return { text: "text-gray-500", label: "-", color: "gray" };
    }
  };

  const getMainActionButton = (tugas) => {
    const baseClass =
      "flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm";
    
    if (tugas.status === "selesai") {
      return null;
    }
    if (tugas.status === "revisi") {
      return {
        text: "Kumpulkan Revisi",
        icon: <RotateCcw size="16" />,
        class: `${baseClass} bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-md`,
        action: () => navigate(`/peserta/tugas/${tugas.id}/kumpul`, { 
          state: { from: "daftar", isRevision: true, refresh: true } 
        }),
      };
    }
    if (
      tugas.status === "dikumpulkan" ||
      tugas.status === "dikumpulkan_revisi"
    ) {
      return {
        text: "Lihat",
        icon: <FileCheck size="16" />,
        class: `${baseClass} bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100`,
        action: () => navigate(`/peserta/tugas/${tugas.id}/kumpul`, { 
          state: { from: "daftar", refresh: true } 
        }),
      };
    }
    return {
      text: "Kumpulkan",
      icon: <Upload size="16" />,
      class: `${baseClass} bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-lg`,
      action: () => navigate(`/peserta/tugas/${tugas.id}/kumpul`, { 
        state: { from: "daftar", refresh: true } 
      }),
    };
  };

  const openDetailModal = (tugas) => {
    setSelectedTugas(tugas);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTugas(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTugas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTugas.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-6 py-5 min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative w-10 h-10 border-2 border-teal-400/30 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-6 py-5 space-y-6 pb-10 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-blue-700 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Daftar Tugas</h1>
              <p className="text-sm text-white/80">Kerjakan dan kumpulkan tugas tepat waktu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "belum_dikumpulkan", "dikumpulkan", "revisi", "selesai"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status === "all"
                  ? "Semua"
                  : status === "belum_dikumpulkan"
                  ? "Belum"
                  : status === "dikumpulkan"
                  ? "Dikumpulkan"
                  : status === "revisi"
                  ? "Revisi"
                  : "Selesai"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-700">{currentItems.length}</span> dari{" "}
          <span className="font-semibold text-gray-700">{filteredTugas.length}</span> tugas
        </p>
      </div>

      {/* Tugas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((tugas) => {
          const status = getStatusBadge(tugas.status);
          const StatusIcon = status.icon;
          const deadlineStatus = getDeadlineStatus(tugas.deadline_raw);
          const mainAction = getMainActionButton(tugas);

          const getCardTopColor = () => {
            if (tugas.status === "selesai") return "bg-gradient-to-r from-emerald-500 to-teal-500";
            if (tugas.status === "revisi") return "bg-gradient-to-r from-amber-500 to-orange-500";
            if (tugas.status === "dikumpulkan_revisi") return "bg-gradient-to-r from-amber-500 to-orange-500";
            if (tugas.status === "dikumpulkan") return "bg-gradient-to-r from-blue-500 to-indigo-500";
            return "bg-gradient-to-r from-teal-500 to-blue-600";
          };

          return (
            <div
              key={tugas.id}
              className="group relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${getCardTopColor()}`}></div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FileText size="16" className="text-teal-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">Tugas</span>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
                    <StatusIcon size="12" />
                    <span className="text-xs font-medium">{status.label}</span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-1">{tugas.judul}</h3>
                
                <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-400">
                  <User size="12" />
                  <span>{tugas.mentor_name || "Mentor"}</span>
                </div>

                <div className="mb-4 p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size="14" className="text-gray-500" />
                      <span className="text-xs text-gray-600">Deadline:</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-gray-700">{tugas.deadline_display}</span>
                      <div className={`text-xs font-bold ${deadlineStatus.text}`}>{deadlineStatus.label}</div>
                    </div>
                  </div>
                </div>

                {/* Indikator ringan untuk tugas yang dikumpulkan terlambat */}
                {tugas.isLate && tugas.status === "selesai" && (
                  <div className="mt-2 mb-3 text-xs text-amber-600 flex items-center gap-1">
                    <Clock size="12" />
                    <span>Dikumpulkan melewati deadline</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openDetailModal(tugas)}
                    className="flex-1 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <Eye size="16" />
                    Detail
                  </button>
                  
                  {mainAction && (
                    <button
                      onClick={mainAction.action}
                      className={mainAction.class}
                    >
                      {mainAction.icon}
                      {mainAction.text}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTugas.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-12 text-center">
          <ClipboardList size="48" className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada tugas</p>
          <p className="text-sm text-gray-400 mt-1">Tugas akan muncul setelah mentor memberikannya</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size="18" />
          </button>
          <div className="flex gap-1.5">
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={idx} className="w-9 h-9 flex items-center justify-center text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight size="18" />
          </button>
        </div>
      )}

      {/* Modal Detail Tugas */}
      {showDetailModal && selectedTugas && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeDetailModal}>
          <div
            className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <FileText size="18" className="text-teal-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">{selectedTugas.judul}</h2>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <User size="12" /> {selectedTugas.mentor_name || "Mentor"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size="12" /> Deadline: {selectedTugas.deadline_display}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={closeDetailModal} className="p-2 rounded-lg hover:bg-white/50">
                <X size="20" className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              {/* INFORMASI KETERLAMBATAN (hanya di detail, tanpa emoji) */}
              {selectedTugas.isLate && selectedTugas.status === "selesai" && (
                <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock size="16" className="text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 text-sm">Dikumpulkan Melewati Deadline</h4>
                      <p className="text-xs text-amber-700 mt-1">
                        Tugas ini dikumpulkan setelah batas waktu yang ditentukan.
                        {selectedTugas.submitted_at && (
                          <> Dikumpulkan pada {formatDateTime(selectedTugas.submitted_at)}</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* INSTRUKSI PENGERJAAN */}
              <div className="bg-blue-50/30 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText size="14" className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-base">Instruksi Pengerjaan</h3>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTugas.instruksi}
                </div>
                {selectedTugas.cara_pengerjaan && (
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <p className="text-sm font-medium text-blue-800 mb-1">Cara Pengerjaan:</p>
                    <p className="text-sm text-gray-600">{selectedTugas.cara_pengerjaan}</p>
                  </div>
                )}
              </div>

              {/* FILE & LINK DARI MENTOR */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <Paperclip size="14" className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Materi Penunjang</h3>
                </div>
                
                {selectedTugas.attachments && selectedTugas.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTugas.attachments.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            {item.type === "link" ? (
                              <LinkIcon size="14" className="text-purple-500" />
                            ) : (
                              <FileText size="14" className="text-teal-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 truncate max-w-[300px]">
                              {item.type === "link" ? item.url : item.name}
                            </p>
                            {item.type === "link" && (
                              <p className="text-xs text-purple-500 truncate max-w-[300px]">{item.url}</p>
                            )}
                          </div>
                        </div>
                        {item.type === "link" ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:shadow-md transition"
                          >
                            <ExternalLink size="12" /> Buka
                          </a>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownloadFile(item.url)}
                              className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:shadow-md transition"
                            >
                              <Download size="12" /> Download
                            </button>
                            <button
                              onClick={() => openPreview(item.url, item.name)}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-gray-300 transition"
                            >
                              <Eye size="12" /> Preview
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-400">Tidak ada materi penunjang</p>
                  </div>
                )}
              </div>

              {/* STATUS PENGUMPULAN */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <Upload size="14" className="text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Status Pengumpulan</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${
                        getStatusBadge(selectedTugas.status).bg
                      } ${getStatusBadge(selectedTugas.status).text}`}
                    >
                      {React.createElement(getStatusBadge(selectedTugas.status).icon, { size: 12 })}
                      <span className="text-xs font-medium">{getStatusBadge(selectedTugas.status).label}</span>
                    </div>
                  </div>

                  {selectedTugas.submitted_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarCheck size="14" className="text-green-600" />
                      <span className="text-gray-600">Dikumpulkan:</span>
                      <span className="text-gray-700 font-medium">{formatDateTime(selectedTugas.submitted_at)}</span>
                    </div>
                  )}

                  {(selectedTugas.file_jawaban_url || selectedTugas.link_jawaban) && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 mb-2">Jawaban yang telah dikirim:</p>
                      <div className="space-y-2">
                        {selectedTugas.file_jawaban_url && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200">
                            <div className="flex items-center gap-2">
                              <FileText size="14" className="text-green-600" />
                              <span className="text-sm text-gray-700">File Jawaban</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDownloadFile(selectedTugas.file_jawaban_url)}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg flex items-center gap-1"
                              >
                                <Download size="12" /> Download
                              </button>
                              <button
                                onClick={() => openPreview(selectedTugas.file_jawaban_url, "jawaban_tugas")}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg flex items-center gap-1"
                              >
                                <Eye size="12" /> Preview
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedTugas.link_jawaban && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200">
                            <div className="flex items-center gap-2">
                              <LinkIcon size="14" className="text-purple-600" />
                              <span className="text-sm text-gray-700 truncate max-w-[200px]">
                                {selectedTugas.link_jawaban}
                              </span>
                            </div>
                            <a
                              href={selectedTugas.link_jawaban}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg flex items-center gap-1"
                            >
                              <ExternalLink size="12" /> Buka
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CATATAN MENTOR */}
              {selectedTugas.catatan_mentor && (
                <div className={`rounded-xl p-5 border ${
                  selectedTugas.status === "revisi" 
                    ? "bg-amber-50 border-amber-200" 
                    : "bg-blue-50 border-blue-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size="16" className={selectedTugas.status === "revisi" ? "text-amber-600" : "text-blue-600"} />
                    <h3 className="font-semibold text-gray-800">
                      {selectedTugas.status === "revisi" ? "Catatan Revisi" : "Catatan Mentor"}
                    </h3>
                  </div>
                  <p className={`text-sm ${
                    selectedTugas.status === "revisi" ? "text-amber-700" : "text-gray-700"
                  }`}>
                    {selectedTugas.catatan_mentor}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={closeDetailModal}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Tutup
              </button>
              {selectedTugas.status !== "selesai" && (
                <button
                  onClick={() => {
                    closeDetailModal();
                    navigate(`/peserta/tugas/${selectedTugas.id}/kumpul`, {
                      state: { from: "detail", refresh: true, isRevision: selectedTugas.status === "revisi" }
                    });
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-md transition flex items-center gap-2"
                >
                  {selectedTugas.status === "revisi" ? <RotateCcw size="16" /> : <FileCheck size="16" />}
                  {selectedTugas.status === "revisi"
                    ? "Kumpulkan Revisi"
                    : selectedTugas.status === "dikumpulkan" ||
                      selectedTugas.status === "dikumpulkan_revisi"
                    ? "Lihat Jawaban"
                    : "Kumpulkan"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Fullscreen */}
      {isPreviewOpen && previewFile && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black">
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 z-[1000000] bg-white/20 hover:bg-white/30 rounded-lg p-2 text-white transition backdrop-blur-sm"
            title="Tutup"
          >
            <X size="24" />
          </button>
          
          <iframe
            src={previewFile.url}
            title={previewFile.name}
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>,
        document.body
      )}
    </div>
  );
}

export default DaftarTugas;