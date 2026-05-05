// src/pages/mentor/Presensi.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  MapPin,
  Wifi,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  FileText,
  TrendingUp,
  Users,
  PlusCircle,
  MoreVertical,
  RefreshCw,
  Sparkles,
  Crown,
  Shield,
  Zap,
  Activity,
  BarChart3,
  Gem,
  Target,
  Medal
} from "lucide-react";

function Presensi() {
  const [loading, setLoading] = useState(true);
  const [presensi, setPresensi] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [summary, setSummary] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    izin: 0,
    alpha: 0
  });
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    fetchPresensiData();
  }, [selectedDate]);

  const fetchPresensiData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/mentor/presensi?tanggal=${selectedDate}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPresensi(data.data || []);
          setSummary(data.summary || { total: 0, hadir: 0, terlambat: 0, izin: 0, alpha: 0 });
          const rate = data.summary?.total > 0 
            ? ((data.summary.hadir + data.summary.terlambat) / data.summary.total * 100).toFixed(1)
            : 0;
          setAttendanceRate(rate);
        }
      } else {
        const dummyData = [
          { id: 1, nama: "Ahmad Firmansyah", check_in: "08:00:00", check_out: "16:30:00", status: "hadir", keterangan: "-", device: "Web", lokasi: "WFO", foto: null, rank: "diamond" },
          { id: 2, nama: "Siti Nurhaliza", check_in: "08:15:00", check_out: "16:30:00", status: "terlambat", keterangan: "Terlambat 15 menit", device: "Mobile", lokasi: "WFH", foto: null, rank: "diamond" },
          { id: 3, nama: "Budi Santoso", check_in: null, check_out: null, status: "alpha", keterangan: "Tidak hadir", device: "-", lokasi: "-", foto: null, rank: "silver" },
          { id: 4, nama: "Dewi Lestari", check_in: "07:55:00", check_out: "16:30:00", status: "hadir", keterangan: "-", device: "Web", lokasi: "WFO", foto: null, rank: "gold" },
          { id: 5, nama: "Eko Prasetyo", check_in: "08:30:00", check_out: "16:30:00", status: "terlambat", keterangan: "Terlambat 30 menit", device: "Mobile", lokasi: "WFH", foto: null, rank: "gold" },
          { id: 6, nama: "Fitri Amelia", check_in: "08:00:00", check_out: "16:30:00", status: "hadir", keterangan: "-", device: "Web", lokasi: "WFO", foto: null, rank: "diamond" },
          { id: 7, nama: "Gilang Permana", check_in: null, check_out: null, status: "izin", keterangan: "Sakit", device: "-", lokasi: "-", foto: null, rank: "silver" },
          { id: 8, nama: "Hana Kirana", check_in: "08:05:00", check_out: "16:30:00", status: "terlambat", keterangan: "Terlambat 5 menit", device: "Mobile", lokasi: "WFH", foto: null, rank: "diamond" },
        ];
        setPresensi(dummyData);
        setSummary({
          total: 8,
          hadir: 3,
          terlambat: 3,
          izin: 1,
          alpha: 1
        });
        setAttendanceRate(75);
      }
    } catch (error) {
      console.error("Error fetching presensi:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    const colors = {
      diamond: "from-cyan-400 to-blue-500",
      gold: "from-amber-400 to-yellow-500",
      silver: "from-slate-400 to-gray-500"
    };
    return colors[rank] || "from-teal-500 to-blue-600";
  };

  const getRankIcon = (rank) => {
    if (rank === "diamond") return <Gem size="10" className="text-cyan-400" />;
    if (rank === "gold") return <Crown size="10" className="text-amber-400" />;
    return <Medal size="10" className="text-slate-400" />;
  };

  const filteredPresensi = presensi.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPresensi.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPresensi.length / itemsPerPage);

  const getStatusBadge = (status) => {
    switch(status) {
      case "hadir":
        return { bg: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20", text: "text-emerald-600", icon: CheckCircle, label: "Hadir", border: "border-emerald-200" };
      case "terlambat":
        return { bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/20", text: "text-amber-600", icon: AlertCircle, label: "Terlambat", border: "border-amber-200" };
      case "izin":
        return { bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20", text: "text-blue-600", icon: FileText, label: "Izin", border: "border-blue-200" };
      default:
        return { bg: "bg-gradient-to-r from-rose-500/20 to-red-500/20", text: "text-rose-600", icon: XCircle, label: "Alpha", border: "border-rose-200" };
    }
  };

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
        <p className="text-slate-500 mt-6 text-sm font-medium ml-3">Memuat data presensi...</p>
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
        
        {/* Header Premium - Full Width Gradient Background */}
        <div className="relative mb-10 rounded-2xl overflow-hidden">
          {/* Full width gradient background dari kiri ke kanan */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-6 py-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Attendance Monitor
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">Pantau kehadiran dan kedisiplinan peserta magang</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => fetchPresensiData()}
                className="relative group overflow-hidden px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:text-teal-600 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <RefreshCw size="14" className="group-hover:rotate-180 transition-transform duration-500" />
                  Refresh
                </span>
              </button>
              <button className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <span className="relative z-10 flex items-center gap-2">
                  <Download size="14" />
                  Export Data
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Date Navigation & Summary Cards */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => changeDate(-1)}
                className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-teal-200 transition-all duration-200 shadow-sm"
              >
                <ChevronLeft size="18" />
              </button>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm group-hover:border-teal-200 transition-all duration-200">
                  <Calendar size="18" className="text-teal-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-sm text-slate-700 focus:outline-none bg-transparent font-medium"
                  />
                </div>
              </div>
              <button 
                onClick={() => changeDate(1)}
                className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-teal-200 transition-all duration-200 shadow-sm"
              >
                <ChevronRight size="18" />
              </button>
              <button 
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                Hari Ini
              </button>
            </div>
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari peserta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Display formatted date */}
          <div className="mb-5">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Sparkles size="14" className="text-teal-500" />
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* Premium Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-medium">Total Peserta</p>
                  <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Users size="14" className="text-teal-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{summary.total}</p>
                <p className="text-[10px] text-slate-400 mt-1">Terdaftar</p>
              </div>
            </div>

            <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-medium">Hadir</p>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle size="14" className="text-emerald-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{summary.hadir}</p>
                <p className="text-[10px] text-slate-400 mt-1">Tepat waktu</p>
              </div>
            </div>

            <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-medium">Terlambat</p>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                    <AlertCircle size="14" className="text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-600">{summary.terlambat}</p>
                <p className="text-[10px] text-slate-400 mt-1">Perlu perhatian</p>
              </div>
            </div>

            <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-medium">Izin</p>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText size="14" className="text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">{summary.izin}</p>
                <p className="text-[10px] text-slate-400 mt-1">Dengan keterangan</p>
              </div>
            </div>

            <div className="relative group overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-medium">Alpha</p>
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                    <XCircle size="14" className="text-rose-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-rose-600">{summary.alpha}</p>
                <p className="text-[10px] text-slate-400 mt-1">Tanpa keterangan</p>
              </div>
            </div>

            <div className="relative group overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white/80 font-medium">Attendance Rate</p>
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp size="14" className="text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{attendanceRate}%</p>
                <p className="text-[10px] text-white/70 mt-1">Tingkat kehadiran</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></div>
              <div className="absolute bottom-0 left-0 h-1 bg-white rounded-full transition-all duration-500" style={{ width: `${attendanceRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Presensi Table Premium */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check In</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check Out</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Device</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lokasi</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((item, idx) => {
                  const status = getStatusBadge(item.status);
                  const StatusIcon = status.icon;
                  const isHovered = hoveredRow === item.id;
                  const rankGradient = getRankColor(item.rank);
                  
                  return (
                    <tr 
                      key={idx} 
                      className="transition-all duration-300 group cursor-pointer"
                      onMouseEnter={() => setHoveredRow(item.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{ backgroundColor: isHovered ? 'rgba(20, 184, 166, 0.02)' : 'transparent' }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-r ${rankGradient} rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                            <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-r ${rankGradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                              {item.nama.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                              {item.nama}
                            </p>
                            {item.rank && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {getRankIcon(item.rank)}
                                <span className={`text-[9px] font-medium ${rankGradient.includes('cyan') ? 'text-cyan-600' : rankGradient.includes('amber') ? 'text-amber-600' : 'text-slate-500'}`}>
                                  {item.rank.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.check_in ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                              <Clock size="12" className="text-teal-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{item.check_in}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                              <XCircle size="12" className="text-slate-400" />
                            </div>
                            Belum check in
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.check_out ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                              <Clock size="12" className="text-purple-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{item.check_out}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                              <AlertCircle size="12" className="text-slate-400" />
                            </div>
                            Belum check out
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${status.bg} ${status.text} border ${status.border} shadow-sm`}>
                          <StatusIcon size="12" />
                          <span className="text-xs font-semibold">{status.label}</span>
                        </div>
                        {item.keterangan && item.keterangan !== "-" && (
                          <p className="text-[10px] text-slate-500 mt-1.5 ml-1">{item.keterangan}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.device && item.device !== "-" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                              {item.device === "Web" ? <Wifi size="12" className="text-slate-500" /> : <Smartphone size="12" className="text-slate-500" />}
                            </div>
                            <span className="text-xs text-slate-600 font-medium">{item.device}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.lokasi && item.lokasi !== "-" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                              <MapPin size="12" className="text-slate-500" />
                            </div>
                            <span className="text-xs text-slate-600 font-medium">{item.lokasi}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/mentor/daily-report?peserta=${item.id}&tanggal=${selectedDate}`}>
                          <button className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 group/btn">
                            <span className="relative z-10 flex items-center gap-1.5">
                              <FileText size="12" />
                              Daily Report
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State Premium */}
          {filteredPresensi.length === 0 && (
            <div className="py-16 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto">
                  <UserCheck size="36" className="text-slate-400" />
                </div>
              </div>
              <p className="text-slate-600 font-semibold mt-4">Tidak ada data presensi</p>
              <p className="text-sm text-slate-400 mt-1">Belum ada peserta yang melakukan presensi pada tanggal ini</p>
            </div>
          )}
        </div>

        {/* Premium Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Zap size="14" className="text-teal-500" />
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <ChevronLeft size="18" />
              </button>
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
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transform scale-105"
                          : "bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {currentPage === pageNum && (
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50 -z-10"></div>
                      )}
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <ChevronRight size="18" />
              </button>
            </div>
          </div>
        )}

        {/* Info Banner Premium */}
        <div className="mt-8 bg-gradient-to-r from-teal-50/80 via-blue-50/80 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div>
              <div className="relative p-2.5 bg-white rounded-xl shadow-md">
                <Shield size="16" className="text-teal-500" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-teal-800">Informasi Presensi</p>
              <p className="text-xs text-teal-700 mt-1 leading-relaxed">
                Data presensi diambil secara real-time. Peserta dengan status <span className="font-semibold text-amber-600">"Terlambat"</span> dan <span className="font-semibold text-rose-600">"Alpha"</span> memerlukan perhatian khusus. 
                Klik <span className="font-semibold text-teal-600">"Daily Report"</span> untuk melihat laporan harian lengkap peserta termasuk aktivitas, kendala, dan rencana selanjutnya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Presensi;