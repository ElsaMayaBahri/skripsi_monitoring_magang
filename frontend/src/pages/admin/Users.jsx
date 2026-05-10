import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../utils/api";
import { logActivity } from "../../utils/activityLogger";
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  Building2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar
} from "lucide-react";

function Users() {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialLoad = useRef(true);
  const isLoadingData = useRef(false);

  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem("users_tab");
    return savedTab === "peserta" || savedTab === "mentor" ? savedTab : "peserta";
  });
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divisiFilter, setDivisiFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [divisiList, setDivisiList] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [allPeserta, setAllPeserta] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, index: null, loading: false });
  const [successModal, setSuccessModal] = useState({ open: false, message: "", type: "success" });
  
  const itemsPerPage = 8;

  useEffect(() => {
    localStorage.setItem("users_tab", tab);
  }, [tab]);

  // Tangani state tab dari navigasi (dari AddMentor/AddPeserta)
  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const getInitials = (name) => {
    if (!name || name === "No Name") return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getUserStatus = (userData, itemData) => {
    if (userData?.status_akun) {
      if (userData.status_akun === "aktif" || userData.status_akun === "active") {
        return "aktif";
      }
      if (userData.status_akun === "non_aktif" || userData.status_akun === "inactive" || userData.status_akun === "nonaktif") {
        return "non_aktif";
      }
    }
    
    if (userData?.status !== undefined && userData?.status !== null) {
      if (userData.status === "aktif" || userData.status === "active" || userData.status === true) {
        return "aktif";
      }
      if (userData.status === "non_aktif" || userData.status === "inactive" || userData.status === false) {
        return "non_aktif";
      }
    }
    
    if (itemData?.status_akun) {
      if (itemData.status_akun === "aktif" || itemData.status_akun === "active") {
        return "aktif";
      }
      if (itemData.status_akun === "non_aktif" || itemData.status_akun === "inactive") {
        return "non_aktif";
      }
    }
    
    if (itemData?.user?.status_akun) {
      if (itemData.user.status_akun === "aktif" || itemData.user.status_akun === "active") {
        return "aktif";
      }
      if (itemData.user.status_akun === "non_aktif" || itemData.user.status_akun === "inactive") {
        return "non_aktif";
      }
    }
    
    if (itemData?.status !== undefined && itemData?.status !== null) {
      if (itemData.status === "aktif" || itemData.status === "active" || itemData.status === true) {
        return "aktif";
      }
      if (itemData.status === "non_aktif" || itemData.status === "inactive" || itemData.status === false) {
        return "non_aktif";
      }
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

  const loadAllData = useCallback(async (showLoading = true) => {
    if (isLoadingData.current) return null;
    isLoadingData.current = true;
    
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const [divisiRes, mentorRes, pesertaRes] = await Promise.all([
        api.getDivisi(),
        api.getMentors(),
        api.getPeserta()
      ]);
      
      let divisiData = [];
      if (divisiRes && divisiRes.success && Array.isArray(divisiRes.data)) {
        divisiData = divisiRes.data;
      } else if (Array.isArray(divisiRes)) {
        divisiData = divisiRes;
      }
      setDivisiList(divisiData);
      
      let mentors = [];
      if (mentorRes && mentorRes.success && Array.isArray(mentorRes.data)) {
        mentors = mentorRes.data;
      } else if (Array.isArray(mentorRes)) {
        mentors = mentorRes;
      }
      setAllMentors(mentors);
      
      let peserta = [];
      if (pesertaRes && pesertaRes.success && Array.isArray(pesertaRes.data)) {
        peserta = pesertaRes.data;
      } else if (Array.isArray(pesertaRes)) {
        peserta = pesertaRes;
      }
      setAllPeserta(peserta);
      
      setDataLoaded(true);
      return { divisiData, mentors, peserta };
    } catch (err) {
      console.error("Error loading data:", err);
      setError(`Gagal memuat data: ${err.message || "Terjadi kesalahan"}`);
      return null;
    } finally {
      isLoadingData.current = false;
      if (showLoading) setLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!dataLoaded) return;
    
    setLoading(true);
    
    try {
      if (tab === "peserta") {
        const mentorMap = new Map();
        allMentors.forEach(mentor => {
          const mentorName = mentor.user?.nama || mentor.nama || mentor.name || "";
          const ids = [
            mentor.id_mentor,
            mentor.id_user,
            mentor.id,
            Number(mentor.id_mentor),
            Number(mentor.id_user),
            String(mentor.id_mentor),
            String(mentor.id_user)
          ];
          ids.forEach(id => {
            if (id && id !== "undefined" && id !== "null" && id !== "") {
              mentorMap.set(id, mentorName);
            }
          });
        });
        
        const divisiMap = new Map();
        divisiList.forEach(divisi => {
          const divisiId = divisi.id_divisi || divisi.id;
          const divisiName = divisi.nama_divisi || divisi.nama;
          if (divisiId && divisiName) {
            divisiMap.set(divisiId, divisiName);
            divisiMap.set(Number(divisiId), divisiName);
            divisiMap.set(String(divisiId), divisiName);
          }
        });
        
        const formattedData = allPeserta.map((item) => {
          let mentorName = "";
          const pesertaMentorId = item.id_mentor;
          
          if (pesertaMentorId) {
            if (mentorMap.has(pesertaMentorId)) {
              mentorName = mentorMap.get(pesertaMentorId);
            }
            else if (mentorMap.has(Number(pesertaMentorId))) {
              mentorName = mentorMap.get(Number(pesertaMentorId));
            }
            else if (mentorMap.has(String(pesertaMentorId))) {
              mentorName = mentorMap.get(String(pesertaMentorId));
            }
          }
          
          if (!mentorName && item.mentor) {
            mentorName = item.mentor.user?.nama || item.mentor.nama || item.mentor.name || "";
          }
          
          if (!mentorName && pesertaMentorId) {
            const foundMentor = allMentors.find(m => 
              m.id_mentor == pesertaMentorId || 
              m.id_user == pesertaMentorId || 
              m.id == pesertaMentorId
            );
            if (foundMentor) {
              mentorName = foundMentor.user?.nama || foundMentor.nama || foundMentor.name || "";
            }
          }
          
          let divisiName = "";
          
          if (item.divisi) {
            if (typeof item.divisi === 'object' && item.divisi !== null) {
              divisiName = item.divisi.nama_divisi || item.divisi.nama || "";
            } 
            else if (typeof item.divisi === 'string') {
              divisiName = item.divisi;
            }
          }
          
          if (!divisiName && item.id_divisi) {
            if (divisiMap.has(item.id_divisi)) {
              divisiName = divisiMap.get(item.id_divisi);
            }
          }
          
          if (!divisiName && item.divisi_obj) {
            divisiName = item.divisi_obj.nama_divisi || item.divisi_obj.nama || "";
          }
          
          if (!divisiName && item.id_divisi) {
            const foundDivisi = divisiList.find(d => 
              d.id_divisi == item.id_divisi || 
              d.id == item.id_divisi
            );
            if (foundDivisi) {
              divisiName = foundDivisi.nama_divisi || foundDivisi.nama || "";
            }
          }
          
          const status = getUserStatus(item.user, item);
          const fullName = item.user?.nama || item.nama || "No Name";
          const tanggalMulai = item.tanggal_mulai || item.start_date || item.tgl_mulai;
          const tanggalSelesai = item.tanggal_selesai || item.end_date || item.tgl_selesai;
          
          return {
            id: item.id_peserta,
            name: fullName,
            email: item.user?.email || item.email || "",
            divisi: divisiName || "-",
            status: status,
            role: "peserta",
            initials: getInitials(fullName),
            mentor: mentorName || "-",
            mentorId: pesertaMentorId || "",
            tanggalMulai: formatDate(tanggalMulai),
            tanggalSelesai: formatDate(tanggalSelesai)
          };
        });
        setData(formattedData);
        
      } else {
        const countMap = new Map();
        allPeserta.forEach(p => {
          if (p.id_mentor) {
            const mid = Number(p.id_mentor);
            countMap.set(mid, (countMap.get(mid) || 0) + 1);
          }
        });
        
        const divisiMap = new Map();
        divisiList.forEach(divisi => {
          const divisiId = divisi.id_divisi || divisi.id;
          const divisiName = divisi.nama_divisi || divisi.nama;
          if (divisiId && divisiName) {
            divisiMap.set(divisiId, divisiName);
            divisiMap.set(Number(divisiId), divisiName);
            divisiMap.set(String(divisiId), divisiName);
          }
        });
        
        const formattedData = allMentors.map((item) => {
          const mentorId = item.id_mentor || item.id_user || item.id;
          
          let divisiName = "";
          
          if (item.divisi) {
            if (typeof item.divisi === 'object' && item.divisi !== null) {
              divisiName = item.divisi.nama_divisi || item.divisi.nama || "";
            } 
            else if (typeof item.divisi === 'string') {
              divisiName = item.divisi;
            }
          }
          
          if (!divisiName && item.user?.divisi) {
            if (typeof item.user.divisi === 'object' && item.user.divisi !== null) {
              divisiName = item.user.divisi.nama_divisi || item.user.divisi.nama || "";
            }
            else if (typeof item.user.divisi === 'string') {
              divisiName = item.user.divisi;
            }
          }
          
          if (!divisiName && item.id_divisi) {
            if (divisiMap.has(item.id_divisi)) {
              divisiName = divisiMap.get(item.id_divisi);
            }
          }
          
          if (!divisiName && item.id_divisi) {
            const foundDivisi = divisiList.find(d => 
              d.id_divisi == item.id_divisi || 
              d.id == item.id_divisi
            );
            if (foundDivisi) {
              divisiName = foundDivisi.nama_divisi || foundDivisi.nama || "";
            }
          }
          
          const status = getUserStatus(item.user, item);
          const fullName = item.user?.nama || item.name || item.nama || "No Name";
          
          return {
            id: mentorId,
            name: fullName,
            email: item.user?.email || item.email || "",
            divisi: divisiName || "-",
            status: status,
            role: "mentor",
            initials: getInitials(fullName),
            jumlahBimbingan: countMap.get(Number(mentorId)) || 0,
          };
        });
        
        setData(formattedData);
      }
    } catch (err) {
      console.error("Error formatting data:", err);
      setError(`Gagal memformat data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [tab, dataLoaded, allMentors, allPeserta, divisiList]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadAllData(true).then(() => {});
    }
  }, [loadAllData]);

  useEffect(() => {
    if (dataLoaded) {
      loadData();
    }
  }, [tab, dataLoaded, loadData]);

  const handleSuccessModalClose = () => {
    setSuccessModal({ open: false, message: "", type: "success" });
    loadAllData(false).then(() => loadData());
  };

  const filtered = data
    .filter((d) => d.name?.toLowerCase().includes(search.toLowerCase()))
    .filter((d) => (divisiFilter === "all" ? true : d.divisi === divisiFilter))
    .filter((d) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "aktif") return d.status === "aktif";
      if (statusFilter === "non_aktif") return d.status === "non_aktif";
      return true;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const total = filtered.length;
  const aktif = filtered.filter((d) => d.status === "aktif").length;
  const non_aktif = filtered.filter((d) => d.status === "non_aktif").length;

  const confirmDelete = async () => {
    const { user } = deleteModal;
    if (!user) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      if (tab === "peserta") {
        await api.deletePeserta(user.id);
        logActivity("delete", "peserta", user.name);
      } else {
        await api.deleteMentor(user.id);
        logActivity("delete", "mentor", user.name);
      }
      await loadAllData(false);
      await loadData();
      setDeleteModal({ open: false, user: null, index: null, loading: false });
      setSuccessModal({ open: true, message: `${user.name} berhasil dihapus.`, type: "success" });
    } catch (err) {
      setDeleteModal(prev => ({ ...prev, loading: false }));
      setSuccessModal({ open: true, message: err.message || "Gagal menghapus", type: "error" });
    }
  };

  const handleAdd = () => {
    navigate(tab === "mentor" ? "/admin/add-mentor" : "/admin/add-peserta");
  };

  const handleEdit = (index) => {
    const user = paginatedData[index];
    const path = tab === "peserta" 
      ? `/admin/users/edit-peserta/${user.id}`
      : `/admin/users/edit-mentor/${user.id}`;
    navigate(path, { state: { userData: user } });
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1);
    setSearch("");
    setDivisiFilter("all");
    setStatusFilter("all");
  };

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Manajemen Akun
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Kelola akun peserta dan mentor dalam sistem
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <Plus size={16} />
                Tambah {tab === "mentor" ? "Mentor" : "Peserta"}
              </button>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{total}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total Akun</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <UsersIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{aktif}</p>
                <p className="text-xs text-slate-500 mt-0.5">Akun Aktif</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{non_aktif}</p>
                <p className="text-xs text-slate-500 mt-0.5">Akun Nonaktif</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                <UserX className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <div className="h-1 w-8 bg-rose-500 rounded-full"></div>
            </div>
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
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            
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
            
            <div className="flex gap-2">
              <button
                onClick={() => handleTabChange("peserta")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === "peserta"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Peserta
              </button>
              <button
                onClick={() => handleTabChange("mentor")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === "mentor"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Mentor
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {error && (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                  {tab === "peserta" && (
                    <>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentor</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Periode</th>
                    </>
                  )}
                  {tab === "mentor" && (
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jumlah Bimbingan</th>
                  )}
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={tab === "peserta" ? 8 : 7} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                          <UsersIcon size="28" className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">Tidak ada data ditemukan</p>
                        <button
                          onClick={handleAdd}
                          className="flex items-center gap-1.5 text-blue-600 text-sm font-medium hover:text-blue-700 transition"
                        >
                          <Plus size={14} />
                          Tambah {tab === "mentor" ? "mentor" : "peserta"} baru
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, i) => (
                    <tr key={item.id || i} className="hover:bg-slate-50/50 transition group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {item.initials}
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{item.email}</td>
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
                      
                      {/* Kolom Mentor (khusus peserta) */}
                      {tab === "peserta" && (
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
                      
                      {/* Kolom Periode (khusus peserta) */}
                      {tab === "peserta" && (
                        <td className="px-5 py-3">
                          {item.tanggalMulai && item.tanggalSelesai ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                              <Calendar size={12} className="text-slate-400" />
                              {item.tanggalMulai} - {item.tanggalSelesai}
                            </span>
                          ) : item.tanggalMulai && !item.tanggalSelesai ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                              <Calendar size={12} className="text-amber-400" />
                              Mulai: {item.tanggalMulai}
                            </span>
                          ) : !item.tanggalMulai && item.tanggalSelesai ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                              <Calendar size={12} className="text-amber-400" />
                              Selesai: {item.tanggalSelesai}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                      )}
                      
                      {/* Kolom Jumlah Bimbingan (khusus mentor) */}
                      {tab === "mentor" && (
                        <td className="px-5 py-3">
                          {item.jumlahBimbingan > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-medium">
                              <UsersIcon size={10} />
                              {item.jumlahBimbingan} Peserta
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">0 Peserta</span>
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
                      
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(i)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, user: item, index: i, loading: false })}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
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
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} {tab === "peserta" ? "peserta" : "mentor"}
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
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
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
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-500" />
            <p className="text-xs text-blue-700">
              <strong className="font-semibold">Informasi:</strong> Data pengguna dapat difilter berdasarkan nama, divisi, dan status. Klik ikon untuk mengedit atau menghapus akun.
            </p>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteModal({ open: false, user: null, index: null, loading: false })} />
      )}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500"></div>
              <div className="pt-6 pb-2 px-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Hapus Akun?</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Apakah Anda yakin ingin menghapus akun <br />
                  <span className="font-semibold text-slate-700">"{deleteModal.user?.name}"</span>?
                </p>
                <p className="text-xs text-red-500 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
              <div className="p-6 pt-4 flex gap-3">
                <button
                  onClick={() => setDeleteModal({ open: false, user: null, index: null, loading: false })}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
                  disabled={deleteModal.loading}
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteModal.loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl text-white font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {deleteModal.loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={14} />}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL - Hanya untuk pesan dari delete */}
      {successModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleSuccessModalClose} />
      )}
      {successModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className={`h-1.5 bg-gradient-to-r ${
                successModal.type === "success" 
                  ? "from-emerald-500 via-teal-500 to-blue-500" 
                  : "from-red-500 via-rose-500 to-orange-500"
              }`} />
              <div className="pt-6 pb-6 px-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  successModal.type === "success" ? "bg-emerald-100" : "bg-red-100"
                }`}>
                  {successModal.type === "success" ? (
                    <CheckCircle size={32} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={32} className="text-red-500" />
                  )}
                </div>
                <h3 className={`text-xl font-bold ${
                  successModal.type === "success" ? "text-slate-800" : "text-red-600"
                }`}>
                  {successModal.type === "success" ? "Berhasil!" : "Gagal!"}
                </h3>
                <p className="text-sm text-slate-500 mt-2">{successModal.message}</p>
              </div>
              <div className="px-6 pb-6">
                <button
                  onClick={handleSuccessModalClose}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl text-white font-semibold shadow-md hover:shadow-lg"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;