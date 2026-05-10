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
  Loader2,
  Info,
  TrendingDown
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
          averageScore: 0,
          attendanceRate: data.rata_rata_kehadiran || 0
        });
      }
      
      const pesertaResponse = await getMentorParticipants();
      console.log("Peserta response:", pesertaResponse);
      
      if (pesertaResponse?.success && pesertaResponse.data) {
        const peserta = pesertaResponse.data;
        
        const problematic = peserta.filter(p => (p.progress || 0) < 60 || (p.kehadiran_persen || 0) < 60);
        setProblematicParticipants(problematic.map(p => ({
          id: p.id_peserta,
          name: p.nama || p.nama_lengkap,
          issue: (p.progress || 0) < 60 ? `Progress ${p.progress || 0}%` : `Kehadiran ${p.kehadiran_persen || 0}%`,
          progress: p.progress || 0,
          attendance: p.kehadiran_persen || 0
        })));
        
        setRecentParticipants(peserta.map(p => ({
          id: p.id_peserta,
          name: p.nama || p.nama_lengkap,
          status: "active",
          progress: p.progress || 0,
          attendance: p.kehadiran_persen || 0,
          divisi: p.divisi || "-"
        })));
        
        const onTrack = peserta.filter(p => (p.progress || 0) >= 70).length;
        const behind = peserta.filter(p => (p.progress || 0) < 70).length;
        
        setProgressStats({
          onTrack,
          behind,
          excellentCount: 0,
          atRiskCount: 0,
          lowAttendanceCount: 0
        });
      }
      
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
      default:
        break;
    }
  };

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
  const onTrackPercentage = totalParticipants > 0 ? Math.round((onTrackCount / totalParticipants) * 100) : 0;
  const previousWeekPercentage = 68; // Contoh data, nanti dari API
  const trendUp = onTrackPercentage > previousWeekPercentage;

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

  // Empty state untuk peserta bermasalah
  const hasProblematic = problematicParticipants.length > 0;

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
                  <div className="relative p-3 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl shadow-md transform group-hover:scale-105 transition-transform duration-300">
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

        {/* Stats Cards - 3 Cards dengan visual lebih hidup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 - Total Peserta */}
          <div 
            onClick={() => handleStatCardClick('totalMentees')}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-slate-100"
          >
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] font-semibold text-emerald-600">Aktif</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{stats.totalMentees}</p>
                <p className="text-xs text-slate-500 mt-1">Peserta Bimbingan</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-10 bg-blue-500 rounded-full"></div>
                    <span className="text-[11px] text-slate-600">Rata-rata Kehadiran</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">{stats.attendanceRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.attendanceRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - Perlu Review */}
          <div 
            onClick={() => handleStatCardClick('pendingReviews')}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-slate-100"
          >
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-full">
                  <Clock className="w-2.5 h-2.5 text-amber-500" />
                  <span className="text-[10px] font-semibold text-amber-600">Perlu Aksi</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{stats.pendingReviews}</p>
                <p className="text-xs text-slate-500 mt-1">Tugas Perlu Review</p>
              </div>
              {stats.pendingReviews === 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-[11px] text-emerald-600">Semua tugas sudah direview</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3 - Progress Program dengan mini chart */}
          <div 
            onClick={() => handleStatCardClick('progressProgram')}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-slate-100"
          >
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 rounded-full">
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600">Program</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-600">{onTrackPercentage}%</p>
                <p className="text-xs text-slate-500 mt-1">Peserta On Track</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {trendUp ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={`text-[10px] font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trendUp ? '↑' : '↓'} {Math.abs(onTrackPercentage - previousWeekPercentage)}% dari minggu lalu
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-600">Progress peserta</span>
                  <span className="text-[11px] font-medium text-slate-700">{behindCount} tertinggal</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${onTrackPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Peserta Bermasalah - dengan visual lebih menonjol */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-rose-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">⚠️ Perlu Perhatian Khusus</h3>
          </div>
          
          {hasProblematic ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {problematicParticipants.slice(0, 3).map((participant, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleProblematicClick(participant.id)}
                  className="bg-red-50/50 rounded-xl shadow-sm border-l-4 border-red-500 p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertTriangle size="14" className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{participant.name}</p>
                        <p className="text-[10px] text-red-600">{participant.issue}</p>
                      </div>
                    </div>
                    <button className="text-xs text-teal-600 font-medium flex items-center gap-1 px-2 py-1 rounded-full hover:bg-teal-50 transition-colors">
                      Lihat Detail <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-red-600">{participant.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full" style={{ width: `${participant.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">Kehadiran</span>
                      <span className={`font-semibold ${participant.attendance < 60 ? 'text-red-600' : 'text-emerald-600'}`}>{participant.attendance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Semua peserta dalam kondisi baik</p>
              <p className="text-xs text-slate-400 mt-1">Tidak ada peserta yang memerlukan perhatian khusus</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
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
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:border-teal-300 hover:bg-teal-50/40 hover:shadow-sm transition-all duration-200 group">
                    <Icon size={16} className="text-slate-500 group-hover:text-teal-500 transition-colors" />
                    <span className="group-hover:text-teal-600 transition-colors">{action.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Daftar Peserta Singkat */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100">
          <div className="relative h-1.5 bg-gradient-to-r from-teal-500 to-blue-600"></div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-md">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Peserta Bimbingan</h3>
                  <p className="text-[10px] text-slate-500">Progress dan status magang</p>
                </div>
              </div>
              <Link to="/mentor/daftar-peserta" className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors px-2 py-1 rounded-lg hover:bg-teal-50">
                Lihat semua <ChevronRight size={12} />
              </Link>
            </div>
            
            {recentParticipants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentParticipants.slice(0, 4).map((participant, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => navigate(`/mentor/peserta/${participant.id}`)}
                    className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold shadow-sm group-hover:scale-105 transition-transform">
                        {participant.name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-teal-600 transition-colors">
                          {participant.name}
                        </p>
                        <p className="text-[10px] text-slate-500">{participant.divisi}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>Progress Tugas</span>
                          <span className={`font-semibold ${participant.progress < 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{participant.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${participant.progress < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${participant.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-1">
                          <UserCheck size={10} className="text-slate-500" />
                          <span className="text-[10px] text-slate-600">Kehadiran</span>
                        </div>
                        <span className={`text-[11px] font-semibold ${participant.attendance < 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{participant.attendance}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Belum ada peserta bimbingan</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel - Notes kecil di bawah */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info size={12} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Progress Tugas</p>
                <p className="text-[10px] text-slate-600">{`(Tugas selesai ÷ Total tugas) × 100%`}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Target minimal: 70%</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserCheck size={12} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Kehadiran</p>
                <p className="text-[10px] text-slate-600">{`(Hadir + Terlambat + Izin) ÷ Total Hari Kerja × 100%`}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Target minimal: 70%</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle size={12} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Kriteria Perhatian Khusus</p>
                <p className="text-[10px] text-slate-600">Progress {'<'} 60% <span className="text-slate-300">atau</span> Kehadiran {'<'} 60%</p>
                <p className="text-[10px] text-amber-600 mt-0.5">Segera lakukan pendampingan!</p>
              </div>
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