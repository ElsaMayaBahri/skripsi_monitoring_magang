// src/api/coo/daftarHasilKuisService.js
import api from "../axios";

// SET ke false jika backend sudah siap
const USE_DUMMY_DATA = true;

// DUMMY DATA - Daftar Semua Hasil Kuis Peserta
const dummyAllResults = [
  {
    id: 1,
    user_name: "Ahmad Rizki",
    user_email: "ahmad.rizki@example.com",
    user_divisi: "Product Design",
    quiz_id: 1,
    quiz_title: "Pengenalan Budaya Perusahaan",
    score: 85,
    status: "lulus",
    passing_grade: 75,
    total_soal: 20,
    jawaban_benar: 17,
    created_at: "2024-01-20T10:30:00.000Z"
  },
  {
    id: 2,
    user_name: "Siti Nurhaliza",
    user_email: "siti.nur@example.com",
    user_divisi: "Product Design",
    quiz_id: 1,
    quiz_title: "Pengenalan Budaya Perusahaan",
    score: 92,
    status: "lulus",
    passing_grade: 75,
    total_soal: 20,
    jawaban_benar: 18,
    created_at: "2024-01-20T11:15:00.000Z"
  },
  {
    id: 3,
    user_name: "Budi Santoso",
    user_email: "budi.santoso@example.com",
    user_divisi: "UI/UX Design",
    quiz_id: 2,
    quiz_title: "UX Research Fundamentals",
    score: 68,
    status: "tidak_lulus",
    passing_grade: 70,
    total_soal: 20,
    jawaban_benar: 13,
    created_at: "2024-01-20T09:45:00.000Z"
  },
  {
    id: 4,
    user_name: "Dewi Kartika",
    user_email: "dewi.kartika@example.com",
    user_divisi: "UI/UX Design",
    quiz_id: 2,
    quiz_title: "UX Research Fundamentals",
    score: 78,
    status: "lulus",
    passing_grade: 70,
    total_soal: 20,
    jawaban_benar: 15,
    created_at: "2024-01-20T13:20:00.000Z"
  },
  {
    id: 5,
    user_name: "Eko Prasetyo",
    user_email: "eko.prasetyo@example.com",
    user_divisi: "Product Development",
    quiz_id: 3,
    quiz_title: "Agile Development",
    score: 55,
    status: "tidak_lulus",
    passing_grade: 75,
    total_soal: 20,
    jawaban_benar: 11,
    created_at: "2024-01-20T14:00:00.000Z"
  },
  {
    id: 6,
    user_name: "Fitri Amelia",
    user_email: "fitri.amelia@example.com",
    user_divisi: "Product Development",
    quiz_id: 3,
    quiz_title: "Agile Development",
    score: 88,
    status: "lulus",
    passing_grade: 75,
    total_soal: 20,
    jawaban_benar: 17,
    created_at: "2024-01-20T15:30:00.000Z"
  },
  {
    id: 7,
    user_name: "Gunawan Wijaya",
    user_email: "gunawan@example.com",
    user_divisi: "Digital Marketing",
    quiz_id: 4,
    quiz_title: "Digital Marketing Strategy",
    score: 72,
    status: "tidak_lulus",
    passing_grade: 75,
    total_soal: 20,
    jawaban_benar: 14,
    created_at: "2024-01-21T09:00:00.000Z"
  },
  {
    id: 8,
    user_name: "Hana Pratiwi",
    user_email: "hana.pratiwi@example.com",
    user_divisi: "Digital Marketing",
    quiz_id: 4,
    quiz_title: "Digital Marketing Strategy",
    score: 95,
    status: "lulus",
    passing_grade: 75,
    total_soal: 20,
    jawaban_benar: 19,
    created_at: "2024-01-21T10:15:00.000Z"
  },
  {
    id: 9,
    user_name: "Irfan Hakim",
    user_email: "irfan.hakim@example.com",
    user_divisi: "Finance",
    quiz_id: 5,
    quiz_title: "Financial Management",
    score: 62,
    status: "tidak_lulus",
    passing_grade: 70,
    total_soal: 20,
    jawaban_benar: 12,
    created_at: "2024-01-21T11:00:00.000Z"
  },
  {
    id: 10,
    user_name: "Jasmine Putri",
    user_email: "jasmine@example.com",
    user_divisi: "Finance",
    quiz_id: 5,
    quiz_title: "Financial Management",
    score: 82,
    status: "lulus",
    passing_grade: 70,
    total_soal: 20,
    jawaban_benar: 16,
    created_at: "2024-01-21T13:45:00.000Z"
  }
];

/**
 * Get all quiz results (for COO dashboard)
 * GET /api/quiz/all-results
 */
export const getAllQuizResults = async () => {
  if (USE_DUMMY_DATA) {
    console.log("[DUMMY] getAllQuizResults() - Menggunakan dummy data");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: dummyAllResults,
      total: dummyAllResults.length
    };
  }
  
  try {
    const response = await api.get("/quiz/all-results");
    return response.data;
  } catch (error) {
    console.warn(`[FALLBACK] API /quiz/all-results gagal, menggunakan dummy data`);
    return {
      success: true,
      data: dummyAllResults,
      total: dummyAllResults.length,
      isFallback: true
    };
  }
};

/**
 * Export all quiz results to Excel/CSV
 * GET /api/quiz/results/export
 */
export const exportAllQuizResults = async () => {
  if (USE_DUMMY_DATA) {
    console.log("[DUMMY] exportAllQuizResults() - Simulasi download");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Buat dummy CSV content
    const headers = "No,Nama Peserta,Email,Divisi,Kuis,Nilai,Status,Tanggal\n";
    const rows = dummyAllResults.map((r, idx) => 
      `${idx + 1},${r.user_name},${r.user_email},${r.user_divisi},${r.quiz_title},${r.score},${r.status === "lulus" ? "Lulus" : "Tidak Lulus"},${new Date(r.created_at).toLocaleDateString()}`
    ).join("\n");
    
    const dummyContent = headers + rows;
    const blob = new Blob([dummyContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hasil_kuis_all_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    alert("[DUMMY MODE] File CSV berhasil didownload. Ini adalah data dummy untuk preview.");
    return { success: true };
  }
  
  try {
    const response = await api.get("/quiz/results/export", {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hasil_kuis_all_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.warn("[FALLBACK] Export gagal, menggunakan dummy data");
    const headers = "No,Nama Peserta,Email,Divisi,Kuis,Nilai,Status,Tanggal\n";
    const rows = dummyAllResults.map((r, idx) => 
      `${idx + 1},${r.user_name},${r.user_email},${r.user_divisi},${r.quiz_title},${r.score},${r.status === "lulus" ? "Lulus" : "Tidak Lulus"},${new Date(r.created_at).toLocaleDateString()}`
    ).join("\n");
    
    const dummyContent = headers + rows;
    const blob = new Blob([dummyContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hasil_kuis_all_fallback.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    alert("[FALLBACK] Ekspor menggunakan data dummy karena API belum siap.");
    return { success: true };
  }
};

// Export flag
export const isUsingDummyData = USE_DUMMY_DATA;