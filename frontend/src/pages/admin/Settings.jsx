import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  Moon,
  Sun,
  Bell,
  Mail,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Database,
  RefreshCw,
  LogOut
} from "lucide-react";

function AdminSettings() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    auto_backup: false,
    session_timeout: 30,
    language: "id"
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Simulasi simpan pengaturan
      localStorage.setItem("admin_settings", JSON.stringify(settings));
      if (darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      
      setSuccess("Pengaturan berhasil disimpan!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = () => {
    if (window.confirm("Hapus cache akan membersihkan data sementara. Lanjutkan?")) {
      localStorage.removeItem("admin_settings");
      setSuccess("Cache berhasil dibersihkan!");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="p-5 lg:p-6 max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 mb-3 transition text-sm"
          >
            <ArrowLeft size={14} />
            Kembali
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl shadow-md">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                Pengaturan Sistem
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Atur preferensi dan konfigurasi sistem
              </p>
            </div>
          </div>
        </div>

        {/* NOTIF */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            <p className="text-sm text-emerald-600 flex-1">{success}</p>
          </div>
        )}

        {/* SETTINGS CARDS */}
        <div className="space-y-5">
          
          {/* Tampilan */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-teal-100 rounded-lg">
                  <Sun size={14} className="text-teal-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Tampilan</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Mode Gelap</p>
                  <p className="text-xs text-slate-400">Tampilan dark mode untuk kenyamanan mata</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    darkMode ? "bg-teal-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                      darkMode ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notifikasi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Bell size={14} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Notifikasi</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Notifikasi Email</p>
                    <p className="text-xs text-slate-400">Terima update via email</p>
                  </div>
                  <button
                    onClick={() => handleToggle("email_notifications")}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                      settings.email_notifications ? "bg-teal-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                        settings.email_notifications ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Notifikasi Push</p>
                    <p className="text-xs text-slate-400">Notifikasi real-time di dashboard</p>
                  </div>
                  <button
                    onClick={() => handleToggle("push_notifications")}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                      settings.push_notifications ? "bg-teal-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                        settings.push_notifications ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Keamanan */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Shield size={14} className="text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Keamanan</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Timeout Sesi (menit)
                  </label>
                  <select
                    name="session_timeout"
                    value={settings.session_timeout}
                    onChange={handleChange}
                    className="w-full md:w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-white"
                  >
                    <option value="15">15 menit</option>
                    <option value="30">30 menit</option>
                    <option value="60">60 menit</option>
                    <option value="120">120 menit</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Auto Backup</p>
                    <p className="text-xs text-slate-400">Backup data otomatis setiap hari</p>
                  </div>
                  <button
                    onClick={() => handleToggle("auto_backup")}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                      settings.auto_backup ? "bg-teal-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                        settings.auto_backup ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="relative h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Database size={14} className="text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Maintenance</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleClearCache}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                >
                  <RefreshCw size={14} />
                  Bersihkan Cache
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* SAVE BUTTON */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={14} />}
            Simpan Pengaturan
          </button>
        </div>

        {/* INFO BANNER */}
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-500" />
            <p className="text-xs text-amber-700">
              <strong className="font-semibold">Tips:</strong> Perubahan pengaturan akan langsung diterapkan ke seluruh sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;