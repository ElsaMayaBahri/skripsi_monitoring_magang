import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Video, File } from "lucide-react"

function Materi() {
  const navigate = useNavigate()
  const [materi, setMateri] = useState([])
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("materi")) || []
    setMateri(data)
  }, [])

  const handleDelete = (index) => {
    if (!confirm("Yakin hapus materi?")) return

    const updated = [...materi]
    updated.splice(index, 1)

    localStorage.setItem("materi", JSON.stringify(updated))
    setMateri(updated)
  }

  const handlePreview = (item, index) => {
    setPreview({ ...item, index })
  }

  // 🔥 TYPE DETECTOR
  const getType = (type) => {
    if (!type) return "file"
    if (type.includes("pdf")) return "pdf"
    if (type.includes("video")) return "video"
    if (type.includes("presentation") || type.includes("ppt")) return "ppt"
    return "file"
  }

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Materi Pelatihan
          </h1>
          <p className="text-sm text-gray-500">
            Kelola materi pembelajaran peserta
          </p>
        </div>

        <button
          onClick={() => navigate("/coo/add-materi")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Tambah Baru
        </button>
      </div>

      {/* TAB */}
      <div className="mb-6 flex gap-6 border-b">
        <button className="text-blue-600 border-b-2 border-blue-600 pb-2 text-sm font-medium">
          Materi Pelatihan
        </button>
        <button className="text-gray-400 pb-2 text-sm">
          Kuis Pelatihan
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-6">

        {materi.map((m, i) => {
          const type = getType(m.file?.type)

          let bg = "bg-gray-100"
          let icon = <File size={30} className="text-gray-500" />
          let label = m.file?.size || "-"

          if (type === "pdf") {
            bg = "bg-red-100"
            icon = <FileText size={30} className="text-red-500" />
            label = `PDF • ${m.file?.size}`
          }

          if (type === "video") {
            bg = "bg-blue-100"
            icon = <Video size={30} className="text-blue-500" />
            label = "HD Video"
          }

          if (type === "ppt") {
            bg = "bg-yellow-100"
            icon = <File size={30} className="text-yellow-500" />
            label = "Slide Presentasi"
          }

          return (
            <div
              key={i}
              onClick={() => handlePreview(m, i)}
              className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition p-5 cursor-pointer"
            >

              {/* ICON */}
              <div className={`w-full h-28 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                {icon}
              </div>

              {/* BADGE */}
              <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium">
                {m.divisi || "GENERAL"}
              </span>

              {/* TITLE */}
              <h3 className="mt-2 text-sm font-semibold text-gray-800">
                {m.title}
              </h3>

              {/* DATE */}
              <p className="text-xs text-gray-400 mt-1">
                Terakhir diperbarui{" "}
                {m.createdAt
                  ? new Date(m.createdAt).toLocaleDateString()
                  : "-"}
              </p>

              {/* INFO */}
              <p className="text-xs text-gray-400 mt-1">
                {label}
              </p>

              {/* ACTION */}
              <div className="flex justify-end gap-3 mt-4 text-gray-400">

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/coo/edit-materi/${i}`)
                  }}
                  className="hover:text-blue-600"
                >
                  ✏️
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(i)
                  }}
                  className="hover:text-red-500"
                >
                  🗑️
                </button>

              </div>

            </div>
          )
        })}

      </div>

      {/* 🔥 FULLSCREEN PREVIEW */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">

          {/* TOP BAR */}
          <div className="bg-white px-6 py-3 flex justify-between items-center">
            <h2 className="font-semibold">{preview.title}</h2>

            <button onClick={() => setPreview(null)}>
              ✖
            </button>
          </div>

          {/* CONTENT */}
          <div className="flex-1 flex items-center justify-center bg-black">

            {/* PDF */}
            {preview.file?.type.includes("pdf") && (
              <iframe
                src={preview.file.url}
                className="w-full h-full"
              />
            )}

            {/* VIDEO */}
            {preview.file?.type.includes("video") && (
              <video
                src={preview.file.url}
                controls
                className="w-full h-full"
                onTimeUpdate={(e) => {
                  const progress = e.target.currentTime / e.target.duration
                  console.log("Progress:", progress)
                }}
              />
            )}

            {/* OTHER */}
            {!preview.file?.type.includes("pdf") &&
             !preview.file?.type.includes("video") && (
              <div className="text-white">
                Preview tidak tersedia
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  )
}

export default Materi