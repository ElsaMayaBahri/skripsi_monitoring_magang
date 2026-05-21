// src/pages/peserta/MateriMentor.jsx
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Eye,
  Calendar,
  User,
  FileText,
  Video,
  File,
  ChevronRight,
  ChevronLeft,
  Search,
  Clock,
  CheckCircle,
  Lock,
  Play,
  AlertCircle,
  Server,
  Download,
  X,
  FileCode,
  FileSpreadsheet,
  FileImage,
  Link as LinkIcon,
  ExternalLink,
  FormInput,
  Loader2,
} from "lucide-react";
import {
  getMateriPeserta,
  getMateriPesertaById,
  tandaiMateriSelesai,
} from "../../api/peserta/materiService";

function MateriMentor() {
  const [loading, setLoading] = useState(true);
  const [materiList, setMateriList] = useState([]);
  const [filteredMateri, setFilteredMateri] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [markingAsSelesai, setMarkingAsSelesai] = useState(false);
  const itemsPerPage = 6;

  // Gunakan API real
  const USE_REAL_API = true;

  useEffect(() => {
    loadMateriFromAPI();
  }, []);

  // Load materi dari API menggunakan service yang sudah dibuat
  const loadMateriFromAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMateriPeserta();
      console.log("API Response:", response);

      if (response.success && response.data) {
        // Transform API response ke format yang digunakan frontend
        const transformedMateri = response.data.map((item) => ({
          id: item.id_materi,
          judul: item.judul,
          deskripsi: item.deskripsi || "Tidak ada deskripsi",
          tipe: getFileType(item),
          durasi: null,
          file_size: null,
          created_at: formatDate(item.created_at),
          mentor: item.mentor?.user?.nama || item.mentor?.nama || "Mentor",
          is_accessed: item.is_accessed || false,
          file_url: getFileUrl(item),
          file_type: getFileType(item),
          file_name: getFileName(item),
          link: item.link,
          views: item.views || 0,
          file_materi: item.file_materi,
        }));

        setMateriList(transformedMateri);
        setFilteredMateri(transformedMateri);

        // Load accessed status dari localStorage
        loadAccessedStatus(transformedMateri);
      } else {
        setError(response.message || "Gagal memuat data materi");
      }
    } catch (err) {
      console.error("Error loading materi:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat memuat materi",
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper: Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper: Get file URL based on materi type
const getFileUrl = (item) => {
  if (item.tipe_materi === 'link') return item.link;
  if (item.file_materi) {
    const filename = item.file_materi.split('/').pop();
    let baseUrl = 'http://localhost:8000';
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
      baseUrl = process.env.REACT_APP_API_URL;
    }
    baseUrl = baseUrl.replace(/\/$/, '');
    // ✅ TAMBAHKAN /api
    return `${baseUrl}/api/materi-file/${filename}`;
  }
  return '#';
};

  // Helper: Get file type
  const getFileType = (item) => {
    if (item.tipe_materi === "video") return "video";
    if (item.tipe_materi === "link") return "link";
    if (item.file_materi) {
      const ext = item.file_materi.split(".").pop().toLowerCase();
      const typeMap = {
        pdf: "pdf",
        doc: "doc",
        docx: "doc",
        xls: "excel",
        xlsx: "excel",
        ppt: "ppt",
        pptx: "ppt",
        mp4: "video",
        mov: "video",
        avi: "video",
        webm: "video",
      };
      return typeMap[ext] || "dokumen";
    }
    return "dokumen";
  };

  // Helper: Get file name
  const getFileName = (item) => {
    if (item.file_materi) {
      return item.file_materi.split("/").pop();
    }
    return item.judul;
  };

  // Load accessed status dari localStorage
  const loadAccessedStatus = (materiList) => {
    const savedAccessed = localStorage.getItem("materi_accessed_ids");
    if (savedAccessed) {
      const accessedIds = JSON.parse(savedAccessed);
      const updatedMateri = materiList.map((m) => ({
        ...m,
        is_accessed: accessedIds.includes(m.id) || m.is_accessed,
      }));
      setMateriList(updatedMateri);
      setFilteredMateri(updatedMateri);
    }
  };

  // Filter materi berdasarkan search dan tipe
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
        return <FileCode size="16" className="text-blue-600" />;
      case "excel":
        return <FileSpreadsheet size="16" className="text-green-600" />;
      case "ppt":
        return <FileImage size="16" className="text-orange-600" />;
      case "link":
        return <LinkIcon size="16" className="text-purple-500" />;
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
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Mark as accessed (local + API)
  const markAsAccessed = async (id) => {
    // Update local state
    const updatedMateri = materiList.map((m) =>
      m.id === id ? { ...m, is_accessed: true } : m,
    );
    setMateriList(updatedMateri);

    // Save to localStorage
    const accessedIds = updatedMateri
      .filter((m) => m.is_accessed)
      .map((m) => m.id);
    localStorage.setItem("materi_accessed_ids", JSON.stringify(accessedIds));

    // Kirim ke backend jika menggunakan API real
    if (USE_REAL_API) {
      try {
        await tandaiMateriSelesai(id);
        console.log(`Materi ${id} marked as completed on server`);
      } catch (err) {
        console.error("Failed to mark as completed on server:", err);
      }
    }
  };

const openMateri = (materi) => {
  if (materi.tipe === 'link') {
    window.open(materi.link, '_blank');
  } else {
    window.open(materi.file_url, '_blank');
  }
  // Juga tandai sebagai diakses jika perlu
  if (!materi.is_accessed) markAsAccessed(materi.id);
}

  const closeModal = () => {
    setShowModal(false);
    setSelectedMateri(null);
  };

  const handleDownload = async (materi) => {
    if (!materi.file_url || materi.file_url === "#") {
      alert("File tidak tersedia untuk diunduh");
      return;
    }
    try {
      const response = await fetch(materi.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = materi.file_name || materi.judul;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download gagal:", error);
      alert("Gagal mengunduh file. Silakan coba lagi.");
    }
  };

  const handleMarkAsSelesai = async () => {
    if (!selectedMateri) return;

    setMarkingAsSelesai(true);
    try {
      if (USE_REAL_API) {
        await tandaiMateriSelesai(selectedMateri.id);
      }

      // Update local state
      await markAsAccessed(selectedMateri.id);
      setSelectedMateri({ ...selectedMateri, is_accessed: true });

      alert("Materi berhasil ditandai selesai!");
    } catch (err) {
      console.error("Error marking as completed:", err);
      alert("Gagal menandai materi selesai. Silakan coba lagi.");
    } finally {
      setMarkingAsSelesai(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMateri.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMateri.length / itemsPerPage);

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
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative w-10 h-10 border-2 border-teal-400/30 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error && USE_REAL_API) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-6 py-5">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" size="24" />
            <div>
              <h3 className="font-semibold text-red-800">Gagal Memuat Data</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={() => loadMateriFromAPI()}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-6 py-5 space-y-5 pb-10 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/5 to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
              Materi Mentor
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Materi pembelajaran dari mentor pembimbing
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari materi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "all" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedType("video")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "video" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Video
            </button>
            <button
              onClick={() => setSelectedType("pdf")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "pdf" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              PDF
            </button>
            <button
              onClick={() => setSelectedType("link")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedType === "link" ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Link
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan{" "}
          <span className="font-semibold text-gray-700">
            {currentItems.length}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-gray-700">
            {filteredMateri.length}
          </span>{" "}
          materi
        </p>
        {filteredMateri.length > 0 && (
          <p className="text-xs text-gray-400">
            Halaman {currentPage} dari {totalPages}
          </p>
        )}
      </div>

      {/* Materi Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentItems.map((materi) => (
          <div
            key={materi.id}
            onClick={() => openMateri(materi)}
            className="group relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getTypeColor(materi.tipe)}`}
            ></div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    {getTypeIcon(materi.tipe)}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 uppercase">
                    {getTypeLabel(materi.tipe)}
                  </span>
                </div>
                {materi.is_accessed ? (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50">
                    <CheckCircle size="8" className="text-emerald-600" />
                    <span className="text-[8px] font-medium text-emerald-600">
                      Sudah
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50">
                    <Lock size="8" className="text-amber-600" />
                    <span className="text-[8px] font-medium text-amber-600">
                      Belum
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                {materi.judul}
              </h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {materi.deskripsi}
              </p>

              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <Calendar size="10" />
                  <span>{materi.created_at}</span>
                  {materi.views > 0 && (
                    <>
                      <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                      <Eye size="10" />
                      <span>{materi.views} dilihat</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <User size="10" />
                  <span>{materi.mentor}</span>
                </div>
              </div>

              <button className="w-full py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2">
                {materi.is_accessed ? (
                  materi.tipe === "video" ? (
                    <Play size="14" />
                  ) : (
                    <Eye size="14" />
                  )
                ) : (
                  <Lock size="14" />
                )}
                {materi.is_accessed ? "Lihat Materi" : "Akses Materi"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMateri.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 py-12 text-center">
          <BookOpen size="48" className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada materi</p>
          <p className="text-sm text-gray-400 mt-1">
            Materi akan muncul setelah mentor membagikannya
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size="18" />
          </button>

          <div className="flex gap-1.5">
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={idx}
                  className="w-9 h-9 flex items-center justify-center text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
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
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size="18" />
          </button>
        </div>
      )}

      {/* Modal Detail Materi */}
      {showModal && selectedMateri && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  {getTypeIcon(selectedMateri.tipe)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">
                    {selectedMateri.judul}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Oleh: {selectedMateri.mentor} • {selectedMateri.created_at}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/50 transition"
              >
                <X size="20" className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Deskripsi */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 text-sm mb-2">
                  📖 Deskripsi Materi
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedMateri.deskripsi}
                </p>
              </div>

              {/* Konten Materi */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">
                  📄 Konten Materi
                </h3>

                {/* Video */}
                {selectedMateri.tipe === "video" && (
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    {selectedMateri.file_url &&
                    selectedMateri.file_url.includes("youtube.com") ? (
                      <iframe
                        src={selectedMateri.file_url}
                        className="w-full h-full"
                        title={selectedMateri.judul}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video controls className="w-full h-full">
                        <source src={selectedMateri.file_url} />
                        Browser Anda tidak mendukung video tag.
                      </video>
                    )}
                  </div>
                )}

                {/* PDF Preview */}
                {selectedMateri.tipe === "pdf" && (
                  <div className="h-[500px] border rounded-lg overflow-hidden">
                    <iframe
                      src={`${selectedMateri.file_url}#toolbar=1`}
                      className="w-full h-full"
                      title={selectedMateri.judul}
                    />
                  </div>
                )}

                {/* Link */}
                {selectedMateri.tipe === "link" && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
                    <LinkIcon
                      size="48"
                      className="text-purple-400 mx-auto mb-3"
                    />
                    <p className="text-gray-600 mb-4">
                      🔗 Materi berupa link eksternal
                    </p>
                    <a
                      href={selectedMateri.link || selectedMateri.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      Buka Link
                      <ExternalLink size="14" />
                    </a>
                  </div>
                )}

                {/* Dokumen (Word, Excel, PPT) */}
{["doc", "excel", "ppt"].includes(selectedMateri.tipe) && (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
      {getTypeIcon(selectedMateri.tipe)}
    </div>
    <p className="text-gray-700 font-medium mb-1">
      {selectedMateri.file_name || selectedMateri.judul}
    </p>
    <p className="text-xs text-gray-400 mb-4">
      Pratinjau tidak tersedia untuk file ini. Silakan unduh untuk melihat.
    </p>
    <button 
      onClick={() => handleDownload(selectedMateri)}
      className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
    >
      <Download size="16" />
      Download File
    </button>
  </div>
)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              {!selectedMateri.is_accessed && (
                <button
                  onClick={handleMarkAsSelesai}
                  disabled={markingAsSelesai}
                  className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center gap-2"
                >
                  {markingAsSelesai ? (
                    <Loader2 size="16" className="animate-spin" />
                  ) : (
                    <CheckCircle size="16" />
                  )}
                  Tandai Selesai
                </button>
              )}

              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MateriMentor;
