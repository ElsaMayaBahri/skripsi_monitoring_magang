// src/pages/mentor/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  ClipboardList,
  Clock,
  CheckCircle,
  ChevronRight,
  Shield,
  PlusCircle,
  Award,
  AlertTriangle,
  Loader2,
  Info,
  ListChecks
} from "lucide-react";
import {
  getMentorDashboard,
  getMentorParticipants,
  getMentorNotifications
} from "../../api/mentor/dashboardService";

// Komponen Skeleton Loading untuk Card
const SkeletonCard = () => (
  <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-slate-100 p-4 animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
      <div className="w-16 h-5 bg-slate-200 rounded-full"></div>
    </div>
    <div className="w-20 h-8 bg-slate-200 rounded mb-1"></div>
    <div className="w-24 h-3 bg-slate-200 rounded"></div>
    <div className="mt-3 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between mb-1">
        <div className="w-16 h-3 bg-slate-200 rounded"></div>
        <div className="w-8 h-3 bg-slate-200 rounded"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="w-16 h-3 bg-slate-200 rounded"></div>
        <div className="w-8 h-3 bg-slate-200 rounded"></div>
      </div>
    </div>
  </div>
);

// Komponen Skeleton Loading untuk Alert
const SkeletonAlert = () => (
  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 animate-pulse">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-5 bg-slate-200 rounded-full"></div>
      <div className="w-32 h-3 bg-slate-200 rounded"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-slate-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="w-24 h-3 bg-slate-200 rounded mb-1"></div>
              <div className="w-16 h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
);

