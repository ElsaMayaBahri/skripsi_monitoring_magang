import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Save, 
  Plus, 
  Trash2, 
  Edit2,
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  TrendingUp,
  Zap,
  Sun,
  Moon,
  Loader2
} from 'lucide-react';

const SettingsAttendance = () => {
  const [activeTab, setActiveTab] = useState('jam-kerja');
  const [jamKerja, setJamKerja] = useState({
    jam_masuk: '08:00',
    jam_pulang: '17:00',
    batas_terlambat: 15
  });
  const [hariLibur, setHariLibur] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingLibur, setEditingLibur] = useState(null);
  const [showModalLibur, setShowModalLibur] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLibur, setFormLibur] = useState({ tanggal: '', keterangan: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [idJamKerja, setIdJamKerja] = useState(null);
  const itemsPerPage = 5;
  
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successDetail, setSuccessDetail] = useState("");
  const [successType, setSuccessType] = useState("");

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 15;
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const jam = parseInt(parts[0]) || 0;
      const menit = parseInt(parts[1]) || 0;
      return (jam * 60) + menit;
    }
    return 15;
  };

  const showPremiumPopup = (message, detail, type = "success") => {
    setSuccessMessage(message);
    setSuccessDetail(detail);
    setSuccessType(type);
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 2500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchJamKerja(),
        fetchHariLibur()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJamKerja = async () => {
    try {
      const response = await api.getJamKerja();
      console.log('Jam kerja response:', response);
      
      if (response && response.success && response.data) {
        const data = response.data;
        const jamMasuk = data.jam_masuk ? data.jam_masuk.substring(0, 5) : '08:00';
        const jamPulang = data.jam_pulang ? data.jam_pulang.substring(0, 5) : '17:00';
        
        let batasTerlambatMenit = 15;
        if (data.batas_terlambat) {
          batasTerlambatMenit = timeToMinutes(data.batas_terlambat);
        }
        
        setJamKerja({
          jam_masuk: jamMasuk,
          jam_pulang: jamPulang,
          batas_terlambat: batasTerlambatMenit
        });
        setIdJamKerja(data.id_jam_kerja);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
    }
  };

  const fetchHariLibur = async () => {
    try {
      const response = await api.getHariLibur();
      console.log('Hari libur response:', response);
      
      let dataLibur = [];
      if (response && response.success && response.data) {
        dataLibur = response.data;
      } else if (response && Array.isArray(response)) {
        dataLibur = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        dataLibur = response.data;
      }
      
      const formattedLibur = dataLibur.map(item => ({
        id: item.id_libur || item.id,
        tanggal: item.tanggal,
        keterangan: item.keterangan || item.name
      }));
      
      setHariLibur(formattedLibur);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setHariLibur([]);
    }
  };

  const saveJamKerja = async () => {
    if (!jamKerja.jam_masuk || !jamKerja.jam_pulang) {
      showPremiumPopup('Validasi Gagal', 'Jam masuk dan jam pulang harus diisi', 'error');
      return;
    }
    if (jamKerja.batas_terlambat === null || jamKerja.batas_terlambat === undefined) {
      showPremiumPopup('Validasi Gagal', 'Batas toleransi keterlambatan harus diisi', 'error');
      return;
    }

    setLoading(true);
    try {
      let response;
      const dataToSend = {
        jam_masuk: jamKerja.jam_masuk,
        jam_pulang: jamKerja.jam_pulang,
        batas_terlambat: jamKerja.batas_terlambat
      };
      
      if (idJamKerja) {
        response = await api.updateJamKerja(idJamKerja, dataToSend);
      } else {
        response = await api.createJamKerja(dataToSend);
      }
      
      if (response && response.success) {
        showPremiumPopup(
          'Jam Kerja Diperbarui', 
          `${jamKerja.jam_masuk} - ${jamKerja.jam_pulang} · Batas terlambat ${jamKerja.batas_terlambat} menit`,
          'success'
        );
        await fetchJamKerja();
      } else {
        showPremiumPopup('Gagal', response?.message || 'Gagal menyimpan pengaturan jam kerja', 'error');
      }
    } catch (error) {
      console.error('Error saving working hours:', error);
      showPremiumPopup('Gagal', error.message || 'Gagal menyimpan pengaturan jam kerja', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addHariLibur = async () => {
    if (!formLibur.tanggal || !formLibur.keterangan) {
      showPremiumPopup('Validasi Gagal', 'Tanggal dan keterangan hari libur wajib diisi', 'error');
      return;
    }
    setLoading(true);
    try {
      let response;
      if (editingLibur) {
        response = await api.updateHariLibur(editingLibur.id, formLibur);
      } else {
        response = await api.createHariLibur(formLibur);
      }
      
      if (response && response.success) {
        const tanggalFormatted = new Date(formLibur.tanggal).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        showPremiumPopup(
          editingLibur ? 'Hari Libur Diperbarui' : 'Hari Libur Ditambahkan',
          `${tanggalFormatted} - ${formLibur.keterangan}`,
          'success'
        );
        await fetchHariLibur();
        setShowModalLibur(false);
        resetFormLibur();
      } else {
        showPremiumPopup('Gagal', response?.message || 'Gagal menyimpan hari libur', 'error');
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
      showPremiumPopup('Gagal', error.message || 'Gagal menyimpan hari libur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id, keterangan) => {
    setDeleteTarget({ id, keterangan });
    setShowDeleteConfirm(true);
  };

  const deleteHariLibur = async () => {
    if (!deleteTarget) return;
    
    setLoading(true);
    try {
      const response = await api.deleteHariLibur(deleteTarget.id);
      if (response && response.success) {
        showPremiumPopup('Hari Libur Dihapus', `${deleteTarget.keterangan} berhasil dihapus dari daftar`, 'success');
        await fetchHariLibur();
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      } else {
        showPremiumPopup('Gagal', response?.message || 'Gagal menghapus hari libur', 'error');
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
      showPremiumPopup('Gagal', error.message || 'Gagal menghapus hari libur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetFormLibur = () => {
    setFormLibur({ tanggal: '', keterangan: '' });
    setEditingLibur(null);
  };

  const editHariLibur = (libur) => {
    setEditingLibur(libur);
    setFormLibur({ tanggal: libur.tanggal, keterangan: libur.keterangan });
    setShowModalLibur(true);
  };

  const totalPages = Math.ceil(hariLibur.length / itemsPerPage);
  const paginatedHariLibur = hariLibur.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getNamaHari = (dateStr) => {
    if (!dateStr) return '-';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  const getUpcomingHariLibur = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = hariLibur.filter(h => new Date(h.tanggal) >= today);
    return upcoming.slice(0, 3);
  };

  const upcomingHariLibur = getUpcomingHariLibur();

  const formatTime = (time) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50/30">
      {/* PREMIUM SUCCESS POPUP */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-zoomIn">
            <div className="relative">
              <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${
                successType === 'success' 
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 via-rose-500 to-red-500'
              }`}></div>
              
              <div className="pt-8 pb-4 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-ping"></div>
                  <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
                    successType === 'success' 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                      : 'bg-gradient-to-br from-red-500 to-rose-500'
                  }`}>
                    {successType === 'success' ? (
                      <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                    ) : (
                      <AlertCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-2 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{successMessage}</h3>
                <div className={`w-16 h-0.5 mx-auto mb-4 ${
                  successType === 'success' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-r from-red-500 to-rose-500'
                }`}></div>
                <p className="text-slate-500 text-sm mb-6">{successDetail}</p>
              </div>
              
              <div className="px-6 pb-8">
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className={`w-full py-3 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 ${
                    successType === 'success' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                      : 'bg-gradient-to-r from-red-600 to-rose-600'
                  }`}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-zoomIn">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-t-2xl"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Konfirmasi Hapus</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Apakah Anda yakin ingin menghapus hari libur <strong className="text-slate-800">{deleteTarget.keterangan}</strong>?
                  <br />
                  <span className="text-sm text-slate-400">Tindakan ini tidak dapat dibatalkan.</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteTarget(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={deleteHariLibur}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER - DIPERBAIKI JARAKNYA */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Pengaturan Kehadiran
                  </h1>
                </div>
              </div>
              <p className="text-sm text-slate-500 ml-12">
                Kelola jam kerja dan hari libur untuk sistem monitoring magang
              </p>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Jam Masuk</p>
                <p className="text-2xl font-bold text-white mt-1">{formatTime(jamKerja.jam_masuk)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Sun className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-indigo-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Jam Pulang</p>
                <p className="text-2xl font-bold text-white mt-1">{formatTime(jamKerja.jam_pulang)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Moon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 shadow-lg shadow-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Batas Terlambat</p>
                <p className="text-2xl font-bold text-white mt-1">{jamKerja.batas_terlambat} menit</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-blue-100/50 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('jam-kerja')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'jam-kerja'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              Jam Kerja
            </button>
            <button
              onClick={() => setActiveTab('hari-libur')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'hari-libur'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Hari Libur
            </button>
          </div>
        </div>

        {/* WORKING HOURS TAB */}
        {activeTab === 'jam-kerja' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-6">
                  {/* ICON WAKTU OPERASIONAL - WARNA ABU */}
                  <div className="p-2.5 bg-slate-100 rounded-xl shadow-sm">
                    <Clock className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Waktu Operasional</h3>
                    <p className="text-sm text-slate-400">Atur jam masuk dan pulang</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-600 text-sm font-medium mb-2">Jam Masuk</label>
                    <input
                      type="time"
                      value={jamKerja.jam_masuk}
                      onChange={(e) => setJamKerja({ ...jamKerja, jam_masuk: e.target.value })}
                      className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-sm font-medium mb-2">Jam Pulang</label>
                    <input
                      type="time"
                      value={jamKerja.jam_pulang}
                      onChange={(e) => setJamKerja({ ...jamKerja, jam_pulang: e.target.value })}
                      className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-6">
                  {/* ICON BATAS & TOLERANSI - WARNA ABU */}
                  <div className="p-2.5 bg-slate-100 rounded-xl shadow-sm">
                    <AlertCircle className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Batas & Toleransi</h3>
                    <p className="text-sm text-slate-400">Atur batas keterlambatan dalam menit</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-600 text-sm font-medium mb-2">Batas Toleransi Keterlambatan</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={jamKerja.batas_terlambat}
                        onChange={(e) => setJamKerja({ ...jamKerja, batas_terlambat: parseInt(e.target.value) || 0 })}
                        className="flex-1 border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Masukkan jumlah menit"
                      />
                      <span className="text-slate-500 font-medium">menit</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      Keterlambatan di bawah batas ini tidak akan memotong skor kehadiran
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Contoh: Jika jam masuk 08:00 dan batas terlambat 15 menit, maka peserta masih dianggap hadir jika check-in sebelum pukul 08:15
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveJamKerja}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Perubahan
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-blue-700 text-sm">
                    <strong className="font-semibold">Informasi Sinkronisasi:</strong> Perubahan jam kerja akan segera diterapkan ke seluruh dashboard mahasiswa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOLIDAYS TAB */}
        {activeTab === 'hari-libur' && (
          <div className="space-y-6">
            {/* UPCOMING HOLIDAYS BANNER - WARNA MERAH */}
            {upcomingHariLibur.length > 0 && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-4 border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">Hari Libur Mendatang</p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {upcomingHariLibur.map(libur => (
                        <span key={libur.id} className="text-sm text-red-700 font-medium">
                          {new Date(libur.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {libur.keterangan}
                        </span>
                      ))}
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-red-400" />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  resetFormLibur();
                  setShowModalLibur(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Hari Libur
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hari</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Keterangan</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {paginatedHariLibur.map((libur) => {
                      const tanggalFormatted = new Date(libur.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      });
                      return (
                        <tr key={libur.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <Calendar className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-slate-700 font-medium">{tanggalFormatted}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                              {getNamaHari(libur.tanggal)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-800 font-medium">{libur.keterangan}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => editHariLibur(libur)}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => confirmDelete(libur.id, libur.keterangan)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedHariLibur.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-blue-50 rounded-full">
                              <Calendar className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-slate-400">Belum ada data hari libur</p>
                            <button
                              onClick={() => {
                                resetFormLibur();
                                setShowModalLibur(true);
                              }}
                              className="px-4 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              + Tambah sekarang
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-blue-100 flex items-center justify-between bg-blue-50/30">
                  <p className="text-sm text-slate-500">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, hariLibur.length)} dari {hariLibur.length}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-blue-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-blue-300 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-blue-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-blue-300 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CATATAN - WARNA BIRU */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-blue-700 text-sm">
                    <strong className="font-semibold">Catatan:</strong> Pada hari libur yang telah ditentukan, sistem secara otomatis tidak akan mencatat presensi dan status kehadiran akan ditandai sebagai "Libur".
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH/EDIT HARI LIBUR */}
      {showModalLibur && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                  {editingLibur ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {editingLibur ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
                </h3>
              </div>
              <button
                onClick={() => setShowModalLibur(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">Tanggal</label>
                <input
                  type="date"
                  value={formLibur.tanggal}
                  onChange={(e) => setFormLibur({ ...formLibur, tanggal: e.target.value })}
                  className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">Keterangan</label>
                <input
                  type="text"
                  value={formLibur.keterangan}
                  onChange={(e) => setFormLibur({ ...formLibur, keterangan: e.target.value })}
                  placeholder="Contoh: Tahun Baru Masehi"
                  className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-blue-100 bg-blue-50/30 rounded-b-2xl">
              <button
                onClick={() => setShowModalLibur(false)}
                className="flex-1 px-4 py-2.5 border border-blue-200 rounded-xl text-slate-600 font-medium hover:bg-white transition-all"
              >
                Batal
              </button>
              <button
                onClick={addHariLibur}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingLibur ? 'Update' : 'Simpan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsAttendance;