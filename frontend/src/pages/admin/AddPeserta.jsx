import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { api } from "../../utils/api"

function AddPeserta() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    no_telepon: "",
    asal_kampus: "",
    prodi: "",
    id_divisi: "",
    id_mentor: "",
  })

  const [divisiList, setDivisiList] = useState([])
  const [mentorList, setMentorList] = useState([])

  // Fetch divisi dan mentor list
  useEffect(() => {
    fetchDropdownData()
  }, [])

  const fetchDropdownData = async () => {
    try {
      // Fetch divisi list
      const divisiResponse = await api.getDivisiList()
      if (divisiResponse.success) {
        setDivisiList(divisiResponse.data)
      }

      // Fetch mentor list
      const mentorResponse = await api.getMentorList()
      if (mentorResponse.success) {
        setMentorList(mentorResponse.data)
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error)
    }
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSave = async () => {
    // Validasi required fields
    if (!form.nama || !form.email || !form.password) {
      setError("Nama, Email, dan Password wajib diisi")
      return
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError("Format email tidak valid")
      return
    }

    // Validasi password length
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Siapkan data sesuai yang diharapkan backend
      const pesertaData = {
        nama: form.nama,
        email: form.email,
        password: form.password,
        no_telepon: form.no_telepon || null,
        asal_kampus: form.asal_kampus || null,
        prodi: form.prodi || null,
        id_divisi: form.id_divisi || null,
        id_mentor: form.id_mentor || null,
      }

      console.log("Sending data:", pesertaData)
      
      const response = await api.addPeserta(pesertaData)
      
      if (response.success) {
        // Success - redirect ke halaman users
        navigate("/admin/users", { 
          state: { message: "Peserta berhasil ditambahkan" } 
        })
      } else {
        setError(response.message || "Gagal menambahkan peserta")
      }
    } catch (error) {
      console.error("Error adding peserta:", error)
      
      // Handle validation errors from backend
      if (error.message.includes("validation") || error.errors) {
        setError("Validasi gagal: " + error.message)
      } else {
        setError(error.message || "Terjadi kesalahan saat menambahkan peserta")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold">
          Tambah Peserta Baru
        </h2>
        <p className="text-sm text-gray-500">
          Lengkapi formulir di bawah untuk mendaftarkan peserta magang.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* INFORMASI AKUN */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Informasi Akun <span className="text-red-500">*</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  onChange={handleChange}
                  type="email"
                  value={form.email}
                  placeholder="contoh@email.com"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  name="password"
                  onChange={handleChange}
                  type="password"
                  value={form.password}
                  placeholder="Minimal 6 karakter"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* INFORMASI MAGANG */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Informasi Magang
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Divisi
                </label>
                <select
                  name="id_divisi"
                  onChange={handleChange}
                  value={form.id_divisi}
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Divisi</option>
                  {divisiList.map((divisi) => (
                    <option key={divisi.id_divisi} value={divisi.id_divisi}>
                      {divisi.nama_divisi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Mentor
                </label>
                <select
                  name="id_mentor"
                  onChange={handleChange}
                  value={form.id_mentor}
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Mentor</option>
                  {mentorList.map((mentor) => (
                    <option key={mentor.id_mentor} value={mentor.id_mentor}>
                      {mentor.user?.nama || mentor.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* IDENTITAS PESERTA */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Identitas Peserta <span className="text-red-500">*</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  name="nama"
                  onChange={handleChange}
                  type="text"
                  value={form.nama}
                  placeholder="Masukkan nama lengkap"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Nomor Telepon
                </label>
                <input
                  name="no_telepon"
                  onChange={handleChange}
                  type="text"
                  value={form.no_telepon}
                  placeholder="+628123456789"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* INFORMASI AKADEMIK */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Informasi Akademik
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Asal Kampus / Universitas
                </label>
                <input
                  name="asal_kampus"
                  onChange={handleChange}
                  type="text"
                  value={form.asal_kampus}
                  placeholder="Nama Universitas"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Program Studi
                </label>
                <input
                  name="prodi"
                  onChange={handleChange}
                  type="text"
                  value={form.prodi}
                  placeholder="Program Studi"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3 mt-10 pt-6 border-t">
        <button
          onClick={() => navigate("/admin/users")}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          disabled={loading}
        >
          Batal
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? "Menyimpan..." : "Simpan Peserta"}
        </button>
      </div>
    </div>
  )
}

export default AddPeserta