import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  Printer,
  Mail,
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Sparkles,
  UserCheck,
  UserX,
  Clock as ClockIcon,
  MapPin,
  Smartphone,
  Laptop,
  Globe,
  Sun,
  Moon,
  Cloud
} from "lucide-react"

function Presensi() {
  const [presensiData, setPresensiData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDivisi, setSelectedDivisi] = useState("all")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedPresensi, setSelectedPresensi] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  const itemsPerPage = 8

  // Data dummy presensi
  const dummyPresensi = [
    {
      id: 1,
      nama: "Rizky Darmawan",
      divisi: "CREATIVE TECHNOLOGY",
      tanggal: "2024-10-15",
      checkIn: "07:58",
      checkOut: "17:02",
      status: "Hadir",
      keterlambatan: 0,
      durasi: "9 jam 4 menit",
      device: "Web - Chrome",
      lokasi: "WFO - Kantor Pusat",
      dailyReport: "Menyelesaikan modul UX Research dan melakukan user testing",
      foto: null
    },
    {
      id: 2,
      nama: "Anita Nur",
      divisi: "SCHOOL DESIGN",
      tanggal: "2024-10-15",
      checkIn: "08:15",
      checkOut: "17:00",
      status: "Terlambat",
      keterlambatan: 15,
      durasi: "8 jam 45 menit",
      device: "Mobile - Android",
      lokasi: "WFH - Rumah",
      dailyReport: "Mendesain 3 mockup untuk landing page baru",
      foto: null
    },
    {
      id: 3,
      nama: "Citra Dewi",
      divisi: "FINANCE",
      tanggal: "2024-10-15",
      checkIn: null,
      checkOut: null,
      status: "Tidak Hadir",
      keterlambatan: null,
      durasi: null,
      device: null,
      lokasi: null,
      dailyReport: null,
      foto: null
    },
    {
      id: 4,
      nama: "Doni Saputra",
      divisi: "ENGINEERING",
      tanggal: "2024-10-15",
      checkIn: "07:45",
      checkOut: "17:10",
      status: "Hadir",
      keterlambatan: 0,
      durasi: "9 jam 25 menit",
      device: "Web - Firefox",
      lokasi: "WFO - Kantor Pusat",
      dailyReport: "Fix bug pada API endpoint dan menambah unit test",
      foto: null
    },
    {
      id: 5,
      nama: "Eka Prasetya",
      divisi: "FRAMES",
      tanggal: "2024-10-15",
      checkIn: "08:05",
      checkOut: "16:55",
      status: "Terlambat",
      keterlambatan: 5,
      durasi: "8 jam 50 menit",
      device: "Web - Edge",
      lokasi: "WFO - Kantor Pusat",
      dailyReport: "Menyusun laporan keuangan bulanan",
      foto: null
    },
    {
      id: 6,
      nama: "Fajar Hidayat",
      divisi: "PPTX",
      tanggal: "2024-10-15",
      checkIn: "07:55",
      checkOut: "17:05",
      status: "Hadir",
      keterlambatan: 0,
      durasi: "9 jam 10 menit",
      device: "Mobile - iOS",
      lokasi: "WFH - Rumah",
      dailyReport: "Membuat presentasi untuk meeting klien",
      foto: null
    },
    {
      id: 7,
      nama: "Gita Lestari",
      divisi: "CREATIVE TECHNOLOGY",
      tanggal: "2024-10-15",
      checkIn: "08:20",
      checkOut: "17:00",
      status: "Terlambat",
      keterlambatan: 20,
      durasi: "8 jam 40 menit",
      device: "Web - Chrome",
      lokasi: "WFO - Kantor Pusat",
      dailyReport: "Research trend desain 2025",
      foto: null
    },
    {
      id: 8,
      nama: "Hendra Wijaya",
      divisi: "ENGINEERING",
      tanggal: "2024-10-15",
      checkIn: null,
      checkOut: null,
      status: "Izin",
      keterlambatan: null,
      durasi: null,
      device: null,
      lokasi: null,
      dailyReport: "Sakit - Istirahat di rumah",
      foto: null
    }
  ]

  useEffect(() => {
    // Load data dari localStorage atau pakai dummy
    const savedData = localStorage.getItem("presensi_data")
    if (savedData) {
      setPresensiData(JSON.parse(savedData))
    } else {
      setPresensiData(dummyPresensi)
    }
  }, [])

  useEffect(() => {
    let filtered = [...presensiData]
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nama.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedDivisi !== "all") {
      filtered = filtered.filter(p => p.divisi === selectedDivisi)
    }
    
    if (selectedDate) {
      filtered = filtered.filter(p => p.tanggal === selectedDate)
    }
    
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, selectedDivisi, selectedDate, presensiData])

  const handleViewDetail = (presensi) => {
    setSelectedPresensi(presensi)
    setIsModalOpen(true)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    // Simulasi export PDF
    setTimeout(() => {
      setIsExporting(false)
      alert("Laporan rekap presensi berhasil diunduh!")
    }, 1500)
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Statistik
  const stats = {
    total: filteredData.length,
    hadir: filteredData.filter(p => p.status === "Hadir").length,
    terlambat: filteredData.filter(p => p.status === "Terlambat").length,
    tidakHadir: filteredData.filter(p => p.status === "Tidak Hadir" || p.status === "Izin").length,
    persenKehadiran: filteredData.length > 0 
      ? Math.round((filteredData.filter(p => p.status === "Hadir" || p.status === "Terlambat").length / filteredData.length) * 100)
      : 0
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case "Hadir":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-medium"><CheckCircle size={10} /> Hadir</span>
      case "Terlambat":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-medium"><AlertCircle size={10} /> Terlambat</span>
      case "Tidak Hadir":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium"><XCircle size={10} /> Tidak Hadir</span>
      case "Izin":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium"><ClockIcon size={10} /> Izin</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">-</span>
    }
  }

  const divisiList = ["all", "CREATIVE TECHNOLOGY", "SCHOOL DESIGN", "FINANCE", "ENGINEERING", "FRAMES", "PPTX"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* ===== HEADER ===== */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Data Presensi Peserta
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Monitor kehadiran peserta magang secara real-time
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Download size={16} />
              )}
              Unduh Rekap Presensi
            </button>
          </div>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stats.total}</span>
            </div>
            <p className="text-xs text-slate-500">Total Peserta</p>
            <div className="mt-2 h-1 w-8 bg-blue-500 rounded-full"></div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={16} className="text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stats.hadir}</span>
            </div>
            <p className="text-xs text-slate-500">Hadir Tepat Waktu</p>
            <div className="mt-2 h-1 w-8 bg-emerald-500 rounded-full"></div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle size={16} className="text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stats.terlambat}</span>
            </div>
            <p className="text-xs text-slate-500">Terlambat</p>
            <div className="mt-2 h-1 w-8 bg-amber-500 rounded-full"></div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 size={16} className="text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stats.persenKehadiran}%</span>
            </div>
            <p className="text-xs text-slate-500">Kehadiran Hari Ini</p>
            <div className="mt-2 h-1 w-8 bg-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* ===== FILTERS ===== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari peserta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <select
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
              >
                <option value="all">Semua Divisi</option>
                <option value="CREATIVE TECHNOLOGY">Creative Technology</option>
                <option value="SCHOOL DESIGN">School Design</option>
                <option value="FINANCE">Finance</option>
                <option value="ENGINEERING">Engineering</option>
                <option value="FRAMES">FRAMES</option>
                <option value="PPTX">PPTX</option>
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            
            {(searchTerm || selectedDivisi !== "all" || selectedDate) && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedDivisi("all")
                  setSelectedDate("")
                }}
                className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* ===== TABLE ===== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-In</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-Out</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm">Tidak ada data presensi</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {item.nama.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{item.nama}</span>
                        </div>
                       </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                          {item.divisi}
                        </span>
                       </td>
                      <td className="px-5 py-3 text-sm text-slate-600">
                        {item.checkIn || <span className="text-slate-400">-</span>}
                       </td>
                      <td className="px-5 py-3 text-sm text-slate-600">
                        {item.checkOut || <span className="text-slate-400">-</span>}
                       </td>
                      <td className="px-5 py-3">
                        {getStatusBadge(item.status)}
                       </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleViewDetail(item)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye size={14} />
                        </button>
                       </td>
                     </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] text-slate-400">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===== MODAL DETAIL PRESENSI ===== */}
        {isModalOpen && selectedPresensi && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-xl">
              
              <div className="sticky top-0 bg-white px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <UserCheck size={14} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Detail Presensi</h3>
                    <p className="text-[10px] text-slate-400">{selectedPresensi.tanggal}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                >
                  <XCircle size={16} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Info Peserta */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {selectedPresensi.nama.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{selectedPresensi.nama}</h4>
                    <p className="text-xs text-slate-500">{selectedPresensi.divisi}</p>
                  </div>
                </div>

                {/* Waktu */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <ClockIcon size={14} className="text-blue-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500">Check-In</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedPresensi.checkIn || "-"}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <ClockIcon size={14} className="text-indigo-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500">Check-Out</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedPresensi.checkOut || "-"}</p>
                  </div>
                </div>

                {/* Status & Durasi */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedPresensi.status)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Durasi Kerja</p>
                    <p className="text-sm font-medium text-slate-700">{selectedPresensi.durasi || "-"}</p>
                  </div>
                </div>

                {/* Info Tambahan */}
                {selectedPresensi.keterlambatan > 0 && (
                  <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                    <p className="text-[10px] text-amber-600 flex items-center gap-1">
                      <AlertCircle size={10} />
                      Terlambat {selectedPresensi.keterlambatan} menit
                    </p>
                  </div>
                )}

                {/* Device & Lokasi */}
                <div className="space-y-2">
                  {selectedPresensi.device && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Laptop size={12} className="text-slate-400" />
                      <span>{selectedPresensi.device}</span>
                    </div>
                  )}
                  {selectedPresensi.lokasi && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{selectedPresensi.lokasi}</span>
                    </div>
                  )}
                </div>

                {/* Daily Report */}
                {selectedPresensi.dailyReport && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] font-medium text-slate-500 mb-1">Daily Report</p>
                    <p className="text-sm text-slate-700">{selectedPresensi.dailyReport}</p>
                  </div>
                )}
              </div>
              
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Presensi