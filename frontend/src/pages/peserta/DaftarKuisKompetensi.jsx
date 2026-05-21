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
} from "lucide-react";
import { getDaftarKuisKompetensi } from "../../api/peserta/quizKompetensiService";

function DaftarKuisKompetensi() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizList, setQuizList] = useState([]);
  const [backendError, setBackendError] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null); // Untuk debugging

  useEffect(() => {
    loadQuizList();
  }, []);

  const loadQuizList = async () => {
    setLoading(true);
    setBackendError(false);

    try {
      const response = await getDaftarKuisKompetensi();

      // DEBUG: Log response lengkap
      console.log("Full Response:", response);
      console.log("Response.data:", response.data);
      console.log("Type of response.data:", typeof response.data);
      console.log("Is array?", Array.isArray(response.data));

      // Simpan debug info
      setDebugInfo(response.debug || null);

      // PERBAIKAN: Cek struktur response dengan lebih baik
      if (response.success) {
        let quizData = [];

        // Jika response.data adalah array
        if (Array.isArray(response.data)) {
          quizData = response.data;
        }
        // Jika response.data adalah object dengan property data
        else if (
          response.data &&
          typeof response.data === "object" &&
          Array.isArray(response.data.data)
        ) {
          quizData = response.data.data;
        }
        // Jika response.data adalah object biasa (bukan array)
        else if (
          response.data &&
          typeof response.data === "object" &&
          !Array.isArray(response.data)
        ) {
          // Coba konversi object values ke array
          quizData = Object.values(response.data);
          console.log("Converted object to array:", quizData);
        }

        if (quizData.length > 0) {
          const formattedData = quizData.map((item) => ({
            id: item.id_kuis || item.id,
            id_kuis: item.id_kuis || item.id,
            judul: item.judul || item.title || "Tanpa Judul",
            deskripsi: item.deskripsi || "",
            durasi: item.durasi || 0,
            passing_score: item.passing_score || item.passing || 75,
            total_questions: item.total_soal || item.total_questions || 0,
            level: item.level || 1,
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
          }));

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
        deskripsi:
          "Uji pemahaman Anda tentang dasar-dasar JavaScript untuk kompetensi",
        durasi: 30,
        passing_score: 70,
        total_questions: 10,
        is_completed: false,
        score: null,
      },
      {
        id: 2,
        judul: "React JS Dasar",
        deskripsi: "Uji pemahaman Anda tentang React JS untuk ujian kompetensi",
        durasi: 45,
        passing_score: 75,
        total_questions: 15,
        is_completed: true,
        score: 85,
      },
      {
        id: 3,
        judul: "Tailwind CSS",
        deskripsi:
          "Uji pemahaman Anda tentang Tailwind CSS untuk ujian praktik",
        durasi: 30,
        passing_score: 70,
        total_questions: 10,
        is_completed: false,
        score: null,
      },
      {
        id: 4,
        judul: "State Management Redux",
        deskripsi: "Uji pemahaman Anda tentang Redux untuk manajemen state",
        durasi: 45,
        passing_score: 70,
        total_questions: 12,
        is_completed: false,
        score: null,
      },
      {
        id: 5,
        judul: "Next.js Framework",
        deskripsi: "Uji pemahaman Anda tentang Next.js untuk fullstack React",
        durasi: 60,
        passing_score: 75,
        total_questions: 15,
        is_completed: false,
        score: null,
      },
    ];
    setQuizList(dummyQuizList);
  };

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
              <h1 className="text-base font-bold">Daftar Kuis Kompetensi</h1>
              <p className="text-white/80 text-xs mt-0.5">
                Pilih kuis kompetensi yang ingin Anda kerjakan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel - Tambahkan untuk debugging */}
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
                ⚠️ Catatan untuk Backend Developer
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Halaman ini MASIH menggunakan DATA DUMMY. Backend perlu membuat
                3 endpoint API:
              </p>
              <div className="bg-amber-100 rounded-md p-2 mt-2 font-mono text-xs">
                <p>1. GET /api/peserta/kuis-kompetensi</p>
                <p>2. GET /api/peserta/kuis-kompetensi/{`{id}`}/soal</p>
                <p>3. POST /api/peserta/kuis-kompetensi/{`{id}`}/submit</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistik Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <ClipboardList size="16" className="text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Kuis</p>
              <p className="text-xl font-bold text-gray-800">
                {quizList.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle size="16" className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Kuis Selesai</p>
              <p className="text-xl font-bold text-emerald-600">
                {quizList.filter((q) => q.is_completed).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock size="16" className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Belum Dikerjakan</p>
              <p className="text-xl font-bold text-amber-600">
                {quizList.filter((q) => !q.is_completed).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {quizList.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <BookOpen size="14" className="text-teal-600" />
                  </div>
                </div>
                {item.is_completed ? (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100">
                    <CheckCircle size="8" className="text-emerald-600" />
                    <span className="text-[8px] font-medium text-emerald-600">
                      Selesai
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100">
                    <Clock size="8" className="text-amber-600" />
                    <span className="text-[8px] font-medium text-amber-600">
                      Belum
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
                {item.judul}
              </h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {item.deskripsi}
              </p>

              <div className="mb-3 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">Durasi</span>
                  <span className="font-medium text-gray-700">
                    {item.durasi} menit
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">Soal</span>
                  <span className="font-medium text-gray-700">
                    {item.total_questions} soal
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">Minimal</span>
                  <span className="font-medium text-amber-600">
                    {item.passing_score}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">Materi</span>
                  <span
                    className={`font-medium ${
                      item.materi_completed
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {item.total_materi_selesai}/{item.total_materi} selesai
                  </span>
                </div>

                {item.is_completed && item.score && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">Nilai</span>
                    <span className="font-bold text-emerald-600">
                      {item.score}%
                    </span>
                  </div>
                )}
              </div>

              {item.is_locked && (
                <p className="mt-2 text-[10px] text-red-500">
                  {item.locked_message}
                </p>
              )}

              <button
                onClick={() => {
                  if (!item.is_locked) {
                    navigate(`/peserta/kuis-kompetensi/${item.id}`);
                  }
                }}
                className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                  item.is_locked
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : item.is_passed
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : item.can_retake
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md hover:shadow-lg"
                }`}
                disabled={item.is_locked}
              >
                {item.is_locked ? (
                  <>
                    <Clock size="12" />
                    Terkunci
                  </>
                ) : item.is_passed ? (
                  <>
                    <CheckCircle size="12" />
                    Lulus
                  </>
                ) : item.can_retake ? (
                  <>
                    <Zap size="12" />
                    Ulangi Kuis
                  </>
                ) : (
                  <>
                    <Zap size="12" />
                    Mulai Kuis
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {quizList.length === 0 && !backendError && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 py-10 text-center">
          <ClipboardList size="40" className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium text-sm">
            Belum ada kuis tersedia
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Kuis akan muncul setelah COO menambahkan kuis kompetensi
          </p>
        </div>
      )}
    </div>
  );
}

export default DaftarKuisKompetensi;
