import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

import {
  FileText, Video, File, Eye, Edit2, Trash2, Plus, Search,
  Calendar, HardDrive, BookOpen, Users, ChevronRight,
  Download, Award, Sparkles,
  Grid3x3, List, ArrowUpRight, FolderOpen, X, AlertCircle,
  Filter, Building2, Tag, SlidersHorizontal, ChevronDown,
  Shield, CheckCircle, Clock, TrendingUp, Star, Zap,
  ExternalLink, Image, Play, Layers, Target, ListChecks
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
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDivisi, setSelectedDivisi] = useState("all");
  const [selectedKategori, setSelectedKategori] = useState("all");

  const BASE_URL = "http://localhost:8000";

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
      const response = await api.getMateri();
      if (response.success && response.data) {
        const enrichedData = response.data.map(item => {
          let kategori = item.kategori || item.type || "File";
          return {
            id_materi: item.id_materi_pelatihan || item.id_materi || item.id,
            judul: item.judul || item.title || "Tanpa Judul",
            deskripsi: item.deskripsi || item.description || "",
            divisi: item.divisi || "Umum",
            kategori: kategori,
            file_materi: cleanUrl(item.file_materi || item.file_url || item.file_path),
            views: item.views || 0,
            created_at: item.created_at,
          };
        });
        setMateri(enrichedData);
      }
    } catch (error) {
      console.error("Error fetch materi:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuiz = async () => {
    try {
      const response = await api.getQuiz();
      let quizData = [];
      if (response && response.success && response.data) {
        quizData = response.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        quizData = response.data;
      } else if (Array.isArray(response)) {
        quizData = response;
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
      const response = await api.getDivisi();
      let divisiData = [];
      if (response.success && response.data) {
        divisiData = response.data;
      }
      setDivisiList(divisiData);
    } catch (error) {
      console.error("Error fetch divisi:", error);
    }
  };

  const handleDelete = async (id, index) => {
    if (!confirm("Yakin ingin menghapus materi ini?")) return;
    try {
      await api.deleteMateri(id);
      const updated = [...materi];
      updated.splice(index, 1);
      setMateri(updated);
    } catch (error) {
      alert("Gagal menghapus materi");
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

  const downloadFile = (url, filename) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'materi';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (kategori) => {
    const lower = (kategori || "").toLowerCase();
    if (lower.includes("pdf")) return { icon: FileText, color: "text-red-500", label: "PDF", iconBg: "bg-red-100" };
    if (lower.includes("video")) return { icon: Video, color: "text-blue-500", label: "Video", iconBg: "bg-blue-100" };
    if (lower.includes("image")) return { icon: Image, color: "text-purple-600", label: "Image", iconBg: "bg-purple-100" };
    return { icon: File, color: "text-slate-500", label: kategori || "File", iconBg: "bg-slate-100" };
  };

  const getPreviewContent = (item) => {
    const kategori = (item.kategori || "").toLowerCase();
    const fileUrl = item.file_materi;
    const fileInfo = getFileIcon(item.kategori);
    const IconComponent = fileInfo.icon;
    
    if (kategori.includes("pdf") && fileUrl) {
      return (
        <embed
          src={fileUrl}
          type="application/pdf"
          className="w-full h-full object-cover"
          style={{ pointerEvents: 'none' }}
        />
      );
    }
    
    if (kategori.includes("video") && fileUrl) {
      return (
        <div className="relative w-full h-full">
          <video 
            src={fileUrl} 
            className="w-full h-full object-cover" 
            preload="metadata"
            muted
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
              <Play size={20} className="text-blue-600 ml-1" />
            </div>
          </div>
        </div>
      );
    }
    
    if (kategori.includes("image") && fileUrl) {
      return (
        <img src={fileUrl} alt={item.judul} className="w-full h-full object-cover" />
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <IconComponent size={56} className={fileInfo.color} />
      </div>
    );
  };

  const filteredMateri = materi.filter((m) => {
    const judul = (m.judul || "").toLowerCase();
    const matchesSearch = judul.includes(searchQuery.toLowerCase());
    const matchesDivisi = selectedDivisi === "all" || m.divisi === selectedDivisi;
    const matchesKategori = selectedKategori === "all" || (m.kategori || "").toLowerCase().includes(selectedKategori.toLowerCase());
    return matchesSearch && matchesDivisi && matchesKategori;
  });

  const resetFilters = () => {
    setSelectedDivisi("all");
    setSelectedKategori("all");
    setSearchQuery("");
  };

  const stats = {
    total: materi.length,
    divisi: [...new Set(materi.map((m) => m.divisi).filter(Boolean))].length,
    totalViews: materi.reduce((acc, m) => acc + (m.views || 0), 0)
  };

  const renderPreviewContent = () => {
    if (!preview) return null;
    
    const fileUrl = preview.file_materi;
    const kategori = (preview.kategori || "").toLowerCase();
    const isPDF = kategori.includes("pdf");
    const isVideo = kategori.includes("video");
    const isImage = kategori.includes("image");
    
    if (!fileUrl) {
      return (
        <div className="text-center text-white">
          <File size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-white/60">Preview tidak tersedia</p>
        </div>
      );
    }
    
    if (isPDF) {
      return <embed src={fileUrl} type="application/pdf" className="w-full h-full" />;
    }
    
    if (isVideo) {
      return <video src={fileUrl} controls autoPlay className="max-w-full max-h-full mx-auto" />;
    }
    
    if (isImage) {
      return <img src={fileUrl} alt={preview.judul} className="max-w-full max-h-full mx-auto object-contain" />;
    }
    
    return (
      <div className="text-center text-white">
        <File size={64} className="mx-auto mb-4 opacity-50" />
        <p className="text-white/60 mb-4">Preview tidak tersedia</p>
        <button onClick={() => downloadFile(fileUrl, preview.judul)} className="px-5 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
          Download File
        </button>
      </div>
    );
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
              <button onClick={() => navigate("/coo/add-materi")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200">
                <Plus size={16} /> Tambah Materi
              </button>
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Total Materi</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
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

          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Divisi Aktif</p>
                <p className="text-2xl font-bold text-slate-800">{stats.divisi}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
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

          <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Total Views</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalViews}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
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
              <div className="flex items-center gap-2"><div className="p-1.5 bg-blue-500 rounded-lg"><Filter size={14} className="text-white" /></div><h3 className="font-semibold text-slate-800">Filter Materi</h3></div>
              <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"><X size={12} /> Reset</button>
            </div>
            <div className="mb-5">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" placeholder="Cari judul materi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2"><Building2 size={12} /> Divisi</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedDivisi("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedDivisi === "all" ? "bg-blue-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Semua</button>
                  {divisiList.map(div => (
                    <button key={div.id_divisi} onClick={() => setSelectedDivisi(div.nama_divisi)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedDivisi === div.nama_divisi ? "bg-blue-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{div.nama_divisi}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2"><Tag size={12} /> Kategori</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedKategori("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedKategori === "all" ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Semua</button>
                  <button onClick={() => setSelectedKategori("PDF")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedKategori === "PDF" ? "bg-red-500 text-white shadow-sm" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>PDF</button>
                  <button onClick={() => setSelectedKategori("Video")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedKategori === "Video" ? "bg-blue-500 text-white shadow-sm" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>Video</button>
                  <button onClick={() => setSelectedKategori("Image")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedKategori === "Image" ? "bg-purple-500 text-white shadow-sm" : "bg-purple-50 text-purple-600 hover:bg-purple-100"}`}>Image</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MATERI GRID VIEW */}
        {activeTab === "materi" && (
          <>
            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div><p className="text-slate-500">Memuat materi...</p></div>
            ) : filteredMateri.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <FolderOpen size="40" className="text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Tidak ada materi yang sesuai</p>
                <button onClick={resetFilters} className="text-blue-600 text-sm mt-2 hover:text-blue-700">Reset Filter</button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMateri.map((item, idx) => {
                  const fileInfo = getFileIcon(item.kategori);
                  const fileUrl = item.file_materi;
                  const isPDF = (item.kategori || "").toLowerCase() === "pdf";
                  
                  return (
                    <div key={idx} onClick={() => handlePreview(item, idx)} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                        {isPDF && fileUrl ? (
                          <div className="relative w-full h-full">
                            <embed
                              src={fileUrl}
                              type="application/pdf"
                              className="w-full h-full"
                              style={{ pointerEvents: 'none' }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                              <div className="bg-white/20 backdrop-blur-md rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                                <Eye size={24} className="text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          getPreviewContent(item)
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm ${fileInfo.color}`}>
                            {fileInfo.label}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                            <Eye size={10} className="text-white/80" />
                            <span className="text-[9px] text-white/80">{item.views || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-semibold px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border border-blue-100">
                            {item.divisi || "UMUM"}
                          </span>
                          {isCoo && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <button onClick={(e) => { e.stopPropagation(); navigate(`/coo/edit-materi/${item.id_materi}`); }} className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                                <Edit2 size={12} className="text-slate-500 hover:text-blue-600" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id_materi, idx); }} className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors">
                                <Trash2 size={12} className="text-slate-500 hover:text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-800 text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{item.judul}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.deskripsi || "Tidak ada deskripsi"}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                          <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Calendar size={10} />
                            {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); downloadFile(fileUrl, item.judul); }} className="p-1.5 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                            <Download size={12} className="text-purple-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Materi</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Divisi</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Kategori</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Tanggal</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Views</th>
                        <th className="text-center px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMateri.map((item, idx) => {
                        const fileInfo = getFileIcon(item.kategori);
                        const IconComponent = fileInfo.icon;
                        const fileUrl = item.file_materi;
                        return (
                          <tr key={idx} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-all duration-200 cursor-pointer group" onClick={() => handlePreview(item, idx)}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${fileInfo.iconBg} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                                  <IconComponent size={16} className={fileInfo.color} />
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{item.judul}</span>
                                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.deskripsi || "Tidak ada deskripsi"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border border-blue-100">
                                <Building2 size={10} />
                                {item.divisi || "-"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full ${
                                item.kategori?.toLowerCase() === "pdf" ? "bg-red-50 text-red-600 border border-red-100" : 
                                item.kategori?.toLowerCase() === "video" ? "bg-blue-50 text-blue-600 border border-blue-100" : 
                                "bg-purple-50 text-purple-600 border border-purple-100"
                              }`}>
                                <Tag size={10} />
                                {item.kategori || "File"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Calendar size={12} />
                                {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Eye size={12} />
                                {item.views || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {isCoo && (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/coo/edit-materi/${item.id_materi}`); }} className="group/btn relative p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md">
                                      <Edit2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-200 whitespace-nowrap">Edit</span>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id_materi, idx); }} className="group/btn relative p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 shadow-sm hover:shadow-md">
                                      <Trash2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-200 whitespace-nowrap">Hapus</span>
                                    </button>
                                  </>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); downloadFile(fileUrl, item.judul); }} className="group/btn relative p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-200 shadow-sm hover:shadow-md">
                                  <Download size={14} className="group-hover/btn:scale-110 transition-transform" />
                                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-200 whitespace-nowrap">Download</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <p className="text-[11px] text-slate-500">Menampilkan <span className="font-semibold">{filteredMateri.length}</span> dari <span className="font-semibold">{materi.length}</span> materi</p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-slate-400">Data terbaru</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col animate-in fade-in duration-200">
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-lg border-b border-white/10">
            <div>
              <h2 className="font-semibold text-white text-lg">{preview.judul}</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs text-white/60">{preview.divisi || "General"}</p>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <p className="text-xs text-white/60">{preview.views || 0} views</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadFile(preview.file_materi, preview.judul)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white hover:scale-105">
                <Download size={18} />
              </button>
              <button onClick={() => setPreview(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white hover:scale-105">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            {loading ? (
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/60">Memuat preview...</p>
              </div>
            ) : (
              renderPreviewContent()
            )}
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}

export default Materi;