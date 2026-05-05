// src/pages/mentor/DailyReport.jsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Target,
  TrendingUp,
  Eye,
  Send,
  Loader2,
  Users,
  Search,
  XCircle,
  Sparkles,
  Shield,
  Zap,
  Crown,
  Gem,
  Medal,
  Wifi,
  Smartphone
} from "lucide-react";

function DailyReport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pesertaId = searchParams.get("peserta");
  const viewMode = searchParams.get("view") || "list";
  
  const [loading, setLoading] = useState(false);
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    sudahMengisi: 0,
    belumMengisi: 0,
    persentase: 0
  });

  useEffect(() => {
    if (viewMode === "list") {
      loadDummyData();
    } else if (viewMode === "detail" && pesertaId) {
      loadDummyDetailData();
    }
  }, [selectedDate, viewMode, pesertaId]);

  const loadDummyData = () => {
    setLoading(true);
    setTimeout(() => {
      const dummyReports = [
        { id: 1, peserta_id: 1, peserta_nama: "Ahmad Firmansyah", peserta_divisi: "Frontend Development", check_in: "08:00:00", check_out: "16:30:00", status_kehadiran: "hadir", aktivitas: "Mengerjakan tugas frontend dashboard", kendala: "Tidak ada kendala", lokasi: "WFO", device: "Web", rank: "diamond" },
        { id: 2, peserta_id: 2, peserta_nama: "Siti Nurhaliza", peserta_divisi: "Backend Development", check_in: "08:15:00", check_out: "16:30:00", status_kehadiran: "terlambat", aktivitas: "Membuat API endpoint user", kendala: "Error pada database", lokasi: "WFH", device: "Mobile", rank: "diamond" },
        { id: 3, peserta_id: 3, peserta_nama: "Budi Santoso", peserta_divisi: "UI/UX Design", check_in: null, check_out: null, status_kehadiran: "alpha", aktivitas: null, kendala: null, lokasi: "-", device: "-", rank: "silver" },
        { id: 4, peserta_id: 4, peserta_nama: "Dewi Lestari", peserta_divisi: "Mobile Development", check_in: "07:55:00", check_out: "16:30:00", status_kehadiran: "hadir", aktivitas: "Membuat UI komponen mobile", kendala: "Responsive design masih kurang", lokasi: "WFO", device: "Web", rank: "gold" },
        { id: 5, peserta_id: 5, peserta_nama: "Eko Prasetyo", peserta_divisi: "Quality Assurance", check_in: "08:30:00", check_out: "16:30:00", status_kehadiran: "terlambat", aktivitas: "Testing fitur login", kendala: "Bug pada validasi form", lokasi: "WFH", device: "Mobile", rank: "gold" },
        { id: 6, peserta_id: 6, peserta_nama: "Fitri Amelia", peserta_divisi: "Data Analyst", check_in: "08:00:00", check_out: "16:30:00", status_kehadiran: "hadir", aktivitas: "Analisis data penjualan", kendala: "Data tidak valid", lokasi: "WFO", device: "Web", rank: "diamond" },
        { id: 7, peserta_id: 7, peserta_nama: "Gilang Permana", peserta_divisi: "DevOps Engineer", check_in: null, check_out: null, status_kehadiran: "izin", aktivitas: null, kendala: null, lokasi: "-", device: "-", rank: "silver" },
        { id: 8, peserta_id: 8, peserta_nama: "Hana Kirana", peserta_divisi: "Frontend Development", check_in: "08:00:00", check_out: "16:30:00", status_kehadiran: "hadir", aktivitas: "Mengerjakan komponen reusable", kendala: "Styling tidak konsisten", lokasi: "WFO", device: "Web", rank: "diamond" }
      ];
      setAllReports(dummyReports);
      setFilteredReports(dummyReports);
      const sudahMengisi = dummyReports.filter(r => r.aktivitas).length;
      setSummary({
        total: dummyReports.length,
        sudahMengisi: sudahMengisi,
        belumMengisi: dummyReports.length - sudahMengisi,
        persentase: Math.round((sudahMengisi / dummyReports.length) * 100)
      });
      setLoading(false);
    }, 300);
  };

  const loadDummyDetailData = () => {
    setLoading(true);
    setTimeout(() => {
      const pesertaMap = {
        1: { nama: "Ahmad Firmansyah", divisi: "Frontend Development", rank: "diamond", check_in: "08:00:00", check_out: "16:30:00", status: "hadir", aktivitas: "Mengerjakan tugas frontend dashboard - membuat komponen card, sidebar, dan integrasi API", kendala: "Tidak ada kendala yang berarti", lokasi: "WFO", device: "Web" },
        2: { nama: "Siti Nurhaliza", divisi: "Backend Development", rank: "diamond", check_in: "08:15:00", check_out: "16:30:00", status: "terlambat", aktivitas: "Membuat API endpoint untuk user authentication dan CRUD", kendala: "Error pada database connection", lokasi: "WFH", device: "Mobile" },
        3: { nama: "Budi Santoso", divisi: "UI/UX Design", rank: "silver", check_in: null, check_out: null, status: "alpha", aktivitas: null, kendala: null, lokasi: "-", device: "-" },
        4: { nama: "Dewi Lestari", divisi: "Mobile Development", rank: "gold", check_in: "07:55:00", check_out: "16:30:00", status: "hadir", aktivitas: "Membuat UI komponen mobile dan integrasi dengan API", kendala: "Responsive design masih kurang optimal", lokasi: "WFO", device: "Web" }
      };
      setSelectedPeserta(pesertaMap[pesertaId] || { nama: "Peserta", divisi: "-", rank: "silver" });
      setLoading(false);
    }, 300);
  };

  const getRankGradient = (rank) => {
    const gradients = {
      diamond: "from-cyan-400 to-blue-500",
      gold: "from-amber-400 to-yellow-500",
      silver: "from-slate-400 to-gray-500"
    };
    return gradients[rank] || "from-teal-500 to-blue-600";
  };

  const getRankIcon = (rank) => {
    if (rank === "diamond") return <Gem size="10" className="text-cyan-400" />;
    if (rank === "gold") return <Crown size="10" className="text-amber-400" />;
    return <Medal size="10" className="text-slate-400" />;
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = allReports.filter(r => 
        r.peserta_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.peserta_divisi && r.peserta_divisi.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports(allReports);
    }
    setCurrentPage(1);
  }, [searchTerm, allReports]);

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const formatDate = (dateString) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const date = new Date(dateString);
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getKehadiranBadge = (status) => {
    switch(status) {
      case "hadir":
        return { bg: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20", text: "text-emerald-600", icon: CheckCircle, label: "Hadir", border: "border-emerald-200" };
      case "terlambat":
        return { bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/20", text: "text-amber-600", icon: AlertCircle, label: "Terlambat", border: "border-amber-200" };
      case "izin":
        return { bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20", text: "text-blue-600", icon: FileText, label: "Izin", border: "border-blue-200" };
      default:
        return { bg: "bg-gradient-to-r from-rose-500/20 to-red-500/20", text: "text-rose-600", icon: XCircle, label: "Tidak Hadir", border: "border-rose-200" };
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  if (loading && viewMode === "list") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin relative" />
        </div>
      </div>
    );
  }

  // View Detail
  if (viewMode === "detail" && selectedPeserta) {
    const kehadiran = getKehadiranBadge(selectedPeserta.status);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative p-6 lg:p-8 max-w-[1200px] mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => setSearchParams({ view: "list", tanggal: selectedDate })}
              className="group inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-all duration-300 mb-4"
            >
              <div className="p-1 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm group-hover:bg-teal-50 transition-colors">
                <ArrowLeft size="14" />
              </div>
              <span className="text-sm font-medium">Kembali ke Daftar</span>
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Daily Report
                  </h1>
                </div>
                <p className="text-sm text-slate-500">
                  {selectedPeserta?.nama} - {formatDate(selectedDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden sticky top-6">
                <div className={`relative bg-gradient-to-r ${getRankGradient(selectedPeserta?.rank)} px-6 py-8 text-center overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-white rounded-2xl blur-md opacity-50"></div>
                      <div className="relative w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/30">
                        <span className="text-4xl font-bold text-white">{selectedPeserta?.nama?.charAt(0) || "P"}</span>
                      </div>
                    </div>
                    <h2 className="text-white font-bold text-xl mb-1">{selectedPeserta?.nama}</h2>
                    <p className="text-white/80 text-sm">{selectedPeserta?.divisi}</p>
                    {selectedPeserta?.rank && (
                      <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        {getRankIcon(selectedPeserta?.rank)}
                        <span className="text-xs font-semibold text-white uppercase">{selectedPeserta?.rank}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Tanggal</span>
                    <span className="text-sm font-semibold text-slate-700">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Check In</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                        <Clock size="12" className="text-teal-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.check_in || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Check Out</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Clock size="12" className="text-purple-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.check_out || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Lokasi</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <MapPin size="12" className="text-indigo-500" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.lokasi || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Device</span>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        {selectedPeserta?.device === "Web" ? <Wifi size="12" className="text-slate-500" /> : <Smartphone size="12" className="text-slate-500" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedPeserta?.device || "-"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Status Kehadiran</span>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${kehadiran.bg} ${kehadiran.text} border ${kehadiran.border}`}>
                      <kehadiran.icon size="10" />
                      <span className="text-xs font-semibold">{kehadiran.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg shadow-sm">
                      <FileText size="12" className="text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-800">Laporan Harian</h3>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-teal-50">
                        <Target size="14" className="text-teal-600" />
                      </div>
                      Aktivitas Hari Ini
                    </h4>
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                      <p className="text-sm text-slate-600">{selectedPeserta?.aktivitas || "Belum mengisi aktivitas"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-50">
                        <AlertCircle size="14" className="text-amber-600" />
                      </div>
                      Kendala
                    </h4>
                    <div className="bg-amber-50/30 rounded-xl p-4 border border-amber-100">
                      <p className="text-sm text-slate-600">{selectedPeserta?.kendala || "Tidak ada kendala"}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-teal-50">
                        <MessageSquare size="14" className="text-teal-600" />
                      </div>
                      Berikan Feedback / Catatan
                    </label>
                    <div className="relative">
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tulis feedback atau catatan untuk peserta..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 resize-none"
                        rows="3"
                      />
                      <button 
                        disabled={submitting || !reviewText.trim()}
                        className="absolute bottom-3 right-3 p-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                      >
                        <Send size="14" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View List
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="relative mb-10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-6 py-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Daily Report
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">Rekap check-in, check-out, dan laporan harian peserta</p>
                </div>
              </div>
            </div>
            <button className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <span className="relative z-10 flex items-center gap-2"><Download size="14" />Export Excel</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => changeDate(-1)} className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-teal-200 transition-all duration-200 shadow-sm"><ChevronLeft size="18" /></button>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm group-hover:border-teal-200 transition-all duration-200">
                <Calendar size="18" className="text-teal-500" />
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-sm text-slate-700 focus:outline-none bg-transparent font-medium" />
              </div>
            </div>
            <button onClick={() => changeDate(1)} className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-teal-200 transition-all duration-200 shadow-sm"><ChevronRight size="18" /></button>
            <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} className="relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-300">Hari Ini</button>
          </div>
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
            <input type="text" placeholder="Cari peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 shadow-sm" />
          </div>
        </div>

        {/* Display formatted date */}
        <div className="mb-5"><p className="text-sm text-slate-500 flex items-center gap-2"><Sparkles size="14" className="text-teal-500" />{formatDate(selectedDate)}</p></div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Total Peserta</p><div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center"><Users size="16" className="text-teal-600" /></div></div><p className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{summary.total}</p><p className="text-[10px] text-slate-400 mt-1">Terdaftar</p></div></div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Sudah Mengisi</p><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><CheckCircle size="16" className="text-emerald-600" /></div></div><p className="text-3xl font-bold text-emerald-600">{summary.sudahMengisi}</p><p className="text-[10px] text-slate-400 mt-1">Laporan lengkap</p></div></div>
          <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-slate-500 font-medium">Belum Mengisi</p><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><XCircle size="16" className="text-amber-600" /></div></div><p className="text-3xl font-bold text-amber-600">{summary.belumMengisi}</p><p className="text-[10px] text-slate-400 mt-1">Perlu pengingat</p></div></div>
          <div className="relative group overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative"><div className="flex items-center justify-between mb-2"><p className="text-xs text-white/80 font-medium">Partisipasi</p><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><TrendingUp size="16" className="text-white" /></div></div><p className="text-3xl font-bold text-white">{summary.persentase}%</p><p className="text-[10px] text-white/70 mt-1">Tingkat partisipasi</p></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></div>
            <div className="absolute bottom-0 left-0 h-1 bg-white rounded-full transition-all duration-500" style={{ width: `${summary.persentase}%` }}></div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kehadiran</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check In/Out</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aktivitas</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((report) => {
                  const kehadiran = getKehadiranBadge(report.status_kehadiran);
                  const KehadiranIcon = kehadiran.icon;
                  const rankGradient = getRankGradient(report.rank);
                  const isHovered = hoveredRow === report.id;
                  return (
                    <tr key={report.id} className="transition-all duration-300 group cursor-pointer" onMouseEnter={() => setHoveredRow(report.id)} onMouseLeave={() => setHoveredRow(null)} style={{ backgroundColor: isHovered ? 'rgba(20, 184, 166, 0.02)' : 'transparent' }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-r ${rankGradient} rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                            <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-r ${rankGradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}>{report.peserta_nama.charAt(0)}</div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">{report.peserta_nama}</p>
                            {report.rank && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {getRankIcon(report.rank)}
                                <span className={`text-[9px] font-medium ${rankGradient.includes('cyan') ? 'text-cyan-600' : rankGradient.includes('amber') ? 'text-amber-600' : 'text-slate-500'}`}>{report.rank.toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs font-medium text-slate-600">{report.peserta_divisi}</span></td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${kehadiran.bg} ${kehadiran.text} border ${kehadiran.border} shadow-sm`}>
                          <KehadiranIcon size="10" />
                          <span className="text-[10px] font-semibold">{kehadiran.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {report.check_in ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center"><Clock size="10" className="text-teal-500" /></div><span className="text-xs font-medium text-slate-600">{report.check_in}</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center"><Clock size="10" className="text-purple-500" /></div><span className="text-xs font-medium text-slate-600">{report.check_out}</span></div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-1.5"><div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center"><XCircle size="10" className="text-slate-400" /></div>Belum check in</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {report.aktivitas ? (
                          <p className="text-xs text-slate-600 max-w-[220px] truncate font-medium">{report.aktivitas}</p>
                        ) : (
                          <span className="text-xs text-slate-400 italic flex items-center gap-1.5"><AlertCircle size="10" />Belum mengisi</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/mentor/daily-report?view=detail&peserta=${report.peserta_id}&tanggal=${selectedDate}`} className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 group/btn inline-flex items-center gap-1.5">
                          <span className="relative z-10 flex items-center gap-1.5"><Eye size="12" />Detail</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredReports.length === 0 && (
            <div className="py-16 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto"><FileText size="32" className="text-slate-400" /></div>
              </div>
              <p className="text-slate-600 font-semibold mt-4">Tidak ada data</p>
              <p className="text-sm text-slate-400 mt-1">Tidak ada laporan pada tanggal ini</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-sm text-slate-500 flex items-center gap-2"><Zap size="14" className="text-teal-500" /> Halaman {currentPage} dari {totalPages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"><ChevronLeft size="18" /></button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`relative w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-105" : "bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {currentPage === pageNum && <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50 -z-10"></div>}
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"><ChevronRight size="18" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-teal-50/80 via-blue-50/80 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative"><div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div><div className="relative p-2.5 bg-white rounded-xl shadow-md"><Shield size="16" className="text-teal-500" /></div></div>
            <div className="flex-1"><p className="text-sm font-bold text-teal-800">Informasi Daily Report</p><p className="text-xs text-teal-700 mt-1 leading-relaxed">Daily report diupdate secara real-time oleh peserta. Klik <span className="font-semibold text-teal-600">"Detail"</span> untuk melihat laporan lengkap aktivitas, kendala, lokasi, dan device peserta, serta memberikan feedback.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyReport;