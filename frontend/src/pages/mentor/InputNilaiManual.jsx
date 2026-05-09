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
  Filter,
  UserCheck,
  Target,
  Heart,
  Lightbulb,
  Users2,
  Briefcase
} from "lucide-react";
import { getMentorPesertaList } from "../../api/mentor/pesertaService";
import { getMentorNilai, saveMentorNilai } from "../../api/mentor/nilaiService";

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
    komunikasi: 80,
    kreativitas: 80,
    kerjasama: 80,
    inisiatif: 80,
    catatan: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch peserta from backend
  const fetchPeserta = async () => {
    setLoading(true);
    try {
      const response = await getMentorPesertaList({});
      console.log("Peserta Response:", response);
      
      if (response.success && response.data) {
        const nilaiResponse = await getMentorNilai({});
        console.log("Nilai Response:", nilaiResponse);
        
        const nilaiMap = new Map();
        
        if (nilaiResponse.success && nilaiResponse.data) {
          nilaiResponse.data.forEach(n => {
            nilaiMap.set(n.id_peserta, n);
          });
        }
        
        const transformedPeserta = response.data.map(p => {
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
        console.error("Failed to fetch peserta:", response?.message);
        // Mock data fallback
        useMockData();
      }
    } catch (error) {
      console.error("Error fetching peserta:", error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const useMockData = () => {
    const mockPeserta = [
      { id_peserta: 1, nama: "Ahmad Fauzi", divisi: "Frontend Developer", progress: 75, email: "ahmad@example.com" },
      { id_peserta: 2, nama: "Siti Nurhaliza", divisi: "UI/UX Designer", progress: 80, email: "siti@example.com" },
      { id_peserta: 3, nama: "Budi Santoso", divisi: "Backend Developer", progress: 90, email: "budi@example.com" },
      { id_peserta: 4, nama: "Dewi Anggraeni", divisi: "Data Analyst", progress: 60, email: "dewi@example.com" },
      { id_peserta: 5, nama: "Rizky Pratama", divisi: "DevOps Engineer", progress: 85, email: "rizky@example.com" },
    ];
    
    const transformed = mockPeserta.map(p => ({
      id: p.id_peserta,
      nama: p.nama,
      divisi: p.divisi,
      sikap: null,
      kualitas_kerja: null,
      komunikasi: null,
      kreativitas: null,
      kerjasama: null,
      inisiatif: null,
      catatan: "",
      status: "belum_dinilai",
      progress: p.progress,
      email: p.email
    }));
    
    setPeserta(transformed);
    setFilteredPeserta(transformed);
  };

  useEffect(() => {
    fetchPeserta();
  }, []);

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
    setShowModal(true);
  };

  const handleNilaiChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    const validValue = Math.min(100, Math.max(0, numValue));
    setNilaiForm(prev => ({ ...prev, [field]: validValue }));
  };

  const handleSaveNilai = async () => {
    if (!selectedPeserta) return;
    
    setSubmitting(true);
    setErrorMessage("");
    
    try {
      const response = await saveMentorNilai({
        id_peserta: selectedPeserta.id,
        sikap: nilaiForm.sikap,
        kualitas_kerja: nilaiForm.kualitas_kerja,
        komunikasi: nilaiForm.komunikasi,
        kreativitas: nilaiForm.kreativitas,
        kerjasama: nilaiForm.kerjasama,
        inisiatif: nilaiForm.inisiatif,
        catatan: nilaiForm.catatan
      });
      
      if (response.success) {
        const updatedPeserta = peserta.map(p => 
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
        );
        setPeserta(updatedPeserta);
        setFilteredPeserta(updatedPeserta);
        setShowModal(false);
        setSuccessMessage(`Nilai untuk ${selectedPeserta.nama} berhasil disimpan`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(response.message || "Gagal menyimpan nilai");
      }
    } catch (error) {
      console.error("Error saving nilai:", error);
      // Mock update jika API error
      const updatedPeserta = peserta.map(p => 
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
      );
      setPeserta(updatedPeserta);
      setFilteredPeserta(updatedPeserta);
      setShowModal(false);
      setSuccessMessage(`Nilai untuk ${selectedPeserta.nama} berhasil disimpan (Mock mode)`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const hitungRataRata = () => {
    const values = [
      nilaiForm.sikap,
      nilaiForm.kualitas_kerja,
      nilaiForm.komunikasi,
      nilaiForm.kreativitas,
      nilaiForm.kerjasama,
      nilaiForm.inisiatif
    ];
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
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

  const sudahDinilai = peserta.filter(p => p.status === "sudah_dinilai").length;
  const belumDinilai = peserta.filter(p => p.status === "belum_dinilai").length;

  const rataRataPreview = hitungRataRata();
  const gradePreview = getGrade(rataRataPreview);

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
        
        {/* Header */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-teal-500/10 rounded-2xl"></div>
          <div className="relative px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Input Nilai Manual</h1>
                  <p className="text-sm text-slate-500 mt-1">Input nilai sikap dan soft skills peserta magang</p>
                </div>
              </div>
              <Link to="/mentor/nilai-akhir">
                <button className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                  <TrendingUp size="14" />
                  Lihat Nilai Akhir
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size="18" className="text-emerald-600" />
              <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle size="18" className="text-red-600" />
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center"><Users size="20" className="text-teal-600" /></div>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">TOTAL</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{peserta.length}</p>
            <p className="text-xs text-slate-500 mt-1">Peserta Aktif</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center"><CheckCircle size="20" className="text-emerald-600" /></div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">SUDAH</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{sudahDinilai}</p>
            <p className="text-xs text-slate-500 mt-1">Sudah Dinilai</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><Clock size="20" className="text-blue-600" /></div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">BELUM</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{belumDinilai}</p>
            <p className="text-xs text-slate-500 mt-1">Belum Dinilai</p>
          </div>

          <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Award size="20" className="text-white" /></div>
              <span className="text-xs font-semibold text-white bg-white/20 px-2 py-1 rounded-full">PROGRESS</span>
            </div>
            <p className="text-3xl font-bold text-white">{peserta.length ? Math.round((sudahDinilai / peserta.length) * 100) : 0}%</p>
            <p className="text-xs text-white/80 mt-1">Selesai</p>
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
              <input type="text" placeholder="Cari peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400" />
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
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-slate-500">Menampilkan <span className="font-semibold text-slate-700">{currentItems.length}</span> dari <span className="font-semibold text-slate-700">{filteredPeserta.length}</span> peserta</p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((p) => (
            <div key={p.id} className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md" onMouseEnter={() => setHoveredCard(p.id)} onMouseLeave={() => setHoveredCard(null)}>
              <div className="relative p-5">
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
                    <div className="flex items-center gap-2"><Heart size="14" className="text-amber-500" /><span className="text-xs text-slate-600">Sikap</span></div>
                    {p.sikap ? <span className="text-base font-semibold text-teal-600">{p.sikap}</span> : <span className="text-xs text-slate-400">-</span>}
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <div className="flex items-center gap-2"><Target size="14" className="text-purple-500" /><span className="text-xs text-slate-600">Kualitas Kerja</span></div>
                    {p.kualitas_kerja ? <span className="text-base font-semibold text-teal-600">{p.kualitas_kerja}</span> : <span className="text-xs text-slate-400">-</span>}
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <div className="flex items-center gap-2"><MessageSquare size="14" className="text-blue-500" /><span className="text-xs text-slate-600">Komunikasi</span></div>
                    {p.komunikasi ? <span className="text-base font-semibold text-teal-600">{p.komunikasi}</span> : <span className="text-xs text-slate-400">-</span>}
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
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto"><Users size="28" className="text-slate-400" /></div>
            <p className="text-slate-600 font-medium mt-4">Tidak ada peserta ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-slate-500">Halaman {currentPage} dari {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size="16" /></button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum; if (totalPages <= 5) pageNum = i + 1; else if (currentPage <= 3) pageNum = i + 1; else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = currentPage - 2 + i;
                  return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{pageNum}</button>);
                })}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size="16" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Input Nilai */}
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
                  <X size="20" className="text-slate-500" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Heart size="16" className="text-amber-500" /> Sikap</label>
                  <input type="number" value={nilaiForm.sikap} onChange={(e) => handleNilaiChange("sikap", e.target.value)} min="0" max="100" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" />
                  <p className="text-[10px] text-slate-400">Disiplin, tanggung jawab, etika kerja</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Target size="16" className="text-purple-500" /> Kualitas Kerja</label>
                  <input type="number" value={nilaiForm.kualitas_kerja} onChange={(e) => handleNilaiChange("kualitas_kerja", e.target.value)} min="0" max="100" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" />
                  <p className="text-[10px] text-slate-400">Ketelitian, hasil kerja, problem solving</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><MessageSquare size="16" className="text-blue-500" /> Komunikasi</label>
                  <input type="number" value={nilaiForm.komunikasi} onChange={(e) => handleNilaiChange("komunikasi", e.target.value)} min="0" max="100" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" />
                  <p className="text-[10px] text-slate-400">Penyampaian ide, pelaporan</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Lightbulb size="16" className="text-emerald-500" /> Kreativitas</label>
                  <input type="number" value={nilaiForm.kreativitas} onChange={(e) => handleNilaiChange("kreativitas", e.target.value)} min="0" max="100" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" />
                  <p className="text-[10px] text-slate-400">Inovasi, ide baru</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Users2 size="16" className="text-indigo-500" /> Kerjasama Tim</label>
                  <input type="number" value={nilaiForm.kerjasama} onChange={(e) => handleNilaiChange("kerjasama", e.target.value)} min="0" max="100" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" />
                  <p className="text-[10px] text-slate-400">Kolaborasi, koordinasi</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Zap size="16" className="text-rose-500" /> Inisiatif</label>
                  <input type="number" value={nilaiForm.inisiatif} onChange={(e) => handleNilaiChange("inisiatif", e.target.value)} min="0" max="100" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-400" />
                  <p className="text-[10px] text-slate-400">Proaktif, kemauan belajar</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><MessageSquare size="16" className="text-blue-500" /> Catatan / Feedback</label>
                <textarea value={nilaiForm.catatan} onChange={(e) => setNilaiForm(prev => ({ ...prev, catatan: e.target.value }))} rows="3" placeholder="Berikan catatan atau feedback untuk peserta..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 resize-none" />
                <p className="text-xs text-slate-400">Catatan akan terlihat oleh peserta sebagai feedback</p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-white transition-all">Batal</button>
              <button onClick={handleSaveNilai} disabled={submitting} className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting ? <Loader2 size="16" className="animate-spin" /> : <Save size="16" />}
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