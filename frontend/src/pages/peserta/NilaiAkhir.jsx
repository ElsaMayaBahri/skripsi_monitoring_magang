// src/pages/peserta/NilaiAkhir.jsx
import React, { useState, useEffect } from "react"
import {
  Award,
  Star,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Users,
  FileText,
  Shield,
  Sparkles,
  Trophy,
  Medal,
  Crown
} from "lucide-react"

function NilaiAkhir() {
  const [loading, setLoading] = useState(true)
  const [nilai, setNilai] = useState(null)
  const [components, setComponents] = useState([])

  useEffect(() => {
    loadNilaiData()
  }, [])

  const loadNilaiData = () => {
    setLoading(true)
    setTimeout(() => {
      setNilai({
        total: 87.5,
        grade: "A",
        predikat: "Sangat Baik",
        status: "lulus",
        certificate_available: true
      })
      
      setComponents([
        { name: "Kehadiran", nilai: 92, bobot: 20, kontribusi: 18.4 },
        { name: "Ketepatan Tugas", nilai: 85, bobot: 25, kontribusi: 21.25 },
        { name: "Kuis", nilai: 88, bobot: 15, kontribusi: 13.2 },
        { name: "Sikap", nilai: 90, bobot: 20, kontribusi: 18 },
        { name: "Kualitas Kerja", nilai: 88, bobot: 20, kontribusi: 17.6 }
      ])
      
      setLoading(false)
    }, 500)
  }

  const handleDownloadPDF = () => {
    alert("Mengunduh nilai akhir dalam format PDF...")
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
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-emerald-800 to-teal-800 bg-clip-text text-transparent">
              Nilai Akhir Magang
            </h1>
            <p className="text-sm text-gray-500 mt-1">Hasil evaluasi akhir program magang Anda</p>
          </div>
        </div>
      </div>

      {/* Score Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 p-8 text-center">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <Trophy size="14" className="text-white" />
            <span className="text-xs text-white font-medium">Nilai Akhir</span>
          </div>
          <p className="text-6xl font-bold text-white mb-2">{nilai.total}</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-lg">{nilai.grade}</span>
            <span className="text-white/80">{nilai.predikat}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 text-white/80">
              <CheckCircle size="14" />
              <span className="text-sm">{nilai.status === "lulus" ? "Dinyatakan Lulus" : "Belum Lulus"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Components Breakdown */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>
        <div className="p-6">
          <h3 className="font-bold text-gray-800 mb-4">Rincian Nilai per Komponen</h3>
          <div className="space-y-4">
            {components.map((comp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all duration-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                      <Star size="14" className="text-teal-600" />
                    </div>
                    <span className="font-medium text-gray-800">{comp.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-teal-600">{comp.nilai}</span>
                    <span className="text-sm text-gray-500"> /100</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Bobot: {comp.bobot}%</span>
                  <span>Kontribusi: {comp.kontribusi}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full" style={{ width: `${comp.nilai}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Total Score */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <TrendingUp size="20" className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Nilai Akhir</p>
              <p className="text-3xl font-bold text-teal-600">{nilai.total}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            >
              <Printer size="16" />
              Cetak
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Download size="16" />
              Unduh PDF
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent rounded-2xl p-5 border border-teal-100 shadow-md">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-30"></div>
            <div className="relative p-2.5 bg-white rounded-xl shadow-md">
              <Shield size="16" className="text-teal-500" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-teal-800">Informasi Nilai Akhir</p>
            <p className="text-xs text-teal-700 mt-1 leading-relaxed">
              Nilai akhir dihitung berdasarkan bobot masing-masing komponen penilaian.
              {(nilai?.certificate_available && nilai?.status === "lulus") && (
                " Anda berhak mendapatkan sertifikat penyelesaian magang. Silakan unduh sertifikat di halaman Sertifikat."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NilaiAkhir