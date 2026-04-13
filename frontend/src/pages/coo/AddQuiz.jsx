import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { addQuiz } from "../../utils/storage"

function AddQuiz() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [mode, setMode] = useState("manual") // manual / excel

  const [quiz, setQuiz] = useState({
    id: Date.now().toString(),
    title: "",
    divisi: "",
    deskripsi: "",
    durasi: 60,
    passing: 75,
    questions: []
  })

  const [showModal, setShowModal] = useState(false)

  const [qForm, setQForm] = useState({
    question: "",
    options: ["", "", "", "", ""],
    correct: null
  })

  // ADD QUESTION
  const handleAddQuestion = () => {
    const newQ = {
      id: Date.now(),
      ...qForm
    }

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQ]
    })

    setQForm({
      question: "",
      options: ["", "", "", "", ""],
      correct: null
    })

    setShowModal(false)
  }

  const handleSubmit = () => {
    addQuiz(quiz)
    navigate("/coo/quiz")
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Buat Kuis Baru</h1>
        <p className="text-sm text-gray-500">
          Lengkapi detail kuis dan kelola soal untuk kuis baru Anda.
        </p>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl border space-y-4">

          <h2 className="font-semibold">1. Detail Kuis</h2>

          <input
            placeholder="Judul Kuis"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setQuiz({ ...quiz, title: e.target.value })
            }
          />

          <select
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setQuiz({ ...quiz, divisi: e.target.value })
            }
          >
            <option>Pilih Divisi</option>
            <option>Engineering</option>
            <option>Finance</option>
          </select>

          <textarea
            placeholder="Deskripsi"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setQuiz({ ...quiz, deskripsi: e.target.value })
            }
          />

          <button
            onClick={() => setStep(2)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Lanjut
          </button>

        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-xl border space-y-4">

          <h2 className="font-semibold">2. Pengaturan</h2>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-sm text-gray-500">Durasi (menit)</p>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={quiz.durasi}
                onChange={(e) =>
                  setQuiz({ ...quiz, durasi: e.target.value })
                }
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">Passing Grade (%)</p>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={quiz.passing}
                onChange={(e) =>
                  setQuiz({ ...quiz, passing: e.target.value })
                }
              />
            </div>

          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border rounded"
            >
              Kembali
            </button>

            <button
              onClick={() => setStep(3)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Lanjut
            </button>
          </div>

        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl border space-y-4">

          <div className="flex justify-between items-center">
            <h2 className="font-semibold">3. Daftar Soal</h2>

            <div className="flex gap-2">
              <button
                onClick={() => setMode("manual")}
                className={`px-3 py-1 rounded ${
                  mode === "manual"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Input Manual
              </button>

              <button
                onClick={() => setMode("excel")}
                className={`px-3 py-1 rounded ${
                  mode === "excel"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Import Excel
              </button>
            </div>
          </div>

          {/* EMPTY STATE */}
          {quiz.questions.length === 0 && mode === "manual" && (
            <div className="border-dashed border p-10 text-center text-gray-400 rounded">
              Belum ada pertanyaan
              <br />
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Tambah Pertanyaan
              </button>
            </div>
          )}

          {/* LIST SOAL */}
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="border p-3 rounded">
              {i + 1}. {q.question}
            </div>
          ))}

          {/* IMPORT EXCEL UI */}
          {mode === "excel" && (
            <div className="border-dashed border p-10 text-center rounded">
              Tarik & Lepas file Excel di sini
              <br />
              <span className="text-xs text-gray-400">
                (.xlsx / .xls)
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border rounded"
            >
              Kembali
            </button>

            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Simpan Kuis
            </button>
          </div>

        </div>
      )}

      {/* MODAL TAMBAH SOAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[500px] space-y-4">

            <h2 className="font-semibold">Tambah Soal</h2>

            <textarea
              placeholder="Isi pertanyaan"
              className="w-full border p-2 rounded"
              value={qForm.question}
              onChange={(e) =>
                setQForm({ ...qForm, question: e.target.value })
              }
            />

            {qForm.options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  className="border p-2 flex-1"
                  placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpt = [...qForm.options]
                    newOpt[i] = e.target.value
                    setQForm({ ...qForm, options: newOpt })
                  }}
                />

                <input
                  type="radio"
                  name="correct"
                  onChange={() =>
                    setQForm({ ...qForm, correct: i })
                  }
                />
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}>
                Batal
              </button>

              <button
                onClick={handleAddQuestion}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Simpan
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default AddQuiz