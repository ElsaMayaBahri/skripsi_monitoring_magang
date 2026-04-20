import React, { useState, useEffect } from "react";
import { getUsers } from "../../utils/storage";
import {
  Users,
  UserCheck,
  Building2,
  Activity,
  Bell,
  FileText,
  UserPlus,
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
  Shield,
  Crown,
  Rocket,
  Heart,
  Coffee,
  Sun,
  Moon,
  Cloud,
  BarChart3,
  PieChart,
  Layers,
  Grid3x3,
  CircleDot,
  Timer,
  ThumbsUp,
  Gift,
  Gem
} from "lucide-react";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchedUsers = getUsers();
    if (fetchedUsers.length === 0) {
      setUsers(sampleUsers);
    } else {
      setUsers(fetchedUsers);
    }
  }, []);

  const peserta = users.filter((u) => u.role === "peserta");
  const mentor = users.filter((u) => u.role === "mentor");
  const totalDivisi = [...new Set(users.map((u) => u.divisi))].length;

  const divisiProgress = [
    { name: "SCHOOL DESIGN", progress: 100, status: "Selesai", color: "emerald", students: 45, icon: <Gem size={12} /> },
    { name: "CREATIVE TECHNOLOGY", progress: 64, status: "Berjalan", color: "blue", students: 38, icon: <Rocket size={12} /> },
    { name: "FINANCE", progress: 10, status: "Belum Mulai", color: "gray", students: 22, icon: <Target size={12} /> }
  ];

  const recentActivities = [
    { user: "Budi Santoso", action: "Menyelesaikan kuis", time: "2 menit lalu", type: "success", detail: "Skor 92/100" },
    { user: "Sarah Wijaya", action: "Mengunggah materi baru", time: "45 menit lalu", type: "info", detail: "Modul UX Research" },
    { user: "Divisi UI/UX", action: "Presensi di bawah 80%", time: "3 jam lalu", type: "warning", detail: "73% kehadiran" },
    { user: "Andi Saputra", action: "Mendapatkan sertifikat", time: "5 jam lalu", type: "success", detail: "Top Performer" }
  ];

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    return "Selamat Malam";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* ===== HEADER SECTION ===== */}
        <div className="mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    {getCurrentGreeting()}, COO!
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Ecosystem monitoring real-time
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari peserta, mentor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-56 text-xs text-slate-700 shadow-sm"
                />
              </div>
              
              <div className="relative cursor-pointer">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  {mentor.length > 0 ? mentor[0]?.name?.charAt(0) || "C" : "C"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-0.5 px-2 py-1 bg-emerald-50 rounded-full">
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600">+12%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{peserta.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Peserta Aktif</p>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-8 bg-blue-500 rounded-full"></div>
                  <span className="text-[10px] text-slate-400">+{Math.floor(peserta.length * 0.12)} dari bulan lalu</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-0.5 px-2 py-1 bg-emerald-50 rounded-full">
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600">+2</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{mentor.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Mentor Aktif</p>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-6 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] text-slate-400">Rasio 1:{Math.ceil(peserta.length / mentor.length) || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-0.5 px-2 py-1 bg-slate-100 rounded-full">
                  <Star className="w-2.5 h-2.5 text-slate-500" />
                  <span className="text-[10px] font-semibold text-slate-600">Stabil</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{totalDivisi}</p>
              <p className="text-xs text-slate-500 mt-0.5">Divisi Aktif</p>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-8 bg-purple-500 rounded-full"></div>
                  <span className="text-[10px] text-slate-400">Semua divisi berjalan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== MAIN GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          
          {/* ATTENDANCE CARD */}
          <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Analisis Kehadiran</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 ml-7">Rata-rata kehadiran harian</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
                  <Eye className="w-2.5 h-2.5 text-blue-500" />
                  <span className="text-[10px] font-medium text-blue-600">Live</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-5">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#eef2ff" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="url(#gradient)" strokeWidth="8"
                      strokeDasharray="264 66"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <text x="50" y="46" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-slate-800">
                      78
                    </text>
                    <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" className="text-[7px] fill-slate-400">
                      %
                    </text>
                  </svg>
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs text-slate-600">Hadir Tepat</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">78%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: "78%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        <span className="text-xs text-slate-600">Terlambat</span>
                      </div>
                      <span className="text-xs font-semibold text-amber-600">12%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: "12%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                        <span className="text-xs text-slate-600">Absen</span>
                      </div>
                      <span className="text-xs font-semibold text-rose-600">10%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: "10%" }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="mt-5 w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 rounded-lg text-blue-600 text-xs font-medium transition-all duration-200 border border-slate-200">
                <Eye size={12} />
                Lihat Laporan Lengkap
                <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* PROGRESS CARD */}
          <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <Award className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Progress Kuis</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 ml-7">Per divisi completion rates</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-full">
                  <BarChart3 className="w-2.5 h-2.5 text-purple-500" />
                  <span className="text-[10px] font-medium text-purple-600">This Week</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {divisiProgress.map((div, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`p-1 rounded bg-${div.color}-50`}>
                          {div.icon}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{div.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold ${
                          div.color === 'emerald' ? 'text-emerald-600' : 
                          div.color === 'blue' ? 'text-blue-600' : 'text-slate-500'
                        }`}>
                          {div.progress}%
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          div.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' :
                          div.status === 'Berjalan' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {div.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          div.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                          div.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-slate-400 to-slate-500'
                        }`}
                        style={{ width: `${div.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-slate-400">{div.students} peserta</span>
                      <span className="text-[9px] text-slate-400">
                        {div.progress === 100 ? '✓ Selesai' : div.progress > 50 ? '→ On track' : '○ Tertinggal'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] text-slate-500">12 peserta belum memenuhi kriteria minimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* ACTIVITIES */}
          <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="relative h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Activity size={14} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Aktivitas Terakhir</h3>
                    <p className="text-[9px] text-slate-400">Update real-time</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] font-medium text-emerald-600">Live</span>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2 max-h-[280px] overflow-y-auto custom-scroll">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="group/item flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-all duration-200">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                    activity.type === 'info' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                  }`}>
                    {activity.type === 'success' ? <CheckCircle size={14} /> :
                     activity.type === 'info' ? <FileText size={14} /> : <AlertCircle size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-800 text-xs">{activity.user}</span>
                      <span className="text-[10px] text-slate-500">{activity.action}</span>
                    </div>
                    {activity.detail && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{activity.detail}</p>
                    )}
                    <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                      <ClockIcon size={8} />
                      {activity.time}
                    </p>
                  </div>
                  <button className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded">
                    <MoreHorizontal size={12} className="text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* TABLE - Belum Absen */}
          <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="relative h-0.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Timer size={14} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Belum Absen Hari Ini</h3>
                    <p className="text-[9px] text-slate-400">Perlu reminder</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg text-white text-[10px] font-medium transition-all duration-200 shadow-sm">
                  <Bell size={10} />
                  Ingatkan Semua
                </button>
              </div>
            </div>
            
            {peserta.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users size={24} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-400">Belum ada data peserta</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                      <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                      <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peserta.slice(0, 5).map((u, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition group cursor-pointer">
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                              {u.initials || u.name?.charAt(0) || "U"}
                            </div>
                            <span className="font-medium text-slate-800 text-xs">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-2.5">
                          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-medium">
                            {u.divisi || "-"}
                          </span>
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                            <span className="text-amber-600 text-xs">Belum Absen</span>
                          </div>
                        </td>
                        <td className="px-5 py-2.5">
                          <button className="text-blue-500 hover:text-blue-700 font-medium text-[10px] transition flex items-center gap-1 opacity-0 group-hover:opacity-100 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg">
                            <Bell size={9} />
                            Ingatkan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {peserta.length > 5 && (
              <div className="px-5 py-2 border-t border-slate-100 bg-slate-50/30">
                <button className="w-full text-center text-[10px] text-blue-500 hover:text-blue-600 font-medium py-1.5">
                  Lihat semua peserta ({peserta.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

// Sample Users
const sampleUsers = [
  { name: "Rizky Darmawan", role: "peserta", divisi: "UI/UX", mentor: "Budi Santoso", status: true, initials: "RD" },
  { name: "Anita Nur", role: "peserta", divisi: "Frontend", mentor: "Sarah Wijaya", status: true, initials: "AN" },
  { name: "Budi Santoso", role: "mentor", divisi: "UI/UX", mentor: null, status: true, initials: "BS" },
  { name: "Citra Dewi", role: "peserta", divisi: "Backend", mentor: "Andi Saputra", status: true, initials: "CD" },
  { name: "Doni Saputra", role: "peserta", divisi: "Mobile", mentor: "Eka Prasetya", status: false, initials: "DS" },
  { name: "Eka Prasetya", role: "mentor", divisi: "Mobile", mentor: null, status: true, initials: "EP" },
  { name: "Fajar Hidayat", role: "peserta", divisi: "DevOps", mentor: "Gita Lestari", status: true, initials: "FH" },
];

export default Dashboard;