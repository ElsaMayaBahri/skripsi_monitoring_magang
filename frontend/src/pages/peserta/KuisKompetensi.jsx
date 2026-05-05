// src/pages/peserta/KuisKompetensi.jsx
import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Award,
  Trophy,
  Zap,
  Sparkles,
  Target,
  Search,
  BookOpen
} from "lucide-react"

function KuisKompetensi() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [quiz, setQuiz] = useState(null)
  const [quizList, setQuizList] = useState([])
  const [result, setResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [quizStarted, setQuizStarted] = useState(false)

  // Cek apakah ada parameter id (detail kuis) atau tidak (daftar kuis)
  const isDetailView = !!id

  useEffect(() => {
    if (isDetailView) {
      loadQuizDetail()
    } else {
      loadQuizList()
    }
  }, [id])

  const loadQuizList = () => {
    setLoading(true)
    setTimeout(() => {
      const dummyQuizList = [
        {
          id: 1,
          judul: "Fundamental JavaScript",
          deskripsi: "Uji pemahaman Anda tentang dasar-dasar JavaScript",
          durasi: 30,
          passing_score: 70,
          total_questions: 10,
          is_completed: false,
          score: null
        },
        {
          id: 2,
          judul: "React JS Dasar",
          deskripsi: "Uji pemahaman Anda tentang React JS",
          durasi: 45,
          passing_score: 75,
          total_questions: 15,
          is_completed: true,
          score: 85
        },
        {
          id: 3,
          judul: "Tailwind CSS",
          deskripsi: "Uji pemahaman Anda tentang Tailwind CSS",
          durasi: 30,
          passing_score: 70,
          total_questions: 10,
          is_completed: false,
          score: null
        }
      ]
      setQuizList(dummyQuizList)
      setLoading(false)
    }, 500)
  }

  const loadQuizDetail = () => {
    setLoading(true)
    setTimeout(() => {
      const dummyQuiz = {
        id: parseInt(id),
        judul: "Fundamental JavaScript",
        deskripsi: "Uji pemahaman Anda tentang dasar-dasar JavaScript",
        durasi: 30,
        passing_score: 70,
        questions: [
          {
            id: 1,
            text: "Apa kepanjangan dari JavaScript?",
            options: ["Java Script", "Just Script", "JavaScript tidak memiliki kepanjangan", "Java Simple Script"],
            correct: 2
          },
          {
            id: 2,
            text: "Manakah yang merupakan tipe data primitif di JavaScript?",
            options: ["Object", "Array", "String", "Function"],
            correct: 2
          },
          {
            id: 3,
            text: "Apa fungsi dari 'console.log()'?",
            options: ["Menampilkan alert", "Mencetak ke console", "Menyimpan data", "Mengirim request"],
            correct: 1
          },
          {
            id: 4,
            text: "Manakah cara yang benar untuk mendeklarasikan variabel di JavaScript?",
            options: ["var nama = 'John'", "v nama = 'John'", "variable nama = 'John'", "declare nama = 'John'"],
            correct: 0
          },
          {
            id: 5,
            text: "Apa hasil dari '5' + 3 di JavaScript?",
            options: ["8", "53", "Error", "Undefined"],
            correct: 1
          }
        ]
      }
      setQuiz(dummyQuiz)
      setTimeLeft(dummyQuiz.durasi * 60)
      setLoading(false)
    }, 500)

    // Cek apakah materi sudah diakses
    const accessedMateri = JSON.parse(localStorage.getItem("materi_kompetensi_accessed") || "[]")
    if (!accessedMateri.length) {
      alert("Anda harus mengakses materi terlebih dahulu sebelum mengerjakan kuis!")
      navigate("/peserta/materi-kompetensi")
    }
  }

  // ... rest of the quiz logic (handleSelectAnswer, handleNextQuestion, etc.)

  // Tampilan Daftar Kuis (List View)
  if (!isDetailView) {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur-md opacity-50"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                Daftar Kuis Kompetensi
              </h1>
              <p className="text-sm text-gray-500 mt-1">Pilih kuis yang ingin Anda kerjakan</p>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizList.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <BookOpen size="16" className="text-purple-600" />
                    </div>
                  </div>
                  {item.is_completed ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100">
                      <CheckCircle size="10" className="text-emerald-600" />
                      <span className="text-[9px] font-medium text-emerald-600">Selesai</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100">
                      <Clock size="10" className="text-amber-600" />
                      <span className="text-[9px] font-medium text-amber-600">Belum Dikerjakan</span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-gray-800 text-lg mb-2">{item.judul}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.deskripsi}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Durasi</span>
                    <span className="font-medium text-gray-700">{item.durasi} menit</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Jumlah Soal</span>
                    <span className="font-medium text-gray-700">{item.total_questions} soal</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Nilai Minimal</span>
                    <span className="font-medium text-amber-600">{item.passing_score}%</span>
                  </div>
                  {item.is_completed && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Nilai Anda</span>
                      <span className="font-bold text-emerald-600">{item.score}%</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => navigate(`/peserta/kuis-kompetensi/${item.id}`)}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    item.is_completed
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md hover:shadow-lg"
                  }`}
                  disabled={item.is_completed}
                >
                  {item.is_completed ? (
                    <>
                      <CheckCircle size="14" />
                      Sudah Dikerjakan
                    </>
                  ) : (
                    <>
                      <Zap size="14" />
                      Mulai Kuis
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {quizList.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 py-12 text-center">
            <ClipboardList size="48" className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada kuis tersedia</p>
            <p className="text-sm text-gray-400 mt-1">Kuis akan muncul setelah Anda mengakses materi</p>
          </div>
        )}
      </div>
    )
  }

  // Tampilan Detail Kuis (Quiz Taking)
  // ... (sisa kode untuk mengerjakan kuis sama seperti sebelumnya)
  
  // Untuk sementara, jika detail view tapi quiz belum di-load
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    )
  }

  // Redirect ke daftar kuis jika quiz tidak ditemukan
  if (!quiz) {
    return (
      <div className="text-center py-12">
        <AlertCircle size="48" className="text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Kuis Tidak Ditemukan</h2>
        <button
          onClick={() => navigate("/peserta/kuis-kompetensi")}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg"
        >
          Kembali ke Daftar Kuis
        </button>
      </div>
    )
  }

  // Di sini lanjutkan dengan logika pengerjaan kuis (sama seperti kode sebelumnya)
  // ...
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hasil kuis atau form kuis */}
      <div className="text-center py-12">
        <p className="text-gray-500">Loading quiz...</p>
      </div>
    </div>
  )
}

export default KuisKompetensi