import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  getAllDivisi,
  getAttendanceStatistics,
  getAllQuizResults,
  getRecentActivityLogs,
  getBelumAbsenHariIni
} from "../../api/coo/dashboardService";
import {
  Users,
  UserCheck,
  Building2,
  Bell,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  Timer,
  Brain,
  BarChart,
  X,
  TrendingUp,
  Users as UsersIcon
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [peserta, setPeserta] = useState([]);
  const [mentor, setMentor] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizProgress, setQuizProgress] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    hadir: 0,
    terlambat: 0,
    absen: 0,
    persentase: 0
  });
  const [belumAbsen, setBelumAbsen] = useState([]);
  
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success"
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    
    try {
      const results = await Promise.allSettled([
        getAllUsers(),
        getAllDivisi(),
        getAttendanceStatistics(),
        getAllQuizResults(),
        getRecentActivityLogs(10),
        getBelumAbsenHariIni()
      ]);
      
      console.log("=== Dashboard Data Fetch Results ===");
      
      // Process Users Data
      const usersResult = results[0];
      if (usersResult.status === 'fulfilled' && usersResult.value?.data && usersResult.value.data.length > 0) {
        const usersData = usersResult.value.data;
        const formattedUsers = usersData.map(user => ({
          id: user.id,
          name: user.name || "Pengguna",
          email: user.email,
          role: user.role?.toLowerCase() || "peserta",
          divisi: user.divisi || "Umum",
          status: user.status === true,
          createdAt: user.created_at
        }));
        setUsers(formattedUsers);
        setPeserta(formattedUsers.filter(u => u.role === "peserta"));
        setMentor(formattedUsers.filter(u => u.role === "mentor"));
      } else {
        setPeserta([]);
        setMentor([]);
      }
      
      // Process Divisi Data
      const divisiResult = results[1];
      if (divisiResult.status === 'fulfilled' && divisiResult.value) {
        const divisiData = Array.isArray(divisiResult.value) ? divisiResult.value : (divisiResult.value.data || []);
        setDivisiList(divisiData);
      } else {
        setDivisiList([]);
      }
      
      // Process Attendance Data
      const attendanceResult = results[2];
      if (attendanceResult.status === 'fulfilled' && attendanceResult.value?.success && attendanceResult.value?.data) {
        setAttendanceData(attendanceResult.value.data);
      } else {
        setAttendanceData({ hadir: 0, terlambat: 0, absen: 0, persentase: 0 });
      }
      
      // Process Quiz Data - NEW LOGIC: Progress Learning berdasarkan level yang lulus
      const quizResult = results[3];
      if (quizResult.status === 'fulfilled' && quizResult.value) {
        let userProgressData = null;
        
        if (Array.isArray(quizResult.value)) {
          userProgressData = quizResult.value;
        } else if (quizResult.value.data && Array.isArray(quizResult.value.data)) {
          userProgressData = quizResult.value.data;
        } else if (quizResult.value.results && Array.isArray(quizResult.value.results)) {
          userProgressData = quizResult.value.results;
        }
        
        console.log("User Progress Data:", userProgressData);
        
        if (userProgressData && userProgressData.length > 0) {
          // Kelompokkan berdasarkan divisi untuk menghitung rata-rata progress
          const divisiProgressMap = {};
          
          userProgressData.forEach(user => {
            const divisi = user.divisi || "Umum";
            const progress = user.progress || 0;
            
            if (!divisiProgressMap[divisi]) {
              divisiProgressMap[divisi] = {
                totalProgress: 0,
                count: 0,
                completedUsers: 0
              };
            }
            
            divisiProgressMap[divisi].totalProgress += progress;
            divisiProgressMap[divisi].count++;
            if (progress >= 100) {
              divisiProgressMap[divisi].completedUsers++;
            }
          });
          
          // Hitung rata-rata progress per divisi
          const progressArray = Object.entries(divisiProgressMap).map(([name, data]) => {
            const avgProgress = data.count > 0 ? Math.round(data.totalProgress / data.count) : 0;
            
            return {
              name: name.toUpperCase(),
              progress: avgProgress,
              totalUsers: data.count,
              completedUsers: data.completedUsers,
              color: avgProgress >= 80 ? "emerald" : avgProgress >= 50 ? "blue" : "gray"
            };
          });
          
          // Urutkan berdasarkan progress tertinggi
          progressArray.sort((a, b) => b.progress - a.progress);
          
          console.log("Divisi Progress:", progressArray);
          setQuizProgress(progressArray);
        } else {
          setQuizProgress([]);
        }
      } else {
        setQuizProgress([]);
      }
      
      // Process Activities Data
      const activitiesResult = results[4];
      if (activitiesResult.status === 'fulfilled' && activitiesResult.value?.success && activitiesResult.value?.data && activitiesResult.value.data.length > 0) {
        // Tidak digunakan, hanya untuk konsumsi
      }
      
      // Process Belum Absen Data
      const belumAbsenResult = results[5];
      if (belumAbsenResult.status === "fulfilled" && belumAbsenResult.value?.success) {
        setBelumAbsen(belumAbsenResult.value.data || []);
      } else {
        setBelumAbsen([]);
      }
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setPeserta([]);
      setMentor([]);
      setDivisiList([]);
      setAttendanceData({ hadir: 0, terlambat: 0, absen: 0, persentase: 0 });
      setQuizProgress([]);
      setBelumAbsen([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const totalDivisi = Array.isArray(divisiList) ? divisiList.length : 0;
  const totalMentor = mentor.length;
  const totalPeserta = peserta.length;

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 3 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  const filteredBelumAbsen = belumAbsen.slice(0, 5);

  const handleNavigateToDataManagement = () => {
    navigate("/coo/data-management");
  };

  const handleNavigateToPresensi = () => {
    navigate("/coo/presensi");
  };

  const handleNavigateToQuiz = () => {
  navigate("/coo/daftar-hasil-kuis");
};

  const handleNavigateToDetailPeserta = (pesertaId) => {
    navigate(`/coo/peserta/${pesertaId}/detail`);
  };

  const handleRemindAll = () => {
    setToast({
      show: true,
      message: "Berhasil mengingatkan semua peserta yang belum absen",
      type: "success"
    });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleRemindPeserta = (pesertaName) => {
    setToast({
      show: true,
      message: `Berhasil mengingatkan ${pesertaName}`,
      type: "success"
    });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Skeleton Components
  const SkeletonCard = () => (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 rounded w-20"></div>
        <div className="h-4 bg-slate-200 rounded w-28"></div>
      </div>
    </div>
  );

  const SkeletonAttendance = () => (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        <div>
          <div className="h-5 bg-slate-200 rounded w-40 mb-1"></div>
          <div className="h-3 bg-slate-200 rounded w-32"></div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-36 h-36 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="flex justify-between mb-1.5">
                <div className="h-4 bg-slate-200 rounded w-32"></div>
                <div className="h-4 bg-slate-200 rounded w-8"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SkeletonQuiz = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        <div>
          <div className="h-5 bg-slate-200 rounded w-32 mb-1"></div>
          <div className="h-3 bg-slate-200 rounded w-36"></div>
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div className="flex justify-between mb-1.5">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-4 bg-slate-200 rounded w-12"></div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
        <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="mb-8 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
              <div>
                <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-32"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <SkeletonAttendance />
            <SkeletonQuiz />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                <div>
                  <div className="h-5 bg-slate-200 rounded w-40 mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <div className="w-9 h-9 bg-slate-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-emerald-500 text-white min-w-[280px]">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast({ show: false, message: "", type: "" })} className="ml-auto hover:opacity-80">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
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
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-xs text-slate-500">Live Monitoring</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">Ecosystem Real-time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div onClick={handleNavigateToDataManagement} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="relative p-6">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{totalPeserta}</p>
                <p className="text-sm text-slate-500">Total Peserta</p>
              </div>
            </div>
          </div>

          <div onClick={() => navigate("/coo/data-management", { state: { activeTab: "mentor" } })} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="relative p-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 mb-4">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{totalMentor}</p>
                <p className="text-sm text-slate-500">Total Mentor</p>
              </div>
            </div>
          </div>

          <div onClick={() => navigate("/coo/data-management", { state: { activeTab: "divisi" } })} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className="relative p-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 mb-4">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{totalDivisi}</p>
                <p className="text-sm text-slate-500">Total Divisi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Attendance Analytics */}
          <div onClick={handleNavigateToPresensi} className="lg:col-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 cursor-pointer">
            <div className="relative h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-md">
                    <BarChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Kehadiran Hari Ini</h3>
                    <p className="text-xs text-slate-400">Distribusi kehadiran peserta</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
                  <span className="text-[11px] font-medium text-indigo-600">Klik detail</span>
                  <ArrowRight size={12} className="text-indigo-500" />
                </div>
              </div>
              
              {attendanceData.persentase === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BarChart size={28} className="text-indigo-400" />
                  </div>
                  <p className="text-slate-600 font-medium">Belum Ada Data Kehadiran</p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#attendanceGradient)" strokeWidth="10" strokeDasharray={`${attendanceData.persentase * 2.64} ${264 - attendanceData.persentase * 2.64}`} strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 50 50)" />
                      <defs>
                        <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                      <text x="50" y="48" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-slate-800">{attendanceData.persentase}</text>
                      <text x="50" y="64" textAnchor="middle" dominantBaseline="middle" className="text-[9px] fill-slate-400">%</text>
                    </svg>
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm text-slate-600">Hadir Tepat Waktu</span>
                        <span className="text-sm font-bold text-emerald-600">{attendanceData.hadir}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${attendanceData.hadir}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm text-slate-600">Terlambat</span>
                        <span className="text-sm font-bold text-amber-600">{attendanceData.terlambat}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${attendanceData.terlambat}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm text-slate-600">Tidak Hadir</span>
                        <span className="text-sm font-bold text-rose-600">{attendanceData.absen}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${attendanceData.absen}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

                  {/* Quiz Results Card */}
        <div onClick={handleNavigateToQuiz} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 cursor-pointer">
          <div className="relative h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Hasil Kuis</h3>
                  <p className="text-xs text-slate-400">Perkembangan per divisi</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
                <BarChart3 className="w-3 h-3 text-purple-500" />
                <span className="text-[11px] font-medium text-purple-600">Klik detail</span>
                <ArrowRight size={12} className="text-purple-500" />
              </div>
            </div>
              
              {quizProgress.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Brain size={28} className="text-purple-400" />
                  </div>
                  <p className="text-slate-600 font-medium">Belum Ada Data Progress</p>
                  <p className="text-xs text-slate-400 mt-1">Data akan muncul setelah peserta mengerjakan kuis</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {quizProgress.slice(0, 4).map((div, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${div.color === 'emerald' ? 'bg-emerald-500' : div.color === 'blue' ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                          <span className="text-sm font-semibold text-slate-700">{div.name}</span>
                        </div>
                        <span className={`text-base font-bold ${div.color === 'emerald' ? 'text-emerald-600' : div.color === 'blue' ? 'text-blue-600' : 'text-slate-500'}`}>
                          {div.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${div.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : div.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-slate-400 to-slate-500'}`} style={{ width: `${div.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Belum Absen */}
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
                  <p className="text-[10px] text-slate-400">{filteredBelumAbsen.length} peserta perlu diingatkan</p>
                </div>
              </div>
              <button onClick={handleRemindAll} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-white text-[11px] font-medium transition-all duration-200 shadow-md">
                <Bell size={12} />
                Ingatkan Semua
              </button>
            </div>
          </div>
          
          {filteredBelumAbsen.length === 0 ? (
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
                  {filteredBelumAbsen.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all duration-200">
                      <td onClick={() => handleNavigateToDetailPeserta(u.id_peserta)} className="px-6 py-3 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shadow-md">
                            {u.nama?.charAt(0) || "U"}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">{u.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm text-slate-600">{u.divisi || "-"}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                          <span className="text-rose-600 text-xs font-medium">Belum Absen</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <button onClick={() => handleRemindPeserta(u.nama)} className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 font-medium text-[11px] transition-all px-3 py-1.5 rounded-lg">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;