// Komponen Skeleton Loading untuk Daftar Peserta
const SkeletonParticipantList = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 animate-pulse">
    <div className="relative h-1 bg-slate-200"></div>
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-200 rounded-lg"></div>
          <div>
            <div className="w-32 h-4 bg-slate-200 rounded mb-1"></div>
            <div className="w-24 h-2 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="w-16 h-3 bg-slate-200 rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="w-24 h-3 bg-slate-200 rounded mb-1"></div>
                <div className="w-16 h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function MentorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [stats, setStats] = useState({
    totalMentees: 0,
    pendingReviews: 0,
    completedTasks: 0,
    attendanceRate: 0,
    totalTasks: 0,
    unfinishedTasks: 0
  });
  
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [problematicParticipants, setProblematicParticipants] = useState([]);
  const [progressStats, setProgressStats] = useState({
    onTrack: 0,
    behind: 0
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
      // OPTIMASI: Gunakan Promise.all untuk paralel request
      const [dashboardResponse, pesertaResponse, notifResponse] = await Promise.all([
        getMentorDashboard(),
        getMentorParticipants(),
        getMentorNotifications()
      ]);
      
      console.log("Dashboard response:", dashboardResponse);
      console.log("Peserta response:", pesertaResponse);
      
      // Proses dashboard response
      if (dashboardResponse?.success && dashboardResponse?.stats) {
        const data = dashboardResponse.stats;
        
        setStats({
          totalMentees: data.totalMentees || 0,
          pendingReviews: data.pendingTasks || 0,
          completedTasks: data.completedTasks || 0,
          attendanceRate: data.attendanceRate || 0,
          totalTasks: data.totalTasks || 0,
          unfinishedTasks: data.unfinishedTasks || 0
        });
      }
      
      // Proses peserta response
      if (pesertaResponse?.success && pesertaResponse?.data) {
        const peserta = pesertaResponse.data;
        const pesertaArray = Array.isArray(peserta) ? peserta : [];
        
        // Filter peserta bermasalah (cukup ambil 3 saja untuk ditampilkan)
        const problematic = pesertaArray
          .filter(p => (p.progress || 0) < 60 || (p.kehadiran_persen || 0) < 60)
          .slice(0, 3)
          .map(p => ({
            id: p.id_peserta,
            name: p.nama || p.nama_lengkap || "Tidak ada nama",
            issue: (p.progress || 0) < 60 ? `Progress ${p.progress || 0}%` : `Kehadiran ${p.kehadiran_persen || 0}%`,
            progress: p.progress || 0,
            attendance: p.kehadiran_persen || 0
          }));
        
        setProblematicParticipants(problematic);
        
        // Recent participants (cukup 4 untuk ditampilkan)
        setRecentParticipants(pesertaArray.slice(0, 4).map(p => ({
          id: p.id_peserta,
          name: p.nama || p.nama_lengkap || "Tidak ada nama",
          status: "active",
          progress: p.progress || 0,
          attendance: p.kehadiran_persen || 0,
          divisi: p.divisi || "-"
        })));
        
        // Hitung onTrack dan behind
        const onTrack = pesertaArray.filter(p => (p.progress || 0) >= 70).length;
        const behind = pesertaArray.filter(p => (p.progress || 0) < 70).length;
        
        setProgressStats({ onTrack, behind });
      }
      
      // Notifikasi bisa diabaikan jika tidak perlu
      if (notifResponse?.success && notifResponse?.data) {
        // Proses notifikasi jika diperlukan
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
        navigate('/mentor/validasi-tugas');
        break;
      case 'totalTasks':
        navigate('/mentor/daftar-tugas');
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

  const totalParticipants = recentParticipants.length;
  const onTrackPercentage = totalParticipants > 0 ? Math.round((progressStats.onTrack / totalParticipants) * 100) : 0;

  // Tampilkan skeleton loading jika masih loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
        <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
              <div>
                <div className="w-48 h-8 bg-slate-200 rounded animate-pulse mb-1"></div>
                <div className="w-32 h-3 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          
          {/* Alert Skeleton */}
          <SkeletonAlert />
          
          {/* Quick Actions Skeleton */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-slate-200 rounded-full"></div>
              <div className="w-24 h-3 bg-slate-200 rounded"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 bg-slate-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Participant List Skeleton */}
          <SkeletonParticipantList />
        </div>
      </div>
    );
  }

  const hasProblematic = problematicParticipants.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-2.5 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-md transform group-hover:scale-105 transition-transform duration-300">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                      {getCurrentGreeting()}, {user?.nama?.split(' ')[0] || "Mentor"}
                    </span>
                  </h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
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

        {/* Stats Cards - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Card 1 - Total Peserta */}
          <div 
            onClick={() => handleStatCardClick('totalMentees')}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border border-slate-100"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-semibold text-emerald-700">Aktif</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{stats.totalMentees}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Peserta Bimbingan</p>
              </div>
            </div>
          </div>

          {/* Card 2 - Perlu Review */}
          <div 
            onClick={() => handleStatCardClick('pendingReviews')}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border border-slate-100"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 rounded-full">
                  <Clock className="w-2 h-2 text-amber-600" />
                  <span className="text-[9px] font-semibold text-amber-700">Perlu Aksi</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{stats.pendingReviews}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Tugas Perlu Review</p>
              </div>
              {stats.pendingReviews === 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-emerald-600">Semua tugas sudah direview</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3 - Total Tugas */}
          <div 
            onClick={() => handleStatCardClick('totalTasks')}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border border-slate-100"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <ListChecks className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                  <CheckCircle className="w-2 h-2 text-emerald-600" />
                  <span className="text-[9px] font-semibold text-emerald-700">Total</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-600">{stats.totalTasks}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Total Tugas</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-600">Tugas Selesai</span>
                  <span className="text-[10px] font-semibold text-emerald-600">{stats.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-600">Belum Selesai</span>
                  <span className="text-[10px] font-semibold text-amber-600">{stats.unfinishedTasks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Peserta Bermasalah */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-rose-500 rounded-full"></div>
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">⚠️ Perlu Perhatian Khusus</h3>
          </div>
          
          {hasProblematic ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {problematicParticipants.map((participant, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleProblematicClick(participant.id)}
                  className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg shadow-sm border-l-4 border-red-500 p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertTriangle size="12" className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{participant.name}</p>
                        <p className="text-[9px] text-red-600">{participant.issue}</p>
                      </div>
                    </div>
                    <button className="text-[10px] text-teal-600 font-medium flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-teal-50 transition-colors">
                      Detail <ChevronRight size={10} />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                        <span>Progress</span>
                        <span className="font-semibold text-red-600">{participant.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full" style={{ width: `${participant.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-600">Kehadiran</span>
                      <span className={`font-semibold ${participant.attendance < 60 ? 'text-red-600' : 'text-emerald-600'}`}>{participant.attendance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-4 text-center border border-slate-100">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-slate-500 text-xs">Semua peserta dalam kondisi baik</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada peserta yang memerlukan perhatian khusus</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-gradient-to-b from-teal-500 to-blue-600 rounded-full"></div>
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Akses Cepat</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} to={action.link}>
                  <button className="w-full flex items-center justify-center gap-1.5 px-2 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-medium hover:border-teal-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:shadow-sm transition-all duration-200 group">
                    <Icon size={14} className="text-slate-500 group-hover:text-teal-500 transition-colors" />
                    <span className="group-hover:text-teal-600 transition-colors">{action.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Daftar Peserta Singkat */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-100">
          <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg shadow-md">
                  <Users className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Peserta Bimbingan</h3>
                  <p className="text-[9px] text-slate-500">Progress dan status magang</p>
                </div>
              </div>
              <Link to="/mentor/daftar-peserta" className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-[10px] font-medium transition-colors px-1.5 py-0.5 rounded-lg hover:bg-teal-50">
                Lihat semua <ChevronRight size={10} />
              </Link>
            </div>
            
            {recentParticipants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {recentParticipants.map((participant, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => navigate(`/mentor/peserta/${participant.id}`)}
                    className="p-3 rounded-lg bg-gradient-to-br from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-all duration-200 cursor-pointer group border border-slate-100 hover:border-teal-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                        {participant.name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 group-hover:text-teal-600 transition-colors">
                          {participant.name}
                        </p>
                        <p className="text-[9px] text-slate-500">{participant.divisi}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                          <span>Progress Tugas</span>
                          <span className={`font-semibold ${participant.progress < 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{participant.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${participant.progress < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${participant.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <div className="flex items-center gap-0.5">
                          <UserCheck size={8} className="text-slate-500" />
                          <span className="text-[9px] text-slate-600">Kehadiran</span>
                        </div>
                        <span className={`text-[10px] font-semibold ${participant.attendance < 70 ? 'text-amber-600' : 'text-emerald-600'}`}>{participant.attendance}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-1" />
                <p className="text-slate-500 text-xs">Belum ada peserta bimbingan</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-5 pt-3 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-blue-50/30">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info size={10} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-700">Progress Tugas</p>
                <p className="text-[9px] text-slate-600">(Tugas Selesai ÷ Total Tugas) × 100%</p>
                <p className="text-[9px] text-emerald-600 mt-0.5">Target minimal: 70%</p>
              </div>
            </div>
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-emerald-50/30">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserCheck size={10} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-700">Kehadiran</p>
                <p className="text-[9px] text-slate-600">{`(Hadir + Terlambat + Izin) ÷ Total Hari Kerja × 100%`}</p>
                <p className="text-[9px] text-emerald-600 mt-0.5">Target minimal: 70%</p>
              </div>
            </div>
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-red-50/30">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle size={10} className="text-red-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-700">Kriteria Perhatian Khusus</p>
                <p className="text-[9px] text-slate-600">Progress {'<'} 60% <span className="text-slate-300">atau</span> Kehadiran {'<'} 60%</p>
                <p className="text-[9px] text-amber-600 mt-0.5">Segera lakukan pendampingan!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;