// src/pages/mentor/DaftarPeserta.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  Award,
  Star,
  Download,
  Grid3x3,
  List,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Crown,
  Medal,
  Zap,
  Shield,
  Gem,
  Diamond,
  TrendingUp,
  Eye
} from "lucide-react";

function DaftarPeserta() {
  const [loading, setLoading] = useState(true);
  const [peserta, setPeserta] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriode, setSelectedPeriode] = useState("all");
  const [selectedDivisi, setSelectedDivisi] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchPeserta();
  }, []);

  const fetchPeserta = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/mentor/peserta", {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPeserta(data.data || []);
        }
      } else {
        setPeserta([
          { id: 1, nama: "Ahmad Firmansyah", email: "ahmad.firmansyah@email.com", periode_magang: "Agustus - Desember 2024", divisi: "Frontend Development", status_akun: "aktif", progress: 85, attendance: 92, tugas_selesai: 12, total_tugas: 14, nilai_akhir: 87.5, rank: "diamond" },
          { id: 2, nama: "Siti Nurhaliza", email: "siti.nurhaliza@email.com", periode_magang: "Agustus - Desember 2024", divisi: "Backend Development", status_akun: "aktif", progress: 92, attendance: 98, tugas_selesai: 13, total_tugas: 14, nilai_akhir: 92.3, rank: "diamond" },
          { id: 3, nama: "Budi Santoso", email: "budi.santoso@email.com", periode_magang: "Agustus - Desember 2024", divisi: "UI/UX Design", status_akun: "aktif", progress: 68, attendance: 75, tugas_selesai: 9, total_tugas: 14, nilai_akhir: 72.0, rank: "silver" },
          { id: 4, nama: "Dewi Lestari", email: "dewi.lestari@email.com", periode_magang: "Agustus - Desember 2024", divisi: "Mobile Development", status_akun: "aktif", progress: 78, attendance: 88, tugas_selesai: 11, total_tugas: 14, nilai_akhir: 79.5, rank: "gold" },
          { id: 5, nama: "Eko Prasetyo", email: "eko.prasetyo@email.com", periode_magang: "Agustus - Desember 2024", divisi: "Quality Assurance", status_akun: "aktif", progress: 71, attendance: 82, tugas_selesai: 10, total_tugas: 14, nilai_akhir: 74.2, rank: "gold" },
          { id: 6, nama: "Fitri Amelia", email: "fitri.amelia@email.com", periode_magang: "Agustus - Desember 2024", divisi: "Data Analyst", status_akun: "aktif", progress: 89, attendance: 94, tugas_selesai: 12, total_tugas: 14, nilai_akhir: 88.9, rank: "diamond" },
          { id: 7, nama: "Gilang Permana", email: "gilang.permana@email.com", periode_magang: "Agustus - Desember 2024", divisi: "DevOps Engineer", status_akun: "aktif", progress: 64, attendance: 70, tugas_selesai: 9, total_tugas: 14, nilai_akhir: 68.5, rank: "silver" },
          { id: 8, nama: "Hana Kirana", email: "hana.kirana@email.com", periode_magang: "Agustus - Desember 2024", divisi: "Frontend Development", status_akun: "aktif", progress: 95, attendance: 96, tugas_selesai: 14, total_tugas: 14, nilai_akhir: 94.7, rank: "diamond" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching peserta:", error);
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

  const filteredPeserta = peserta.filter(p => {
    const matchesSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriode = selectedPeriode === "all" || p.periode_magang === selectedPeriode;
    const matchesDivisi = selectedDivisi === "all" || p.divisi === selectedDivisi;
    return matchesSearch && matchesPeriode && matchesDivisi;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeserta.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeserta.length / itemsPerPage);

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
        <p className="text-slate-500 mt-6 text-sm font-medium ml-3">Memuat data peserta...</p>
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
        
        {/* Header Premium - Full Width Gradient Background (sama persis dengan Presensi) */}
        <div className="relative mb-10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-6 py-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Daftar Peserta Bimbingan
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">Kelola dan pantau perkembangan peserta magang bimbingan Anda</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  <span className="text-xs font-semibold text-white">{peserta.filter(p => p.status_akun === "aktif").length} Aktif</span>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg">
                  <AlertCircle className="w-3 h-3 text-white" />
                  <span className="text-xs font-semibold text-white">{peserta.filter(p => p.progress < 70).length} Perhatian</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search - sama persis dengan Presensi */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
            <div className="flex items-center gap-3">
              {/* Tidak ada date navigation di DaftarPeserta, jadi kosong */}
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
        </div>

        {/* Filter Options */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Grid3x3 size="18" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list" ? "bg-white shadow-md text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                <List size="18" />
              </button>
            </div>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="all">Semua Periode</option>
              <option value="Agustus - Desember 2024">Agustus - Desember 2024</option>
            </select>
            <select
              value={selectedDivisi}
              onChange={(e) => setSelectedDivisi(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="all">Semua Divisi</option>
              <option value="Frontend Development">Frontend Development</option>
              <option value="Backend Development">Backend Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
            </select>
            <button className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <span className="relative z-10 flex items-center gap-2">
                <Download size="16" />
                Export
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-5">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Sparkles size="14" className="text-teal-500" />
            Menampilkan <span className="font-semibold text-slate-700">{currentItems.length}</span> dari{" "}
            <span className="font-semibold text-slate-700">{filteredPeserta.length}</span> peserta
          </p>
        </div>

        {/* Grid View Premium */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentItems.map((p, idx) => {
              const rankColor = getRankColor(p.rank);
              const isHovered = hoveredCard === p.id;
              
              return (
                <Link 
                  key={p.id} 
                  to={`/mentor/peserta/${p.id}`} 
                  className="block group"
                  onMouseEnter={() => setHoveredCard(p.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border ${isHovered ? 'border-teal-200' : 'border-slate-100'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${rankColor}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/5 to-blue-500/5 rounded-full -mr-12 -mt-12"></div>
                    
                    <div className={`relative h-28 bg-gradient-to-r ${rankColor}`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute -bottom-10 left-5">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative w-20 h-20 rounded-xl bg-white shadow-xl flex items-center justify-center border-2 border-white/50">
                            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                              {p.nama.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className={`px-3 py-1 rounded-full text-[11px] font-bold ${rankColor === "from-cyan-400 to-blue-500" ? "bg-gradient-to-r from-cyan-400 to-blue-500" : rankColor === "from-amber-400 to-yellow-500" ? "bg-gradient-to-r from-amber-400 to-yellow-500" : "bg-gradient-to-r from-slate-400 to-gray-500"} shadow-lg flex items-center gap-1.5`}>
                          {getRankIcon(p.rank)}
                          <span className="text-white uppercase tracking-wider">{p.rank}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-12 pb-5 px-5">
                      <h3 className="font-bold text-slate-800 text-lg mb-0.5 group-hover:text-teal-600 transition-colors">
                        {p.nama}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                        <GraduationCap size="12" />
                        {p.divisi}
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                            <span className="font-medium">Progress Tugas</span>
                            <span className="font-bold text-teal-600">{p.progress}%</span>
                          </div>
                          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${p.progress}%` }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                            <span className="font-medium">Kehadiran</span>
                            <span className="font-bold text-emerald-600">{p.attendance}%</span>
                          </div>
                          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${p.attendance}%` }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <CheckCircle size="14" className="text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Tugas</p>
                            <p className="text-xs font-semibold text-slate-700">{p.tugas_selesai}/{p.total_tugas}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Star size="14" className="text-amber-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Nilai Akhir</p>
                            <p className="text-xs font-bold text-teal-600">{p.nilai_akhir}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${rankColor} transform origin-left transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`}></div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* List View Premium */}
        {viewMode === "list" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kehadiran</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tugas</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((p) => {
                    const rankColor = getRankColor(p.rank);
                    const rankIcon = getRankIcon(p.rank);
                    
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity"></div>
                              <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-r ${rankColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                {p.nama.charAt(0)}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">{p.nama}</p>
                              <p className="text-[11px] text-slate-400">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{p.divisi}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full" style={{ width: `${p.progress}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{p.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: `${p.attendance}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{p.attendance}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{p.tugas_selesai}/{p.total_tugas}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Star size="14" className="text-amber-500 fill-amber-500" />
                            <span className="text-base font-bold text-slate-800">{p.nilai_akhir}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${rankColor} shadow-md`}>
                            {rankIcon}
                            <span className="text-xs font-bold text-white uppercase">{p.rank}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/mentor/peserta/${p.id}`}>
                            <button className="relative overflow-hidden px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg text-xs font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 group/btn">
                              <span className="relative z-10">Detail</span>
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
          </div>
        )}

        {/* Empty State Premium */}
        {filteredPeserta.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 py-16 text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto">
                <Users size="36" className="text-slate-400" />
              </div>
            </div>
            <p className="text-slate-600 font-semibold mt-4">Tidak ada peserta ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter</p>
          </div>
        )}

        {/* Premium Pagination - sama persis dengan Presensi */}
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
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default DaftarPeserta;