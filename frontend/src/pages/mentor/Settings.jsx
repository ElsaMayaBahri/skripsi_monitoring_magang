// src/pages/mentor/Settings.jsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import axiosInstance from "../../api/axios";

function SettingsMentor() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // State untuk pengaturan notifikasi
  const [settings, setSettings] = useState({
    notifications: {
      email_notifications: true,
      task_reminder: true,
      report_notifications: true,
      system_updates: false
    }
  });

  // State untuk ganti password
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load settings dari localStorage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("mentor_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            ...parsed.notifications
          }
        }));
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    }
  };

  const handleNotificationChange = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Simpan ke localStorage
      localStorage.setItem("mentor_settings", JSON.stringify(settings));
      
      setSuccessMessage("Pengaturan berhasil disimpan!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setErrorMessage("Gagal menyimpan pengaturan");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.current_password) {
      setErrorMessage("Password saat ini harus diisi");
      return;
    }
    if (!passwordForm.new_password) {
      setErrorMessage("Password baru harus diisi");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setErrorMessage("Password baru minimal 6 karakter");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrorMessage("Konfirmasi password tidak cocok");
      return;
    }
    
    setChangingPassword(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const response = await axiosInstance.post("/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.confirm_password
      });
      
      if (response.data.success) {
        setSuccessMessage("Password berhasil diubah!");
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(response.data.message || "Gagal mengubah password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-100/20">
      <div className="relative p-6 lg:p-8 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl"></div>
          <div className="relative px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur-md opacity-50"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Settings className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-teal-800 to-blue-800 bg-clip-text text-transparent">
                  Pengaturan
                </h1>
                <p className="text-sm text-slate-500 mt-1">Kelola notifikasi dan keamanan akun Anda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-600 flex-1">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600 flex-1">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Notifikasi */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <Bell size="18" className="text-teal-600" />
                <h3 className="font-semibold text-slate-800">Notifikasi</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Notifikasi Email</p>
                  <p className="text-xs text-slate-400">Terima notifikasi melalui email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email_notifications}
                    onChange={() => handleNotificationChange("email_notifications")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Pengingat Tugas</p>
                  <p className="text-xs text-slate-400">Notifikasi untuk tugas yang akan deadline</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.task_reminder}
                    onChange={() => handleNotificationChange("task_reminder")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Notifikasi Laporan</p>
                  <p className="text-xs text-slate-400">Pemberitahuan saat peserta upload laporan</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.report_notifications}
                    onChange={() => handleNotificationChange("report_notifications")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Ganti Password */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <Lock size="18" className="text-teal-600" />
                <h3 className="font-semibold text-slate-800">Ganti Password</h3>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400 pr-10"
                      placeholder="Masukkan password saat ini"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff size="16" /> : <Eye size="16" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400 pr-10"
                      placeholder="Minimal 6 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff size="16" /> : <Eye size="16" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-teal-400 pr-10"
                      placeholder="Ulangi password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size="16" /> : <Eye size="16" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {changingPassword ? <Loader2 size="16" className="animate-spin" /> : <Save size="16" />}
                  {changingPassword ? "Menyimpan..." : "Ubah Password"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Tombol Simpan Pengaturan */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size="16" className="animate-spin" /> : <Save size="16" />}
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default SettingsMentor;