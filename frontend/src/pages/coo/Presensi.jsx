import { useState, useEffect, useRef } from "react"
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
  Loader2,
  FileText,
  FileSpreadsheet,
  ChevronDown
} from "lucide-react"
import axiosInstance from "../../api/axios"
import * as XLSX from 'xlsx'
import html2pdf from 'html2pdf.js'
import logo from "../../assets/logo.png"

function Presensi() {
  const [presensiData, setPresensiData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDivisi, setSelectedDivisi] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedPresensi, setSelectedPresensi] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [exportType, setExportType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [divisiList, setDivisiList] = useState([])
  const dropdownRef = useRef(null)
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


  // Format jam saja (HH:MM) - VERSI SEDERHANA
const formatTimeOnly = (time) => {
  if (!time) return "-"
  try {
    // Langsung split 'T' dan ambil 5 karakter pertama dari bagian jam
    const timeStr = String(time)
    if (timeStr.includes('T')) {
      return timeStr.split('T')[1].substring(0, 5)
    }
    if (timeStr.includes(':')) {
      return timeStr.substring(0, 5)
    }
    return "-"
  } catch {
    return "-"
  }
}

  // Format hanya tanggal
  const formatDateOnly = (date) => {
    if (!date) return "-"
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) return "-"
      return dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    } catch {
      return "-"
    }
  }

  // Format tanggal untuk PDF
  const formatDatePDF = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "-"
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    } catch {
      return "-"
    }
  }

  // Load presensi data dari backend
  const fetchPresensi = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let url = "/presensi"
      const params = new URLSearchParams()
      
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)
      if (selectedDivisi !== "all") params.append("divisi", selectedDivisi)
      
      if (params.toString()) url += `?${params.toString()}`
      
      console.log("Fetching presensi from:", url)
      
      const response = await axiosInstance.get(url)
      
      console.log("Presensi response:", response)
      
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
      
      let errorMessage = "Gagal memuat data presensi"
      if (err.response?.status === 404) {
        errorMessage = "API Presensi tidak ditemukan (404)."
      } else if (err.response?.status === 401) {
        errorMessage = "Sesi login telah berakhir. Silakan login kembali."
      } else if (err.response?.status === 403) {
        errorMessage = "Anda tidak memiliki akses ke data presensi."
      } else if (err.response?.status === 500) {
        errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi nanti."
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message === "Request timeout") {
        errorMessage = "Waktu koneksi habis. Server terlalu lama merespon."
      }
      
      setError(errorMessage)
      setPresensiData([])
      setStats({ total: 0, hadir: 0, terlambat: 0, tidakHadir: 0, persenKehadiran: 0 })
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
    
    const persenKehadiran = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : 0
    
    setStats({ total, hadir, terlambat, tidakHadir, persenKehadiran })
  }

  useEffect(() => {
    fetchDivisi()
  }, [])

  useEffect(() => {
    fetchPresensi()
  }, [startDate, endDate, selectedDivisi])

  useEffect(() => {
    let filtered = [...presensiData]
    if (searchTerm) {
      filtered = filtered.filter(p => 
        (getNamaPeserta(p) || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, presensiData])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleViewDetail = (presensi) => {
    setSelectedPresensi(presensi)
    setIsModalOpen(true)
  }

  const showConfirmExport = (type) => {
    setExportType(type)
    setShowConfirmModal(true)
    setShowExportDropdown(false)
  }

  const executeExport = () => {
    setShowConfirmModal(false)
    if (exportType === 'excel') handleExportExcel()
    else if (exportType === 'pdf') handleExportPDF()
    setExportType(null)
  }

  const handleExportExcel = () => {
    setIsExporting(true)
    try {
      const exportData = filteredData.map((item, index) => ({
        "No": index + 1,
        "Nama Peserta": getNamaPeserta(item),
        "Divisi": getDivisiPesertaString(item),
        "Tanggal": formatDateOnly(item.tanggal),
        "Check-In": formatTimeOnly(item.check_in),
        "Check-Out": formatTimeOnly(item.check_out),
        "Status": item.status || "-",
        "Keterlambatan": `${item.keterlambatan || 0} menit`,
        "Device": item.device || "-",
        "Lokasi": item.lokasi || "-"
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Presensi")
      XLSX.writeFile(wb, `rekap_presensi_${new Date().toISOString().split('T')[0]}.xlsx`)
      alert("Laporan berhasil diunduh dalam format Excel")
    } catch (err) {
      console.error("Error exporting to Excel:", err)
      alert("Gagal mengunduh laporan presensi dalam format Excel")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = () => {
    setIsExporting(true)
    try {
      const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      const startDateFormatted = startDate ? formatDatePDF(startDate) : "Semua"
      const endDateFormatted = endDate ? formatDatePDF(endDate) : "Semua"
      
      const element = document.createElement('div')
      element.style.padding = '30px'
      element.style.fontFamily = "'Times New Roman', Arial, sans-serif"
      element.style.backgroundColor = 'white'
      
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
            <img src="${logo}" alt="Logo" style="height: 60px;" />
            <div style="text-align: left;">
              <h1 style="color: #1e3a5f; margin: 0;">PT KUANTA PRIMA INDONESIA</h1>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 10px;">Jl. Gayungsari IV No. 33 Surabaya</p>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-bottom: 25px;">
          <h2>LAPORAN REKAP PRESENSI PESERTA MAGANG</h2>
          <p>Periode: ${startDateFormatted} s/d ${endDateFormatted}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr><th>No</th><th>Nama</th><th>Divisi</th><th>Tanggal</th><th>Check-In</th><th>Check-Out</th><th>Status</th><th>Telat</th></tr>
          </thead>
          <tbody>
            ${filteredData.map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${escapeHtml(getNamaPeserta(item))}</td>
                <td>${escapeHtml(getDivisiPesertaString(item))}</td>
                <td>${formatDateOnly(item.tanggal)}</td>
                <td>${formatTimeOnly(item.check_in)}</td>
                <td>${formatTimeOnly(item.check_out)}</td>
                <td>${item.status || '-'}</td>
                <td>${item.keterlambatan || 0} menit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
      
      html2pdf().set({ margin: 0.5, filename: `rekap_presensi_${new Date().toISOString().split('T')[0]}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' } }).from(element).save()
      alert("Laporan berhasil diunduh dalam format PDF")
    } catch (err) {
      console.error("Error exporting to PDF:", err)
      alert("Gagal mengunduh laporan presensi dalam format PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const escapeHtml = (text) => {
    if (!text) return ''
    return String(text).replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;'
      if (m === '<') return '&lt;'
      if (m === '>') return '&gt;'
      return m
    })
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedDivisi("all")
    setStartDate("")
    setEndDate("")
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase()
    if (s === "hadir") return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-medium"><CheckCircle size={10} /> Hadir</span>
    if (s === "terlambat") return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-medium"><AlertCircle size={10} /> Terlambat</span>
    if (s === "tidak hadir" || s === "tidak_hadir") return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium"><XCircle size={10} /> Tidak Hadir</span>
    if (s === "izin") return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium"><ClockIcon size={10} /> Izin</span>
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">-</span>
  }

  const getNamaPeserta = (item) => {
    return item.peserta?.nama || item.nama || "-"
  }

  const getDivisiPesertaString = (item) => {
    const divisi = item.peserta?.divisi || item.divisi || "-"
    if (typeof divisi === 'object') {
      return divisi.nama_divisi || divisi.nama || "-"
    }
    return divisi
  }

  const getDivisiName = (div) => {
    if (!div) return "-"
    if (typeof div === 'object') {
      return div.nama_divisi || div.nama || "-"
    }
    return div
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
        
        {/* CONFIRMATION MODAL */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-zoomIn">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl"></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Download className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800">Konfirmasi Unduh Laporan</h3>
                  </div>
                  <p className="text-slate-600 mb-6">
                    Apakah Anda yakin ingin mengunduh laporan presensi dalam format <strong className="text-blue-600">{exportType?.toUpperCase()}</strong>?
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowConfirmModal(false); setExportType(null) }} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50">Batal</button>
                    <button onClick={executeExport} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-medium hover:shadow-lg">Ya, Unduh</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">Data Presensi Peserta</h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span>Monitor kehadiran peserta magang secara real-time</p>
                </div>
              </div>
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setShowExportDropdown(!showExportDropdown)} disabled={isExporting || filteredData.length === 0} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50">
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Unduh Laporan
                <ChevronDown size={16} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                  <button onClick={() => showConfirmExport('excel')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50"><FileSpreadsheet size={16} className="text-emerald-600" />Export ke Excel</button>
                  <button onClick={() => showConfirmExport('pdf')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 border-t border-slate-100"><FileText size={16} className="text-red-600" />Export ke PDF</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><div className="flex items-center justify-between mb-2"><div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center"><Users size={16} className="text-blue-600" /></div><span className="text-2xl font-bold text-slate-800">{stats.total}</span></div><p className="text-xs text-slate-500">Total Presensi</p><div className="mt-2 h-1 w-8 bg-blue-500 rounded-full"></div></div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><div className="flex items-center justify-between mb-2"><div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center"><CheckCircle size={16} className="text-emerald-600" /></div><span className="text-2xl font-bold text-slate-800">{stats.hadir}</span></div><p className="text-xs text-slate-500">Hadir Tepat Waktu</p><div className="mt-2 h-1 w-8 bg-emerald-500 rounded-full"></div></div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><div className="flex items-center justify-between mb-2"><div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center"><AlertCircle size={16} className="text-amber-600" /></div><span className="text-2xl font-bold text-slate-800">{stats.terlambat}</span></div><p className="text-xs text-slate-500">Terlambat</p><div className="mt-2 h-1 w-8 bg-amber-500 rounded-full"></div></div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><div className="flex items-center justify-between mb-2"><div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center"><BarChart3 size={16} className="text-purple-600" /></div><span className="text-2xl font-bold text-slate-800">{stats.persenKehadiran}%</span></div><p className="text-xs text-slate-500">Kehadiran</p><div className="mt-2 h-1 w-8 bg-purple-500 rounded-full"></div></div>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input type="text" placeholder="Cari peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div></div>
            <div className="w-full md:w-48">
              <select value={selectedDivisi} onChange={(e) => setSelectedDivisi(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
                <option value="all">Semua Divisi</option>
                {divisiList.map((div) => (
                  <option key={div.id_divisi || div.id} value={getDivisiName(div)}>
                    {getDivisiName(div)}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-48"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            <div className="w-full md:w-48"><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            {(searchTerm || selectedDivisi !== "all" || startDate || endDate) && <button onClick={resetFilters} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700">Reset Filter</button>}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1"><p className="text-sm text-red-700 font-medium mb-1">Error Memuat Data</p><p className="text-sm text-red-600">{error}</p></div>
              <button onClick={fetchPresensi} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs font-medium">Coba Lagi</button>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Divisi</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-In</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-Out</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center">
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
                          {getDivisiPesertaString(item)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">
                        {formatDateOnly(item.tanggal)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-slate-600">{formatTimeOnly(item.check_in)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-slate-600">{formatTimeOnly(item.check_out)}</span>
                      </td>
                      <td className="px-5 py-3">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => handleViewDetail(item)} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition">
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
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50">
                  <ChevronLeft size={14} />
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) return null;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL DETAIL PRESENSI */}
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
                    <p className="text-[10px] text-slate-400">{formatDateOnly(selectedPresensi.tanggal)}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {getNamaPeserta(selectedPresensi).charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{getNamaPeserta(selectedPresensi)}</h4>
                    <p className="text-xs text-slate-500">{getDivisiPesertaString(selectedPresensi)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <ClockIcon size={14} className="text-blue-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500">Check-In</p>
                    <p className="text-sm text-slate-700">{formatTimeOnly(selectedPresensi.check_in)}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <ClockIcon size={14} className="text-indigo-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500">Check-Out</p>
                    <p className="text-sm text-slate-700">{formatTimeOnly(selectedPresensi.check_out)}</p>
                  </div>
                </div>
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
                {selectedPresensi.daily_report && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] font-medium text-slate-500 mb-1">Daily Report</p>
                    <p className="text-sm text-slate-700">{selectedPresensi.daily_report}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                <button onClick={() => setIsModalOpen(false)} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes zoomIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}.animate-zoomIn{animation:zoomIn 0.3s ease-out}`}</style>
    </div>
  )
}

export default Presensi