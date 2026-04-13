import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

function EditMateri() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [form, setForm] = useState({
    title: "",
    desc: "",
    divisi: "",
    kategori: ""
  })

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("materi")) || []
    const item = data[id]

    if (item) {
      setForm(item)
    }
  }, [id])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleUpdate = () => {
    const data = JSON.parse(localStorage.getItem("materi")) || []

    data[id] = form

    localStorage.setItem("materi", JSON.stringify(data))

    alert("Materi berhasil diupdate")
    navigate("/coo/materi")
  }

  return (
    <div className="p-6 max-w-xl">

      <h1 className="text-xl font-semibold mb-4">
        Edit Materi
      </h1>

      <div className="space-y-4">

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          name="desc"
          value={form.desc}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="divisi"
          value={form.divisi}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update
        </button>

      </div>

    </div>
  )
}

export default EditMateri