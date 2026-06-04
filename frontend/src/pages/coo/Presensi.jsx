import { useState, useEffect, useRef, useCallback } from "react"
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
  BarChart3,
  UserCheck,
  Clock as ClockIcon,
  X,
  Loader2,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  AlertTriangle
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
  
  // Filter status kehadiran
  const [selectedStatus, setSelectedStatus] = useState("all")
  
  // Filter tanggal
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  const [selectedPresensi, setSelectedPresensi] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState(null)
  const [divisiList, setDivisiList] = useState([])
  const dropdownRef = useRef(null)
  
  // STATS UNTUK DATA YANG DIFILTER (bukan semua data)
  const [stats, setStats] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    izin: 0,
    tidakHadir: 0,
    persenKehadiran: 0
  })
  
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  
  const itemsPerPage = 10

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toast.show])

  const getDateRangeDays = () => {
    let start = startDate
    let end = endDate
    
    if (startDate && !endDate) {
      start = startDate
      end = startDate
    }
    if (!startDate && endDate) {
      start = endDate
      end = endDate
    }
    
    if (!start || !end) return 0
    const startObj = new Date(start)
    const endObj = new Date(end)
    
    if (startObj > endObj) return 0
    
    const diffTime = endObj - startObj
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }

  // Fetch divisi list - HANYA DIVISI AKTIF
  const fetchDivisi = async () => {
    try {
      const response = await axiosInstance.get("/divisi")
      let divisiData = []
      if (response.data && response.data.success && response.data.data) {
        divisiData = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        divisiData = response.data
      }
      
      // Filter hanya divisi dengan status aktif
      const aktifDivisi = divisiData.filter((div) => {
        const status = String(div.status || "")
          .toLowerCase()
          .trim()
        
        return (
          status === "aktif" ||
          status === "active" ||
          div.status === 1 ||
          div.status === true
        )
      })
      
      setDivisiList(aktifDivisi)
    } catch (err) {
      console.error("Error fetching divisi:", err)
      setDivisiList([])
    }
  }

  const formatTimeOnly = (time) => {
    if (!time) return "-"
    try {
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

  const getNormalizedStatus = (item) => {
    const status = (item.status || item.status_kehadiran || "").toString().toLowerCase()
    if (status === "hadir") return "hadir"
    if (status === "terlambat") return "terlambat"
    if (status === "izin") return "izin"
    if (status === "sakit") return "izin" // treat sakit as izin for counting
    return "tidak_hadir"
  }

  const getDivisiPesertaString = useCallback((item) => {
    // Cek dari peserta.divisi terlebih dahulu
    if (item.peserta?.divisi) {
      if (typeof item.peserta.divisi === "object") {
        return item.peserta.divisi.nama_divisi || item.peserta.divisi.nama || "-"
      }
      return item.peserta.divisi
    }

    // Cek dari divisi langsung
    if (item.divisi) {
      if (typeof item.divisi === "object") {
        return item.divisi.nama_divisi || item.divisi.nama || "-"
      }
      return item.divisi
    }

    return "-"
  }, [])

  const getNamaPeserta = useCallback((item) => {
    return item.peserta?.nama || item.nama || "-"
  }, [])

  // Fungsi untuk menghitung statistik dari data yang difilter
  const calculateStatsFromData = useCallback((data) => {
    const total = data.length
    let hadir = 0
    let terlambat = 0
    let izin = 0
    let tidakHadir = 0
    
    for (let i = 0; i < data.length; i++) {
      const status = getNormalizedStatus(data[i])
      if (status === "hadir") {
        hadir++
      } else if (status === "terlambat") {
        terlambat++
      } else if (status === "izin") {
        izin++
      } else {
        tidakHadir++
      }
    }
    
    const persenKehadiran = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : 0
    
    setStats({ total, hadir, terlambat, izin, tidakHadir, persenKehadiran })
  }, [])

  // Load presensi data - TANPA PARAMS DIVISI KE BACKEND
  const fetchPresensi = async () => {
    setLoading(true)
    setError(null)
    setLoadingProgress(0)
    
    try {
      let url = "/presensi"
      const params = new URLSearchParams()
      
      // HANYA filter tanggal ke backend
      if (startDate && !endDate) {
        params.append("start_date", startDate)
        params.append("end_date", startDate)
      } else if (!startDate && endDate) {
        params.append("start_date", endDate)
        params.append("end_date", endDate)
      } else {
        if (startDate) params.append("start_date", startDate)
        if (endDate) params.append("end_date", endDate)
      }
      
      // TIDAK ADA params.append("divisi", selectedDivisi) - FILTER DIVISI DI FRONTEND SAJA
      
      if (params.toString()) url += `?${params.toString()}`
      
      console.log("Fetching presensi from:", url)
      
      const response = await axiosInstance.get(url)
      
      let presensiList = []
      if (response.data && response.data.success && response.data.data) {
        presensiList = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        presensiList = response.data
      }
      
      // Batasi jumlah data
      let processedList = presensiList
      if (presensiList.length > 5000) {
        console.warn(`Data terlalu banyak (${presensiList.length}), hanya menampilkan 5000 data terbaru`)
        processedList = presensiList.slice(0, 5000)
        setToast({ 
          show: true, 
          message: `Data presensi terlalu banyak (${presensiList.length}). Hanya menampilkan 5000 data terbaru.`, 
          type: "warning" 
        })
      }
      
      setPresensiData(processedList)
      setLoadingProgress(100)
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
      }
      
      setError(errorMessage)
      setPresensiData([])
      setStats({ total: 0, hadir: 0, terlambat: 0, izin: 0, tidakHadir: 0, persenKehadiran: 0 })
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedDivisi("all")
    setSelectedStatus("all")
    setStartDate("")
    setEndDate("")
  }

  useEffect(() => {
    fetchDivisi()
  }, [])

  useEffect(() => {
    fetchPresensi()
  }, [startDate, endDate]) // HANYA startDate dan endDate, TIDAK selectedDivisi

  // Filter, sorting, DAN hitung statistik dari data yang sudah difilter
  useEffect(() => {
    const processData = () => {
      let filtered = [...presensiData]
      
      // Filter search nama
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        filtered = filtered.filter(p => 
          (getNamaPeserta(p) || "").toLowerCase().includes(searchLower)
        )
      }
      
      // ========== FILTER DIVISI DI FRONTEND ==========
      if (selectedDivisi !== "all") {
        filtered = filtered.filter((item) => {
          const rawDivisi = item.peserta?.divisi || item.divisi || "-"
          
          let namaDivisi = "-"
          
          if (typeof rawDivisi === "string") {
            namaDivisi = rawDivisi
          } else if (typeof rawDivisi === "object" && rawDivisi !== null) {
            namaDivisi = rawDivisi.nama_divisi || rawDivisi.nama || "-"
          }
          
          return String(namaDivisi) === String(selectedDivisi)
        })
      }
      
      // Filter status kehadiran
      if (selectedStatus !== "all") {
        filtered = filtered.filter(p => 
          getNormalizedStatus(p) === selectedStatus
        )
      }
      
      // Sorting default: terbaru
      filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      
      setFilteredData(filtered)
      
      // HITUNG STATISTIK DARI DATA YANG SUDAH DIFILTER
      calculateStatsFromData(filtered)
      
      setCurrentPage(1)
    }
    
    const timeoutId = setTimeout(processData, 0)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, presensiData, selectedDivisi, selectedStatus, getNamaPeserta, calculateStatsFromData])

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

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      setToast({ show: true, message: "Tidak ada data untuk diexport", type: "error" })
      return
    }
    
    let dataToExport = filteredData
    if (filteredData.length > 10000) {
      dataToExport = filteredData.slice(0, 10000)
      setToast({ 
        show: true, 
        message: `Data terlalu banyak (${filteredData.length}). Hanya 10000 data pertama yang diexport.`, 
        type: "warning" 
      })
    }
    
    setIsExporting(true)
    try {
      const exportData = dataToExport.map((item, index) => ({
        "No": index + 1,
        "Nama Peserta": getNamaPeserta(item),
        "Divisi": getDivisiPesertaString(item),
        "Tanggal": formatDateOnly(item.tanggal),
        "Check-In": formatTimeOnly(item.check_in),
        "Check-Out": formatTimeOnly(item.check_out),
        "Status": item.status || item.status_kehadiran || "-",
        "Keterlambatan": `${item.keterlambatan || 0} menit`,
        "Device": item.device || "-",
        "Lokasi": item.lokasi || "-"
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Presensi")
      
      let periodText = "semua_periode"
      if (startDate && !endDate) periodText = startDate
      else if (!startDate && endDate) periodText = endDate
      else if (startDate && endDate) periodText = `${startDate}_sampai_${endDate}`
      
      XLSX.writeFile(wb, `rekap_presensi_${periodText}.xlsx`)
    } catch (err) {
      console.error("Error exporting to Excel:", err)
      setToast({ show: true, message: "Gagal mengunduh laporan Excel", type: "error" })
    } finally {
      setIsExporting(false)
      setShowExportDropdown(false)
    }
  }

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      setToast({ show: true, message: "Tidak ada data untuk diexport", type: "error" })
      return
    }
    
    if (filteredData.length > 1000) {
      setToast({ 
        show: true, 
        message: `Data terlalu banyak (${filteredData.length}) untuk PDF. Maksimal 1000 data.`, 
        type: "warning" 
      })
      setShowExportDropdown(false)
      return
    }
    
    const rangeDays = getDateRangeDays()
    const MAX_DAYS = 90
    
    if (rangeDays > MAX_DAYS) {
      setToast({ 
        show: true, 
        message: `Rentang waktu ${rangeDays} hari melebihi batas maksimal PDF (3 bulan).`, 
        type: "warning" 
      })
      setShowExportDropdown(false)
      return
    }
    
    executePDFExport()
    setShowExportDropdown(false)
  }

  const executePDFExport = () => {
    setIsExporting(true)
    try {
      let periodeText = ""
      if (startDate && !endDate) {
        periodeText = `Tanggal: ${formatDatePDF(startDate)}`
      } else if (!startDate && endDate) {
        periodeText = `Tanggal: ${formatDatePDF(endDate)}`
      } else if (startDate && endDate) {
        periodeText = `Periode: ${formatDatePDF(startDate)} s/d ${formatDatePDF(endDate)}`
      } else {
        periodeText = "Periode: Semua Data"
      }
      
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
          <p>${periodeText}</p>
          <p style="color: #64748b; font-size: 10px;">Total Data: ${filteredData.length} presensi</p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #ddd; padding: 8px;">No</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Nama</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Divisi</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Tanggal</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Check-In</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Check-Out</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Telat</th>
             </tr>
          </thead>
          <tbody>
            ${filteredData.slice(0, 1000).map((item, idx) => {
              const nama = (getNamaPeserta(item) || '-').replace(/[&<>]/g, '')
              const divisi = (getDivisiPesertaString(item) || '-').replace(/[&<>]/g, '')
              return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${idx + 1}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${nama}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${divisi}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${formatDateOnly(item.tanggal)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${formatTimeOnly(item.check_in)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${formatTimeOnly(item.check_out)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.status || item.status_kehadiran || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.keterlambatan || 0} menit</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      `
      
      html2pdf().set({ 
        margin: 0.5, 
        filename: `rekap_presensi_${new Date().toISOString().split('T')[0]}.pdf`, 
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 2 }, 
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' } 
      }).from(element).save()
    } catch (err) {
      console.error("Error exporting to PDF:", err)
      setToast({ show: true, message: "Gagal mengunduh laporan PDF", type: "error" })
    } finally {
      setIsExporting(false)
    }
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase()
    if (s === "hadir") return <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-medium">Hadir</span>
    if (s === "terlambat") return <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-medium">Terlambat</span>
    if (s === "izin") return <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">Izin</span>
    return <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">Tidak Hadir</span>
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
          {loadingProgress > 0 && loadingProgress < 100 && (
            <div className="mt-3 w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* TOAST NOTIFICATION */}
        {toast.show && (
          <div className="fixed top-5 right-5 z-50 animate-slide-in-right">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === "warning" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
            }`}>
              {toast.type === "warning" && <AlertTriangle size={18} className="text-amber-600" />}
              {toast.type === "error" && <AlertCircle size={18} className="text-red-600" />}
              <p className={`text-sm ${toast.type === "warning" ? "text-amber-800" : "text-red-800"}`}>
                {toast.message}
              </p>
              <button onClick={() => setToast({ show: false, message: "", type: "" })} className="ml-2 p-0.5 hover:bg-white/50 rounded-lg transition">
                <X size={14} className="text-slate-500" />
              </button>
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
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                    Monitor kehadiran peserta magang secara real-time
                    {filteredData.length > 0 && (
                      <span className="ml-2 text-blue-500">• {filteredData.length.toLocaleString()} data ditampilkan</span>
                    )}
                  </p>
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
                  <button onClick={handleExportExcel} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 transition">
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                    Export ke Excel
                  </button>
                  <button onClick={handleExportPDF} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 border-t border-slate-100 transition">
                    <FileText size={16} className="text-red-600" />
                    Export ke PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STATS CARDS - Menampilkan statistik dari data yang sudah difilter */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center"><Users size={16} className="text-blue-600" /></div>
              <span className="text-2xl font-bold text-slate-800">{stats.total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500">Total Presensi</p>
            <div className="mt-2 h-1 w-8 bg-blue-500 rounded-full"></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center"><CheckCircle size={16} className="text-emerald-600" /></div>
              <span className="text-2xl font-bold text-emerald-600">{stats.hadir.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500">Hadir</p>
            <div className="mt-2 h-1 w-8 bg-emerald-500 rounded-full"></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center"><AlertCircle size={16} className="text-amber-600" /></div>
              <span className="text-2xl font-bold text-amber-600">{stats.terlambat.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500">Terlambat</p>
            <div className="mt-2 h-1 w-8 bg-amber-500 rounded-full"></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center"><ClockIcon size={16} className="text-sky-600" /></div>
              <span className="text-2xl font-bold text-sky-600">{stats.izin.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500">Izin/Sakit</p>
            <div className="mt-2 h-1 w-8 bg-sky-500 rounded-full"></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center"><BarChart3 size={16} className="text-purple-600" /></div>
              <span className="text-2xl font-bold text-purple-600">{stats.persenKehadiran}%</span>
            </div>
            <p className="text-xs text-slate-500">Kehadiran</p>
            <div className="mt-2 h-1 w-8 bg-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* FILTERS - same as before */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Cari Peserta</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Nama peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label className="text-xs text-slate-500 mb-1 block">Divisi</label>
              <select value={selectedDivisi} onChange={(e) => setSelectedDivisi(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
                <option value="all">Semua Divisi</option>
                {divisiList.map((div) => (
                  <option key={div.id_divisi || div.id} value={div.nama_divisi || div.nama}>
                    {div.nama_divisi || div.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <label className="text-xs text-slate-500 mb-1 block">Status Kehadiran</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
                <option value="all">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="terlambat">Terlambat</option>
                <option value="izin">Izin</option>
                <option value="tidak_hadir">Tidak Hadir</option>
              </select>
            </div>

            <div className="w-full md:w-48">
              <label className="text-xs text-slate-500 mb-1 block">Dari Tanggal</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            
            <div className="w-full md:w-48">
              <label className="text-xs text-slate-500 mb-1 block">Sampai Tanggal</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>

            {(searchTerm || selectedDivisi !== "all" || selectedStatus !== "all" || startDate || endDate) && (
              <div className="flex items-end">
                <button onClick={resetFilters} className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition">
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          {(startDate || endDate) && (
            <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
              <Calendar size={12} />
              <span>Rentang waktu: {getDateRangeDays()} hari</span>
            </div>
          )}
          
          {selectedStatus !== "all" && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter aktif:</span>
              <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-medium">
                {selectedStatus === "hadir" && "Hadir"}
                {selectedStatus === "terlambat" && "Terlambat"}
                {selectedStatus === "izin" && "Izin"}
                {selectedStatus === "tidak_hadir" && "Tidak Hadir"}
              </span>
            </div>
          )}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-medium mb-1">Error Memuat Data</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <button onClick={fetchPresensi} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs font-medium transition">
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* TABLE - same as before */}
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
                        {(searchTerm || selectedDivisi !== "all" || selectedStatus !== "all" || startDate || endDate) && (
                          <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2">
                            Reset Filter
                          </button>
                        )}
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
                        {getStatusBadge(item.status || item.status_kehadiran)}
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
                Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length.toLocaleString()} data
              </p>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition">
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
                      <button key={i} onClick={() => setCurrentPage(pageNum)} className={`w-7 h-7 rounded-lg text-xs font-medium transition ${currentPage === pageNum ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL DETAIL PRESENSI - same as before */}
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
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
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
                
                {/* FOTO CHECK-IN */}
                {selectedPresensi.foto_checkin && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] font-medium text-slate-500 mb-2">Foto Check-In</p>
                    <div className="relative group">
                      <img 
                        src={selectedPresensi.foto_checkin} 
                        alt="Foto Check-in"
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                        onClick={() => window.open(selectedPresensi.foto_checkin, '_blank')}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="2" y="2" width="20" height="20" rx="2.18"%3E%3C/rect%3E%3Cpath d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"%3E%3C/path%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/70 px-3 py-1.5 rounded-full">
                          Klik untuk memperbesar
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
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
                    <div className="mt-1">{getStatusBadge(selectedPresensi.status || selectedPresensi.status_kehadiran)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Keterlambatan</p>
                    <p className="text-sm font-medium text-slate-700">{selectedPresensi.keterlambatan || 0} menit</p>
                  </div>
                </div>
                
                {selectedPresensi.jenis_kehadiran && (
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Jenis Kehadiran</p>
                    <p className="text-sm font-medium text-slate-700">
                      {selectedPresensi.jenis_kehadiran === 'wfo' && 'WFO (Work From Office)'}
                      {selectedPresensi.jenis_kehadiran === 'wfh' && 'WFH (Work From Home)'}
                      {selectedPresensi.jenis_kehadiran === 'izin' && 'Izin'}
                      {selectedPresensi.jenis_kehadiran === 'sakit' && 'Sakit'}
                      {!selectedPresensi.jenis_kehadiran && '-'}
                    </p>
                  </div>
                )}
                
                {selectedPresensi.alasan_izin && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <p className="text-[10px] font-medium text-amber-600 mb-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Alasan Izin/Sakit
                    </p>
                    <p className="text-sm text-slate-700">{selectedPresensi.alasan_izin}</p>
                  </div>
                )}
                
                {selectedPresensi.lokasi && (
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Lokasi Check-In</p>
                    <p className="text-xs text-slate-600 break-words">{selectedPresensi.lokasi}</p>
                  </div>
                )}
                
                {selectedPresensi.daily_report && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] font-medium text-slate-500 mb-1">Daily Report</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedPresensi.daily_report}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex gap-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Presensi