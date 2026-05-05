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
  Zap,
  TrendingUp,
  Users
} from "lucide-react";

function DaftarMateri() {
  const [loading, setLoading] = useState(false);
  const [materi, setMateri] = useState([]);
  const [filteredMateri, setFilteredMateri] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipe, setSelectedTipe] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    loadDummyData();
  }, []);

  const loadDummyData = () => {
    setLoading(true);
    setTimeout(() => {
      const dummyMateri = [
        {
          id: 1,
          judul: "Pengantar React JS",
          deskripsi: "Materi pengantar tentang React JS, komponen, state, dan props",
          tipe: "dokumen",
          file_path: "/materi/react-intro.pdf",
          file_size: "2.5 MB",
          created_by: "Mentor",
          created_at: "2024-12-01",
          views: 45,
          for_role: "peserta"
        },
        {
          id: 2,
          judul: "Tutorial Tailwind CSS",
          deskripsi: "Panduan lengkap menggunakan Tailwind CSS untuk styling",
          tipe: "video",
          file_path: "https://www.youtube.com/watch?v=example",
          file_size: null,
          created_by: "Mentor",
          created_at: "2024-12-03",
          views: 32,
          for_role: "peserta"
        },
        {
          id: 3,
          judul: "Dokumentasi Laravel 11",
          deskripsi: "Dokumentasi resmi Laravel 11 untuk backend development",
          tipe: "link",
          file_path: "https://laravel.com/docs/11.x",
          file_size: null,
          created_by: "Mentor",
          created_at: "2024-12-05",
          views: 28,
          for_role: "peserta"
        },
        {
          id: 4,
          judul: "Database Design Patterns",
          deskripsi: "Materi tentang pattern design database untuk aplikasi skala besar",
          tipe: "dokumen",
          file_path: "/materi/db-patterns.pdf",
          file_size: "3.8 MB",
          created_by: "Mentor",
          created_at: "2024-12-08",
          views: 19,
          for_role: "peserta"
        },
        {
          id: 5,
          judul: "Git & Github Workshop",
          deskripsi: "Video tutorial git dan github untuk pemula",
          tipe: "video",
          file_path: "https://www.youtube.com/watch?v=example2",
          file_size: null,
          created_by: "Mentor",
          created_at: "2024-12-10",
          views: 56,
          for_role: "peserta"
        },
        {
          id: 6,
          judul: "API Design Best Practices",
          deskripsi: "Panduan mendesain REST API yang baik dan benar",
          tipe: "link",
          file_path: "https://restfulapi.net",
          file_size: null,
          created_by: "Mentor",
          created_at: "2024-12-12",
          views: 24,
          for_role: "peserta"
        }
      ];
      setMateri(dummyMateri);
      setFilteredMateri(dummyMateri);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    let filtered = materi;
    
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

  const handleDelete = () => {
    if (selectedMateri) {
      const newMateri = materi.filter(m => m.id !== selectedMateri.id);
      setMateri(newMateri);
      setShowDeleteModal(false);
      setSelectedMateri(null);
    }
  };

  const getTipeIcon = (tipe) => {
    switch(tipe) {
      case "dokumen":
        return { icon: FileText, bg: "bg-blue-100", text: "text-blue-600", label: "Dokumen", gradient: "from-blue-500 to-cyan-500" };
      case "video":
        return { icon: Video, bg: "bg-red-100", text: "text-red-600", label: "Video", gradient: "from-red-500 to-rose-500" };
      case "link":
        return { icon: LinkIcon, bg: "bg-green-100", text: "text-green-600", label: "Link", gradient: "from-green-500 to-emerald-500" };
      default:
        return { icon: FileText, bg: "bg-slate-100", text: "text-slate-600", label: "File", gradient: "from-slate-500 to-gray-500" };
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMateri.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMateri.length / itemsPerPage);

  // Stats
  const totalMateri = materi.length;
  const totalDokumen = materi.filter(m => m.tipe === "dokumen").length;
  const totalVideo = materi.filter(m => m.tipe === "video").length;
  const totalLink = materi.filter(m => m.tipe === "link").length;
  const totalViews = materi.reduce((sum, m) => sum + m.views, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="relative w-16 h-16 border-2 border-teal-400/30 border-t-teal-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-teal-400 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 text-sm font-medium ml-3">Memuat materi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      {/* Background Decoration */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header Premium */}
        <div className="relative mb-10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-6 py-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
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
                <span className="relative z-10 flex items-center gap-2">
                  <Plus size="14" />
                  Tambah Materi
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards Premium */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between">
              <div><p className="text-xs text-slate-500 font-medium">Total Materi</p><p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{totalMateri}</p></div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><BookOpen size="16" className="text-teal-600" /></div>
            </div>
          </div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between"><div><p className="text-xs text-slate-500 font-medium">Dokumen</p><p className="text-2xl font-bold text-blue-600">{totalDokumen}</p></div><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><FileText size="16" className="text-blue-600" /></div></div>
          </div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between"><div><p className="text-xs text-slate-500 font-medium">Video</p><p className="text-2xl font-bold text-red-600">{totalVideo}</p></div><div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Video size="16" className="text-red-600" /></div></div>
          </div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between"><div><p className="text-xs text-slate-500 font-medium">Link</p><p className="text-2xl font-bold text-green-600">{totalLink}</p></div><div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"><LinkIcon size="16" className="text-green-600" /></div></div>
          </div>
          <div className="relative group overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative flex items-center justify-between"><div><p className="text-xs text-white/80 font-medium">Total Dilihat</p><p className="text-2xl font-bold text-white">{totalViews}</p></div><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><TrendingUp size="16" className="text-white" /></div></div>
          </div>
        </div>

        {/* Filter Bar Premium */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" /></div>
              <input type="text" placeholder="Cari materi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}><Grid3x3 size="18" /></button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}><List size="18" /></button>
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

        {/* Results Count */}
        <div className="mb-5"><p className="text-sm text-slate-500 flex items-center gap-2"><Sparkles size="14" className="text-teal-500" />Menampilkan <span className="font-semibold text-slate-700">{currentItems.length}</span> dari <span className="font-semibold text-slate-700">{filteredMateri.length}</span> materi</p></div>

        {/* Grid View Premium - Tanpa transisi gradasi putih yang mengganggu */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((item) => {
              const tipeStyle = getTipeIcon(item.tipe);
              const TipeIcon = tipeStyle.icon;
              const isHovered = hoveredCard === item.id;
              return (
                <div key={item.id} className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" onMouseEnter={() => setHoveredCard(item.id)} onMouseLeave={() => setHoveredCard(null)}>
                  <div className={`relative h-28 bg-gradient-to-r ${tipeStyle.gradient}`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -bottom-10 left-5">
                      <div className="relative">
                        <div className="relative w-20 h-20 rounded-xl bg-white shadow-xl flex items-center justify-center border-2 border-white/50"><TipeIcon size="28" className={tipeStyle.text} /></div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3"><div className={`px-3 py-1 rounded-full text-[11px] font-bold ${tipeStyle.bg} ${tipeStyle.text} shadow-sm`}>{tipeStyle.label}</div></div>
                  </div>
                  
                  <div className="pt-12 pb-5 px-5">
                    <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">{item.judul}</h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.deskripsi}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4"><div className="flex items-center gap-2"><Calendar size="11" /><span>{item.created_at}</span></div><div className="flex items-center gap-2"><Eye size="11" /><span>{item.views} dilihat</span></div></div>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <Link to={`/mentor/materi/${item.id}`} className="flex-1">
                        <button className="w-full px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-teal-500 hover:text-white transition-all duration-200">Lihat Materi</button>
                      </Link>
                      <Link to={`/mentor/edit-materi/${item.id}`}>
                        <button className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white transition-all duration-200"><Edit size="14" /></button>
                      </Link>
                      <button onClick={() => { setSelectedMateri(item); setShowDeleteModal(true); }} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white transition-all duration-200"><Trash2 size="14" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View Premium */}
        {viewMode === "list" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200"><th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Materi</th><th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipe</th><th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th><th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dilihat</th><th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((item) => {
                    const tipeStyle = getTipeIcon(item.tipe);
                    const TipeIcon = tipeStyle.icon;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-all duration-200 group">
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${tipeStyle.bg} flex items-center justify-center`}><TipeIcon size="16" className={tipeStyle.text} /></div><div><p className="text-sm font-semibold text-slate-800">{item.judul}</p><p className="text-[10px] text-slate-400 max-w-[300px] truncate">{item.deskripsi}</p></div></div></td>
                        <td className="px-6 py-4"><div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tipeStyle.bg} ${tipeStyle.text} text-xs font-semibold`}><TipeIcon size="10" /><span>{tipeStyle.label}</span></div></td>
                        <td className="px-6 py-4"><span className="text-sm text-slate-600">{item.created_at}</span></td>
                        <td className="px-6 py-4"><span className="text-sm font-semibold text-teal-600">{item.views}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link to={`/mentor/materi/${item.id}`}><button className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white transition-all duration-200"><Eye size="14" /></button></Link>
                            <Link to={`/mentor/edit-materi/${item.id}`}><button className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white transition-all duration-200"><Edit size="14" /></button></Link>
                            <button onClick={() => { setSelectedMateri(item); setShowDeleteModal(true); }} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white transition-all duration-200"><Trash2 size="14" /></button>
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

        {/* Empty State Premium */}
        {filteredMateri.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 py-16 text-center">
            <div className="relative inline-block"><div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div><div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto"><BookOpen size="32" className="text-slate-400" /></div></div>
            <p className="text-slate-600 font-semibold mt-4">Belum ada materi</p><p className="text-sm text-slate-400 mt-1">Mulai tambahkan materi pembelajaran untuk peserta</p>
            <Link to="/mentor/add-materi"><button className="mt-5 relative overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"><Plus size="14" />Tambah Materi</button></Link>
          </div>
        )}

        {/* Premium Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-slate-500 flex items-center gap-2"><Zap size="14" className="text-teal-500" /> Halaman {currentPage} dari {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 shadow-sm"><ChevronLeft size="18" /></button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum; if (totalPages <= 5) pageNum = i + 1; else if (currentPage <= 3) pageNum = i + 1; else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = currentPage - 2 + i;
                  return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`relative w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-105" : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{currentPage === pageNum && <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50 -z-10"></div>}{pageNum}</button>);
                })}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 shadow-sm"><ChevronRight size="18" /></button>
            </div>
          </div>
        )}

        {/* Info Banner Premium */}
        <div className="mt-8 bg-gradient-to-r from-teal-50/80 via-blue-50/80 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative"><div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div><div className="relative p-2.5 bg-white rounded-xl shadow-md"><Shield size="16" className="text-teal-500" /></div></div>
            <div className="flex-1"><p className="text-sm font-bold text-teal-800">Informasi Materi</p><p className="text-xs text-teal-700 mt-1 leading-relaxed">Materi yang ditambahkan akan langsung tersedia untuk peserta bimbingan. Pastikan materi yang diunggah sesuai dengan kebutuhan pembelajaran peserta.</p></div>
          </div>
        </div>
      </div>

      {/* Delete Modal Premium */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-red-100"><Trash2 size="18" className="text-red-500" /></div><h3 className="text-lg font-bold text-slate-800">Hapus Materi</h3></div><button onClick={() => setShowDeleteModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600"><X size="20" /></button></div>
            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus materi <span className="font-bold text-slate-800">"{selectedMateri?.judul}"</span>? Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3"><button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50">Batal</button><button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">Hapus</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DaftarMateri;