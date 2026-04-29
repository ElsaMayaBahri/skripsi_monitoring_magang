import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { logActivity } from "../../utils/activityLogger";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Briefcase,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Zap,
  CheckCircle,
  AlertTriangle,
  Award,
  BadgeCheck,
  CalendarDays,
  Clock,
  Users,
  Rocket
} from "lucide-react";

function AddMentor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [divisiLoading, setDivisiLoading] = useState(true);
  const [divisiList, setDivisiList] = useState([]);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 🔥 SUCCESS MODAL PREMIUM - KEMBALI DIPAKAI
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successData, setSuccessData] = useState(null);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    password_confirmation: false,
    name: false,
    phone: false,
    id_divisi: false,
    jabatan: false,
  });

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
    phone: "",
    id_divisi: "",
    jabatan: "",
    status_akun: "aktif",
  });

  useEffect(() => {
    loadDivisiList();
  }, []);

  const loadDivisiList = async () => {
    setDivisiLoading(true);
    try {
      const response = await api.getDivisi();
      let divisiData = [];
      
      if (response && response.success && Array.isArray(response.data)) {
        divisiData = response.data;
      } else if (Array.isArray(response)) {
        divisiData = response;
      }
      
      setDivisiList(divisiData);
    } catch (err) {
      console.error("Error loading divisi:", err);
      setError("Gagal memuat data divisi");
      setDivisiList([]);
    } finally {
      setDivisiLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const angkaOnly = value.replace(/[^0-9]/g, "").slice(0, 15);
      setForm({ ...form, [name]: angkaOnly });
    } else {
      setForm({ ...form, [name]: value });
    }
    if (error) setError("");
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleToggle = () => {
    setForm({ 
      ...form, 
      status_akun: form.status_akun === "aktif" ? "non_aktif" : "aktif" 
    });
  };

  const isEmailValid = () => {
    if (!form.email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(form.email);
  };

  const isPasswordValid = () => form.password.length >= 6;
  const isPasswordMatch = () => form.password === form.password_confirmation;
  const isNameValid = () => form.name.trim().length > 0;
  const isPhoneValid = () => form.phone.length >= 10 && form.phone.length <= 15;
  const isDivisiValid = () => form.id_divisi !== "" && form.id_divisi !== null;
  const isJabatanValid = () => form.jabatan.trim().length > 0;

  const isFormComplete = () => {
    return (
      isEmailValid() &&
      isPasswordValid() &&
      isPasswordMatch() &&
      isNameValid() &&
      isPhoneValid() &&
      isDivisiValid() &&
      isJabatanValid()
    );
  };

  const getFieldError = (field) => {
    if (!touched[field]) return null;
    
    switch(field) {
      case 'email':
        if (!form.email) return "Email harus diisi";
        if (!isEmailValid()) return "Email tidak valid";
        return null;
      case 'password':
        if (!form.password) return "Password harus diisi";
        if (form.password.length < 6) return "Minimal 6 karakter";
        return null;
      case 'password_confirmation':
        if (!form.password_confirmation) return "Konfirmasi password harus diisi";
        if (form.password !== form.password_confirmation) return "Password tidak cocok";
        return null;
      case 'name':
        if (!form.name.trim()) return "Nama lengkap harus diisi";
        return null;
      case 'phone':
        if (!form.phone) return "Nomor telepon harus diisi";
        if (!isPhoneValid()) return "Harus 10-15 digit angka";
        return null;
      case 'id_divisi':
        if (!form.id_divisi) return "Divisi harus dipilih";
        return null;
      case 'jabatan':
        if (!form.jabatan.trim()) return "Jabatan harus diisi";
        return null;
      default:
        return null;
    }
  };

  const validateForm = () => {
    setTouched({
      email: true,
      password: true,
      password_confirmation: true,
      name: true,
      phone: true,
      id_divisi: true,
      jabatan: true,
    });

    if (!isEmailValid()) { setError("Email tidak valid"); return false; }
    if (!isPasswordValid()) { setError("Password minimal 6 karakter"); return false; }
    if (!isPasswordMatch()) { setError("Konfirmasi password tidak cocok"); return false; }
    if (!isNameValid()) { setError("Nama lengkap harus diisi"); return false; }
    if (!isPhoneValid()) { setError("Nomor telepon harus 10-15 digit angka"); return false; }
    if (!isDivisiValid()) { setError("Divisi harus dipilih"); return false; }
    if (!isJabatanValid()) { setError("Jabatan harus diisi"); return false; }
    return true;
  };

  const getDivisiName = (idDivisi) => {
    const divisi = divisiList.find(d => (d.id_divisi || d.id) == idDivisi);
    return divisi ? (divisi.nama_divisi || divisi.nama) : "-";
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const idDivisi = parseInt(form.id_divisi);
      const selectedDivisi = divisiList.find(d => (d.id_divisi || d.id) == idDivisi);
      const divisiName = selectedDivisi ? (selectedDivisi.nama_divisi || selectedDivisi.nama) : "";
      
      const mentorData = {
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        no_telepon: form.phone,
        id_divisi: idDivisi,
        divisi: divisiName,
        jabatan: form.jabatan.trim(),
        status: true
      };
      
      console.log("Sending mentor data to API:", mentorData);
      
      const response = await api.addMentor(mentorData);
      
      if (response && response.success) {
        // 🔥 LOG ACTIVITY - CREATE MENTOR
        logActivity("create", "mentor", form.name);
        
        // 🔥 SET DATA UNTUK POP UP PREMIUM
        setSuccessData({
          name: form.name,
          email: form.email,
          divisi: divisiName,
          jabatan: form.jabatan,
          status: "Aktif"
        });
        setSuccessMessage(response.message || "Mentor berhasil ditambahkan!");
        setShowSuccessModal(true);
      } else {
        setError(response?.message || "Gagal menambahkan mentor");
      }
    } catch (err) {
      console.error("Error adding mentor:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        setError(errors.join("\n"));
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat menyimpan data");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔥 PERBAIKAN: Modal Close langsung ke halaman users dengan tab mentor
  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/admin/users", { 
      state: { 
        tab: "mentor"
      } 
    });
  };

  const requiredFields = {
    email: isEmailValid(),
    password: isPasswordValid(),
    passwordConfirm: isPasswordMatch(),
    name: isNameValid(),
    phone: isPhoneValid(),
    divisi: isDivisiValid(),
    jabatan: isJabatanValid(),
  };
  const completedCount = Object.values(requiredFields).filter(Boolean).length;
  const totalRequired = 7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
        
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 mb-3 transition text-sm group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Data Pengguna
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Tambah Mentor Baru
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                Semua field wajib diisi (*)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          {error && (
            <div className="m-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 whitespace-pre-wrap flex-1">{error}</p>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN - Informasi Akun */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <Mail size={12} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Informasi Akun</h3>
                  <span className="text-[10px] text-red-500">*Wajib</span>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('email') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="email"
                      type="email"
                      placeholder="contoh@perusahaan.com"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('email') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.email && isEmailValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-blue-400 focus:ring-blue-500/30'
                      }`}
                      disabled={loading}
                    />
                    {form.email && isEmailValid() && !getFieldError('email') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('email') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('email')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('password') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('password') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.password && isPasswordValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-blue-400 focus:ring-blue-500/30'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {form.password && isPasswordValid() && !getFieldError('password') && (
                      <CheckCircle size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('password') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('password')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('password_confirmation') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Konfirmasi password"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password_confirmation')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('password_confirmation') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.password_confirmation && isPasswordMatch()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-blue-400 focus:ring-blue-500/30'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {form.password_confirmation && isPasswordMatch() && !getFieldError('password_confirmation') && (
                      <CheckCircle size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('password_confirmation') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('password_confirmation')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Divisi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('id_divisi') ? 'text-red-400' : 'text-slate-400'}`} />
                    <select
                      name="id_divisi"
                      value={form.id_divisi}
                      onChange={handleChange}
                      onBlur={() => handleBlur('id_divisi')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition appearance-none bg-white ${
                        getFieldError('id_divisi') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.id_divisi && isDivisiValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-blue-400 focus:ring-blue-500/30'
                      }`}
                      disabled={loading || divisiLoading}
                    >
                      <option value="">Pilih Divisi</option>
                      {divisiLoading ? (
                        <option value="" disabled>Memuat divisi...</option>
                      ) : divisiList.length === 0 ? (
                        <option value="" disabled>Tidak ada divisi tersedia</option>
                      ) : (
                        divisiList.map((divisi) => (
                          <option key={divisi.id_divisi || divisi.id} value={divisi.id_divisi || divisi.id}>
                            {divisi.nama_divisi || divisi.nama}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {form.id_divisi && isDivisiValid() && !getFieldError('id_divisi') && (
                      <CheckCircle size={14} className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('id_divisi') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('id_divisi')}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Informasi Pribadi */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-emerald-100 rounded-lg">
                    <User size={12} className="text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Informasi Pribadi</h3>
                  <span className="text-[10px] text-red-500">*Wajib</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('name') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="name"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('name')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('name') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.name && isNameValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-blue-400 focus:ring-blue-500/30'
                      }`}
                      disabled={loading}
                    />
                    {form.name && isNameValid() && !getFieldError('name') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('name') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('name')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('phone') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="81234567890"
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur('phone')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('phone') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.phone && isPhoneValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-blue-400 focus:ring-blue-500/30'
                      }`}
                      disabled={loading}
                      inputMode="numeric"
                    />
                    {form.phone && isPhoneValid() && !getFieldError('phone') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('phone') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('phone')}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">Hanya angka, 10-15 digit, tanpa 0 di depan</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${getFieldError('jabatan') ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      name="jabatan"
                      type="text"
                      placeholder="Contoh: Senior Mentor"
                      value={form.jabatan}
                      onChange={handleChange}
                      onBlur={() => handleBlur('jabatan')}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
                        getFieldError('jabatan') 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-500/30 bg-red-50/30' 
                          : form.jabatan && isJabatanValid()
                            ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/30'
                            : 'border-slate-200 focus:border-blue-400 focus:ring-blue-500/30'
                      }`}
                      disabled={loading}
                    />
                    {form.jabatan && isJabatanValid() && !getFieldError('jabatan') && (
                      <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {getFieldError('jabatan') && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {getFieldError('jabatan')}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Status Akun</span>
                    <span className="text-[10px] text-red-500">*</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggle}
                    disabled={loading}
                    className={`relative w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                      form.status_akun === "aktif" ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 ${
                        form.status_akun === "aktif" ? "translate-x-5" : "translate-x-0"
                      }`}
                    ></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1">
                  <Award size={12} />
                  Progress pengisian form
                </span>
                <span className="font-medium text-blue-600">
                  {completedCount}/{totalRequired} field wajib terisi
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalRequired) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {isFormComplete() 
                  ? "✓ Semua data telah terisi, siap disimpan!" 
                  : "⚠️ Lengkapi semua field (*) untuk melanjutkan"}
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 transition-all duration-200"
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !isFormComplete()}
              className={`px-6 py-2 rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 ${
                isFormComplete() && !loading
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 cursor-pointer"
                  : "bg-slate-400 cursor-not-allowed opacity-60"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Simpan Mentor
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-500" />
            <p className="text-xs text-blue-700">
              <strong className="font-semibold">Tips:</strong> Password minimal 6 karakter. 
              <span className="text-red-500 font-medium ml-1">Semua field wajib diisi</span>.
              Nomor telepon hanya angka 10-15 digit tanpa 0 di depan.
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 PREMIUM SUCCESS MODAL (RAMAI) - SAMA KAYAK ADD PESERTA */}
      {showSuccessModal && successData && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleModalClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
                
                <div className="relative pt-8 pb-4 px-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 rounded-2xl shadow-xl">
                    <CheckCircle size={42} className="text-white" strokeWidth={1.5} />
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-slate-800">
                      Registrasi Berhasil!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{successMessage}</p>
                  </div>
                </div>
                
                <div className="mx-6 p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                          <User size={20} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{successData.name}</h4>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-emerald-100 rounded-lg">
                      <p className="text-[9px] font-semibold text-emerald-600">MENTOR</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail size={13} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] text-slate-400">Email Address</p>
                        <p className="text-xs font-medium text-slate-700 truncate">{successData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                      <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 size={13} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] text-slate-400">Division</p>
                        <p className="text-xs font-medium text-slate-700">{successData.divisi}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100">
                      <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Shield size={13} className="text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] text-slate-400">Status</p>
                        <p className="text-xs font-medium text-slate-700">{successData.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 px-6">
                  <div className="flex items-center justify-center gap-2 text-[9px] text-slate-400">
                    <CalendarDays size={10} />
                    <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <Clock size={10} />
                    <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                
                <div className="p-6 pt-4">
                  <button
                    onClick={handleModalClose}
                    className="group relative w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <Users size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      Lihat Daftar Mentor
                    </span>
                  </button>
                </div>
                
                <div className="pb-5 text-center">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full">
                    <BadgeCheck size={10} className="text-emerald-600" />
                    <span className="text-[9px] text-slate-500">Akun mentor telah aktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AddMentor;