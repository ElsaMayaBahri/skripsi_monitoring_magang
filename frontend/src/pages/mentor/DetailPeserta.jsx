// src/pages/mentor/DetailPeserta.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Building2,
  GraduationCap,
  CalendarDays,
  MapPin,
  Phone,
  Briefcase,
  Clock,
  Loader2,
  AlertCircle,
  Target,
  FileText,
  Users,
  User,
  BookOpen,
  Calendar
} from "lucide-react";
import axiosInstance from "../../api/axios";

function DetailPeserta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [peserta, setPeserta] = useState(null);
  const [error, setError] = useState(null);
  const [currentMentor, setCurrentMentor] = useState(null);

  useEffect(() => {
    if (id) {
      fetchDetailPeserta();
      fetchCurrentMentor();
    }
  }, [id]);

  const fetchCurrentMentor = async () => {
    try {
      const response = await axiosInstance.get("/mentor/profile");
      console.log("Mentor profile response:", response.data);
      if (response.data && response.data.success) {
        setCurrentMentor(response.data.data);
      } else if (response.data && response.data.data) {
        setCurrentMentor(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching mentor profile:", err);
      const userStorage = localStorage.getItem("user");
      if (userStorage) {
        try {
          const userData = JSON.parse(userStorage);
          setCurrentMentor({ nama: userData.nama || userData.name || "Mentor" });
        } catch (e) {}
      }
    }
  };

  const fetchDetailPeserta = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching detail peserta with id_peserta:", id);
      
      const response = await axiosInstance.get(`/mentor/pesertas/${id}`);
      console.log("Response from /mentor/pesertas/:", response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const dataPeserta = response.data.data;
        
        const getString = (value) => {
          if (!value) return "-";
          if (typeof value === 'string') return value;
          if (typeof value === 'object') {
            if (value.nama_divisi) return value.nama_divisi;
            if (value.nama) return value.nama;
            if (value.name) return value.name;
            return "-";
          }
          return String(value);
        };
        
        setPeserta({
          id: dataPeserta.id_peserta || dataPeserta.id,
          nama: dataPeserta.nama || dataPeserta.nama_lengkap || dataPeserta.user?.nama || "-",
          email: dataPeserta.email || dataPeserta.user?.email || "-",
          no_telepon: dataPeserta.no_telepon || dataPeserta.user?.no_telepon || "-",
          foto_profil: dataPeserta.foto_profil || dataPeserta.user?.foto_profil || null,
          alamat: dataPeserta.alamat || dataPeserta.user?.alamat || "-",
          status_akun: dataPeserta.status_akun || "aktif",
          divisi: getString(dataPeserta.divisi),
          universitas: getString(dataPeserta.asal_kampus),
          jurusan: getString(dataPeserta.prodi),
          tanggal_mulai: dataPeserta.tanggal_mulai,
          tanggal_selesai: dataPeserta.tanggal_selesai,
          status_magang: dataPeserta.status_magang || "aktif",
          id_user: dataPeserta.id_user,
          id_mentor: dataPeserta.id_mentor,
          id_divisi: dataPeserta.id_divisi,
          progress: dataPeserta.progress || 0,
          attendance: dataPeserta.kehadiran_persen || 0,
          tugas_selesai: dataPeserta.tugas_selesai || 0,
          total_tugas: dataPeserta.total_tugas || 0,
          nilai_akhir: dataPeserta.nilai_akhir || 0,
          mentor: dataPeserta.mentor || null
        });
      } else {
        setError(response.data?.message || "Data peserta tidak ditemukan");
      }
    } catch (err) {
      console.error("Error fetching detail peserta:", err);
      setError(err.response?.data?.message || err.message || "Gagal memuat data peserta");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return "-";
    }
  };

  const handleInputNilai = () => {
    // Navigasi ke halaman Input Nilai Manual (tanpa ID, karena di halaman tersebut ada dropdown pilih peserta)
    navigate("/mentor/input-nilai-manual");
  };

  const mentorName = currentMentor?.nama || currentMentor?.name || currentMentor?.nama_lengkap || "Mentor";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Memuat data peserta...</p>
        </div>
      </div>
    );
  }

  if (error || !peserta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Data Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-6">{error || "Peserta tidak ditemukan"}</p>
            <button
              onClick={() => navigate("/mentor/daftar-peserta")}
              className="px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg text-white text-sm font-semibold"
            >
              Kembali ke Daftar Peserta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        
        {/* Header Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          {/* Background Gradient Hijau */}
          <div className="relative h-28 bg-gradient-to-r from-teal-500 to-blue-600"></div>
          
          {/* Area Putih di bawah gradien */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-12">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white overflow-hidden flex-shrink-0">
                {peserta.foto_profil ? (
                  <img src={peserta.foto_profil} alt={peserta.nama} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-teal-600">{peserta.nama?.charAt(0) || "P"}</span>
                )}
              </div>
              
              {/* Informasi di area putih */}
              <div className="flex-1 pt-4 md:pt-0">
                {/* NAMA - warna gelap */}
                <h1 className="text-2xl font-bold text-slate-800">{peserta.nama}</h1>
                
                {/* DIVISI & UNIVERSITAS - di dalam area putih, di bawah nama */}
                <div className="mt-6 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 size="14" className="text-slate-400" />
                    <span className="text-sm text-slate-600">{peserta.divisi}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size="14" className="text-slate-400" />
                    <span className="text-sm text-slate-600">{peserta.universitas} - {peserta.jurusan}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informasi Pribadi */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-semibold text-slate-800">Informasi Pribadi</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <User size="16" className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Nama Lengkap</p>
                  <p className="text-sm text-slate-700">{peserta.nama}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size="16" className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm text-slate-700">{peserta.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size="16" className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">No. Telepon</p>
                  <p className="text-sm text-slate-700">{peserta.no_telepon}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size="16" className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Alamat</p>
                  <p className="text-sm text-slate-700">{peserta.alamat}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Magang */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-semibold text-slate-800">Informasi Magang</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <CalendarDays size="16" className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Periode Magang</p>
                  <p className="text-sm text-slate-700">{formatDate(peserta.tanggal_mulai)} - {formatDate(peserta.tanggal_selesai)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 size="16" className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Divisi</p>
                  <p className="text-sm text-slate-700">{peserta.divisi}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users size="16" className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Mentor Pembimbing</p>
                  <p className="text-sm font-medium text-teal-600">{mentorName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistik */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="font-semibold text-slate-800">Statistik</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Progress Tugas</span>
                  <span className="font-semibold text-teal-600">{peserta.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${peserta.progress}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Kehadiran</span>
                  <span className="font-semibold text-emerald-600">{peserta.attendance}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${peserta.attendance}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <FileText size="16" className="text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-700">{peserta.tugas_selesai}/{peserta.total_tugas}</p>
                  <p className="text-[10px] text-slate-400">Tugas Selesai</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <Target size="16" className="text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-700">{peserta.nilai_akhir}</p>
                  <p className="text-[10px] text-slate-400">Nilai Akhir</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => navigate("/mentor/daftar-peserta")}
            className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
          >
            Kembali
          </button>
          <button
            onClick={handleInputNilai}
            className="px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Input Nilai
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailPeserta;