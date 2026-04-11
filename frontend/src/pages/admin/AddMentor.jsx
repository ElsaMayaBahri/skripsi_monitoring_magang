import { useState } from "react"
import { useNavigate } from "react-router-dom"

function AddMentor() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    divisi: "",
    jabatan: "",
    status: true,
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleToggle = () => {
    setForm({ ...form, status: !form.status })
  }

  const handleSubmit = () => {
    const users = JSON.parse(localStorage.getItem("users")) || []

    const newUser = {
      ...form,
      role: "mentor",
      initials: form.name
        ? form.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "M",
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    alert("Mentor berhasil ditambahkan")
    navigate("/admin/users")
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-8">

      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-sm p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold">
            Tambah Mentor Baru
          </h2>
          <p className="text-sm text-gray-500">
            Lengkapi formulir di bawah untuk mendaftarkan mentor baru.
          </p>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-6">

          {/* LEFT */}
          <div className="space-y-5">

            <input
              name="email"
              placeholder="contoh@perusahaan.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg text-sm"
            />

            <input
              name="password"
              type="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg text-sm"
            />

            <select
              name="divisi"
              value={form.divisi}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg text-sm"
            >
              <option value="">Pilih Divisi</option>
              <option>Engineering</option>
              <option>Product Design</option>
              <option>Marketing</option>
            </select>

            {/* STATUS */}
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
              <span className="text-sm text-gray-600">
                Status Akun
              </span>

              <button
                onClick={handleToggle}
                className={`w-10 h-5 flex items-center rounded-full p-1 ${
                  form.status ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full"></div>
              </button>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-5">

            <input
              name="name"
              placeholder="Masukkan nama lengkap"
              value={form.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg text-sm"
            />

            <input
              name="phone"
              placeholder="+62 8123456789"
              value={form.phone}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg text-sm"
            />

            <input
              name="jabatan"
              placeholder="Isi jabatan"
              value={form.jabatan}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg text-sm"
            />

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
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Simpan Mentor
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddMentor