// src/pages/peserta/KuisKompetensi.jsx
import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
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
  Flag,
  Server,
  HelpCircle,
  BookOpen,
  BarChart3,
  Send,
  ClipboardList,
  Star,
  TrendingUp,
  ThumbsUp,
  Target,
  Crown,
  Medal,
  Sparkles,
  RefreshCw,
  ArrowRight
} from "lucide-react"
import { getSoalKuisKompetensi, submitJawabanKuisKompetensi } from "../../api/peserta/quizKompetensiService"

function KuisKompetensi() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [raguAnswers, setRaguAnswers] = useState({})
  const [quiz, setQuiz] = useState(null)
  const [result, setResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [backendError, setBackendError] = useState(false)

  useEffect(() => {
    loadQuizDetail()
  }, [id])

  const loadQuizDetail = async () => {
    setLoading(true)
    setBackendError(false)
    
    try {
      const response = await getSoalKuisKompetensi(id)
      
      if (response.success && response.data) {
        const quizData = response.data
        setQuiz({
          id: quizData.id_kuis || quizData.id,
          judul: quizData.judul,
          deskripsi: quizData.deskripsi,
          durasi: quizData.durasi,
          passing_score: quizData.passing_score,
          questions: quizData.questions
        })
        setTimeLeft(quizData.durasi * 60)
      } else {
        console.log("Backend belum siap, menggunakan dummy data")
        setBackendError(true)
        loadDummyQuizDetail()
      }
    } catch (err) {
      console.error("Error load quiz detail:", err)
      setBackendError(true)
      loadDummyQuizDetail()
    } finally {
      setLoading(false)
    }
  }

  const loadDummyQuizDetail = () => {
    const dummyQuiz = {
      id: parseInt(id),
      judul: "Ujian Kompetensi Frontend Developer",
      deskripsi: "Uji pemahaman Anda tentang fundamental JavaScript, React JS, dan pengembangan web modern",
      durasi: 60,
      passing_score: 75,
      questions: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        text: `Soal nomor ${i + 1}: Manakah pernyataan yang benar tentang JavaScript?`,
        options: [
          "JavaScript adalah bahasa pemrograman yang hanya berjalan di browser",
          "JavaScript dapat berjalan di browser maupun server (Node.js)",
          "JavaScript sama dengan Java",
          "JavaScript tidak bisa digunakan untuk backend"
        ],
        correct: 1
      }))
    }
    setQuiz(dummyQuiz)
    setTimeLeft(dummyQuiz.durasi * 60)
  }

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (quizStarted && timeLeft === 0 && !result) {
      handleSubmit()
    }
  }, [timeLeft, quizStarted])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelectAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }))
    if (raguAnswers[questionId]) {
      setRaguAnswers(prev => {
        const newRagu = { ...prev }
        delete newRagu[questionId]
        return newRagu
      })
    }
  }

  const handleRagu = (questionId) => {
    setRaguAnswers(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleJumpToQuestion = (index) => {
    setCurrentQuestion(index)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    
    try {
      let score = 0
      if (quiz) {
        quiz.questions.forEach(q => {
          if (answers[q.id] === q.correct) score++
        })
        const finalScore = (score / quiz.questions.length) * 100
        const isPassed = finalScore >= quiz.passing_score
        
        setResult({
          score: Math.round(finalScore),
          total: quiz.questions.length,
          correct: score,
          wrong: quiz.questions.length - score,
          isPassed: isPassed,
          passing_score: quiz.passing_score,
          message: isPassed ? "Selamat! Anda telah berhasil lulus ujian kompetensi dengan gemilang!" : "Perlu belajar lebih giat lagi. Jangan menyerah, coba pelajari materi kembali!"
        })
        
        if (!backendError) {
          await submitJawabanKuisKompetensi(quiz.id, answers)
        }
      }
    } catch (err) {
      console.error("Error submit quiz:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
  }

  const getQuestionStatus = (questionId) => {
    if (answers[questionId] !== undefined) return "answered"
    if (raguAnswers[questionId]) return "ragu"
    return "unanswered"
  }

  const answeredCount = Object.keys(answers).length
  const raguCount = Object.keys(raguAnswers).filter(id => !answers[id]).length
  const unansweredCount = quiz ? quiz.questions.length - answeredCount : 0

  const getGrade = (score) => {
    if (score >= 90) return { label: "A+", color: "from-emerald-500 to-teal-500", icon: <Crown size={16} />, text: "Excellent!" }
    if (score >= 80) return { label: "A", color: "from-emerald-400 to-teal-400", icon: <Star size={16} />, text: "Very Good!" }
    if (score >= 70) return { label: "B", color: "from-blue-500 to-cyan-500", icon: <ThumbsUp size={16} />, text: "Good!" }
    if (score >= 60) return { label: "C", color: "from-amber-500 to-orange-500", icon: <Medal size={16} />, text: "Keep Learning!" }
    return { label: "D", color: "from-red-500 to-rose-500", icon: <Target size={16} />, text: "Need Improvement" }
  }

  // Daftar kuis selanjutnya untuk tombol lanjut
  const daftarKuis = [
    { id: 1, judul: "Fundamental JavaScript", selesai: false },
    { id: 2, judul: "React JS Dasar", selesai: true },
    { id: 3, judul: "Tailwind CSS", selesai: false },
    { id: 4, judul: "State Management Redux", selesai: false }
  ]
  
  const nextQuiz = daftarKuis.find(q => q.id > parseInt(id) && !q.selesai)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-5 md:p-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center">
          <AlertCircle size="48" className="text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800">Kuis Tidak Ditemukan</h2>
          <button
            onClick={() => navigate("/peserta/daftar-kuis-kompetensi")}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-sm"
          >
            Kembali ke Daftar Kuis
          </button>
        </div>
      </div>
    )
  }

  // NOTIF BACKEND
  if (backendError && !result && !quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-5 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
            <div className="flex items-start gap-3">
              <Server size="18" className="text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">⚠️ Catatan untuk Backend Developer</p>
                <p className="text-xs text-amber-700 mt-1">Halaman ini menggunakan DATA DUMMY. Endpoint API yang diperlukan:</p>
                <div className="bg-amber-100 rounded-md p-2 mt-2 font-mono text-xs">
                  <p>GET /api/peserta/kuis-kompetensi</p>
                  <p>GET /api/peserta/kuis-kompetensi/{id}/soal</p>
                  <p>POST /api/peserta/kuis-kompetensi/{id}/submit</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="relative h-2 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500"></div>
            <div className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-5 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Flag size="36" className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{quiz.judul}</h2>
              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{quiz.deskripsi}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-5 bg-gray-50 rounded-xl">
                <div><p className="text-xs text-gray-500">Durasi</p><p className="text-lg font-bold text-gray-800">{quiz.durasi} menit</p></div>
                <div><p className="text-xs text-gray-500">Jumlah Soal</p><p className="text-lg font-bold text-gray-800">{quiz.questions.length} soal</p></div>
                <div><p className="text-xs text-gray-500">Nilai Minimal</p><p className="text-lg font-bold text-amber-600">{quiz.passing_score}%</p></div>
                <div><p className="text-xs text-gray-500">Kesempatan</p><p className="text-lg font-bold text-gray-800">1x</p></div>
              </div>
              
              <div className="mt-8 flex gap-3 justify-center">
                <button onClick={() => navigate("/peserta/daftar-kuis-kompetensi")} className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Batal</button>
                <button onClick={handleStartQuiz} className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg flex items-center gap-2"><Zap size="18" /> Mulai Kuis (Testing)</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // HASIL KUIS - SUPER PREMIUM (DIPERKECIL)
  if (result) {
    const grade = getGrade(result.score)
    const isPassed = result.isPassed
    const percentage = (result.correct / result.total) * 100
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-5 md:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section - Diperkecil */}
          <div className={`relative overflow-hidden rounded-xl shadow-lg mb-5 ${isPassed ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" : "bg-gradient-to-r from-red-600 via-orange-600 to-amber-600"}`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative p-5 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-xl backdrop-blur-sm mb-2 shadow-md">
                {isPassed ? <Trophy size="28" className="text-white" /> : <Zap size="28" className="text-white" />}
              </div>
              <h1 className="text-xl font-bold text-white mb-1">{isPassed ? "✨ SELAMAT! ✨" : "TINGKATKAN BELAJAR"}</h1>
              <p className="text-white/85 text-xs max-w-md mx-auto">{result.message}</p>
            </div>
          </div>

          {/* Score Card Utama - Diperkecil */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-5">
            <div className="p-5 text-center">
              {/* Nilai Utama dengan Circle Progress - Lebih kecil */}
              <div className="relative inline-block mx-auto mb-4">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle 
                    cx="56" cy="56" r="48" fill="none" 
                    stroke={isPassed ? "url(#gradientSuccess)" : "url(#gradientWarning)"}
                    strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - result.score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradientSuccess" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id="gradientWarning" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">{result.score}</span>
                  <span className="text-[10px] text-gray-500">Nilai</span>
                </div>
              </div>

              {/* Grade Badge - Lebih kecil */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${grade.color} text-white shadow-md mb-4`}>
                {grade.icon}
                <span className="font-bold text-sm">{grade.label}</span>
                <span className="text-[10px] opacity-90">{grade.text}</span>
              </div>

              {/* Statistik Grid - Lebih kecil */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle size="12" className="text-teal-600" />
                    <span className="text-[10px] font-medium text-teal-600">Benar</span>
                  </div>
                  <p className="text-xl font-bold text-teal-700">{result.correct}</p>
                  <p className="text-[9px] text-gray-500">dari {result.total}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <XCircle size="12" className="text-red-600" />
                    <span className="text-[10px] font-medium text-red-600">Salah</span>
                  </div>
                  <p className="text-xl font-bold text-red-700">{result.wrong}</p>
                  <p className="text-[9px] text-gray-500">dari {result.total}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target size="12" className="text-blue-600" />
                    <span className="text-[10px] font-medium text-blue-600">Target</span>
                  </div>
                  <p className="text-xl font-bold text-blue-700">{result.passing_score}%</p>
                  <p className="text-[9px] text-gray-500">Minimal Lulus</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Card - Lebih kecil */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-5">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingUp size="14" className="text-teal-500" />
                <h3 className="text-xs font-semibold text-gray-700">Analisis Performa</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500">Penguasaan Materi</span>
                  <span className="font-semibold text-teal-600">{Math.round(percentage)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${isPassed ? "bg-gradient-to-r from-teal-500 to-blue-500" : "bg-gradient-to-r from-amber-500 to-red-500"}`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Tingkat Akurasi</span>
                  <span className="font-bold text-gray-800">{Math.round(percentage)}%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Selisih ke Target</span>
                  <span className="font-bold text-amber-600">{Math.abs(result.passing_score - result.score)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rekomendasi & Tombol Aksi - Lebih kecil */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Sparkles size="12" className="text-teal-500" />
                  Rekomendasi Belajar
                </p>
                <p className="text-[11px] text-gray-500">
                  {isPassed 
                    ? "Hebat! Pertahankan prestasi Anda. Lanjutkan ke materi berikutnya."
                    : "Jangan menyerah! Pelajari kembali materi yang masih kurang dipahami."}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/peserta/daftar-kuis-kompetensi")}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white text-xs font-semibold hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <BookOpen size="12" />
                  Daftar Kuis
                </button>
                {nextQuiz && nextQuiz.id !== parseInt(id) && (
                  <button
                    onClick={() => navigate(`/peserta/kuis-kompetensi/${nextQuiz.id}`)}
                    className="px-4 py-1.5 rounded-lg border-2 border-teal-500 text-teal-600 text-xs font-semibold hover:bg-teal-50 transition-all flex items-center gap-1.5"
                  >
                    <ArrowRight size="12" />
                    {`Kuis ${nextQuiz.id}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Halaman Mulai Kuis (backend siap)
  if (!quizStarted && !backendError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-5 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="relative h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500"></div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Flag size="24" className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">{quiz.judul}</h2>
              <p className="text-xs text-gray-500 mt-1">{quiz.deskripsi}</p>
              
              <div className="grid grid-cols-4 gap-3 mt-4 p-3 bg-gray-50 rounded-lg">
                <div><p className="text-[10px] text-gray-500">Durasi</p><p className="text-sm font-bold text-gray-800">{quiz.durasi} m</p></div>
                <div><p className="text-[10px] text-gray-500">Soal</p><p className="text-sm font-bold text-gray-800">{quiz.questions.length}</p></div>
                <div><p className="text-[10px] text-gray-500">Minimal</p><p className="text-sm font-bold text-amber-600">{quiz.passing_score}%</p></div>
                <div><p className="text-[10px] text-gray-500">Kesempatan</p><p className="text-sm font-bold text-gray-800">1x</p></div>
              </div>
              
              <div className="mt-5 flex gap-2 justify-center">
                <button onClick={() => navigate("/peserta/daftar-kuis-kompetensi")} className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50">Batal</button>
                <button onClick={handleStartQuiz} className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-xs font-semibold shadow-md hover:shadow-lg flex items-center gap-1"><Zap size="12" /> Mulai Kuis</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mengerjakan Kuis
  const question = quiz.questions[currentQuestion]
  const isLast = currentQuestion === quiz.questions.length - 1
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-5 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Grid Nomor Soal */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 sticky top-6">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <BookOpen size="14" className="text-teal-500" />
                  <h3 className="font-semibold text-gray-700 text-sm">Navigasi Soal</h3>
                </div>
              </div>
              
              <div className="p-3">
                <div className="grid grid-cols-5 gap-1.5">
                  {quiz.questions.map((q, idx) => {
                    const status = getQuestionStatus(q.id)
                    let bgColor = "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    if (status === "answered") bgColor = "bg-teal-500 text-white hover:bg-teal-600"
                    if (status === "ragu") bgColor = "bg-amber-500 text-white hover:bg-amber-600"
                    if (currentQuestion === idx) bgColor = "bg-gradient-to-r from-teal-600 to-blue-600 text-white ring-2 ring-teal-300"
                    
                    return (
                      <button key={q.id} onClick={() => handleJumpToQuestion(idx)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${bgColor}`}>
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-gray-500">Terjawab</span></div>
                    <span className="font-semibold text-gray-700">{answeredCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-gray-500">Ragu</span></div>
                    <span className="font-semibold text-gray-700">{raguCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300"></div><span className="text-gray-500">Kosong</span></div>
                    <span className="font-semibold text-gray-700">{unansweredCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Soal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <ClipboardList size="14" className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Soal {currentQuestion + 1} dari {quiz.questions.length}</p>
                    <p className="text-xs font-semibold text-gray-800">{quiz.judul}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500">Sisa Waktu</p>
                  <p className={`text-lg font-bold font-mono ${timeLeft < 60 ? "text-red-600 animate-pulse" : "text-teal-600"}`}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[9px] text-gray-400 mb-0.5">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-4">
              <div className="relative h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500"></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 leading-relaxed">{question.text}</h3>
                  <button onClick={() => handleRagu(question.id)} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${raguAnswers[question.id] ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    <HelpCircle size="12" />
                    {raguAnswers[question.id] ? "Batalkan" : "Ragu"}
                  </button>
                </div>
                
                <div className="space-y-2.5">
                  {question.options.map((option, idx) => {
                    const isSelected = answers[question.id] === idx
                    const optionLetter = String.fromCharCode(65 + idx)
                    return (
                      <label key={idx} className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all cursor-pointer ${isSelected ? "border-teal-500 bg-teal-50 shadow-sm" : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"}`}>
                        <input type="radio" name={`question-${question.id}`} value={idx} checked={isSelected} onChange={() => handleSelectAnswer(question.id, idx)} className="w-3.5 h-3.5 mt-0.5 text-teal-500" />
                        <div>
                          <span className="font-semibold text-gray-700 text-sm mr-2">{optionLetter}.</span>
                          <span className="text-sm text-gray-700">{option}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <button onClick={handlePrevQuestion} disabled={currentQuestion === 0} className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1">
                <ChevronLeft size="12" /> Sebelumnya
              </button>
              
              {isLast ? (
                <button onClick={handleSubmit} disabled={submitting} className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-semibold shadow-md hover:shadow-lg flex items-center gap-1 disabled:opacity-50">
                  {submitting ? <Loader2 size="12" className="animate-spin" /> : <Send size="12" />}
                  {submitting ? "Memproses" : "Selesaikan"}
                </button>
              ) : (
                <button onClick={handleNextQuestion} className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg text-xs font-semibold shadow-md hover:shadow-lg flex items-center gap-1">
                  Selanjutnya <ChevronRight size="12" />
                </button>
              )}
            </div>

            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-3 text-[10px]">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-gray-500">Terjawab</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-gray-500">Ragu</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300"></div><span className="text-gray-500">Kosong</span></div>
                <div className="text-gray-300">|</div>
                <div className="flex items-center gap-1"><BarChart3 size="10" className="text-teal-500" /><span className="text-gray-500">{Math.round((answeredCount / quiz.questions.length) * 100)}%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KuisKompetensi