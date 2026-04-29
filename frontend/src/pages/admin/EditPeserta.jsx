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
  GraduationCap,
  Briefcase,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Users,
  BookOpen,
  School,
  CheckCircle,
  Loader2,
  BadgeCheck,
  CalendarDays,
  Clock,
  Rocket,
  Calendar,
  CalendarRange,
  AlertTriangle,
  Edit3
} from "lucide-react";

function EditPeserta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const existingUserData = location.state?.userData;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [divisiList, setDivisiList] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successData, setSuccessData] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    divisi: "",
    id_divisi: "",
    mentor_id: "",
    mentor_name: "",
    kampus: "",
    prodi: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    status: "aktif",
  });

  // Fungsi untuk memformat tanggal ke YYYY-MM-DD
  const formatDateToYMD = (dateString) => {
    if (!dateString) return "";
    
    // Jika sudah dalam format YYYY-MM-DD
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
      return dateString.split('T')[0];
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

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

        // Load mentors list
        const mentorResult = await api.getMentors();
        let mentors = [];
        if (mentorResult && mentorResult.success && Array.isArray(mentorResult.data)) {
          mentors = mentorResult.data;
        } else if (Array.isArray(mentorResult)) {
          mentors = mentorResult;
        }
        
        const formattedMentors = mentors.map(mentor => ({
          id: mentor.id_mentor || mentor.id,
          name: mentor.user?.nama || mentor.nama || mentor.name || "Mentor",
          id_divisi: mentor.id_divisi || (mentor.divisi?.id_divisi) || null,
          divisi_name: typeof mentor.divisi === 'string' ? mentor.divisi : mentor.divisi?.nama_divisi,
        }));
        setAllMentors(formattedMentors);
        console.log("Mentors loaded:", formattedMentors);

        const pesertaId = parseInt(id);
        
        const pesertaResult = await api.getPeserta();
        
        let pesertaList = [];
        if (pesertaResult && pesertaResult.success && Array.isArray(pesertaResult.data)) {
          pesertaList = pesertaResult.data;
        } else if (Array.isArray(pesertaResult)) {
          pesertaList = pesertaResult;
        }
        
        console.log("All peserta:", pesertaList);
        
        const peserta = pesertaList.find(p => (p.id_peserta || p.id) == pesertaId);
        
        if (peserta) {
          console.log("Found peserta RAW data:", JSON.stringify(peserta, null, 2));
          const userData = peserta.user || {};
          
          let storedMulai = "";
          let storedSelesai = "";
          
          // Cek berbagai kemungkinan nama field untuk tanggal mulai
          if (peserta.tanggal_mulai) {
            storedMulai = formatDateToYMD(peserta.tanggal_mulai);
          } else if (peserta.start_date) {
            storedMulai = formatDateToYMD(peserta.start_date);
          } else if (peserta.tanggal_magang_mulai) {
            storedMulai = formatDateToYMD(peserta.tanggal_magang_mulai);
          }
          
          // Cek berbagai kemungkinan nama field untuk tanggal selesai
          if (peserta.tanggal_selesai && peserta.tanggal_selesai !== null && peserta.tanggal_selesai !== "") {
            storedSelesai = formatDateToYMD(peserta.tanggal_selesai);
          } else if (peserta.end_date && peserta.end_date !== null && peserta.end_date !== "") {
            storedSelesai = formatDateToYMD(peserta.end_date);
          } else if (peserta.tanggal_magang_selesai && peserta.tanggal_magang_selesai !== null && peserta.tanggal_magang_selesai !== "") {
            storedSelesai = formatDateToYMD(peserta.tanggal_magang_selesai);
          }
          
          let userStatus = "non_aktif";
          if (userData.status_akun === "aktif" || userData.status_akun === "active") {
            userStatus = "aktif";
          } else if (userData.status_akun === "non_aktif" || userData.status_akun === "inactive") {
            userStatus = "non_aktif";
          } else if (peserta.status_akun === "aktif") {
            userStatus = "aktif";
          } else if (peserta.status === "aktif") {
            userStatus = "aktif";
          }
          
          console.log("Status from API:", userStatus);
          console.log("Tanggal mulai (raw):", peserta.tanggal_mulai, "formatted:", storedMulai);
          console.log("Tanggal selesai (raw):", peserta.tanggal_selesai, "formatted:", storedSelesai);
          
          setForm({
            name: userData.nama || userData.name || peserta.nama || "",
            email: userData.email || peserta.email || "",
            phone: userData.no_telepon || peserta.no_telepon || "",
            divisi: peserta.divisi?.nama_divisi || (typeof peserta.divisi === 'string' ? peserta.divisi : "") || "",
            id_divisi: peserta.id_divisi || (peserta.divisi?.id_divisi) || "",
            mentor_id: peserta.id_mentor || "",
            mentor_name: peserta.mentor?.nama || (typeof peserta.mentor === 'string' ? peserta.mentor : "") || "",
            kampus: peserta.asal_kampus || "",
            prodi: peserta.prodi || "",
            tanggal_mulai: storedMulai,
            tanggal_selesai: storedSelesai,
            status: userStatus,
          });
        } else if (existingUserData && existingUserData.id == pesertaId) {
          console.log("Using existingUserData:", existingUserData);
          setForm({
            name: existingUserData.name || existingUserData.nama || "",
            email: existingUserData.email || "",
            phone: existingUserData.no_telepon || existingUserData.phone || "",
            divisi: existingUserData.divisi || "",
            id_divisi: existingUserData.divisi_id || existingUserData.id_divisi || "",
            mentor_id: existingUserData.mentor_id || existingUserData.id_mentor || "",
            mentor_name: existingUserData.mentor || "",
            kampus: existingUserData.asal_kampus || existingUserData.kampus || "",
            prodi: existingUserData.prodi || "",
            tanggal_mulai: existingUserData.tanggal_mulai || "",
            tanggal_selesai: existingUserData.tanggal_selesai || "",
            status: existingUserData.status === "aktif" ? "aktif" : "non_aktif",
          });
        } else {
          setError(`Data peserta dengan ID ${pesertaId} tidak ditemukan`);
        }
        
      } catch (err) {
        console.error("Error loading data:", err);
        setError(`Gagal memuat data: ${err.message || "Terjadi kesalahan"}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, existingUserData]);

  const getFilteredMentors = () => {
    if (!form.id_divisi && !form.divisi) return [];
    
    const selectedDivisiId = parseInt(form.id_divisi);
    
    return allMentors.filter(mentor => {
      if (selectedDivisiId && mentor.id_divisi && parseInt(mentor.id_divisi) === selectedDivisiId) {
        return true;
      }
      return false;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "divisi") {
      const selectedDivisi = divisiList.find((d) => (d.nama_divisi || d.nama) === value);
      setForm({
        ...form,
        divisi: value,
        id_divisi: selectedDivisi ? String(selectedDivisi.id_divisi || selectedDivisi.id) : "",
        mentor_id: "",
        mentor_name: "",
      });
    } else if (name === "mentor_id") {
      const selectedMentor = allMentors.find((m) => String(m.id) === String(value));
      setForm({
        ...form,
        mentor_id: value,
        mentor_name: selectedMentor ? selectedMentor.name : "",
      });
    } else if (name === "phone") {
      const angkaOnly = value.replace(/[^0-9]/g, "").slice(0, 15);
      setForm({
        ...form,
        phone: angkaOnly,
      });
    } else if (name === "tanggal_mulai") {
      let newSelesai = form.tanggal_selesai;
      if (form.tanggal_selesai && value && new Date(form.tanggal_selesai) < new Date(value)) {
        newSelesai = "";
      }
      setForm({
        ...form,
        tanggal_mulai: value,
        tanggal_selesai: newSelesai,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const isTanggalValid = () => {
    if (!form.tanggal_mulai) return false;
    if (!form.tanggal_selesai) return true;
    const mulai = new Date(form.tanggal_mulai);
    const selesai = new Date(form.tanggal_selesai);
    return selesai >= mulai;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    // Validasi
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

    if (!form.tanggal_mulai) {
      setError("Tanggal mulai magang harus diisi");
      setSaving(false);
      return;
    }

    try {
      const pesertaId = parseInt(id);
      if (isNaN(pesertaId)) {
        setError("ID Peserta tidak valid");
        setSaving(false);
        return;
      }

      // Data yang dikirim ke API
      const updateData = {
        nama: form.name.trim(),
        email: form.email.trim(),
        no_telepon: form.phone || "",
        status_akun: form.status === "aktif" ? "aktif" : "non_aktif",
        asal_kampus: form.kampus || "",
        prodi: form.prodi || "",
        tanggal_mulai: form.tanggal_mulai,
      };
      
      // Kirim tanggal_selesai jika ada, jika kosong kirim null
      if (form.tanggal_selesai && form.tanggal_selesai !== "") {
        updateData.tanggal_selesai = form.tanggal_selesai;
      } else {
        updateData.tanggal_selesai = null;
      }
      
      // Kirim id_divisi jika ada
      if (form.id_divisi && form.id_divisi !== "") {
        const idDivisiNum = parseInt(form.id_divisi);
        if (!isNaN(idDivisiNum) && idDivisiNum > 0) {
          updateData.id_divisi = idDivisiNum;
        }
      }
      
      // Kirim id_mentor jika ada
      if (form.mentor_id && form.mentor_id !== "") {
        const idMentorNum = parseInt(form.mentor_id);
        if (!isNaN(idMentorNum) && idMentorNum > 0) {
          updateData.id_mentor = idMentorNum;
        }
      }
      
      console.log("📤 Data yang akan dikirim ke API:", JSON.stringify(updateData, null, 2));
      
      const response = await api.updatePeserta(pesertaId, updateData);
      
      console.log("📥 API Response:", response);
      
      if (response && response.success) {
        // 🔥 LOG ACTIVITY - UPDATE PESERTA
        logActivity("update", "peserta", form.name);
        
        setSuccessData({
          name: form.name,
          email: form.email,
          role: "Peserta",
          divisi: form.divisi || "-",
          mentor: form.mentor_name || "-",
          kampus: form.kampus || "-",
          prodi: form.prodi || "-",
          phone: form.phone || "-",
          tanggal_mulai: form.tanggal_mulai ? new Date(form.tanggal_mulai).toLocaleDateString('id-ID') : "-",
          tanggal_selesai: form.tanggal_selesai ? new Date(form.tanggal_selesai).toLocaleDateString('id-ID') : "Sedang Berlangsung",
          status: form.status === "aktif" ? "Aktif" : "Nonaktif"
        });
        setSuccessMessage(response.message || "Perubahan data peserta berhasil disimpan!");
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

  // 🔥 PERBAIKAN: Hanya 1 fungsi untuk menutup modal dan navigasi
  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Navigasi ke halaman users dengan state message
    navigate("/admin/users", { state: { message: successMessage } });
  };

  const filteredMentors = getFilteredMentors();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Memuat data peserta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 mb-3 transition text-sm group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Data Pengguna
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-lg">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-emerald-800 to-teal-800 bg-clip-text text-transparent">
                Edit Data Peserta
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Perbarui informasi lengkap akun peserta magang
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="relative h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
          
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 whitespace-pre-wrap flex-1">{error}</p>
            </div>
          )}

          <div className="p-6 lg:p-8">
            {/* Grid 2 Kolom Utama */}
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
                        placeholder="peserta@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-slate-50/50"
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
                        onClick={() =>
                          setForm({
                            ...form,
                            status: form.status === "aktif" ? "non_aktif" : "aktif",
                          })
                        }
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
                        value="Peserta Magang"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-slate-50/50"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-slate-50/50"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Phone size={10} />
                      Hanya angka, 10-15 digit, tanpa 0 di depan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Informasi Akademik & Magang */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 pt-6 border-t border-slate-100">
              
              {/* Informasi Akademik */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <GraduationCap size={14} className="text-purple-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700">Informasi Akademik</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Asal Kampus / Universitas
                    </label>
                    <div className="relative">
                      <School size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="kampus"
                        type="text"
                        placeholder="Nama Universitas"
                        value={form.kampus}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Program Studi
                    </label>
                    <div className="relative">
                      <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="prodi"
                        type="text"
                        placeholder="Program Studi"
                        value={form.prodi}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Magang & Mentor */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <Briefcase size={14} className="text-amber-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700">Penempatan Magang</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Divisi Penempatan
                    </label>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        name="divisi"
                        value={form.divisi || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white appearance-none"
                      >
                        <option value="">Pilih Divisi</option>
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
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Mentor Pembimbing
                    </label>
                    <div className="relative">
                      <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        name="mentor_id"
                        value={form.mentor_id || ""}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white appearance-none"
                        disabled={!form.id_divisi && !form.divisi}
                      >
                        <option value="">
                          {!form.id_divisi && !form.divisi 
                            ? "✗ Pilih divisi terlebih dahulu" 
                            : filteredMentors.length === 0 
                              ? "✗ Tidak ada mentor di divisi ini" 
                              : "✓ Pilih Mentor"}
                        </option>
                        {filteredMentors.map((mentor) => (
                          <option key={mentor.id} value={mentor.id}>
                            {mentor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {form.mentor_name && !form.mentor_id && (
                      <p className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Mentor sebelumnya: {form.mentor_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Periode Magang - WAJIB */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
                <div className="p-1.5 bg-cyan-100 rounded-lg">
                  <CalendarRange size={14} className="text-cyan-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-700">Periode Magang</h3>
                <span className="text-[10px] text-red-500 ml-auto">*Wajib Diisi</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <Calendar size={12} className="inline mr-1" />
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="tanggal_mulai"
                      type="date"
                      value={form.tanggal_mulai}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <Calendar size={12} className="inline mr-1" />
                    Tanggal Selesai
                  </label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="tanggal_selesai"
                      type="date"
                      value={form.tanggal_selesai}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all bg-slate-50/50"
                      placeholder="Kosongkan jika masih berlangsung"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">*Kosongkan jika magang masih berlangsung</p>
                </div>
              </div>

              {/* Informasi durasi magang */}
              {form.tanggal_mulai && (
                <div className={`mt-4 p-4 rounded-xl border ${form.tanggal_selesai && isTanggalValid() ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center gap-3">
                    {form.tanggal_selesai && isTanggalValid() ? (
                      <>
                        <Clock size={18} className="text-emerald-600" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Durasi Magang: {Math.ceil((new Date(form.tanggal_selesai) - new Date(form.tanggal_mulai)) / (1000 * 60 * 60 * 24))} Hari
                          </p>
                          <p className="text-xs text-emerald-600 mt-0.5">
                            {new Date(form.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} → {new Date(form.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </>
                    ) : form.tanggal_selesai && !isTanggalValid() ? (
                      <>
                        <AlertTriangle size={18} className="text-red-600" />
                        <div>
                          <p className="text-sm font-semibold text-red-800">Error: Tanggal selesai harus setelah tanggal mulai</p>
                          <p className="text-xs text-red-600 mt-0.5">Silakan perbaiki tanggal selesai</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={18} className="text-blue-600" />
                        <div>
                          <p className="text-sm font-semibold text-blue-800">Magang Sedang Berlangsung</p>
                          <p className="text-xs text-blue-600 mt-0.5">
                            Dimulai pada {new Date(form.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
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
              disabled={saving || (form.tanggal_selesai && !isTanggalValid())}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
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
        <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-white/50 rounded-lg">
              <Zap size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Tips Pengisian Data</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Kosongkan tanggal selesai jika magang masih berlangsung. Data yang sudah disimpan dapat diedit kembali jika diperlukan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 SUCCESS MODAL - HANYA SATU MODAL */}
      {showSuccessModal && successData && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleModalClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-lg pointer-events-auto">
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
                
                <div className="relative pt-8 pb-4 px-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-xl">
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
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
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
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                      <Mail size={12} className="text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-slate-400">Email</p>
                        <p className="text-[11px] font-medium text-slate-700 truncate">{successData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                      <Phone size={12} className="text-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-slate-400">No. Telepon</p>
                        <p className="text-[11px] font-medium text-slate-700 truncate">{successData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                      <School size={12} className="text-purple-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-slate-400">Kampus</p>
                        <p className="text-[11px] font-medium text-slate-700 truncate">{successData.kampus}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                      <BookOpen size={12} className="text-amber-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-slate-400">Program Studi</p>
                        <p className="text-[11px] font-medium text-slate-700 truncate">{successData.prodi}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                      <Building2 size={12} className="text-indigo-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-slate-400">Divisi</p>
                        <p className="text-[11px] font-medium text-slate-700 truncate">{successData.divisi}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                      <Users size={12} className="text-rose-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-slate-400">Mentor</p>
                        <p className="text-[11px] font-medium text-slate-700 truncate">{successData.mentor}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                    <div className="flex items-center gap-2">
                      <CalendarRange size={14} className="text-cyan-600" />
                      <div>
                        <p className="text-[10px] text-cyan-600 font-medium">Periode Magang</p>
                        <p className="text-xs font-semibold text-cyan-800">
                          {successData.tanggal_mulai} → {successData.tanggal_selesai}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 pt-4">
                  <button
                    onClick={handleModalClose}
                    className="group relative w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <Rocket size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      Kembali ke Daftar Peserta
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

export default EditPeserta;