// src/pages/peserta/DetailTugas.jsx
import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  FileText,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Upload,
  Download,
  Eye,
  MessageSquare,
  ChevronLeft,
  Loader2,
  Star,
  FileCheck
} from "lucide-react"

function DetailTugas() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tugas, setTugas] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    loadTugasDetail()
  }, [id])

  const loadTugasDetail = () => {
    setLoading(true)
    setTimeout(() => {
      const dummyTugas = {
        id: parseInt(id),
        judul: "Frontend Development - Week 3",
        deskripsi: "Buat halaman dashboard dengan React JS yang menampilkan data user secara real-time menggunakan API. Pastikan tampilan responsive dan interaktif.",
        deadline: "2024-12-20",
        bobot: 30,
        status: "pending",
        submitted_at: null,
        nilai: null,
        catatan: null,
        file_url: null,
        file_name: null,
        created_at: "2024-12-10"
      }
      setTugas(dummyTugas)
      setLoading(false)
    }, 500)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10 MB")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Pilih file terlebih dahulu")
      return
    }

    setUploading(true)
    setTimeout(() => {
      const now = new Date()
      const isLate = now > new Date(tugas.deadline)
      
      const updatedTugas = {
        ...tugas,
        status: "pending",
        submitted_at: now.toISOString(),
        file_name: selectedFile.name,
        file_url: URL.createObjectURL(selectedFile),
        is_late: isLate
      }
      
      const storedTugas = JSON.parse(localStorage.getItem("tugas_peserta") || "[]")
      const index = storedTugas.findIndex(t => t.id === tugas.id)
      if (index !== -1) {
        storedTugas[index] = updatedTugas
      } else {
        storedTugas.push(updatedTugas)
      }
      localStorage.setItem("tugas_peserta", JSON.stringify(storedTugas))
      
      setTugas(updatedTugas)
      setUploadSuccess(true)
      setUploading(false)
      setTimeout(() => setUploadSuccess(false), 3000)
    }, 1500)
  }

  const getDeadlineStatus = () => {
    if (!tugas) return null
    const today = new Date()
    const deadlineDate = new Date(tugas.deadline)
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: "text-red-600", bg: "bg-red-50", label: "Melewati Deadline", icon: AlertCircle }
    if (diffDays === 0) return { text: "text-amber-600", bg: "bg-amber-50", label: "Deadline Hari Ini", icon: AlertCircle }
    if (diffDays <= 3) return { text: "text-amber-600", bg: "bg-amber-50", label: `${diffDays} hari lagi`, icon: Clock }
    return { text: "text-green-600", bg: "bg-green-50", label: `${diffDays} hari lagi`, icon: Calendar }
  }

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

  const deadlineStatus = getDeadlineStatus()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/peserta/tugas" className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors">
        <ChevronLeft size="16" />
        <span className="text-sm">Kembali ke Daftar Tugas</span>
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/5 to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
              Detail Tugas
            </h1>
            <p className="text-sm text-gray-500 mt-1">{tugas?.judul}</p>
          </div>
        </div>
      </div>

      {/* Upload Success Alert */}
      {uploadSuccess && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-200 animate-in slide-in-from-top-2">
          <CheckCircle size="20" className="text-emerald-500" />
          <p className="text-sm text-emerald-700">Tugas berhasil diunggah!</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info Tugas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deskripsi */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Deskripsi Tugas</h3>
              <p className="text-gray-600 leading-relaxed">{tugas?.deskripsi}</p>
            </div>
          </div>

          {/* Upload Section */}
          {tugas?.status !== "selesai" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="relative h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Unggah Tugas</h3>
                
                {tugas?.submitted_at ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                      <FileCheck size="20" className="text-teal-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">File Tugas Terunggah</p>
                        <p className="text-xs text-gray-500">{tugas.file_name}</p>
                      </div>
                      <a href={tugas.file_url} download className="p-2 rounded-lg bg-teal-100 text-teal-600 hover:bg-teal-200 transition">
                        <Download size="16" />
                      </a>
                    </div>
                    {tugas.status === "revisi" && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Revisi</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.zip"
                            className="flex-1 text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                          />
                          <button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
                          >
                            {uploading ? <Loader2 size="16" className="animate-spin" /> : <Upload size="16" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <Upload size="40" className="mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-500">Klik atau drag file ke sini untuk upload</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, ZIP (Max 10MB)</p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.zip"
                        className="mt-4 text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                      />
                    </div>
                    {selectedFile && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50">
                        <div className="flex items-center gap-2">
                          <FileText size="16" className="text-teal-600" />
                          <span className="text-sm text-gray-700">{selectedFile.name}</span>
                        </div>
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-sm font-medium"
                        >
                          {uploading ? <Loader2 size="14" className="animate-spin" /> : "Upload"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nilai & Feedback */}
          {tugas?.status === "selesai" && tugas?.nilai && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="relative h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Hasil Penilaian</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-emerald-50 text-center">
                    <Star size="20" className="text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-emerald-600">{tugas.nilai}</p>
                    <p className="text-xs text-gray-500">Nilai Akhir</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 text-center">
                    <Award size="20" className="text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{tugas.bobot}%</p>
                    <p className="text-xs text-gray-500">Bobot Tugas</p>
                  </div>
                </div>
                {tugas.catatan && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size="14" className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Catatan Mentor</span>
                    </div>
                    <p className="text-sm text-gray-600">{tugas.catatan}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Deadline</span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${deadlineStatus.bg} ${deadlineStatus.text}`}>
                  <deadlineStatus.icon size="12" />
                  <span className="text-xs font-medium">{deadlineStatus.label}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Bobot Nilai</span>
                <span className="text-sm font-semibold text-teal-600">{tugas?.bobot}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
                  tugas?.status === "selesai" ? "bg-emerald-100 text-emerald-700" :
                  tugas?.status === "revisi" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {tugas?.status === "selesai" && <CheckCircle size="12" />}
                  {tugas?.status === "revisi" && <AlertCircle size="12" />}
                  {tugas?.status === "pending" && <Clock size="12" />}
                  <span className="text-xs font-medium">
                    {tugas?.status === "selesai" ? "Selesai" : tugas?.status === "revisi" ? "Perlu Revisi" : "Belum Dikumpulkan"}
                  </span>
                </div>
              </div>
              {tugas?.submitted_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tanggal Kumpul</span>
                  <span className="text-sm text-gray-700">{new Date(tugas.submitted_at).toLocaleDateString("id-ID")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailTugas