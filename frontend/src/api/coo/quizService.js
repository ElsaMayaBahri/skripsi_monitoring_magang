import api from "../axios";

// Get all quiz
export const getQuiz = async () => {
  try {
    const response = await api.get('/quiz');
    return response.data;
  } catch (error) {
    console.error("Error getting quiz:", error);
    throw error;
  }
};

// Get quiz by ID
export const getQuizDetail = async (id) => {
  try {
    const response = await api.get(`/quiz/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting quiz detail:", error);
    throw error;
  }
};

// Create new quiz
export const createQuiz = async (data) => {
  try {
    const response = await api.post('/quiz', data);
    return response.data;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
};

// Update quiz
export const updateQuiz = async (id, data) => {
  try {
    const response = await api.put(`/quiz/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
};

// Delete quiz
export const deleteQuiz = async (id) => {
  try {
    const response = await api.delete(`/quiz/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
};

// Import quiz from Excel/CSV
export const importQuiz = async (formData) => {
  try {
    const response = await api.post('/quiz/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error importing quiz:", error);
    throw error;
  }
};

// Download template for quiz import
export const downloadQuizTemplate = async () => {
  try {
    const response = await api.get('/quiz/template', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading quiz template:", error);
    throw error;
  }
};

// Alias untuk getAllQuiz (kompatibilitas dengan Quiz.jsx)
export const getAllQuiz = getQuiz;

// Di quizService.js - jika pakai dummy mode, tambahkan level di dummy data
const dummyQuizList = [
  {
    id: 1,
    judul_kuis: "Pengenalan Budaya Perusahaan",
    divisi: "Semua Divisi",
    durasi: 30,
    total_soal: 20,
    status: "aktif",
    level: 1,  // <-- TAMBAHKAN
    // ...
  },
  {
    id: 2,
    judul_kuis: "Kompetensi IT Dasar",
    divisi: "IT",
    durasi: 45,
    total_soal: 30,
    status: "aktif",
    level: 2,  // <-- TAMBAHKAN
    // ...
  },
];