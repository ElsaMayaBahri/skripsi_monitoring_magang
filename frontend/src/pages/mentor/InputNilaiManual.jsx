// src/pages/mentor/InputNilaiManual.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getMentorPesertaList } from "../../api/mentor/pesertaService";
import { getMentorNilai } from "../../api/mentor/nilaiService";
import InputNilaiModal from "../../components/InputNilaiModal";

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

function InputNilaiManual() {
  const [loading, setLoading] = useState(true);
  const [peserta, setPeserta] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDivisi, setFilterDivisi] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Debounce search (300ms delay)
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch peserta
  const fetchPeserta = useCallback(async () => {
    setLoading(true);
    try {
      const [pesertaResponse, nilaiResponse] = await Promise.all([
        getMentorPesertaList({}),
        getMentorNilai({})
      ]);
      
      if (pesertaResponse.success && pesertaResponse.data) {
        const nilaiMap = new Map();
        
        if (nilaiResponse.success && nilaiResponse.data) {
          nilaiResponse.data.forEach(n => {
            nilaiMap.set(n.id_peserta, n);
          });
        }
        
        const transformedPeserta = pesertaResponse.data.map(p => {
          const nilaiData = nilaiMap.get(p.id_peserta);
          return {
            id: p.id_peserta,
            nama: p.nama || p.nama_peserta || "Unknown",
            divisi: p.divisi || "-",
            sikap: nilaiData?.sikap || null,
            kualitas_kerja: nilaiData?.kualitas_kerja || null,
            komunikasi: nilaiData?.komunikasi || null,
            kreativitas: nilaiData?.kreativitas || null,
            kerjasama: nilaiData?.kerjasama || null,
            inisiatif: nilaiData?.inisiatif || null,
            catatan: nilaiData?.catatan || "",
            status: (nilaiData?.sikap && nilaiData?.kualitas_kerja) ? "sudah_dinilai" : "belum_dinilai",
            email: p.email || "-"
          };
        });
        
        setPeserta(transformedPeserta);
      }
    } catch (error) {
      console.error("Error fetching peserta:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeserta();
  }, [fetchPeserta]);

  // Filter data - hanya satu source of truth
  const filteredData = useMemo(() => {
    let filtered = [...peserta];
    
    if (debouncedSearch) {
      filtered = filtered.filter(p => 
        p.nama.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.divisi.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    
    if (filterDivisi !== "all") {
      filtered = filtered.filter(p => p.divisi === filterDivisi);
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    return filtered;
  }, [debouncedSearch, filterDivisi, filterStatus, peserta]);

  // Reset page ketika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDivisi, filterStatus]);

  const handleOpenModal = useCallback((p) => {
    setSelectedPeserta(p);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedPeserta(null);
  }, []);

  const handleSaveSuccess = useCallback((updatedPeserta) => {
    setPeserta(prev => prev.map(p => 
      p.id === updatedPeserta.id ? updatedPeserta : p
    ));
    setShowModal(false);
    setSuccessMessage(`Nilai untuk ${updatedPeserta.nama} berhasil disimpan`);
    setTimeout(() => setSuccessMessage(""), 3000);
  }, []);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Statistics
  const sudahDinilai = peserta.filter(p => p.status === "sudah_dinilai").length;
  const belumDinilai = peserta.filter(p => p.status === "belum_dinilai").length;

  // Unique divisi
  const divisiList = useMemo(() => 
    [...new Set(peserta.map(p => p.divisi).filter(d => d && d !== "-"))], 
    [peserta]
  );

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <div className="h-32 bg-white rounded-2xl shadow-sm animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-24"></div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 animate-pulse">
            <div className="h-10 bg-slate-200 rounded-lg w-full max-w-md"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                    <div>
                      <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="mt-4 space-y-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="flex justify-between py-1.5">
                      <div className="h-4 bg-slate-200 rounded w-20"></div>
                      <div className="h-4 bg-slate-200 rounded w-8"></div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-10 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="relative p-6 lg:p-8 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-teal-500/10 rounded-2xl"></div>
          <div className="relative px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Input Nilai Manual</h1>
                <p className="text-sm text-slate-500 mt-1">Input nilai sikap dan soft skills peserta magang</p>
              </div>
              <Link to="/mentor/nilai-akhir">
                <button className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-300">
                  Lihat Nilai Akhir
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="text-3xl font-bold text-slate-800">{peserta.length}</div>
            <p className="text-xs text-slate-500 mt-1">Peserta Aktif</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="text-3xl font-bold text-emerald-600">{sudahDinilai}</div>
            <p className="text-xs text-slate-500 mt-1">Sudah Dinilai</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="text-3xl font-bold text-blue-600">{belumDinilai}</div>
            <p className="text-xs text-slate-500 mt-1">Belum Dinilai</p>
          </div>

          <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl shadow-md p-5">
            <div className="text-3xl font-bold text-white">{peserta.length ? Math.round((sudahDinilai / peserta.length) * 100) : 0}%</div>
            <p className="text-xs text-white/80 mt-1">Progress Selesai</p>
            <div className="mt-3">
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${peserta.length ? (sudahDinilai / peserta.length) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input 
                type="text" 
                placeholder="Cari peserta..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400" 
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={filterDivisi} onChange={(e) => setFilterDivisi(e.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-400 cursor-pointer">
                <option value="all">Semua Divisi</option>
                {divisiList.map(div => (<option key={div} value={div}>{div}</option>))}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-400 cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="sudah_dinilai">Sudah Dinilai</option>
                <option value="belum_dinilai">Belum Dinilai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">{currentItems.length}</span> dari <span className="font-semibold text-slate-700">{filteredData.length}</span> peserta
          </p>
        </div>

        {/* Card Grid */}
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 py-16 text-center">
            <p className="text-slate-600 font-medium">Tidak ada peserta ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-md">
                          <span className="text-lg font-bold text-white">{p.nama?.charAt(0) || "P"}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{p.nama}</h3>
                          <p className="text-xs text-slate-500">{p.divisi}</p>
                        </div>
                      </div>
                      {p.status === "sudah_dinilai" ? (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Dinilai</span>
                      ) : (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Pending</span>
                      )}
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <span className="text-xs text-slate-600">Sikap</span>
                        {p.sikap ? <span className="text-base font-semibold text-teal-600">{p.sikap}</span> : <span className="text-xs text-slate-400">-</span>}
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <span className="text-xs text-slate-600">Kualitas Kerja</span>
                        {p.kualitas_kerja ? <span className="text-base font-semibold text-teal-600">{p.kualitas_kerja}</span> : <span className="text-xs text-slate-400">-</span>}
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-slate-600">Komunikasi</span>
                        {p.komunikasi ? <span className="text-base font-semibold text-teal-600">{p.komunikasi}</span> : <span className="text-xs text-slate-400">-</span>}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleOpenModal(p)} 
                      className="mt-4 w-full py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {p.status === "sudah_dinilai" ? "Edit Nilai" : "Input Nilai"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1} 
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <div className="flex gap-1.5">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum; 
                      if (totalPages <= 5) pageNum = i + 1; 
                      else if (currentPage <= 3) pageNum = i + 1; 
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i; 
                      else pageNum = currentPage - 2 + i;
                      return (
                        <button 
                          key={pageNum} 
                          onClick={() => setCurrentPage(pageNum)} 
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages} 
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Component */}
      {showModal && selectedPeserta && (
        <InputNilaiModal
          peserta={selectedPeserta}
          onClose={handleCloseModal}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}

export default InputNilaiManual;