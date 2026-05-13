import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  UserCheck,
  Phone,
  CalendarDays,
  Star,
  Medal,
  Trophy,
  Target,
  BarChart3,
  Sparkles,
  Crown,
  WifiOff,
  RefreshCw,
  Clock,
  GraduationCap,
  BookOpen,
  Users,
  Briefcase,
  ChevronRight
} from "lucide-react";
import {
  getDetailMentor,
  getPesertaBimbingan,
  getStatistikMentor
} from "../../api/coo/detailMentorService";

function DetailMentor() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("bimbingan");
  
  // Data states
  const [detailMentor, setDetailMentor] = useState(null);
  const [pesertaBimbingan, setPesertaBimbingan] = useState([]);
  const [statistik, setStatistik] = useState(null);
  
  // Track loading per section
  const [loadingStates, setLoadingStates] = useState({
    detail: true,
    bimbingan: true,
    statistik: true
  });

  // Fetch semua data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      const promises = [
        getDetailMentor(id).then(res => {
          if (res && res.success && res.data) {
            setDetailMentor(res.data);
          }
          setLoadingStates(prev => ({ ...prev, detail: false }));
        }).catch(err => {
          console.error("Detail error:", err);
          setLoadingStates(prev => ({ ...prev, detail: false }));
          setError("Gagal memuat data mentor");
        }),
        
        getPesertaBimbingan(id).then(res => {
          let data = [];
          if (res && res.success && res.data) {
            data = res.data;
          } else if (res && Array.isArray(res)) {
            data = res;
          }
          setPesertaBimbingan(data);
          setLoadingStates(prev => ({ ...prev, bimbingan: false }));
        }).catch(err => {
          console.error("Bimbingan error:", err);
          setLoadingStates(prev => ({ ...prev, bimbingan: false }));
        }),
        
        getStatistikMentor(id).then(res => {
          if (res && res.success && res.data) {
            setStatistik(res.data);
          }
          setLoadingStates(prev => ({ ...prev, statistik: false }));
        }).catch(err => {
          console.error("Statistik error:", err);
          setLoadingStates(prev => ({ ...prev, statistik: false }));
        })
      ];
      
      await Promise.race([
        Promise.allSettled(promises),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);
      
      setLoading(false);
    };
    
    fetchAllData();
  }, [id]);

  const getStatusBadge = (status) => {
    if (status === "aktif" || status === "active") {
      return { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle size={12} />, text: "Aktif" };
    }
    return { color: "bg-red-100 text-red-700", icon: <XCircle size={12} />, text: "Nonaktif" };
  };

  const getNilaiGrade = (nilai) => {
    if (!nilai) return { grade: "-", color: "text-slate-500", bg: "bg-slate-100" };
    if (nilai >= 85) return { grade: "A", color: "text-emerald-600", bg: "bg-emerald-100" };
    if (nilai >= 75) return { grade: "B", color: "text-blue-600", bg: "bg-blue-100" };
    if (nilai >= 65) return { grade: "C", color: "text-amber-600", bg: "bg-amber-100" };
    if (nilai >= 50) return { grade: "D", color: "text-orange-600", bg: "bg-orange-100" };
    return { grade: "E", color: "text-red-600", bg: "bg-red-100" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (loading && loadingStates.detail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
          <p className="text-slate-500 text-sm">Memuat data mentor...</p>
        </div>
      </div>
    );
  }

  if (error || !detailMentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-500"></div>
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat Data</h2>
              <p className="text-slate-500 mb-6">{error || "Data mentor tidak ditemukan"}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all w-full"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(detailMentor.status);
  const userInitial = detailMentor.nama?.charAt(0)?.toUpperCase() || "M";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      
      {/* HEADER - Tanpa efek gelembung/blur */}
      <div className="relative h-36 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-b-3xl shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 px-6 py-4">
          <button
            onClick={() => navigate("/coo/data-management")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-4 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Kembali ke Data Management</span>
          </button>
          
          <div className="flex items-center gap-5">
            {/* Foto Profil - Tanpa efek blur di belakang */}
            <div className="relative">
              {detailMentor.foto ? (
                <img 
                  src={detailMentor.foto} 
                  alt={detailMentor.nama}
                  className="relative w-16 h-16 rounded-2xl object-cover shadow-xl border-2 border-white"
                />
              ) : (
                <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-white">
                  <span className="text-2xl font-bold text-teal-600">{userInitial}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{detailMentor.nama}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>
                <span className="text-white/80 text-sm break-all">{detailMentor.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        
        {/* PROFILE CARD - Info Mentor */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-700 break-all">{detailMentor.email || "-"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Divisi</p>
                  <p className="text-sm font-medium text-slate-700 break-words">{detailMentor.divisi || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Jabatan</p>
                  <p className="text-sm font-medium text-slate-700 break-words">{detailMentor.jabatan || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Jumlah Bimbingan</p>
                  <p className="text-sm font-medium text-slate-700">{statistik?.totalBimbingan || pesertaBimbingan.length} Peserta</p>
                </div>
              </div>
              
              {detailMentor.phone && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400">No. Telepon</p>
                    <p className="text-sm font-medium text-slate-700 break-words">{detailMentor.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={18} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Bergabung Sejak</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(detailMentor.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS CARDS RINGKASAN */}
        {statistik && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{statistik.totalBimbingan || pesertaBimbingan.length}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Total Bimbingan</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Users size={22} className="text-teal-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{statistik.tugasDiberikan || 0}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tugas Diberikan</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FileText size={22} className="text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{statistik.tugasDinilai || 0}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tugas Dinilai</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={22} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABS CONTENT */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50">
            <button
              onClick={() => setActiveTab("bimbingan")}
              className={`px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "bimbingan"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <Users size={16} />
              Peserta Bimbingan
            </button>
            <button
              onClick={() => setActiveTab("tugas")}
              className={`px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "tugas"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <FileText size={16} />
              Tugas yang Diberikan
            </button>
          </div>

          {/* TAB PESERTA BIMBINGAN */}
          {activeTab === "bimbingan" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Users size={18} className="text-teal-500" />
                  Daftar Peserta Bimbingan
                </h3>
                <div className="px-3 py-1.5 bg-teal-50 rounded-lg">
                  <span className="text-xs font-medium text-teal-600">Total: {pesertaBimbingan.length} peserta</span>
                </div>
              </div>
              {loadingStates.bimbingan ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                        <div>
                          <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-slate-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : pesertaBimbingan.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl">
                  <Users size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Belum ada peserta bimbingan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pesertaBimbingan.map((peserta, idx) => {
                    const grade = getNilaiGrade(peserta.rataNilai);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => navigate(`/coo/peserta/${peserta.id}/detail`)}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-teal-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                            {peserta.nama?.charAt(0) || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{peserta.nama}</p>
                            <p className="text-xs text-slate-400">{peserta.divisi}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-700">{peserta.progress || 0}%</p>
                            <p className="text-[10px] text-slate-400">Progress</p>
                          </div>
                          <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${grade.bg} ${grade.color} min-w-[50px] text-center`}>
                            {grade.grade}
                          </div>
                          <ChevronRight size={16} className="text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB TUGAS YANG DIBERIKAN */}
          {activeTab === "tugas" && (
            <div className="p-6">
              <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <FileText size={18} className="text-teal-500" />
                Tugas yang Diberikan
              </h3>
              {loadingStates.statistik ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
                      <div className="flex justify-between mb-3">
                        <div className="h-5 bg-slate-200 rounded w-32"></div>
                        <div className="h-6 bg-slate-200 rounded-full w-16"></div>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-16 bg-slate-50 rounded-xl">
                    <FileText size={48} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Belum ada tugas yang diberikan</p>
                    <p className="text-xs text-slate-400 mt-1">Tugas akan muncul setelah mentor memberikan tugas kepada peserta</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailMentor;