// src/pages/peserta/Sertifikat.jsx
import React, { useState, useEffect } from "react"
import {
  Award,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  MapPin,
  Shield,
  Sparkles,
  Trophy,
  Medal,
  Crown,
  Gem,
  Star
} from "lucide-react"

function Sertifikat() {
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState(null)
  const [requirements, setRequirements] = useState([])

  useEffect(() => {
    loadCertificateData()
  }, [])

  const loadCertificateData = () => {
    setLoading(true)
    setTimeout(() => {
      setCertificate({
        available: true,
        title: "Sertifikat Penyelesaian Magang",
        participant_name: "Ahmad Firmansyah",
        program: "Program Magang Kuanta Academy",
        duration: "Agustus - Desember 2024",
        score: 87.5,
        grade: "A",
        issue_date: "2024-12-25",
        certificate_number: "KA/2024/12/00123",
        director_name: "Dr. Budi Santoso, M.Kom",
        verified: true
      })
      
      setRequirements([
        { name: "Menyelesaikan seluruh tugas", status: true },
        { name: "Kehadiran minimal 85%", status: true },
        { name: "Nilai akhir minimal 70", status: true },
        { name: "Menyelesaikan laporan akhir", status: true },
        { name: "Mengerjakan kuis kompetensi", status: true }
      ])
      
      setLoading(false)
    }, 500)
  }

  const handleDownloadCertificate = () => {
    alert("Mengunduh sertifikat dalam format PDF...")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative w-10 h-10 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-amber-800 to-orange-800 bg-clip-text text-transparent">
              Sertifikat Magang
            </h1>
            <p className="text-sm text-gray-500 mt-1">Unduh sertifikat penyelesaian program magang</p>
          </div>
        </div>
      </div>

      {certificate?.available ? (
        <>
          {/* Preview Certificate Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-white via-amber-50/30 to-white rounded-2xl border-2 border-amber-200 overflow-hidden">
              {/* Certificate Decorative Elements */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-amber-300 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-amber-300 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-amber-300 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-amber-300 rounded-br-2xl"></div>
              
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 mb-6">
                  <Trophy size="16" className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 uppercase">Certificate of Completion</span>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{certificate.title}</h2>
                <p className="text-gray-500 mb-6">Diberikan kepada:</p>
                
                <div className="mb-2">
                  <div className="inline-block border-b-4 border-amber-400 pb-1">
                    <p className="text-2xl font-bold text-gray-800">{certificate.participant_name}</p>
                  </div>
                </div>
                <p className="text-gray-500 mb-6 text-sm">Sebagai peserta magang pada program</p>
                
                <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 mb-6">
                  <p className="text-sm font-semibold text-amber-700">{certificate.program}</p>
                </div>
                
                <div className="flex justify-center gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Periode Magang</p>
                    <p className="text-sm font-semibold text-gray-700">{certificate.duration}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Nilai Akhir</p>
                    <p className="text-sm font-semibold text-gray-700">{certificate.score} / 100</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Grade</p>
                    <p className="text-sm font-semibold text-gray-700">{certificate.grade}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-8 pt-4 border-t border-gray-200">
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Tanggal Terbit</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(certificate.issue_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-12 mb-1">
                      <img src="/api/placeholder/120/40" alt="Signature" className="opacity-70" />
                    </div>
                    <p className="text-xs font-medium text-gray-700">{certificate.director_name}</p>
                    <p className="text-xs text-gray-500">Direktur Utama</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Nomor Sertifikat</p>
                    <p className="text-xs font-mono text-gray-600">{certificate.certificate_number}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Check */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-gray-800 mb-4">Persyaratan Sertifikat</h3>
              <div className="space-y-3">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
                    <span className="text-sm text-gray-700">{req.name}</span>
                    {req.status ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle size="16" />
                        <span className="text-xs font-medium">Terpenuhi</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle size="16" />
                        <span className="text-xs font-medium">Belum</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                  <Download size="20" className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Sertifikat Siap Diunduh</p>
                  <p className="text-xs text-amber-600">Anda memenuhi semua persyaratan untuk mendapatkan sertifikat</p>
                </div>
              </div>
              <button
                onClick={handleDownloadCertificate}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Download size="16" />
                Unduh Sertifikat PDF
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
              <Award size="40" className="text-gray-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mt-4">Sertifikat Belum Tersedia</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Anda belum memenuhi seluruh persyaratan untuk mendapatkan sertifikat. 
            Selesaikan semua tugas dan penilaian terlebih dahulu.
          </p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/90 to-transparent rounded-2xl p-5 border border-amber-100 shadow-md">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500 rounded-xl blur-md opacity-30"></div>
            <div className="relative p-2.5 bg-white rounded-xl shadow-md">
              <Shield size="16" className="text-amber-500" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">Informasi Sertifikat</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Sertifikat hanya dapat diunduh jika Anda telah memenuhi seluruh persyaratan magang,
              termasuk menyelesaikan semua tugas, mencapai nilai minimal, dan memiliki kehadiran yang cukup.
              Sertifikat ini dapat digunakan sebagai bukti pengalaman magang Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sertifikat