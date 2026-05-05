// src/pages/mentor/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  PieChart,
  Shield,
  Rocket,
  Gift,
  PlusCircle,
  Award,
  Eye,
  MessageSquare,
  AlertTriangle,
  GraduationCap,
  Activity,
  CheckSquare,
  XCircle,
  Sparkles,
  Gem,
  Crown,
  Medal
} from "lucide-react";

function MentorDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [stats, setStats] = useState({
    totalMentees: 12,
    pendingReviews: 5,
    approachingDeadline: 4,
    presentToday: 8,
    absentToday: 4,
    completedTasks: 28,
    averageScore: 87.5,
    attendanceRate: 94
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState([65, 72, 78, 82, 75, 88, 92]);

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
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:8000/api/mentor/dashboard", {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setRecentActivities(data.recentActivities || []);
          setPendingReviews(data.pendingReviews || []);
          setUpcomingDeadlines(data.upcomingDeadlines || []);
          setRecentParticipants(data.recentParticipants || []);
          setNotifications(data.notifications || []);
        }
      } else {
        setStats({
          totalMentees: 12,
          pendingReviews: 5,
          approachingDeadline: 4,
          presentToday: 8,
          absentToday: 4,
          completedTasks: 28,
          averageScore: 87.5,
          attendanceRate: 94
        });
        setRecentActivities([
          { id: 1, user: "Ahmad Firmansyah", action: "Mengumpulkan tugas Frontend Development", time: "2 jam lalu", type: "tugas", status: "pending" },
          { id: 2, user: "Siti Nurhaliza", action: "Menyelesaikan quiz React Basic", time: "5 jam lalu", type: "quiz", score: 92 },
          { id: 3, user: "Budi Santoso", action: "Check-in hari ini", time: "08:15 WIB", type: "presensi", status: "hadir" },
          { id: 4, user: "Dewi Lestari", action: "Merevisi tugas UI/UX", time: "kemarin", type: "revisi" },
        ]);
        setPendingReviews([
          { id: 1, student_name: "Ahmad Firmansyah", task_title: "Frontend Development - Week 3", submitted_at: "2 jam lalu", deadline: "2024-12-20" },
          { id: 2, student_name: "Citra Kirana", task_title: "Backend API Integration", submitted_at: "5 jam lalu", deadline: "2024-12-19" },
          { id: 3, student_name: "Eko Prasetyo", task_title: "Database Design", submitted_at: "kemarin", deadline: "2024-12-18" },
        ]);
        setUpcomingDeadlines([
          { id: 1, title: "Tugas Mingguan - E-commerce Website", student_name: "Ahmad Firmansyah", due_date: "2 hari lagi", priority: "high" },
          { id: 2, title: "Laporan Akhir Magang", student_name: "Siti Nurhaliza", due_date: "5 hari lagi", priority: "medium" },
          { id: 3, title: "Quiz JavaScript Lanjutan", student_name: "Budi Santoso", due_date: "besok", priority: "high" },
        ]);
        setRecentParticipants([
          { id: 1, name: "Ahmad Firmansyah", status: "active", progress: 75, attendance: 90, divisi: "Frontend", rank: "diamond" },
          { id: 2, name: "Siti Nurhaliza", status: "active", progress: 85, attendance: 95, divisi: "Backend", rank: "diamond" },
          { id: 3, name: "Budi Santoso", status: "active", progress: 60, attendance: 80, divisi: "UI/UX", rank: "silver" },
          { id: 4, name: "Dewi Lestari", status: "active", progress: 70, attendance: 85, divisi: "Mobile", rank: "gold" },
        ]);
        setNotifications([
          { id: 1, title: "Tugas Baru Dikumpulkan", message: "Ahmad Firmansyah mengumpulkan tugas Frontend", time: "2 jam lalu", is_read: false },
          { id: 2, title: "Reminder Review", message: "Ada 3 tugas perlu direview", time: "5 jam lalu", is_read: false },
          { id: 3, title: "Revisi Tugas", message: "Dewi Lestari merevisi tugas UI/UX", time: "kemarin", is_read: true },
        ]);
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
    return gradients[rank] || "from-teal-500 to-emerald-500";
  };

  const getRankIcon = (rank) => {
    if (rank === "diamond") return <Gem size="10" className="text-cyan-400" />;
    if (rank === "gold") return <Crown size="10" className="text-amber-400" />;
    return <Medal size="10" className="text-slate-400" />;
  };

  const quickActions = [
    { icon: PlusCircle, label: "Tambah Materi", link: "/mentor/add-materi" },
    { icon: ClipboardList, label: "Buat Tugas", link: "/mentor/add-tugas" },
    { icon: Users, label: "Lihat Peserta", link: "/mentor/peserta" },
    { icon: Award, label: "Input Nilai", link: "/mentor/penilaian-manual" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-teal-400/30 border-t-teal-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <p className="text-slate-500 mt-4 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      {/* Background Decoration Premium */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400 rounded-full blur-3xl opacity-30"></div>
      </div>
      
      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header Section Premium */}
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

        {/* Stats Cards Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 - Total Peserta */}
          <div className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
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
          <div className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
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
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                    <span className="text-[10px] text-slate-400">Tugas</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-600">Belum Dinilai</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - Deadline Mendekat */}
          <div className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-red-50 rounded-full">
                  <Timer className="w-2.5 h-2.5 text-red-500" />
                  <span className="text-[10px] font-semibold text-red-600">Mendesak</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-800">{stats.approachingDeadline}</p>
                <p className="text-xs text-slate-500">Tugas Mendekati Deadline</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
                    <span className="text-[10px] text-slate-400">Deadline</span>
                  </div>
                  <span className="text-[10px] font-semibold text-red-600">&lt; 3 hari</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 - Kehadiran Hari Ini */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <Activity className="w-2.5 h-2.5 text-white" />
                  <span className="text-[10px] font-semibold text-white">Hari Ini</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{stats.presentToday}/{stats.totalMentees}</p>
                <p className="text-xs text-white/80">Hadir hari ini</p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-10 bg-white/30 rounded-full"></div>
                    <span className="text-[10px] text-white/70">Absen</span>
                  </div>
                  <span className="text-[10px] font-semibold text-white/90">{stats.absentToday} belum hadir</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Premium */}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Tugas Perlu Review */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
            <div className="relative h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-md">Perlu Review</h3>
                    <p className="text-[10px] text-slate-400">Tugas menunggu penilaian Anda</p>
                  </div>
                </div>
                <Link to="/mentor/validasi-tugas" className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors">
                  Lihat semua <ChevronRight size={12} />
                </Link>
              </div>
              
              <div className="space-y-3">
                {pendingReviews.slice(0, 3).map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all duration-200">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                        <FileText size={16} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">{task.task_title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500">{task.student_name}</span>
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Dikumpulkan {task.submitted_at}</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200">
                      Review
                    </button>
                  </div>
                ))}
                {pendingReviews.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle size={36} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Semua tugas sudah direview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifikasi */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
            <div className="relative h-1.5 bg-gradient-to-r from-teal-500 to-blue-600"></div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-md">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-md">Notifikasi</h3>
                  <p className="text-[10px] text-slate-400">Update aktivitas terbaru</p>
                </div>
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="ml-auto text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {notifications.filter(n => !n.is_read).length} baru
                  </span>
                )}
              </div>
              
              <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scroll">
                {notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div key={idx} className={`p-3 rounded-xl transition-all duration-200 ${!notif.is_read ? 'bg-teal-50/50 border-l-2 border-teal-500' : 'hover:bg-slate-50'}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${!notif.is_read ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-700">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{notif.message}</p>
                          <p className="text-[9px] text-slate-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Tidak ada notifikasi</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Statistik Kehadiran */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
            <div className="relative h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-md">Statistik Kehadiran</h3>
                    <p className="text-[10px] text-slate-400">7 hari terakhir</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-medium text-blue-600">+8% dari minggu lalu</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-end justify-between h-32 gap-2">
                  {weeklyAttendance.map((value, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-lg transition-all duration-500 hover:scale-105" 
                           style={{ height: `${value * 0.8}px` }}></div>
                      <span className="text-[9px] text-slate-500">{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][idx]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-500">Hadir: {stats.presentToday}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-500">Terlambat: 2</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-500">Absen: {stats.absentToday}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-teal-600">Kehadiran: {Math.round((stats.presentToday / stats.totalMentees) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deadline Penting */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
            <div className="relative h-1.5 bg-gradient-to-r from-red-500 to-pink-500"></div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-md">Deadline Mendesak</h3>
                    <p className="text-[10px] text-slate-400">Tugas perlu perhatian segera</p>
                  </div>
                </div>
                <Link to="/mentor/tugas" className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors">
                  Lihat semua <ChevronRight size={12} />
                </Link>
              </div>
              
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 3).map((deadline, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-red-50/30 hover:bg-red-50 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-red-600">
                          {deadline.due_date === "besok" ? "1" : deadline.due_date.split(' ')[0]}
                        </span>
                        <span className="text-[8px] text-red-500">hari</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{deadline.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{deadline.student_name}</p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-red-100 rounded-full">
                      <span className="text-[9px] font-semibold text-red-600 uppercase">
                        {deadline.priority === "high" ? "Mendesak" : "Segera"}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingDeadlines.length === 0 && (
                  <div className="text-center py-8">
                    <ThumbsUp size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Tidak ada deadline mendesak</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Peserta Singkat */}
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
              <Link to="/mentor/peserta" className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors">
                Lihat semua <ChevronRight size={12} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentParticipants.map((participant, idx) => {
                const rankGradient = getRankGradient(participant.rank);
                return (
                  <Link key={idx} to={`/mentor/peserta/${participant.id}`}>
                    <div className="p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${rankGradient} flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform`}>
                            {participant.name.charAt(0)}
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
                            <span className="font-semibold text-teal-600">{participant.progress}%</span>
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
                          <span className="text-[10px] font-semibold text-emerald-600">{participant.attendance}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default MentorDashboard;