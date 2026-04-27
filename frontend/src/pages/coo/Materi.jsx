import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

import {
  FileText, Video, File, Eye, Edit2, Trash2, Plus, Search,
  Calendar, HardDrive, BookOpen, Users, ChevronRight,
  Download, Share2, Award, Sparkles,
  Grid3x3, List, ArrowUpRight, FolderOpen, X, AlertCircle
} from "lucide-react";

function Materi() {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState(null)

  const [materi, setMateri] = useState([]);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("materi");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [divisiList, setDivisiList] = useState([]);

  useEffect(() => {
    fetchMateri();
  }, []);

  const fetchMateri = async () => {
    setLoading(true);

    try {
      const response = await api.getMateri();

      if (response.success && response.data) {
        setMateri(response.data);
      } else {
        setMateri([]);
        console.error("Gagal mengambil data materi:", response.message);
      }
    } catch (error) {
      console.error("Error fetch materi:", error);
      setMateri([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, index) => {
    if (!confirm("Yakin ingin menghapus materi ini?")) return;

    try {
      if (id) {
        await api.deleteMateri(id);
      }

      const updated = [...materi];
      updated.splice(index, 1);
      setMateri(updated);
    } catch (error) {
      console.error("Gagal menghapus materi:", error);
      alert("Gagal menghapus materi");
    }
  };

const handlePreview = async (item, index) => {
  setLoading(true)
  try {
    let fileUrl = null
    
    // Cek apakah item memiliki file_url atau file path
    if (item.file_url) {
      fileUrl = item.file_url
    } else if (item.file_path) {
      fileUrl = item.file_path
    } else if (item.id || item.id_materi) {
      // Jika hanya punya ID, fetch detail materi untuk mendapatkan URL file
      const materiId = item.id || item.id_materi
      const response = await api.getMateriById(materiId)
      if (response.success && response.data) {
        fileUrl = response.data.file_url || response.data.file_path
        // Update item dengan data lengkap
        item = { ...item, ...response.data }
      }
    }
    
    setPreview({
      ...item,
      index,
      fileUrl: fileUrl
    })
  } catch (error) {
    console.error("Error fetching file preview:", error)
    setPreview({
      ...item,
      index,
      fileUrl: null
    })
  } finally {
    setLoading(false)
  }
}

  const getFileIcon = (type) => {
    if (!type) {
      return {
        icon: File,
        bg: "from-slate-100 to-slate-200",
        color: "text-slate-500",
        label: "File",
        gradient: "from-slate-500 to-slate-600"
      };
    }

    const lowerType = type.toLowerCase();

    if (lowerType.includes("pdf")) {
      return {
        icon: FileText,
        bg: "from-red-50 to-red-100",
        color: "text-red-500",
        label: "PDF",
        gradient: "from-red-500 to-rose-500"
      };
    }

    if (lowerType.includes("video") || lowerType.includes("mp4")) {
      return {
        icon: Video,
        bg: "from-blue-50 to-blue-100",
        color: "text-blue-500",
        label: "Video",
        gradient: "from-blue-500 to-indigo-500"
      };
    }

    if (
      lowerType.includes("ppt") ||
      lowerType.includes("pptx") ||
      lowerType.includes("presentasi")
    ) {
      return {
        icon: File,
        bg: "from-amber-50 to-amber-100",
        color: "text-amber-600",
        label: "PPT",
        gradient: "from-amber-500 to-orange-500"
      };
    }

    if (
      lowerType.includes("doc") ||
      lowerType.includes("docx") ||
      lowerType.includes("dokumen")
    ) {
      return {
        icon: FileText,
        bg: "from-emerald-50 to-emerald-100",
        color: "text-emerald-600",
        label: "DOC",
        gradient: "from-emerald-500 to-teal-500"
      };
    }

    return {
      icon: File,
      bg: "from-slate-100 to-slate-200",
      color: "text-slate-500",
      label: "File",
      gradient: "from-slate-500 to-slate-600"
    };
  };

  const displayMateri = materi;

  const filteredMateri = displayMateri.filter((m) => {
    const title = m.title || m.judul || "";
    const divisi = m.divisi || "";

    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      divisi.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const stats = {
    total: displayMateri.length,
    divisi: [...new Set(displayMateri.map((m) => m.divisi))].length,
    totalViews: displayMateri.reduce((acc, m) => acc + (m.views || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">

        {/* ===== HEADER SECTION ===== */}
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
                    Kelola dan distribusikan materi pembelajaran
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari materi atau divisi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-60 text-sm text-slate-700 shadow-sm"
                />
              </div>

              <button
                onClick={() => navigate("/coo/add-materi")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Plus size={16} />
                Tambah Materi
              </button>
            </div>
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Materi</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.divisi}</p>
                <p className="text-xs text-slate-500 mt-0.5">Divisi Aktif</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalViews}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Views</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="h-1 w-8 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* ===== TABS & VIEW MODE ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("materi")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === "materi"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <FileText size={14} />
              Materi Pelatihan
            </button>
            <button
              onClick={() => setActiveTab("kuis")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === "kuis"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <Award size={14} />
              Kuis Pelatihan
            </button>
          </div>

          {activeTab === "materi" && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                  }`}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all duration-200 ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                  }`}
              >
                <List size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ===== MATERI GRID/LIST VIEW ===== */}
        {activeTab === "materi" && (
          <>
            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500">Memuat data materi...</p>
              </div>
            ) : filteredMateri.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FolderOpen size="32" className="text-slate-400" />
                </div>
                <p className="text-slate-500 mb-2">Belum ada materi</p>
                <button
                  onClick={() => navigate("/coo/add-materi")}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 inline-flex items-center gap-1"
                >
                  + Tambah materi pertama
                  <ArrowUpRight size={14} />
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredMateri.map((item, idx) => {
                  const fileInfo = getFileIcon(
                    item.type ||
                    item.tipe_file ||
                    item.file_type ||
                    item.kategori ||
                    item.file?.type
                  );

                  const FileIcon = fileInfo.icon;
                  const title = item.title || item.judul || "Tanpa Judul";
                  const id = item.id || item.id_materi;

                  return (
                    <div
                      key={idx}
                      onClick={() => handlePreview(item, idx)}
                      className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                    >
                      {/* Preview Banner */}
                      <div className={`relative h-28 bg-gradient-to-br ${fileInfo.bg} flex items-center justify-center`}>
                        <FileIcon size={42} className={fileInfo.color} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2">
                          <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 ${fileInfo.color}`}>
                          {fileInfo.label}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                            {item.divisi || "GENERAL"}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/coo/edit-materi/${idx}`);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit2 size={12} className="text-slate-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(idx);
                              }}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={12} className="text-red-500" />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2 leading-snug">
                          {item.title || item.judul}
                        </h3>

                        <p className="text-[10px] text-slate-400 mb-2">{item.author || "Admin"}</p>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {item.date || item.created_at || item.createdAt
                              ? new Date(item.date || item.created_at || item.createdAt).toLocaleDateString("id-ID")
                              : "-"
                            }
                          </span>
                          <span className="flex items-center gap-1">
                            <HardDrive size={10} />
                            {item.size || item.ukuran_file || item.file_size || "-"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={10} />
                            {item.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Materi</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Divisi</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Tanggal</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Views</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMateri.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition group cursor-pointer" onClick={() => handlePreview(item, idx)}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                              <File size={14} className="text-blue-500" />
                            </div>
                            <span className="font-medium text-slate-800 text-sm">{title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                            {item.divisi || "-"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-500">
                          {item.date || item.created_at || item.createdAt
                            ? new Date(item.date || item.created_at || item.createdAt).toLocaleDateString("id-ID")
                            : "-"
                          }
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            {item.views || 0}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/coo/edit-materi/${id || idx}`);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit2 size={14} className="text-slate-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(id, idx);
                              }}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ===== KUIS SECTION ===== */}
        {activeTab === "kuis" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <Award size={14} className="text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800">Daftar Kuis</h3>
                  </div>
                  <p className="text-xs text-slate-400 ml-7">Kelola soal evaluasi untuk peserta</p>
                </div>
                <button
                  onClick={() => navigate("/coo/add-quiz")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-xs font-medium shadow-sm hover:shadow-md transition"
                >
                  <Plus size={12} />
                  Buat Kuis
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                { title: "Evaluasi Dasar Teknik Sipil", questions: 20, duration: 30, participants: 45, avgScore: 78, status: "active" },
                { title: "Pemahaman Visi & Misi Perusahaan", questions: 10, duration: 15, participants: 52, avgScore: 85, status: "active" },
                { title: "Manajemen Proyek Konstruksi", questions: 15, duration: 25, participants: 38, avgScore: 72, status: "draft" },
                { title: "Komunikasi Efektif dalam Tim", questions: 12, duration: 20, participants: 41, avgScore: 80, status: "active" }
              ].map((quiz, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50/50 transition group cursor-pointer" onClick={() => navigate(`/coo/quiz/${idx + 1}`)}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <Award size={12} className="text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-slate-800 text-sm">{quiz.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${quiz.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                          }`}>
                          {quiz.status === "active" ? "Aktif" : "Draft"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">📋 {quiz.questions} Pertanyaan</span>
                        <span className="flex items-center gap-1">⏱️ Durasi {quiz.duration} Menit</span>
                        <span className="flex items-center gap-1">👥 {quiz.participants} Peserta</span>
                        <span className="flex items-center gap-1">⭐ Rata-rata {quiz.avgScore}%</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/coo/quiz/${idx + 1}`);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-medium rounded-lg hover:shadow-md transition flex items-center gap-1"
                    >
                      Detail
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== PREVIEW MODAL ===== */}
        {preview && (
  <div className="fixed inset-0 bg-black/90 z-50 flex flex-col animate-in fade-in duration-200">
    <div className="bg-white px-5 py-3 flex items-center justify-between shadow-lg">
      <div>
        <h2 className="font-semibold text-slate-800">{preview.title || preview.judul}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{preview.divisi || "General"} • {preview.size || preview.ukuran_file || "Unknown"}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Tombol Download */}
        <button 
          onClick={() => {
            if (preview.fileUrl) {
              window.open(preview.fileUrl, '_blank');
            } else if (preview.file_url) {
              window.open(preview.file_url, '_blank');
            } else if (preview.file_path) {
              window.open(preview.file_path, '_blank');
            }
          }}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <Download size={18} className="text-slate-600" />
        </button>
        <button
          onClick={() => setPreview(null)}
          className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500"
        >
          ✕
        </button>
      </div>
    </div>

    <div className="flex-1 flex items-center justify-center p-6">
      {loading ? (
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-400">Memuat preview...</p>
        </div>
      ) : (() => {
        // Mendapatkan URL file dari berbagai sumber
        const fileUrl = preview.fileUrl || preview.file_url || preview.file_path;
        const fileType = preview.type || preview.tipe_file || preview.file_type || preview.kategori;
        
        // Cek tipe file
        const isPDF = fileType?.toLowerCase().includes('pdf') || fileUrl?.toLowerCase().includes('.pdf');
        const isVideo = fileType?.toLowerCase().includes('video') || 
                       fileType?.toLowerCase().includes('mp4') ||
                       fileUrl?.toLowerCase().includes('.mp4') ||
                       fileUrl?.toLowerCase().includes('.webm');
        const isImage = fileType?.toLowerCase().includes('image') ||
                       fileUrl?.toLowerCase().includes('.jpg') ||
                       fileUrl?.toLowerCase().includes('.jpeg') ||
                       fileUrl?.toLowerCase().includes('.png') ||
                       fileUrl?.toLowerCase().includes('.gif');
        const isDoc = fileType?.toLowerCase().includes('doc') ||
                     fileUrl?.toLowerCase().includes('.doc') ||
                     fileUrl?.toLowerCase().includes('.docx');
        
        if (!fileUrl) {
          return (
            <div className="text-center text-white">
              <File size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-slate-400 mb-4">Preview tidak tersedia</p>
              <button 
                onClick={() => {
                  // Coba download file jika ada ID
                  if (preview.id || preview.id_materi) {
                    const materiId = preview.id || preview.id_materi;
                    api.downloadMateri?.(materiId);
                  }
                }}
                className="px-5 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition"
              >
                Download File
              </button>
            </div>
          );
        }
        
        // Preview PDF
        if (isPDF) {
          return (
            <iframe 
              src={`${fileUrl}#toolbar=0`} 
              className="w-full h-full rounded-lg shadow-2xl bg-white"
              title="PDF Preview"
            />
          );
        }
        
        // Preview Video
        if (isVideo) {
          return (
            <video 
              src={fileUrl} 
              controls 
              autoPlay
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            >
              Browser Anda tidak mendukung video tag.
            </video>
          );
        }
        
        // Preview Image
        if (isImage) {
          return (
            <img 
              src={fileUrl} 
              alt={preview.title || preview.judul}
              className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
            />
          );
        }
        
        // Preview Dokumen (Google Docs Viewer untuk Word/Excel/PPT)
        if (isDoc || fileType?.toLowerCase().includes('presentasi') || fileType?.toLowerCase().includes('ppt')) {
          const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
          return (
            <iframe 
              src={googleDocsUrl}
              className="w-full h-full rounded-lg shadow-2xl bg-white"
              title="Document Preview"
            />
          );
        }
        
        // Fallback untuk tipe file lain
        return (
          <div className="text-center text-white">
            <File size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-slate-400 mb-2">Preview tidak tersedia untuk tipe file ini</p>
            <p className="text-xs text-slate-500 mb-4">{fileType || 'Unknown type'}</p>
            <button 
              onClick={() => window.open(fileUrl, '_blank')}
              className="px-5 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition inline-flex items-center gap-2"
            >
              <Download size={16} />
              Buka / Download File
            </button>
          </div>
        );
      })()}
    </div>
  </div>
)}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Materi;