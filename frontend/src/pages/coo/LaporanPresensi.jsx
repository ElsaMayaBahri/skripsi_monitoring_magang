// frontend/src/pages/coo/LaporanPresensi.jsx
import { useState, useEffect, useRef } from "react"
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
  Loader2,
  FileSpreadsheet,
  ChevronDown,
  AlertTriangle
} from "lucide-react"
import { getAllPresensi, exportPresensiReport } from "../../api/coo/presensiService"
import * as XLSX from 'xlsx'
import html2pdf from 'html2pdf.js'
import logo from "../../assets/logo.png"
import axiosInstance from "../../api/axios"

// Helper function untuk menormalisasi divisi (string atau object)
const normalizeDivisi = (divisi) => {
  if (!divisi) return "-"
  if (typeof divisi === "string") return divisi
  if (typeof divisi === "object" && divisi !== null) {
    return divisi.nama_divisi || divisi.nama || "-"
  }
  return "-"
}

// Helper function untuk mendapatkan status (support kedua field)
const getStatusValue = (item) => {
  return (item.status || item.status_kehadiran || "").toString().toLowerCase()
}

function LaporanPresensi() {
  const [presensiData, setPresensiData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedDivisi, setSelectedDivisi] = useState("all")
  const [searchNama, setSearchNama] = useState("")
  const [divisiList, setDivisiList] = useState([])
  const [isExporting, setIsExporting] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const dropdownRef = useRef(null)
  
  // Toast notification state - hanya untuk warning/error
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  
  const itemsPerPage = 10

  // Auto hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toast.show])

  // Hitung rentang hari
  const getDateRangeDays = () => {
    if (!startDate && !endDate) return 0
    const start = startDate ? new Date(startDate) : new Date()
    const end = endDate ? new Date(endDate) : new Date()
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Fetch divisi list
  const fetchDivisi = async () => {
    try {
      const response = await axiosInstance.get("/divisi/aktif")
      let divisiData = []
      if (response.data && response.data.success && response.data.data) {
        divisiData = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        divisiData = response.data
      }
      setDivisiList(divisiData)
    } catch (err) {
      console.error("Error fetching divisi:", err)
      setDivisiList([])
    }
  }

  // Helper: Parse time string to minutes
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0
    if (typeof timeStr === 'string' && timeStr.includes(':')) {
      const parts = timeStr.split(':')
      if (parts.length >= 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1])
      }
    }
    return 0
  }

  // Helper: Convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "-"
      return date.toLocaleDateString("id-ID", {
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

  // Fetch presensi data from backend
  const fetchPresensi = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAllPresensi()
      
      console.log("Response dari API:", response)
      
      let presensiList = []
      if (response && response.success && response.data) {
        presensiList = response.data
      } else if (response && Array.isArray(response)) {
        presensiList = response
      } else if (response && response.data && Array.isArray(response.data)) {
        presensiList = response.data
      }
      
      console.log("Presensi list:", presensiList)
      
      // Filter berdasarkan tanggal jika ada
      let filteredByDate = presensiList
      if (startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59)
        
        filteredByDate = presensiList.filter(item => {
          const itemDate = new Date(item.tanggal || item.created_at)
          return itemDate >= start && itemDate <= end
        })
      } else if (startDate) {
        const start = new Date(startDate)
        const end = new Date(startDate)
        end.setHours(23, 59, 59)
        
        filteredByDate = presensiList.filter(item => {
          const itemDate = new Date(item.tanggal || item.created_at)
          return itemDate >= start && itemDate <= end
        })
      }
      
      // Process data to calculate summary per participant
      const participantMap = new Map()
      
      filteredByDate.forEach(item => {
        const nama = item.peserta?.nama || item.nama || "-"
        
        // Normalisasi divisi
        const rawDivisi = item.peserta?.divisi || item.divisi || "-"
        let divisi = "-"
        if (typeof rawDivisi === "string") {
          divisi = rawDivisi
        } else if (typeof rawDivisi === "object" && rawDivisi !== null) {
          divisi = rawDivisi.nama_divisi || rawDivisi.nama || "-"
        }
        
        const status = (item.status || item.status_kehadiran || "").toString().toLowerCase()
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
        
        if (status === "hadir") {
          participant.totalHadir++
          if (checkIn) participant.totalCheckIn += parseTimeToMinutes(checkIn)
          if (checkOut) participant.totalCheckOut += parseTimeToMinutes(checkOut)
        } else if (status === "terlambat") {
          participant.totalTerlambat++
          participant.totalHadir++
          if (checkIn) participant.totalCheckIn += parseTimeToMinutes(checkIn)
          if (checkOut) participant.totalCheckOut += parseTimeToMinutes(checkOut)
        } else if (status === "izin") {
          participant.totalIzin++
        } else {
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
      setError(err.response?.data?.message || err.message || "Gagal memuat data presensi")
      setPresensiData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDivisi()
  }, [])

  useEffect(() => {
    fetchPresensi()
  }, [startDate, endDate])

  useEffect(() => {
    let filtered = [...presensiData]
    
    if (selectedDivisi !== "all") {
      filtered = filtered.filter((p) => {
        const namaDivisi = typeof p.divisi === "object" 
          ? (p.divisi?.nama_divisi || p.divisi?.nama) 
          : p.divisi
        return String(namaDivisi) === String(selectedDivisi)
      })
    }
    
    if (searchNama.trim() !== "") {
      filtered = filtered.filter((p) => 
        p.nama?.toLowerCase().includes(searchNama.toLowerCase())
      )
    }
    
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [selectedDivisi, presensiData, searchNama])

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset filters
  const resetFilters = () => {
    setStartDate("")
    setEndDate("")
    setSelectedDivisi("all")
    setSearchNama("")
  }

  // Export ke Excel - LANGSUNG DOWNLOAD TANPA POPUP DAN TANPA ALERT
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      setToast({ show: true, message: "Tidak ada data untuk diexport", type: "error" })
      return
    }
    
    setIsExporting(true)
    try {
      const exportData = filteredData.map((item, index) => {
        const divisiName = typeof item.divisi === "object" 
          ? (item.divisi?.nama_divisi || item.divisi?.nama || "-")
          : (item.divisi || "-")
        
        return {
          "No": index + 1,
          "Nama Peserta": item.nama,
          "Divisi": divisiName,
          "Hadir": item.totalHadir,
          "Terlambat": item.totalTerlambat,
          "Izin": item.totalIzin,
          "Absen": item.totalAbsen,
          "Persentase Kehadiran": `${item.persenKehadiran}%`
        }
      })

      const ws = XLSX.utils.json_to_sheet(exportData)
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // No
        { wch: 25 },  // Nama Peserta
        { wch: 20 },  // Divisi
        { wch: 8 },   // Hadir
        { wch: 12 },  // Terlambat
        { wch: 8 },   // Izin
        { wch: 8 },   // Absen
        { wch: 20 }   // Persentase Kehadiran
      ]
      
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Presensi")
      
      const periodText = startDate && endDate ? `periode_${startDate}_sampai_${endDate}` : "semua_periode"
      const fileName = `laporan_presensi_${periodText}.xlsx`
      XLSX.writeFile(wb, fileName)
      
      // Tidak menampilkan alert sukses
    } catch (err) {
      console.error("Error exporting to Excel:", err)
      setToast({ show: true, message: "Gagal mengunduh laporan Excel", type: "error" })
    } finally {
      setIsExporting(false)
      setShowExportDropdown(false)
    }
  }

  // CEK RENTANG UNTUK PDF - hanya tampilkan warning jika gagal
  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      setToast({ show: true, message: "Tidak ada data untuk diexport", type: "error" })
      return
    }
    
    const rangeDays = getDateRangeDays()
    const THREE_MONTHS = 90
    const MAX_DATA_FOR_PDF = 500
    
    // Jika data terlalu banyak, tampilkan toast warning dan BATAL download
    if (filteredData.length > MAX_DATA_FOR_PDF) {
      setToast({ 
        show: true, 
        message: `Data terlalu banyak (${filteredData.length} peserta). Disarankan menggunakan format Excel untuk data dalam jumlah banyak.`, 
        type: "warning" 
      })
      setShowExportDropdown(false)
      return
    }
    
    // Jika rentang > 3 bulan, tampilkan toast warning dan BATAL download
    if (rangeDays > THREE_MONTHS) {
      setToast({ 
        show: true, 
        message: `Rentang waktu terlalu panjang (${rangeDays} hari). Disarankan menggunakan format Excel untuk data dalam jumlah banyak.`, 
        type: "warning" 
      })
      setShowExportDropdown(false)
      return
    }
    
    // Jika valid, langsung download PDF (tanpa alert sukses)
    executePDFExport()
    setShowExportDropdown(false)
  }

  // EKSEKUSI DOWNLOAD PDF
  const executePDFExport = () => {
    setIsExporting(true)
    
    try {
      const pdfStats = {
        total: filteredData.length,
        totalHadir: filteredData.reduce((acc, p) => acc + p.totalHadir, 0),
        rataKehadiran: filteredData.length > 0 
          ? Math.round(filteredData.reduce((acc, p) => acc + p.persenKehadiran, 0) / filteredData.length)
          : 0
      }
      
      const today = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      
      const startDateFormatted = startDate ? formatDatePDF(startDate) : "Semua"
      const endDateFormatted = endDate ? formatDatePDF(endDate) : "Semua"
      
      const element = document.createElement('div')
      element.style.padding = '30px'
      element.style.fontFamily = "'Times New Roman', Arial, sans-serif"
      element.style.backgroundColor = 'white'
      
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
            <img src="${logo}" alt="Logo Perusahaan" style="height: 60px; width: auto;" />
            <div style="text-align: left;">
              <h1 style="color: #1e3a5f; margin: 0; font-size: 24px;">PT KUANTA PRIMA INDONESIA</h1>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 10px;">Jl. Gayungsari IV No. 33 Surabaya</p>
              <p style="color: #64748b; margin: 2px 0 0 0; font-size: 10px;">+62 821-4338-0273 | partnership@kuanta.id</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #1e293b; margin: 0; font-size: 20px;">LAPORAN REKAP PRESENSI PESERTA MAGANG</h2>
          <p style="color: #64748b; margin: 8px 0 0 0; font-size: 12px;">Periode: ${startDateFormatted} s/d ${endDateFormatted}</p>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 11px;">Divisi: ${selectedDivisi === 'all' ? 'Semua Divisi' : selectedDivisi}</p>
          ${searchNama ? `<p style="color: #64748b; margin: 4px 0 0 0; font-size: 11px;">Pencarian: ${searchNama}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px; text-align: right;">
          <p style="color: #94a3b8; font-size: 10px; margin: 0;">Dicetak: ${today}</p>
        </div>
        
        <div style="display: flex; gap: 15px; margin-bottom: 25px; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #2563eb;">${pdfStats.total}</div>
            <div style="font-size: 10px; color: #64748b;">Total Peserta</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #16a34a;">${pdfStats.totalHadir}</div>
            <div style="font-size: 10px; color: #64748b;">Total Kehadiran</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: bold; color: #7c3aed;">${pdfStats.rataKehadiran}%</div>
            <div style="font-size: 10px; color: #64748b;">Rata-rata Kehadiran</div>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background-color: #1e3a5f;">
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">No</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: left;">Nama Peserta</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: left;">Divisi</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Hadir</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Terlambat</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Izin</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Absen</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; color: white; text-align: center;">Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((item, index) => {
              const divisiName = typeof item.divisi === "object" 
                ? (item.divisi?.nama_divisi || item.divisi?.nama || "-")
                : (item.divisi || "-")
              
              return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${index + 1}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 8px;">${item.nama?.replace(/[<>]/g, '') || '-'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 8px;">${divisiName.replace(/[<>]/g, '')}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${item.totalHadir}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${item.totalTerlambat}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${item.totalIzin}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${item.totalAbsen}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${item.persenKehadiran}%</td>
                </tr>
              `
            }).join('')}
            ${filteredData.length === 0 ? `
              <tr>
                <td colspan="8" style="border: 1px solid #cbd5e1; padding: 40px; text-align: center; color: #94a3b8;">Tidak ada data laporan</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #cbd5e1;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="text-align: left;">
              <p style="font-size: 9px; color: #94a3b8; margin: 0;">Dokumen ini dicetak secara elektronik</p>
              <p style="font-size: 9px; color: #94a3b8; margin: 2px 0 0 0;">&copy; ${new Date().getFullYear()} PT Kuanta Prima Indonesia - All Rights Reserved</p>
            </div>
            <div style="text-align: right;">
              <div style="margin-top: 30px;">
                <p style="font-size: 10px; margin: 0;">Surabaya, ${today}</p>
                <p style="font-size: 10px; margin: 20px 0 0 0;">Chief Operating Officer</p>
                <div style="margin-top: 30px;">
                  <p style="font-size: 10px; margin: 0; text-decoration: underline;">(_____________________)</p>
                  <p style="font-size: 9px; color: #64748b; margin: 2px 0 0 0;">Nama Lengkap & Tanda Tangan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
      
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `laporan_presensi_${startDate || "semua"}_sd_${endDate || "semua"}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      }
      
      html2pdf().set(opt).from(element).save()
      // Tidak menampilkan alert sukses
    } catch (err) {
      console.error("Error exporting to PDF:", err)
      setToast({ show: true, message: "Gagal mengunduh laporan PDF", type: "error" })
    } finally {
      setIsExporting(false)
    }
  }

  // Statistik
  const stats = {
    total: filteredData.length,
    totalHadir: filteredData.reduce((acc, p) => acc + p.totalHadir, 0),
    rataKehadiran: filteredData.length > 0 
      ? Math.round(filteredData.reduce((acc, p) => acc + p.persenKehadiran, 0) / filteredData.length)
      : 0
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Helper untuk mendapatkan nama divisi yang sudah dinormalisasi
  const getDivisiName = (divisi) => {
    if (!divisi) return "-"
    if (typeof divisi === "string") return divisi
    if (typeof divisi === "object" && divisi !== null) {
      return divisi.nama_divisi || divisi.nama || "-"
    }
    return "-"
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
        
        {/* TOAST NOTIFICATION - hanya untuk warning/error */}
        {toast.show && (
          <div className="fixed top-5 right-5 z-50 animate-slide-in-right">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === "warning" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
            }`}>
              {toast.type === "warning" && <AlertTriangle size={18} className="text-amber-600" />}
              {toast.type === "error" && <AlertCircle size={18} className="text-red-600" />}
              <p className={`text-sm ${
                toast.type === "warning" ? "text-amber-800" : "text-red-800"
              }`}>
                {toast.message}
              </p>
              <button 
                onClick={() => setToast({ show: false, message: "", type: "" })}
                className="ml-2 p-0.5 hover:bg-white/50 rounded-lg transition"
              >
                <XCircle size={14} className="text-slate-500" />
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
            
            {/* Dropdown Export */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={isExporting || filteredData.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Unduh Laporan
                <ChevronDown size={16} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                  <button
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 transition-colors"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                    <span>Export ke Excel</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 transition-colors border-t border-slate-100"
                  >
                    <FileText size={16} className="text-red-600" />
                    <span>Export ke PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-64 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchNama}
                  onChange={(e) => setSearchNama(e.target.value)}
                  placeholder="Cari berdasarkan nama..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
                />
              </div>
            </div>

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
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Tanggal Mulai"
              />
            </div>

            <div className="w-full md:w-48">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Tanggal Selesai"
              />
            </div>
            
            {(selectedDivisi !== "all" || startDate || endDate || searchNama) && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button onClick={fetchPresensi} className="text-red-600 hover:text-red-700 text-sm font-medium">Coba Lagi</button>
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
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hadir</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Terlambat</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Izin</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Absen</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <FileText size={20} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm">
                          {searchNama ? `Tidak ditemukan peserta dengan nama "${searchNama}"` : "Tidak ada data laporan"}
                        </p>
                        {(searchNama || selectedDivisi !== "all" || startDate || endDate) && (
                          <button
                            onClick={resetFilters}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                          >
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
                            {item.nama?.charAt(0) || "?"}
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{item.nama}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                          {getDivisiName(item.divisi)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">
                        {item.totalHadir}
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">
                        {item.totalTerlambat}
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">
                        {item.totalIzin}
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">
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

        {/* INFO BANNER */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-blue-500" />
            <p className="text-xs text-blue-700">
              <strong className="font-semibold">Informasi:</strong> Laporan ini dihitung berdasarkan data presensi harian peserta magang untuk periode yang dipilih. Gunakan filter pencarian untuk mencari peserta tertentu.
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default LaporanPresensi