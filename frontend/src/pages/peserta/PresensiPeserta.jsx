// src/pages/peserta/PresensiPeserta.jsx
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar,
  Camera,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Wifi,
  Smartphone,
  FileText,
  X,
  Upload,
  Image,
  User
} from "lucide-react"

function PresensiPeserta() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [checkinStatus, setCheckinStatus] = useState(null)
  const [checkoutStatus, setCheckoutStatus] = useState(null)
  const [formData, setFormData] = useState({
    foto: null,
    jenis_kehadiran: "wfo",
    aktivitas: "",
    kendala: "",
    rencana: ""
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [location, setLocation] = useState({ lat: null, lng: null, address: "" })
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    checkTodayPresensi()
    getCurrentLocation()
  }, [])

  const checkTodayPresensi = () => {
    const today = new Date().toISOString().split('T')[0]
    const storedPresensi = JSON.parse(localStorage.getItem("presensi_peserta")) || []
    const todayPresensi = storedPresensi.find(p => p.tanggal === today)
    
    if (todayPresensi) {
      if (todayPresensi.check_in && !todayPresensi.check_out) {
        setCheckinStatus({ success: true, time: todayPresensi.check_in })
        setCheckoutStatus({ pending: true })
        setFormData(prev => ({ ...prev, aktivitas: todayPresensi.aktivitas || "", kendala: todayPresensi.kendala || "", rencana: todayPresensi.rencana || "" }))
      } else if (todayPresensi.check_in && todayPresensi.check_out) {
        setCheckinStatus({ success: true, time: todayPresensi.check_in })
        setCheckoutStatus({ success: true, time: todayPresensi.check_out })
      }
    }
  }

  const getCurrentLocation = () => {
    setGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Mendapatkan alamat..."
          })
          setTimeout(() => {
            setLocation(prev => ({ ...prev, address: "Jl. Teknologi No. 123, Jakarta Selatan" }))
          }, 1000)
          setGettingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocation({ lat: null, lng: null, address: "Gagal mendapatkan lokasi" })
          setGettingLocation(false)
        }
      )
    } else {
      setLocation({ lat: null, lng: null, address: "Geolocation tidak didukung" })
      setGettingLocation(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, foto: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCheckin = async () => {
    if (!formData.foto) {
      alert("Foto wajib diunggah untuk check-in")
      return
    }

    setLoading(true)
    setTimeout(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      
      const newPresensi = {
        tanggal: now.toISOString().split('T')[0],
        check_in: timeStr,
        check_out: null,
        status: "hadir",
        foto: previewImage,
        lokasi: location.address,
        jenis_kehadiran: formData.jenis_kehadiran,
        aktivitas: null,
        kendala: null,
        rencana: null
      }
      
      const storedPresensi = JSON.parse(localStorage.getItem("presensi_peserta")) || []
      const updatedPresensi = [...storedPresensi.filter(p => p.tanggal !== newPresensi.tanggal), newPresensi]
      localStorage.setItem("presensi_peserta", JSON.stringify(updatedPresensi))
      
      setCheckinStatus({ success: true, time: timeStr })
      setLoading(false)
      alert("Check-in berhasil!")
    }, 1500)
  }

  const handleCheckout = async () => {
    if (!formData.aktivitas.trim()) {
      alert("Aktivitas hari ini wajib diisi sebelum check-out")
      return
    }

    setLoading(true)
    setTimeout(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      const today = now.toISOString().split('T')[0]
      
      const storedPresensi = JSON.parse(localStorage.getItem("presensi_peserta")) || []
      const updatedPresensi = storedPresensi.map(p => 
        p.tanggal === today 
          ? { ...p, check_out: timeStr, aktivitas: formData.aktivitas, kendala: formData.kendala, rencana: formData.rencana }
          : p
      )
      localStorage.setItem("presensi_peserta", JSON.stringify(updatedPresensi))
      
      setCheckoutStatus({ success: true, time: timeStr })
      setLoading(false)
      alert("Check-out dan Daily Report berhasil disimpan!")
      setTimeout(() => navigate("/peserta/riwayat-presensi"), 1500)
    }, 1500)
  }

  const currentTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  const currentDate = new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  if (checkoutStatus?.success) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <CheckCircle size="40" className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check-out Berhasil!</h2>
          <p className="text-gray-500 mb-4">Daily report Anda telah tersimpan</p>
          <button
            onClick={() => navigate("/peserta/riwayat-presensi")}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-medium"
          >
            Lihat Riwayat Presensi
          </button>
        </div>
      </div>
    )
  }

  if (checkinStatus?.success && checkoutStatus?.pending) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-md opacity-50"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-teal-800 to-emerald-800 bg-clip-text text-transparent">
                Daily Report & Check-out
              </h1>
              <p className="text-sm text-gray-500 mt-1">Isi laporan harian Anda sebelum check-out</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-teal-50">
                <p className="text-xs text-gray-500">Check-in</p>
                <p className="text-xl font-bold text-teal-600">{checkinStatus.time}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-xl font-bold text-emerald-600">Sedang Magang</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">Tanggal</p>
                <p className="text-sm font-semibold text-gray-700">{currentDate}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aktivitas Hari Ini <span className="text-red-500">*</span></label>
              <textarea
                value={formData.aktivitas}
                onChange={(e) => setFormData(prev => ({ ...prev, aktivitas: e.target.value }))}
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 resize-none"
                placeholder="Ceritakan aktivitas yang Anda lakukan hari ini..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kendala (opsional)</label>
              <textarea
                value={formData.kendala}
                onChange={(e) => setFormData(prev => ({ ...prev, kendala: e.target.value }))}
                rows="2"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 resize-none"
                placeholder="Ada kendala dalam pengerjaan tugas?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rencana Selanjutnya (opsional)</label>
              <textarea
                value={formData.rencana}
                onChange={(e) => setFormData(prev => ({ ...prev, rencana: e.target.value }))}
                rows="2"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 resize-none"
                placeholder="Apa rencana Anda untuk hari esok?"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => navigate("/peserta/dashboard")}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading || !formData.aktivitas.trim()}
                className="relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? <Loader2 size="16" className="animate-spin" /> : <Send size="16" />}
                  {loading ? "Memproses..." : "Check-out & Simpan"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              Check-in Hari Ini
            </h1>
            <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto Selfie/Bukti Kehadiran <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="foto-input"
                  />
                  <label
                    htmlFor="foto-input"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-teal-400 transition-all duration-200"
                  >
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-center">
                        <Camera size="32" className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Klik untuk upload foto</p>
                        <p className="text-xs text-gray-400">Format JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kehadiran</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, jenis_kehadiran: "wfo" }))}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      formData.jenis_kehadiran === "wfo"
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <MapPin size="16" />
                    WFO
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, jenis_kehadiran: "wfh" }))}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      formData.jenis_kehadiran === "wfh"
                        ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Wifi size="16" />
                    WFH
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Saat Ini</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin size="18" className="text-teal-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 flex-1">
                    {gettingLocation ? "Mendapatkan lokasi..." : location.address || "Mendapatkan lokasi..."}
                  </span>
                  <button onClick={getCurrentLocation} className="p-1.5 rounded-lg hover:bg-gray-200 transition">
                    <RefreshCw size="14" className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50">
                <div className="flex items-center gap-3 mb-3">
                  <Clock size="18" className="text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">Waktu Check-in</span>
                  <span className="text-lg font-bold text-teal-600 ml-auto">{currentTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone size="18" className="text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">Device</span>
                  <span className="text-sm text-gray-500 ml-auto">Web Browser</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate("/peserta/dashboard")}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200"
            >
              Batal
            </button>
            <button
              onClick={handleCheckin}
              disabled={loading || !formData.foto}
              className="relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <Loader2 size="16" className="animate-spin" /> : <CheckCircle size="16" />}
                {loading ? "Memproses..." : "Check-in Sekarang"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PresensiPeserta