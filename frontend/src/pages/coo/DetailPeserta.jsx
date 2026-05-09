import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  BookOpen,
  FileText,
  Activity,
  Download,
  Printer,
  Share2,
  ChevronRight,
  Loader2,
  AlertCircle,
  UserCheck,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  CalendarDays,
  Star,
  Medal,
  Trophy,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  Shield,
  Crown,
  Gem,
  Heart,
  ThumbsUp,
  MessageCircle,
  Bell
} from "lucide-react";
import {
  getDetailPeserta,
  getRiwayatKehadiran,
  getProgressTugas,
  getHasilKuis,
  getLaporanAkhir,
  getStatistikPeserta,
  getAktivitasTerbaru
} from "../../api/coo/detailPesertaService";

function DetailPeserta() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Data states
  const [detailPeserta, setDetailPeserta] = useState(null);
  const [riwayatKehadiran, setRiwayatKehadiran] = useState([]);
  const [progressTugas, setProgressTugas] = useState([]);
  const [hasilKuis, setHasilKuis] = useState([]);
  const [laporanAkhir, setLaporanAkhir] = useState(null);
  const [statistik, setStatistik] = useState(null);
  const [aktivitas, setAktivitas] = useState([]);

  // Fetch semua data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        detailRes,
        kehadiranRes,
        tugasRes,
        kuisRes,
        laporanRes,
        statistikRes,
        aktivitasRes
      ] = await Promise.all([
        getDetailPeserta(id),
        getRiwayatKehadiran(id),
        getProgressTugas(id),
        getHasilKuis(id),
        getLaporanAkhir(id),
        getStatistikPeserta(id),
        getAktivitasTerbaru(id, 10)
      ]);
      
      setDetailPeserta(detailRes?.data || detailRes);
      setRiwayatKehadiran(kehadiranRes?.data || kehadiranRes || []);
      setProgressTugas(tugasRes?.data || tugasRes || []);
      setHasilKuis(kuisRes?.data || kuisRes || []);
      setLaporanAkhir(laporanRes?.data || laporanRes);
      setStatistik(statistikRes?.data || statistikRes);
      setAktivitas(aktivitasRes?.data || aktivitasRes || []);
      
    } catch (err) {
      console.error("Error fetching detail peserta:", err);
      setError(err.response?.data?.message || "Gagal memuat data peserta");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
          <p className="text-slate-500 text-sm">Memuat data peserta...</p>
        </div>
      </div>
    );
  }

  if (error || !detailPeserta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat Data</h2>
          <p className="text-slate-500 mb-6">{error || "Data peserta tidak ditemukan"}</p>
          <button
            onClick={() => navigate("/coo/data-management")}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Kembali ke Data Management
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(detailPeserta.status);
  const userInitial = detailPeserta.nama?.charAt(0)?.toUpperCase() || "P";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      
      {/* DECORATIVE HEADER BAR */}
      <div className="relative h-32 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-b-3xl shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 px-6 py-4">
          <button
            onClick={() => navigate("/coo/data-management")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-4 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Kembali ke Data Management</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg"></div>
              <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-teal-600">{userInitial}</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{detailPeserta.nama}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>
                <span className="text-white/60 text-xs">{detailPeserta.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto">
        
        {/* STATS CARDS PREMIUM */}
        {statistik && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 -mt-8 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-teal-500 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{statistik.progress || 0}%</p>
                  <p className="text-xs text-slate-500 mt-0.5">Progress Tugas</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Target size={22} className="text-teal-600" />
                </div>
              </div>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${getProgressColor(statistik.progress || 0)}`} style={{ width: `${statistik.progress || 0}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-blue-500 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{statistik.kehadiran || 0}%</p>
                  <p className="text-xs text-slate-500 mt-0.5">Kehadiran</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar size={22} className="text-blue-600" />
                </div>
              </div>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${(statistik.kehadiran || 0) >= 70 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${statistik.kehadiran || 0}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-purple-500 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{statistik.rataNilai || 0}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Rata-rata Nilai</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award size={22} className="text-purple-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < Math.floor((statistik.rataNilai || 0) / 20) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-amber-500 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{statistik.totalTugas || 0}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tugas Selesai</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={22} className="text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">dari {statistik.totalTugas || 0} tugas</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4 border-l-4 border-emerald-500 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{statistik.totalKuis || 0}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Kuis Selesai</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Trophy size={22} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Nilai tertinggi: {statistik.nilaiTertinggi || 0}</p>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Profile & Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card Premium */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-24 bg-gradient-to-r from-teal-500 to-blue-600">
                <div className="absolute -bottom-12 left-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md"></div>
                    <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                      <span className="text-3xl font-bold text-teal-600">{userInitial}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-14 pb-6 px-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">{detailPeserta.nama}</h2>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color} flex items-center gap-1`}>
                    {statusBadge.icon}
                    {statusBadge.text}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400">Email</p>
                      <p className="text-sm text-slate-700">{detailPeserta.email || "-"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Building2 size={14} className="text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400">Divisi</p>
                      <p className="text-sm text-slate-700">{detailPeserta.divisi || "-"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <UserCheck size={14} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400">Mentor</p>
                      <p className="text-sm text-slate-700">{detailPeserta.mentor || "-"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <CalendarDays size={14} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400">Periode Magang</p>
                      <p className="text-sm text-slate-700">
                        {detailPeserta.tanggal_mulai ? formatDate(detailPeserta.tanggal_mulai) : "-"} 
                        {detailPeserta.tanggal_selesai ? ` - ${formatDate(detailPeserta.tanggal_selesai)}` : ""}
                      </p>
                    </div>
                  </div>
                  
                  {detailPeserta.phone && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone size={14} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400">No. Telepon</p>
                        <p className="text-sm text-slate-700">{detailPeserta.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-teal-500" />
                  <h3 className="font-semibold text-slate-800">Aktivitas Terbaru</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {aktivitas.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Belum ada aktivitas</p>
                  </div>
                ) : (
                  aktivitas.map((act, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          act.type === "tugas" ? "bg-blue-100" : 
                          act.type === "kuis" ? "bg-purple-100" : "bg-green-100"
                        }`}>
                          {act.type === "tugas" ? <FileText size={14} className="text-blue-600" /> :
                           act.type === "kuis" ? <Award size={14} className="text-purple-600" /> :
                           <CheckCircle size={14} className="text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">{act.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{act.time || formatDate(act.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Tabs Content */}
          <div className="lg:col-span-2">
            
            {/* TABS */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex border-b border-slate-200 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "overview"
                      ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/30"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <BarChart3 size={16} />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("kehadiran")}
                  className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "kehadiran"
                      ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/30"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Calendar size={16} />
                  Kehadiran
                </button>
                <button
                  onClick={() => setActiveTab("tugas")}
                  className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "tugas"
                      ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/30"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FileText size={16} />
                  Progress Tugas
                </button>
                <button
                  onClick={() => setActiveTab("kuis")}
                  className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "kuis"
                      ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/30"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Award size={16} />
                  Hasil Kuis
                </button>
                <button
                  onClick={() => setActiveTab("laporan")}
                  className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "laporan"
                      ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/30"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FileText size={16} />
                  Laporan Akhir
                </button>
              </div>

              <div className="p-6">
                {/* TAB OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Ringkasan */}
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Sparkles size={16} className="text-teal-500" />
                        Ringkasan Kinerja
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4">
                          <p className="text-xs text-slate-500">Progress Keseluruhan</p>
                          <p className="text-3xl font-bold text-teal-600">{statistik?.progress || 0}%</p>
                          <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${statistik?.progress || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                          <p className="text-xs text-slate-500">Rata-rata Nilai</p>
                          <p className="text-3xl font-bold text-purple-600">{statistik?.rataNilai || 0}</p>
                          <div className="mt-2 flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < Math.floor((statistik?.rataNilai || 0) / 20) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Tambahan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target size={14} className="text-blue-500" />
                          <span className="text-xs font-medium text-slate-600">Target Pencapaian</span>
                        </div>
                        <p className="text-sm text-slate-700">
                          Minimal 70% progress dan 75% kehadiran untuk lulus magang
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className={`px-2 py-0.5 rounded-full text-xs ${
                            (statistik?.progress || 0) >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            Progress: {(statistik?.progress || 0) >= 70 ? "✓ Tercapai" : "✗ Belum"}
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-xs ${
                            (statistik?.kehadiran || 0) >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            Kehadiran: {(statistik?.kehadiran || 0) >= 75 ? "✓ Tercapai" : "✗ Belum"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Medal size={14} className="text-amber-500" />
                          <span className="text-xs font-medium text-slate-600">Peringkat</span>
                        </div>
                        <p className="text-sm text-slate-700">
                          {statistik?.peringkat ? `Peringkat ${statistik.peringkat} dari ${statistik.totalPeserta || 0} peserta` : "Belum ada data peringkat"}
                        </p>
                        {statistik?.peringkat && statistik.peringkat <= 3 && (
                          <div className="mt-2 flex items-center gap-1">
                            {statistik.peringkat === 1 && <Crown size={16} className="text-yellow-500" />}
                            {statistik.peringkat === 2 && <Medal size={16} className="text-slate-400" />}
                            {statistik.peringkat === 3 && <Medal size={16} className="text-amber-600" />}
                            <span className="text-xs font-medium text-amber-600">Top {statistik.peringkat}!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB KEHADIRAN */}
                {activeTab === "kehadiran" && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Calendar size={16} className="text-teal-500" />
                      Riwayat Kehadiran
                    </h3>
                    {riwayatKehadiran.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Belum ada data kehadiran</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {riwayatKehadiran.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
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
                            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
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
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-teal-500" />
                      Progress Pengerjaan Tugas
                    </h3>
                    {progressTugas.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Belum ada data tugas</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {progressTugas.map((tugas, idx) => {
                          const grade = getNilaiGrade(tugas.nilai);
                          return (
                            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-slate-800">{tugas.judul}</h4>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${grade.bg} ${grade.color}`}>
                                  {grade.grade}
                                </span>
                              </div>
                              <div className="mb-3">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                  <span>Progress</span>
                                  <span className="font-medium">{tugas.progress || 0}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${getProgressColor(tugas.progress || 0)}`} style={{ width: `${tugas.progress || 0}%` }}></div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Deadline: {formatDate(tugas.deadline)}</span>
                                <span className="text-slate-400">Nilai: {tugas.nilai || 0}</span>
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
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Award size={16} className="text-teal-500" />
                      Hasil Pengerjaan Kuis
                    </h3>
                    {hasilKuis.length === 0 ? (
                      <div className="text-center py-12">
                        <Award size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Belum ada data kuis</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hasilKuis.map((kuis, idx) => {
                          const grade = getNilaiGrade(kuis.nilai);
                          return (
                            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-slate-800">{kuis.judul}</h4>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${grade.bg} ${grade.color}`}>
                                  {grade.grade}
                                </span>
                              </div>
                              <p className="text-2xl font-bold text-slate-800 mt-2">{kuis.nilai || 0}</p>
                              <p className="text-xs text-slate-400">dari 100 poin</p>
                              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs">
                                <span className="text-slate-400">Tanggal: {formatDate(kuis.tanggal)}</span>
                                <span className="text-slate-400">Durasi: {kuis.durasi || "-"} menit</span>
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
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-teal-500" />
                      Laporan Akhir Magang
                    </h3>
                    {!laporanAkhir ? (
                      <div className="text-center py-12">
                        <FileText size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Laporan akhir belum tersedia</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-xs text-slate-500">Nilai Akhir</p>
                              <p className="text-3xl font-bold text-teal-600">{laporanAkhir.nilai_akhir || 0}</p>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                              <Trophy size={32} className="text-yellow-500" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-teal-200">
                            <div>
                              <p className="text-xs text-slate-500">Kesimpulan</p>
                              <p className="text-sm font-medium text-slate-700">{laporanAkhir.kesimpulan || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Saran</p>
                              <p className="text-sm font-medium text-slate-700">{laporanAkhir.saran || "-"}</p>
                            </div>
                          </div>
                        </div>
                        
                        {laporanAkhir.file_url && (
                          <div className="flex justify-end">
                            <a 
                              href={laporanAkhir.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition shadow-md"
                            >
                              <Download size={16} />
                              Download Laporan
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
        </div>
      </div>
    </div>
  );
}

export default DetailPeserta;