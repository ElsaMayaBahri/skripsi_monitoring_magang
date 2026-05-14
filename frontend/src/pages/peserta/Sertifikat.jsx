// src/pages/peserta/Sertifikat.jsx
import React, { useState, useEffect } from "react"
import {
  Award,
  Download,
  CheckCircle,
  XCircle,
  Shield,
  Trophy,
  Server,
  Loader2,
  Star,
  Sparkles,
  Crown,
  Medal,
  FileCheck,
  Eye,
  X
} from "lucide-react"
import { jsPDF } from "jspdf"
import logo from "../../assets/logo.png"

// ============================================
// MODE TESTING - Ganti ke false untuk production
// ============================================
const USE_DUMMY_DATA = true

function Sertifikat() {
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [backendError, setBackendError] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadSertifikatData()
  }, [])

  const loadSertifikatData = async () => {
    setLoading(true)
    setBackendError(false)
    
    if (USE_DUMMY_DATA) {
      console.log("Mode Dummy: Menampilkan data contoh sertifikat kompetensi")
      setBackendError(true)
      setTimeout(() => {
        loadDummyData()
        setLoading(false)
      }, 800)
    } else {
      try {
        const response = await fetch("http://localhost:8000/api/peserta/sertifikat-kompetensi", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Accept": "application/json"
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setCertificate(result.data)
            setRequirements(result.requirements || [])
          }
        } else {
          loadDummyData()
        }
      } catch (err) {
        console.error("Error load sertifikat:", err)
        loadDummyData()
      } finally {
        setLoading(false)
      }
    }
  }

  const loadDummyData = () => {
    const hasilKuis = [
      { nama: "Fundamental JavaScript", nilai: 85, grade: "B", lulus: true },
      { nama: "React JS Development", nilai: 92, grade: "A", lulus: true },
      { nama: "Tailwind CSS", nilai: 88, grade: "B+", lulus: true },
      { nama: "State Management Redux", nilai: 78, grade: "C+", lulus: true },
      { nama: "Next.js Framework", nilai: 90, grade: "A-", lulus: true }
    ]
    
    const rataRata = hasilKuis.reduce((sum, k) => sum + k.nilai, 0) / hasilKuis.length
    const kompetensi = "Frontend Developer (Junior Level)"
    const gradeKompetensi = rataRata >= 90 ? "A" : rataRata >= 80 ? "B" : rataRata >= 70 ? "C" : "D"
    
    const dummyCertificate = {
      available: true,
      title: "CERTIFICATE OF COMPETENCY",
      sub_title: "Sertifikat Kompetensi",
      participant_name: "Ahmad Rizki Firmansyah",
      kompetensi: kompetensi,
      level: gradeKompetensi === "A" ? "Expert" : gradeKompetensi === "B" ? "Advanced" : "Intermediate",
      description: `Telah berhasil menyelesaikan ujian kompetensi bidang ${kompetensi} dengan hasil yang memuaskan.`,
      division: "Frontend Development",
      nilai_akhir: Math.round(rataRata),
      grade: gradeKompetensi,
      grade_text: gradeKompetensi === "A" ? "Sangat Memuaskan" : gradeKompetensi === "B" ? "Memuaskan" : "Cukup",
      issue_date: "2025-06-15",
      certificate_number: `KA/${new Date().getFullYear()}/KOMP/${Math.floor(Math.random() * 10000)}`,
      director_name: "Dr. Ir. Budi Santoso, M.Kom., IPU",
      ceo_name: "Dra. Siti Rahayu Indah, M.M., CFRM",
      hasil_kuis: hasilKuis,
      motto: "Membangun Generasi Unggul Berbasis Teknologi Digital"
    }
    
    setCertificate(dummyCertificate)
    
    setRequirements([
      { name: "Menyelesaikan seluruh kuis kompetensi (5 kuis)", status: true, nilai: "85-92" },
      { name: "Nilai rata-rata minimal 75", status: rataRata >= 75, nilai: `${rataRata} / 75` },
      { name: "Tidak ada nilai di bawah 70", status: hasilKuis.every(k => k.nilai >= 70), nilai: "✓" },
      { name: "Mengikuti seluruh ujian kompetensi", status: true, nilai: "5/5" }
    ])
  }

  // Generate PDF Sertifikat - DESAIN PREMIUM
  const generatePDF = async () => {
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // Background putih dengan gradient halus di tepi
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 297, 210, 'F')
    
    // Border luar dengan gradient (biru/teal)
    doc.setDrawColor(13, 148, 136)
    doc.setLineWidth(1.5)
    doc.rect(8, 8, 281, 194)
    
    // Border dalam dengan warna lebih soft
    doc.setDrawColor(100, 116, 139)
    doc.setLineWidth(0.5)
    doc.rect(12, 12, 273, 186)
    
    // Border ke-3
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.3)
    doc.rect(14, 14, 269, 182)
    
    // Corner decorations - top left
    doc.setFillColor(13, 148, 136)
    doc.circle(20, 20, 3, 'F')
    doc.setFillColor(20, 184, 166)
    doc.circle(28, 20, 2, 'F')
    doc.setFillColor(6, 95, 70)
    doc.circle(34, 20, 1.5, 'F')
    
    // Corner decorations - top right
    doc.circle(277, 20, 3, 'F')
    doc.circle(269, 20, 2, 'F')
    doc.circle(263, 20, 1.5, 'F')
    
    // Corner decorations - bottom left
    doc.circle(20, 190, 3, 'F')
    doc.circle(28, 190, 2, 'F')
    doc.circle(34, 190, 1.5, 'F')
    
    // Corner decorations - bottom right
    doc.circle(277, 190, 3, 'F')
    doc.circle(269, 190, 2, 'F')
    doc.circle(263, 190, 1.5, 'F')
    
    // Watermark logo (opacity simulated)
    doc.setGState(new doc.GState({ opacity: 0.05 }))
    const logoImg = new Image()
    logoImg.src = logo
    await new Promise((resolve) => { logoImg.onload = resolve })
    doc.addImage(logoImg, 'PNG', 100, 65, 97, 80)
    doc.setGState(new doc.GState({ opacity: 1 }))
    
    // Header gradient bar
    for (let i = 0; i < 8; i++) {
      doc.setFillColor(13 + i * 2, 148 - i * 5, 136 - i * 3)
      doc.rect(12 + i, 12, 1, 186)
      doc.rect(12, 12 + i, 273, 1)
      doc.rect(12, 198 - i, 273, 1)
      doc.rect(295 - i, 12, 1, 186)
    }
    
    // Logo
    doc.addImage(logoImg, 'PNG', 128, 20, 41, 14)
    
    // Title
    doc.setFontSize(24)
    doc.setTextColor(13, 148, 136)
    doc.setFont('helvetica', 'bold')
    doc.text(certificate.title, 148.5, 50, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'normal')
    doc.text(certificate.sub_title, 148.5, 58, { align: 'center' })
    
    // Decorative line
    doc.setDrawColor(13, 148, 136)
    doc.setLineWidth(0.5)
    doc.line(60, 64, 237, 64)
    doc.setDrawColor(20, 184, 166)
    doc.line(70, 66, 227, 66)
    
    // Content
    doc.setFontSize(11)
    doc.setTextColor(100, 116, 139)
    doc.text('Diberikan kepada', 148.5, 82, { align: 'center' })
    
    doc.setFontSize(26)
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.text(certificate.participant_name, 148.5, 100, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'normal')
    doc.text('Atas keberhasilan sebagai', 148.5, 118, { align: 'center' })
    
    doc.setFontSize(18)
    doc.setTextColor(13, 148, 136)
    doc.setFont('helvetica', 'bold')
    doc.text(certificate.kompetensi, 148.5, 133, { align: 'center' })
    
    // Score box
    doc.setFillColor(240, 253, 250)
    doc.roundedRect(60, 143, 177, 22, 4, 4, 'F')
    doc.setDrawColor(13, 148, 136)
    doc.setLineWidth(0.3)
    doc.roundedRect(60, 143, 177, 22, 4, 4, 'D')
    
    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    doc.text(`Nilai Akhir: ${certificate.nilai_akhir} / 100`, 98, 155, { align: 'center' })
    doc.text(`Grade: ${certificate.grade} - ${certificate.grade_text}`, 158, 155, { align: 'center' })
    doc.text(`Level: ${certificate.level}`, 218, 155, { align: 'center' })
    
    // Signatures
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    // Left signature - Director
    doc.setTextColor(100, 116, 139)
    doc.text(certificate.director_name, 60, 180)
    doc.setDrawColor(13, 148, 136)
    doc.setLineWidth(0.5)
    doc.line(35, 184, 100, 184)
    doc.setFontSize(8)
    doc.text('Direktur Utama', 60, 192)
    
    // Right signature - CEO
    doc.text(certificate.ceo_name, 197, 180)
    doc.line(172, 184, 242, 184)
    doc.text('Chief Executive Officer', 197, 192)
    
    // Badge
    doc.setFillColor(13, 148, 136)
    doc.circle(148.5, 175, 8, 'F')
    doc.setFillColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setTextColor(13, 148, 136)
    doc.text('★', 148.5, 178, { align: 'center' })
    
    // Footer
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text(`No: ${certificate.certificate_number}`, 148.5, 204, { align: 'center' })
    doc.text(`Diterbitkan: ${new Date(certificate.issue_date).toLocaleDateString('id-ID')}`, 148.5, 209, { align: 'center' })
    
    return doc.output('blob')
  }

  const handlePreviewCertificate = () => {
    setShowPreview(true)
  }

  const handleDownloadCertificate = async () => {
    setDownloading(true)
    try {
      const pdfBlob = await generatePDF()
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Sertifikat_Kompetensi_${certificate.participant_name.replace(/ /g, '_')}.pdf`
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

  const isAllRequirementsMet = requirements.every(req => req.status)
  const canDownload = certificate?.available && isAllRequirementsMet

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold">Sertifikat Kompetensi</h1>
              <p className="text-white/80 text-xs mt-0.5">Sertifikat kompetensi berdasarkan hasil ujian</p>
              {USE_DUMMY_DATA && (
                <p className="text-white/60 text-[10px] mt-1 flex items-center gap-1">
                  <Star size="10" />
                  Mode Preview - Data Contoh
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CATATAN BACKEND DEVELOPER */}
      {backendError && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
          <div className="flex items-start gap-3">
            <Server size="18" className="text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">⚠️ Catatan untuk Backend Developer</p>
              <p className="text-xs text-amber-700 mt-1">
                Halaman ini menggunakan DATA DUMMY untuk preview. Backend perlu membuat endpoint:
              </p>
              <div className="bg-amber-100 rounded-md p-2 mt-2 font-mono text-xs">
                <p>GET /api/peserta/sertifikat-kompetensi</p>
                <p>Response: {`{ success: true, data: { peserta, nilai_kuis, kompetensi, grade, ... }, requirements: [...] }`}</p>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                Logika: Sertifikat hanya muncul jika <strong>semua kuis kompetensi telah dikerjakan</strong> dan <strong>nilai rata-rata ≥ 75</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {canDownload ? (
        <>
          {/* Preview Sertifikat Premium */}
          <div 
            className="relative group mb-6 cursor-pointer" 
            onClick={handlePreviewCertificate}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              {/* Decorative header */}
              <div className="h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500"></div>
              
              <div className="p-6 text-center">
                {/* Logo */}
                <div className="flex justify-center mb-4">
                  <img src={logo} alt="Kuanta Academy" className="h-10 object-contain" />
                </div>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 mb-4">
                  <Trophy size="12" className="text-teal-600" />
                  <span className="text-[9px] font-semibold text-teal-700 uppercase">Certificate of Competency</span>
                </div>
                
                <h2 className="text-base font-bold text-gray-800 mb-1">SERTIFIKAT KOMPETENSI</h2>
                <p className="text-[9px] text-gray-500 mb-3">Diberikan kepada:</p>
                
                <div className="mb-3">
                  <div className="inline-block border-b-2 border-teal-400 pb-0.5">
                    <p className="text-sm font-bold text-gray-800">{certificate.participant_name}</p>
                  </div>
                </div>
                
                <div className="inline-block px-3 py-0.5 rounded-full bg-teal-50 border border-teal-200 mb-3">
                  <p className="text-[9px] font-semibold text-teal-700">{certificate.kompetensi}</p>
                </div>
                
                <div className="flex justify-center gap-6 mb-4">
                  <div className="text-center">
                    <p className="text-[8px] text-gray-400">Nilai Akhir</p>
                    <p className="text-lg font-bold text-teal-600">{certificate.nilai_akhir} / 100</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-gray-400">Grade</p>
                    <p className="text-base font-bold text-teal-600">{certificate.grade}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-gray-400">Level</p>
                    <p className="text-xs font-bold text-teal-600">{certificate.level}</p>
                  </div>
                </div>
                
                <p className="text-[9px] text-gray-500 max-w-md mx-auto mb-4">{certificate.description}</p>
                
                <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-100">
                  <div className="text-left">
                    <p className="text-[7px] text-gray-400">Direktur Utama</p>
                    <div className="w-20 h-5 mb-0.5">
                      <svg viewBox="0 0 80 20" className="w-full">
                        <path d="M5,15 Q20,5 40,15 T75,15" stroke="#0d9488" fill="none" strokeWidth="1"/>
                      </svg>
                    </div>
                    <p className="text-[7px] font-medium text-gray-600 truncate max-w-[100px]">{certificate.director_name.split(',')[0]}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shadow-md">
                      <Award size="14" className="text-white" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] text-gray-400">CEO Kuanta Academy</p>
                    <div className="w-20 h-5 mb-0.5">
                      <svg viewBox="0 0 80 20" className="w-full">
                        <path d="M5,15 Q20,5 40,15 T75,15" stroke="#0d9488" fill="none" strokeWidth="1"/>
                      </svg>
                    </div>
                    <p className="text-[7px] font-medium text-gray-600 truncate max-w-[100px]">{certificate.ceo_name.split(',')[0]}</p>
                  </div>
                </div>
                
                <p className="text-[7px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
                  No: {certificate.certificate_number} | Terbit: {new Date(certificate.issue_date).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 hover:bg-black/5 rounded-2xl transition-all flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2">
                <Eye size="14" className="text-teal-600" />
                <p className="text-xs font-semibold text-teal-600">Klik untuk Preview</p>
              </div>
            </div>
          </div>

          {/* Hasil Kuis */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6">
            <div className="p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Crown size="14" className="text-amber-500" />
                Hasil Ujian Kompetensi
              </h3>
              <div className="space-y-2">
                {certificate.hasil_kuis.map((kuis, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-xs text-gray-700">{kuis.nama}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold ${kuis.nilai >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {kuis.nilai} / 100
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        kuis.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                        kuis.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        Grade {kuis.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Persyaratan */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6">
            <div className="p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Shield size="14" className="text-teal-500" />
                Persyaratan Sertifikat
              </h3>
              <div className="space-y-2">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-xs text-gray-700">{req.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500">{req.nilai}</span>
                      {req.status ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle size="12" />
                          <span className="text-[10px] font-medium">✓</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle size="12" />
                          <span className="text-[10px] font-medium">✗</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 border border-teal-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <Download size="16" className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-teal-800">Sertifikat Siap Diunduh</p>
                  <p className="text-[10px] text-teal-600">Anda memenuhi semua persyaratan kompetensi</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviewCertificate}
                  className="px-3 py-1.5 rounded-lg border border-teal-500 text-teal-600 text-xs font-semibold hover:bg-teal-50 transition-all flex items-center gap-1"
                >
                  <Eye size="12" />
                  Preview
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  disabled={downloading}
                  className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {downloading ? <Loader2 size="12" className="animate-spin" /> : <Download size="12" />}
                  {downloading ? "Memproses..." : "Unduh PDF"}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <Award size="28" className="text-gray-400" />
            </div>
          </div>
          <h2 className="text-base font-bold text-gray-700 mb-2">Sertifikat Belum Tersedia</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Anda belum memenuhi seluruh persyaratan untuk mendapatkan sertifikat kompetensi.
            Selesaikan semua kuis kompetensi dengan nilai minimal 75.
          </p>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
            <p className="text-xs font-semibold text-gray-700 mb-2">Persyaratan yang belum terpenuhi:</p>
            <div className="space-y-1">
              {requirements.filter(r => !r.status).map((req, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-red-600">
                  <XCircle size="10" />
                  <span>{req.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-teal-50/90 via-blue-50/90 to-transparent rounded-xl p-3 border border-teal-100 shadow-sm mt-4">
        <div className="flex items-start gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-teal-500 rounded-lg blur-md opacity-30"></div>
            <div className="relative p-1.5 bg-white rounded-lg shadow-sm">
              <FileCheck size="12" className="text-teal-500" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-teal-800">Informasi Sertifikat Kompetensi</p>
            <p className="text-[10px] text-teal-700">
              Sertifikat kompetensi diberikan berdasarkan hasil ujian kompetensi yang telah Anda kerjakan.
              Preview dan file PDF yang diunduh adalah SAMA. Sertifikat ini dapat digunakan sebagai bukti kompetensi Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Preview PDF */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50">
              <div className="flex items-center gap-2">
                <FileCheck size="18" className="text-teal-600" />
                <h3 className="font-semibold text-gray-800">Preview Sertifikat Kompetensi</h3>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-white/50">
                <X size="18" className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] bg-gray-100">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
                <div className="h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500"></div>
                <div className="p-6 text-center">
                  <img src={logo} alt="Logo" className="h-10 mx-auto mb-4" />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 mb-4">
                    <Trophy size="12" className="text-teal-600" />
                    <span className="text-[9px] font-semibold text-teal-700 uppercase">Certificate of Competency</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">SERTIFIKAT KOMPETENSI</h2>
                  <p className="text-[10px] text-gray-500 mb-4">{certificate.participant_name}</p>
                  <div className="inline-block px-4 py-1 rounded-full bg-teal-50 border border-teal-200 mb-4">
                    <p className="text-xs font-semibold text-teal-700">{certificate.kompetensi}</p>
                  </div>
                  <div className="flex justify-center gap-8 mb-4">
                    <div><p className="text-[10px] text-gray-400">Nilai Akhir</p><p className="text-2xl font-bold text-teal-600">{certificate.nilai_akhir}</p></div>
                    <div><p className="text-[10px] text-gray-400">Grade</p><p className="text-2xl font-bold text-teal-600">{certificate.grade}</p></div>
                    <div><p className="text-[10px] text-gray-400">Level</p><p className="text-lg font-bold text-teal-600">{certificate.level}</p></div>
                  </div>
                  <p className="text-xs text-gray-500">{certificate.description}</p>
                  <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                    <div><p className="text-xs text-gray-500">Direktur Utama</p><p className="text-xs font-medium">{certificate.director_name.split(',')[0]}</p></div>
                    <div><p className="text-xs text-gray-500">CEO</p><p className="text-xs font-medium">{certificate.ceo_name.split(',')[0]}</p></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setShowPreview(false)} className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm">Tutup</button>
              <button onClick={handleDownloadCertificate} className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1">
                <Download size="14" /> Unduh PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sertifikat