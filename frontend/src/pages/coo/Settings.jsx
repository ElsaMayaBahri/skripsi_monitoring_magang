import { useState, useEffect } from "react"
import { 
  Settings as SettingsIcon, 
  Bell, 
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Globe,
  Lock,
  Shield,
  LayoutDashboard
} from "lucide-react"
import { useNavigate } from "react-router-dom"

function Settings() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  
  const [settings, setSettings] = useState({
    language: "id",
    emailNotifications: true,
    pushNotifications: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("coo_settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (e) {
        console.error("Error loading settings:", e)
      }
    }
  }

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
    setError(null)
  }

  const showPremiumPopup = () => {
    setShowSuccessPopup(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      localStorage.setItem("coo_settings", JSON.stringify(settings))
      showPremiumPopup()
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("Gagal menyimpan pengaturan")
    } finally {
      setSaving(false)
    }
  }

  const handleClosePopup = () => {
    setShowSuccessPopup(false)
  }

  const handleGoToDashboard = () => {
    setShowSuccessPopup(false)
    navigate("/coo/dashboard")
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      
      {/* SUCCESS POPUP PREMIUM */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-zoomIn">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-2xl"></div>
              
              <div className="pt-8 pb-4 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-ping"></div>
                  <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                    <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-2 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Pengaturan Tersimpan!</h3>
                <div className="w-16 h-0.5 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <p className="text-slate-500 text-sm mb-2">Semua perubahan pengaturan telah disimpan.</p>
              </div>
              
              <div className="px-6 pb-8 pt-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleClosePopup}
                    className="flex-1 py-3 rounded-xl text-slate-600 text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-all duration-200"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={handleGoToDashboard}
                    className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-r from-teal-600 to-blue-600 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={16} />
                    Ke Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl shadow-md">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
            <p className="text-sm text-slate-500">Atur preferensi aplikasi Anda</p>
          </div>
        </div>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Notifikasi */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Notifikasi</h3>
              <p className="text-xs text-slate-400">Atur preferensi notifikasi</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
              <div>
                <p className="text-sm font-medium text-slate-700">Notifikasi Email</p>
                <p className="text-[10px] text-slate-400">Terima notifikasi melalui email</p>
              </div>
              <button
                onClick={() => handleChange("emailNotifications", !settings.emailNotifications)}
                className={`relative w-11 h-6 rounded-full transition-all ${
                  settings.emailNotifications ? "bg-teal-500" : "bg-slate-300"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                  settings.emailNotifications ? "right-0.5" : "left-0.5"
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
              <div>
                <p className="text-sm font-medium text-slate-700">Notifikasi Push</p>
                <p className="text-[10px] text-slate-400">Terima notifikasi di browser</p>
              </div>
              <button
                onClick={() => handleChange("pushNotifications", !settings.pushNotifications)}
                className={`relative w-11 h-6 rounded-full transition-all ${
                  settings.pushNotifications ? "bg-teal-500" : "bg-slate-300"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                  settings.pushNotifications ? "right-0.5" : "left-0.5"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Bahasa */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Bahasa / Language</h3>
              <p className="text-xs text-slate-400">Pilih bahasa aplikasi</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleChange("language", "id")}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                settings.language === "id"
                  ? "border-teal-500 bg-teal-50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-sm font-medium text-slate-700">Indonesia</span>
              {settings.language === "id" && <CheckCircle size={16} className="text-teal-600" />}
            </button>
            
            <button
              onClick={() => handleChange("language", "en")}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                settings.language === "en"
                  ? "border-teal-500 bg-teal-50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-sm font-medium text-slate-700">English</span>
              {settings.language === "en" && <CheckCircle size={16} className="text-teal-600" />}
            </button>
          </div>
        </div>

        {/* Keamanan */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Keamanan</h3>
              <p className="text-xs text-slate-400">Informasi keamanan akun</p>
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Shield size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Status Akun</p>
                <p className="text-[10px] text-slate-500">Akun Anda dalam keadaan aman</p>
              </div>
              <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleGoToDashboard}
          className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Pengaturan
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-zoomIn {
          animation: zoomIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Settings