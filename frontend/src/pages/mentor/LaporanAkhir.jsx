// src/pages/mentor/LaporanAkhir.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  MessageSquare,
  Star,
  Printer,
  Sparkles,
  Shield,
  Zap,
  Users,
  Loader2,
  Send,
  TrendingUp
} from "lucide-react";

function LaporanAkhir() {
  const [loading, setLoading] = useState(false);
  const [laporan, setLaporan] = useState([]);
  const [filteredLaporan, setFilteredLaporan] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    catatan: "",
    status: "pending"
  });
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    sudahUpload: 0,
    belumUpload: 0,
    disetujui: 0,
    revisi: 0
  });

  useEffect(() => {
    loadDummyData();
  }, []);

  const loadDummyData = () => {
    setLoading(true);
    setTimeout(() => {
      const dummyLaporan = [
        {
          id: 1,
          peserta_id: 1,
          peserta_nama: "Ahmad Firmansyah",
          peserta_divisi: "Frontend Development",
          judul: "Laporan Magang - Frontend Development",
          file_url: "/uploads/laporan-ahmad.pdf",
          file_size: "2.5 MB",
          uploaded_at: "2024-12-15 14:30:00",
          status: "pending",
          catatan: null,
          dinilai_oleh: null,
          dinilai_pada: null,
          progress: 85,
          nilai_akhir: null
        },
        {
          id: 2,
          peserta_id: 2,
          peserta_nama: "Siti Nurhaliza",
          peserta_divisi: "Backend Development",
          judul: "Laporan Akhir Magang - Backend",
          file_url: "/uploads/laporan-siti.pdf",
          file_size: "3.1 MB",
          uploaded_at: "2024-12-14 10:15:00",
          status: "approved",
          catatan: "Laporan sangat baik, lengkap dan terstruktur dengan rapi",
          dinilai_oleh: "Mentor",
          dinilai_pada: "2024-12-16 09:00:00",
          progress: 92,
          nilai_akhir: 92
        },
        {
          id: 3,
          peserta_id: 3,
          peserta_nama: "Budi Santoso",
          peserta_divisi: "UI/UX Design",
          judul: "Laporan Magang - UI/UX Design",
          file_url: "/uploads/laporan-budi.pdf",
          file_size: "1.8 MB",
          uploaded_at: "2024-12-13 09:45:00",
          status: "revision",
          catatan: "Perbaiki bagian dokumentasi design system dan lampirkan portfolio",
          dinilai_oleh: "Mentor",
          dinilai_pada: "2024-12-15 14:00:00",
          progress: 68,
          nilai_akhir: 65
        },
        {
          id: 4,
          peserta_id: 4,
          peserta_nama: "Dewi Lestari",
          peserta_divisi: "Mobile Development",
          judul: "Laporan Akhir - Mobile Dev",
          file_url: "/uploads/laporan-dewi.pdf",
          file_size: "2.2 MB",
          uploaded_at: "2024-12-14 16:20:00",
          status: "pending",
          catatan: null,
          dinilai_oleh: null,
          dinilai_pada: null,
          progress: 78,
          nilai_akhir: null
        },
        {
          id: 5,
          peserta_id: 5,
          peserta_nama: "Eko Prasetyo",
          peserta_divisi: "Quality Assurance",
          judul: null,
          file_url: null,
          file_size: null,
          uploaded_at: null,
          status: "not_uploaded",
          catatan: null,
          dinilai_oleh: null,
          dinilai_pada: null,
          progress: 71,
          nilai_akhir: null
        },
        {
          id: 6,
          peserta_id: 6,
          peserta_nama: "Fitri Amelia",
          peserta_divisi: "Data Analyst",
          judul: "Laporan Magang - Data Analyst",
          file_url: "/uploads/laporan-fitri.pdf",
          file_size: "4.2 MB",
          uploaded_at: "2024-12-15 11:00:00",
          status: "approved",
          catatan: "Analisis data sangat mendalam, good job!",
          dinilai_oleh: "Mentor",
          dinilai_pada: "2024-12-16 10:30:00",
          progress: 89,
          nilai_akhir: 90
        },
        {
          id: 7,
          peserta_id: 7,
          peserta_nama: "Gilang Permana",
          peserta_divisi: "DevOps Engineer",
          judul: null,
          file_url: null,
          file_size: null,
          uploaded_at: null,
          status: "not_uploaded",
          catatan: null,
          dinilai_oleh: null,
          dinilai_pada: null,
          progress: 64,
          nilai_akhir: null
        },
        {
          id: 8,
          peserta_id: 8,
          peserta_nama: "Hana Kirana",
          peserta_divisi: "Frontend Development",
          judul: "Laporan Akhir - Frontend",
          file_url: "/uploads/laporan-hana.pdf",
          file_size: "1.9 MB",
          uploaded_at: "2024-12-14 13:45:00",
          status: "revision",
          catatan: "Tambah screenshot aplikasi dan penjelasan lebih detail",
          dinilai_oleh: "Mentor",
          dinilai_pada: "2024-12-15 16:00:00",
          progress: 95,
          nilai_akhir: 78
        }
      ];
      setLaporan(dummyLaporan);
      setFilteredLaporan(dummyLaporan);
      
      const sudahUpload = dummyLaporan.filter(l => l.status !== "not_uploaded").length;
      setSummary({
        total: dummyLaporan.length,
        sudahUpload: sudahUpload,
        belumUpload: dummyLaporan.length - sudahUpload,
        disetujui: dummyLaporan.filter(l => l.status === "approved").length,
        revisi: dummyLaporan.filter(l => l.status === "revision").length
      });
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    let filtered = [...laporan];
    
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.peserta_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.judul && l.judul.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterStatus !== "all") {
      if (filterStatus === "uploaded") {
        filtered = filtered.filter(l => l.status !== "not_uploaded");
      } else {
        filtered = filtered.filter(l => l.status === filterStatus);
      }
    }
    
    setFilteredLaporan(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, laporan]);

  const handleOpenModal = (laporanItem) => {
    setSelectedLaporan(laporanItem);
    setReviewForm({
      catatan: laporanItem.catatan || "",
      status: laporanItem.status === "approved" ? "approved" : laporanItem.status === "revision" ? "revision" : "pending"
    });
    setShowModal(true);
  };

  const handleSubmitReview = () => {
    if (reviewForm.status === "pending") {
      alert("Pilih status terlebih dahulu (Setujui atau Revisi)");
      return;
    }
    
    setSubmitting(true);
    setTimeout(() => {
      const updatedLaporan = laporan.map(l => 
        l.id === selectedLaporan.id 
          ? { 
              ...l, 
              status: reviewForm.status, 
              catatan: reviewForm.catatan,
              dinilai_oleh: "Mentor",
              dinilai_pada: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }
          : l
      );
      setLaporan(updatedLaporan);
      setSubmitting(false);
      setShowModal(false);
      
      const sudahUpload = updatedLaporan.filter(l => l.status !== "not_uploaded").length;
      setSummary({
        total: updatedLaporan.length,
        sudahUpload: sudahUpload,
        belumUpload: updatedLaporan.length - sudahUpload,
        disetujui: updatedLaporan.filter(l => l.status === "approved").length,
        revisi: updatedLaporan.filter(l => l.status === "revision").length
      });
      
      alert(`Laporan ${reviewForm.status === "approved" ? "disetujui" : "direvisi"}`);
    }, 1000);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "approved":
        return { bg: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20", text: "text-emerald-600", icon: CheckCircle, label: "Disetujui", border: "border-emerald-200" };
      case "revision":
        return { bg: "bg-gradient-to-r from-purple-500/20 to-purple-600/20", text: "text-purple-600", icon: AlertCircle, label: "Revisi", border: "border-purple-200" };
      case "pending":
        return { bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20", text: "text-blue-600", icon: Clock, label: "Menunggu Review", border: "border-blue-200" };
      default:
        return { bg: "bg-gradient-to-r from-slate-500/10 to-slate-600/10", text: "text-slate-500", icon: X, label: "Belum Upload", border: "border-slate-200" };
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLaporan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLaporan.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin relative" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      {/* Background Decoration */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header Premium */}
        <div className="relative mb-10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur-md opacity-50"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                      Laporan Akhir
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Review dan validasi laporan akhir magang peserta</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative group overflow-hidden px-5 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:text-teal-600 transition-all duration-300 shadow-sm">
                  <span className="relative z-10 flex items-center gap-2"><Printer size="14" />Cetak Laporan</span>
                </button>
                <button className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <span className="relative z-10 flex items-center gap-2"><Download size="14" />Export Excel</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-2"><Users size="16" className="text-teal-600" /></div>
              <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{summary.total}</p>
              <p className="text-[10px] text-slate-500 mt-1">Total Peserta</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2"><FileText size="16" className="text-blue-600" /></div>
              <p className="text-2xl font-bold text-blue-600">{summary.sudahUpload}</p>
              <p className="text-[10px] text-slate-500 mt-1">Sudah Upload</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-2"><AlertCircle size="16" className="text-teal-600" /></div>
              <p className="text-2xl font-bold text-teal-600">{summary.belumUpload}</p>
              <p className="text-[10px] text-slate-500 mt-1">Belum Upload</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2"><CheckCircle size="16" className="text-emerald-600" /></div>
              <p className="text-2xl font-bold text-emerald-600">{summary.disetujui}</p>
              <p className="text-[10px] text-slate-500 mt-1">Disetujui</p>
            </div>
          </div>

          <div className="relative group overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm mx-auto mb-2"><AlertCircle size="16" className="text-white" /></div>
              <p className="text-2xl font-bold text-white">{summary.revisi}</p>
              <p className="text-[10px] text-white/80 mt-1">Revisi</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" /></div>
              <input type="text" placeholder="Cari peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400 cursor-pointer">
              <option value="all">Semua Status</option>
              <option value="uploaded">Sudah Upload</option>
              <option value="pending">Menunggu Review</option>
              <option value="approved">Disetujui</option>
              <option value="revision">Revisi</option>
              <option value="not_uploaded">Belum Upload</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-5"><p className="text-sm text-slate-500 flex items-center gap-2"><Sparkles size="14" className="text-teal-500" />Menampilkan <span className="font-bold text-slate-700">{currentItems.length}</span> dari <span className="font-bold text-slate-700">{filteredLaporan.length}</span> laporan</p></div>

        {/* Laporan Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tgl Upload</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((item) => {
                  const status = getStatusBadge(item.status);
                  const StatusIcon = status.icon;
                  const isHovered = hoveredRow === item.id;
                  
                  return (
                    <tr key={item.id} className="transition-all duration-300 group cursor-pointer" onMouseEnter={() => setHoveredRow(item.id)} onMouseLeave={() => setHoveredRow(null)} style={{ backgroundColor: isHovered ? 'rgba(20, 184, 166, 0.02)' : 'transparent' }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {item.peserta_nama.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">{item.peserta_nama}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-slate-400">{item.peserta_divisi}</span>
                              <span className="text-[9px] text-slate-300">•</span>
                              <span className="text-[9px] text-slate-400">Progress {item.progress}%</span>
                            </div>
                            {item.judul && <p className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">{item.judul}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs font-medium text-slate-600">{item.peserta_divisi}</span></td>
                      <td className="px-6 py-4">
                        {item.uploaded_at ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center"><Calendar size="12" className="text-teal-500" /></div>
                            <div><span className="text-xs font-medium text-slate-700">{item.uploaded_at.split(' ')[0]}</span><p className="text-[10px] text-slate-400">{item.uploaded_at.split(' ')[1]}</p></div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center"><Clock size="12" className="text-slate-400" /></div>Belum upload</span>
                        )}
                       </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${status.bg} ${status.text} border ${status.border} shadow-sm`}><StatusIcon size="10" /><span className="text-[10px] font-semibold">{status.label}</span></div>
                        {item.catatan && (item.status === "revision" || item.status === "approved") && (
                          <div className="flex items-center gap-1.5 mt-1.5"><div className="p-0.5 rounded-full bg-purple-100"><MessageSquare size="8" className="text-purple-500" /></div><span className="text-[9px] text-slate-500 truncate max-w-[150px]">{item.catatan}</span></div>
                        )}
                        {item.nilai_akhir && item.status === "approved" && (
                          <div className="flex items-center gap-1.5 mt-1.5"><div className="p-0.5 rounded-full bg-emerald-100"><Star size="8" className="text-emerald-500" /></div><span className="text-[9px] font-semibold text-emerald-600">Nilai: {item.nilai_akhir}</span></div>
                        )}
                       </td>
                      <td className="px-6 py-4">
                        {item.status === "not_uploaded" ? (
                          <span className="text-xs text-slate-400 italic flex items-center gap-1.5"><div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center"><Clock size="10" className="text-slate-400" /></div>Menunggu upload</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => window.open(item.file_url, '_blank')} className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all duration-200 hover:scale-105" title="Lihat Laporan"><Eye size="14" /></button>
                            <button onClick={() => window.open(item.file_url, '_blank')} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-105" title="Download"><Download size="14" /></button>
                            <button onClick={() => handleOpenModal(item)} className={`relative overflow-hidden px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                              item.status === "approved" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : 
                              item.status === "revision" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" :
                              "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md hover:shadow-lg"
                            }`}>
                              {item.status === "approved" ? <CheckCircle size="12" /> : item.status === "revision" ? <AlertCircle size="12" /> : <Send size="12" />}
                              {item.status === "approved" ? "Sudah" : item.status === "revision" ? "Revisi" : "Review"}
                            </button>
                          </div>
                        )}
                       </td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLaporan.length === 0 && (
            <div className="py-16 text-center">
              <div className="relative inline-block"><div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div><div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto"><FileText size="32" className="text-slate-400" /></div></div>
              <p className="text-slate-600 font-semibold mt-4">Tidak ada data laporan</p><p className="text-sm text-slate-400 mt-1">Belum ada laporan yang diupload peserta</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-sm text-slate-500 flex items-center gap-2"><Zap size="14" className="text-teal-500" /> Halaman <span className="font-bold text-slate-700">{currentPage}</span> dari <span className="font-bold text-slate-700">{totalPages}</span></p>
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
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative"><div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div><div className="relative p-2.5 bg-white rounded-xl shadow-md"><Shield size="16" className="text-teal-500" /></div></div>
            <div><p className="text-sm font-bold text-teal-800">Informasi Laporan Akhir</p><p className="text-xs text-teal-700 mt-1 leading-relaxed">Laporan akhir yang sudah <span className="font-bold text-teal-800">disetujui</span> akan menjadi nilai final peserta magang. Pastikan laporan sudah lengkap dan sesuai dengan standar yang ditentukan sebelum memberikan persetujuan.</p></div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedLaporan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div><div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-md"><FileText size="16" className="text-white" /></div><h3 className="text-lg font-bold text-slate-800">Review Laporan Akhir</h3></div><p className="text-sm text-slate-500 mt-1">{selectedLaporan.peserta_nama}</p></div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"><X size="18" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-teal-50"><FileText size="20" className="text-teal-500" /></div><div className="flex-1"><p className="text-sm font-semibold text-slate-700">{selectedLaporan.judul || "Laporan Akhir"}</p><p className="text-xs text-slate-400">Upload: {selectedLaporan.uploaded_at} • Size: {selectedLaporan.file_size}</p></div><button onClick={() => window.open(selectedLaporan.file_url, '_blank')} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all duration-200 flex items-center gap-1.5"><Eye size="12" />Lihat</button><button onClick={() => window.open(selectedLaporan.file_url, '_blank')} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-all duration-200 flex items-center gap-1.5"><Download size="12" />Download</button></div>
              </div>

              <div><label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><div className="p-1 rounded-lg bg-teal-50"><Activity size="12" className="text-teal-500" /></div>Status Review <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setReviewForm(prev => ({ ...prev, status: "approved" }))} className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${reviewForm.status === "approved" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md" : "border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}><CheckCircle size="16" />Setujui</button>
                  <button type="button" onClick={() => setReviewForm(prev => ({ ...prev, status: "revision" }))} className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${reviewForm.status === "revision" ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md" : "border-2 border-slate-200 text-slate-600 hover:bg-slate-50"}`}><AlertCircle size="16" />Revisi</button>
                </div>
              </div>

              <div><label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><div className="p-1 rounded-lg bg-blue-50"><MessageSquare size="12" className="text-blue-500" /></div>Catatan</label><textarea value={reviewForm.catatan} onChange={(e) => setReviewForm(prev => ({ ...prev, catatan: e.target.value }))} rows="5" placeholder="Berikan catatan atau masukan untuk perbaikan laporan..." className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 resize-none" /><p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1"><Sparkles size="10" />Catatan akan terlihat oleh peserta</p></div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all duration-200">Batal</button>
              <button onClick={handleSubmitReview} disabled={submitting || reviewForm.status === "pending"} className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <span className="relative z-10 flex items-center gap-2">{submitting ? <Loader2 size="16" className="animate-spin" /> : <Send size="16" />}{submitting ? "Menyimpan..." : "Simpan Review"}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation-duration: 0.2s; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in-95; }
      `}</style>
    </div>
  );
}

export default LaporanAkhir;