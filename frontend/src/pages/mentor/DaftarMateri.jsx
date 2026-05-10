// src/pages/mentor/DaftarMateri.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  Video,
  Link as LinkIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Grid3x3,
  List,
  Sparkles,
  Shield,
  TrendingUp,
  Image,
  FileDigit,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  Download,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ExternalLink,
  Globe
} from "lucide-react";
import {
  getMentorMateri,
  deleteMentorMateri
} from "../../api/mentor/materiMentorService";

const BASE_URL = "http://localhost:8000";

// Fungsi untuk mendapatkan nama file dari path
const getFileNameFromPath = (filePath) => {
  if (!filePath) return null;
  const parts = filePath.split('/');
  return parts[parts.length - 1];
};

// Fungsi untuk membuat URL file yang benar
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  const fileName = getFileNameFromPath(filePath);
  if (!fileName) return null;
  return `${BASE_URL}/api/materi-file/${fileName}`;
};

// Deteksi kategori file berdasarkan ekstensi
const detectKategori = (fileName, tipe, link) => {
  if (tipe === "link") return "Link";
  if (!fileName) return "Dokumen";
  
  const ext = fileName.toLowerCase().split('.').pop();
  const kategoriMap = {
    'pdf': 'PDF',
    'mp4': 'Video', 'avi': 'Video', 'mkv': 'Video', 'mov': 'Video', 'webm': 'Video',
    'jpg': 'Image', 'jpeg': 'Image', 'png': 'Image', 'gif': 'Image', 'webp': 'Image',
    'ppt': 'PPT', 'pptx': 'PPT',
    'doc': 'Word', 'docx': 'Word',
    'xls': 'Excel', 'xlsx': 'Excel',
    'zip': 'Archive', 'rar': 'Archive', '7z': 'Archive'
  };
  return kategoriMap[ext] || "Dokumen";
};

// Cek apakah file bisa di-preview langsung
const canPreview = (kategori) => {
  return ['PDF', 'Video', 'Image'].includes(kategori);
};

// Icon untuk setiap kategori file
const getFileIcon = (kategori) => {
  const iconMap = {
    'PDF': { icon: FileText, color: "text-red-500", bgGradient: "from-red-50 to-red-100", borderColor: "border-red-200", gradient: "from-red-500 to-red-600", previewBg: "from-red-100 to-red-200", label: "PDF Document" },
    'Video': { icon: Video, color: "text-blue-500", bgGradient: "from-blue-50 to-blue-100", borderColor: "border-blue-200", gradient: "from-blue-500 to-blue-600", previewBg: "from-blue-100 to-blue-200", label: "Video File" },
    'Image': { icon: Image, color: "text-purple-500", bgGradient: "from-purple-50 to-purple-100", borderColor: "border-purple-200", gradient: "from-purple-500 to-purple-600", previewBg: "from-purple-100 to-purple-200", label: "Image" },
    'PPT': { icon: Presentation, color: "text-orange-500", bgGradient: "from-orange-50 to-orange-100", borderColor: "border-orange-200", gradient: "from-orange-500 to-orange-600", previewBg: "from-orange-100 to-orange-200", label: "PowerPoint" },
    'Word': { icon: FileDigit, color: "text-blue-600", bgGradient: "from-blue-50 to-indigo-50", borderColor: "border-blue-200", gradient: "from-blue-600 to-indigo-600", previewBg: "from-blue-100 to-indigo-100", label: "Word Document" },
    'Excel': { icon: FileSpreadsheet, color: "text-green-600", bgGradient: "from-green-50 to-emerald-50", borderColor: "border-green-200", gradient: "from-green-500 to-emerald-600", previewBg: "from-green-100 to-emerald-100", label: "Excel Spreadsheet" },
    'Archive': { icon: FileArchive, color: "text-amber-500", bgGradient: "from-amber-50 to-yellow-50", borderColor: "border-amber-200", gradient: "from-amber-500 to-yellow-600", previewBg: "from-amber-100 to-yellow-100", label: "Archive File" },
    'Link': { icon: LinkIcon, color: "text-emerald-500", bgGradient: "from-emerald-50 to-teal-50", borderColor: "border-emerald-200", gradient: "from-emerald-500 to-teal-600", previewBg: "from-emerald-100 to-teal-100", label: "External Link" },
    'Dokumen': { icon: FileText, color: "text-slate-500", bgGradient: "from-slate-50 to-gray-100", borderColor: "border-slate-200", gradient: "from-slate-500 to-gray-600", previewBg: "from-slate-100 to-gray-200", label: "Document" }
  };
  return iconMap[kategori] || iconMap['Dokumen'];
};

