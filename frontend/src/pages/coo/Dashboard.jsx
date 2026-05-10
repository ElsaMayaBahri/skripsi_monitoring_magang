import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import {
  Users,
  UserCheck,
  Building2,
  Activity,
  Bell,
  FileText,
  AlertCircle,
  Clock,
  MoreHorizontal,
  Search,
  Eye,
  TrendingUp,
  CheckCircle,
  Clock as ClockIcon,
  ArrowRight,
  Calendar,
  Award,
  Sparkles,
  Star,
  Target,
  Zap,
  BarChart3,
  Timer,
  ThumbsUp,
  Gem,
  ChevronRight,
  Brain,
  BarChart,
  PieChart,
  Shield,
  Crown,
  Rocket,
  Gift
} from "lucide-react";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [peserta, setPeserta] = useState([]);
  const [mentor, setMentor] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentActivities, setRecentActivities] = useState([]);
  const [quizProgress, setQuizProgress] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    hadir: 0,
    terlambat: 0,
    absen: 0,
    persentase: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchDivisi(),
        fetchQuizProgress(),
        fetchRecentActivities(),
        fetchAttendanceData()
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.getAllUsers();
      let usersData = [];
      
      if (response && response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response && Array.isArray(response)) {
        usersData = response;
      } else if (response && response.users && Array.isArray(response.users)) {
        usersData = response.users;
      }
      
      const formattedUsers = usersData.map(user => ({
        id: user.id || user.id_user,
        name: user.name || user.nama || user.username || "Pengguna",
        email: user.email,
        role: user.role?.toLowerCase() || "peserta",
        divisi: user.divisi || user.nama_divisi || "Umum",
        status: user.status === "aktif" || user.status === "active" || user.status === true,
        createdAt: user.created_at || user.createdAt
      }));
      
      setUsers(formattedUsers);
      setPeserta(formattedUsers.filter(u => u.role === "peserta"));
      setMentor(formattedUsers.filter(u => u.role === "mentor"));
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setPeserta([]);
      setMentor([]);
    }
  };

  const fetchDivisi = async () => {
    try {
      const response = await api.getDivisi();
      let divisiData = [];
      
      if (response.success && response.data) {
        divisiData = response.data;
      } else if (Array.isArray(response)) {
        divisiData = response;
      } else if (response.data && Array.isArray(response.data)) {
        divisiData = response.data;
      }
      
      setDivisiList(divisiData);
    } catch (error) {
      console.error("Error fetching divisi:", error);
      setDivisiList([]);
    }
  };

  const fetchQuizProgress = async () => {
    try {
      const response = await api.getQuizResultsAll();
      let resultsData = [];
      
      if (response && response.success && response.data) {
        resultsData = response.data;
      } else if (Array.isArray(response)) {
        resultsData = response;
      }
      
      const divisiProgressMap = {};
      const pesertaMap = {};
      peserta.forEach(p => {
        pesertaMap[p.id] = p.divisi;
      });
      
      resultsData.forEach(result => {
        const userId = result.user_id;
        const divisi = pesertaMap[userId] || "Umum";
        
        if (!divisiProgressMap[divisi]) {
          divisiProgressMap[divisi] = { 
            total: 0, 
            completed: 0,
            totalScore: 0,
            participants: new Set()
          };
        }
        
        divisiProgressMap[divisi].total++;
        divisiProgressMap[divisi].participants.add(userId);
        divisiProgressMap[divisi].totalScore += result.score || 0;
        
        if ((result.score || 0) >= 70) {
          divisiProgressMap[divisi].completed++;
        }
      });
      
      const progressArray = Object.entries(divisiProgressMap).map(([name, data]) => ({
        name: name.toUpperCase(),
        progress: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        avgScore: data.total > 0 ? Math.round(data.totalScore / data.total) : 0,
        status: data.total > 0 && data.completed === data.total ? "Selesai" : data.completed > 0 ? "Berjalan" : "Belum Mulai",
        color: data.total > 0 && data.completed === data.total ? "emerald" : data.completed > 0 ? "blue" : "gray",
        students: data.participants.size,
        totalSubmissions: data.total
      }));
      
      setQuizProgress(progressArray.length > 0 ? progressArray : [
        { name: "BELUM ADA DATA", progress: 0, status: "Belum Mulai", color: "gray", students: 0, totalSubmissions: 0, avgScore: 0 }
      ]);
    } catch (error) {
      console.error("Error fetching quiz progress:", error);
      setQuizProgress([{ name: "DATA TIDAK TERSEDIA", progress: 0, status: "Belum Mulai", color: "gray", students: 0, totalSubmissions: 0, avgScore: 0 }]);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await api.getActivityLogs(10);
      
      if (response && response.success && response.data) {
        setRecentActivities(response.data);
      } else {
        setRecentActivities([
          { user: "Sistem", action: "Dashboard siap digunakan", time: "Baru saja", type: "info", detail: "Selamat datang di dashboard monitoring" }
        ]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setRecentActivities([
        { user: "Sistem", action: "Dashboard aktif", time: "Baru saja", type: "info", detail: "Selamat datang" }
      ]);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await api.getPresensiStats();
      if (response && response.success && response.data) {
        setAttendanceData({
          hadir: response.data.hadir || 0,
          terlambat: response.data.terlambat || 0,
          absen: response.data.absen || 0,
          persentase: response.data.persentase || 0
        });
      } else {
        setAttendanceData({
          hadir: 0,
          terlambat: 0,
          absen: 0,
          persentase: 0
        });
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const totalDivisi = divisiList.length;
  const totalMentor = mentor.length;
  const totalPeserta = peserta.length;

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    return "Selamat Malam";
  };

  const belumAbsen = peserta.filter(p => !p.status).slice(0, 5);

  const completionRate = peserta.length > 0 ? Math.round((peserta.filter(p => p.status).length / peserta.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <p className="text-slate-500 mt-4 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header Section - Tanpa animasi */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="relative p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-slate-800 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                      {getCurrentGreeting()}, COO
                    </span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="text-xs text-slate-500">Live Monitoring</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">Ecosystem Real-time</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Cari peserta, mentor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 w-64 text-sm text-slate-700 shadow-sm transition-all"
                />
              </div>
              
              <div className="relative group cursor-pointer">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform ring-2 ring-white/20">
                  {mentor.length > 0 ? mentor[0]?.name?.charAt(0) || "C" : "C"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - 3 CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Peserta */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[11px] font-semibold text-emerald-600">Aktif</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-800">{totalPeserta}</p>
                <p className="text-sm text-slate-500">Total Peserta</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                    <span className="text-[11px] text-slate-400">Kehadiran</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600">{completionRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Mentor */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-600">+12%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-800">{totalMentor}</p>
                <p className="text-sm text-slate-500">Mentor</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                    <span className="text-[11px] text-slate-400">Rasio</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">1:{totalPeserta > 0 ? Math.ceil(totalPeserta / totalMentor) || 0 : 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Divisi */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-full">
                  <Star className="w-3 h-3 text-slate-500" />
                  <span className="text-[11px] font-semibold text-slate-600">Aktif</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-800">{totalDivisi}</p>
                <p className="text-sm text-slate-500">Divisi Aktif</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <span className="text-[11px] text-slate-400">Program</span>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-600">Berjalan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Attendance Analytics */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
            <div className="relative h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
                    <BarChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Analytics Kehadiran</h3>
                    <p className="text-xs text-slate-400">Distribusi pola kehadiran peserta</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span className="text-[11px] font-medium text-indigo-600">Real-time</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="url(#attendanceGradient)" strokeWidth="10"
                      strokeDasharray={`${attendanceData.persentase * 2.64} ${264 - attendanceData.persentase * 2.64}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <text x="50" y="48" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-slate-800">
                      {attendanceData.persentase}
                    </text>
                    <text x="50" y="64" textAnchor="middle" dominantBaseline="middle" className="text-[9px] fill-slate-400">
                      %
                    </text>
                  </svg>
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 font-medium">Hadir Tepat Waktu</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{attendanceData.hadir}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${attendanceData.hadir}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 font-medium">Terlambat</span>
                      </div>
                      <span className="text-sm font-bold text-amber-600">{attendanceData.terlambat}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${attendanceData.terlambat}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 font-medium">Tidak Hadir</span>
                      </div>
                      <span className="text-sm font-bold text-rose-600">{attendanceData.absen}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${attendanceData.absen}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 rounded-xl text-indigo-600 text-sm font-medium transition-all duration-200 border border-slate-200 group">
                <Eye size={14} />
                Lihat Laporan Lengkap
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quiz Progress */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
            <div className="relative h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Hasil Kuis</h3>
                    <p className="text-xs text-slate-400">Perkembangan per divisi (berdasarkan hasil peserta)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
                  <BarChart3 className="w-3 h-3 text-purple-500" />
                  <span className="text-[11px] font-medium text-purple-600">Analytics</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {quizProgress.slice(0, 3).map((div, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          div.color === 'emerald' ? 'bg-emerald-100' : 
                          div.color === 'blue' ? 'bg-blue-100' : 'bg-slate-100'
                        }`}>
                          <Target size={14} className={`${
                            div.color === 'emerald' ? 'text-emerald-600' : 
                            div.color === 'blue' ? 'text-blue-600' : 'text-slate-400'
                          }`} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{div.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          div.color === 'emerald' ? 'text-emerald-600' : 
                          div.color === 'blue' ? 'text-blue-600' : 'text-slate-500'
                        }`}>
                          {div.progress}%
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          div.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' :
                          div.status === 'Berjalan' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {div.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          div.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                          div.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-slate-400 to-slate-500'
                        }`}
                        style={{ width: `${div.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400">{div.students} peserta</span>
                        <span className="text-[10px] text-slate-400">{div.totalSubmissions} submission</span>
                      </div>
                      <span className="text-[10px] font-medium text-purple-600">
                        Rata-rata: {div.avgScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <span className="text-[11px] text-slate-500">
                    {quizProgress.filter(q => q.progress < 100 && q.progress > 0).length} divisi dalam proses
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
            <div className="relative h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                    <Activity size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-md">Aktivitas Terbaru</h3>
                    <p className="text-[10px] text-slate-400">Semua aktivitas CRUD tercatat</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[11px] font-medium text-emerald-600">Live</span>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3 max-h-[340px] overflow-y-auto custom-scroll">
              {recentActivities.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Belum ada aktivitas</p>
                </div>
              ) : (
                recentActivities.map((activity, idx) => (
                  <div key={idx} className="group/item flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                      activity.type === 'info' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                      {activity.type === 'success' ? <CheckCircle size={16} /> :
                       activity.type === 'info' ? <FileText size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{activity.user}</span>
                        <span className="text-xs text-slate-500">{activity.action}</span>
                      </div>
                      {activity.detail && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{activity.detail}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <ClockIcon size={9} />
                        {activity.time}
                      </p>
                    </div>
                    <button className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 hover:bg-slate-200 rounded-lg">
                      <MoreHorizontal size={14} className="text-slate-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Missing Attendance Table - Warna ungu seperti card lain */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
            <div className="relative h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <Timer size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-md">Belum Absen Hari Ini</h3>
                    <p className="text-[10px] text-slate-400">Perlu perhatian segera</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-white text-[11px] font-medium transition-all duration-200 shadow-md">
                  <Bell size={12} />
                  Ingatkan Semua
                </button>
              </div>
            </div>
            
            {peserta.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users size={28} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">Belum ada data peserta</p>
              </div>
            ) : belumAbsen.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} className="text-emerald-500" />
                </div>
                <p className="text-base text-slate-700 font-semibold">Semua peserta sudah absen!</p>
                <p className="text-xs text-slate-400 mt-1">Kehadiran hari ini lengkap</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {belumAbsen.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-all duration-200 group cursor-pointer">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shadow-md">
                              {u.name?.charAt(0) || "U"}
                            </div>
                            <span className="font-semibold text-slate-800 text-sm">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-medium">
                            {u.divisi || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-amber-600 text-xs font-medium">Belum Absen</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <button className="text-indigo-600 hover:text-indigo-700 font-medium text-[11px] transition-all flex items-center gap-1.5 opacity-0 group-hover:opacity-100 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg">
                            <Bell size={10} />
                            Ingatkan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {peserta.length > 5 && belumAbsen.length > 5 && (
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/30">
                <button className="w-full text-center text-[11px] text-indigo-600 hover:text-indigo-700 font-medium py-2 transition-colors">
                  Lihat semua peserta ({peserta.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
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
          transition: background 0.2s;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;