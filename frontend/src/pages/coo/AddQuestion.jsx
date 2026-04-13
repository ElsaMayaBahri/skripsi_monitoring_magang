import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { addQuiz } from "../../utils/storage"

function AddQuiz() {
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState({
    id: Date.now().toString(),
    title: "",
    divisi: "",
    kategori: "",
    createdAt: new Date().toISOString(),
    questions: []
  })

  const [showForm, setShowForm] = useState(false)

  const [qForm, setQForm] = useState({
    question: "",
    options: ["", "", "", "", ""],
    correct: null
  })

  // ADD QUESTION
  const handleAddQuestion = () => {
    if (!qForm.question) return alert("Isi soal dulu")

    const newQ = {
      id: Date.now(),
      ...qForm
    }

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQ]
    })

    // reset form
    setQForm({
      question: "",
      options: ["", "", "", "", ""],
      correct: null
    })

    setShowForm(false)
  }

  // DELETE QUESTION
  const removeQuestion = (id) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter(q => q.id !== id)
    })
  }

  const handleSubmit = () => {
    if (!quiz.title) return alert("Isi judul kuis")
    addQuiz(quiz)
    navigate("/coo/quiz")
  }

  return (
    <div className="p-6 max-w-5xl">

      <h1 className="text-xl font-semibold mb-6">Buat Kuis Baru</h1>

      {/* DETAIL */}
      <div className="bg-white p-6 rounded-xl border mb-6 space-y-4">
        <input
          placeholder="Judul Kuis"
          className="w-full border p-2 rounded"
          onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
        />

        <input
          placeholder="Divisi"
          className="w-full border p-2 rounded"
          onChange={(e) => setQuiz({ ...quiz, divisi: e.target.value })}
        />
      </div>

      {/* LIST SOAL */}
      <div className="bg-white p-6 rounded-xl border mb-6">

        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">
            Daftar Soal ({quiz.questions.length})
          </h2>

          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            + Tambah Soal
          </button>
        </div>

        {quiz.questions.length === 0 && (
          <p className="text-gray-400 text-sm">
            Belum ada soal
          </p>
        )}

        {quiz.questions.map((q, i) => (
          <div key={q.id} className="border p-3 rounded mb-2 flex justify-between">
            <span>{i + 1}. {q.question}</span>
            <button onClick={() => removeQuestion(q.id)}>🗑️</button>
          </div>
        ))}

      </div>

      {/* BUTTON */}
      <div className="flex justify-end gap-3">
        <button onClick={() => navigate("/coo/quiz")}>Batal</button>
        <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
          Simpan Kuis
        </button>
      </div>

      {/* MODAL TAMBAH SOAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[500px]">

            <h2 className="font-semibold mb-4">Tambah Soal</h2>

            <textarea
              className="w-full border p-2 mb-3"
              placeholder="Isi pertanyaan"
              value={qForm.question}
              onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
            />

            {qForm.options.map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2">
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
                  onChange={() => setQForm({ ...qForm, correct: i })}
                />
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowForm(false)}>Batal</button>
              <button onClick={handleAddQuestion} className="bg-blue-600 text-white px-3 py-1 rounded">
                Simpan Soal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default AddQuiz