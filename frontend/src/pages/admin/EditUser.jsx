import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { getUsers, updateUser } from "../../utils/storage"

function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    divisi: "",
    mentor: "",
    kampus: "",
    prodi: "",
    status: "aktif",
  })

  // 🔥 LOAD DATA DARI STORAGE
  useEffect(() => {
    const users = getUsers()

    if (users[id]) {
      setForm({
        ...users[id],
        phone: users[id].phone || "",
        kampus: users[id].kampus || "",
        prodi: users[id].prodi || "",
        divisi: users[id].divisi || "",
        mentor: users[id].mentor || "",
        status: users[id].status || "aktif",
      })
    }
  }, [id])

  // 🔥 HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  // 🔥 SAVE FIX
  const handleSave = () => {
    updateUser(id, form)
    alert("Perubahan berhasil disimpan")
    navigate("/admin/users")
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-8">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Edit Data User</h1>
        <p className="text-sm text-gray-500">
          Perbarui informasi akun pengguna.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* INFORMASI AKUN */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">Informasi Akun</h2>

          <div className="grid grid-cols-2 gap-4">

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            {/* STATUS */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Status</span>
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    status:
                      form.status === "aktif"
                        ? "nonaktif"
                        : "aktif",
                  })
                }
                className={`w-10 h-5 flex items-center rounded-full p-1 ${
                  form.status === "aktif"
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full"></div>
              </button>
            </div>

            <input
              value={form.role || "peserta"}
              disabled
              className="border p-2 rounded bg-gray-100"
            />

            <input
              type="password"
              value="********"
              disabled
              className="border p-2 rounded bg-gray-100"
            />

          </div>
        </div>

        {/* IDENTITAS */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">Identitas</h2>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded w-full mb-3"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* AKADEMIK */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">Informasi Akademik</h2>

          <input
            name="kampus"
            value={form.kampus}
            onChange={handleChange}
            className="border p-2 rounded w-full mb-3"
          />

          <input
            name="prodi"
            value={form.prodi}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* MAGANG */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">Informasi Magang</h2>

          <select
            name="divisi"
            value={form.divisi || ""}
            onChange={handleChange}
            className="border p-2 rounded w-full mb-3"
          >
            <option value="">Pilih Divisi</option>
            <option value="Engineering">Engineering</option>
            <option value="Product Design">Product Design</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select
            name="mentor"
            value={form.mentor || ""}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Pilih Mentor</option>
            <option value="Arsyad">Arsyad</option>
            <option value="Rina">Rina</option>
            <option value="Fahmi">Fahmi</option>
          </select>

        </div>

      </div>

      {/* BUTTON */}
      <div className="flex justify-end mt-8 gap-3">
        <button
          onClick={() => navigate("/admin/users")}
          className="px-4 py-2 text-gray-500"
        >
          Batal
        </button>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Simpan Perubahan
        </button>
      </div>

    </div>
  )
}

export default EditUser