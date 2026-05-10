// src/pages/peserta/RiwayatPresensiPeserta.jsx
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
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
  Search,
  Filter,
  Printer,
  User
} from "lucide-react"

function RiwayatPresensiPeserta() {
  const [loading, setLoading] = useState(true)
  const [presensiList, setPresensiList] = useState([])
  const [filteredPresensi, setFilteredPresensi] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [selectedPresensi, setSelectedPresensi] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadPresensiData()
  }, [])

  const loadPresensiData = () => {
    setLoading(true)
    setTimeout(() => {
      const storedPresensi = JSON.parse(localStorage.getItem("presensi_peserta")) || []
      const dummyPresensi = [
        { id: 1, tanggal: "2024-12-17", check_in: "08:00", check_out: "16:30", status: "hadir", lokasi: "WFO", device: "Web", aktivitas: "Mengerjakan tugas frontend dashboard", kendala: "Tidak ada", rencana: "Menyelesaikan API integration" },
        { id: 2, tanggal: "2024-12-16", check_in: "08:15", check_out: "16:30", status: "terlambat", lokasi: "WFH", device: "Mobile", aktivitas: "Membuat API endpoint", kendala: "Error pada database", rencana: "Debugging dan testing" },
        { id: 3, tanggal: "2024-12-15", check_in: null, check_out: null, status: "alpha", lokasi: "-", device: "-", aktivitas: null, kendala: null, rencana: null },
        { id: 4, tanggal: "2024-12-14", check_in: "07:55", check_out: "16:30", status: "hadir", lokasi: "WFO", device: "Web", aktivitas: "Membuat UI komponen", kendala: "Tidak ada", rencana: "Integrasi dengan backend" }
      ]
      const allData = storedPresensi.length > 0 ? storedPresensi : dummyPresensi
      setPresensiList(allData)
      setFilteredPresensi(allData)
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    let filtered = [...presensiList]
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.tanggal.includes(searchTerm) ||
        (p.status && p.status.includes(searchTerm.toLowerCase()))
      )
    }
    
    if (selectedMonth !== "all") {
      filtered = filtered.filter(p => {
        const month = p.tanggal.split('-')[1]
        return month === selectedMonth
      })
    }
    
    setFilteredPresensi(filtered)
    setCurrentPage(1)
  }, [searchTerm, selectedMonth, presensiList])

  const getStatusBadge = (status) => {
    switch(status) {
      case "hadir":
        return { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle, label: "Hadir" }
      case "terlambat":
        return { bg: "bg-amber-100", text: "text-amber-700", icon: AlertCircle, label: "Terlambat" }
      default:
        return { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Tidak Hadir" }
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredPresensi.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPresensi.length / itemsPerPage)

  const handleDownloadPDF = (presensi) => {
    alert(`Mengunduh laporan presensi tanggal ${presensi.tanggal}...`)
  }

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
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/5 to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
              Riwayat Presensi
            </h1>
            <p className="text-sm text-gray-500 mt-1">Lihat riwayat kehadiran Anda selama magang</p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan tanggal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            />
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-teal-400"
          >
            <option value="all">Semua Bulan</option>
            <option value="12">Desember 2024</option>
            <option value="11">November 2024</option>
            <option value="10">Oktober 2024</option>
          </select>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((item) => {
                const status = getStatusBadge(item.status)
                const StatusIcon = status.icon
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">{item.tanggal}</span>
                    </td>
                    <td className="px-6 py-4">
                      {item.check_in ? (
                        <span className="text-sm text-gray-600">{item.check_in}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.check_out ? (
                        <span className="text-sm text-gray-600">{item.check_out}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                        <StatusIcon size="12" />
                        <span className="text-xs font-medium">{status.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{item.lokasi}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedPresensi(item)
                            setShowModal(true)
                          }}
                          className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all duration-200"
                          title="Lihat Detail"
                        >
                          <Eye size="14" />
                        </button>
                        {item.check_in && (
                          <button 
                            onClick={() => handleDownloadPDF(item)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200"
                            title="Download PDF"
                          >
                            <Download size="14" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPresensi.length === 0 && (
          <div className="py-12 text-center">
            <Calendar size="48" className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Tidak ada data presensi</p>
            <p className="text-sm text-gray-400 mt-1">Belum ada riwayat presensi</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-sm text-gray-500">Halaman {currentPage} dari {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size="18" />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size="18" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedPresensi && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-md">
                    <FileText size="16" className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Detail Presensi</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedPresensi.tanggal}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200">
                <X size="18" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Check-in</p>
                  <p className="text-base font-semibold text-gray-800">{selectedPresensi.check_in || "-"}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Check-out</p>
                  <p className="text-base font-semibold text-gray-800">{selectedPresensi.check_out || "-"}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-base font-semibold">{selectedPresensi.status}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Lokasi</p>
                  <p className="text-base font-semibold text-gray-800">{selectedPresensi.lokasi}</p>
                </div>
              </div>

              {selectedPresensi.aktivitas && (
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
                  <p className="text-sm font-semibold text-teal-800 mb-2">Aktivitas Hari Ini</p>
                  <p className="text-sm text-gray-700">{selectedPresensi.aktivitas}</p>
                </div>
              )}

              {selectedPresensi.kendala && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-sm font-semibold text-amber-800 mb-2">Kendala</p>
                  <p className="text-sm text-gray-700">{selectedPresensi.kendala}</p>
                </div>
              )}

              {selectedPresensi.rencana && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm font-semibold text-blue-800 mb-2">Rencana Selanjutnya</p>
                  <p className="text-sm text-gray-700">{selectedPresensi.rencana}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleDownloadPDF(selectedPresensi)}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-medium flex items-center gap-2"
              >
                <Download size="16" />
                Unduh PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RiwayatPresensiPeserta