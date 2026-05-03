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
  const filename = filePath.split('/').pop();
  return `http://localhost:8000/api/materi-file/${filename}`;
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

  // ================= MATERI PELATIHAN =================
  
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