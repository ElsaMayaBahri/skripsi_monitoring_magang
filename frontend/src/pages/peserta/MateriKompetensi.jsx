// src/pages/peserta/MateriKompetensi.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Eye,
  Lock,
  CheckCircle,
  Calendar,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
  Zap,
  Sparkles,
  FileText,
  X,
  AlertTriangle,
  Video,
  File,
  Download,
  Link as LinkIcon,
  ExternalLink,
  Play,
  User,
  Server,
} from "lucide-react";
import {
  getMateriKompetensi,
  markMateriKompetensiAccessed,
} from "../../api/peserta/materiKompetensiService";

// Base URL
const BASE_URL = "http://localhost:8000";

// Helper untuk mendapatkan URL file - langsung pakai dari backend
const getFileUrl = (item) => {
  return item.file_url || "#";
};

function MateriKompetensi() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [materiList, setMateriList] = useState([]);
  const [filteredMateri, setFilteredMateri] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [backendError, setBackendError] = useState(false);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    loadMateriData();
  }, []);

  const loadMateriData = async () => {
    setLoading(true);
    setBackendError(false);

    try {
      const response = await getMateriKompetensi();

      if (response.success && response.data && response.data.length > 0) {
        const formattedData = response.data.map((item) => ({
          id: item.id_materi || item.id,
          judul: item.judul,
          deskripsi: item.deskripsi,
          tipe: item.tipe || "pdf",
          durasi: item.durasi,
          file_size: item.file_size,
          created_at: item.created_at
            ? item.created_at.split("T")[0]
            : "2025-01-01",
          coo: item.coo || "COO Kuanta Academy",
          is_accessed: item.is_accessed || false,
          is_locked: item.is_locked || false,
          can_access: item.can_access ?? true,
          locked_message: item.locked_message || "",
          urutan: item.urutan || 1,
          quiz_available: item.quiz_available || false,
          quiz_id: item.quiz_id,
          file_url: getFileUrl(item),
          file_name: item.file_name,
          file_path: item.file_materi,
          konten: item.konten || "",
        }));

        setMateriList(formattedData);
        setFilteredMateri(formattedData);
      } else {
        console.log("Backend belum siap, menggunakan dummy data");
        setBackendError(true);
        loadDummyData();
      }
    } catch (err) {
      console.error("Error load materi:", err);
      setBackendError(true);
      loadDummyData();
    } finally {
      setLoading(false);
    }
  };

  const loadDummyData = () => {
    const dummyMateri = [
      {
        id: 1,
        judul: "Fundamental JavaScript untuk Kompetensi",
        deskripsi:
          "Mempelajari konsep dasar JavaScript yang akan diujikan dalam ujian kompetensi",
        tipe: "video",
        durasi: "60 menit",
        file_size: "120 MB",
        created_at: "2025-05-01",
        coo: "COO Kuanta Academy",
        is_accessed: false,
        quiz_available: true,
        quiz_id: 1,
        file_url: "https://www.youtube.com/embed/SqcY0GlETPk",
        file_name: "javascript_fundamental.mp4",
        konten:
          "JavaScript adalah bahasa pemrograman yang wajib dikuasai untuk ujian kompetensi...",
      },
      {
        id: 2,
        judul: "Panduan Ujian Kompetensi 2025",
        deskripsi: "Dokumen panduan lengkap pelaksanaan ujian kompetensi",
        tipe: "pdf",
        durasi: null,
        file_size: "2.5 MB",
        created_at: "2025-05-05",
        coo: "COO Kuanta Academy",
        is_accessed: false,
        quiz_available: true,
        quiz_id: 2,
        file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        file_name: "panduan_ujian_kompetensi.pdf",
        konten: "Panduan lengkap ujian kompetensi...",
      },
      {
        id: 3,
        judul: "Template Laporan Ujian",
        deskripsi: "Template dokumen Word untuk laporan ujian kompetensi",
        tipe: "doc",
        durasi: null,
        file_size: "1.8 MB",
        created_at: "2025-05-10",
        coo: "COO Kuanta Academy",
        is_accessed: false,
        quiz_available: true,
        quiz_id: 3,
        file_url: "#",
        file_name: "template_laporan_ujian.docx",
        konten: "Template laporan ujian kompetensi",
      },
      {
        id: 4,
        judul: "React JS - Ujian Kompetensi",
        deskripsi: "Materi React JS untuk persiapan ujian kompetensi frontend",
        tipe: "video",
        durasi: "90 menit",
        file_size: "250 MB",
        created_at: "2025-05-12",
        coo: "COO Kuanta Academy",
        is_accessed: false,
        quiz_available: true,
        quiz_id: 4,
        file_url: "https://www.youtube.com/embed/CVpUuw9XSjY",
        file_name: "react_tutorial.mp4",
        konten: "React JS adalah library untuk membangun UI...",
      },
      {
        id: 5,
        judul: "Tailwind CSS - Kompetensi",
        deskripsi: "Materi Tailwind CSS untuk ujian praktik",
        tipe: "pdf",
        durasi: null,
        file_size: "3.2 MB",
        created_at: "2025-05-15",
        coo: "COO Kuanta Academy",
        is_accessed: false,
        quiz_available: true,
        quiz_id: 5,
        file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        file_name: "tailwind_kompetensi.pdf",
        konten: "Tailwind CSS adalah framework CSS utility-first...",
      },
      {
        id: 6,
        judul: "Form Pendaftaran Ujian",
        deskripsi: "Google Form untuk pendaftaran ujian kompetensi",
        tipe: "google_form",
        durasi: null,
        file_size: null,
        created_at: "2025-05-18",
        coo: "COO Kuanta Academy",
        is_accessed: false,
        quiz_available: true,
        quiz_id: 6,
        file_url: "https://docs.google.com/forms/d/e/1FAIpQLSdummy/viewform",
        file_name: null,
        konten: "Pendaftaran ujian kompetensi",
      },
    ];

    setMateriList(dummyMateri);
    setFilteredMateri(dummyMateri);
  };

  useEffect(() => {
    let filtered = [...materiList];

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((m) => m.tipe === selectedType);
    }

    setFilteredMateri(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedType, materiList]);

  const getTypeIcon = (tipe) => {
    switch (tipe) {
      case "video":
        return <Video size="16" className="text-blue-500" />;
      case "pdf":
        return <FileText size="16" className="text-red-500" />;
      case "doc":
        return <FileText size="16" className="text-blue-600" />;
      case "excel":
        return <FileText size="16" className="text-green-600" />;
      case "ppt":
        return <FileText size="16" className="text-orange-600" />;
      case "link":
        return <LinkIcon size="16" className="text-purple-500" />;
      case "google_form":
        return <LinkIcon size="16" className="text-indigo-500" />;
      default:
        return <File size="16" className="text-gray-500" />;
    }
  };

  const getTypeLabel = (tipe) => {
    switch (tipe) {
      case "video":
        return "Video";
      case "pdf":
        return "PDF";
      case "doc":
        return "Word";
      case "excel":
        return "Excel";
      case "ppt":
        return "PowerPoint";
      case "link":
        return "Link";
      case "google_form":
        return "Google Form";
      default:
        return "Materi";
    }
  };

  const getTypeColor = (tipe) => {
    switch (tipe) {
      case "video":
        return "from-blue-500 to-cyan-500";
      case "pdf":
        return "from-red-500 to-orange-500";
      case "doc":
        return "from-blue-600 to-indigo-600";
      case "excel":
        return "from-green-500 to-emerald-500";
      case "ppt":
        return "from-orange-500 to-red-500";
      case "link":
        return "from-purple-500 to-pink-500";
      case "google_form":
        return "from-indigo-500 to-purple-500";
      default:
        return "from-teal-500 to-blue-600";
    }
  };

  const handleAksesMateri = async (materi) => {
    if (materi.is_locked) {
      return;
    }

    setSelectedMateri(materi);
    setShowDetailModal(true);
    
    // Dispatch event saat modal dibuka
    window.dispatchEvent(new CustomEvent("preview-modal-open"));

    if (!materi.is_accessed) {
      try {
        const response = await markMateriKompetensiAccessed(materi.id);

        if (response.success) {
          setSelectedMateri({ ...materi, is_accessed: true });
          await loadMateriData();
        }
      } catch (err) {
        console.error("Error mark accessed:", err);
      }
    }
  };

  // PERBAIKAN: Untuk file DOC/Excel/PPT - hanya download, tidak buka tab baru
  const handleDownload = async (materi) => {
    if (!materi.file_url || materi.file_url === "#") {
      alert("File tidak tersedia");
      return;
    }

    // Langsung download tanpa buka tab baru
    try {
      const response = await fetch(materi.file_url);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = materi.file_name || `materi.${materi.tipe}`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download gagal:", error);
      // Fallback: buka di tab baru jika fetch gagal
      window.open(materi.file_url, "_blank");
    }
  };

  // Untuk membuka file di tab baru (PDF, Video, Google Form)
  const handleOpenInNewTab = (materi) => {
    if (!materi.file_url || materi.file_url === "#") {
      alert("File tidak tersedia");
      return;
    }
    window.open(materi.file_url, "_blank");
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedMateri(null);
    
    // Dispatch event saat modal ditutup
    window.dispatchEvent(new CustomEvent("preview-modal-close"));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMateri.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMateri.length / itemsPerPage);

  const accessedCount = materiList.filter((m) => m.is_accessed).length;
  const totalCount = materiList.length;
  const progress = totalCount > 0 ? Math.round((accessedCount / totalCount) * 100) : 0;

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

  if (loading && materiList.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative w-10 h-10 border-2 border-teal-400/30 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-5 md:p-6">
      {/* Header */}
      <div className="w-full rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold">Materi Kompetensi</h1>
              <p className="text-white/80 text-xs mt-0.5">
                Materi pelatihan kompetensi dari COO
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIF BACKEND */}
      {backendError && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
          <div className="flex items-start gap-3">
            <Server size="18" className="text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Mode Development - Data Dummy
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Backend API belum terhubung. Menampilkan data dummy untuk testing tampilan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Card */}
      <div className="bg-white rounded-xl shadow-md border border-teal-100 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Target size="14" className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700">
                Progress Belajar Kompetensi
              </p>
            </div>
          </div>
          <p className="text-lg font-bold text-teal-600">{progress}%</p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          {accessedCount} dari {totalCount} materi telah diakses
        </p>
        {progress === 100 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 mt-2 w-fit">
            <Award size="12" className="text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600">
              Siap Uji Kompetensi!
            </span>
          </div>
        )}
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari materi kompetensi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedType === "all" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedType("video")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedType === "video" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Video
            </button>
            <button
              onClick={() => setSelectedType("pdf")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedType === "pdf" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              PDF
            </button>
            <button
              onClick={() => setSelectedType("doc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedType === "doc" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Word
            </button>
            <button
              onClick={() => setSelectedType("google_form")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedType === "google_form" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Form
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-3">
        <p className="text-xs text-gray-500">
          Menampilkan{" "}
          <span className="font-semibold text-gray-700">{currentItems.length}</span>{" "}
          dari{" "}
          <span className="font-semibold text-gray-700">{filteredMateri.length}</span>{" "}
          materi kompetensi
        </p>
      </div>

      {/* Materi Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentItems.map((materi) => (
          <div
            key={materi.id}
            onClick={() => {
              if (!materi.is_locked) {
                handleAksesMateri(materi);
              }
            }}
            className={`group relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 ${
              materi.is_locked
                ? "opacity-70 cursor-not-allowed"
                : "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            }`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getTypeColor(materi.tipe)}`}
            ></div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    {getTypeIcon(materi.tipe)}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 uppercase">
                    {getTypeLabel(materi.tipe)}
                  </span>
                </div>
                {materi.is_locked ? (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100">
                    <Lock size="8" className="text-gray-500" />
                    <span className="text-[8px] font-medium text-gray-500">
                      Terkunci
                    </span>
                  </div>
                ) : materi.is_accessed ? (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100">
                    <CheckCircle size="8" className="text-emerald-600" />
                    <span className="text-[8px] font-medium text-emerald-600">
                      Sudah
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-100">
                    <Eye size="8" className="text-blue-600" />
                    <span className="text-[8px] font-medium text-blue-600">
                      Terbuka
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
                {materi.judul}
              </h3>
              {materi.is_locked && (
                <p className="mb-3 text-[11px] text-red-500">
                  {materi.locked_message ||
                    "Selesaikan materi sebelumnya terlebih dahulu."}
                </p>
              )}

              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <Calendar size="10" />
                  <span>{materi.created_at}</span>
                  {materi.durasi && (
                    <>
                      <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                      <Clock size="10" />
                      <span>{materi.durasi}</span>
                    </>
                  )}
                  {materi.file_size && (
                    <>
                      <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                      <File size="10" />
                      <span>{materi.file_size}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <User size="10" />
                  <span>{materi.coo}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!materi.is_locked) {
                    handleAksesMateri(materi);
                  }
                }}
                disabled={materi.is_locked}
                className={`w-full px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  materi.is_locked
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : materi.is_accessed
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md"
                }`}
              >
                {materi.is_locked ? (
                  <>
                    <Lock size={14} />
                    Terkunci
                  </>
                ) : materi.is_accessed ? (
                  <>
                    <CheckCircle size={14} />
                    Sudah Dibaca
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    Baca Materi
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMateri.length === 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 py-10 text-center">
          <GraduationCap size="40" className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium text-sm">
            Belum ada materi kompetensi
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Materi akan muncul sesuai jadwal dari COO
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size="14" />
          </button>

          <div className="flex gap-1">
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={idx}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs"
                >
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight size="14" />
          </button>
        </div>
      )}

      {/* Modal Detail Materi - FULLSCREEN CLEAN VERSION */}
      {showDetailModal && selectedMateri && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]"
          onClick={closeModal}
        >
          <div
            className="bg-white w-screen h-screen overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Compact */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-blue-50/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  {getTypeIcon(selectedMateri.tipe)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">
                    {selectedMateri.judul}
                  </h2>
                  <p className="text-[10px] text-gray-500">
                    {selectedMateri.coo} • {selectedMateri.created_at}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-white/50 transition"
              >
                <X size="18" className="text-gray-500" />
              </button>
            </div>

            {/* Deskripsi - Hanya tampil jika ada dan tidak kosong */}
            {selectedMateri.deskripsi &&
              selectedMateri.deskripsi !== "Tidak ada deskripsi" &&
              selectedMateri.deskripsi.trim() !== "" && (
                <div className="bg-white px-5 py-2 border-b border-gray-200 flex-shrink-0">
                  <p className="text-gray-600 text-sm">
                    {selectedMateri.deskripsi}
                  </p>
                </div>
              )}

            {/* Konten Materi - FULLSCREEN */}
            {selectedMateri.tipe === "video" &&
              selectedMateri.file_url &&
              selectedMateri.file_url !== "#" && (
                <div className="flex-1 bg-black overflow-hidden relative">
                  <iframe
                    src={selectedMateri.file_url}
                    title={selectedMateri.judul}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

            {selectedMateri.tipe === "pdf" && selectedMateri.file_url && selectedMateri.file_url !== "#" && (
              <div className="flex-1 w-full overflow-hidden bg-[#525659]">
                <embed
                  src={`${selectedMateri.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
                  type="application/pdf"
                  className="w-full h-full"
                />
              </div>
            )}

            {selectedMateri.tipe === "google_form" && selectedMateri.file_url && (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                <div className="text-center max-w-md">
                  <LinkIcon size="64" className="text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Google Form
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Materi berupa Google Form untuk pendaftaran/asesmen
                  </p>
                  <button
                    onClick={() => handleOpenInNewTab(selectedMateri)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Buka Google Form
                    <ExternalLink size="16" />
                  </button>
                </div>
              </div>
            )}

            {["doc", "excel", "ppt"].includes(selectedMateri.tipe) && (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    {getTypeIcon(selectedMateri.tipe)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {getTypeLabel(selectedMateri.tipe)}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {selectedMateri.file_name || selectedMateri.judul}
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    Ukuran file: {selectedMateri.file_size || "Tidak diketahui"}
                  </p>
                  <button
                    onClick={() => handleDownload(selectedMateri)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    <Download size="16" />
                    Download File
                  </button>
                </div>
              </div>
            )}

            {/* Jika tidak ada konten sama sekali */}
            {(!selectedMateri.file_url || selectedMateri.file_url === "#") && 
             !["doc", "excel", "ppt"].includes(selectedMateri.tipe) && 
             selectedMateri.tipe !== "video" && 
             selectedMateri.tipe !== "pdf" && 
             selectedMateri.tipe !== "google_form" && (
              <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
                <div className="text-center">
                  <AlertTriangle size="48" className="text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600">File materi tidak tersedia</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Silakan hubungi COO untuk informasi lebih lanjut.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Footer - Tombol Kuis (jika ada) */}
            {selectedMateri.is_accessed && selectedMateri.quiz_available && selectedMateri.quiz_id && (
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-white flex-shrink-0">
                <button
                  onClick={() => {
                    closeModal();
                    navigate(`/peserta/kuis-kompetensi/${selectedMateri.quiz_id}`);
                  }}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <Zap size="14" />
                  Ikuti Kuis
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MateriKompetensi;