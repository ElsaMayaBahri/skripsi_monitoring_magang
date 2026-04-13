import { useState } from "react"
import { UploadCloud, FileText, Video, File } from "lucide-react"
import { useNavigate } from "react-router-dom"

function AddMateri() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "",
    desc: "",
    divisi: "",
    kategori: ""
  })

  const [files, setFiles] = useState([])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const newFile = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      progress: 100
    }

    setFiles([...files, newFile])
  }

  const getIcon = (type) => {
    if (type.includes("pdf")) return <FileText className="text-red-500" />
    if (type.includes("video")) return <Video className="text-blue-500" />
    return <File className="text-yellow-500" />
  }

  // 🔥 WAJIB: HANDLE SUBMIT
  const handleSubmit = () => {
    if (!form.title || files.length === 0) {
      alert("Lengkapi data dan upload file dulu")
      return
    }

    const materi = JSON.parse(localStorage.getItem("materi")) || []

    const newMateri = {
      ...form,
      file: files[0],
      createdAt: new Date().toISOString()
    }

    materi.push(newMateri)
    localStorage.setItem("materi", JSON.stringify(materi))

    alert("Materi berhasil ditambahkan")

    navigate("/coo/materi") // 🔥 ini penting
  }

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="mb-6">
        <p className="text-xs text-gray-400">
          Materi / Tambah Materi Baru
        </p>
        <h1 className="text-xl font-semibold text-gray-800">
          Tambah Materi Pelatihan
        </h1>
        <p className="text-sm text-gray-500">
          Lengkapi detail informasi dan unggah berkas materi untuk peserta magang.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            📄 Detail Metadata
          </h3>

          <div className="space-y-4">

            <input
              name="title"
              placeholder="Contoh: Pengenalan Budaya Perusahaan"
              value={form.title}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg text-sm"
            />

            <textarea
              name="desc"
              placeholder="Deskripsi"
              value={form.desc}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg text-sm h-24"
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                name="divisi"
                value={form.divisi}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg text-sm"
              >
                <option value="">Pilih Divisi</option>
                <option>Engineering</option>
                <option>Finance</option>
                <option>Design</option>
              </select>

              <input
                name="kategori"
                placeholder="Kategori"
                value={form.kategori}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg text-sm"
              />
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">

          <h3 className="font-semibold mb-4 flex items-center gap-2">
            📤 Unggah File
          </h3>

          <label className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50">

            <UploadCloud className="text-blue-500 mb-3" size={30} />

            <p className="text-sm text-gray-600">
              Seret & letakkan file di sini
            </p>

            <p className="text-xs text-blue-500 mt-1">
              Atau klik untuk memilih dari komputer
            </p>

            <input
              type="file"
              className="hidden"
              onChange={handleFile}
            />

            <div className="text-xs text-gray-400 mt-3">
              PDF • MP4 • PPTX
            </div>

          </label>

          <div className="mt-6 space-y-3">

            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between border p-3 rounded-lg">

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
                    {getIcon(f.type)}
                  </div>

                  <div>
                    <p className="text-sm">{f.name}</p>
                    <p className="text-xs text-gray-400">{f.size}</p>
                  </div>
                </div>

                <div className="w-24 h-1 bg-gray-200 rounded">
                  <div
                    className="h-1 bg-blue-500 rounded"
                    style={{ width: `${f.progress}%` }}
                  ></div>
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

      {/* BUTTON */}
      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-gray-600"
        >
          Batal
        </button>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Terbitkan Materi
        </button>

      </div>

    </div>
  )
}

export default AddMateri