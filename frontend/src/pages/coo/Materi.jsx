import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPeserta, getMentors, getDivisi } from "../../api/admin/dashboardService";
import axiosInstance from "../../api/axios";
import {
  FileText, Video, File, Eye, Edit2, Trash2, Plus, Search,
  Calendar, HardDrive, BookOpen, Users, ChevronRight,
  Download, Award, Sparkles,
  Grid3x3, List, ArrowUpRight, FolderOpen, X, AlertCircle,
  Filter, Building2, Tag, SlidersHorizontal, ChevronDown,
  Shield, CheckCircle, Clock, TrendingUp, Star, Zap,
  ExternalLink, Image, Play, Layers, Target, ListChecks, 
  FileDigit, FileSpreadsheet, FileArchive, FileCode, FileJson,
  Presentation, FileType, Mail, Hash, Maximize2, Minimize2,
  ArrowLeft, ChevronLeft, ChevronRight as ChevronRightIcon
} from "lucide-react";

function Materi() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [materi, setMateri] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [activeTab, setActiveTab] = useState("materi");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [divisiList, setDivisiList] = useState([]);
  const [isCoo, setIsCoo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDivisi, setSelectedDivisi] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState([]);
  
  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const BASE_URL = "http://localhost:8000";

  const kategoriOptions = ["PDF", "Video", "Image", "PPT", "Word", "Excel", "Archive", "Other"];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || user.Role;
    setIsCoo(role === 'coo');
    
    fetchMateri();
    fetchQuiz();
    fetchDivisi();
  }, []);

  const cleanUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    const filename = filePath.split('/').pop();
    return `${BASE_URL}/api/materi-file/${filename}`;
  };

  const fetchMateri = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/materi-pelatihan");
      let materiData = [];
      
      if (response.data && response.data.success && response.data.data) {
        materiData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        materiData = response.data;
      } else if (Array.isArray(response)) {
        materiData = response;
      }
      
      const enrichedData = materiData.map(item => ({
        id_materi: item.id_materi_pelatihan || item.id_materi || item.id,
        judul: item.judul || item.title || "Tanpa Judul",
        deskripsi: item.deskripsi || item.description || "",
        divisi: item.divisi || "Umum",
        kategori: detectKategori(item.file_materi || item.kategori || item.type),
        file_materi: cleanUrl(item.file_materi || item.file_url || item.file_path),
        views: item.views || 0,
        created_at: item.created_at,
        file_name: item.file_materi?.split('/').pop() || "",
      }));
      setMateri(enrichedData);
    } catch (error) {
      console.error("Error fetch materi:", error);
      setMateri([]);
    } finally {
      setLoading(false);
    }
  };

  const detectKategori = (fileName) => {
    if (!fileName) return "Other";
    const ext = fileName.toLowerCase().split('.').pop();
    const kategoriMap = {
      'pdf': 'PDF',
      'mp4': 'Video', 'avi': 'Video', 'mkv': 'Video', 'mov': 'Video', 'wmv': 'Video', 'flv': 'Video',
      'jpg': 'Image', 'jpeg': 'Image', 'png': 'Image', 'gif': 'Image', 'bmp': 'Image', 'webp': 'Image',
      'ppt': 'PPT', 'pptx': 'PPT',
      'doc': 'Word', 'docx': 'Word',
      'xls': 'Excel', 'xlsx': 'Excel',
      'zip': 'Archive', 'rar': 'Archive', '7z': 'Archive',
      'txt': 'Other', 'md': 'Other'
    };
    return kategoriMap[ext] || "Other";
  };

  const fetchQuiz = async () => {
    try {
      const response = await axiosInstance.get("/quiz");
      let quizData = [];
      
      if (response.data && response.data.success && response.data.data) {
        quizData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        quizData = response.data.data;
      } else if (Array.isArray(response.data)) {
        quizData = response.data;
      }
      
      const transformedData = quizData.map(q => ({
        id: q.id || q.id_kuis,
        judul: q.judul || q.title || q.judul_kuis || "Tanpa Judul",
        divisi: q.divisi || "Umum",
        durasi: q.durasi || q.duration || 30,
        peserta: q.peserta || q.participants || 0,
        total_soal: q.total_soal || q.questions?.length || 0,
        passing: q.passing || 75,
        status: q.status || "aktif",
        created_at: q.created_at || q.createdAt
      }));
      
      setQuiz(transformedData);
    } catch (error) {
      console.error("Error fetch quiz:", error);
      setQuiz([]);
    }
  };

  const fetchDivisi = async () => {
    try {
      const response = await axiosInstance.get("/divisi");
      let divisiData = [];
      
      if (response.data && response.data.success && response.data.data) {
        divisiData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        divisiData = response.data;
      }
      setDivisiList(divisiData);
    } catch (error) {
      console.error("Error fetch divisi:", error);
      setDivisiList([]);
    }
  };

  // Show delete confirmation modal
  const confirmDelete = (id, index) => {
    setDeleteTarget(id);
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  // Handle delete with modal
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/materi-pelatihan/${deleteTarget}`);
      const updated = [...materi];
      updated.splice(deleteIndex, 1);
      setMateri(updated);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setDeleteIndex(null);
    } catch (error) {
      console.error("Error delete materi:", error);
      alert("Gagal menghapus materi");
    } finally {
      setDeleting(false);
    }
  };

  // Download file langsung (tidak buka tab baru)
  const downloadFile = async (url, filename) => {
    if (!url) {
      alert("File tidak tersedia untuk diunduh");
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
      alert("Gagal mengunduh file");
    }
  };

  const handlePreview = async (item, index) => {
    setLoading(true);
    try {
      let fileUrl = item.file_materi;
      setPreview({ ...item, index, fileUrl });
    } catch (error) {
      console.error("Error fetching file preview:", error);
      setPreview({ ...item, index, fileUrl: null });
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    const previewElement = document.getElementById('preview-container');
    if (!isFullscreen) {
      if (previewElement.requestFullscreen) {
        previewElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const getFileIcon = (kategori) => {
    const iconMap = {
      'PDF': { icon: FileText, color: "text-red-500", bgGradient: "from-red-50 to-red-100", borderColor: "border-red-200", gradient: "from-red-500 to-red-600", previewBg: "from-red-100 to-red-200" },
      'Video': { icon: Video, color: "text-blue-500", bgGradient: "from-blue-50 to-blue-100", borderColor: "border-blue-200", gradient: "from-blue-500 to-blue-600", previewBg: "from-blue-100 to-blue-200" },
      'Image': { icon: Image, color: "text-purple-600", bgGradient: "from-purple-50 to-purple-100", borderColor: "border-purple-200", gradient: "from-purple-500 to-purple-600", previewBg: "from-purple-100 to-purple-200" },
      'PPT': { icon: Presentation, color: "text-orange-600", bgGradient: "from-orange-50 to-orange-100", borderColor: "border-orange-200", gradient: "from-orange-500 to-orange-600", previewBg: "from-orange-100 to-orange-200" },
      'Word': { icon: FileDigit, color: "text-blue-700", bgGradient: "from-blue-50 to-indigo-50", borderColor: "border-blue-200", gradient: "from-blue-600 to-indigo-600", previewBg: "from-blue-100 to-indigo-100" },
      'Excel': { icon: FileSpreadsheet, color: "text-green-600", bgGradient: "from-green-50 to-emerald-50", borderColor: "border-green-200", gradient: "from-green-500 to-emerald-600", previewBg: "from-green-100 to-emerald-100" },
      'Archive': { icon: FileArchive, color: "text-amber-600", bgGradient: "from-amber-50 to-yellow-50", borderColor: "border-amber-200", gradient: "from-amber-500 to-yellow-600", previewBg: "from-amber-100 to-yellow-100" },
      'Other': { icon: File, color: "text-slate-500", bgGradient: "from-slate-50 to-gray-100", borderColor: "border-slate-200", gradient: "from-slate-500 to-gray-600", previewBg: "from-slate-100 to-gray-200" }
    };
    return iconMap[kategori] || iconMap['Other'];
  };

  // Preview content untuk grid view
  const getGridViewPreview = (item) => {
    const kategori = item.kategori;
    const fileUrl = item.file_materi;
    const fileInfo = getFileIcon(kategori);
    const IconComponent = fileInfo.icon;
    
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
    
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${fileInfo.previewBg}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full blur-xl"></div>
          <IconComponent size={56} className={`${fileInfo.color} relative z-10`} />
        </div>
        <div className="mt-3 text-center px-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm ${fileInfo.color}`}>
            {kategori}
          </span>
        </div>
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <div className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Eye size={10} className="text-white/80" />
            <span className="text-[9px] text-white/80">{item.views || 0}</span>
          </div>
        </div>
      </div>
    );
  };

  const getPreviewContent = (item) => {
    const kategori = item.kategori;
    const fileUrl = item.file_materi;
    const fileInfo = getFileIcon(kategori);
    const IconComponent = fileInfo.icon;
    
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

    if ((kategori === "PPT" || kategori === "Word" || kategori === "Excel" || kategori === "Archive" || kategori === "Other") && fileUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
            <div className={`relative p-8 bg-gradient-to-br ${fileInfo.bgGradient} rounded-2xl shadow-2xl border ${fileInfo.borderColor}`}>
              <IconComponent size={100} className={fileInfo.color} />
            </div>
          </div>
          <h3 className="text-white text-2xl font-bold mb-3 text-center max-w-md">{item.judul}</h3>
          <p className="text-white/60 text-base mb-2">File {kategori}</p>
          <div className="flex items-center gap-2 text-white/40 text-sm mb-8">
            <HardDrive size={14} />
            <span>{item.file_name || `${kategori} file`}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 max-w-md text-center">
            <p className="text-white/80 text-sm">
              ⚡ Preview tidak tersedia untuk file {kategori}
            </p>
            <p className="text-white/50 text-xs mt-1">
              Silahkan download file untuk melihat konten lengkapnya
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); downloadFile(fileUrl, item.judul); }} 
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
          >
            <Download size={18} /> Download File {kategori}
          </button>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <IconComponent size={80} className={fileInfo.color + " mb-6"} />
        <p className="text-slate-600 text-lg font-semibold mb-2">{item.judul}</p>
        <p className="text-slate-400 text-sm mb-6">Preview tidak tersedia untuk file ini</p>
        <button 
          onClick={(e) => { e.stopPropagation(); downloadFile(fileUrl, item.judul); }} 
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <Download size={18} /> Download File
        </button>
      </div>
    );
  };

  const filteredMateri = materi.filter((m) => {
    const judul = (m.judul || "").toLowerCase();
    const matchesSearch = judul.includes(searchQuery.toLowerCase());
    const matchesDivisi = selectedDivisi.length === 0 || selectedDivisi.includes(m.divisi);
    const matchesKategori = selectedKategori.length === 0 || selectedKategori.includes(m.kategori);
    return matchesSearch && matchesDivisi && matchesKategori;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMateri.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMateri = filteredMateri.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const toggleDivisiFilter = (divisi) => {
    setSelectedDivisi(prev => 
      prev.includes(divisi) 
        ? prev.filter(d => d !== divisi)
        : [...prev, divisi]
    );
    setCurrentPage(1);
  };

  const toggleKategoriFilter = (kategori) => {
    setSelectedKategori(prev => 
      prev.includes(kategori) 
        ? prev.filter(k => k !== kategori)
        : [...prev, kategori]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedDivisi([]);
    setSelectedKategori([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const stats = {
    total: materi.length,
    divisi: [...new Set(materi.map((m) => m.divisi).filter(Boolean))].length,
    totalViews: materi.reduce((acc, m) => acc + (m.views || 0), 0)
  };

  const closePreview = () => {
    setPreview(null);
    setIsFullscreen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Materi Pelatihan
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    {isCoo ? "Kelola dan distribusikan materi pembelajaran" : "Pelajari materi pelatihan"}
                  </p>
                </div>
              </div>
            </div>
            {isCoo && (
              <button onClick={() => navigate("/coo/add-materi")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                <Plus size={16} /> Tambah Materi
              </button>
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Total Materi</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <span className="text-[10px] text-slate-400">Semua materi tersedia</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Divisi Aktif</p>
                <p className="text-2xl font-bold text-slate-800">{stats.divisi}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                <span className="text-[10px] text-slate-400">Tersebar di semua divisi</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Total Views</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalViews}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <span className="text-[10px] text-slate-400">Total kunjungan materi</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
            <button onClick={() => setActiveTab("materi")} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "materi" ? "bg-white text-blue-600 shadow-md" : "text-slate-500"}`}>
              <BookOpen size={14} /> Materi Pelatihan
            </button>
          </div>
          {activeTab === "materi" && (
            <div className="flex items-center gap-2">
              <button onClick={() => setFilterOpen(!filterOpen)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${filterOpen ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600"}`}>
                <SlidersHorizontal size={14} /> Filter <ChevronDown size={14} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
              </button>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}><Grid3x3 size={16} /></button>
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}><List size={16} /></button>
              </div>
            </div>
          )}
        </div>

        {/* FILTER PANEL */}
        {filterOpen && activeTab === "materi" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 mb-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Filter size={14} className="text-white" />
                </div>
                <h3 className="font-semibold text-slate-800">Filter Materi</h3>
                {(selectedDivisi.length > 0 || selectedKategori.length > 0) && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {selectedDivisi.length + selectedKategori.length} aktif
                  </span>
                )}
              </div>
              <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all">
                <X size={12} /> Reset Semua
              </button>
            </div>
            
            <div className="mb-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari judul materi..." 
                  value={searchQuery} 
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-3">
                  <Building2 size={12} /> Divisi (Pilih lebih dari satu)
                </label>
                <div className="flex flex-wrap gap-2">
                  {divisiList.map(div => {
                    const isSelected = selectedDivisi.includes(div.nama_divisi || div.nama);
                    return (
                      <button
                        key={div.id_divisi || div.id}
                        onClick={() => toggleDivisiFilter(div.nama_divisi || div.nama)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                          isSelected 
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected && <CheckCircle size={12} />}
                        {div.nama_divisi || div.nama}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-3">
                  <Tag size={12} /> Kategori (Pilih lebih dari satu)
                </label>
                <div className="flex flex-wrap gap-2">
                  {kategoriOptions.map(kat => {
                    const isSelected = selectedKategori.includes(kat);
                    const fileInfo = getFileIcon(kat);
                    const IconComp = fileInfo.icon;
                    return (
                      <button
                        key={kat}
                        onClick={() => toggleKategoriFilter(kat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                          isSelected 
                            ? `bg-gradient-to-r ${fileInfo.gradient} text-white shadow-md` 
                            : `${fileInfo.bgGradient} ${fileInfo.color} border ${fileInfo.borderColor}`
                        }`}
                      >
                        {isSelected && <CheckCircle size={12} />}
                        <IconComp size={12} />
                        {kat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MATERI CONTENT */}
        {activeTab === "materi" && (
          <>
            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-slate-500">Memuat materi...</p>
              </div>
            ) : filteredMateri.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <FolderOpen size="40" className="text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Tidak ada materi yang sesuai</p>
                <button onClick={resetFilters} className="text-blue-600 text-sm mt-2 hover:text-blue-700">Reset Filter</button>
              </div>
            ) : viewMode === "grid" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedMateri.map((item, idx) => {
                    const fileInfo = getFileIcon(item.kategori);
                    const IconComponent = fileInfo.icon;
                    const fileUrl = item.file_materi;
                    const actualIndex = startIndex + idx;
                    
                    return (
                      <div key={actualIndex} onClick={() => handlePreview(item, actualIndex)} className="bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                          {getGridViewPreview(item)}
                          <div className="absolute top-3 right-3">
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm ${fileInfo.color}`}>
                              {item.kategori}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-semibold px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border border-blue-100">
                              {item.divisi || "UMUM"}
                            </span>
                            {isCoo && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/coo/edit-materi/${item.id_materi}`); }} className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                                  <Edit2 size={12} className="text-slate-500 hover:text-blue-600" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); confirmDelete(item.id_materi, actualIndex); }} className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors">
                                  <Trash2 size={12} className="text-slate-500 hover:text-red-600" />
                                </button>
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-800 text-base mb-2 line-clamp-2">{item.judul}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.deskripsi || "Tidak ada deskripsi"}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <Calendar size={10} />
                              {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); downloadFile(fileUrl, item.judul); }} className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
                              <Download size={12} className="text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination Grid View */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Halaman</span>
                      <span className="text-sm font-bold text-slate-800">{currentPage}</span>
                      <span className="text-xs text-slate-500">dari</span>
                      <span className="text-sm font-bold text-slate-800">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                                : "border border-slate-200 text-slate-600 hover:bg-blue-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRightIcon size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* LIST VIEW PREMIUM */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b-2 border-slate-200">
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">#</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Materi</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Divisi</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Kategori</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Tanggal</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Views</th>
                          <th className="text-center px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedMateri.map((item, idx) => {
                          const fileInfo = getFileIcon(item.kategori);
                          const IconComponent = fileInfo.icon;
                          const fileUrl = item.file_materi;
                          const actualIndex = startIndex + idx;
                          return (
                            <tr key={actualIndex} className="cursor-pointer group hover:bg-slate-50 transition-colors" onClick={() => handlePreview(item, actualIndex)}>
                              <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-slate-500">{startIndex + idx + 1}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className={`relative w-12 h-12 bg-gradient-to-br ${fileInfo.bgGradient} rounded-xl flex items-center justify-center shadow-md border ${fileInfo.borderColor}`}>
                                    <IconComponent size={20} className={fileInfo.color} />
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-800 text-sm">{item.judul}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-[11px] text-slate-400 line-clamp-1">{item.deskripsi || "Tidak ada deskripsi"}</p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm">
                                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                    <Building2 size={10} className="text-white" />
                                  </div>
                                  <span className="text-xs font-semibold text-blue-700">{item.divisi || "-"}</span>
                                </div>
                               </td>
                              <td className="px-6 py-4">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm bg-gradient-to-br ${fileInfo.bgGradient} ${fileInfo.borderColor}`}>
                                  <IconComponent size={14} className={fileInfo.color} />
                                  <span className={`text-xs font-semibold ${fileInfo.color}`}>
                                    {item.kategori}
                                  </span>
                                </div>
                               </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                                  <Calendar size={12} className="text-slate-400" />
                                  <span className="font-medium">{item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}</span>
                                </div>
                               </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                    <Eye size={12} className="text-amber-500" />
                                    <span className="text-xs font-bold text-amber-700">{item.views || 0}</span>
                                  </div>
                                </div>
                               </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); downloadFile(fileUrl, item.judul); }} 
                                    className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
                                  >
                                    <Download size={14} />
                                  </button>
                                  {isCoo && (
                                    <>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); navigate(`/coo/edit-materi/${item.id_materi}`); }} 
                                        className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); confirmDelete(item.id_materi, actualIndex); }} 
                                        className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </>
                                  )}
                                </div>
                               </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination List View */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Menampilkan</span>
                        <span className="text-sm font-bold text-slate-800">{startIndex + 1}</span>
                        <span className="text-xs text-slate-500">-</span>
                        <span className="text-sm font-bold text-slate-800">{Math.min(startIndex + itemsPerPage, filteredMateri.length)}</span>
                        <span className="text-xs text-slate-500">dari</span>
                        <span className="text-sm font-bold text-slate-800">{filteredMateri.length}</span>
                        <span className="text-xs text-slate-500">materi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                                  : "border border-slate-200 text-slate-600 hover:bg-blue-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRightIcon size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-t-2xl"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Hapus Materi</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Apakah Anda yakin ingin menghapus materi <strong className="text-red-600">"{deleteTarget ? materi[deleteIndex]?.judul : ""}"</strong>?
                  <br />
                  <span className="text-sm text-slate-400">Data yang dihapus tidak dapat dikembalikan.</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteTarget(null);
                      setDeleteIndex(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {deleting ? "Menghapus..." : "Ya, Hapus"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL PREMIUM */}
      {preview && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-xl border-b border-white/20">
            <div className="flex items-center gap-3">
              <button 
                onClick={closePreview} 
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Kembali</span>
              </button>
              
              <div className="w-px h-8 bg-white/20"></div>
              
              {(() => {
                const fileInfo = getFileIcon(preview.kategori);
                const IconComp = fileInfo.icon;
                return (
                  <div className={`p-2 bg-gradient-to-br ${fileInfo.bgGradient} rounded-xl`}>
                    <IconComp size={20} className={fileInfo.color} />
                  </div>
                );
              })()}
              <div>
                <h2 className="font-semibold text-white text-lg">{preview.judul}</h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-white/60">{preview.divisi || "General"}</p>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <p className="text-xs text-white/60">{preview.kategori}</p>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <p className="text-xs text-white/60">{preview.views || 0} views</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleFullscreen} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white">
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button 
                onClick={() => downloadFile(preview.file_materi, preview.judul)} 
                className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-white shadow-md flex items-center gap-2"
              >
                <Download size={18} />
                <span className="text-sm font-medium hidden sm:inline">Download</span>
              </button>
              <button 
                onClick={closePreview} 
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div id="preview-container" className="flex-1 flex items-center justify-center p-8 bg-slate-900">
            {loading ? (
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/60">Memuat preview...</p>
              </div>
            ) : (
              getPreviewContent(preview)
            )}
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation-duration: 0.2s; animation-fill-mode: both; }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn; }
      `}</style>
    </div>
  );
}

export default Materi;