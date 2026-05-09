// frontend/src/pages/coo/LaporanPresensi.jsx
import { useState, useEffect } from "react"
import { 
  Download, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3,
  TrendingUp,
  Award,
  Sparkles,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"
import axiosInstance from "../../api/axios"

function LaporanPresensi() {
  const [presensiData, setPresensiData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedDivisi, setSelectedDivisi] = useState("all")
  const [divisiList, setDivisiList] = useState([])
  const [isExporting, setIsExporting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const itemsPerPage = 10

  // Fetch divisi list
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

  // Fetch presensi data from backend
  const fetchPresensi = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = "/presensi"
      const params = new URLSearchParams()
      
      // Filter by date range (month/year)
      if (selectedMonth && selectedYear) {
        const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
        const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`
        params.append("tanggal_mulai", startDate)
        params.append("tanggal_selesai", endDate)
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
      
      // Process data to calculate summary per participant
      const participantMap = new Map()
      
      presensiList.forEach(item => {
        const nama = item.peserta?.nama || item.nama || "-"
        const divisi = item.peserta?.divisi || item.divisi || "-"
        const status = item.status || ""
        const checkIn = item.check_in
        const checkOut = item.check_out
        
        if (!participantMap.has(nama)) {
          participantMap.set(nama, {
            id: item.id,
            nama: nama,
            divisi: divisi,
            totalHadir: 0,
            totalTerlambat: 0,
            totalIzin: 0,
            totalAbsen: 0,
            totalCheckIn: 0,
            totalCheckOut: 0,
            daysCount: 0
          })
        }
        
        const participant = participantMap.get(nama)
        participant.daysCount++
        
        if (status === "Hadir") {
          participant.totalHadir++
          if (checkIn) participant.totalCheckIn += parseTimeToMinutes(checkIn)
          if (checkOut) participant.totalCheckOut += parseTimeToMinutes(checkOut)
        } else if (status === "Terlambat") {
          participant.totalTerlambat++
          participant.totalHadir++
          if (checkIn) participant.totalCheckIn += parseTimeToMinutes(checkIn)
          if (checkOut) participant.totalCheckOut += parseTimeToMinutes(checkOut)
        } else if (status === "Izin") {
          participant.totalIzin++
        } else if (status === "Tidak Hadir") {
          participant.totalAbsen++
        }
      })
      
      // Calculate percentages and averages
      const processedData = Array.from(participantMap.values()).map(p => {
        const totalKehadiran = p.totalHadir
        const persenKehadiran = p.daysCount > 0 ? Math.round((totalKehadiran / p.daysCount) * 100) : 0
        
        const rataRataCheckIn = p.totalCheckIn > 0 ? minutesToTime(Math.round(p.totalCheckIn / p.totalHadir)) : "-"
        const rataRataCheckOut = p.totalCheckOut > 0 ? minutesToTime(Math.round(p.totalCheckOut / p.totalHadir)) : "-"
        
        return {
          ...p,
          persenKehadiran,
          rataRataCheckIn,
          rataRataCheckOut
        }
      })
      
      setPresensiData(processedData)
    } catch (err) {
      console.error("Error fetching presensi:", err)
      setError("Gagal memuat data presensi")
      setPresensiData([])
    } finally {
      setLoading(false)
    }
  }

  // Helper: Parse time string to minutes
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0
    const parts = timeStr.split(':')
    if (parts.length >= 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1])
    }
    return 0
  }

  // Helper: Convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  useEffect(() => {
    fetchDivisi()
  }, [])

  useEffect(() => {
    fetchPresensi()
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    let filtered = [...presensiData]
    
    if (selectedDivisi !== "all") {
      filtered = filtered.filter(p => p.divisi === selectedDivisi)
    }
    
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [selectedDivisi, presensiData])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      let url = "/presensi/export"
      const params = new URLSearchParams()
      
      if (selectedMonth && selectedYear) {
        const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
        const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`
        params.append("tanggal_mulai", startDate)
        params.append("tanggal_selesai", endDate)
      }
      
      if (selectedDivisi !== "all") {
        params.append("divisi", selectedDivisi)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await axiosInstance.get(url, {
        responseType: "blob",
      })
      
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', `laporan_presensi_${getMonthName(selectedMonth)}_${selectedYear}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error("Error exporting:", err)
      alert("Gagal mengunduh laporan")
    } finally {
      setIsExporting(false)
    }
  }

  const getMonthName = (month) => {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    return months[month - 1]
  }

  // Statistik
  const stats = {
    total: filteredData.length,
    totalHadir: filteredData.reduce((acc, p) => acc + p.totalHadir, 0),
    rataKehadiran: filteredData.length > 0 
      ? Math.round(filteredData.reduce((acc, p) => acc + p.persenKehadiran, 0) / filteredData.length)
      : 0,
    pesertaExcellent: filteredData.filter(p => p.persenKehadiran >= 95).length
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getKehadiranBadge = (persen) => {
    if (persen >= 95) return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-medium"><Award size={10} /> Excellent</span>
    if (persen >= 80) return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium"><CheckCircle size={10} /> Baik</span>
    if (persen >= 60) return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-medium"><AlertCircle size={10} /> Cukup</span>
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium"><XCircle size={10} /> Kurang</span>
  }

  if (loading && presensiData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Memuat data laporan...</p>
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
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Laporan Rekap Presensi
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Rekap kehadiran peserta per periode
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleExport}
              disabled={isExporting || filteredData.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Unduh Laporan
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
                <UserCheck size={16} className="text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stats.totalHadir}</span>
            </div>
            <p className="text-xs text-slate-500">Total Kehadiran</p>
            <div className="mt-2 h-1 w-8 bg-emerald-500 rounded-full"></div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} className="text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stats.rataKehadiran}%</span>
            </div>
            <p className="text-xs text-slate-500">Rata-rata Kehadiran</p>
            <div className="mt-2 h-1 w-8 bg-purple-500 rounded-full"></div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                <Award size={16} className="text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">{stats.pesertaExcellent}</span>
            </div>
            <p className="text-xs text-slate-500">Excellent (≥95%)</p>
            <div className="mt-2 h-1 w-8 bg-amber-500 rounded-full"></div>
          </div>
        </div>

        {/* ===== FILTERS ===== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-56">
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
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-32">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
            
            {(selectedDivisi !== "all") && (
              <button
                onClick={() => setSelectedDivisi("all")}
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
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hadir</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Terlambat</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Izin</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Absen</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kehadiran</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <FileText size={20} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm">Tidak ada data laporan</p>
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
                      <td className="px-5 py-3 text-center text-sm font-semibold text-emerald-600">
                        {item.totalHadir}
                       </td>
                      <td className="px-5 py-3 text-center text-sm font-semibold text-amber-600">
                        {item.totalTerlambat}
                       </td>
                      <td className="px-5 py-3 text-center text-sm font-semibold text-blue-600">
                        {item.totalIzin}
                       </td>
                      <td className="px-5 py-3 text-center text-sm font-semibold text-red-600">
                        {item.totalAbsen}
                       </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-700">{item.persenKehadiran}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                              style={{ width: `${item.persenKehadiran}%` }}
                            ></div>
                          </div>
                        </div>
                       </td>
                      <td className="px-5 py-3 text-center">
                        {getKehadiranBadge(item.persenKehadiran)}
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
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} peserta
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

        {/* ===== INFO BANNER ===== */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-blue-500" />
            <p className="text-xs text-blue-700">
              <strong className="font-semibold">Informasi:</strong> Laporan ini dihitung berdasarkan data presensi harian peserta magang untuk periode {getMonthName(selectedMonth)} {selectedYear}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LaporanPresensi