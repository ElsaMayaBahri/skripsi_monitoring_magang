// src/pages/mentor/InputNilaiManual.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMentorPesertaList } from "../../api/mentor/pesertaService";
import { getMentorNilai, saveMentorNilai } from "../../api/mentor/nilaiService";

function InputNilaiManual() {
  const [loading, setLoading] = useState(true);
  const [peserta, setPeserta] = useState([]);
  const [filteredPeserta, setFilteredPeserta] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nilaiForm, setNilaiForm] = useState({
    sikap: 80,
    kualitas_kerja: 80,
    komunikasi: 80,
    kreativitas: 80,
    kerjasama: 80,
    inisiatif: 80,
    catatan: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);

  // Fetch peserta from backend - OPTIMIZED with parallel loading
  const fetchPeserta = useCallback(async () => {
    setLoading(true);
    try {
      // Parallel API calls - lebih cepat!
      const [pesertaResponse, nilaiResponse] = await Promise.all([
        getMentorPesertaList({}),
        getMentorNilai({})
      ]);
      
      console.log("Peserta Response:", pesertaResponse);
      console.log("Nilai Response:", nilaiResponse);
      
      if (pesertaResponse.success && pesertaResponse.data) {
        const nilaiMap = new Map();
        
        if (nilaiResponse.success && nilaiResponse.data) {
          nilaiResponse.data.forEach(n => {
            nilaiMap.set(n.id_peserta, n);
          });
        }
        
        // Transform data sekali saja
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
            progress: p.progress || 0,
            email: p.email || "-"
          };
        });
        
        setPeserta(transformedPeserta);
        setFilteredPeserta(transformedPeserta);
      } else {
        console.error("Failed to fetch peserta:", pesertaResponse?.message);
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

  // OPTIMIZED filtering with useMemo - HAPUS filter divisi
  const filteredData = useMemo(() => {
    let filtered = [...peserta];
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    return filtered;
  }, [searchTerm, filterStatus, peserta]);

  // Update filtered peserta when filter changes
  useEffect(() => {
    setFilteredPeserta(filteredData);
    setCurrentPage(1);
  }, [filteredData]);

  const handleOpenModal = useCallback((p) => {
    setSelectedPeserta(p);
    setNilaiForm({ 
      sikap: p.sikap || 80, 
      kualitas_kerja: p.kualitas_kerja || 80,
      komunikasi: p.komunikasi || 80,
      kreativitas: p.kreativitas || 80,
      kerjasama: p.kerjasama || 80,
      inisiatif: p.inisiatif || 80,
      catatan: p.catatan || "" 
    });
    setErrorMessage("");
    setDebugInfo(null);
    setShowModal(true);
  }, []);

  const handleNilaiChange = useCallback((field, value) => {
    const numValue = parseInt(value) || 0;
    const validValue = Math.min(100, Math.max(0, numValue));
    setNilaiForm(prev => ({ ...prev, [field]: validValue }));
  }, []);

  const handleSaveNilai = useCallback(async () => {
    if (!selectedPeserta) return;
    
    setSubmitting(true);
    setErrorMessage("");
    setDebugInfo(null);
    
    try {
      const payload = {
        id_peserta: selectedPeserta.id,
        sikap: nilaiForm.sikap,
        kualitas_kerja: nilaiForm.kualitas_kerja,
        komunikasi: nilaiForm.komunikasi,
        kreativitas: nilaiForm.kreativitas,
        kerjasama: nilaiForm.kerjasama,
        inisiatif: nilaiForm.inisiatif,
        catatan: nilaiForm.catatan
      };
      
      console.log("Saving nilai with payload:", payload);
      
      const response = await saveMentorNilai(payload);
      console.log("Save response:", response);
      
      if (response.success) {
        // Update lokal state tanpa reload ulang
        setPeserta(prev => prev.map(p => 
          p.id === selectedPeserta.id ? { 
            ...p, 
            sikap: nilaiForm.sikap, 
            kualitas_kerja: nilaiForm.kualitas_kerja,
            komunikasi: nilaiForm.komunikasi,
            kreativitas: nilaiForm.kreativitas,
            kerjasama: nilaiForm.kerjasama,
            inisiatif: nilaiForm.inisiatif,
            catatan: nilaiForm.catatan, 
            status: "sudah_dinilai" 
          } : p
        ));
        setShowModal(false);
        setSuccessMessage(`Nilai untuk ${selectedPeserta.nama} berhasil disimpan`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(response.message || "Gagal menyimpan nilai");
        if (response.errors) {
          setDebugInfo({
            type: "validation_errors",
            errors: response.errors
          });
        }
      }
    } catch (error) {
      console.error("Error saving nilai:", error);
      
      let errorMsg = "Terjadi kesalahan saat menyimpan nilai";
      let debugData = null;
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 500) {
          errorMsg = "Server error (500): Gagal menyimpan nilai.";
          debugData = {
            type: "server_error",
            status: 500,
            message: data?.message || "Internal Server Error",
            suggestion: "Periksa kolom database"
          };
        } else if (status === 422) {
          errorMsg = "Validasi gagal: " + (data?.message || "Data tidak valid");
          debugData = {
            type: "validation_error",
            status: 422,
            errors: data?.errors || {}
          };
        } else {
          errorMsg = data?.message || `Error ${status}: Gagal menyimpan nilai`;
          debugData = { type: "api_error", status, message: data?.message };
        }
      } else if (error.request) {
        errorMsg = "Tidak ada respons dari server.";
        debugData = { type: "no_response", suggestion: "Pastikan server berjalan" };
      } else {
        errorMsg = error.message || "Terjadi kesalahan";
        debugData = { type: "request_error", message: error.message };
      }
      
      setErrorMessage(errorMsg);
      setDebugInfo(debugData);
    } finally {
      setSubmitting(false);
    }
  }, [selectedPeserta, nilaiForm]);

  const hitungRataRata = useCallback(() => {
    const values = [
      nilaiForm.sikap,
      nilaiForm.kualitas_kerja,
      nilaiForm.komunikasi,
      nilaiForm.kreativitas,
      nilaiForm.kerjasama,
      nilaiForm.inisiatif
    ];
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [nilaiForm]);

  const getGrade = useCallback((nilai) => {
    if (nilai >= 85) return { label: "A", color: "text-teal-600", bg: "bg-teal-50", desc: "Sangat Baik" };
    if (nilai >= 75) return { label: "B", color: "text-blue-600", bg: "bg-blue-50", desc: "Baik" };
    if (nilai >= 65) return { label: "C", color: "text-purple-600", bg: "bg-purple-50", desc: "Cukup" };
    if (nilai >= 50) return { label: "D", color: "text-amber-600", bg: "bg-amber-50", desc: "Kurang" };
    return { label: "E", color: "text-slate-500", bg: "bg-slate-100", desc: "Sangat Kurang" };
  }, []);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeserta.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeserta.length / itemsPerPage);

  const sudahDinilai = peserta.filter(p => p.status === "sudah_dinilai").length;
  const belumDinilai = peserta.filter(p => p.status === "belum_dinilai").length;

  const rataRataPreview = hitungRataRata();
  const gradePreview = getGrade(rataRataPreview);

  // Loading Skeleton untuk pengalaman lebih cepat
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-32 bg-white rounded-2xl shadow-sm animate-pulse"></div>
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 animate-pulse">
                <div className="h-12 w-12 bg-slate-200 rounded-xl mb-3"></div>
                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-24"></div>
              </div>
            ))}
          </div>
          
          {/* Filter Bar Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 animate-pulse">
            <div className="h-10 bg-slate-200 rounded-lg w-full max-w-md"></div>
          </div>
          
          {/* Cards Grid Skeleton */}
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
                    <div key={j} className="flex justify-between py-1">
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                {debugInfo && (
                  <div className="mt-3 p-3 bg-red-100 rounded-lg">
                    <p className="text-xs font-semibold text-red-800 mb-2">Debug Information:</p>
                    <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono bg-red-50 p-2 rounded">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                    {debugInfo.suggestion && (
                      <p className="text-xs text-red-700 mt-2 pt-2 border-t border-red-200">
                        💡 Saran: {debugInfo.suggestion}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="mb-3">
              <div className="text-3xl font-bold text-slate-800">{peserta.length}</div>
              <p className="text-xs text-slate-500 mt-1">Peserta Aktif</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="mb-3">
              <div className="text-3xl font-bold text-emerald-600">{sudahDinilai}</div>
              <p className="text-xs text-slate-500 mt-1">Sudah Dinilai</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="mb-3">
              <div className="text-3xl font-bold text-blue-600">{belumDinilai}</div>
              <p className="text-xs text-slate-500 mt-1">Belum Dinilai</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl shadow-md p-5">
            <div className="mb-3">
              <div className="text-3xl font-bold text-white">{peserta.length ? Math.round((sudahDinilai / peserta.length) * 100) : 0}%</div>
              <p className="text-xs text-white/80 mt-1">Progress Selesai</p>
            </div>
            <div className="mt-3">
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${peserta.length ? (sudahDinilai / peserta.length) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar - HAPUS filter divisi */}
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
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-400 cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="sudah_dinilai">Sudah Dinilai</option>
                <option value="belum_dinilai">Belum Dinilai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-slate-500">Menampilkan <span className="font-semibold text-slate-700">{currentItems.length}</span> dari <span className="font-semibold text-slate-700">{filteredPeserta.length}</span> peserta</p>
        </div>

        {/* Card Grid - Dengan tinggi seragam dan spacing compact, hanya 3 nilai */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col h-full">
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
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
                
                {/* Hanya 3 nilai yang ditampilkan di card */}
                <div className="mt-4 space-y-2 flex-1">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-xs text-slate-600">Sikap</span>
                    {p.sikap ? <span className="text-sm font-bold text-teal-600">{p.sikap}</span> : <span className="text-xs text-slate-400">-</span>}
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-xs text-slate-600">Kualitas Kerja</span>
                    {p.kualitas_kerja ? <span className="text-sm font-bold text-teal-600">{p.kualitas_kerja}</span> : <span className="text-xs text-slate-400">-</span>}
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-slate-600">Komunikasi</span>
                    {p.komunikasi ? <span className="text-sm font-bold text-teal-600">{p.komunikasi}</span> : <span className="text-xs text-slate-400">-</span>}
                  </div>
                </div>
                
                <button onClick={() => handleOpenModal(p)} className="mt-4 w-full py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all duration-300">
                  {p.status === "sudah_dinilai" ? "Edit Nilai" : "Input Nilai"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPeserta.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 py-16 text-center">
            <p className="text-slate-600 font-medium mt-4">Tidak ada peserta ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
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
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Input Nilai - Menampilkan semua 6 komponen nilai */}
      {showModal && selectedPeserta && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Input Nilai Manual</h3>
                  <p className="text-sm text-slate-500 mt-1">{selectedPeserta.nama} • {selectedPeserta.divisi}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-all">
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-5 mb-6 border border-teal-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">Rata-rata Nilai Sementara</span>
                  <span className="text-sm font-bold text-teal-600">{rataRataPreview}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all" style={{ width: `${rataRataPreview}%` }}></div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${gradePreview.bg} ${gradePreview.color}`}>{gradePreview.label}</span>
                  <span className="text-xs text-slate-500">{gradePreview.desc}</span>
                </div>
              </div>

              {/* Semua 6 komponen nilai di modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Sikap</label>
                  <input 
                    type="number" 
                    value={nilaiForm.sikap} 
                    onChange={(e) => handleNilaiChange("sikap", e.target.value)} 
                    min="0" 
                    max="100" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
                  />
                  <p className="text-[10px] text-slate-400">Disiplin, tanggung jawab, etika kerja</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Kualitas Kerja</label>
                  <input 
                    type="number" 
                    value={nilaiForm.kualitas_kerja} 
                    onChange={(e) => handleNilaiChange("kualitas_kerja", e.target.value)} 
                    min="0" 
                    max="100" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
                  />
                  <p className="text-[10px] text-slate-400">Ketelitian, hasil kerja, problem solving</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Komunikasi</label>
                  <input 
                    type="number" 
                    value={nilaiForm.komunikasi} 
                    onChange={(e) => handleNilaiChange("komunikasi", e.target.value)} 
                    min="0" 
                    max="100" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
                  />
                  <p className="text-[10px] text-slate-400">Penyampaian ide, pelaporan</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Kreativitas</label>
                  <input 
                    type="number" 
                    value={nilaiForm.kreativitas} 
                    onChange={(e) => handleNilaiChange("kreativitas", e.target.value)} 
                    min="0" 
                    max="100" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
                  />
                  <p className="text-[10px] text-slate-400">Inovasi, ide baru</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Kerjasama Tim</label>
                  <input 
                    type="number" 
                    value={nilaiForm.kerjasama} 
                    onChange={(e) => handleNilaiChange("kerjasama", e.target.value)} 
                    min="0" 
                    max="100" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
                  />
                  <p className="text-[10px] text-slate-400">Kolaborasi, koordinasi</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Inisiatif</label>
                  <input 
                    type="number" 
                    value={nilaiForm.inisiatif} 
                    onChange={(e) => handleNilaiChange("inisiatif", e.target.value)} 
                    min="0" 
                    max="100" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" 
                  />
                  <p className="text-[10px] text-slate-400">Proaktif, kemauan belajar</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-white transition-all">
                Batal
              </button>
              <button onClick={handleSaveNilai} disabled={submitting} className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50">
                {submitting ? "Menyimpan..." : "Simpan Nilai"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InputNilaiManual;