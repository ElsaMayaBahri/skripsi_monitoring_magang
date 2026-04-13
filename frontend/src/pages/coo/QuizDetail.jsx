import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getQuiz, updateQuiz } from "../../utils/storage"

function QuizDetail() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState(null)

  useEffect(() => {
    const data = getQuiz().find(q => q.id === id)
    setQuiz(data)
  }, [id])

  const addQuestion = () => {
    const newQ = {
      id: Date.now(),
      question: "Soal baru",
      options: ["A", "B", "C", "D", "E"],
      correct: 0
    }

    const updated = {
      ...quiz,
      questions: [...quiz.questions, newQ]
    }

    setQuiz(updated)
    updateQuiz(id, updated)
  }

  const deleteQuestion = (qid) => {
    const updated = {
      ...quiz,
      questions: quiz.questions.filter(q => q.id !== qid)
    }

    setQuiz(updated)
    updateQuiz(id, updated)
  }

  if (!quiz) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">

      <h1 className="text-xl font-semibold mb-4">
        {quiz.title}
      </h1>

      {/* STAT CARD */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Total Soal</p>
          <h2 className="text-xl font-bold">{quiz.questions.length}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Peserta</p>
          <h2 className="text-xl font-bold">0</h2>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Rata-rata</p>
          <h2 className="text-xl font-bold">-</h2>
        </div>

      </div>

      {/* LIST SOAL */}
      <div className="bg-white p-6 rounded-xl border">

        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Daftar Soal</h2>

          <button
            onClick={addQuestion}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            + Tambah Soal
          </button>
        </div>

        {quiz.questions.map((q, i) => (
          <div
            key={q.id}
            className="border p-3 rounded mb-2 flex justify-between"
          >
            <span>{i + 1}. {q.question}</span>

            <button
              onClick={() => deleteQuestion(q.id)}
              className="text-red-500"
            >
              Hapus
            </button>
          </div>
        ))}

      </div>

    </div>
  )
}

export default QuizDetail