// src/pages/mentor/DaftarTugas.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  FileText,
  Users,
  Bell,
  Send,
  RefreshCw,
  MessageSquare,
  Award,
  TrendingUp,
  FolderOpen,
  Sparkles,
  Shield,
  Zap,
  Target,
  Download,
  ExternalLink,
  File,
  Image,
  FileArchive
} from "lucide-react";
import api from "../../utils/api";

function DaftarTugas() {
  const [loading, setLoading] = useState(false);
  const [tugas, setTugas] = useState([]);
  const [filteredTugas, setFilteredTugas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDeadline, setFilterDeadline] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [deleting, setDeleting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewFileUrl, setPreviewFileUrl] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");

  // Helper function untuk mendapatkan URL file yang benar
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    if (filePath.startsWith('/storage')) return `http://localhost:8000${filePath}`;
    if (filePath.startsWith('tugas/')) return `http://localhost:8000/storage/${filePath}`;
    return `http://localhost:8000/storage/${filePath}`;
  };

  // Fetch tugas from backend
  const fetchTugas = async () => {
    setLoading(true);
    try {
      const response = await api.getMentorTugas();
      
      if (response.success && response.data) {
        const transformedTugas = response.data.map(item => ({
          id: item.id_tugas,
          judul: item.judul,
          deskripsi: item.deskripsi || "-",
          deadline: item.deadline,
          bobot: item.bobot,
          status: item.status || (new Date(item.deadline) < new Date() ? "closed" : "active"),
          created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-',
          submissions: item.submissions || [],
          total_submissions: item.total_submissions || 0,
          submitted_count: item.submitted_count || 0,
          pending_review: item.pending_review || 0,
          file_tugas: item.file_tugas,
          file_url: getFileUrl(item.file_tugas)
        }));
        setTugas(transformedTugas);
        setFilteredTugas(transformedTugas);
      } else {
        console.error("Failed to fetch tugas:", response.message);
        setTugas([]);
        setFilteredTugas([]);
      }
    } catch (error) {
      console.error("Error fetching tugas:", error);
      setTugas([]);
      setFilteredTugas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTugas();
  }, []);

  useEffect(() => {
    let filtered = [...tugas];
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(t => t.status === filterStatus);
    }
    
    if (filterDeadline !== "all") {
      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);
      
      filtered = filtered.filter(t => {
        const deadline = new Date(t.deadline);
        if (filterDeadline === "urgent") {
          return deadline <= threeDaysLater && deadline >= today;
        } else if (filterDeadline === "passed") {
          return deadline < today;
        } else if (filterDeadline === "upcoming") {
          return deadline > threeDaysLater;
        }
        return true;
      });
    }
    
    setFilteredTugas(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDeadline, tugas]);

  const handleDelete = async () => {
    if (!selectedTugas) return;
    
    setDeleting(true);
    try {
      const response = await api.deleteMentorTugas(selectedTugas.id);
      
      if (response.success) {
        const newTugas = tugas.filter(t => t.id !== selectedTugas.id);
        setTugas(newTugas);
        setShowDeleteModal(false);
        setSelectedTugas(null);
      } else {
        alert("Gagal menghapus tugas: " + (response.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Error deleting tugas:", error);
      alert("Gagal menghapus tugas");
    } finally {
      setDeleting(false);
    }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      const response = await api.sendTugasReminder();
      if (response.success) {
        alert("Pengingat berhasil dikirim ke semua peserta yang belum mengumpulkan");
      } else {
        alert("Gagal mengirim pengingat: " + (response.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Gagal mengirim pengingat");
    } finally {
      setSendingReminder(false);
      setShowReminderModal(false);
    }
  };

  const openPreview = (fileUrl, fileName) => {
    setPreviewFileUrl(fileUrl);
    setPreviewFileName(fileName);
    setShowPreviewModal(true);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File size={40} className="text-slate-400" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <Image size={40} className="text-blue-500" />;
    if (ext === 'pdf') return <FileText size={40} className="text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <FileText size={40} className="text-blue-600" />;
    if (['ppt', 'pptx'].includes(ext)) return <FileText size={40} className="text-orange-500" />;
    if (['xls', 'xlsx'].includes(ext)) return <FileText size={40} className="text-green-500" />;
    if (['zip', 'rar', '7z'].includes(ext)) return <FileArchive size={40} className="text-amber-500" />;
    return <File size={40} className="text-slate-400" />;
  };

  const isPreviewable = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'].includes(ext);
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return { bg: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20", text: "text-emerald-600", icon: CheckCircle, label: "Aktif", border: "border-emerald-200" };
    }
    return { bg: "bg-gradient-to-r from-slate-500/10 to-slate-600/10", text: "text-slate-500", icon: Clock, label: "Selesai", border: "border-slate-200" };
  };

  const getSubmissionStatusColor = (status, hasSubmitted) => {
    if (!hasSubmitted) {
      return { bg: "bg-slate-200", ring: "ring-slate-300", text: "text-slate-700", label: "Belum Kumpul" };
    }
    if (status === "selesai") {
      return { bg: "bg-emerald-100", ring: "ring-emerald-300", text: "text-emerald-700", label: "Selesai" };
    }
    if (status === "revisi") {
      return { bg: "bg-purple-200", ring: "ring-purple-300", text: "text-purple-800", label: "Revisi" };
    }
    return { bg: "bg-slate-200", ring: "ring-slate-300", text: "text-slate-700", label: "Menunggu" };
  };

  const getDeadlineStatus = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { bg: "bg-gradient-to-r from-rose-500/20 to-red-500/20", text: "text-rose-600", label: "Terlewat", icon: X };
    } else if (diffDays <= 3) {
      return { bg: "bg-gradient-to-r from-teal-500/20 to-blue-500/20", text: "text-teal-600", label: `${diffDays} hari lagi`, icon: AlertCircle };
    }
    return { bg: "bg-gradient-to-r from-slate-500/10 to-slate-600/10", text: "text-slate-500", label: `${diffDays} hari`, icon: Calendar };
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTugas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTugas.length / itemsPerPage);

  const totalPending = tugas.reduce((acc, t) => {
    return acc + (t.pending_review || 0);
  }, 0);

  const totalSubmitted = tugas.reduce((acc, t) => {
    return acc + (t.submitted_count || 0);
  }, 0);

  const totalActiveTugas = tugas.filter(t => t.status === "active").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin relative" />
        </div>
        <p className="text-slate-500 mt-6 text-sm font-medium ml-3">Memuat tugas...</p>
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
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Task Management
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">Buat, kelola, dan evaluasi tugas peserta bimbingan</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowReminderModal(true)} className="relative group overflow-hidden px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:text-teal-600 transition-all duration-300 shadow-sm hover:shadow-md">
                <span className="relative z-10 flex items-center gap-2"><Bell size="14" />Kirim Pengingat</span>
              </button>
              <Link to="/mentor/add-tugas">
                <button className="relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <span className="relative z-10 flex items-center gap-2"><Plus size="14" />Buat Tugas</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-5"><div className="flex items-center justify-between mb-3"><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Tugas</p><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110"><ClipboardList size="20" className="text-teal-600" /></div></div><p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{tugas.length}</p><p className="text-[11px] text-slate-400 mt-1">Seluruh tugas</p></div>
          </div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-5"><div className="flex items-center justify-between mb-3"><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tugas Aktif</p><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:scale-110"><CheckCircle size="20" className="text-emerald-600" /></div></div><p className="text-4xl font-bold text-emerald-600">{totalActiveTugas}</p><p className="text-[11px] text-slate-400 mt-1">Sedang berjalan</p></div>
          </div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-5"><div className="flex items-center justify-between mb-3"><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Terkumpul</p><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110"><FileText size="20" className="text-blue-600" /></div></div><p className="text-4xl font-bold text-blue-600">{totalSubmitted}</p><p className="text-[11px] text-slate-400 mt-1">Tugas dikumpulkan</p></div>
          </div>
          <div className="relative group overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-5"><div className="flex items-center justify-between mb-3"><p className="text-xs text-white/80 font-medium uppercase tracking-wider">Menunggu Review</p><div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110"><Clock size="20" className="text-white" /></div></div><p className="text-4xl font-bold text-white">{totalPending}</p><p className="text-[11px] text-white/70 mt-1">Perlu dinilai</p></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="relative flex-1 max-w-md group"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" /></div><input type="text" placeholder="Cari tugas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" /></div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setSelectedFilter("all")} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${selectedFilter === "all" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}>Semua</button>
                <button onClick={() => setSelectedFilter("active")} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${selectedFilter === "active" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}>Aktif</button>
                <button onClick={() => setSelectedFilter("closed")} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${selectedFilter === "closed" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}>Selesai</button>
              </div>
              <select value={filterDeadline} onChange={(e) => setFilterDeadline(e.target.value)} className="px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400 cursor-pointer">
                <option value="all">Semua Deadline</option>
                <option value="urgent">Mendesak (&lt; 3 hari)</option>
                <option value="upcoming">Mendatang</option>
                <option value="passed">Terlewat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-teal-500 to-blue-600 rounded-full"></div>
              <p className="text-sm text-slate-500">Menampilkan <span className="font-bold text-slate-700">{currentItems.length}</span> dari <span className="font-bold text-slate-700">{filteredTugas.length}</span> tugas</p>
            </div>
            <button onClick={fetchTugas} className="text-xs text-teal-500 hover:text-teal-600 transition-colors flex items-center gap-1">
              <RefreshCw size="12" />Refresh
            </button>
          </div>
        </div>

        {/* Tugas List */}
        <div className="space-y-6">
          {currentItems.map((item) => {
            const status = getStatusBadge(item.status);
            const StatusIcon = status.icon;
            const deadlineStatus = getDeadlineStatus(item.deadline);
            const DeadlineIcon = deadlineStatus.icon;
            const totalSubmissions = item.total_submissions || 0;
            const submittedCount = item.submitted_count || 0;
            const pendingReview = item.pending_review || 0;
            const isHovered = hoveredCard === item.id;
            
            return (
              <div key={item.id} className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" onMouseEnter={() => setHoveredCard(item.id)} onMouseLeave={() => setHoveredCard(null)} style={{ borderLeftColor: isHovered ? '#14b8a6' : '#e2e8f0', borderLeftWidth: '4px' }}>
                
                <div className="relative p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="font-bold text-slate-800 text-xl transition-colors duration-300">{item.judul}</h3>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg} ${status.text} border ${status.border} shadow-sm`}><StatusIcon size="10" /><span className="text-[10px] font-semibold">{status.label}</span></div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${deadlineStatus.bg} ${deadlineStatus.text} border shadow-sm`}><DeadlineIcon size="10" /><span className="text-[10px] font-semibold">{deadlineStatus.label}</span></div>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 leading-relaxed line-clamp-2">{item.deskripsi}</p>
                      
                      {/* File Tugas dengan Preview */}
                      {item.file_url && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 inline-flex flex-wrap items-center gap-3">
                          {getFileIcon(item.file_tugas)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700 truncate max-w-[200px] md:max-w-[300px]">
                              {item.file_tugas?.split('/').pop() || 'File Tugas'}
                            </p>
                            <p className="text-[10px] text-slate-400">File tugas tersedia</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPreviewable(item.file_tugas) && (
                              <button
                                onClick={() => openPreview(item.file_url, item.file_tugas?.split('/').pop() || 'File Tugas')}
                                className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white transition-all duration-200"
                                title="Preview"
                              >
                                <Eye size="16" />
                              </button>
                            )}
                            <a 
                              href={item.file_url} 
                              download
                              className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white transition-all duration-200"
                              title="Download"
                            >
                              <Download size="16" />
                            </a>
                            <a 
                              href={item.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200"
                              title="Buka di tab baru"
                            >
                              <ExternalLink size="16" />
                            </a>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-6 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100"><Calendar size="12" className="text-slate-500" /></div>
                          <div><p className="text-[10px] text-slate-400">Deadline</p><span className="text-slate-700 font-medium text-xs">{item.deadline}</span></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-teal-50"><Award size="12" className="text-teal-600" /></div>
                          <div>
                            <p className="text-[10px] text-slate-400">Bobot</p>
                            <span className="text-teal-600 font-semibold text-xs">{item.bobot}%</span>
                            <p className="text-[8px] text-slate-400">(% dari nilai akhir)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-50"><Users size="12" className="text-blue-600" /></div>
                          <div><p className="text-[10px] text-slate-400">Pengumpulan</p><span className="text-blue-600 font-semibold text-xs">{submittedCount}/{totalSubmissions}</span></div>
                        </div>
                        {pendingReview > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-teal-50"><AlertCircle size="12" className="text-teal-600" /></div>
                            <div><p className="text-[10px] text-slate-400">Review</p><span className="text-teal-600 font-semibold text-xs">{pendingReview} perlu direview</span></div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link to={`/mentor/validasi-tugas/${item.id}`}>
                        <button className="relative overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-xs font-semibold text-white shadow-md hover:shadow-xl transition-all duration-300 group/btn">
                          <span className="relative z-10 flex items-center gap-1.5"><Eye size="14" />Validasi</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                        </button>
                      </Link>
                      <Link to={`/mentor/edit-tugas/${item.id}`}>
                        <button className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-500 hover:text-white transition-all duration-200 hover:scale-105 transform"><Edit size="16" /></button>
                      </Link>
                      <button onClick={() => { setSelectedTugas(item); setShowDeleteModal(true); }} className="p-2.5 rounded-xl bg-slate-100 text-rose-600 hover:bg-rose-500 hover:text-white transition-all duration-200 hover:scale-105 transform"><Trash2 size="16" /></button>
                    </div>
                  </div>
                </div>
                
                {/* Submission Preview */}
                <div className="border-t border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-6 py-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <p className="text-xs font-semibold text-slate-700 flex items-center gap-2"><Target size="14" className="text-teal-500" />Status Pengumpulan:</p>
                      <div className="flex flex-wrap gap-3">
                        {item.submissions?.slice(0, 5).map((sub, idx) => {
                          const statusColor = getSubmissionStatusColor(sub.status, !!sub.submitted_at);
                          return (
                            <div key={idx} className="flex items-center gap-2 group/sub bg-slate-50 px-2 py-1 rounded-lg hover:bg-slate-100 transition-all duration-200">
                              <div className={`w-2.5 h-2.5 rounded-full ${statusColor.bg} ring-2 ${statusColor.ring}`}></div>
                              <span className={`text-[11px] font-medium transition-colors ${statusColor.text}`}>{sub.peserta_nama}</span>
                              {sub.status === "revisi" && (<MessageSquare size="10" className="text-purple-600" />)}
                            </div>
                          );
                        })}
                        {item.submissions?.length > 5 && (<span className="text-[10px] text-slate-400 font-medium">+{item.submissions.length - 5} lainnya</span>)}
                      </div>
                    </div>
                    {/* Keterangan Warna */}
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100/50">
                      <p className="text-[9px] text-slate-500 font-medium">Keterangan:</p>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-200 ring-1 ring-emerald-300"></div><span className="text-[9px] text-slate-600">Selesai</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-300 ring-1 ring-purple-400"></div><span className="text-[9px] text-slate-600">Revisi</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-1 ring-slate-400"></div><span className="text-[9px] text-slate-600">Belum Kumpul</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500 transform origin-left transition-transform duration-300 group-hover:scale-x-100 scale-x-0"></div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTugas.length === 0 && !loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 py-20 text-center">
            <div className="relative inline-block"><div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div><div className="relative w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto shadow-inner"><FolderOpen size="40" className="text-slate-400" /></div></div>
            <p className="text-slate-700 font-bold text-lg mt-5">Belum ada tugas</p><p className="text-sm text-slate-400 mt-1">Mulai buat tugas untuk peserta bimbingan Anda</p>
            <Link to="/mentor/add-tugas"><button className="mt-6 relative overflow-hidden px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"><Plus size="16" />Buat Tugas Sekarang</button></Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500 flex items-center gap-2"><Zap size="14" className="text-teal-500" /> Halaman <span className="font-bold text-slate-700">{currentPage}</span> dari <span className="font-bold text-slate-700">{totalPages}</span></p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 shadow-sm"><ChevronLeft size="18" /></button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum; if (totalPages <= 5) pageNum = i + 1; else if (currentPage <= 3) pageNum = i + 1; else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = currentPage - 2 + i;
                  return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`relative w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-105" : "bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{pageNum}</button>);
                })}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 shadow-sm"><ChevronRight size="18" /></button>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative"><div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div><div className="relative p-2 bg-white rounded-xl shadow-md"><Shield size="16" className="text-teal-500" /></div></div>
            <div className="flex-1"><p className="text-sm font-semibold text-teal-800">Informasi Penting</p><p className="text-xs text-teal-700 mt-1 leading-relaxed">Tugas yang sudah melewati deadline akan ditandai <span className="font-semibold text-rose-600">"Terlewat"</span>. Segera lakukan validasi pada tugas yang sudah dikumpulkan untuk memberikan feedback kepada peserta.</p></div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100">
                  <Eye size="18" className="text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Preview File: <span className="text-teal-600">{previewFileName}</span></h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
              >
                <X size="20" className="text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-50">
              {previewFileUrl && (
                previewFileUrl.endsWith('.pdf') ? (
                  <iframe
                    src={previewFileUrl}
                    className="w-full h-[70vh] rounded-xl"
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={previewFileUrl}
                    alt={previewFileName}
                    className="max-w-full max-h-[70vh] mx-auto object-contain rounded-xl"
                  />
                )
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all duration-200"
              >
                Tutup
              </button>
              <a
                href={previewFileUrl}
                download
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <Download size="18" />
                Download File
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg"><Trash2 size="18" className="text-white" /></div><h3 className="text-xl font-bold text-slate-800">Hapus Tugas</h3></div><button onClick={() => setShowDeleteModal(false)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"><X size="18" /></button></div>
            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus tugas <span className="font-bold text-slate-800">"{selectedTugas?.judul}"</span>? Semua data pengumpulan akan hilang secara <span className="font-semibold text-red-500">permanen</span>.</p>
            <div className="flex gap-3"><button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50">Batal</button><button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50">{deleting ? "Menghapus..." : "Hapus"}</button></div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 shadow-lg"><Bell size="18" className="text-white" /></div><h3 className="text-xl font-bold text-slate-800">Kirim Pengingat</h3></div><button onClick={() => setShowReminderModal(false)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"><X size="18" /></button></div>
            <p className="text-slate-600 mb-4">Kirim pengingat ke semua peserta yang belum mengumpulkan tugas?</p>
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 mb-6 border border-teal-200"><div className="flex items-start gap-3"><div className="p-1.5 rounded-lg bg-white shadow-sm"><Send size="12" className="text-teal-500" /></div><div><p className="text-xs text-teal-800 font-medium">Pengingat akan dikirim ke peserta yang memiliki tugas belum dikumpulkan atau belum direview via email dan notifikasi dashboard.</p></div></div></div>
            <div className="flex gap-3"><button onClick={() => setShowReminderModal(false)} className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50">Batal</button><button onClick={handleSendReminder} disabled={sendingReminder} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">{sendingReminder ? <Loader2 size="14" className="animate-spin" /> : <Send size="14" />}{sendingReminder ? "Mengirim..." : "Kirim"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DaftarTugas;