// src/pages/peserta/DaftarKuisKompetensi.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Loader2,
  Zap,
  BookOpen,
  Server,
  Award,
  TrendingUp,
  Lock,
  PlayCircle,
} from "lucide-react";
import { getDaftarKuisKompetensi } from "../../api/peserta/quizKompetensiService";

function DaftarKuisKompetensi() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizList, setQuizList] = useState([]);
  const [backendError, setBackendError] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    loadQuizList();
  }, []);

  const loadQuizList = async () => {
    setLoading(true);
    setBackendError(false);

    try {
      const response = await getDaftarKuisKompetensi();

      console.log("Full Response:", response);
      console.log("Response.data:", response.data);

      setDebugInfo(response.debug || null);

      if (response.success) {
        let quizData = [];

        if (Array.isArray(response.data)) {
          quizData = response.data;
        } else if (
          response.data &&
          typeof response.data === "object" &&
          Array.isArray(response.data.data)
        ) {
          quizData = response.data.data;
        } else if (
          response.data &&
          typeof response.data === "object" &&
          !Array.isArray(response.data)
        ) {
          quizData = Object.values(response.data);
          console.log("Converted object to array:", quizData);
        }

        if (quizData.length > 0) {
          const formattedData = quizData.map((item, idx) => ({
            id: item.id_kuis || item.id,
            id_kuis: item.id_kuis || item.id,
            judul: item.judul || item.title || "Tanpa Judul",
            deskripsi: item.deskripsi || "",
            durasi: item.durasi || 0,
            passing_score: item.passing_score || item.passing || 75,
            total_questions: item.total_soal || item.total_questions || 0,
            level: item.level || idx + 1,
            is_completed: item.is_completed || item.sudah_dikerjakan || false,
            is_passed: item.is_passed || false,
            is_locked: item.is_locked || false,
            can_start: item.can_start ?? true,
            can_retake: item.can_retake || false,
            locked_message: item.locked_message || "",
            score: item.skor || item.score || null,
            attempt: item.attempt || 0,
            tanggal_mulai: item.tanggal_mulai,
            tanggal_selesai: item.tanggal_selesai,
            urutan: item.urutan || idx + 1,
          }));

          // Urutkan berdasarkan level/urutan
          formattedData.sort((a, b) => (a.level || 999) - (b.level || 999));
          
          console.log("Formatted data:", formattedData);
          setQuizList(formattedData);
        } else {
          console.log("No quiz data found, showing empty state");
          setQuizList([]);
        }
      } else {
        console.log("Response success false, using dummy data");
        setBackendError(true);
        loadDummyQuizList();
      }
    } catch (err) {
      console.error("Error load quiz list:", err);
      setBackendError(true);
      loadDummyQuizList();
    } finally {
      setLoading(false);
    }
  };

  const loadDummyQuizList = () => {
    const dummyQuizList = [
      {
        id: 1,
        judul: "Fundamental JavaScript",
        deskripsi: "Uji pemahaman Anda tentang dasar-dasar JavaScript",
        durasi: 30,
        passing_score: 70,
        total_questions: 10,
        is_completed: false,
        score: null,
        level: 1,
        is_locked: false,
      },
      {
        id: 2,
        judul: "React JS Dasar",
        deskripsi: "Uji pemahaman Anda tentang React JS",
        durasi: 45,
        passing_score: 75,
        total_questions: 15,
        is_completed: true,
        score: 85,
        level: 2,
        is_locked: false,
      },
      {
        id: 3,
        judul: "Tailwind CSS",
        deskripsi: "Uji pemahaman Anda tentang Tailwind CSS",
        durasi: 30,
        passing_score: 70,
        total_questions: 10,
        is_completed: false,
        score: null,
        level: 3,
        is_locked: true,
        locked_message: "Selesaikan Level 2 terlebih dahulu",
      },
    ];
    setQuizList(dummyQuizList);
  };

  // Hitung statistik
  const totalQuizzes = quizList.length;
  const completedQuizzes = quizList.filter((q) => q.is_completed).length;
  const lockedQuizzes = quizList.filter((q) => q.is_locked).length;
  const progressPercentage = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        </div>
      </div>
    );
  }

  // Jika hanya 1 kuis, tampilkan dengan layout hero center
  const isSingleQuiz = quizList.length === 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-5 md:p-6">
      {/* Header */}
      <div className="w-full rounded-xl overflow-hidden shadow-lg mb-6">
        <div className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold">Kuis Kompetensi</h1>
              <p className="text-white/80 text-xs mt-0.5">
                Kerjakan kuis secara berurutan untuk menguji kompetensi Anda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {debugInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <details>
            <summary className="font-semibold text-blue-800 cursor-pointer">
              Debug Info
            </summary>
            <pre className="mt-2 text-blue-600 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* NOTIF BACKEND */}
      {backendError && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
          <div className="flex items-start gap-3">
            <Server size="18" className="text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                ⚠️ Mode Development - Data Dummy
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Menampilkan data contoh untuk testing tampilan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {totalQuizzes > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size="14" className="text-teal-600" />
              <span className="text-xs font-medium text-gray-600">
                Progress Kuis
              </span>
            </div>
            <span className="text-xs font-bold text-teal-600">
              {completedQuizzes} dari {totalQuizzes} selesai
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Kuis harus dikerjakan secara berurutan
          </p>
        </div>
      )}

      {/* Quiz Grid - Dengan layout yang lebih fokus */}
      <div className={`${isSingleQuiz ? "max-w-2xl mx-auto" : "max-w-6xl mx-auto"}`}>
        <div className={`
          grid
          gap-6
          ${isSingleQuiz 
            ? "grid-cols-1" 
            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          }
        `}>
          {quizList.map((item, index) => {
            const isNextQuiz = !item.is_locked && !item.is_completed && 
              (index === 0 || quizList[index - 1]?.is_completed);
            
            return (
              <div
                key={item.id}
                className={`
                  group relative
                  bg-white
                  rounded-2xl
                  shadow-lg
                  border border-slate-100
                  overflow-hidden
                  transition-all duration-300
                  hover:shadow-2xl
                  hover:-translate-y-1
                  ${isSingleQuiz ? "min-h-[380px]" : "min-h-[340px]"}
                  ${item.is_locked ? "opacity-75" : ""}
                `}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-blue-600"></div>
                
                {/* Locked overlay indicator */}
                {item.is_locked && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <Lock size="12" className="text-gray-500" />
                    </div>
                  </div>
                )}

                <div className="p-5 flex flex-col h-full">
                  {/* Header Badge Level */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 border border-teal-200">
                      <span className="text-[10px] font-semibold text-teal-700 tracking-wide">
                        LEVEL {item.level || index + 1}
                      </span>
                    </div>
                    {item.is_completed ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100">
                        <CheckCircle size="10" className="text-emerald-600" />
                        <span className="text-[9px] font-medium text-emerald-600">
                          Selesai
                        </span>
                      </div>
                    ) : item.is_locked ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                        <Lock size="10" className="text-gray-500" />
                        <span className="text-[9px] font-medium text-gray-500">
                          Terkunci
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100">
                        <Clock size="10" className="text-amber-600" />
                        <span className="text-[9px] font-medium text-amber-600">
                          Siap
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                      {item.judul}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {item.deskripsi || "Tidak ada deskripsi"}
                    </p>
                  </div>

                  {/* Quiz Details */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock size="12" />
                        <span>Durasi</span>
                      </div>
                      <span className="font-semibold text-gray-700">
                        {item.durasi} menit
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <BookOpen size="12" />
                        <span>Jumlah Soal</span>
                      </div>
                      <span className="font-semibold text-gray-700">
                        {item.total_questions} soal
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Award size="12" />
                        <span>Nilai Minimal</span>
                      </div>
                      <span className="font-semibold text-amber-600">
                        {item.passing_score}%
                      </span>
                    </div>

                    {item.is_completed && item.score && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <CheckCircle size="12" />
                          <span>Nilai Anda</span>
                        </div>
                        <span className={`font-bold ${item.score >= item.passing_score ? "text-emerald-600" : "text-red-600"}`}>
                          {item.score}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Locked Message */}
                  {item.is_locked && item.locked_message && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-[10px] text-gray-500 text-center">
                        {item.locked_message}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-auto pt-2">
                    <button
                      onClick={() => {
                        if (!item.is_locked && (isNextQuiz || item.can_retake)) {
                          navigate(`/peserta/kuis-kompetensi/${item.id}`);
                        }
                      }}
                      disabled={item.is_locked || (!isNextQuiz && !item.is_completed)}
                      className={`
                        w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 
                        flex items-center justify-center gap-2
                        ${item.is_locked 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : item.is_completed && item.score >= item.passing_score
                            ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                            : item.can_retake
                              ? "bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg"
                              : "bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-lg hover:shadow-teal-500/20"
                        }
                      `}
                    >
                      {item.is_locked ? (
                        <>
                          <Lock size="14" />
                          Terkunci
                        </>
                      ) : item.is_completed && item.score >= item.passing_score ? (
                        <>
                          <CheckCircle size="14" />
                          Lulus
                        </>
                      ) : item.can_retake ? (
                        <>
                          <Zap size="14" />
                          Ulangi Kuis
                        </>
                      ) : (
                        <>
                          <PlayCircle size="14" />
                          Mulai Kuis
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {quizList.length === 0 && !backendError && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 py-16 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList size="32" className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium text-base">
            Belum ada kuis tersedia
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Kuis akan muncul setelah COO menambahkan kuis kompetensi
          </p>
        </div>
      )}
    </div>
  );
}

export default DaftarKuisKompetensi;