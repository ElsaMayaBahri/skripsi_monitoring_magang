import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getPeserta, getMentors, getDivisi } from "../../api/admin/dashboardService";
import axiosInstance from "../../api/axios";
import { downloadMateri } from "../../api/coo/materiService";
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
  const location = useLocation();
  const [preview, setPreview] = useState(null);
  const [materi, setMateri] = useState([]);
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

  const kategoriOptions = ["PDF", "Video", "PPT", "Dokumen"];

  useEffect(() => {
    if (preview) {
      document.body.classList.add("preview-active");
    } else {
      document.body.classList.remove("preview-active");
    }

    return () => {
      document.body.classList.remove("preview-active");
    };
  }, [preview]);

  useEffect(() => {
    if (location.state?.viewMode) {
      setViewMode(location.state.viewMode);
    }
  }, [location]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || user.Role;
    setIsCoo(role === 'coo');
    
    fetchDivisi();
    fetchMateri();
  }, []);

  const cleanUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith("http")) return filePath;
    if (filePath.includes('storage/')) return `${BASE_URL}/${filePath}`;
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
      
      const enrichedData = materiData.map(item => {
        let divisiName = item.divisi || "Umum";
        if (!divisiName || divisiName === "" || divisiName === "null") {
          divisiName = "Umum";
        }
        
        return {
          id_materi: item.id_materi_pelatihan || item.id_materi || item.id,
          judul: item.judul || item.title || "Tanpa Judul",
          deskripsi: item.deskripsi || item.description || "",
          id_divisi: item.id_divisi,
          divisi: divisiName,
          kategori: detectKategori(item.file_materi || item.kategori || item.type),
          file_materi: cleanUrl(item.file_materi || item.file_url || item.file_materi_url),
          views: item.views || 0,
          created_at: item.created_at,
          file_name: item.file_materi?.split('/').pop() || "",
          file_size: item.file_size || "0 MB",
          urutan: item.urutan || 999
        };
      });
      
      // Urutkan berdasarkan divisi terlebih dahulu, kemudian urutan di dalam divisi
      enrichedData.sort((a, b) => {
        if (a.divisi === b.divisi) {
          return (a.urutan || 999) - (b.urutan || 999);
        }
        return a.divisi.localeCompare(b.divisi);
      });
      
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
      'ppt': 'PPT', 'pptx': 'PPT',
      'doc': 'Dokumen', 'docx': 'Dokumen',
    };
    return kategoriMap[ext] || "Other";
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
      
      const activeDivisi = divisiData.filter(divisi => {
        const status = divisi.status || divisi.status_akun || divisi.is_active;
        if (status === undefined || status === null) return true;
        return status === "aktif" || status === "active" || status === true;
      });
      
      setDivisiList(activeDivisi);
    } catch (error) {
      console.error("Error fetch divisi:", error);
      setDivisiList([]);
    }
  };

  const confirmDelete = (id, index) => {
    setDeleteTarget(id);
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

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

  const handleDownload = async (id, filename) => {
    try {
      const blob = await downloadMateri(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'materi';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh file. Silahkan coba lagi.");
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

  const getFileIcon = (kategori) => {
    const iconMap = {
      'PDF': { icon: FileText, color: "text-red-500", bgGradient: "from-red-50 to-red-100", borderColor: "border-red-200", gradient: "from-red-500 to-red-600", previewBg: "from-red-100 to-red-200" },
      'Video': { icon: Video, color: "text-blue-500", bgGradient: "from-blue-50 to-blue-100", borderColor: "border-blue-200", gradient: "from-blue-500 to-blue-600", previewBg: "from-blue-100 to-blue-200" },
      'PPT': { icon: Presentation, color: "text-orange-600", bgGradient: "from-orange-50 to-orange-100", borderColor: "border-orange-200", gradient: "from-orange-500 to-orange-600", previewBg: "from-orange-100 to-orange-200" },
      'Dokumen': { icon: FileText, color: "text-indigo-600", bgGradient: "from-indigo-50 to-indigo-100", borderColor: "border-indigo-200", gradient: "from-indigo-500 to-indigo-600", previewBg: "from-indigo-100 to-indigo-200" },
      'Other': { icon: File, color: "text-slate-500", bgGradient: "from-slate-50 to-gray-100", borderColor: "border-slate-200", gradient: "from-slate-500 to-gray-600", previewBg: "from-slate-100 to-gray-200" }
    };
    return iconMap[kategori] || iconMap['Other'];
  };

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
        <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
          <video 
            src={fileUrl} 
            className="w-full h-full object-cover" 
            muted
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play size={40} className="text-white opacity-80" />
          </div>
        </div>
      );
    }
    
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${fileInfo.bgGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.015]">
          <IconComponent className="w-40 h-40 mx-auto mt-12" />
        </div>
        <div className="relative z-10 text-center">
          <IconComponent size={56} className={`${fileInfo.color} mx-auto mb-3`} />
          <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm ${fileInfo.color}`}>
            {kategori}
          </span>
        </div>
      </div>
    );
  };

  const getUniqueDivisi = () => {
    const divisiSet = new Set();
    materi.forEach(m => {
      if (m.divisi && m.divisi !== "Umum") {
        divisiSet.add(m.divisi);
      }
    });
    divisiList.forEach(d => {
      const nama = d.nama_divisi || d.nama;
      if (nama) divisiSet.add(nama);
    });
    return Array.from(divisiSet).sort();
  };

  const filteredMateri = materi.filter((m) => {
    const judul = (m.judul || "").toLowerCase();
    const matchesSearch = judul.includes(searchQuery.toLowerCase());
    const matchesDivisi = selectedDivisi.length === 0 || selectedDivisi.includes(m.divisi);
    const matchesKategori = selectedKategori.length === 0 || selectedKategori.includes(m.kategori);
    return matchesSearch && matchesDivisi && matchesKategori;
  });

  const totalPages = Math.ceil(filteredMateri.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMateri = filteredMateri.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const toggleDivisiFilter = (divisiName) => {
    setSelectedDivisi(prev => 
      prev.includes(divisiName) 
        ? prev.filter(d => d !== divisiName)
        : [...prev, divisiName]
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
    divisi: getUniqueDivisi().length,
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
                    Materi Kompetensi
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
          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Total Materi</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
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

          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Divisi Aktif</p>
                <p className="text-2xl font-bold text-slate-800">{stats.divisi}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
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

          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Total Views</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalViews}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
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
            <button onClick={() => setActiveTab("materi")} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "materi" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
              <BookOpen size={14} /> Materi Kompetensi
            </button>
          </div>
          {activeTab === "materi" && (
            <div className="flex items-center gap-2">
              <button onClick={() => setFilterOpen(!filterOpen)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${filterOpen ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600"}`}>
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Filter</span>
                {(selectedDivisi.length > 0 || selectedKategori.length > 0) && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {selectedDivisi.length + selectedKategori.length}
                  </span>
                )}
              </div>
              <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1">
                <X size={12} /> Reset
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Cari judul materi..." 
                  value={searchQuery} 
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" 
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">Divisi</label>
                <div className="flex flex-wrap gap-2 max-h-[84px] overflow-y-auto pr-1">
                  {getUniqueDivisi().map(divisiNama => {
                    const isSelected = selectedDivisi.includes(divisiNama);
                    return (
                      <button
                        key={divisiNama}
                        onClick={() => toggleDivisiFilter(divisiNama)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected 
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {divisiNama}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {kategoriOptions.map(kat => {
                    const isSelected = selectedKategori.includes(kat);
                    const fileInfo = getFileIcon(kat);
                    const IconComp = fileInfo.icon;
                    return (
                      <button
                        key={kat}
                        onClick={() => toggleKategoriFilter(kat)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          isSelected 
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
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
                    const actualIndex = startIndex + idx;
                    
                    return (
                      <div 
                        key={actualIndex} 
                        onClick={() => handlePreview(item, actualIndex)} 
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer overflow-hidden group hover:shadow-lg transition-all duration-300"
                      >
                        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                          {getGridViewPreview(item)}
                        </div>
                        
                        <div className="p-4 space-y-3">
                          {/* TOP - Urutan & Divisi - Style lebih kecil dan rapi */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              {/* Nomor urutan kecil seperti badge */}
                              <div className="min-w-[24px] h-6 px-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-semibold shadow-sm">
                                {item.urutan}
                              </div>
                              {/* Nama divisi dengan truncate untuk nama panjang */}
                              <span className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full truncate max-w-[120px]">
                                {item.divisi || "UMUM"}
                              </span>
                            </div>

                            {isCoo && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/coo/edit-materi/${item.id_materi}`, {
                                      state: { viewMode: "list" },
                                    });
                                  }}
                                  className="p-1.5 bg-slate-100 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <Edit2 size={12} className="text-slate-600" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(item.id_materi, actualIndex);
                                  }}
                                  className="p-1.5 bg-slate-100 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 size={12} className="text-slate-600" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* TITLE & DESCRIPTION */}
                          <div>
                            <h3 className="font-bold text-slate-800 text-[17px] line-clamp-2 leading-snug">
                              {item.judul}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                              {item.deskripsi || "Tidak ada deskripsi"}
                            </p>
                          </div>

                          {/* FOOTER - Date, Views & Download */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Calendar size={11} />
                                {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Eye size={11} />
                                {item.views || 0}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.id_materi, item.judul);
                              }}
                              className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center hover:shadow-md transition-all"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
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
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b-2 border-slate-200">
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">No</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Urutan</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Materi</th>
                        <th className="text-center px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider">Divisi</th>
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
                        const actualIndex = startIndex + idx;
                        return (
                          <tr key={actualIndex} className="cursor-pointer group hover:bg-slate-50 transition-colors" onClick={() => handlePreview(item, actualIndex)}>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-slate-500">{startIndex + idx + 1}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                                {item.urutan}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <span className="font-semibold text-slate-800 text-sm">{item.judul}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.deskripsi || "Tidak ada deskripsi"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-medium text-slate-700">{item.divisi || "-"}</span>
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
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                  <Eye size={12} className="text-slate-500" />
                                  <span className="text-xs font-bold text-slate-700">{item.views || 0}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDownload(item.id_materi, item.judul); }} 
                                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                                >
                                  <Download size={14} />
                                </button>
                                {isCoo && (
                                  <>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); navigate(`/coo/edit-materi/${item.id_materi}`, { state: { viewMode: "list" } }); }} 
                                      className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-sm"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); confirmDelete(item.id_materi, actualIndex); }} 
                                      className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-sm"
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
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
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
            )}
          </>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full animate-in zoom-in-95 duration-300">
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
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-white font-medium hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {deleting ? "Menghapus..." : "Ya, Hapus"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW FULL PAGE */}
      {preview && (
        <div className="fixed inset-0 z-[999999] bg-black flex flex-col">
          <div className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6 shrink-0">
            <div>
              <h1 className="text-white font-semibold text-lg">
                {preview.judul}
              </h1>
              <p className="text-xs text-white/60">
                Urutan {preview.urutan} • {preview.divisi} • {preview.kategori}
              </p>
            </div>
            <button
              onClick={closePreview}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>
          </div>

          <div className="flex-1 bg-black overflow-hidden">
            {preview.kategori === "PDF" ? (
              <iframe
                src={preview.file_materi}
                className="w-full h-full border-0"
                title="Preview PDF"
              />
            ) : preview.kategori === "Video" ? (
              <video
                src={preview.file_materi}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <File size={64} className="mx-auto mb-4 text-white/40" />
                  <p className="text-white/60">Preview tidak tersedia untuk file ini</p>
                  <button 
                    onClick={() => handleDownload(preview.id_materi, preview.judul)} 
                    className="mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Download size={16} /> Download File
                  </button>
                </div>
              </div>
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