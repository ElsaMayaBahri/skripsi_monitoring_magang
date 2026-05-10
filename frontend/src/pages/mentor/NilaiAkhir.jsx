// src/pages/mentor/NilaiAkhir.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Award,
  Clock,
  PieChart,
  Printer,
  Shield,
  Sparkles,
  Zap,
  X,
  Filter,
  UserCheck,
  Calendar,
  Star,
  Target,
  MessageSquare,
  Lightbulb,
  Users2,
  Heart
} from "lucide-react";
import api from "../../utils/api";

function NilaiAkhir() {
  const [loading, setLoading] = useState(false);
  const [peserta, setPeserta] = useState([]);
  const [filteredPeserta, setFilteredPeserta] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDivisi, setFilterDivisi] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [finalizing, setFinalizing] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  const weights = {
    kehadiran: 20,
    tugas: 25,
    kuis: 15,
    manual: 40
  };

  // Fetch peserta and nilai from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching data...");
      
      const pesertaResponse = await api.getMentorPesertaList({});
      console.log("Peserta Response:", pesertaResponse);
      
      if (pesertaResponse.success && pesertaResponse.data) {
        const nilaiResponse = await api.getMentorNilai({});
        console.log("Nilai Response:", nilaiResponse);
        
        const nilaiMap = new Map();
        
        if (nilaiResponse.success && nilaiResponse.data) {
          nilaiResponse.data.forEach(n => {
            nilaiMap.set(n.id, n);
          });
        }
        
        const transformedPeserta = pesertaResponse.data.map(p => {
          const nilaiData = nilaiMap.get(p.id_peserta);
          
          const sikap = nilaiData?.sikap ?? null;
          const kualitasKerja = nilaiData?.kualitas_kerja ?? null;
          const komunikasi = nilaiData?.komunikasi ?? null;
          const kreativitas = nilaiData?.kreativitas ?? null;
          const kerjasama = nilaiData?.kerjasama ?? null;
          const inisiatif = nilaiData?.inisiatif ?? null;
          const kehadiran = nilaiData?.nilai_kehadiran ?? null;
          const nilaiTugas = nilaiData?.nilai_tugas ?? null;
          const nilaiKuis = nilaiData?.nilai_kuis ?? null;
          
          const manualValues = [sikap, kualitasKerja, komunikasi, kreativitas, kerjasama, inisiatif].filter(v => v !== null);
          const nilaiManual = manualValues.length > 0 ? Math.round(manualValues.reduce((a, b) => a + b, 0) / manualValues.length) : null;
          const status = nilaiData?.status === 'final' ? "sudah_final" : "belum_final";
          
          return {
            id: p.id_peserta,
            nama: p.nama || p.nama_peserta || "Unknown",
            divisi: p.divisi || "-",
            kehadiran: kehadiran,
            tugas: nilaiTugas,
            kuis: nilaiKuis,
            sikap: sikap,
            kualitas_kerja: kualitasKerja,
            komunikasi: komunikasi,
            kreativitas: kreativitas,
            kerjasama: kerjasama,
            inisiatif: inisiatif,
            nilai_manual: nilaiManual,
            nilai_akhir: nilaiData?.nilai_akhir ?? null,
            status: status,
            progress: p.progress || 0
          };
        });
        
        console.log("Transformed Peserta:", transformedPeserta);
        setPeserta(transformedPeserta);
        setFilteredPeserta(transformedPeserta);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = [...peserta];
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.divisi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterDivisi !== "all") filtered = filtered.filter(p => p.divisi === filterDivisi);
    if (filterStatus !== "all") filtered = filtered.filter(p => p.status === filterStatus);
    setFilteredPeserta(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterDivisi, filterStatus, peserta]);

  const hitungNilaiManual = (p) => {
    const manualValues = [
      p.sikap,
      p.kualitas_kerja,
      p.komunikasi,
      p.kreativitas,
      p.kerjasama,
      p.inisiatif
    ].filter(v => v !== null);
    
    if (manualValues.length === 0) return null;
    return Math.round(manualValues.reduce((a, b) => a + b, 0) / manualValues.length);
  };

  const isManualComplete = (p) => {
    return p.sikap !== null && p.kualitas_kerja !== null;
  };

  const handleFinalize = async (p) => {
    const nilaiManual = hitungNilaiManual(p);
    if (nilaiManual === null) {
      alert("Lengkapi penilaian manual terlebih dahulu sebelum finalisasi");
      return;
    }
    setSelectedPeserta(p);
    setShowFinalizeModal(true);
  };

  const confirmFinalize = async () => {
    if (!selectedPeserta) return;
    
    setFinalizing(true);
    try {
      console.log("Finalizing peserta ID:", selectedPeserta.id);
      const response = await api.finalizeMentorNilai(selectedPeserta.id);
      console.log("Finalize Response:", response);
      
      if (response.success) {
        alert(`Nilai akhir ${selectedPeserta.nama} telah difinalisasi`);
        setShowFinalizeModal(false);
        setSelectedPeserta(null);
        await fetchData();
      } else {
        alert(response.message || "Gagal finalisasi nilai");
      }
    } catch (error) {
      console.error("Error finalizing:", error);
      alert("Terjadi kesalahan saat finalisasi");
    } finally {
      setFinalizing(false);
    }
  };

  const getGrade = (nilai) => {
    if (nilai >= 85) return { label: "A", color: "text-emerald-600", bg: "bg-emerald-100", desc: "Sangat Baik" };
    if (nilai >= 75) return { label: "B", color: "text-blue-600", bg: "bg-blue-100", desc: "Baik" };
    if (nilai >= 65) return { label: "C", color: "text-teal-600", bg: "bg-teal-100", desc: "Cukup" };
    if (nilai >= 50) return { label: "D", color: "text-purple-600", bg: "bg-purple-100", desc: "Kurang" };
    return { label: "E", color: "text-red-600", bg: "bg-red-100", desc: "Sangat Kurang" };
  };

  const divisiList = [...new Set(peserta.map(p => p.divisi).filter(d => d && d !== "-"))];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeserta.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeserta.length / itemsPerPage);

  const sudahFinal = peserta.filter(p => p.status === "sudah_final").length;
  const belumFinal = peserta.filter(p => p.status === "belum_final").length;
  const rataRataNilai = peserta.filter(p => p.nilai_akhir !== null).reduce((acc, p) => acc + (p.nilai_akhir || 0), 0) / (peserta.filter(p => p.nilai_akhir !== null).length || 1);
  const progressPersen = peserta.length > 0 ? Math.round((sudahFinal / peserta.length) * 100) : 0;

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
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Nilai Akhir
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">Rekap nilai akhir dan finalisasi evaluasi peserta magang</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchData} className="relative group overflow-hidden px-5 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-600 transition-all duration-300 shadow-sm flex items-center gap-2">
                  <Sparkles size="14" /> Refresh
                </button>
                <button onClick={async () => {
                  const response = await api.exportMentorNilai();
                  if (response.success && response.data) {
                    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'nilai_akhir_export.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }} className="relative group overflow-hidden px-5 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-600 transition-all duration-300 shadow-sm">
                  <span className="relative z-10 flex items-center gap-2"><Download size="14" />Export Excel</span>
                </button>
                <button className="relative group overflow-hidden px-5 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-600 transition-all duration-300 shadow-sm">
                  <span className="relative z-10 flex items-center gap-2"><Printer size="14" />Cetak Rekap</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-teal-400/10 to-blue-500/10 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="relative"><div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div><div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-sm"><Users size="18" className="text-white" /></div></div>
                <div className="px-2.5 py-1 rounded-full bg-teal-500/10 backdrop-blur-sm border border-teal-500/20"><span className="text-[10px] font-bold text-teal-600 tracking-wider">TOTAL</span></div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{peserta.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Peserta Terdaftar</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="relative"><div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div><div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm"><CheckCircle size="18" className="text-white" /></div></div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20"><span className="text-[10px] font-bold text-emerald-600 tracking-wider">SUDAH</span></div>
              </div>
              <p className="text-4xl font-bold text-emerald-600">{sudahFinal}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Peserta Selesai</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="relative"><div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div><div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm"><Clock size="18" className="text-white" /></div></div>
                <div className="px-2.5 py-1 rounded-full bg-amber-500/10 backdrop-blur-sm border border-amber-500/20"><span className="text-[10px] font-bold text-amber-600 tracking-wider">BELUM</span></div>
              </div>
              <p className="text-4xl font-bold text-amber-600">{belumFinal}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Peserta Tertunda</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-white/10 to-white/5 rounded-full -mr-14 -mt-14 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="relative"><div className="absolute inset-0 bg-white/20 rounded-lg blur-sm"></div><div className="relative w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm"><Award size="18" className="text-white" /></div></div>
                <div className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"><span className="text-[10px] font-bold text-white tracking-wider">RATA</span></div>
              </div>
              <p className="text-4xl font-bold text-white">{rataRataNilai.toFixed(1)}</p>
              <p className="text-xs text-white/80 font-medium mt-1">Nilai Keseluruhan</p>
              <div className="mt-3 pt-2 border-t border-white/20">
                <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-white/70">Progress Finalisasi</span><span className="text-[10px] font-semibold text-white/90">{progressPersen}%</span></div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPersen}%` }}></div></div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white/30 via-white/50 to-white/30"></div>
          </div>
        </div>

        {/* Bobot Informasi */}
        <div className="bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-xl p-4 mb-6 border border-teal-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><div className="p-1.5 rounded-lg bg-white shadow-sm"><PieChart size="14" className="text-teal-600" /></div><span className="text-sm font-bold text-teal-800">Bobot Penilaian:</span></div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span className="text-[11px] font-semibold text-teal-700">Kehadiran: 20%</span></div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div><span className="text-[11px] font-semibold text-teal-700">Tugas: 25%</span></div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div><span className="text-[11px] font-semibold text-teal-700">Kuis: 15%</span></div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div><span className="text-[11px] font-semibold text-teal-700">Nilai Manual: 40%</span></div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" /></div><input type="text" placeholder="Cari peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" /></div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200"><Filter size="14" className="text-slate-400 ml-2" /><select value={filterDivisi} onChange={(e) => setFilterDivisi(e.target.value)} className="px-2.5 py-1.5 bg-transparent rounded-md text-sm text-slate-700 focus:outline-none cursor-pointer"><option value="all">Semua Divisi</option>{divisiList.map(div => (<option key={div} value={div}>{div}</option>))}</select></div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200"><UserCheck size="14" className="text-slate-400 ml-2" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-2.5 py-1.5 bg-transparent rounded-md text-sm text-slate-700 focus:outline-none cursor-pointer"><option value="all">Semua Status</option><option value="sudah_final">Sudah Final</option><option value="belum_final">Belum Final</option></select></div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center"><p className="text-sm text-slate-500 flex items-center gap-2"><Sparkles size="14" className="text-teal-500" />Menampilkan <span className="font-bold text-slate-700">{currentItems.length}</span> dari <span className="font-bold text-slate-700">{filteredPeserta.length}</span> peserta</p></div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kehadiran</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tugas</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kuis</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai Manual</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai Akhir</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((p) => {
                  const nilaiManual = hitungNilaiManual(p);
                  const nilaiAkhir = p.nilai_akhir;
                  const grade = nilaiAkhir ? getGrade(nilaiAkhir) : null;
                  const isComplete = isManualComplete(p);
                  const isHovered = hoveredRow === p.id;
                  
                  return (
                    <tr key={p.id} className="transition-all duration-200 group cursor-pointer" onMouseEnter={() => setHoveredRow(p.id)} onMouseLeave={() => setHoveredRow(null)} style={{ backgroundColor: isHovered ? 'rgba(20, 184, 166, 0.02)' : 'transparent' }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">{p.nama.charAt(0)}</div>
                          <div><p className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">{p.nama}</p><p className="text-[10px] text-slate-400">{p.divisi}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.kehadiran !== null ? (
                          <span className="text-sm font-semibold text-slate-700">{p.kehadiran}%</span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.tugas !== null ? (
                          <span className="text-sm font-semibold text-slate-700">{p.tugas}%</span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.kuis !== null ? (
                          <span className="text-sm font-semibold text-slate-700">{p.kuis}%</span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {nilaiManual !== null ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-teal-600">{nilaiManual}</span>
                            <span className="text-[9px] text-slate-400">/100</span>
                            {!isComplete && <span className="text-[9px] text-amber-500 ml-1">(belum lengkap)</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum diisi</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {nilaiAkhir !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-teal-600">{nilaiAkhir}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${grade.bg} ${grade.color}`}>{grade?.label}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum final</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.status === "sudah_final" ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100">
                            <CheckCircle size="12" className="text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700">Telah Difinalisasi</span>
                          </div>
                        ) : (
                          <button onClick={() => handleFinalize(p)} disabled={!isComplete} className={`relative overflow-hidden px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${isComplete ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-sm hover:shadow-md" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
                            <Shield size="12" />
                            Finalisasi
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPeserta.length === 0 && (
            <div className="py-12 text-center">
              <div className="relative inline-block"><div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div><div className="relative w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto"><Users size="28" className="text-slate-400" /></div></div>
              <p className="text-slate-600 font-semibold text-sm mt-3">Tidak ada peserta ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
              <p className="text-sm text-slate-500 flex items-center gap-2"><Zap size="14" className="text-teal-500" /> Halaman {currentPage} dari {totalPages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 shadow-sm"><ChevronLeft size="16" /></button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum; if (totalPages <= 5) pageNum = i + 1; else if (currentPage <= 3) pageNum = i + 1; else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = currentPage - 2 + i;
                    return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`relative w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-sm transform scale-105" : "bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {currentPage === pageNum && <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg blur-sm opacity-50 -z-10"></div>}
                      {pageNum}
                    </button>);
                  })}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all duration-200 shadow-sm"><ChevronRight size="16" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-xl p-4 border border-teal-100 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="relative"><div className="absolute inset-0 bg-teal-500 rounded-lg blur-sm opacity-30"></div><div className="relative p-2 bg-white rounded-lg shadow-sm"><Shield size="14" className="text-teal-500" /></div></div>
            <div><p className="text-sm font-bold text-teal-800">Informasi Finalisasi</p><p className="text-xs text-teal-700 mt-1 leading-relaxed">Nilai akhir yang sudah <span className="font-bold text-teal-800">difinalisasi</span> menjadi nilai resmi dan tidak dapat diubah. Pastikan semua komponen nilai manual (Sikap, Kualitas Kerja, Komunikasi, Kreativitas, Kerjasama, Inisiatif) sudah diisi sebelum melakukan finalisasi.</p></div>
          </div>
        </div>
      </div>

      {/* Finalize Modal */}
      {showFinalizeModal && selectedPeserta && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2"><div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 shadow-md"><Shield size="16" className="text-white" /></div><h3 className="text-lg font-bold text-slate-800">Finalisasi Nilai</h3></div>
                <p className="text-sm text-slate-500 mt-0.5">{selectedPeserta.nama}</p>
              </div>
              <button onClick={() => setShowFinalizeModal(false)} className="p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200"><X size="16" /></button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-3.5 border border-teal-200">
                <div className="flex items-start gap-2.5"><div className="p-1.5 rounded-md bg-white shadow-sm"><AlertCircle size="14" className="text-teal-500" /></div><div><p className="text-sm font-bold text-teal-800">Konfirmasi Finalisasi</p><p className="text-xs text-teal-700 mt-1">Nilai akhir akan ditetapkan sebagai nilai resmi dan <span className="font-bold">tidak dapat diubah lagi</span>.</p></div></div>
              </div>
              
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-3.5 border border-teal-100">
                <div className="flex justify-between items-center mb-2"><span className="text-sm font-semibold text-slate-700">Nilai Akhir Sementara:</span><div className="flex items-center gap-2"><span className="text-2xl font-bold text-teal-600">{hitungNilaiManual(selectedPeserta)}</span><span className="text-xs text-slate-500">/100</span></div></div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, hitungNilaiManual(selectedPeserta) || 0)}%` }}></div></div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowFinalizeModal(false)} className="px-4 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={confirmFinalize} disabled={finalizing} className="relative group overflow-hidden px-4 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 flex items-center gap-2">
                {finalizing ? <Loader2 size="14" className="animate-spin" /> : <Shield size="14" />}
                {finalizing ? "Memproses..." : "Ya, Finalisasi"}
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

export default NilaiAkhir;