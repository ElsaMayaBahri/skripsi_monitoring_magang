// DetailMentor.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
  UserCheck,
  Phone,
  Users,
  Briefcase,
  ChevronRight
} from "lucide-react";
import {
  getDetailMentor,
  getPesertaBimbingan
} from "../../api/coo/detailMentorService";

function DetailMentor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [detailMentor, setDetailMentor] = useState(null);
  const [pesertaBimbingan, setPesertaBimbingan] = useState([]);
  
  // Track loading per section
  const [loadingStates, setLoadingStates] = useState({
    detail: true,
    bimbingan: true
  });

  // Fetch semua data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      const promises = [
        getDetailMentor(id).then(res => {
          if (res && res.success && res.data) {
            setDetailMentor(res.data);
          }
          setLoadingStates(prev => ({ ...prev, detail: false }));
        }).catch(err => {
          console.error("Detail error:", err);
          setLoadingStates(prev => ({ ...prev, detail: false }));
          setError("Gagal memuat data mentor");
        }),
        
        getPesertaBimbingan(id).then(res => {
          let data = [];
          if (res && res.success && res.data) {
            data = res.data;
          } else if (res && Array.isArray(res)) {
            data = res;
          }
          setPesertaBimbingan(data);
          setLoadingStates(prev => ({ ...prev, bimbingan: false }));
        }).catch(err => {
          console.error("Bimbingan error:", err);
          setLoadingStates(prev => ({ ...prev, bimbingan: false }));
        })
      ];
      
      await Promise.allSettled(promises);
      setLoading(false);
    };
    
    if (id) {
      fetchAllData();
    }
  }, [id]);

  const getStatusBadge = (status) => {
    const isAktif = status === "aktif" || status === "active" || status === true;
    if (isAktif) {
      return { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle size={12} />, text: "Aktif" };
    }
    return { color: "bg-red-100 text-red-700", icon: <XCircle size={12} />, text: "Nonaktif" };
  };

  // Fungsi untuk mendapatkan inisial dari nama
  const getInitials = (name) => {
    if (!name || name === "No Name" || name === "-") return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Handle kembali ke data management dengan tab mentor
  const handleBack = () => {
    navigate("/coo/data-management", { state: { activeTab: "mentor" } });
  };

  if (loading && loadingStates.detail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
          <p className="text-slate-500 text-sm">Memuat data mentor...</p>
        </div>
      </div>
    );
  }

  if (error || !detailMentor) {
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
              <p className="text-slate-500 mb-6">{error || "Data mentor tidak ditemukan"}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all w-full"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(detailMentor.status);
  const userInitial = getInitials(detailMentor.nama);
  const hasFoto = detailMentor.foto && detailMentor.foto !== null && detailMentor.foto !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      
      {/* HEADER */}
      <div className="relative h-52 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-b-3xl shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-6 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Kembali ke Data Management</span>
          </button>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              {hasFoto ? (
                <img 
                  src={detailMentor.foto} 
                  alt={detailMentor.nama}
                  className="relative w-24 h-24 rounded-2xl object-cover shadow-xl border-4 border-white"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white"><span class="text-3xl font-bold text-teal-600">${userInitial}</span></div>`;
                  }}
                />
              ) : (
                <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                  <span className="text-3xl font-bold text-teal-600">{userInitial}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{detailMentor.nama}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <Mail size={12} />
                  {detailMentor.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        
        {/* PROFILE CARD - Info Mentor */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-slate-700 break-all mt-1">{detailMentor.email || "-"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Divisi</p>
                  <p className="text-sm font-medium text-slate-700 break-words mt-1">{detailMentor.divisi || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Jabatan</p>
                  <p className="text-sm font-medium text-slate-700 break-words mt-1">{detailMentor.jabatan || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Jumlah Bimbingan</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">{pesertaBimbingan.length} Peserta</p>
                </div>
              </div>
              
              {detailMentor.phone && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">No. Telepon</p>
                    <p className="text-sm font-medium text-slate-700 break-words mt-1">{detailMentor.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TAB PESERTA BIMBINGAN */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/50">
            <button
              className="px-6 py-4 text-sm font-semibold text-teal-600 border-b-2 border-teal-600 bg-white flex items-center gap-2"
            >
              <Users size={16} />
              Peserta Bimbingan
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-teal-500" />
                Daftar Peserta Bimbingan
              </h3>
              <div className="px-3 py-1.5 bg-teal-50 rounded-lg">
                <span className="text-xs font-medium text-teal-600">Total: {pesertaBimbingan.length} peserta</span>
              </div>
            </div>
            {loadingStates.bimbingan ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                      <div>
                        <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-slate-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : pesertaBimbingan.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl">
                <Users size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Belum ada peserta bimbingan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pesertaBimbingan.map((peserta, idx) => {
                  const pesertaInitial = getInitials(peserta.nama);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => navigate(`/coo/peserta/${peserta.id}/detail`)}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-teal-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                          {pesertaInitial}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{peserta.nama}</p>
                          <p className="text-xs text-slate-400">{peserta.divisi}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight size={16} className="text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailMentor;