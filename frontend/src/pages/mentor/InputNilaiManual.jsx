// src/pages/mentor/InputNilaiManual.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Award,
  TrendingUp,
  Clock,
  X,
  MessageSquare,
  Sparkles,
  Edit,
  Shield,
  Zap,
  Trophy,
  Filter,
  UserCheck
} from "lucide-react";

function InputNilaiManual() {
  const [loading, setLoading] = useState(false);
  const [peserta, setPeserta] = useState([]);
  const [filteredPeserta, setFilteredPeserta] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDivisi, setFilterDivisi] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [nilaiForm, setNilaiForm] = useState({
    sikap: 80,
    kualitas_kerja: 80,
    catatan: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const divisiList = [
    "Frontend Development",
    "Backend Development",
    "UI/UX Design",
    "Mobile Development",
    "Quality Assurance",
    "Data Analyst",
    "DevOps Engineer"
  ];

  useEffect(() => {
    loadDummyData();
  }, []);

  const loadDummyData = () => {
    setLoading(true);
    setTimeout(() => {
      const dummyPeserta = [
        { id: 1, nama: "Ahmad Firmansyah", divisi: "Frontend Development", sikap: null, kualitas_kerja: null, catatan: null, status: "belum_dinilai", progress: 85, email: "ahmad@email.com" },
        { id: 2, nama: "Siti Nurhaliza", divisi: "Backend Development", sikap: 88, kualitas_kerja: 92, catatan: "Sangat baik, dedikasi tinggi", status: "sudah_dinilai", progress: 92, email: "siti@email.com" },
        { id: 3, nama: "Budi Santoso", divisi: "UI/UX Design", sikap: 75, kualitas_kerja: 70, catatan: "Perlu peningkatan konsistensi", status: "sudah_dinilai", progress: 68, email: "budi@email.com" },
        { id: 4, nama: "Dewi Lestari", divisi: "Mobile Development", sikap: null, kualitas_kerja: null, catatan: null, status: "belum_dinilai", progress: 78, email: "dewi@email.com" },
        { id: 5, nama: "Eko Prasetyo", divisi: "Quality Assurance", sikap: null, kualitas_kerja: null, catatan: null, status: "belum_dinilai", progress: 71, email: "eko@email.com" },
        { id: 6, nama: "Fitri Amelia", divisi: "Data Analyst", sikap: 90, kualitas_kerja: 88, catatan: "Analisis data sangat baik", status: "sudah_dinilai", progress: 89, email: "fitri@email.com" }
      ];
      setPeserta(dummyPeserta);
      setFilteredPeserta(dummyPeserta);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    let filtered = [...peserta];
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.divisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterDivisi !== "all") filtered = filtered.filter(p => p.divisi === filterDivisi);
    if (filterStatus !== "all") filtered = filtered.filter(p => p.status === filterStatus);
    setFilteredPeserta(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterDivisi, filterStatus, peserta]);

  const handleOpenModal = (p) => {
    setSelectedPeserta(p);
    setNilaiForm({ sikap: p.sikap || 80, kualitas_kerja: p.kualitas_kerja || 80, catatan: p.catatan || "" });
    setShowModal(true);
  };

  const handleSaveNilai = () => {
    setSubmitting(true);
    setTimeout(() => {
      const updatedPeserta = peserta.map(p => 
        p.id === selectedPeserta.id ? { ...p, sikap: nilaiForm.sikap, kualitas_kerja: nilaiForm.kualitas_kerja, catatan: nilaiForm.catatan, status: "sudah_dinilai" } : p
      );
      setPeserta(updatedPeserta);
      setSubmitting(false);
      setShowModal(false);
      setSuccessMessage(`Nilai untuk ${selectedPeserta.nama} berhasil disimpan`);
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1000);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeserta.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeserta.length / itemsPerPage);

  const sudahDinilai = peserta.filter(p => p.status === "sudah_dinilai").length;
  const belumDinilai = peserta.filter(p => p.status === "belum_dinilai").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="relative"><div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div><Loader2 className="w-12 h-12 text-teal-500 animate-spin relative" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1400px] mx-auto">
        
        {/* Header Premium */}
        <div className="relative mb-10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative"><div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur-md opacity-50"></div><div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Star className="w-7 h-7 text-white" /></div></div>
                <div><h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">Input Nilai Manual</h1><p className="text-sm text-slate-500 mt-1">Input nilai sikap dan kualitas kerja peserta magang</p></div>
              </div>
              <Link to="/mentor/nilai-akhir"><button className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"><span className="relative z-10 flex items-center gap-2"><TrendingUp size="14" />Lihat Nilai Akhir</span><div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div></button></Link>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 backdrop-blur-sm border border-emerald-200 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300 shadow-md">
            <div className="flex items-center gap-3"><div className="relative"><div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-30"></div><div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md"><CheckCircle size="14" className="text-white" /></div></div><p className="text-sm font-semibold text-emerald-800">{successMessage}</p></div>
          </div>
        )}

        {/* Premium Stats Cards - Desain Mewah */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-md"><Users size="20" className="text-white" /></div>
                <div className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30"><span className="text-[10px] font-semibold text-teal-600">TOTAL</span></div>
              </div>
              <p className="text-4xl font-bold text-slate-800">{peserta.length}</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">Peserta Aktif</p>
              <div className="mt-4 pt-3 border-t border-slate-100"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-1.5 w-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full"></div><span className="text-[10px] text-slate-400">Total</span></div><span className="text-[10px] font-semibold text-teal-600">Semua peserta</span></div></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md"><CheckCircle size="20" className="text-white" /></div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30"><span className="text-[10px] font-semibold text-emerald-600">SUDAH</span></div>
              </div>
              <p className="text-4xl font-bold text-emerald-600">{sudahDinilai}</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">Sudah Dinilai</p>
              <div className="mt-4 pt-3 border-t border-slate-100"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-1.5 w-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div><span className="text-[10px] text-slate-400">Lengkap</span></div><span className="text-[10px] font-semibold text-emerald-600">Telah dinilai</span></div></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md"><Clock size="20" className="text-white" /></div>
                <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30"><span className="text-[10px] font-semibold text-blue-600">BELUM</span></div>
              </div>
              <p className="text-4xl font-bold text-blue-600">{belumDinilai}</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">Belum Dinilai</p>
              <div className="mt-4 pt-3 border-t border-slate-100"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-1.5 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div><span className="text-[10px] text-slate-400">Pending</span></div><span className="text-[10px] font-semibold text-blue-600">Perlu input</span></div></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-md"><Award size="20" className="text-white" /></div>
                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm"><span className="text-[10px] font-semibold text-white">PROGRESS</span></div>
              </div>
              <p className="text-4xl font-bold text-white">{Math.round((sudahDinilai / peserta.length) * 100)}%</p>
              <p className="text-sm text-white/80 mt-1 font-medium">Selesai</p>
              <div className="mt-4 pt-3 border-t border-white/20"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-1.5 w-8 bg-white/30 rounded-full"></div><span className="text-[10px] text-white/70">Progress</span></div><div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${(sudahDinilai / peserta.length) * 100}%` }}></div></div></div></div>
            </div>
          </div>
        </div>

        {/* Filter Bar Premium */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md group"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" /></div><input type="text" placeholder="Cari peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200" /></div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-200"><Filter size="14" className="text-slate-400 ml-2" /><select value={filterDivisi} onChange={(e) => setFilterDivisi(e.target.value)} className="px-3 py-2 bg-transparent rounded-lg text-sm text-slate-700 focus:outline-none cursor-pointer"><option value="all">Semua Divisi</option>{divisiList.map(div => (<option key={div} value={div}>{div}</option>))}</select></div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-200"><UserCheck size="14" className="text-slate-400 ml-2" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-transparent rounded-lg text-sm text-slate-700 focus:outline-none cursor-pointer"><option value="all">Semua Status</option><option value="sudah_dinilai">Sudah Dinilai</option><option value="belum_dinilai">Belum Dinilai</option></select></div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-5 flex justify-between items-center"><p className="text-sm text-slate-500 flex items-center gap-2"><Sparkles size="14" className="text-teal-500" />Menampilkan <span className="font-bold text-slate-700">{currentItems.length}</span> dari <span className="font-bold text-slate-700">{filteredPeserta.length}</span> peserta</p></div>

        {/* Premium Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((p) => {
            const isHovered = hoveredCard === p.id;
            const rataNilai = p.sikap && p.kualitas_kerja ? Math.round((p.sikap + p.kualitas_kerja) / 2) : null;
            
            return (
              <div key={p.id} className="group relative bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl" onMouseEnter={() => setHoveredCard(p.id)} onMouseLeave={() => setHoveredCard(null)}>
                
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-blue-600 transform origin-left transition-transform duration-300 group-hover:scale-x-100 scale-x-0"></div>
                
                {/* Card Header dengan avatar mewah */}
                <div className="relative px-5 pt-6 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                          <span className="text-xl font-bold text-white">{p.nama.charAt(0)}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-teal-600 transition-colors">{p.nama}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{p.divisi}</span>
                          <span className="text-[10px] text-slate-400">• Progress {p.progress}%</span>
                        </div>
                      </div>
                    </div>
                    {p.status === "sudah_dinilai" ? (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100"><CheckCircle size="10" className="text-emerald-600" /><span className="text-[9px] font-semibold text-emerald-700">Dinilai</span></div>
                    ) : (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100"><Clock size="10" className="text-teal-600" /><span className="text-[9px] font-semibold text-teal-700">Pending</span></div>
                    )}
                  </div>
                </div>
                
                {/* Divider */}
                <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                
                {/* Card Body - Nilai Preview */}
                <div className="px-5 py-4 space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center"><Star size="14" className="text-amber-600" /></div>
                      <div><p className="text-[10px] text-slate-400">Nilai Sikap</p><p className="text-xs font-medium text-slate-600">Disiplin & Tanggung Jawab</p></div>
                    </div>
                    {p.sikap ? (
                      <div className="text-right"><span className="text-xl font-bold text-teal-600">{p.sikap}</span><span className="text-xs text-slate-400">/100</span></div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum diisi</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center"><Award size="14" className="text-purple-600" /></div>
                      <div><p className="text-[10px] text-slate-400">Kualitas Kerja</p><p className="text-xs font-medium text-slate-600">Ketelitian & Hasil</p></div>
                    </div>
                    {p.kualitas_kerja ? (
                      <div className="text-right"><span className="text-xl font-bold text-teal-600">{p.kualitas_kerja}</span><span className="text-xs text-slate-400">/100</span></div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum diisi</span>
                    )}
                  </div>
                  
                  {rataNilai && (
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center"><Trophy size="14" className="text-teal-600" /></div>
                        <div><p className="text-[10px] text-slate-400">Rata-rata</p><p className="text-xs font-semibold text-teal-700">Nilai Sementara</p></div>
                      </div>
                      <div className="text-right"><span className="text-xl font-bold text-teal-700">{rataNilai}</span><span className="text-xs text-slate-400">/100</span></div>
                    </div>
                  )}
                </div>
                
                {/* Card Footer - Action Button */}
                <div className="px-5 pb-5 pt-2">
                  <button onClick={() => handleOpenModal(p)} className="relative overflow-hidden w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 group/btn flex items-center justify-center gap-2">
                    <span className="relative z-10 flex items-center gap-2">{p.status === "sudah_dinilai" ? <Edit size="14" /> : <Star size="14" />}{p.status === "sudah_dinilai" ? "Edit Nilai" : "Input Nilai"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPeserta.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 py-16 text-center">
            <div className="relative inline-block"><div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div><div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto"><Users size="32" className="text-slate-400" /></div></div>
            <p className="text-slate-600 font-semibold mt-4">Tidak ada peserta ditemukan</p><p className="text-sm text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter</p>
          </div>
        )}

        {/* Pagination */}
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

        {/* Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent backdrop-blur-sm rounded-2xl p-5 border border-teal-100 shadow-md">
          <div className="flex items-start gap-3">
            <div className="relative"><div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div><div className="relative p-2.5 bg-white rounded-xl shadow-md"><Shield size="16" className="text-teal-500" /></div></div>
            <div><p className="text-sm font-bold text-teal-800">Panduan Penilaian</p><p className="text-xs text-teal-700 mt-1 leading-relaxed">Nilai <span className="font-bold text-teal-800">Sikap</span> mencakup: disiplin, tanggung jawab, kerjasama, dan inisiatif. Nilai <span className="font-bold text-teal-800">Kualitas Kerja</span> mencakup: ketelitian, hasil kerja, problem solving, dan kreativitas. Kedua nilai akan dihitung rata-ratanya untuk nilai akhir.</p></div>
          </div>
        </div>
      </div>

      {/* Modal Input Nilai */}
      {showModal && selectedPeserta && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div><div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-md"><Star size="16" className="text-white" /></div><h3 className="text-lg font-bold text-slate-800">Input Nilai Manual</h3></div><p className="text-sm text-slate-500 mt-1">{selectedPeserta.nama}</p></div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"><X size="18" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div><label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><div className="p-1 rounded-lg bg-teal-100"><Star size="12" className="text-teal-600" /></div>Nilai Sikap <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                  <input type="range" min="0" max="100" value={nilaiForm.sikap} onChange={(e) => setNilaiForm(prev => ({ ...prev, sikap: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                  <div className="flex justify-between items-center"><span className="text-xs text-slate-500">0</span><div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50"><Star size="16" className="text-teal-600" /><span className="text-2xl font-bold text-teal-600">{nilaiForm.sikap}</span><span className="text-sm text-slate-500">/100</span></div><span className="text-xs text-slate-500">100</span></div>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">{ [60,70,80,90,100].map(val => (<button key={val} type="button" onClick={() => setNilaiForm(prev => ({ ...prev, sikap: val }))} className="px-3 py-1 text-xs font-medium bg-slate-100 rounded-lg text-slate-600 hover:bg-teal-100 hover:text-teal-700 transition-all duration-200">{val}</button>)) }</div>
              </div>

              <div><label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><div className="p-1 rounded-lg bg-purple-100"><Award size="12" className="text-purple-600" /></div>Kualitas Kerja <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                  <input type="range" min="0" max="100" value={nilaiForm.kualitas_kerja} onChange={(e) => setNilaiForm(prev => ({ ...prev, kualitas_kerja: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                  <div className="flex justify-between items-center"><span className="text-xs text-slate-500">0</span><div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50"><Award size="16" className="text-purple-600" /><span className="text-2xl font-bold text-purple-600">{nilaiForm.kualitas_kerja}</span><span className="text-sm text-slate-500">/100</span></div><span className="text-xs text-slate-500">100</span></div>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">{ [60,70,80,90,100].map(val => (<button key={val} type="button" onClick={() => setNilaiForm(prev => ({ ...prev, kualitas_kerja: val }))} className="px-3 py-1 text-xs font-medium bg-slate-100 rounded-lg text-slate-600 hover:bg-teal-100 hover:text-teal-700 transition-all duration-200">{val}</button>)) }</div>
              </div>

              <div><label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><div className="p-1 rounded-lg bg-blue-100"><MessageSquare size="12" className="text-blue-600" /></div>Catatan</label>
                <textarea value={nilaiForm.catatan} onChange={(e) => setNilaiForm(prev => ({ ...prev, catatan: e.target.value }))} rows="3" placeholder="Berikan catatan atau feedback untuk peserta..." className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 resize-none" />
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1"><Sparkles size="10" className="text-teal-500" />Catatan akan terlihat oleh peserta sebagai feedback</p>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 border border-teal-100">
                <div className="flex items-center gap-2 mb-2"><Trophy size="14" className="text-teal-600" /><span className="text-xs font-semibold text-teal-700">Preview Nilai Akhir</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Rata-rata Nilai</span><div className="flex items-center gap-2"><span className="text-xl font-bold text-teal-600">{Math.round((nilaiForm.sikap + nilaiForm.kualitas_kerja) / 2)}</span><span className="text-xs text-slate-500">/100</span></div></div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all duration-200">Batal</button>
              <button onClick={handleSaveNilai} disabled={submitting} className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2">
                <span className="relative z-10 flex items-center gap-2">{submitting ? <Loader2 size="16" className="animate-spin" /> : <Save size="16" />}{submitting ? "Menyimpan..." : "Simpan Nilai"}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slide-in-from-top-2 { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in-95; }
        .slide-in-from-top-2 { animation-name: slide-in-from-top-2; }
      `}</style>
    </div>
  );
}

export default InputNilaiManual;