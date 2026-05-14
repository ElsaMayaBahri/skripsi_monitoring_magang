import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Grid3x3,
  List,
  GraduationCap,
  Eye,
  X,
  Info,
  BookOpen,
  CalendarDays
} from "lucide-react";
import { getMentorPesertaList } from "../../api/mentor/pesertaService";

function DaftarPeserta() {
  const [loading, setLoading] = useState(true);
  const [peserta, setPeserta] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showProgressTooltip, setShowProgressTooltip] = useState(false);
  const [showKehadiranTooltip, setShowKehadiranTooltip] = useState(false);
  const [error, setError] = useState(null);

  // Fetch peserta menggunakan service yang sudah ada
  const fetchPeserta = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const id_mentor = user.id_mentor || user.id;
      
      const params = {};
      if (id_mentor) params.id_mentor = id_mentor;
      if (searchTerm) params.search = searchTerm;
      if (startDate) params.tanggal_mulai = startDate;
      if (endDate) params.tanggal_selesai = endDate;
      
      console.log("Fetching peserta with params:", params);
      
      const response = await getMentorPesertaList(params);
      console.log("Peserta response:", response);
      
      if (response && response.success && response.data) {
        const pesertaList = response.data;
        
        const transformedData = pesertaList.map(item => ({
          id: item.id_peserta || item.id,
          nama: item.nama_lengkap || item.nama || item.name,
          email: item.email,
          foto_profil: item.foto_profil || null,
          divisi: item.divisi || "-",
          status_akun: item.status_magang || item.status || "aktif",
          progress: item.progress || 0,
          attendance: item.kehadiran_persen || 0,
          tugas_selesai: item.tugas_selesai || 0,
          total_tugas: item.total_tugas || 15,
          universitas: item.asal_kampus || item.universitas || "-",
          jurusan: item.prodi || item.jurusan || "-",
          tanggal_mulai: item.tanggal_mulai,
          tanggal_selesai: item.tanggal_selesai
        }));
        
        setPeserta(transformedData);
      } else {
        setPeserta([]);
        if (response && response.message) {
          setError(response.message);
        } else {
          setError("Data peserta tidak ditemukan");
        }
      }
    } catch (err) {
      console.error("Error fetching peserta:", err);
      setError(err.message || "Gagal memuat data peserta");
      setPeserta([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeserta();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPeserta();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, startDate, endDate]);

  const filteredPeserta = peserta.filter(p => {
    const matchesSearch = !searchTerm || 
                          (p.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeserta.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeserta.length / itemsPerPage);

  const getStatusBadge = (status, progress) => {
    if (status !== "aktif") {
      return { label: "Nonaktif", color: "text-slate-500", bg: "bg-slate-100" };
    }
    if (progress >= 85) {
      return { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50" };
    }
    if (progress >= 70) {
      return { label: "On Track", color: "text-blue-600", bg: "bg-blue-50" };
    }
    if (progress >= 50) {
      return { label: "At Risk", color: "text-amber-600", bg: "bg-amber-50" };
    }
    return { label: "Need Review", color: "text-red-600", bg: "bg-red-50" };
  };

  const resetDateFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchPeserta();
  };

  if (loading && peserta.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Memuat data peserta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                  Daftar Peserta Bimbingan
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">Kelola dan pantau perkembangan peserta magang bimbingan Anda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={fetchPeserta} className="text-red-600 hover:text-red-700 text-sm font-medium">
              Coba Lagi
            </button>
          </div>
        )}

        {/* Search Bar & Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari peserta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
            </div>
            
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Grid3x3 size="16" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <List size="16" />
              </button>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-400"
                placeholder="Tanggal Mulai"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-400"
                placeholder="Tanggal Selesai"
              />
              {(startDate || endDate) && (
                <button
                  onClick={resetDateFilter}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size="16" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info count */}
        <div className="mb-4">
          <p className="text-sm text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">{currentItems.length}</span> dari{" "}
            <span className="font-semibold text-slate-700">{filteredPeserta.length}</span> peserta
          </p>
        </div>

        {/* Info Progress Bar */}
        <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
          <div className="relative">
            <div 
              className="flex items-center gap-1 cursor-help"
              onMouseEnter={() => setShowProgressTooltip(true)}
              onMouseLeave={() => setShowProgressTooltip(false)}
            >
              <BookOpen size="12" className="text-teal-500" />
              <span>Progress Tugas</span>
              <Info size="10" className="text-slate-400" />
            </div>
            {showProgressTooltip && (
              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg w-64 z-10">
                (Jumlah tugas selesai ÷ Total tugas) × 100%
                <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
              </div>
            )}
          </div>
          <div className="relative">
            <div 
              className="flex items-center gap-1 cursor-help"
              onMouseEnter={() => setShowKehadiranTooltip(true)}
              onMouseLeave={() => setShowKehadiranTooltip(false)}
            >
              <CalendarDays size="12" className="text-emerald-500" />
              <span>Kehadiran</span>
              <Info size="10" className="text-slate-400" />
            </div>
            {showKehadiranTooltip && (
              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg w-64 z-10">
                (Hadir + Terlambat + Izin) ÷ Total Hari Kerja × 100%
                <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
              </div>
            )}
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentItems.map((p) => {
              const hasPhoto = p.foto_profil;
              return (
                <Link 
                  key={p.id} 
                  to={`/mentor/peserta/${p.id}`} 
                  className="block"
                  onMouseEnter={() => setHoveredCard(p.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow ${hoveredCard === p.id ? 'ring-2 ring-teal-400/20' : ''}`}>
                    <div className="relative bg-gradient-to-r from-teal-500 to-teal-600 rounded-t-xl h-24">
                      <div className="absolute -bottom-10 left-5">
                        <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center border-2 border-white overflow-hidden">
                          {hasPhoto ? (
                            <img src={p.foto_profil} alt={p.nama} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold text-teal-600">{p.nama?.charAt(0) || "P"}</span>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-medium">
                          {p.status_akun === "aktif" ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-12 pb-4 px-4">
                      <h3 className="font-semibold text-slate-800 text-base mb-0.5">{p.nama}</h3>
                      <p className="text-xs text-slate-500 mb-1">{p.divisi || "-"}</p>
                      <p className="text-[10px] text-slate-400 mb-3">{p.universitas} - {p.jurusan}</p>
                      
                      <div className="space-y-3 mb-3">
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Progress Tugas</span>
                            <span className="font-semibold text-teal-600">{p.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${p.progress}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Kehadiran</span>
                            <span className="font-semibold text-emerald-600">{p.attendance}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.attendance}%` }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 w-full">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                            <CheckCircle size="14" className="text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Tugas Selesai</p>
                            <p className="text-xs font-semibold text-slate-700">{p.tugas_selesai}/{p.total_tugas}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Peserta</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Divisi</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Universitas</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Progress</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Kehadiran</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Tugas</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((p) => {
                    const hasPhoto = p.foto_profil;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm overflow-hidden">
                              {hasPhoto ? (
                                <img src={p.foto_profil} alt={p.nama} className="w-full h-full object-cover" />
                              ) : (
                                <span>{p.nama?.charAt(0) || "P"}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{p.nama}</p>
                              <p className="text-[10px] text-slate-400">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{p.divisi || "-"}</td>
                        <td className="px-5 py-3">
                          <div>
                            <p className="text-sm text-slate-700">{p.universitas || "-"}</p>
                            <p className="text-[10px] text-slate-400">{p.jurusan || "-"}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${p.progress}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{p.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.attendance}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{p.attendance}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-slate-600">{p.tugas_selesai}/{p.total_tugas}</span>
                        </td>
                        <td className="px-5 py-3">
                          <Link to={`/mentor/peserta/${p.id}`}>
                            <button className="px-4 py-1.5 bg-teal-500 rounded-lg text-xs font-medium text-white shadow-sm hover:bg-teal-600">
                              Detail
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

        {/* Empty state */}
        {filteredPeserta.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Users size="28" className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mt-3">Tidak ada peserta ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-500">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size="18" />
              </button>
              <div className="flex gap-1">
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
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? "bg-teal-500 text-white"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size="18" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DaftarPeserta;