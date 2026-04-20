import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

function AddMentor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [divisiLoading, setDivisiLoading] = useState(true);
  const [divisiList, setDivisiList] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
    phone: "",
    id_divisi: "",
    jabatan: "",
    status: true,
  });

  useEffect(() => {
    loadDivisiList();
  }, []);

  const loadDivisiList = async () => {
    setDivisiLoading(true);
    try {
      const response = await api.getDivisi();
      console.log("Divisi API response:", response);

      if (response && response.success && Array.isArray(response.data)) {
        setDivisiList(response.data);
      } else if (Array.isArray(response)) {
        setDivisiList(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setDivisiList(response.data);
      } else {
        console.warn("Struktur response tidak dikenali:", response);
        setDivisiList([]);
      }
    } catch (err) {
      console.error("Error loading divisi:", err);
      setError("Gagal memuat data divisi");
      setDivisiList([]);
    } finally {
      setDivisiLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleToggle = () => {
    setForm({ ...form, status: !form.status });
  };

  const validateForm = () => {
    if (!form.email) {
      setError("Email harus diisi");
      return false;
    }
    if (!form.email.includes("@")) {
      setError("Email tidak valid");
      return false;
    }
    if (!form.password) {
      setError("Password harus diisi");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return false;
    }
    if (form.password !== form.password_confirmation) {
      setError("Konfirmasi password tidak cocok");
      return false;
    }
    if (!form.name) {
      setError("Nama lengkap harus diisi");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const mentorData = {
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone || null,
        id_divisi: form.id_divisi || null,
        jabatan: form.jabatan || null,
        status: form.status,
      };
      
      console.log("Mentor Data to send:", mentorData);
      
      // Coba beberapa kemungkinan method yang tersedia
      let response;
      if (typeof api.addMentor === 'function') {
        response = await api.addMentor(mentorData);
      } else if (typeof api.createMentor === 'function') {
        response = await api.createMentor(mentorData);
      } else if (typeof api.registerMentor === 'function') {
        response = await api.registerMentor(mentorData);
      } else if (typeof api.postMentor === 'function') {
        response = await api.postMentor(mentorData);
      } else {
        // Jika tidak ada method yang tersedia, coba gunakan method umum
        response = await api.post('/mentors', mentorData);
      }
      
      if (response && response.success) {
        alert(response.message || "Mentor berhasil ditambahkan");
        navigate("/admin/users", { 
          state: { message: "Mentor berhasil ditambahkan" } 
        });
      } else {
        setError(response?.message || "Gagal menambahkan mentor");
      }
    } catch (err) {
      console.error("Error adding mentor:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-sm p-8">
        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Tambah Mentor Baru</h2>
          <p className="text-sm text-gray-500">
            Lengkapi formulir di bawah untuk mendaftarkan mentor baru.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="contoh@perusahaan.com"
                value={form.email}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <input
                name="password_confirmation"
                type="password"
                placeholder="Konfirmasi password"
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Divisi
              </label>
              <select
                name="id_divisi"
                value={form.id_divisi}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={loading || divisiLoading}
              >
                <option value="">Pilih Divisi</option>
                {divisiLoading ? (
                  <option value="" disabled>Memuat divisi...</option>
                ) : divisiList.length === 0 ? (
                  <option value="" disabled>Tidak ada divisi tersedia</option>
                ) : (
                  divisiList.map((divisi) => (
                    <option 
                      key={divisi.id_divisi || divisi.id} 
                      value={divisi.id_divisi || divisi.id}
                    >
                      {divisi.nama_divisi || divisi.nama}
                    </option>
                  ))
                )}
              </select>
              {!divisiLoading && divisiList.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {divisiList.length} divisi tersedia
                </p>
              )}
            </div>

            {/* STATUS TOGGLE */}
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
              <span className="text-sm text-gray-600">Status Akun</span>
              <button
                type="button"
                onClick={handleToggle}
                disabled={loading}
                className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                  form.status ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full transition-transform ${
                    form.status ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={form.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="+62 8123456789"
                value={form.phone}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan
              </label>
              <input
                name="jabatan"
                type="text"
                placeholder="Isi jabatan"
                value={form.jabatan}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-10 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              "Simpan Mentor"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMentor;