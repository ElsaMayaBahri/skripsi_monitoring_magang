import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getPeserta, getMentors, getDivisi } from "../../api/admin/dashboardService";
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  Building2,
  AlertCircle,
  Calendar,
  Layers,
  Eye,
  RefreshCw,
  Loader2,
  ChevronDown,
  TrendingUp,
  Clock,
  Filter
} from "lucide-react";

function DataManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("peserta"); // peserta, mentor, divisi
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisiFilter, setDivisiFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data state
  const [pesertaList, setPesertaList] = useState([]);
  const [mentorList, setMentorList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const itemsPerPage = 10;

  // Ambil semua data dari API
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Loading data for COO DataManagement...");
      
      const [divisiRes, mentorRes, pesertaRes] = await Promise.all([
        getDivisi(),
        getMentors(),
        getPeserta()
      ]);
      
      console.log("API getDivisi response:", divisiRes);
      console.log("API getMentors response:", mentorRes);
      console.log("API getPeserta response:", pesertaRes);
      
      // Parse Divisi
      let divisiData = [];
      if (divisiRes && divisiRes.success && Array.isArray(divisiRes.data)) {
        divisiData = divisiRes.data;
      } else if (Array.isArray(divisiRes)) {
        divisiData = divisiRes;
      } else if (divisiRes && Array.isArray(divisiRes.data)) {
        divisiData = divisiRes.data;
      }
      
      // Parse Mentor
      let mentors = [];
      if (mentorRes && mentorRes.success && Array.isArray(mentorRes.data)) {
        mentors = mentorRes.data;
      } else if (Array.isArray(mentorRes)) {
        mentors = mentorRes;
      } else if (mentorRes && Array.isArray(mentorRes.data)) {
        mentors = mentorRes.data;
      }
      
      // Parse Peserta
      let peserta = [];
      if (pesertaRes && pesertaRes.success && Array.isArray(pesertaRes.data)) {
        peserta = pesertaRes.data;
      } else if (Array.isArray(pesertaRes)) {
        peserta = pesertaRes;
      } else if (pesertaRes && Array.isArray(pesertaRes.data)) {
        peserta = pesertaRes.data;
      }
      
      setDivisiList(divisiData);
      setMentorList(mentors);
      setPesertaList(peserta);
      setDataLoaded(true);
      
    } catch (err) {
      console.error("Error loading data:", err);
      setError(`Gagal memuat data: ${err.message || "Terjadi kesalahan"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Format data untuk ditampilkan
  const getInitials = (name) => {
    if (!name || name === "No Name" || name === "-") return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getUserStatus = (userData, itemData) => {
    // Cek dari user object
    if (userData?.status_akun) {
      if (userData.status_akun === "aktif" || userData.status_akun === "active") return "aktif";
      if (userData.status_akun === "non_aktif" || userData.status_akun === "inactive" || userData.status_akun === "nonaktif") return "non_aktif";
    }
    
    // Cek dari userData status
    if (userData?.status !== undefined && userData?.status !== null) {
      if (userData.status === "aktif" || userData.status === "active" || userData.status === true) return "aktif";
      if (userData.status === "non_aktif" || userData.status === "inactive" || userData.status === false) return "non_aktif";
    }
    
    // Cek dari itemData status_akun
    if (itemData?.status_akun) {
      if (itemData.status_akun === "aktif" || itemData.status_akun === "active") return "aktif";
      if (itemData.status_akun === "non_aktif" || itemData.status_akun === "inactive") return "non_aktif";
    }
    
    // Cek dari itemData.user
    if (itemData?.user?.status_akun) {
      if (itemData.user.status_akun === "aktif" || itemData.user.status_akun === "active") return "aktif";
      if (itemData.user.status_akun === "non_aktif" || itemData.user.status_akun === "inactive") return "non_aktif";
    }
    
    // Cek dari itemData status
    if (itemData?.status !== undefined && itemData?.status !== null) {
      if (itemData.status === "aktif" || itemData.status === "active" || itemData.status === true) return "aktif";
      if (itemData.status === "non_aktif" || itemData.status === "inactive" || itemData.status === false) return "non_aktif";
    }
    
    return "non_aktif";
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  };

  // Format data peserta
  const formattedPeserta = pesertaList.map((item) => {
    let divisiName = "-";
    
    // Cek dari item.divisi (object)
    if (item.divisi) {
      if (typeof item.divisi === 'object' && item.divisi !== null) {
        divisiName = item.divisi.nama_divisi || item.divisi.nama || "-";
      } else if (typeof item.divisi === 'string') {
        divisiName = item.divisi;
      }
    }
    
    // Cek dari id_divisi
    if (divisiName === "-" && item.id_divisi) {
      const foundDivisi = divisiList.find(d => (d.id_divisi || d.id) == item.id_divisi);
      if (foundDivisi) divisiName = foundDivisi.nama_divisi || foundDivisi.nama || "-";
    }
    
    let mentorName = "-";
    
    // Cek dari item.mentor
    if (item.mentor) {
      if (typeof item.mentor === 'object') {
        mentorName = item.mentor.user?.nama || item.mentor.nama || item.mentor.name || "-";
      } else if (typeof item.mentor === 'string') {
        mentorName = item.mentor;
      }
    }
    
    // Cek dari id_mentor
    if (mentorName === "-" && item.id_mentor) {
      const foundMentor = mentorList.find(m => (m.id_mentor || m.id_user || m.id) == item.id_mentor);
      if (foundMentor) mentorName = foundMentor.user?.nama || foundMentor.nama || foundMentor.name || "-";
    }
    
    const status = getUserStatus(item.user, item);
    const fullName = item.user?.nama || item.nama || item.name || "No Name";
    
    // Hitung progress dari tugas yang sudah dikerjakan
    const progress = item.progress || 0;
    const kehadiran = item.kehadiran_persen || item.kehadiran || 0;
    
    return {
      id: item.id_peserta || item.id,
      name: fullName,
      email: item.user?.email || item.email || "-",
      divisi: divisiName,
      status: status,
      mentor: mentorName,
      initials: getInitials(fullName),
      tanggalMulai: formatDate(item.tanggal_mulai || item.start_date),
      tanggalSelesai: formatDate(item.tanggal_selesai || item.end_date),
      progress: progress,
      kehadiran: kehadiran
    };
  });

  // Format data mentor
  const formattedMentor = mentorList.map((item) => {
    let divisiName = "-";
    
    // Cek dari item.divisi
    if (item.divisi) {
      if (typeof item.divisi === 'object' && item.divisi !== null) {
        divisiName = item.divisi.nama_divisi || item.divisi.nama || "-";
      } else if (typeof item.divisi === 'string') {
        divisiName = item.divisi;
      }
    }
    
    // Cek dari id_divisi
    if (divisiName === "-" && item.id_divisi) {
      const foundDivisi = divisiList.find(d => (d.id_divisi || d.id) == item.id_divisi);
      if (foundDivisi) divisiName = foundDivisi.nama_divisi || foundDivisi.nama || "-";
    }
    
    const status = getUserStatus(item.user, item);
    const fullName = item.user?.nama || item.name || item.nama || "No Name";
    const mentorId = item.id_mentor || item.id_user || item.id;
    
    // Hitung jumlah bimbingan
    const jumlahBimbingan = pesertaList.filter(p => p.id_mentor == mentorId).length;
    
    return {
      id: mentorId,
      name: fullName,
      email: item.user?.email || item.email || "-",
      divisi: divisiName,
      status: status,
      initials: getInitials(fullName),
      jumlahBimbingan: jumlahBimbingan,
      jabatan: item.jabatan || "-"
    };
  });

  // Format data divisi
  const formattedDivisi = divisiList.map((divisi) => {
    const divisiId = divisi.id_divisi || divisi.id;
    const divisiName = divisi.nama_divisi || divisi.nama || "-";
    const status = divisi.status === "aktif" || divisi.status === 1 || divisi.status === true ? "aktif" : "non_aktif";
    
    // Hitung jumlah anggota
    const jumlahPeserta = pesertaList.filter(p => {
      const pDivisi = p.divisi?.nama_divisi || p.divisi || p.nama_divisi;
      const pDivisiId = p.id_divisi;
      return pDivisi === divisiName || pDivisiId == divisiId;
    }).length;
    
    const jumlahMentor = mentorList.filter(m => {
      const mDivisi = m.divisi?.nama_divisi || m.divisi || m.nama_divisi;
      const mDivisiId = m.id_divisi;
      return mDivisi === divisiName || mDivisiId == divisiId;
    }).length;
    
    return {
      id: divisiId,
      name: divisiName,
      status: status,
      jumlahPeserta: jumlahPeserta,
      jumlahMentor: jumlahMentor,
      totalAnggota: jumlahPeserta + jumlahMentor,
      deskripsi: divisi.deskripsi || "-"
    };
  });

  // Filter data berdasarkan tab
  const getFilteredData = () => {
    let data = [];
    let filterByDivisi = false;
    let filterByStatus = false;
    
    switch(activeTab) {
      case "peserta":
        data = [...formattedPeserta];
        filterByDivisi = true;
        filterByStatus = true;
        break;
      case "mentor":
        data = [...formattedMentor];
        filterByDivisi = true;
        filterByStatus = true;
        break;
      case "divisi":
        data = [...formattedDivisi];
        filterByStatus = true;
        break;
      default:
        data = [];
    }
    
    // Filter search
    if (search) {
      data = data.filter(d => 
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        (d.email && d.email !== "-" && d.email.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Filter divisi (khusus peserta & mentor)
    if (filterByDivisi && divisiFilter !== "all") {
      data = data.filter(d => d.divisi === divisiFilter);
    }
    
    // Filter status
    if (filterByStatus && statusFilter !== "all") {
      data = data.filter(d => d.status === statusFilter);
    }
    
    return data;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearch("");
    setDivisiFilter("all");
    setStatusFilter("all");
  };

  // Handle refresh
  const handleRefresh = () => {
    loadAllData();
  };

  // Handle detail peserta - navigasi ke halaman detail peserta
  const handleDetailPeserta = (pesertaId) => {
    // Navigasi ke halaman detail peserta dengan ID yang benar
    navigate(`/coo/peserta/${pesertaId}/detail`);
  };

  // Handle detail mentor
  const handleDetailMentor = (mentorId) => {
    navigate(`/coo/mentor/${mentorId}/detail`);
  };

  // Get statistik untuk setiap tab
  const getStats = () => {
    if (activeTab === "peserta") {
      const total = formattedPeserta.length;
      const aktif = formattedPeserta.filter(d => d.status === "aktif").length;
      const nonAktif = total - aktif;
      
      // Rata-rata PROGRESS tugas
      const rataProgress = total > 0 
        ? Math.round(formattedPeserta.reduce((sum, d) => sum + (d.progress || 0), 0) / total)
        : 0;
      
      // Rata-rata PRESENSI / kehadiran
      const rataKehadiran = total > 0 
        ? Math.round(formattedPeserta.reduce((sum, d) => sum + (d.kehadiran || 0), 0) / total)
        : 0;
      
      return { total, aktif, nonAktif, rataProgress, rataKehadiran };
    }
    
    if (activeTab === "mentor") {
      const total = formattedMentor.length;
      const aktif = formattedMentor.filter(d => d.status === "aktif").length;
      const nonAktif = total - aktif;
      const totalBimbingan = formattedMentor.reduce((sum, d) => sum + (d.jumlahBimbingan || 0), 0);
      return { total, aktif, nonAktif, totalBimbingan };
    }
    
    if (activeTab === "divisi") {
      const total = formattedDivisi.length;
      const aktif = formattedDivisi.filter(d => d.status === "aktif").length;
      const nonAktif = total - aktif;
      const totalAnggota = formattedDivisi.reduce((sum, d) => sum + (d.totalAnggota || 0), 0);
      return { total, aktif, nonAktif, totalAnggota };
    }
    
    return { total: 0, aktif: 0, nonAktif: 0, rataProgress: 0, rataKehadiran: 0 };
  };

  const stats = getStats();

  if (loading && !dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
          <p className="text-slate-500 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 rounded-xl shadow-md">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                    Manajemen Data
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Pantau seluruh data peserta, mentor, dan divisi
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
                title="Refresh data"
              >
                <RefreshCw size={16} className="text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle size={16} />
            {error}
            <button onClick={handleRefresh} className="ml-auto underline text-red-600 hover:text-red-800">
              Coba lagi
            </button>
          </div>
        )}

        {/* STATS CARDS */}
        <div className={`grid gap-4 mb-6 ${
          activeTab === "peserta" 
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-5" 
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
        }`}>
          {/* Card Total */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total {activeTab === "peserta" ? "Peserta" : activeTab === "mentor" ? "Mentor" : "Divisi"}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <UsersIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Card Aktif */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{stats.aktif}</p>
                <p className="text-xs text-slate-500 mt-0.5">Aktif</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Card Nonaktif */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.nonAktif}</p>
                <p className="text-xs text-slate-500 mt-0.5">Nonaktif</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                <UserX className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Card Rata-rata Progress - ONLY untuk tab peserta */}
          {activeTab === "peserta" && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.rataProgress}%</p>
                  <p className="text-xs text-white/80 mt-0.5">Rata-rata Progress Tugas</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Card Rata-rata Kehadiran - ONLY untuk tab peserta */}
          {activeTab === "peserta" && (
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.rataKehadiran}%</p>
                  <p className="text-xs text-white/80 mt-0.5">Rata-rata Kehadiran</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Card untuk tab mentor */}
          {activeTab === "mentor" && (
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalBimbingan}</p>
                  <p className="text-xs text-white/80 mt-0.5">Total Bimbingan</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <UsersIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Card untuk tab divisi */}
          {activeTab === "divisi" && (
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalAnggota}</p>
                  <p className="text-xs text-white/80 mt-0.5">Total Anggota</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <UsersIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => handleTabChange("peserta")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "peserta"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/30"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <UsersIcon size={16} />
              Peserta
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{formattedPeserta.length}</span>
            </button>
            
            <button
              onClick={() => handleTabChange("mentor")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "mentor"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/30"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <UserCheck size={16} />
              Mentor
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{formattedMentor.length}</span>
            </button>
            
            <button
              onClick={() => handleTabChange("divisi")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "divisi"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/30"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Building2 size={16} />
              Divisi
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{formattedDivisi.length}</span>
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
            
            {(activeTab === "peserta" || activeTab === "mentor") && (
              <div className="w-full md:w-48">
                <select
                  value={divisiFilter}
                  onChange={(e) => setDivisiFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="all">Semua Divisi</option>
                  {divisiList.map((divisi) => (
                    <option key={divisi.id_divisi || divisi.id} value={divisi.nama_divisi || divisi.nama}>
                      {divisi.nama_divisi || divisi.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="w-full md:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="non_aktif">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                  
                  {activeTab !== "divisi" && (
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  )}
                  
                  {(activeTab === "peserta" || activeTab === "mentor") && (
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                  )}
                  
                  {activeTab === "peserta" && (
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentor</th>
                  )}
                  
                  {activeTab === "mentor" && (
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bimbingan</th>
                  )}
                  
                  {activeTab === "divisi" && (
                    <>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentor</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    </>
                  )}
                  
                  {activeTab === "peserta" && (
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Periode</th>
                  )}
                  
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  
                  {activeTab !== "divisi" && (
                    <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "peserta" ? 7 : activeTab === "mentor" ? 6 : 7} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                          <UsersIcon size="28" className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">Tidak ada data ditemukan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 transition group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {item.initials || getInitials(item.name)}
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{item.name}</span>
                        </div>
                      </td>
                      
                      {activeTab !== "divisi" && (
                        <td className="px-5 py-3 text-sm text-slate-500">{item.email || "-"}</td>
                      )}
                      
                      {(activeTab === "peserta" || activeTab === "mentor") && (
                        <td className="px-5 py-3">
                          {item.divisi && item.divisi !== "-" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                              <Building2 size={10} />
                              {item.divisi}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                      )}
                      
                      {activeTab === "peserta" && (
                        <td className="px-5 py-3">
                          {item.mentor && item.mentor !== "-" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-purple-50 text-purple-600 rounded-full font-medium">
                              <UserCheck size={10} />
                              {item.mentor}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                      )}
                      
                      {activeTab === "mentor" && (
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-medium">
                            <UsersIcon size={10} />
                            {item.jumlahBimbingan} Peserta
                          </span>
                        </td>
                      )}
                      
                      {activeTab === "divisi" && (
                        <>
                          <td className="px-5 py-3 text-sm text-slate-600">{item.jumlahPeserta}</td>
                          <td className="px-5 py-3 text-sm text-slate-600">{item.jumlahMentor}</td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                              <UsersIcon size={10} />
                              {item.totalAnggota}
                            </span>
                          </td>
                        </>
                      )}
                      
                      {activeTab === "peserta" && (
                        <td className="px-5 py-3">
                          {item.tanggalMulai && item.tanggalSelesai ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                              <Calendar size={12} className="text-slate-400" />
                              {item.tanggalMulai} - {item.tanggalSelesai}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                      )}
                      
                      <td className="px-5 py-3">
                        {item.status === "aktif" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-full">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Nonaktif
                          </span>
                        )}
                      </td>
                      
                      {activeTab !== "divisi" && (
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => {
                              if (activeTab === "peserta") {
                                handleDetailPeserta(item.id);
                              } else if (activeTab === "mentor") {
                                handleDetailMentor(item.id);
                              } else {
                                navigate(`/coo/divisi/${item.id}/detail`);
                              }
                            }}
                            className="p-1.5 text-teal-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                            title="Lihat Detail"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
              <p className="text-[10px] text-slate-400">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) return null;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-white"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* INFO BANNER */}
        <div className="mt-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-xl p-3 border border-teal-100">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-teal-500" />
            <p className="text-xs text-teal-700">
              <strong className="font-semibold">Informasi:</strong> Klik icon <Eye size={12} className="inline" /> pada kolom aksi untuk melihat detail lengkap peserta, termasuk kehadiran, progress tugas, dan hasil kuis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataManagement;