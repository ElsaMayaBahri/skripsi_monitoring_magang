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
  ListChecks,
  FileCheck,
  Calendar
} from "lucide-react";

import {
  getMentorDashboard,
  getMentorParticipants,
  getMentorNotifications
} from "../../api/mentor/dashboardService";
import { getMentorTugas } from "../../api/mentor/tugasService";

// Komponen Skeleton Loading untuk Card
const SkeletonCard = () => (
  <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-slate-100 p-4 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
      <div className="w-16 h-5 bg-slate-200 rounded-full"></div>
    </div>
    <div className="w-16 h-8 bg-slate-200 rounded mb-1"></div>
    <div className="w-24 h-3 bg-slate-200 rounded"></div>
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
                <div className="w-20 h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
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
  const [wibTime, setWibTime] = useState(new Date());
  
  const [stats, setStats] = useState({
    totalMentees: 0,
    pendingReviews: 0,
    totalSubmittedTasks: 0
  });
  
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [deadlineTasks, setDeadlineTasks] = useState([]);
  const [progressStats, setProgressStats] = useState({
    onTrack: 0,
    behind: 0
  });

  // Fungsi untuk mendapatkan waktu WIB (UTC+7)
  const getWIBTime = () => {
    const now = new Date();
    // WIB = UTC+7
    const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return wibTime;
  };

  // Update waktu setiap menit
  useEffect(() => {
    const updateTime = () => {
      setWibTime(getWIBTime());
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

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

  // Ambil tugas dengan deadline terdekat
  const fetchDeadlineTasks = async () => {
    try {
      const tugasResponse = await getMentorTugas();
      if (tugasResponse?.success && tugasResponse?.data) {
        const today = new Date();
        const activeTasks = tugasResponse.data.filter(task => {
          const deadline = new Date(task.deadline);
          return deadline >= today;
        });
        
        const sortedTasks = [...activeTasks].sort((a, b) => 
          new Date(a.deadline) - new Date(b.deadline)
        ).slice(0, 3);
        
        const formattedTasks = sortedTasks.map(task => {
          const deadline = new Date(task.deadline);
          const todayDate = new Date();
          const diffDays = Math.ceil((deadline - todayDate) / (1000 * 60 * 60 * 24));
          
          let deadlineText = '';
          if (diffDays === 0) deadlineText = 'Hari ini';
          else if (diffDays === 1) deadlineText = 'Besok';
          else if (diffDays <= 3) deadlineText = `${diffDays} hari lagi`;
          else deadlineText = `${diffDays} hari lagi`;
          
          const totalSubmissions = task.total_submissions || 0;
          const submittedCount = task.submitted_count || 0;
          
          return {
            id: task.id_tugas,
            judul: task.judul,
            deadline: task.deadline,
            deadlineText: deadlineText,
            diffDays: diffDays,
            totalSubmissions: totalSubmissions,
            submittedCount: submittedCount,
            isUrgent: diffDays <= 3
          };
        });
        
        setDeadlineTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching deadline tasks:", error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const pesertaResponse = await getMentorParticipants();
      
      let pesertaArray = [];
      if (pesertaResponse?.success && pesertaResponse?.data) {
        pesertaArray = Array.isArray(pesertaResponse.data) ? pesertaResponse.data : [];
      }
      
      const tugasResponse = await getMentorTugas();
      
      let totalTugas = 0;
      let totalSubmitted = 0;
      let belumKumpul = 0;
      
      if (tugasResponse?.success && tugasResponse?.data) {
        totalTugas = tugasResponse.data.length;
        
        for (const tugas of tugasResponse.data) {
          if (tugas.submissions) {
            const submitted = tugas.submissions.filter(s => s.submitted_at).length;
            totalSubmitted += submitted;
            const belum = tugas.submissions.filter(s => !s.submitted_at).length;
            belumKumpul += belum;
          }
        }
      }
      
      const pesertaList = pesertaArray.map(p => ({
        id: p.id_peserta || p.id,
        name: p.nama || p.nama_lengkap || "Tidak ada nama",
        universitas: p.asal_kampus || "-",
        jurusan: p.prodi || "-",
        periode: p.periode_magang || "-",
        progress: p.progress || 0,
        attendance: p.kehadiran_persen || 0
      }));
      
      // Deadline tasks
      await fetchDeadlineTasks();
      
      setRecentParticipants(pesertaList.slice(0, 4).map(p => ({
        id: p.id,
        name: p.name,
        universitas: p.universitas,
        jurusan: p.jurusan,
        periode: p.periode
      })));
      
      const onTrack = pesertaList.filter(p => p.progress >= 70).length;
      const behind = pesertaList.filter(p => p.progress < 70).length;
      
      setProgressStats({ onTrack, behind });
      
      setStats({
        totalMentees: pesertaList.length,
        pendingReviews: belumKumpul,
        totalSubmittedTasks: totalSubmitted
      });
      
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Perbaikan fungsi greeting berdasarkan waktu Indonesia (WIB)
  const getCurrentGreeting = () => {
    const hour = wibTime.getHours();
    // Pembagian waktu Indonesia:
    // 00:00 - 10:00 = Selamat Pagi
    // 10:00 - 15:00 = Selamat Siang  
    // 15:00 - 18:00 = Selamat Sore
    // 18:00 - 24:00 = Selamat Malam
    
    if (hour >= 0 && hour < 10) {
      return "Selamat Pagi";
    } else if (hour >= 10 && hour < 15) {
      return "Selamat Siang";
    } else if (hour >= 15 && hour < 18) {
      return "Selamat Sore";
    } else {
      return "Selamat Malam";
    }
  };

  const formatDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[wibTime.getDay()]}, ${wibTime.getDate()} ${months[wibTime.getMonth()]} ${wibTime.getFullYear()}`;
  };

  const formatTime = () => {
    const hours = wibTime.getHours().toString().padStart(2, '0');
    const minutes = wibTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} WIB`;
  };

  const handleStatCardClick = (cardType) => {
    switch(cardType) {
      case 'totalMentees':
        navigate('/mentor/daftar-peserta');
        break;
      case 'pendingReviews':
        navigate('/mentor/validasi-tugas');
        break;
      case 'totalSubmittedTasks':
        navigate('/mentor/daftar-tugas');
        break;
      default:
        break;
    }
  };

  const quickActions = [
    { icon: PlusCircle, label: "Tambah Materi", link: "/mentor/add-materi" },
    { icon: ClipboardList, label: "Buat Tugas", link: "/mentor/add-tugas" },
    { icon: Users, label: "Lihat Peserta", link: "/mentor/daftar-peserta" },
    { icon: Award, label: "Input Nilai", link: "/mentor/input-nilai-manual" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
        <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
              <div>
                <div className="w-48 h-8 bg-slate-200 rounded animate-pulse mb-1"></div>
                <div className="w-32 h-3 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
          <SkeletonAlert />
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-slate-200 rounded-full"></div>
              <div className="w-24 h-3 bg-slate-200 rounded"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1,2,3,4].map(i => <div key={i} className="h-9 bg-slate-200 rounded-lg animate-pulse"></div>)}
            </div>
          </div>
          <SkeletonParticipantList />
        </div>
      </div>
    );
  }

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
                    <span className="text-xs text-slate-500">{formatTime()}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">Mentor Panel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div onClick={() => handleStatCardClick('totalMentees')} className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border border-slate-100">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-semibold text-emerald-700">Aktif</span>
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-slate-800">{stats.totalMentees}</p>
                <p className="text-xs text-slate-500 mt-1">Peserta Bimbingan</p>
              </div>
            </div>
          </div>

          <div onClick={() => handleStatCardClick('pendingReviews')} className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border border-slate-100">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 rounded-full">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span className="text-[10px] font-semibold text-amber-700">Perlu Aksi</span>
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-slate-800">{stats.pendingReviews}</p>
                <p className="text-xs text-slate-500 mt-1">Tugas Belum Dikumpul</p>
              </div>
              {stats.pendingReviews === 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-emerald-600">Semua tugas sudah dikumpulkan</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div onClick={() => handleStatCardClick('totalSubmittedTasks')} className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border border-slate-100">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 rounded-full">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-semibold text-emerald-700">Terkumpul</span>
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-600">{stats.totalSubmittedTasks}</p>
                <p className="text-xs text-slate-500 mt-1">Tugas Sudah Dikumpulkan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deadline & Tugas Aktif - Dengan warna teal/biru konsisten */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-gradient-to-b from-teal-500 to-blue-600 rounded-full"></div>
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Deadline & Tugas Aktif</h3>
          </div>
          
          {deadlineTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {deadlineTasks.map((task, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/mentor/validasi-tugas/${task.id}`)}
                  className="bg-gradient-to-br from-white to-slate-50 rounded-lg shadow-sm border-l-4 border-teal-500 p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                        <Calendar size="12" className="text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                          {task.judul}
                        </p>
                        <p className="text-[9px] font-medium text-slate-500">
                          Deadline: {task.deadlineText}
                        </p>
                      </div>
                    </div>
                    <button className="text-[10px] text-teal-600 font-medium flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-teal-50 transition-colors">
                      Detail <ChevronRight size={10} />
                    </button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] text-slate-600">Progress Pengumpulan</span>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-600">
                        {task.submittedCount}/{task.totalSubmissions} peserta
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-teal-500" 
                        style={{ width: `${task.totalSubmissions > 0 ? (task.submittedCount / task.totalSubmissions) * 100 : 0}%` }}
                      ></div>
                    </div>
                    {task.submittedCount === 0 && task.isUrgent && (
                      <p className="text-[9px] text-orange-600 mt-1.5 flex items-center gap-1">
                        <AlertTriangle size={8} />
                        Belum ada yang mengumpulkan, segera tindak lanjuti
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-4 text-center border border-slate-100">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-slate-500 text-xs">Tidak ada tugas aktif</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Semua tugas sudah selesai atau belum ada tugas</p>
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
                  <p className="text-[9px] text-slate-500">Daftar peserta magang bimbingan Anda</p>
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
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 truncate">
                        {participant.universitas !== "-" ? participant.universitas : "Universitas tidak tersedia"}
                      </p>
                      {participant.jurusan && participant.jurusan !== "-" && (
                        <p className="text-[10px] text-slate-500 truncate">
                          {participant.jurusan}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        {participant.periode !== "-" ? participant.periode : "Periode tidak tersedia"}
                      </p>
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
      </div>
    </div>
  );
}

export default MentorDashboard;