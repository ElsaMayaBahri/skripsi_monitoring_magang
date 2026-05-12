// src/pages/peserta/RiwayatPresensiPeserta.jsx
import React, { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  X,
  TrendingUp,
  Filter,
  Camera,
  Wifi,
  File,
  AlertTriangle
} from "lucide-react"
import jsPDF from "jspdf"
import { saveAs } from "file-saver"
import logo from "../../assets/logo.png"

function RiwayatPresensiPeserta() {
  const [loading, setLoading] = useState(true)
  const [presensiList, setPresensiList] = useState([])
  const [filteredPresensi, setFilteredPresensi] = useState([])
  const [selectedPresensi, setSelectedPresensi] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [backendError, setBackendError] = useState(false)
  const itemsPerPage = 10
  
  // Filter tanggal
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    loadPresensiData()
  }, [])

  useEffect(() => {
    filterData()
  }, [startDate, endDate, presensiList])

  // ============ LOAD DATA DARI BACKEND ============
  const loadPresensiData = async () => {
    setLoading(true)
    setBackendError(false)
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/api/peserta/presensi", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const formattedData = result.data.map(item => ({
            id: item.id_presensi || item.id,
            tanggal: item.tanggal,
            check_in: item.check_in,
            check_out: item.check_out,
            status: item.status_kehadiran || (item.is_late ? "terlambat" : "hadir"),
            lokasi: item.lokasi || item.jenis_kehadiran || "WFO",
            device: item.device || "Web",
            aktivitas: item.aktivitas,
            kendala: item.kendala,
            rencana: item.rencana,
            foto: item.foto_checkin,
            is_late: item.is_late
          }))
          
          const sorted = [...formattedData].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
          setPresensiList(sorted)
          setFilteredPresensi(sorted)
          
          const today = new Date()
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(today.getMonth() - 1)
          setStartDate(oneMonthAgo.toISOString().split('T')[0])
          setEndDate(today.toISOString().split('T')[0])
          
          setLoading(false)
          return
        }
      }
      
      console.log("Backend belum siap, menggunakan dummy data")
      setBackendError(true)
      loadDummyData()
      
    } catch (err) {
      console.error("Error load from API:", err)
      setBackendError(true)
      loadDummyData()
    }
  }
  
  // Dummy data untuk testing
  const loadDummyData = () => {
    const dummyData = [
      { id: 1, tanggal: "2026-05-12", check_in: "08:00:00", check_out: "17:30:00", status: "hadir", lokasi: "WFO - Kantor Pusat", device: "Web", aktivitas: "Mengerjakan tugas frontend dashboard monitoring magang", kendala: "Tidak ada kendala berarti", rencana: "Menyelesaikan API integration", foto: null },
      { id: 2, tanggal: "2026-05-11", check_in: "08:15:00", check_out: "17:00:00", status: "terlambat", lokasi: "WFH - Rumah", device: "Mobile", aktivitas: "Membuat API endpoint untuk presensi", kendala: "Error pada database connection", rencana: "Debugging dan testing", foto: null },
      { id: 3, tanggal: "2026-05-10", check_in: null, check_out: null, status: "alpha", lokasi: "-", device: "-", aktivitas: null, kendala: null, rencana: null, foto: null },
      { id: 4, tanggal: "2026-05-09", check_in: "07:55:00", check_out: "17:15:00", status: "hadir", lokasi: "WFO - Kantor Pusat", device: "Web", aktivitas: "Membuat UI komponen presensi", kendala: "Tidak ada", rencana: "Integrasi dengan backend", foto: null },
      { id: 5, tanggal: "2026-05-08", check_in: "08:30:00", check_out: "17:00:00", status: "terlambat", lokasi: "WFO - Kantor Pusat", device: "Web", aktivitas: "Meeting dengan mentor", kendala: "Koneksi internet tidak stabil", rencana: "Review tugas", foto: null },
      { id: 6, tanggal: "2026-05-07", check_in: "08:00:00", check_out: "16:30:00", status: "hadir", lokasi: "WFH - Rumah", device: "Mobile", aktivitas: "Mempelajari React hooks", kendala: null, rencana: "Implementasi di project", foto: null },
      { id: 7, tanggal: "2026-05-06", check_in: "09:00:00", check_out: "17:00:00", status: "terlambat", lokasi: "WFO - Kantor Pusat", device: "Web", aktivitas: "Memperbaiki bug", kendala: "Bug cukup kompleks", rencana: "Testing dan deployment", foto: null },
      { id: 8, tanggal: "2026-05-05", check_in: "08:00:00", check_out: "17:00:00", status: "hadir", lokasi: "WFO - Kantor Pusat", device: "Web", aktivitas: "Code review", kendala: null, rencana: "Merge pull request", foto: null }
    ]
    
    const sorted = [...dummyData].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    setPresensiList(sorted)
    setFilteredPresensi(sorted)
    
    const today = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(today.getMonth() - 1)
    setStartDate(oneMonthAgo.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
    
    setLoading(false)
  }

  const filterData = () => {
    let filtered = [...presensiList]
    
    if (startDate) {
      filtered = filtered.filter(p => p.tanggal >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter(p => p.tanggal <= endDate)
    }
    
    setFilteredPresensi(filtered)
    setCurrentPage(1)
  }

  const getStatusBadge = (item) => {
    if (!item.check_in) {
      return { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Alpha" }
    }
    if (item.check_in && !item.check_out) {
      return { bg: "bg-orange-100", text: "text-orange-700", icon: AlertCircle, label: "Belum Check-out" }
    }
    if (item.status === "terlambat" || item.is_late) {
      return { bg: "bg-amber-100", text: "text-amber-700", icon: AlertCircle, label: "Terlambat" }
    }
    return { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle, label: "Hadir" }
  }

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-"
    const date = new Date(tanggal)
    return date.toLocaleDateString("id-ID", { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTanggalFile = (tanggal) => {
    if (!tanggal) return "-"
    const date = new Date(tanggal)
    return date.toLocaleDateString("id-ID", { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '-')
  }

  
// ============ EXPORT PDF ============
const handleExportPDF = async () => {
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4')
    let yPos = 20

    // Logo - ukuran lebih besar agar tidak kegencet
    const logoImg = new Image()
    logoImg.src = logo
    await new Promise((resolve) => { logoImg.onload = resolve })
    doc.addImage(logoImg, 'PNG', 14, yPos - 15, 45, 45) // Ukuran 45x45 mm

    // Header
    doc.setFontSize(18)
    doc.setTextColor(13, 148, 136)
    doc.setFont('helvetica', 'bold')
    doc.text('LAPORAN RIWAYAT PRESENSI', 70, 25)

    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'normal')
    doc.text(`Periode: ${formatTanggalFile(startDate)} - ${formatTanggalFile(endDate)}`, 70, 33)
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 70, 39)
    doc.text('Kuanta Academy - Sistem Monitoring Magang', 70, 45)

    // Table Header
    yPos = 60
    const headers = ['Tanggal', 'Check-in', 'Check-out', 'Status', 'Lokasi', 'Device', 'Aktivitas']
    const colWidths = [35, 20, 20, 25, 35, 18, 60]
    
    doc.setFillColor(13, 148, 136)
    doc.rect(14, yPos - 5, 280, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    
    let xPos = 14
    headers.forEach((header, i) => {
      doc.text(header, xPos + 2, yPos)
      xPos += colWidths[i]
    })

    // Table Body
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    let currentY = yPos + 5
    let rowCount = 0

    for (const item of filteredPresensi) {
      if (currentY > 270) {
        doc.addPage()
        currentY = 20
        
        doc.setFillColor(13, 148, 136)
        doc.rect(14, currentY - 5, 280, 8, 'F')
        doc.setTextColor(255, 255, 255)
        xPos = 14
        headers.forEach((header, i) => {
          doc.text(header, xPos + 2, currentY)
          xPos += colWidths[i]
        })
        doc.setTextColor(0, 0, 0)
        currentY += 5
      }

      const status = getStatusBadge(item)
      const rowData = [
        formatTanggal(item.tanggal),
        item.check_in ? item.check_in.substring(0,5) : '-',
        item.check_out ? item.check_out.substring(0,5) : '-',
        status.label,
        item.lokasi || '-',
        item.device || 'Web',
        item.aktivitas ? (item.aktivitas.length > 40 ? item.aktivitas.substring(0,40) + '...' : item.aktivitas) : '-'
      ]

      if (rowCount % 2 === 0) {
        doc.setFillColor(241, 245, 249)
        doc.rect(14, currentY - 4, 280, 6, 'F')
      }

      xPos = 14
      rowData.forEach((data, i) => {
        doc.text(String(data), xPos + 2, currentY)
        xPos += colWidths[i]
      })
      
      currentY += 6
      rowCount++
    }

    const lastY = currentY + 8
    doc.setFontSize(7)
    doc.setTextColor(156, 163, 175)
    doc.text('Dicetak dari Sistem Monitoring Magang Kuanta Academy', 14, lastY)
    doc.text(`Halaman 1 dari 1`, 280, lastY, { align: 'right' })

    doc.save(`laporan_presensi_${formatTanggalFile(startDate)}_sd_${formatTanggalFile(endDate)}.pdf`)
    
  } catch (error) {
    console.error("Error export PDF:", error)
    alert("Gagal mengekspor PDF")
  }
}

// ============ EXPORT DOC ============
const handleExportDOC = () => {
  try {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Laporan Riwayat Presensi</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; margin: 40px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { width: 150px; height: auto; margin-bottom: 15px; }
          h1 { color: #0d9488; margin-bottom: 5px; font-size: 20px; }
          .subtitle { color: #64748b; margin-top: 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #0d9488; color: white; padding: 10px; text-align: left; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f1f5f9; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logo}" class="logo" alt="Logo Kuanta Academy" />
          <h1>LAPORAN RIWAYAT PRESENSI</h1>
          <p class="subtitle">Periode: ${formatTanggalFile(startDate)} - ${formatTanggalFile(endDate)}</p>
          <p class="subtitle">Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
        <table>
          <thead>
            <tr><th>No</th><th>Tanggal</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Lokasi</th><th>Device</th><th>Aktivitas</th></tr>
          </thead>
          <tbody>
    `
    
    filteredPresensi.forEach((item, idx) => {
      const status = getStatusBadge(item)
      htmlContent += `
        <tr>
          <td>${idx + 1}</td>
          <td>${formatTanggal(item.tanggal)}</td>
          <td>${item.check_in ? item.check_in.substring(0,5) : '-'}</td>
          <td>${item.check_out ? item.check_out.substring(0,5) : '-'}</td>
          <td>${status.label}</td>
          <td>${item.lokasi || '-'}</td>
          <td>${item.device || 'Web'}</td>
          <td>${item.aktivitas || '-'}</td>
        </tr>
      `
    })
    
    htmlContent += `
          </tbody>
        </table>
        <div class="footer">
          <p>Dicetak dari Sistem Monitoring Magang Kuanta Academy</p>
          <p>&copy; ${new Date().getFullYear()} Kuanta Academy - All Rights Reserved</p>
        </div>
      </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'application/msword' })
    saveAs(blob, `laporan_presensi_${formatTanggalFile(startDate)}_sd_${formatTanggalFile(endDate)}.doc`)
    
  } catch (error) {
    console.error("Error export DOC:", error)
    alert("Gagal mengekspor DOC")
  }
}

  // Hitung statistik
  const getStatistics = () => {
    const total = filteredPresensi.length
    const hadir = filteredPresensi.filter(p => p.check_in && p.status !== "terlambat" && !p.is_late).length
    const terlambat = filteredPresensi.filter(p => p.status === "terlambat" || p.is_late).length
    const alpha = filteredPresensi.filter(p => !p.check_in).length
    const persentase = total > 0 ? Math.round((hadir / total) * 100) : 0
    return { total, hadir, terlambat, alpha, persentase }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredPresensi.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPresensi.length / itemsPerPage)
  const stats = getStatistics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative w-10 h-10 border-2 border-teal-400/30 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-5 md:p-6">
      {/* Header */}
      <div className="w-full rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold">Riwayat Presensi</h1>
              <p className="text-white/80 text-xs mt-0.5">Lihat riwayat kehadiran Anda selama magang</p>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIF BACKEND */}
      {backendError && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle size="18" className="text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Mode Development - Data Dummy</p>
              <p className="text-xs text-amber-700 mt-1">
                Backend API belum terhubung. Menampilkan data dummy untuk testing tampilan.
                <br />
                API Endpoint: <span className="font-mono">GET http://localhost:8000/api/peserta/presensi</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter dan Statistik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size="16" className="text-teal-500" />
            <h3 className="text-sm font-semibold text-gray-700">Filter Periode</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dari Tanggal</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sampai Tanggal</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400" />
            </div>
          </div>
          <div className="flex gap-2 mt-4 pt-2 border-t border-gray-100">
            <button onClick={handleExportPDF} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"><FileText size="12" /> PDF</button>
            <button onClick={handleExportDOC} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"><File size="12" /> DOC</button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl shadow-md p-5 text-white">
          <div className="flex items-center gap-2 mb-3"><TrendingUp size="16" className="text-white/80" /><h3 className="text-sm font-semibold">Ringkasan Kehadiran</h3></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 rounded-lg p-2 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-white/80">Total Hari</p></div>
            <div className="bg-white/20 rounded-lg p-2 text-center"><p className="text-2xl font-bold">{stats.hadir}</p><p className="text-xs text-white/80">Hadir</p></div>
            <div className="bg-white/20 rounded-lg p-2 text-center"><p className="text-2xl font-bold">{stats.terlambat}</p><p className="text-xs text-white/80">Terlambat</p></div>
            <div className="bg-white/20 rounded-lg p-2 text-center"><p className="text-2xl font-bold">{stats.alpha}</p><p className="text-xs text-white/80">Alpha</p></div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/20 text-center"><p className="text-sm font-bold">{stats.persentase}%</p><p className="text-xs text-white/80">Tingkat Kehadiran</p></div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">Tanggal</th><th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">Check-in</th><th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">Check-out</th><th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">Status</th><th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">Lokasi</th><th className="text-left px-5 py-3 text-xs font-semibold text-gray-600">Daily Report</th><th className="text-center px-5 py-3 text-xs font-semibold text-gray-600">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((item, index) => {
                const status = getStatusBadge(item)
                const StatusIcon = status.icon
                const dailyReportText = item.aktivitas ? (item.aktivitas.length > 50 ? item.aktivitas.substring(0, 50) + '...' : item.aktivitas) : '-'
                return (
                  <tr key={item.id || index} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3"><div className="text-sm font-medium text-gray-800">{formatTanggal(item.tanggal)}</div><div className="text-xs text-gray-400">{item.tanggal}</div></td>
                    <td className="px-5 py-3">{item.check_in ? <span className="text-sm text-green-600 font-medium">{item.check_in.substring(0,5)}</span> : <span className="text-sm text-gray-400">-</span>}</td>
                    <td className="px-5 py-3">{item.check_out ? <span className="text-sm text-blue-600 font-medium">{item.check_out.substring(0,5)}</span> : item.check_in ? <span className="text-sm text-orange-400">Belum</span> : <span className="text-sm text-gray-400">-</span>}</td>
                    <td className="px-5 py-3"><div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}><StatusIcon size="12" /><span className="text-xs font-medium">{status.label}</span></div></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-1">{item.lokasi?.includes("WFH") ? <Wifi size="10" className="text-blue-500" /> : <MapPin size="10" className="text-teal-500" />}<span className="text-sm text-gray-600">{item.lokasi || "-"}</span></div></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-1"><FileText size="12" className="text-teal-500" /><span className="text-xs text-gray-600 truncate max-w-[200px]" title={item.aktivitas}>{dailyReportText}</span></div></td>
                    <td className="px-5 py-3 text-center"><button onClick={() => { setSelectedPresensi(item); setShowModal(true) }} className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100"><Eye size="14" /></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPresensi.length === 0 && (
          <div className="py-12 text-center"><Calendar size="48" className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">Tidak ada data presensi</p></div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-500">Halaman {currentPage} dari {totalPages}</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-40"><ChevronLeft size="14" /></button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = totalPages <= 5 ? i + 1 : (currentPage <= 3 ? i + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i))
                  return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-7 h-7 rounded-lg text-xs font-semibold ${currentPage === pageNum ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600"}`}>{pageNum}</button>)
                })}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-40"><ChevronRight size="14" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {showModal && selectedPresensi && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 py-3 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center"><FileText size="14" className="text-white" /></div><div><h3 className="text-base font-bold text-gray-800">Detail Presensi</h3><p className="text-xs text-gray-500">{formatTanggal(selectedPresensi.tanggal)}</p></div></div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"><X size="16" /></button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50"><p className="text-xs text-green-600 font-medium">CHECK-IN</p><p className="text-lg font-bold text-green-700">{selectedPresensi.check_in ? selectedPresensi.check_in.substring(0,5) : "-"}</p></div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50"><p className="text-xs text-blue-600 font-medium">CHECK-OUT</p><p className="text-lg font-bold text-blue-700">{selectedPresensi.check_out ? selectedPresensi.check_out.substring(0,5) : "-"}</p></div>
                <div className="p-3 rounded-lg bg-gray-50"><p className="text-xs text-gray-500">Status</p><p className="text-sm font-semibold text-gray-800 capitalize">{getStatusBadge(selectedPresensi).label}</p></div>
                <div className="p-3 rounded-lg bg-gray-50"><p className="text-xs text-gray-500">Lokasi / Device</p><p className="text-sm font-semibold text-gray-800">{selectedPresensi.lokasi || "-"} • {selectedPresensi.device || "Web"}</p></div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText size="14" className="text-teal-500" /> Daily Report</h4>
                {selectedPresensi.aktivitas && <div className="p-3 rounded-lg bg-teal-50 border border-teal-100 mb-3"><p className="text-xs font-semibold text-teal-800 mb-1">Aktivitas Hari Ini</p><p className="text-sm text-gray-700">{selectedPresensi.aktivitas}</p></div>}
                {selectedPresensi.kendala && selectedPresensi.kendala !== "Tidak ada" && <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 mb-3"><p className="text-xs font-semibold text-amber-800 mb-1">Kendala</p><p className="text-sm text-gray-700">{selectedPresensi.kendala}</p></div>}
                {selectedPresensi.rencana && <div className="p-3 rounded-lg bg-blue-50 border border-blue-100"><p className="text-xs font-semibold text-blue-800 mb-1">Rencana Selanjutnya</p><p className="text-sm text-gray-700">{selectedPresensi.rencana}</p></div>}
                {!selectedPresensi.aktivitas && !selectedPresensi.kendala && !selectedPresensi.rencana && <p className="text-sm text-gray-500 italic">Belum ada daily report</p>}
              </div>

              {selectedPresensi.foto && (
                <div className="border-t border-gray-100 pt-4"><p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2"><Camera size="12" className="text-teal-500" /> Foto Check-in</p><img src={selectedPresensi.foto} alt="Selfie" className="w-20 h-20 object-cover rounded-lg border-2 border-teal-200 cursor-pointer hover:scale-105" onClick={() => window.open(selectedPresensi.foto, '_blank')} /></div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white px-5 py-3 border-t border-gray-100 flex justify-end rounded-b-xl"><button onClick={() => setShowModal(false)} className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold">Tutup</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RiwayatPresensiPeserta