function DaftarMateri() {
  const [loading, setLoading] = useState(true);
  const [materi, setMateri] = useState([]);
  const [filteredMateri, setFilteredMateri] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipe, setSelectedTipe] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchMateri = async () => {
    setLoading(true);
    try {
      const response = await getMentorMateri();
      console.log("Fetched materi:", response);
      
      if (response && response.success && response.data) {
        const transformed = response.data.map(item => {
          const fileName = getFileNameFromPath(item.file_materi);
          const fileUrl = getFileUrl(item.file_materi);
          const kategori = detectKategori(fileName, item.tipe_materi, item.link);
          
          return {
            id: item.id_materi || item.id,
            judul: item.judul,
            deskripsi: item.deskripsi || "-",
            tipe: item.tipe_materi || item.tipe || "dokumen",
            link: item.link,
            file_materi: item.file_materi,
            file_url: fileUrl,
            file_name: fileName,
            created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-',
            views: item.views || 0,
            kategori: kategori
          };
        });
        setMateri(transformed);
        setFilteredMateri(transformed);
      } else {
        setMateri([]);
        setFilteredMateri([]);
      }
    } catch (error) {
      console.error("Error fetching materi:", error);
      setMateri([]);
      setFilteredMateri([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateri();
  }, []);

  useEffect(() => {
    let filtered = [...materi];
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedTipe !== "all") {
      filtered = filtered.filter(m => m.tipe === selectedTipe);
    }
    setFilteredMateri(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedTipe, materi]);

  const handleDelete = async () => {
    if (!selectedMateri) return;
    setDeleting(true);
    try {
      const response = await deleteMentorMateri(selectedMateri.id);
      if (response && response.success) {
        setMateri(prev => prev.filter(m => m.id !== selectedMateri.id));
        setShowDeleteModal(false);
        setSelectedMateri(null);
      } else {
        alert("Gagal menghapus materi");
      }
    } catch (error) {
      console.error("Error deleting materi:", error);
      alert("Gagal menghapus materi");
    } finally {
      setDeleting(false);
    }
  };

  const handlePreview = (item) => {
    setPreview(item);
    setIsFullscreen(false);
    // Mencegah scroll pada body saat modal preview terbuka
    document.body.style.overflow = 'hidden';
    // Trigger event untuk menyembunyikan sidebar
    window.dispatchEvent(new CustomEvent('preview-modal-open'));
  };

  const closePreview = () => {
    setPreview(null);
    setIsFullscreen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    // Mengembalikan scroll body
    document.body.style.overflow = '';
    // Trigger event untuk menampilkan kembali sidebar
    window.dispatchEvent(new CustomEvent('preview-modal-close'));
  };

  const toggleFullscreen = () => {
    const previewElement = document.getElementById('preview-container');
    if (!isFullscreen) {
      if (previewElement && previewElement.requestFullscreen) {
        previewElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Listen untuk fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const downloadFile = async (url, filename) => {
    if (!url) {
      alert("File tidak tersedia");
      return;
    }
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'materi';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      window.open(url, '_blank');
    }
  };

  const getGridViewPreview = (item) => {
    const kategori = item.kategori;
    const fileUrl = item.file_url;
    const fileInfo = getFileIcon(kategori);
    const IconComponent = fileInfo.icon;
    
    if (canPreview(kategori)) {
      if (kategori === "PDF" && fileUrl) {
        return (
          <embed
            src={fileUrl}
            type="application/pdf"
            className="w-full h-full object-cover"
            style={{ pointerEvents: 'none' }}
          />
        );
      }
      
      if (kategori === "Video" && fileUrl) {
        return (
          <video 
            src={fileUrl} 
            className="w-full h-full object-cover" 
            muted
          />
        );
      }
      
      if (kategori === "Image" && fileUrl) {
        return (
          <img src={fileUrl} alt={item.judul} className="w-full h-full object-cover" />
        );
      }
    }
    
    if (kategori === "Link") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-xl"></div>
            <Globe size={56} className="text-emerald-500 relative z-10" />
          </div>
          <div className="mt-3 text-center px-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-emerald-600">
              Link Eksternal
            </span>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${fileInfo.previewBg}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full blur-xl"></div>
          <IconComponent size={56} className={`${fileInfo.color} relative z-10`} />
        </div>
        <div className="mt-3 text-center px-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm ${fileInfo.color}`}>
            {fileInfo.label}
          </span>
        </div>
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <div className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Download size={10} className="text-white/80" />
            <span className="text-[9px] text-white/80">Klik untuk download</span>
          </div>
        </div>
      </div>
    );
  };

  const getPreviewContent = (item) => {
    const kategori = item.kategori;
    const fileUrl = item.file_url;
    const fileInfo = getFileIcon(kategori);
    const IconComponent = fileInfo.icon;
    
    if (canPreview(kategori)) {
      if (kategori === "PDF" && fileUrl) {
        return (
          <embed
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            className="w-full h-full"
          />
        );
      }
      
      if (kategori === "Video" && fileUrl) {
        return (
          <video 
            src={fileUrl} 
            className="w-full h-full object-contain" 
            controls
            autoPlay={false}
          />
        );
      }
      
      if (kategori === "Image" && fileUrl) {
        return (
          <img src={fileUrl} alt={item.judul} className="w-full h-full object-contain" />
        );
      }
    }
    
    if (kategori === "Link" && item.link) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl"></div>
            <div className="relative p-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl shadow-2xl">
              <Globe size={80} className="text-emerald-600" />
            </div>
          </div>
          <h3 className="text-white text-2xl font-bold mb-3 text-center max-w-md">{item.judul}</h3>
          <p className="text-white/60 text-base mb-8">Link Eksternal</p>
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <ExternalLink size={18} /> Buka Link
          </a>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
          <div className={`relative p-8 bg-gradient-to-br ${fileInfo.bgGradient} rounded-2xl shadow-2xl border ${fileInfo.borderColor}`}>
            <IconComponent size={80} className={fileInfo.color} />
          </div>
        </div>
        <h3 className="text-white text-2xl font-bold mb-3 text-center max-w-md">{item.judul}</h3>
        <p className="text-white/60 text-base mb-2">File {fileInfo.label}</p>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 max-w-md text-center">
          <p className="text-white/80 text-sm">
            ⚡ Preview tidak tersedia untuk file {fileInfo.label}
          </p>
          <p className="text-white/50 text-xs mt-1">
            Silahkan download file untuk melihat konten lengkapnya
          </p>
        </div>
        <button 
          onClick={() => downloadFile(fileUrl, item.judul)} 
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <Download size={18} /> Download File
        </button>
      </div>
    );
  };

  const getTipeStyle = (tipe) => {
    switch(tipe) {
      case "dokumen":
        return { icon: FileText, label: "Dokumen" };
      case "video":
        return { icon: Video, label: "Video" };
      case "link":
        return { icon: LinkIcon, label: "Link" };
      default:
        return { icon: FileText, label: "File" };
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMateri.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMateri.length / itemsPerPage);

  const totalMateri = materi.length;
  const totalDokumen = materi.filter(m => m.tipe === "dokumen").length;
  const totalVideo = materi.filter(m => m.tipe === "video").length;
  const totalLink = materi.filter(m => m.tipe === "link").length;
  const totalViews = materi.reduce((sum, m) => sum + (m.views || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="relative w-16 h-16 border-2 border-teal-400/30 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-500 mt-6 text-sm font-medium ml-3">Memuat materi...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-full bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="relative mb-10 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-6 py-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                      Materi Pembelajaran
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Kelola materi pembelajaran untuk peserta bimbingan</p>
                  </div>
                </div>
              </div>
              <Link to="/mentor/add-materi">
                <button className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                  <Plus size="14" /> Tambah Materi
                </button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-slate-500">Total Materi</p><p className="text-2xl font-bold text-slate-800">{totalMateri}</p></div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><BookOpen size="16" className="text-teal-600" /></div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg">
              <div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Dokumen</p><p className="text-2xl font-bold text-slate-700">{totalDokumen}</p></div><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><FileText size="16" className="text-blue-600" /></div></div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg">
              <div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Video</p><p className="text-2xl font-bold text-slate-700">{totalVideo}</p></div><div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Video size="16" className="text-red-600" /></div></div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg">
              <div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Link</p><p className="text-2xl font-bold text-slate-700">{totalLink}</p></div><div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"><LinkIcon size="16" className="text-green-600" /></div></div>
            </div>
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between"><div><p className="text-xs text-white/80">Total Dilihat</p><p className="text-2xl font-bold text-white">{totalViews}</p></div><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><TrendingUp size="16" className="text-white" /></div></div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
                <input type="text" placeholder="Cari materi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}><Grid3x3 size="18" /></button>
                  <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-md text-teal-600" : "text-slate-500"}`}><List size="18" /></button>
                </div>
                <select value={selectedTipe} onChange={(e) => setSelectedTipe(e.target.value)} className="px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400 cursor-pointer">
                  <option value="all">Semua Tipe</option>
                  <option value="dokumen">Dokumen</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-5"><p className="text-sm text-slate-500 flex items-center gap-2"><Sparkles size="14" className="text-teal-500" />Menampilkan {currentItems.length} dari {filteredMateri.length} materi</p></div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((item) => {
                const fileInfo = getFileIcon(item.kategori);
                const Icon = fileInfo.icon;
                return (
                  <div key={item.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer" onClick={() => handlePreview(item)}>
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      {getGridViewPreview(item)}
                      <div className="absolute top-3 right-3">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-sm shadow-sm ${fileInfo.color}`}>
                          {item.kategori === "Link" ? "Link" : fileInfo.label}
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-1">{item.judul}</h3>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.deskripsi}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
                        <div className="flex items-center gap-2"><Calendar size="11" /><span>{item.created_at}</span></div>
                        <div className="flex items-center gap-2"><Eye size="11" /><span>{item.views} dilihat</span></div>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button onClick={(e) => { e.stopPropagation(); handlePreview(item); }} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-teal-500 hover:text-white transition-all">
                          Lihat Materi
                        </button>
                        <Link to={`/mentor/edit-materi/${item.id}`} onClick={(e) => e.stopPropagation()}>
                          <button className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white transition-all"><Edit size="14" /></button>
                        </Link>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedMateri(item); setShowDeleteModal(true); }} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white transition-all"><Trash2 size="14" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-white border-b">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">Materi</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">Tipe</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">Tanggal</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">Dilihat</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentItems.map((item) => {
                      const tipeStyle = getTipeStyle(item.tipe);
                      const TipeIcon = tipeStyle.icon;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer" onClick={() => handlePreview(item)}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <FileText size="16" className="text-slate-500" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{item.judul}</p>
                                <p className="text-[10px] text-slate-400 max-w-[300px] truncate">{item.deskripsi}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                              <TipeIcon size="12" />
                              <span>{tipeStyle.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">{item.created_at}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-teal-600">{item.views}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handlePreview(item); }} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white">
                                <Eye size="14" />
                              </button>
                              <Link to={`/mentor/edit-materi/${item.id}`} onClick={(e) => e.stopPropagation()}>
                                <button className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white">
                                  <Edit size="14" />
                                </button>
                              </Link>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedMateri(item); setShowDeleteModal(true); }} 
                                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white"
                              >
                                <Trash2 size="14" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty */}
          {filteredMateri.length === 0 && !loading && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 py-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto">
                <BookOpen size="32" className="text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold mt-4">Belum ada materi</p>
              <p className="text-sm text-slate-400 mt-1">Mulai tambahkan materi pembelajaran untuk peserta</p>
              <Link to="/mentor/add-materi">
                <button className="mt-5 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg inline-flex items-center gap-2">
                  <Plus size="14" />Tambah Materi
                </button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white/80 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size="18" /></button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum; 
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg" : "bg-white/80 border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white/80 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size="18" /></button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 bg-gradient-to-r from-teal-50/80 via-blue-50/80 to-transparent rounded-2xl p-5 border border-teal-100">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-md"><Shield size="16" className="text-teal-500" /></div>
              <div><p className="text-sm font-bold text-teal-800">Informasi Materi</p><p className="text-xs text-teal-700 mt-1">Klik pada card materi untuk melihat preview lengkap. File PDF, Video, dan Image dapat dilihat langsung.</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedMateri && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-100"><Trash2 size="18" className="text-red-500" /></div>
                <h3 className="text-lg font-bold text-slate-800">Hapus Materi</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600"><X size="20" /></button>
            </div>
            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus materi <span className="font-bold">"{selectedMateri?.judul}"</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold">{deleting ? "Menghapus..." : "Hapus"}</button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL - TANPA TOMBOL KEMBALI */}
      {preview && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999999,
            width: '100vw',
            height: '100vh'
          }} 
          className="animate-in fade-in duration-200"
        >
          {/* Header Preview - Tanpa tombol kembali */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-xl border-b border-white/20 flex-shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {(() => {
                const fileInfo = getFileIcon(preview.kategori);
                const IconComp = fileInfo.icon;
                return (
                  <div className={`p-2 bg-gradient-to-br ${fileInfo.bgGradient} rounded-xl flex-shrink-0 hidden sm:flex`}>
                    <IconComp size={20} className={fileInfo.color} />
                  </div>
                );
              })()}
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-white text-lg truncate">{preview.judul}</h2>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <p className="text-xs text-white/60">{preview.kategori === "Link" ? "Link Eksternal" : getFileIcon(preview.kategori).label}</p>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <p className="text-xs text-white/60">{preview.views} dilihat</p>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <p className="text-xs text-white/60">{preview.created_at}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={toggleFullscreen} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white">
                {isFullscreen ? <Minimize2 size="18" /> : <Maximize2 size="18" />}
              </button>
              {preview.tipe === "link" && preview.link ? (
                <a href={preview.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all text-white shadow-md flex items-center gap-2">
                  <ExternalLink size={18} />
                  <span className="text-sm font-medium hidden sm:inline">Buka Link</span>
                </a>
              ) : (
                <button onClick={() => downloadFile(preview.file_url, preview.judul)} className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-white shadow-md flex items-center gap-2">
                  <Download size={18} />
                  <span className="text-sm font-medium hidden sm:inline">Download</span>
                </button>
              )}
              <button onClick={closePreview} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white">
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Konten Preview */}
          <div 
            id="preview-container" 
            className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-900 overflow-auto"
            style={{ minHeight: 0 }}
          >
            {getPreviewContent(preview)}
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  );
}

export default DaftarMateri;