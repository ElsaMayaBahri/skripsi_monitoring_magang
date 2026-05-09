// src/pages/mentor/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  ClipboardList,
  Clock,
  CheckCircle,
  Calendar,
  Bell,
  FileText,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Star,
  Target,
  Zap,
  BarChart3,
  Timer,
  ThumbsUp,
  ChevronRight,
  Shield,
  PlusCircle,
  Award,
  AlertTriangle,
  Gem,
  Crown,
  Medal,
  Loader2
} from "lucide-react";
import {
  getMentorDashboard,
  getMentorParticipants,
  getMentorNotifications
} from "../../api/mentor/dashboardService";

function MentorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [stats, setStats] = useState({
    totalMentees: 0,
    pendingReviews: 0,
    approachingDeadline: 0,
    presentToday: 0,
    absentToday: 0,
    completedTasks: 0,
    averageScore: 0,
    attendanceRate: 0
  });
  
  const [notifications, setNotifications] = useState([]);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [problematicParticipants, setProblematicParticipants] = useState([]);
  const [progressStats, setProgressStats] = useState({
    onTrack: 0,
    behind: 0,
    excellentCount: 0,
    atRiskCount: 0,
    lowAttendanceCount: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = typeof userData === 'string' ? JSON.parse(userData) : userData;
        setUser(parsed);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const dashboardResponse = await getMentorDashboard();
      console.log("Dashboard response:", dashboardResponse);
      
      if (dashboardResponse?.success) {
        const data = dashboardResponse.data;
        setStats({
          totalMentees: data.total_peserta || 0,
          pendingReviews: data.total_tugas || 0,
          approachingDeadline: 0,
          presentToday: 0,
          absentToday: 0,
          completedTasks: 0,
          averageScore: data.rata_rata_nilai || 0,
          attendanceRate: data.rata_rata_kehadiran || 0
        });
      }
      
      // Fetch peserta list
      const pesertaResponse = await getMentorParticipants();
      console.log("Peserta response:", pesertaResponse);
      
      if (pesertaResponse?.success && pesertaResponse.data) {
        const peserta = pesertaResponse.data;
        
        // Hitung problematic participants
        const problematic = peserta.filter(p => (p.progress || 0) < 70 || (p.kehadiran_persen || 0) < 70);
        setProblematicParticipants(problematic.map(p => ({
          id: p.id_peserta,
          name: p.nama || p.nama_lengkap,
          issue: (p.progress || 0) < 70 ? `Progress ${p.progress || 0}%` : `Kehadiran ${p.kehadiran_persen || 0}%`,
          progress: p.progress || 0,
          attendance: p.kehadiran_persen || 0
        })));
        
        // Set recent participants
        setRecentParticipants(peserta.map(p => ({
          id: p.id_peserta,
          name: p.nama || p.nama_lengkap,
          status: "active",
          progress: p.progress || 0,
          attendance: p.kehadiran_persen || 0,
          divisi: p.divisi || "-",
          rank: p.rank || "silver"
        })));
        
        // Hitung progress stats
        const onTrack = peserta.filter(p => (p.progress || 0) >= 70).length;
        const behind = peserta.filter(p => (p.progress || 0) < 70).length;
        const excellent = peserta.filter(p => (p.progress || 0) >= 85).length;
        const atRisk = peserta.filter(p => (p.progress || 0) < 50).length;
        const lowAttendance = peserta.filter(p => (p.kehadiran_persen || 0) < 70).length;
        
        setProgressStats({
          onTrack,
          behind,
          excellentCount: excellent,
          atRiskCount: atRisk,
          lowAttendanceCount: lowAttendance
        });
      }
      
      // Fetch notifications
      const notifResponse = await getMentorNotifications();
      if (notifResponse?.success && notifResponse.data) {
        setNotifications(notifResponse.data);
      }
      
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    return "Selamat Malam";
  };

  const formatDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const date = new Date();
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getRankGradient = (rank) => {
    const gradients = {
      diamond: "from-cyan-400 to-blue-500",
      gold: "from-amber-400 to-yellow-500",
      silver: "from-slate-400 to-gray-500"
    };
    return gradients[rank] || "from-teal-500 to-blue-600";
  };

  const getRankIcon = (rank) => {
    if (rank === "diamond") return <Gem size="10" className="text-cyan-400" />;
    if (rank === "gold") return <Crown size="10" className="text-amber-400" />;
    return <Medal size="10" className="text-slate-400" />;
  };

  // Fungsi navigasi untuk card statistik
  const handleStatCardClick = (cardType) => {
    switch(cardType) {
      case 'totalMentees':
        navigate('/mentor/daftar-peserta');
        break;
      case 'pendingReviews':
        navigate('/mentor/tugas-perlu-review');
        break;
      case 'progressProgram':
        navigate('/mentor/daftar-peserta');
        break;
      case 'averageScore':
        navigate('/mentor/input-nilai-manual');
        break;
      default:
        break;
    }
  };

  // Fungsi navigasi untuk peserta bermasalah
  const handleProblematicClick = (participantId) => {
    navigate(`/mentor/peserta/${participantId}`);
  };

  const quickActions = [
    { icon: PlusCircle, label: "Tambah Materi", link: "/mentor/add-materi" },
    { icon: ClipboardList, label: "Buat Tugas", link: "/mentor/add-tugas" },
    { icon: Users, label: "Lihat Peserta", link: "/mentor/daftar-peserta" },
    { icon: Award, label: "Input Nilai", link: "/mentor/input-nilai-manual" },
  ];

  const onTrackCount = progressStats.onTrack;
  const behindCount = progressStats.behind;
  const totalParticipants = recentParticipants.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-3 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                      {getCurrentGreeting()}, {user?.nama?.split(' ')[0] || "Mentor"}
                    </span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                      <span className="text-xs text-slate-500">{formatDate()}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">Mentor Panel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - 4 Cards Utama dengan fungsi klik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 - Total Peserta */}
          <div 
            onClick={() => handleStatCardClick('totalMentees')}
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] font-semibold text-emerald-600">Aktif</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-800">{stats.totalMentees}</p>
                <p className="text-xs text-slate-500">Peserta Bimbingan</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                    <span className="text-[10px] text-slate-400">Kehadiran</span>
                  </div>
                  <span className="text-[10px] font-semibold text-teal-600">{stats.attendanceRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - Perlu Review */}
          <div 
            onClick={() => handleStatCardClick('pendingReviews')}
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-full">
                  <Clock className="w-2.5 h-2.5 text-amber-500" />
                  <span className="text-[10px] font-semibold text-amber-600">Perlu Aksi</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-800">{stats.pendingReviews}</p>
                <p className="text-xs text-slate-500">Perlu Review</p>
              </div>
            </div>
          </div>

          {/* Card 3 - Progress Program */}
          <div 
            onClick={() => handleStatCardClick('progressProgram')}
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-full">
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600">Program</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-emerald-600">{totalParticipants > 0 ? Math.round((onTrackCount / totalParticipants) * 100) : 0}%</p>
                <p className="text-xs text-slate-500">Peserta On Track</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                    <span className="text-[10px] text-slate-400">Tertinggal</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-600">{behindCount} peserta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 - Rata-rata Nilai */}
          <div 
            onClick={() => handleStatCardClick('averageScore')}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <Star className="w-2.5 h-2.5 text-white" />
                  <span className="text-[10px] font-semibold text-white">Prestasi</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{stats.averageScore}</p>
                <p className="text-xs text-white/80">Rata-rata Nilai</p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-10 bg-white/30 rounded-full"></div>
                    <span className="text-[10px] text-white/70">Kinerja</span>
                  </div>
                  <span className="text-[10px] font-semibold text-white/90">
                    {stats.averageScore >= 85 ? "Sangat Baik" : stats.averageScore >= 70 ? "Baik" : "Perlu Ditingkatkan"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Peserta Bermasalah - dengan fungsi klik */}
        {problematicParticipants.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-rose-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">⚠️ Perlu Perhatian Khusus</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {problematicParticipants.slice(0, 3).map((participant, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleProblematicClick(participant.id)}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-red-100 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertTriangle size="14" className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{participant.name}</p>
                        <p className="text-[10px] text-red-600">{participant.issue}</p>
                      </div>
                    </div>
                    <div className="text-xs text-teal-600 font-medium flex items-center gap-1">
                      Lihat <ChevronRight size={10} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>Progress</span>
                        <span className="text-red-600 font-semibold">{participant.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style={{ width: `${participant.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Kehadiran</span>
                      <span className={`font-semibold ${participant.attendance < 70 ? 'text-red-600' : 'text-amber-600'}`}>{participant.attendance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions - sudah menggunakan Link */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-blue-600 rounded-full"></div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Akses Cepat</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} to={action.link}>
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:border-teal-300 hover:bg-teal-50/40 hover:shadow-md transition-all duration-200 group">
                    <Icon size={16} className="text-slate-500 group-hover:text-teal-500 transition-colors" />
                    <span className="group-hover:text-teal-600 transition-colors">{action.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Daftar Peserta Singkat - dengan fungsi klik pada card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
          <div className="relative h-1.5 bg-gradient-to-r from-teal-500 to-blue-600"></div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-md">Peserta Bimbingan</h3>
                  <p className="text-[10px] text-slate-400">Progress dan status magang</p>
                </div>
              </div>
              <Link to="/mentor/daftar-peserta" className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors">
                Lihat semua <ChevronRight size={12} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentParticipants.slice(0, 4).map((participant, idx) => {
                const rankGradient = getRankGradient(participant.rank);
                return (
                  <div 
                    key={idx} 
                    onClick={() => navigate(`/mentor/peserta/${participant.id}`)}
                    className="p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${rankGradient} flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform`}>
                          {participant.name?.charAt(0) || "P"}
                        </div>
                        <div className="absolute -bottom-1 -right-1">
                          {getRankIcon(participant.rank)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-teal-600 transition-colors">
                          {participant.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{participant.divisi}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Progress Tugas</span>
                          <span className={`font-semibold ${participant.progress < 70 ? 'text-red-600' : 'text-teal-600'}`}>{participant.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${rankGradient} rounded-full`} style={{ width: `${participant.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-1">
                          <UserCheck size={10} className="text-emerald-500" />
                          <span className="text-[9px] text-slate-500">Kehadiran</span>
                        </div>
                        <span className={`text-[10px] font-semibold ${participant.attendance < 70 ? 'text-red-600' : 'text-emerald-600'}`}>{participant.attendance}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default MentorDashboard;