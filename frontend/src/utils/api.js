const API_URL = "http://localhost:8000/api";

// ✅ ambil token yang benar
const getToken = () => localStorage.getItem("token");

// helper header
const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getToken();

  console.log(
    "Token being sent:",
    token ? "Yes (length: " + token.length + ")" : "No ❌"
  );

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// helper response
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      console.error("Error response from server:", errorData);
      
      if (errorData.errors) {
        errorDetails = errorData.errors;
        const firstError = Object.values(errorData.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else {
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
    } catch {
      errorMessage = `HTTP error! ${response.status}: ${response.statusText}`;
    }

    const error = new Error(errorMessage);
    error.errors = errorDetails;
    throw error;
  }

  const data = await response.json();
  console.log("API Response success:", data);
  return data;
};

// Helper untuk mendapatkan URL file yang bisa diakses
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  if (filePath.includes('videos/') || filePath.includes('documents/')) {
    return `http://localhost:8000/storage/${filePath}`;
  }
  const filename = filePath.split('/').pop();
  return `http://localhost:8000/api/materi-file/${filename}`;
};

// Helper untuk mendapatkan URL video
const getVideoUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  return `http://localhost:8000/storage/${filePath}`;
};

// ================= API =================
export const api = {
  // ================= AUTH =================
  async login(data) {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  async logout() {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  async getMe() {
    const response = await fetch(`${API_URL}/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getAllUsers() {
    const response = await fetch(`${API_URL}/users`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= DIVISI =================
  async getDivisi() {
    const response = await fetch(`${API_URL}/divisi`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async addDivisi(data) {
    const response = await fetch(`${API_URL}/divisi`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateDivisi(id, data) {
    const response = await fetch(`${API_URL}/divisi/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteDivisi(id) {
    const response = await fetch(`${API_URL}/divisi/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= PESERTA =================
  async getPeserta() {
    const response = await fetch(`${API_URL}/peserta`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async addPeserta(data) {
    console.log("Sending peserta data to API:", data);
    const response = await fetch(`${API_URL}/peserta`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updatePeserta(id, data) {
    const response = await fetch(`${API_URL}/peserta/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deletePeserta(id) {
    const response = await fetch(`${API_URL}/peserta/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= MENTOR =================
  async getMentors() {
    const response = await fetch(`${API_URL}/mentors`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async addMentor(data) {
    console.log("Sending mentor data to API:", data);
    const response = await fetch(`${API_URL}/mentors`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateMentor(id, data) {
    const response = await fetch(`${API_URL}/mentors/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteMentor(id) {
    const response = await fetch(`${API_URL}/mentors/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= MENTOR - PESERTA BIMBINGAN =================
  
  async getMyPesertas() {
    const response = await fetch(`${API_URL}/mentor/pesertas`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getDetailPeserta(id_peserta) {
    const response = await fetch(`${API_URL}/mentor/pesertas/${id_peserta}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= MENTOR - FILTERS & PESERTA LIST =================
  
  async getMentorFilters() {
    const response = await fetch(`${API_URL}/mentor/filters`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getMentorPesertaList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/mentor/peserta-list${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= DAILY REPORT =================
  
  async getDailyReport(pesertaId, tanggal) {
    const response = await fetch(`${API_URL}/daily-report/${pesertaId}?tanggal=${tanggal}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async submitDailyReportFeedback(pesertaId, tanggal, feedback) {
    const response = await fetch(`${API_URL}/daily-report/${pesertaId}/feedback`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ tanggal, feedback }),
    });
    return handleResponse(response);
  },

  async exportDailyReport(tanggal) {
    const response = await fetch(`${API_URL}/daily-report/export?tanggal=${tanggal}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= MATERI MENTOR (untuk Mentor membuat materi) =================
  
  async getMentorMateri(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/mentor/materi${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    
    if (result.success && result.data) {
      result.data = result.data.map(item => ({
        ...item,
        file_url: item.file_materi ? getVideoUrl(item.file_materi) : null,
        video_url: item.tipe_materi === 'video' && item.file_materi ? getVideoUrl(item.file_materi) : null,
      }));
    }
    return result;
  },

  async getMentorMateriById(id) {
    const response = await fetch(`${API_URL}/mentor/materi/${id}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    
    if (result.success && result.data) {
      result.data.file_url = result.data.file_materi ? getVideoUrl(result.data.file_materi) : null;
      result.data.video_url = result.data.tipe_materi === 'video' && result.data.file_materi ? getVideoUrl(result.data.file_materi) : null;
    }
    return result;
  },

  async createMentorMateri(formData) {
    const token = getToken();
    const response = await fetch(`${API_URL}/mentor/materi`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  async updateMentorMateri(id, formData) {
    formData.append('_method', 'PUT');
    
    const token = getToken();
    const response = await fetch(`${API_URL}/mentor/materi/${id}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  async deleteMentorMateri(id) {
    const response = await fetch(`${API_URL}/mentor/materi/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getMentorMateriDivisiList() {
    const response = await fetch(`${API_URL}/mentor/materi/divisi-list`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= TUGAS MENTOR =================
  
  async getMentorTugas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/mentor/tugas${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getMentorTugasById(id) {
    const response = await fetch(`${API_URL}/mentor/tugas/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createMentorTugas(formData) {
    const token = getToken();
    const response = await fetch(`${API_URL}/mentor/tugas`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  async updateMentorTugas(id, data) {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const token = getToken();
      const response = await fetch(`${API_URL}/mentor/tugas/${id}`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: data,
      });
      return handleResponse(response);
    } else {
      const response = await fetch(`${API_URL}/mentor/tugas/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    }
  },

  async deleteMentorTugas(id) {
    const response = await fetch(`${API_URL}/mentor/tugas/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async sendTugasReminder(tugasId = null) {
    const url = tugasId ? `${API_URL}/mentor/tugas/${tugasId}/reminder` : `${API_URL}/mentor/tugas/reminder`;
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getTugasSubmissions(tugasId) {
    const response = await fetch(`${API_URL}/mentor/tugas/${tugasId}/submissions`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async updateTugasSubmission(submissionId, data) {
    const response = await fetch(`${API_URL}/mentor/tugas/submissions/${submissionId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // ================= LAPORAN AKHIR (MENTOR) =================
  
  async getMentorLaporanAkhir(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/mentor/laporan-akhir${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async submitLaporanReview(id, data) {
    const response = await fetch(`${API_URL}/mentor/laporan-akhir/${id}/review`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async exportLaporanAkhir() {
    const response = await fetch(`${API_URL}/mentor/laporan-akhir/export`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= NILAI (MENTOR) =================
  
  async getMentorNilai(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/mentor/nilai${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async saveMentorNilai(data) {
    const response = await fetch(`${API_URL}/mentor/nilai`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async finalizeMentorNilai(id) {
    const response = await fetch(`${API_URL}/mentor/nilai/${id}/finalize`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async exportMentorNilai() {
    const response = await fetch(`${API_URL}/mentor/nilai/export`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= JAM KERJA (WORKING HOURS) =================
  async getJamKerja() {
    const response = await fetch(`${API_URL}/jam-kerja`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createJamKerja(data) {
    const response = await fetch(`${API_URL}/jam-kerja`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateJamKerja(id, data) {
    const response = await fetch(`${API_URL}/jam-kerja/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteJamKerja(id) {
    const response = await fetch(`${API_URL}/jam-kerja/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= HARI LIBUR (HOLIDAYS) =================
  async getHariLibur() {
    const response = await fetch(`${API_URL}/hari-libur`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createHariLibur(data) {
    const response = await fetch(`${API_URL}/hari-libur`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateHariLibur(id, data) {
    const response = await fetch(`${API_URL}/hari-libur/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteHariLibur(id) {
    const response = await fetch(`${API_URL}/hari-libur/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // ================= MATERI PELATIHAN (untuk COO/Admin) =================
  
  async getMateri() {
    const response = await fetch(`${API_URL}/materi-pelatihan`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    
    if (result.success && result.data) {
      result.data = result.data.map(item => ({
        ...item,
        file_url: getFileUrl(item.file_materi || item.file_url || item.file_path),
        file_materi: getFileUrl(item.file_materi || item.file_url || item.file_path),
      }));
    }
    return result;
  },

  async getMateriById(id) {
    try {
      const response = await fetch(`${API_URL}/materi-pelatihan/${id}`, {
        headers: getHeaders(),
      });
      const result = await handleResponse(response);
      if (result.success && result.data) {
        result.data.file_url = getFileUrl(result.data.file_materi || result.data.file_url);
      }
      return result;
    } catch (error) {
      console.error("Error fetching materi by id:", error);
      return { success: false, message: error.message };
    }
  },

  async addMateri(formData) {
    const token = getToken();

    console.log("=== Sending Materi Data ===");
    for (let pair of formData.entries()) {
      if (pair[0] === 'file') {
        console.log(`${pair[0]}: ${pair[1].name} (${pair[1].size} bytes, ${pair[1].type})`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }

    const response = await fetch(`${API_URL}/materi-pelatihan`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! ${response.status}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        
        if (errorData.errors) {
          errorDetails = errorData.errors;
          const firstError = Object.values(errorData.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else {
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch (e) {
        errorMessage = `HTTP error! ${response.status}: ${response.statusText}`;
      }
      
      const error = new Error(errorMessage);
      error.errors = errorDetails;
      throw error;
    }

    const data = await response.json();
    console.log("API Response success:", data);
    
    return { success: true, data: data.data || data };
  },

  async updateMateri(id, formData) {
    const token = getToken();
    formData.append('_method', 'PUT');
    
    const response = await fetch(`${API_URL}/materi-pelatihan/${id}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  async deleteMateri(id) {
    const response = await fetch(`${API_URL}/materi-pelatihan/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getMateriByDivisi(divisi) {
    const response = await fetch(`${API_URL}/materi-pelatihan/divisi/${encodeURIComponent(divisi)}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    
    if (result.success && result.data) {
      result.data = result.data.map(item => ({
        ...item,
        file_url: getFileUrl(item.file_materi || item.file_url),
      }));
    }
    return result;
  },

  async downloadMateri(id) {
    const token = getToken();
    const response = await fetch(`${API_URL}/materi-pelatihan/${id}/download`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    return response.blob();
  },

  getFileUrl,
  getVideoUrl,

  // ================= QUIZ =================
  
  async getQuiz() {
    const response = await fetch(`${API_URL}/quiz`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result;
  },

  async getQuizById(id) {
    const response = await fetch(`${API_URL}/quiz/${id}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result;
  },

  async createQuiz(data) {
    const response = await fetch(`${API_URL}/quiz`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result;
  },

  async updateQuiz(id, data) {
    const response = await fetch(`${API_URL}/quiz/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result;
  },

  async deleteQuiz(id) {
    const response = await fetch(`${API_URL}/quiz/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result;
  },

  async getQuizByDivisi(divisi) {
    const response = await fetch(`${API_URL}/quiz/divisi/${encodeURIComponent(divisi)}`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result;
  },

  async submitQuiz(quizId, answers) {
    const response = await fetch(`${API_URL}/quiz/${quizId}/submit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ answers }),
    });
    const result = await handleResponse(response);
    return result;
  },

  async getQuizResults(quizId) {
    const response = await fetch(`${API_URL}/quiz/${quizId}/results`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result;
  },

  async importQuiz(formData) {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/quiz/import`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  async downloadQuizTemplate() {
    const token = getToken();
    const response = await fetch(`${API_URL}/quiz/template/download`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Download template failed: ${response.status}`);
    }
    
    return response.blob();
  },
};

export default api;