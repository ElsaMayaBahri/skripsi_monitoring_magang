// src/pages/mentor/LaporanAkhir.jsx
import React, { useState, useEffect } from "react";
import {
  FileText,
  Eye,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  FileCheck,
  FileX,
  Maximize2,
  Minimize2,
  X,
  Lock
} from "lucide-react";
import axiosInstance from "../../api/axios";

const BASE_URL = "http://localhost:8000";

// Helper function untuk mendapatkan URL preview
const getPreviewUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;
  let cleanPath = filePath.replace(/^\/?storage\//, "");
  return `${BASE_URL}/api/storage/preview/${cleanPath}`;
};

function LaporanAkhir() {
  const [loading, setLoading] = useState(true);
  const [laporan, setLaporan] = useState([]);
  const [filteredLaporan, setFilteredLaporan] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch laporan akhir dari backend
  const fetchLaporanAkhir = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/mentor/laporan-akhir");
      console.log("Laporan Akhir Response:", response.data);
      
      if (response.data.success && response.data.data) {
        const formattedData = response.data.data.map(item => ({
          id: item.id_pengumpulan || item.id,
          peserta_id: item.id_peserta,
          peserta_nama: item.peserta_nama || item.nama_peserta || "Tidak diketahui",
          peserta_divisi: item.peserta_divisi || item.divisi || "",
          judul: item.judul_laporan || "Laporan Akhir Magang",
          file_path: item.file_url,
          file_name: item.file_url
            ? item.file_url.split('/').pop()
            : null,
          status: item.file_url ? "sudah_dikumpulkan" : "belum_dikumpulkan",
          submitted_at: item.submitted_at || item.created_at,
        }));
        setLaporan(formattedData);
        setFilteredLaporan(formattedData);
      }
    } catch (error) {
      console.error("Error fetching laporan akhir:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanAkhir();
  }, []);

  // Filter laporan
  useEffect(() => {
    let filtered = [...laporan];
    
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.peserta_nama.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(l => l.status === filterStatus);
    }
    
    setFilteredLaporan(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, laporan]);

  // Handle preview (hanya jika sudah kumpul)
  const handlePreview = (laporanItem) => {
    if (!isSubmitted(laporanItem)) {
      alert("Peserta belum mengumpulkan laporan akhir");
      return;
    }
    
    if (laporanItem.file_path) {
      const previewUrlFile = getPreviewUrl(laporanItem.file_path);
      setPreviewUrl(previewUrlFile);
      setSelectedLaporan(laporanItem);
      setShowPreview(true);
      
      // trigger layout fullscreen mode
      window.dispatchEvent(new Event('preview-modal-open'));
      
      // lock scroll
      document.body.style.overflow = 'hidden';
      document.body.classList.add('preview-mode');
    } else {
      alert("File tidak tersedia untuk dipreview");
    }
  };

  // Handle download (langsung ke laptop, tidak buka tab baru, tanpa alert)
  const handleDownload = async (laporanItem) => {
    if (!isSubmitted(laporanItem)) {
      return;
    }

    if (!laporanItem.file_name) {
      return;
    }

    setDownloading(laporanItem.id);

    try {
      // Gunakan endpoint backend untuk download (menghindari CORS)
      const filename = laporanItem.file_name;
      const response = await fetch(`${BASE_URL}/api/laporan/download/${filename}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Gunakan judul sebagai nama file download
      link.download = `${laporanItem.judul || 'laporan_akhir'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Tidak ada alert atau popup, langsung download
    } catch (error) {
      console.error("Download error:", error);
      // Fallback jika API gagal, coba langsung akses storage
      if (laporanItem.file_path) {
        window.open(laporanItem.file_path, "_blank");
      }
    } finally {
      setDownloading(null);
    }
  };

  // Cek apakah sudah submit laporan
  const isSubmitted = (item) => {
    return item.status === "sudah_dikumpulkan" && item.file_path;
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewUrl("");
    setSelectedLaporan(null);
    
    // restore layout
    window.dispatchEvent(new Event('preview-modal-close'));
    
    // restore scroll
    document.body.style.overflow = '';
    document.body.classList.remove('preview-mode');
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    const previewElement = document.getElementById("preview-container");
    if (!isFullscreen) {
      if (previewElement?.requestFullscreen) previewElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Status badge
  const getStatusBadge = (status) => {
    if (status === "belum_dikumpulkan") {
      return { bg: "bg-slate-100", text: "text-slate-500", icon: FileX, label: "Belum Kumpul" };
    }
    return { bg: "bg-emerald-50", text: "text-emerald-600", icon: FileCheck, label: "Sudah Kumpul" };
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLaporan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLaporan.length / itemsPerPage);

  // Statistik
  const stats = {
    total: laporan.length,
    submitted: laporan.filter(l => l.status === "sudah_dikumpulkan").length,
    notSubmitted: laporan.filter(l => l.status === "belum_dikumpulkan").length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
        <div className="relative p-6 lg:p-8 max-w-[1400px] mx-auto">
          
          {/* Success Message - Hanya untuk error, tidak untuk sukses download */}
          {successMessage && (
            <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-300">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-2xl p-4 flex items-center gap-3 min-w-[320px]">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileX className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Error!</p>
                  <p className="text-white/80 text-xs">{successMessage}</p>
                </div>
                <button onClick={() => setSuccessMessage("")} className="text-white/70 hover:text-white">
                  <X size="16" />
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="relative mb-8 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
            <div className="relative px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur-md opacity-50"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Laporan Akhir Magang
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">Lihat dan download laporan akhir yang telah dikumpulkan peserta</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg p-4 text-center">
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs text-slate-500 mt-1">Total Peserta</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.submitted}</p>
              <p className="text-xs text-slate-500 mt-1">Sudah Kumpul</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-4 text-center">
              <p className="text-3xl font-bold text-white">{stats.notSubmitted}</p>
              <p className="text-xs text-white/80 mt-1">Belum Kumpul</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari peserta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                  <button 
                    onClick={() => setFilterStatus("all")} 
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filterStatus === "all" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}
                  >
                    Semua ({stats.total})
                  </button>
                  <button 
                    onClick={() => setFilterStatus("sudah_dikumpulkan")} 
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filterStatus === "sudah_dikumpulkan" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}
                  >
                    Sudah Kumpul ({stats.submitted})
                  </button>
                  <button 
                    onClick={() => setFilterStatus("belum_dikumpulkan")} 
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filterStatus === "belum_dikumpulkan" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}
                  >
                    Belum Kumpul ({stats.notSubmitted})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-5">
            <p className="text-sm text-slate-500">
              Menampilkan {currentItems.length} dari {filteredLaporan.length} laporan
            </p>
          </div>

          {/* Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tgl Kumpul</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((item, index) => {
                    const status = getStatusBadge(item.status);
                    const StatusIcon = status.icon;
                    const isDownloading = downloading === item.id;
                    const submitted = isSubmitted(item);
                    
                    return (
                      <tr key={item.id || item.peserta_id || `row-${index}`} className="transition-all duration-300 group hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {item.peserta_nama?.charAt(0) || "P"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{item.peserta_nama}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {item.peserta_divisi || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {submitted ? (
                            <div>
                              <p className="text-xs font-semibold text-slate-800">
                                {item.judul}
                              </p>
                              <p className="text-xs text-slate-400 truncate max-w-[220px]">
                                {item.file_name}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {submitted && item.submitted_at ? (
                            <div className="flex items-center gap-2">
                              <Calendar size="12" className="text-teal-500" />
                              <span className="text-xs font-medium text-slate-600">{formatDateTime(item.submitted_at)}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 flex items-center gap-2">
                              <Calendar size="12" className="text-slate-400" />
                              Belum kumpul
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${status.bg} ${status.text} border border-slate-100 shadow-sm`}>
                            <StatusIcon size="10" />
                            <span className="text-[10px] font-semibold">{status.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {submitted ? (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handlePreview(item)} 
                                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white transition-all duration-200" 
                                title="Preview Laporan"
                              >
                                <Eye size="14" />
                              </button>
                              <button 
                                onClick={() => handleDownload(item)} 
                                disabled={isDownloading} 
                                className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white transition-all duration-200 disabled:opacity-50" 
                                title="Download Laporan"
                              >
                                {isDownloading ? <Loader2 size="14" className="animate-spin" /> : <Download size="14" />}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed" title="Belum mengumpulkan laporan">
                                <Lock size="14" />
                              </div>
                              <span className="text-xs text-slate-400 italic">Belum kumpul</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredLaporan.length === 0 && !loading && (
              <div className="py-16 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto">
                    <FileX size="32" className="text-slate-400" />
                  </div>
                </div>
                <p className="text-slate-600 font-semibold mt-4">Tidak ada data</p>
                <p className="text-sm text-slate-400 mt-1">Belum ada laporan akhir yang ditemukan</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                <p className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                    className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
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
                        <button 
                          key={pageNum} 
                          onClick={() => setCurrentPage(pageNum)} 
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg" : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                    className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight size="18" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Preview Modal - Fullscreen Overlay */}
      {showPreview && (
        <div 
          id="preview-container" 
          className="fixed inset-0 z-[999999] flex flex-col"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Header Preview */}
          <div className="h-16 bg-[#0B1120] border-b border-white/10 backdrop-blur-xl px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg">
                <FileText className="text-white" size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {selectedLaporan?.judul || "Laporan Akhir"}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedLaporan?.judul}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleFullscreen} 
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="text-white" size={18} /> : <Maximize2 className="text-white" size={18} />}
              </button>
              <button 
                onClick={closePreview} 
                className="w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all duration-200"
                title="Tutup"
              >
                <X className="text-white" size={18} />
              </button>
            </div>
          </div>
          
          {/* PDF Viewer */}
          <div className="flex-1 bg-[#020617] p-4 overflow-hidden">
            <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-white">
              <iframe 
                src={previewUrl} 
                title="Preview Laporan" 
                className="w-full h-full border-0" 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LaporanAkhir;