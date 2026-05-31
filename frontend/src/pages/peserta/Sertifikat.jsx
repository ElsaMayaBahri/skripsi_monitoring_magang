import React, { useState, useEffect } from "react"
import {
  Award,
  Download,
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
  Crown,
  FileCheck,
  Eye,
  X,
  Star,
  Calendar,
  User,
  TrendingUp,
  Clock,
  Trophy as TrophyIcon
} from "lucide-react"
import api from "../../api/axios"

function Sertifikat() {
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [downloading, setDownloading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null)

  useEffect(() => {
    loadSertifikatData()
  }, [])

  const loadSertifikatData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // PERBAIKAN: Gunakan endpoint yang benar untuk peserta
      const response = await api.get('/peserta/sertifikat-kompetensi-info')
      
      if (response.data.success) {
        setCertificate(response.data.data)
        setRequirements(response.data.requirements || [])
        
        if (response.data.data?.available && response.data.data?.sertifikat_id) {
          await loadPdfFile(response.data.data.sertifikat_id)
        }
      } else {
        setError('Gagal memuat data sertifikat')
      }
    } catch (err) {
      console.error("Error load sertifikat:", err)
      setError(err.response?.data?.message || 'Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  const loadPdfFile = async (sertifikatId) => {
    try {
      // PERBAIKAN: Gunakan endpoint download yang benar untuk peserta
      const response = await api.get(`/peserta/sertifikat-kompetensi/download/${sertifikatId}`, {
        responseType: 'blob'
      })
      const blob = response.data
      const url = URL.createObjectURL(blob)
      setPdfBlobUrl(url)
      setPreviewUrl(url)
    } catch (err) {
      console.error("Error loading PDF file:", err)
      setError('Gagal memuat file sertifikat')
    }
  }

  const handleDownloadCertificate = async () => {
    if (!certificate?.sertifikat_id) {
      alert("Sertifikat belum tersedia")
      return
    }
    
    setDownloading(true)
    try {
      // PERBAIKAN: Gunakan endpoint download yang benar untuk peserta
      const response = await api.get(`/peserta/sertifikat-kompetensi/download/${certificate.sertifikat_id}`, {
        responseType: 'blob'
      })
      
      const blob = response.data
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Sertifikat_Kompetensi_${certificate.participant_name?.replace(/ /g, '_') || 'peserta'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading certificate:", err)
      alert("Gagal mengunduh sertifikat. Silakan coba lagi.")
    } finally {
      setDownloading(false)
    }
  }

  const handlePreviewCertificate = () => {
    if (previewUrl) {
      setShowPreview(true)
    } else {
      alert("Preview belum tersedia")
    }
  }

  const isAllRequirementsMet = requirements.every(req => req.status)
  const canDownload = certificate?.available && isAllRequirementsMet
  
  const completedCount = requirements.filter(r => r.status).length
  const progressPercent = requirements.length > 0 ? (completedCount / requirements.length) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin relative" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size="40" className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Gagal Memuat Data</h2>
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={loadSertifikatData}
            className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-2xl blur-2xl opacity-20"></div>
          <div className="relative bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <TrophyIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sertifikat Kompetensi</h1>
                <p className="text-white/80 text-sm mt-1">Bukti pencapaian hasil ujian kompetensi Anda</p>
              </div>
            </div>
          </div>
        </div>

        {canDownload ? (
          <>
            {/* PREVIEW PDF LANGSUNG */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
              <div className="h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500"></div>
              
              <div className="p-2 bg-gray-100 flex items-center justify-center">
                {pdfBlobUrl ? (
                  <iframe 
                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-[350px] rounded-lg shadow-md"
                    title="Sertifikat Kompetensi"
                  />
                ) : (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Memuat sertifikat...</p>
                  </div>
                )}
              </div>
              
              <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{certificate?.participant_name || 'Peserta Magang'}</p>
                  <p className="text-xs text-slate-500">{certificate?.kompetensi || 'Kompetensi Divisi Product Design'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{certificate?.nilai_akhir || 100}/100</p>
                  <p className="text-xs text-slate-500">Grade {certificate?.grade || 'A'}</p>
                </div>
              </div>
            </div>
            
            {/* Progress & Status */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Shield size="16" className="text-teal-500" />
                    Status Kelayakan Sertifikat
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isAllRequirementsMet ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                    <span className={`text-xs font-medium ${isAllRequirementsMet ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isAllRequirementsMet ? 'Siap Diunduh' : 'Belum Memenuhi Syarat'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress kelayakan</span>
                    <span>{completedCount}/{requirements.length} syarat</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-700">{req.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{req.nilai}</span>
                        {req.status ? (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Terpenuhi</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Belum</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hasil Ujian */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Crown size="16" className="text-amber-500" />
                  Hasil Ujian Kompetensi
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {certificate?.hasil_kuis?.map((kuis, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileCheck size="14" className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{kuis.nama}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${kuis.lulus ? 'text-emerald-600' : 'text-red-600'}`}>
                        {kuis.nilai} / 100
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                        kuis.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                        kuis.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        kuis.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        Grade {kuis.grade}
                      </span>
                      {kuis.lulus ? (
                        <CheckCircle size="14" className="text-emerald-500" />
                      ) : (
                        <XCircle size="14" className="text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-5 border border-teal-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-md">
                    <Download size="18" className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-teal-800">Sertifikat Siap Diunduh</p>
                    <p className="text-xs text-teal-600">Anda telah memenuhi semua persyaratan</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePreviewCertificate}
                    className="px-5 py-2 rounded-xl border border-teal-500 text-teal-600 text-sm font-semibold hover:bg-teal-50 transition-all flex items-center gap-2"
                  >
                    <Eye size="16" />
                    Preview
                  </button>
                  <button
                    onClick={handleDownloadCertificate}
                    disabled={downloading}
                    className="px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {downloading ? <Loader2 size="16" className="animate-spin" /> : <Download size="16" />}
                    {downloading ? "Memproses..." : "Unduh PDF"}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <Award size="36" className="text-gray-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Sertifikat Belum Tersedia</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Anda belum memenuhi seluruh persyaratan untuk mendapatkan sertifikat kompetensi.
              Selesaikan semua kuis kompetensi dengan nilai minimal 75.
            </p>
            
            {requirements.filter(r => !r.status).length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl text-left max-w-md mx-auto">
                <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <XCircle size="12" className="text-amber-600" />
                  Persyaratan yang belum terpenuhi:
                </p>
                <div className="space-y-1">
                  {requirements.filter(r => !r.status).map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-amber-700">
                      <span>•</span>
                      <span>{req.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {requirements.length > 0 && (
              <div className="mt-6 max-w-md mx-auto">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress kelayakan</span>
                  <span>{completedCount}/{requirements.length} syarat</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Preview PDF */}
        {showPreview && previewUrl && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <FileCheck size="18" className="text-teal-600" />
                  <h3 className="font-semibold text-slate-800">Preview Sertifikat Kompetensi</h3>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-white/50 transition-all">
                  <X size="18" className="text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-gray-100 flex justify-center">
                <iframe 
                  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full min-h-[500px] rounded-lg shadow-lg"
                  title="Preview Sertifikat"
                />
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                <button onClick={() => setShowPreview(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-slate-600 text-sm font-medium hover:bg-white transition-all">
                  Tutup
                </button>
                <button 
                  onClick={handleDownloadCertificate} 
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Download size="16" /> Unduh PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sertifikat