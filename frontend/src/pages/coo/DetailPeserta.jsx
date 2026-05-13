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
  User
} from "lucide-react";
import {
  getDetailPeserta,
  getRiwayatKehadiran,
  getProgressTugas,
  getHasilKuis,
  getLaporanAkhir,
  getStatistikPeserta
} from "../../api/coo/detailPesertaService";

function DetailPeserta() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("kehadiran");
  
  // Data states
  const [detailPeserta, setDetailPeserta] = useState(null);
  const [riwayatKehadiran, setRiwayatKehadiran] = useState([]);
  const [progressTugas, setProgressTugas] = useState([]);
  const [hasilKuis, setHasilKuis] = useState([]);
  const [laporanAkhir, setLaporanAkhir] = useState(null);
  const [statistik, setStatistik] = useState(null);
  
  // Track loading per section
  const [loadingStates, setLoadingStates] = useState({
    detail: true,
    kehadiran: true,
    tugas: true,
    kuis: true,
    laporan: true,
    statistik: true
  });

  // Fetch semua data dengan parallel loading
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      const promises = [
        getDetailPeserta(id).then(res => {
          if (res && res.success && res.data) {
            setDetailPeserta(res.data);
          } else if (res && res.data) {
            setDetailPeserta(res.data);
          }
          setLoadingStates(prev => ({ ...prev, detail: false }));
        }).catch(err => {
          console.error("Detail error:", err);
          setLoadingStates(prev => ({ ...prev, detail: false }));
          setError("Gagal memuat data peserta");
        }),
        
        getRiwayatKehadiran(id).then(res => {
          let data = [];
          if (res && res.success && res.data) {
            data = res.data;
          } else if (res && Array.isArray(res)) {
            data = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            data = res.data;
          }
          // Hanya ambil 7 data terakhir (terbaru)
          const last7Days = data.slice(-7);
          setRiwayatKehadiran(last7Days);
          setLoadingStates(prev => ({ ...prev, kehadiran: false }));
        }).catch(err => {
          console.error("Kehadiran error:", err);
          setLoadingStates(prev => ({ ...prev, kehadiran: false }));
        }),
        
        getProgressTugas(id).then(res => {
          if (res && res.success && res.data) {
            setProgressTugas(res.data);
          } else if (res && Array.isArray(res)) {
            setProgressTugas(res);
          } else if (res && res.data && Array.isArray(res.data)) {
            setProgressTugas(res.data);
          }
          setLoadingStates(prev => ({ ...prev, tugas: false }));
        }).catch(err => {
          console.error("Tugas error:", err);
          setLoadingStates(prev => ({ ...prev, tugas: false }));
        }),
        
        getHasilKuis(id).then(res => {
          if (res && res.success && res.data) {
            setHasilKuis(res.data);
          } else if (res && Array.isArray(res)) {
            setHasilKuis(res);
          } else if (res && res.data && Array.isArray(res.data)) {
            setHasilKuis(res.data);
          }
          setLoadingStates(prev => ({ ...prev, kuis: false }));
        }).catch(err => {
          console.error("Kuis error:", err);
          setLoadingStates(prev => ({ ...prev, kuis: false }));
        }),
        
        getLaporanAkhir(id).then(res => {
          if (res && res.success && res.data) {
            setLaporanAkhir(res.data);
          } else if (res && res.data) {
            setLaporanAkhir(res.data);
          }
          setLoadingStates(prev => ({ ...prev, laporan: false }));
        }).catch(err => {
          console.error("Laporan error:", err);
          setLoadingStates(prev => ({ ...prev, laporan: false }));
        }),
        
        getStatistikPeserta(id).then(res => {
          if (res && res.success && res.data) {
            setStatistik(res.data);
          } else if (res && res.data) {
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

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-emerald-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-amber-500";
    return "bg-red-500";
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

  // Skeleton loading
  const SkeletonProfileCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-slate-200 rounded-2xl"></div>
          <div className="flex-1">
            <div className="h-7 bg-slate-200 rounded-lg w-48 mb-2"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-32"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-3 bg-slate-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SkeletonTabContent = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="flex border-b border-slate-200 p-4 gap-4">
        <div className="h-10 bg-slate-200 rounded-lg w-24"></div>
        <div className="h-10 bg-slate-200 rounded-lg w-24"></div>
        <div className="h-10 bg-slate-200 rounded-lg w-24"></div>
        <div className="h-10 bg-slate-200 rounded-lg w-24"></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="h-32 bg-slate-100 rounded-xl"></div>
        <div className="h-32 bg-slate-100 rounded-xl"></div>
        <div className="h-32 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );

  if (loading && loadingStates.detail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
        <div className="relative h-36 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-b-3xl">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <ArrowLeft size={18} />
              <span className="text-sm">Kembali</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 rounded-2xl animate-pulse"></div>
              <div>
                <div className="h-7 bg-white/30 rounded-lg w-48 mb-2"></div>
                <div className="h-5 bg-white/20 rounded-lg w-36"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <div className="space-y-6">
            <SkeletonProfileCard />
            <SkeletonTabContent />
          </div>
        </div>
      </div>
    );
  }

  if (error || !detailPeserta) {
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
              <p className="text-slate-500 mb-6">{error || "Data peserta tidak ditemukan"}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(detailPeserta.status);
  const userInitial = detailPeserta.nama?.charAt(0)?.toUpperCase() || "P";
  
  // Format periode magang
  const periodeMagang = detailPeserta.tanggal_mulai && detailPeserta.tanggal_selesai
    ? `${formatDate(detailPeserta.tanggal_mulai)} - ${formatDate(detailPeserta.tanggal_selesai)}`
    : detailPeserta.tanggal_mulai 
      ? `${formatDate(detailPeserta.tanggal_mulai)} - Sekarang`
      : "-";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      
      {/* HEADER - Tanpa efek gelembung */}
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
              {detailPeserta.foto ? (
                <img 
                  src={detailPeserta.foto} 
                  alt={detailPeserta.nama}
                  className="relative w-16 h-16 rounded-2xl object-cover shadow-xl border-2 border-white"
                />
              ) : (
                <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-white">
                  <span className="text-2xl font-bold text-teal-600">{userInitial}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{detailPeserta.nama}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>
                <span className="text-white/80 text-sm break-all">{detailPeserta.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        
        {/* PROFILE CARD - Grid dengan text wrap yang baik */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-700 break-all">{detailPeserta.email || "-"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Divisi</p>
                  <p className="text-sm font-medium text-slate-700 break-words">{detailPeserta.divisi || "-"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserCheck size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Mentor</p>
                  <p className="text-sm font-medium text-slate-700 break-words">{detailPeserta.mentor || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Jurusan</p>
                  <p className="text-sm font-medium text-slate-700 break-words">{detailPeserta.jurusan || "Teknik Informatika"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Universitas</p>
                  <p className="text-sm font-medium text-slate-700 break-words">{detailPeserta.universitas || "Universitas Indonesia"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={18} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400">Periode Magang</p>
                  <p className="text-sm font-medium text-slate-700 break-words">{periodeMagang}</p>
                </div>
              </div>
              
              {detailPeserta.phone && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400">No. Telepon</p>
                    <p className="text-sm font-medium text-slate-700 break-words">{detailPeserta.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABS CONTENT */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50">
            <button
              onClick={() => setActiveTab("kehadiran")}
              className={`px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "kehadiran"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <Calendar size={16} />
              Kehadiran (7 Hari Terakhir)
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
              Progress Tugas
            </button>
            <button
              onClick={() => setActiveTab("kuis")}
              className={`px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "kuis"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <Award size={16} />
              Hasil Kuis
            </button>
            <button
              onClick={() => setActiveTab("laporan")}
              className={`px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "laporan"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <FileText size={16} />
              Laporan Akhir
            </button>
          </div>

          {/* TAB KEHADIRAN - 7 Hari Terakhir */}
          {activeTab === "kehadiran" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar size={18} className="text-teal-500" />
                  Riwayat Kehadiran (7 Hari Terakhir)
                </h3>
                <div className="px-3 py-1.5 bg-teal-50 rounded-lg">
                  <span className="text-xs font-medium text-teal-600">Menampilkan {riwayatKehadiran.length} hari terakhir</span>
                </div>
              </div>
              {loadingStates.kehadiran ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
                          <div className="h-3 bg-slate-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-slate-200 rounded-full w-16"></div>
                    </div>
                  ))}
                </div>
              ) : riwayatKehadiran.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl">
                  <Calendar size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Belum ada data kehadiran 7 hari terakhir</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {riwayatKehadiran.slice().reverse().map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === "hadir" ? "bg-emerald-500" : 
                          item.status === "izin" ? "bg-amber-500" : "bg-red-500"
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{item.tanggal || formatDate(item.date)}</p>
                          <p className="text-xs text-slate-400">{item.keterangan || item.status}</p>
                        </div>
                      </div>
                      <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                        item.status === "hadir" ? "bg-emerald-100 text-emerald-700" : 
                        item.status === "izin" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>
                        {item.status === "hadir" ? "Hadir" : item.status === "izin" ? "Izin" : "Alpha"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB PROGRESS TUGAS */}
          {activeTab === "tugas" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-teal-500" />
                  Progress Pengerjaan Tugas
                </h3>
                <div className="px-3 py-1.5 bg-teal-50 rounded-lg">
                  <span className="text-xs font-medium text-teal-600">Selesai: {progressTugas.filter(t => t.progress === 100).length}/{progressTugas.length}</span>
                </div>
              </div>
              {loadingStates.tugas ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
                      <div className="flex justify-between mb-3">
                        <div className="h-5 bg-slate-200 rounded w-32"></div>
                        <div className="h-6 bg-slate-200 rounded-full w-12"></div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <div className="h-3 bg-slate-200 rounded w-16"></div>
                          <div className="h-3 bg-slate-200 rounded w-8"></div>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : progressTugas.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl">
                  <FileText size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Belum ada data tugas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {progressTugas.map((tugas, idx) => {
                    const grade = getNilaiGrade(tugas.nilai);
                    return (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-800">{tugas.judul}</h4>
                          {tugas.nilai && (
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${grade.bg} ${grade.color}`}>
                              {grade.grade}
                            </span>
                          )}
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                            <span>Progress</span>
                            <span className="font-semibold">{tugas.progress || 0}%</span>
                          </div>
                          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${getProgressColor(tugas.progress || 0)} transition-all duration-500`} style={{ width: `${tugas.progress || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Calendar size={10} />
                            Deadline: {formatDate(tugas.deadline)}
                          </span>
                          {tugas.nilai && (
                            <span className="text-slate-600 font-medium">Nilai: {tugas.nilai}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB HASIL KUIS */}
          {activeTab === "kuis" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Award size={18} className="text-teal-500" />
                  Hasil Pengerjaan Kuis
                </h3>
                <div className="px-3 py-1.5 bg-teal-50 rounded-lg">
                  <span className="text-xs font-medium text-teal-600">Total: {hasilKuis.length} kuis</span>
                </div>
              </div>
              {loadingStates.kuis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
                      <div className="flex justify-between mb-3">
                        <div className="h-5 bg-slate-200 rounded w-28"></div>
                        <div className="h-6 bg-slate-200 rounded-full w-12"></div>
                      </div>
                      <div className="h-8 bg-slate-200 rounded w-16 mt-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-24 mt-2"></div>
                    </div>
                  ))}
                </div>
              ) : hasilKuis.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl">
                  <Award size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Belum ada data kuis</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasilKuis.map((kuis, idx) => {
                    const grade = getNilaiGrade(kuis.nilai);
                    return (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-800">{kuis.judul}</h4>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${grade.bg} ${grade.color}`}>
                            {grade.grade}
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800 mt-2">{kuis.nilai || 0}</p>
                        <p className="text-xs text-slate-400">dari 100 poin</p>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Calendar size={10} />
                            {formatDate(kuis.tanggal)}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock size={10} />
                            {kuis.durasi || "-"} menit
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB LAPORAN AKHIR */}
          {activeTab === "laporan" && (
            <div className="p-6">
              <h3 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <FileText size={18} className="text-teal-500" />
                Laporan Akhir Magang
              </h3>
              {loadingStates.laporan ? (
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 animate-pulse">
                  <div className="flex justify-between mb-5">
                    <div>
                      <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
                      <div className="h-8 bg-slate-200 rounded w-16"></div>
                    </div>
                    <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="h-20 bg-slate-200 rounded-lg"></div>
                    <div className="h-20 bg-slate-200 rounded-lg"></div>
                  </div>
                </div>
              ) : !laporanAkhir ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl">
                  <FileText size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Laporan akhir belum tersedia</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Nilai Akhir</p>
                        <p className="text-4xl font-bold text-teal-600">{laporanAkhir.nilai_akhir || 0}</p>
                      </div>
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                        <Trophy size={32} className="text-yellow-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-teal-200">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2">Kesimpulan</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{laporanAkhir.kesimpulan || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2">Saran</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{laporanAkhir.saran || "-"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {laporanAkhir.file_url && (
                    <div className="flex justify-end">
                      <a 
                        href={laporanAkhir.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                      >
                        <Download size={16} />
                        Download Laporan Akhir
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailPeserta;