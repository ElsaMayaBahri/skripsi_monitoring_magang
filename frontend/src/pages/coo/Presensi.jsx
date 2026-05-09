import { useState, useEffect } from "react"
import { 
  Search, 
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
  Laptop,
  MapPin,
  BarChart3,
  Sparkles,
  UserCheck,
  Clock as ClockIcon,
  X,
  Loader2
} from "lucide-react"
import axiosInstance from "../../api/axios"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [divisiList, setDivisiList] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    tidakHadir: 0,
    persenKehadiran: 0
  })
  
  const itemsPerPage = 8

  // Load divisi list
  const fetchDivisi = async () => {
    try {
      const response = await axiosInstance.get("/divisi")
      let divisiData = []
      if (response.data && response.data.success && response.data.data) {
        divisiData = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        divisiData = response.data
      }
      setDivisiList(divisiData)
    } catch (err) {
      console.error("Error fetching divisi:", err)
    }
  }

  // Load presensi data dari backend
  const fetchPresensi = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = "/presensi"
      const params = new URLSearchParams()
      
      if (selectedDate) {
        params.append("tanggal", selectedDate)
      }
      if (selectedDivisi !== "all") {
        params.append("divisi", selectedDivisi)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await axiosInstance.get(url)
      
      let presensiList = []
      if (response.data && response.data.success && response.data.data) {
        presensiList = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        presensiList = response.data
      }
      
      setPresensiData(presensiList)
      calculateStats(presensiList)
    } catch (err) {
      console.error("Error fetching presensi:", err)
      setError("Gagal memuat data presensi")
      setPresensiData([])
    } finally {
      setLoading(false)
    }
  }

  // Hitung statistik
  const calculateStats = (data) => {
    const total = data.length
    const hadir = data.filter(p => p.status === "Hadir" || p.status === "hadir").length
    const terlambat = data.filter(p => p.status === "Terlambat" || p.status === "terlambat").length
    const tidakHadir = data.filter(p => p.status === "Tidak Hadir" || p.status === "tidak_hadir" || p.status === "Izin" || p.status === "izin").length
    
    const persenKehadiran = total > 0 
      ? Math.round(((hadir + terlambat) / total) * 100)
      : 0
    
    setStats({
      total,
      hadir,
      terlambat,
      tidakHadir,
      persenKehadiran
    })
  }

  useEffect(() => {
    fetchDivisi()
  }, [])

  useEffect(() => {
    fetchPresensi()
  }, [selectedDate, selectedDivisi])

  useEffect(() => {
    let filtered = [...presensiData]
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        (p.nama || p.peserta?.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, presensiData])

  const handleViewDetail = (presensi) => {
    setSelectedPresensi(presensi)
    setIsModalOpen(true)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (selectedDate) params.append("tanggal", selectedDate)
      if (selectedDivisi !== "all") params.append("divisi", selectedDivisi)
      
      const response = await axiosInstance.get(`/presensi/export${params.toString() ? `?${params.toString()}` : ''}`, {
        responseType: "blob",
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rekap_presensi_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error exporting:", err)
      alert("Gagal mengunduh laporan presensi")
    } finally {
      setIsExporting(false)
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (status) => {
    const statusLower = (status || "").toLowerCase()
    switch(statusLower) {
      case "hadir":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-medium"><CheckCircle size={10} /> Hadir</span>
      case "terlambat":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-medium"><AlertCircle size={10} /> Terlambat</span>
      case "tidak hadir":
      case "tidak_hadir":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium"><XCircle size={10} /> Tidak Hadir</span>
      case "izin":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium"><ClockIcon size={10} /> Izin</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">-</span>
    }
  }

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-"
    return dateTime
  }

  const getNamaPeserta = (item) => {
    return item.peserta?.nama || item.nama || "-"
  }

  const getDivisiPeserta = (item) => {
    return item.peserta?.divisi || item.divisi || "-"
  }

  if (loading && presensiData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Memuat data presensi...</p>
        </div>
      </div>
    )
  }

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
              disabled={isExporting || filteredData.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
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
            <p className="text-xs text-slate-500">Kehadiran</p>
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
                {divisiList.map((div) => (
                  <option key={div.id_divisi || div.id} value={div.nama_divisi || div.nama}>
                    {div.nama_divisi || div.nama}
                  </option>
                ))}
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

        {/* ===== ERROR MESSAGE ===== */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={fetchPresensi} className="text-red-600 hover:text-red-700 text-sm font-medium">Coba Lagi</button>
          </div>
        )}

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
                {paginatedData.length === 0 && !loading ? (
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
                            {getNamaPeserta(item).charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{getNamaPeserta(item)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                          {getDivisiPeserta(item)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">
                        {formatDateTime(item.check_in)}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">
                        {formatDateTime(item.check_out)}
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
                    <p className="text-[10px] text-slate-400">{selectedPresensi.tanggal || "-"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Info Peserta */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {getNamaPeserta(selectedPresensi).charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{getNamaPeserta(selectedPresensi)}</h4>
                    <p className="text-xs text-slate-500">{getDivisiPeserta(selectedPresensi)}</p>
                  </div>
                </div>

                {/* Waktu */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <ClockIcon size={14} className="text-blue-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500">Check-In</p>
                    <p className="text-sm font-semibold text-slate-700">{formatDateTime(selectedPresensi.check_in)}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <ClockIcon size={14} className="text-indigo-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500">Check-Out</p>
                    <p className="text-sm font-semibold text-slate-700">{formatDateTime(selectedPresensi.check_out)}</p>
                  </div>
                </div>

                {/* Status & Durasi */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedPresensi.status)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Keterlambatan</p>
                    <p className="text-sm font-medium text-slate-700">{selectedPresensi.keterlambatan || 0} menit</p>
                  </div>
                </div>

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
                {selectedPresensi.daily_report && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] font-medium text-slate-500 mb-1">Daily Report</p>
                    <p className="text-sm text-slate-700">{selectedPresensi.daily_report}</p>
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