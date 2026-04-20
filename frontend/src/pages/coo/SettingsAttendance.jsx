import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Save, 
  Plus, 
  Trash2, 
  Edit2,
  Bell,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  TrendingUp,
  Award,
  Zap,
  Sun,
  Moon,
  Cloud
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// ============ MOCK DATA / DUMMY DATA ============
const DEFAULT_WORKING_HOURS = {
  checkInTime: '08:00',
  checkOutTime: '17:00',
  lateTolerance: 15
};

const DEFAULT_HOLIDAYS = [
  { id: 1, date: '2024-01-01', name: 'Tahun Baru Masehi' },
  { id: 2, date: '2024-02-08', name: 'Isra Mi\'raj Nabi Muhammad SAW' },
  { id: 3, date: '2024-04-10', name: 'Hari Raya Idul Fitri 1445 H' },
  { id: 4, date: '2024-08-17', name: 'Hari Kemerdekaan RI' },
  { id: 5, date: '2024-12-25', name: 'Hari Raya Natal' },
];

const STORAGE_KEYS = {
  WORKING_HOURS: 'mock_working_hours',
  HOLIDAYS: 'mock_holidays'
};

const initializeMockData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.WORKING_HOURS)) {
    localStorage.setItem(STORAGE_KEYS.WORKING_HOURS, JSON.stringify(DEFAULT_WORKING_HOURS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HOLIDAYS)) {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(DEFAULT_HOLIDAYS));
  }
};

const mockApi = {
  getWorkingHours: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem(STORAGE_KEYS.WORKING_HOURS);
        resolve(JSON.parse(data));
      }, 300);
    });
  },
  updateWorkingHours: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEYS.WORKING_HOURS, JSON.stringify(data));
        resolve(data);
      }, 300);
    });
  },
  getHolidays: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
        resolve(JSON.parse(data));
      }, 300);
    });
  },
  addHoliday: async (holiday) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const holidays = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOLIDAYS));
        const newId = Math.max(...holidays.map(h => h.id), 0) + 1;
        const newHoliday = { ...holiday, id: newId };
        const updated = [...holidays, newHoliday];
        localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(updated));
        resolve(newHoliday);
      }, 300);
    });
  },
  updateHoliday: async (id, holiday) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const holidays = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOLIDAYS));
        const updated = holidays.map(h => h.id === id ? { ...h, ...holiday } : h);
        localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(updated));
        resolve(updated.find(h => h.id === id));
      }, 300);
    });
  },
  deleteHoliday: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const holidays = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOLIDAYS));
        const updated = holidays.filter(h => h.id !== id);
        localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(updated));
        resolve({ success: true });
      }, 300);
    });
  }
};

initializeMockData();

