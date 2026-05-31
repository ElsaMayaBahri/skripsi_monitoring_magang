import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  UserCheck,
  Phone,
  CalendarDays,
  RefreshCw,
  GraduationCap,
  BookOpen,
  User,
  Clock,
  Briefcase,
  IdCard,
  School,
  GraduationCap as GraduationIcon
} from "lucide-react";
import {
  getDetailPeserta
} from "../../api/coo/detailPesertaService";

function DetailPeserta() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [detailPeserta, setDetailPeserta] = useState(null);
  
  // Track loading per section
  const [loadingStates, setLoadingStates] = useState({
    detail: true
  });

  // Fetch semua data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      const promises = [
        getDetailPeserta(id).then(res => {
          if (res && res.success && res.data) {
            setDetailPeserta(res.data);
          }
          setLoadingStates(prev => ({ ...prev, detail: false }));
        }).catch(err => {
          console.error("Detail error:", err);
          setLoadingStates(prev => ({ ...prev, detail: false }));
          setError("Gagal memuat data peserta");
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Fungsi untuk mendapatkan inisial dari nama
  const getInitials = (name) => {
    if (!name || name === "No Name" || name === "-") return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Hitung durasi magang dalam bulan
  const hitungDurasi = () => {
    if (!detailPeserta?.tanggal_mulai) return "-";
    const start = new Date(detailPeserta.tanggal_mulai);
    const end = detailPeserta.tanggal_selesai ? new Date(detailPeserta.tanggal_selesai) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths > 0) return `${diffMonths} bulan`;
    return `${diffDays} hari`;
  };

  // Skeleton loading
  const SkeletonProfileCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-slate-200 rounded-2xl"></div>
          <div className="flex-1">
            <div className="h-8 bg-slate-200 rounded-lg w-48 mb-3"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-64"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-3 bg-slate-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && loadingStates.detail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
        <div className="relative h-44 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-b-3xl">
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 text-white/80 mb-4">
              <ArrowLeft size={18} />
              <span className="text-sm">Kembali</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/20 rounded-2xl animate-pulse"></div>
              <div>
                <div className="h-7 bg-white/30 rounded-lg w-48 mb-2"></div>
                <div className="h-5 bg-white/20 rounded-lg w-36"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 max-w-6xl mx-auto">
          <SkeletonProfileCard />
        </div>
      </div>
    );
  }

  if (error || !detailPeserta) {
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
              <p className="text-slate-500 mb-6">{error || "Data peserta tidak ditemukan"}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(detailPeserta.status);
  const userInitial = getInitials(detailPeserta.nama);
  const hasFoto = detailPeserta.foto && detailPeserta.foto !== null && detailPeserta.foto !== "";
  
  // Format periode magang
  const periodeMagang = detailPeserta.tanggal_mulai && detailPeserta.tanggal_selesai
    ? `${formatDate(detailPeserta.tanggal_mulai)} - ${formatDate(detailPeserta.tanggal_selesai)}`
    : detailPeserta.tanggal_mulai 
      ? `${formatDate(detailPeserta.tanggal_mulai)} - Sekarang`
      : "-";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      
      {/* HEADER */}
      <div className="relative h-44 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-b-3xl shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        
        <div className="relative z-10 px-6 py-4">
          <button
            onClick={() => navigate("/coo/data-management")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-6 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Kembali ke Data Management</span>
          </button>
          
          <div className="flex items-center gap-6">
            {/* Foto Profil */}
            <div className="relative">
              {hasFoto ? (
                <img 
                  src={detailPeserta.foto} 
                  alt={detailPeserta.nama}
                  className="relative w-20 h-20 rounded-2xl object-cover shadow-xl border-4 border-white/90"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="relative w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white/90"><span class="text-2xl font-bold text-teal-600">${userInitial}</span></div>`;
                  }}
                />
              ) : (
                <div className="relative w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white/90">
                  <span className="text-2xl font-bold text-teal-600">{userInitial}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">{detailPeserta.nama}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </span>
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <Mail size={12} />
                  {detailPeserta.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-6xl mx-auto">
        
        {/* PROFILE CARD - Informasi Detail Peserta */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <IdCard size={18} className="text-teal-500" />
              Informasi Lengkap Peserta
            </h2>
            <p className="text-xs text-slate-400 mt-1">Detail data diri, pendidikan, dan informasi magang</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Email */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-slate-700 break-all mt-1">{detailPeserta.email || "-"}</p>
                </div>
              </div>
              
              {/* Divisi */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Divisi</p>
                  <p className="text-sm font-medium text-slate-700 break-words mt-1">{detailPeserta.divisi || "-"}</p>
                </div>
              </div>
              
              {/* Mentor */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserCheck size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mentor</p>
                  <p className="text-sm font-medium text-slate-700 break-words mt-1">{detailPeserta.mentor || "-"}</p>
                </div>
              </div>

              {/* Asal Kampus / Universitas - DIPERBAIKI */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <School size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Asal Kampus</p>
                  <p className="text-sm font-medium text-slate-700 break-words mt-1">
                    {detailPeserta.asal_kampus || 
                     detailPeserta.universitas || 
                     detailPeserta.kampus || 
                     "-"}
                  </p>
                </div>
              </div>

              {/* Program Studi / Jurusan */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationIcon size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Program Studi</p>
                  <p className="text-sm font-medium text-slate-700 break-words mt-1">{detailPeserta.jurusan || detailPeserta.prodi || "-"}</p>
                </div>
              </div>

              {/* Periode Magang */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Periode Magang</p>
                  <p className="text-sm font-medium text-slate-700 break-words mt-1">{periodeMagang}</p>
                </div>
              </div>

              {/* Durasi Magang */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Durasi Magang</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">{hitungDurasi()}</p>
                </div>
              </div>
              
              {/* No. Telepon (jika ada) */}
              {detailPeserta.phone && detailPeserta.phone !== "-" && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">No. Telepon</p>
                    <p className="text-sm font-medium text-slate-700 break-words mt-1">{detailPeserta.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPeserta;