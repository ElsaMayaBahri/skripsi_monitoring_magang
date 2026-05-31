// src/pages/mentor/DaftarPeserta.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Grid3x3,
  List,
  Loader2,
  UserCheck,
  GraduationCap
} from "lucide-react";

import { getMentorPesertaList } from "../../api/mentor/pesertaService";

function DaftarPeserta() {
  const [loading, setLoading] = useState(true);
  const [peserta, setPeserta] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [error, setError] = useState(null);

  // Helper function untuk parsing string/object
  const getString = useCallback((value) => {
    if (!value) return "-";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value.nama || value.name || "-";
    }
    return String(value);
  }, []);

  // Fetch semua peserta (tanpa data tugas yang berat)
  const fetchPeserta = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const id_mentor = user.id_mentor || user.id;

      const params = {};
      if (id_mentor) {
        params.id_mentor = id_mentor;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await getMentorPesertaList(params);

      if (response?.success && response?.data) {
        const pesertaList = response.data || [];
        
        // Transform data tanpa fetching tambahan
        const transformedData = pesertaList.map((item) => {
          const idPeserta = item.id_peserta || item.id;
          
          return {
            id: idPeserta,
            nama: item.nama_lengkap || item.nama || item.name || "Peserta",
            email: item.email || "-",
            foto_profil: item.foto_profil || null,
            divisi: getString(item.divisi || item.nama_divisi),
            status_akun: item.status_magang || item.status || "aktif",
            universitas: getString(item.asal_kampus),
            jurusan: getString(item.prodi),
          };
        });

        setPeserta(transformedData);
      } else {
        setPeserta([]);
      }
    } catch (err) {
      console.error("Error fetching peserta:", err);
      setError("Gagal memuat data peserta");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, getString]);

  useEffect(() => {
    fetchPeserta();
  }, [fetchPeserta]);

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchPeserta();
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchPeserta]);

  const filteredPeserta = peserta.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.divisi?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeserta.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeserta.length / itemsPerPage);

  if (loading && peserta.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Daftar Peserta Bimbingan</h1>
              <p className="text-sm text-slate-500 mt-0.5">Kelola dan pantau perkembangan peserta magang bimbingan Anda</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={fetchPeserta} className="text-red-600 hover:text-red-700 text-sm font-medium">
              Coba Lagi
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari peserta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Grid3x3 size="18" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <List size="18" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-5">
          <p className="text-sm text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">{currentItems.length}</span> dari{" "}
            <span className="font-semibold text-slate-700">{filteredPeserta.length}</span> peserta
          </p>
        </div>

        {/* GRID VIEW */}
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
                  <div
                    className={`bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 ${
                      hoveredCard === p.id ? "ring-2 ring-teal-400/20 scale-[1.02]" : ""
                    }`}
                  >
                    <div className="relative bg-gradient-to-r from-teal-500 to-teal-600 rounded-t-2xl h-24">
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
                        <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-medium ${
                          p.status_akun === "aktif" ? "bg-emerald-500/80" : "bg-slate-500/80"
                        }`}>
                          {p.status_akun === "aktif" ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-12 pb-4 px-4">
                      <h3 className="font-semibold text-slate-800 text-base mb-0.5">{p.nama}</h3>
                      <p className="text-xs text-teal-600 font-medium mb-2">{p.divisi || "-"}</p>

                      {(p.universitas !== "-" || p.jurusan !== "-") && (
                        <div className="flex items-start gap-1.5 mb-3">
                          <GraduationCap size="12" className="text-slate-400 mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] text-slate-500 line-clamp-2">
                            {[p.universitas, p.jurusan].filter(item => item && item !== "-").join(" • ")}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <UserCheck size="14" className="text-teal-500" />
                          <span className="text-xs text-slate-600">Peserta Magang</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Universitas</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jurusan</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-bold text-sm overflow-hidden">
                            {p.foto_profil ? (
                              <img src={p.foto_profil} alt={p.nama} className="w-full h-full object-cover" />
                            ) : (
                              <span>{p.nama?.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{p.nama}</p>
                            <p className="text-[11px] text-slate-400">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-600">{p.divisi}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">
                        {p.universitas !== "-" ? p.universitas : "-"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">
                        {p.jurusan !== "-" ? p.jurusan : "-"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.status_akun === "aktif" 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            p.status_akun === "aktif" ? "bg-emerald-500" : "bg-slate-400"
                          }`}></div>
                          {p.status_akun === "aktif" ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to={`/mentor/peserta/${p.id}`}>
                          <button className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-xs font-medium text-white shadow-sm hover:shadow-md transition-all duration-300">
                            Detail
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPeserta.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size="32" className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Tidak ada peserta ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-2">
            <p className="text-sm text-slate-500">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                      className={`w-8 h-8 rounded-xl text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-sm"
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
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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