const SettingsAttendance = () => {
  const [activeTab, setActiveTab] = useState('working-hours');
  const [workingHours, setWorkingHours] = useState(DEFAULT_WORKING_HOURS);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [workingHoursRes, holidaysRes] = await Promise.all([
        mockApi.getWorkingHours(),
        mockApi.getHolidays()
      ]);
      setWorkingHours(workingHoursRes);
      setHolidays(holidaysRes);
    } catch (error) {
      toast.error('Gagal memuat data pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const saveWorkingHours = async () => {
    setLoading(true);
    try {
      await mockApi.updateWorkingHours(workingHours);
      toast.success('Jam kerja berhasil diperbarui!');
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan jam kerja');
    } finally {
      setLoading(false);
    }
  };

  const addHoliday = async () => {
    if (!holidayForm.date || !holidayForm.name) {
      toast.error('Tanggal dan nama hari libur wajib diisi');
      return;
    }
    setLoading(true);
    try {
      if (editingHoliday) {
        await mockApi.updateHoliday(editingHoliday.id, holidayForm);
        toast.success('Hari libur berhasil diperbarui!');
      } else {
        await mockApi.addHoliday(holidayForm);
        toast.success('Hari libur berhasil ditambahkan!');
      }
      await fetchData();
      setShowHolidayModal(false);
      resetHolidayForm();
    } catch (error) {
      toast.error('Gagal menyimpan hari libur');
    } finally {
      setLoading(false);
    }
  };

  const deleteHoliday = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus hari libur ini?')) {
      setLoading(true);
      try {
        await mockApi.deleteHoliday(id);
        toast.success('Hari libur berhasil dihapus!');
        await fetchData();
      } catch (error) {
        toast.error('Gagal menghapus hari libur');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetHolidayForm = () => {
    setHolidayForm({ date: '', name: '' });
    setEditingHoliday(null);
  };

  const editHoliday = (holiday) => {
    setEditingHoliday(holiday);
    setHolidayForm({ date: holiday.date, name: holiday.name });
    setShowHolidayModal(true);
  };

  const totalPages = Math.ceil(holidays.length / itemsPerPage);
  const paginatedHolidays = holidays.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDayName = (dateStr) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  const getUpcomingHolidays = () => {
    const today = new Date();
    const upcoming = holidays.filter(h => new Date(h.date) >= today);
    return upcoming.slice(0, 3);
  };

  const upcomingHolidays = getUpcomingHolidays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50/50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ===== HEADER SECTION ===== */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Pengaturan Kehadiran
                </h1>
              </div>
              <p className="text-slate-500 ml-12">
                Kelola jam kerja dan hari libur untuk sistem monitoring magang
              </p>
            </div>
            
            <div className="flex items-center gap-3 ml-12 md:ml-0">
              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-amber-700 font-medium">Mode Demo</span>
              </div>
              <button
                onClick={() => {
                  fetchData();
                  toast.success('Data berhasil disegarkan');
                }}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Check-In</p>
                <p className="text-2xl font-bold text-white mt-1">{workingHours.checkInTime}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Sun className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-indigo-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Check-Out</p>
                <p className="text-2xl font-bold text-white mt-1">{workingHours.checkOutTime}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Moon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 shadow-lg shadow-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Toleransi</p>
                <p className="text-2xl font-bold text-white mt-1">{workingHours.lateTolerance} menit</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg shadow-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Hari Libur</p>
                <p className="text-2xl font-bold text-white mt-1">{holidays.length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ===== UPCOMING HOLIDAYS BANNER ===== */}
        {upcomingHolidays.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">Hari Libur Mendatang</p>
                <div className="flex flex-wrap gap-3 mt-1">
                  {upcomingHolidays.map(holiday => (
                    <span key={holiday.id} className="text-sm text-blue-600">
                      {new Date(holiday.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {holiday.name}
                    </span>
                  ))}
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        )}

        {/* ===== TAB NAVIGATION ===== */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-blue-100/50 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('working-hours')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'working-hours'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              Jam Kerja
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'holidays'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Hari Libur
            </button>
          </div>
        </div>

        {/* ===== WORKING HOURS TAB ===== */}
        {activeTab === 'working-hours' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card Waktu Operasional */}
              <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Waktu Operasional</h3>
                    <p className="text-sm text-slate-400">Atur jam masuk dan pulang</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-600 text-sm font-medium mb-2">⏰ Waktu Check-In</label>
                    <input
                      type="time"
                      value={workingHours.checkInTime}
                      onChange={(e) => setWorkingHours({ ...workingHours, checkInTime: e.target.value })}
                      className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-sm font-medium mb-2">🏠 Waktu Check-Out</label>
                    <input
                      type="time"
                      value={workingHours.checkOutTime}
                      onChange={(e) => setWorkingHours({ ...workingHours, checkOutTime: e.target.value })}
                      className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Card Batas Toleransi */}
              <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Batas & Toleransi</h3>
                    <p className="text-sm text-slate-400">Atur batas keterlambatan</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-600 text-sm font-medium mb-2">⏱️ Batas Toleransi Keterlambatan</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={workingHours.lateTolerance}
                        onChange={(e) => setWorkingHours({ ...workingHours, lateTolerance: parseInt(e.target.value) })}
                        className="flex-1 border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <span className="text-slate-500 font-medium">menit</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      Keterlambatan di bawah batas ini tidak akan memotong skor kehadiran
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveWorkingHours}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Perubahan
              </button>
            </div>

            {/* Info Banner */}
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

        {/* ===== HOLIDAYS TAB ===== */}
        {activeTab === 'holidays' && (
          <div className="space-y-6">
            {/* Add Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  resetHolidayForm();
                  setShowHolidayModal(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Hari Libur
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hari</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Hari Libur</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {paginatedHolidays.map((holiday, idx) => (
                      <tr key={holiday.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-slate-700 font-medium">
                              {new Date(holiday.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                            {getDayName(holiday.date)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-800 font-medium">{holiday.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => editHoliday(holiday)}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteHoliday(holiday.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedHolidays.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-blue-50 rounded-full">
                              <Calendar className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-slate-400">Belum ada data hari libur</p>
                            <button
                              onClick={() => {
                                resetHolidayForm();
                                setShowHolidayModal(true);
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-blue-100 flex items-center justify-between bg-blue-50/30">
                  <p className="text-sm text-slate-500">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, holidays.length)} dari {holidays.length}
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

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-amber-700 text-sm">
                    <strong className="font-semibold">Catatan:</strong> Pada hari libur yang telah ditentukan, sistem secara otomatis tidak akan mencatat presensi dan status kehadiran akan ditandai sebagai "Libur".
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL ADD/EDIT HOLIDAY ===== */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
            <div className="flex justify-between items-center p-6 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                  {editingHoliday ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {editingHoliday ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
                </h3>
              </div>
              <button
                onClick={() => setShowHolidayModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">📅 Tanggal</label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">🏷️ Nama Hari Libur</label>
                <input
                  type="text"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  placeholder="Contoh: Tahun Baru Masehi"
                  className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-blue-100 bg-blue-50/30 rounded-b-2xl">
              <button
                onClick={() => setShowHolidayModal(false)}
                className="flex-1 px-4 py-2.5 border border-blue-200 rounded-xl text-slate-600 font-medium hover:bg-white transition-all"
              >
                Batal
              </button>
              <button
                onClick={addHoliday}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : (editingHoliday ? 'Update' : 'Simpan')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SettingsAttendance;