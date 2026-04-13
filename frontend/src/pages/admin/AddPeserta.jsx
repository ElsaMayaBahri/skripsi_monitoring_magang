import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { addUser } from "../../utils/storage"

function AddPeserta() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    kampus: "",
    prodi: "",
    divisi: "",
    mentor: "",
    start: "",
    end: "",
    status: true,
    role: "peserta",
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = () => {

    const newUser = {
      ...form,
      role: "peserta",
      status: form.status ? "aktif" : "nonaktif", // 🔥 konsisten
      initials: form.name
        ? form.name.substring(0, 2).toUpperCase()
        : "NA",
    }

    addUser(newUser) // 🔥 pakai helper (bukan localStorage langsung)

    navigate("/admin/users")
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

      <div className="grid grid-cols-2 gap-8">

        {/* LEFT */}
        <div className="space-y-6">

          {/* AKUN */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Informasi Akun
            </h3>

            <div className="space-y-3">
              <input
                name="email"
                onChange={handleChange}
                type="email"
                placeholder="contoh@perusahaan.com"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />

              <input
                type="password"
                placeholder="***************"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />

              <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                <span className="text-sm text-gray-600">
                  Status Akun
                </span>

                <div
                  onClick={() =>
                    setForm({ ...form, status: !form.status })
                  }
                  className={`w-10 h-5 rounded-full flex items-center p-1 cursor-pointer ${
                    form.status ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* MAGANG */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Informasi Magang
            </h3>

            <div className="space-y-3">

              <select
                name="divisi"
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              >
                <option value="">Pilih Divisi</option>
                <option>Engineering</option>
                <option>Product Design</option>
                <option>Marketing</option>
              </select>

              <select
                name="mentor"
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              >
                <option value="">Pilih Mentor</option>
                <option>Arsyad</option>
                <option>Rina</option>
                <option>Fahmi</option>
              </select>

              <div className="flex gap-3">
                <input
                  name="start"
                  onChange={handleChange}
                  type="date"
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                />
                <input
                  name="end"
                  onChange={handleChange}
                  type="date"
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                />
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <div>
            <h3 className="text-sm font-semibold mb-3">
              Identitas Peserta
            </h3>

            <div className="space-y-3">
              <input
                name="name"
                onChange={handleChange}
                type="text"
                placeholder="Masukkan nama lengkap"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />

              <input
                name="phone"
                onChange={handleChange}
                type="text"
                placeholder="+628123456789"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">
              Informasi Akademik
            </h3>

            <div className="space-y-3">
              <input
                name="kampus"
                onChange={handleChange}
                type="text"
                placeholder="Nama Universitas"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />

              <input
                name="prodi"
                onChange={handleChange}
                type="text"
                placeholder="Program Studi"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </div>
          </div>

        </div>

      </div>

      {/* BUTTON */}
      <div className="flex justify-end gap-3 mt-10">
        <button
          onClick={() => navigate("/admin/users")}
          className="px-4 py-2 text-sm text-gray-600"
        >
          Batal
        </button>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Simpan Peserta
        </button>
      </div>

    </div>
  )
}

export default AddPeserta