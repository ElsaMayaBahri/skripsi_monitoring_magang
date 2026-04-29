import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { logActivity } from "../../utils/activityLogger";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Users,
  CheckCircle,
  Loader2,
  BadgeCheck,
  CalendarDays,
  Clock,
  Rocket
} from "lucide-react";

function EditMentor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const existingUserData = location.state?.userData;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [divisiList, setDivisiList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [originalUserId, setOriginalUserId] = useState(null);
  const [originalMentorId, setOriginalMentorId] = useState(null);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successData, setSuccessData] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    divisi_name: "",
    jabatan: "",
    status: "aktif",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load divisi list
        const divisiResult = await api.getDivisi();
        let divisiData = [];
        if (divisiResult && divisiResult.success && Array.isArray(divisiResult.data)) {
          divisiData = divisiResult.data;
        } else if (Array.isArray(divisiResult)) {
          divisiData = divisiResult;
        }
        setDivisiList(divisiData);
        console.log("Divisi list loaded:", divisiData);

        const mentorId = parseInt(id);
        if (isNaN(mentorId)) {
          setError("ID Mentor tidak valid");
          setLoading(false);
          return;
        }

        // Ambil data mentor dari API menggunakan getMentorById
        console.log("Fetching mentor by ID:", mentorId);
        const response = await api.getMentorById(mentorId);
        console.log("getMentorById response:", response);
        
        if (response && response.success && response.data) {
          const mentor = response.data;
          console.log("Found mentor:", mentor);
          
          // 🔥 SIMPAN id_user dan id_mentor
          setOriginalUserId(mentor.id_user);
          setOriginalMentorId(mentor.id_mentor);
          console.log("Original user ID:", mentor.id_user);
          console.log("Original mentor ID:", mentor.id_mentor);
          
          // Ambil data dari response
          const mentorName = mentor.nama || mentor.name || "";
          const mentorEmail = mentor.email || "";
          const mentorPhone = mentor.no_telepon || mentor.phone || "";
          const mentorJabatan = mentor.jabatan || "";
          const mentorDivisi = mentor.divisi || "";
          
          // Ambil status
          let mentorStatus = "non_aktif";
          if (mentor.status_akun === "aktif" || mentor.status_akun === "active") {
            mentorStatus = "aktif";
          } else if (mentor.status === "aktif") {
            mentorStatus = "aktif";
          }
          
          console.log("Extracted mentor data:", {
            name: mentorName,
            email: mentorEmail,
            phone: mentorPhone,
            jabatan: mentorJabatan,
            divisi: mentorDivisi,
            status: mentorStatus,
            userId: mentor.id_user
          });
          
          setForm({
            name: mentorName,
            email: mentorEmail,
            phone: mentorPhone || "",
            divisi_name: mentorDivisi || "",
            jabatan: mentorJabatan || "",
            status: mentorStatus,
          });
        } else {
          setError(`Data mentor dengan ID ${mentorId} tidak ditemukan.`);
        }
        
      } catch (err) {
        console.error("Error loading data:", err);
        setError(`Gagal memuat data: ${err.message || "Terjadi kesalahan"}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "divisi_name") {
      setForm({
        ...form,
        divisi_name: value,
      });
    } else if (name === "phone") {
      const angkaOnly = value.replace(/[^0-9]/g, "").slice(0, 15);
      setForm({
        ...form,
        phone: angkaOnly,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleToggleStatus = () => {
    setForm({
      ...form,
      status: form.status === "aktif" ? "non_aktif" : "aktif",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    if (!form.name || form.name.trim() === "") {
      setError("Nama lengkap harus diisi");
      setSaving(false);
      return;
    }

    if (!form.email || form.email.trim() === "") {
      setError("Email harus diisi");
      setSaving(false);
      return;
    }

    try {
      // 🔥 PERBAIKAN: Gunakan id_user, bukan id_mentor
      if (!originalUserId) {
        setError("ID User tidak ditemukan");
        setSaving(false);
        return;
      }

      // Data yang dikirim ke API - sesuai dengan yang diharapkan backend
      const updateData = {
        email: form.email.trim(),
        name: form.name.trim(),
        phone: form.phone || "",
        divisi: form.divisi_name || null,
        jabatan: form.jabatan || null,
        status: form.status === "aktif",
      };
      
      console.log("📤 Sending update data to API with user_id:", originalUserId);
      console.log("Update data:", JSON.stringify(updateData, null, 2));
      
      // 🔥 PERBAIKAN: Update menggunakan id_user (bukan id_mentor)
      // Karena backend mencari user dengan where('id_user', $id)
      const response = await api.updateMentor(originalUserId, updateData);
      console.log("📥 API response:", response);
      
      if (response && response.success) {
        // 🔥 LOG ACTIVITY - UPDATE MENTOR
        logActivity("update", "mentor", form.name);
        
        setSuccessData({
          name: form.name,
          email: form.email,
          role: "Mentor",
          divisi: form.divisi_name || "-",
          jabatan: form.jabatan || "-",
          phone: form.phone || "-",
          status: form.status === "aktif" ? "Aktif" : "Nonaktif"
        });
        setSuccessMessage(response.message || "Perubahan data mentor berhasil disimpan!");
        setShowSuccessModal(true);
      } else {
        setError(response?.message || "Gagal menyimpan perubahan");
      }
      
    } catch (err) {
      console.error("Error saving data:", err);
      let errorMessage = err.message || "Gagal menyimpan perubahan. Silakan coba lagi.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        errorMessage = errors.join("\n");
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/admin/users");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Memuat data mentor...</p>
        </div>
      </div>
    );
  }

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
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-xl shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                Edit Data Mentor
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                Perbarui informasi lengkap akun mentor
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="relative h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600"></div>
          
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 whitespace-pre-wrap flex-1">{error}</p>
            </div>
          )}

          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* KOLOM KIRI - Informasi Akun */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Mail size={14} className="text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700">Informasi Akun</h3>
                  <span className="text-[10px] text-red-400 ml-auto">*Wajib</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="email"
                        type="email"
                        placeholder="mentor@perusahaan.com"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value="********"
                        disabled
                        className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Shield size={10} />
                      Password tidak dapat diubah di sini.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-slate-500" />
                        <span className="text-sm font-semibold text-slate-700">Status Akun</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleStatus}
                        className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                          form.status === "aktif" ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 ${
                            form.status === "aktif" ? "translate-x-6" : "translate-x-0"
                          }`}
                        ></div>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {form.status === "aktif" ? "Akun aktif dan dapat digunakan" : "Akun nonaktif, tidak dapat digunakan"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Role
                    </label>
                    <div className="relative">
                      <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value="Mentor"
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-600 cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN - Identitas */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <User size={14} className="text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700">Identitas Diri</h3>
                  <span className="text-[10px] text-red-400 ml-auto">*Wajib</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Nomor Telepon / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="phone"
                        type="tel"
                        placeholder="81234567890"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-slate-50/50"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Phone size={10} />
                      Hanya angka, 10-15 digit, tanpa 0 di depan
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Jabatan / Posisi
                    </label>
                    <div className="relative">
                      <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="jabatan"
                        type="text"
                        placeholder="Contoh: Senior Mentor, Tech Lead"
                        value={form.jabatan}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INFORMASI DIVISI */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Building2 size={14} className="text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-700">Informasi Divisi</h3>
              </div>

              <div className="max-w-md">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Pilih Divisi Mentor
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    name="divisi_name"
                    value={form.divisi_name || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 bg-white appearance-none"
                  >
                    <option value="">-- Pilih Divisi --</option>
                    {divisiList.map((divisiItem) => (
                      <option 
                        key={divisiItem.id_divisi || divisiItem.id} 
                        value={divisiItem.nama_divisi || divisiItem.nama}
                      >
                        {divisiItem.nama_divisi || divisiItem.nama}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {form.divisi_name && (
                  <p className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
                    <Building2 size={10} />
                    Divisi saat ini: {form.divisi_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 lg:px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">
            <button
              onClick={() => navigate("/admin/users")}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200"
              disabled={saving}
            >
              Batal
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-white/50 rounded-lg">
              <Zap size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-800">Tips Pengisian Data</p>
              <p className="text-xs text-purple-700 mt-0.5">
                Pastikan memilih divisi yang sesuai untuk mentor. Data yang sudah disimpan dapat diedit kembali jika diperlukan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && successData && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleModalClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600"></div>
                
                <div className="relative pt-8 pb-4 px-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl shadow-xl">
                    <CheckCircle size={42} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-slate-800">Update Berhasil!</h3>
                    <p className="text-sm text-slate-500 mt-1">{successMessage}</p>
                  </div>
                </div>
                
                <div className="mx-6 p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                          <User size={20} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{successData.name}</h4>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <BadgeCheck size={12} className="text-emerald-500" />
                          <span className="text-[10px] text-slate-500">{successData.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg ${
                      successData.status === "Aktif" ? "bg-emerald-100" : "bg-red-100"
                    }`}>
                      <p className={`text-[10px] font-semibold ${
                        successData.status === "Aktif" ? "text-emerald-600" : "text-red-600"
                      }`}>{successData.status}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 col-span-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail size={13} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] text-slate-400">Email</p>
                        <p className="text-[11px] font-medium text-slate-700 truncate">{successData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                      <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 size={13} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] text-slate-400">Divisi</p>
                        <p className="text-[11px] font-medium text-slate-700 truncate">{successData.divisi}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                      <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Briefcase size={13} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] text-slate-400">Jabatan</p>
                        <p className="text-[11px] font-medium text-slate-700 truncate">{successData.jabatan}</p>
                      </div>
                    </div>

                    {successData.phone && successData.phone !== "-" && (
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 col-span-2">
                        <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone size={13} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] text-slate-400">No. Telepon</p>
                          <p className="text-[11px] font-medium text-slate-700 truncate">{successData.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 pt-4">
                  <button
                    onClick={handleModalClose}
                    className="group relative w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <Rocket size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      Kembali ke Daftar Mentor
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EditMentor;