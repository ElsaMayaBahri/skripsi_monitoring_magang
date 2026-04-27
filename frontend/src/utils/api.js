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
      
      // Tangkap detail validasi error
      if (errorData.errors) {
        errorDetails = errorData.errors;
        // Ambil pesan error pertama dari validasi
        const firstError = Object.values(errorData.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else {
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
    } catch {
      // Jika response bukan JSON
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

  // ================= USER UMUM =================
  async getUserById(id) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async updateUserStatus(id, status) {
    const response = await fetch(`${API_URL}/users/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

// ================= MATERI PELATIHAN =================
async getMateri() {
  const response = await fetch(`${API_URL}/materi`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
},

getMateriById: async (id) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/materi/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching materi by id:", error)
    return { success: false, message: error.message }
  }
},

async addMateri(formData) {
  const token = getToken();

  const response = await fetch(`${API_URL}/materi`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.errors) {
        const firstError = Object.values(errorData.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else {
        errorMessage = errorData.message || errorData.error || errorMessage;
      }
    } catch (e) {
      errorMessage = `HTTP error! ${response.status}: ${response.statusText}`;
    }
    const error = new Error(errorMessage);
    throw error;
  }

  const data = await response.json();
  console.log("API Response success:", data);

  // ✅ Selalu return dengan properti success
  return { success: true, data };
},

async updateMateri(id, formData) {
  const token = getToken();
  
  // Add _method for Laravel to handle as PUT
  formData.append('_method', 'PUT');
  
  const response = await fetch(`${API_URL}/materi/${id}`, {
    method: "POST", // Use POST with _method=PUT for file upload
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  });
  
  return handleResponse(response);
},

async deleteMateri(id) {
  const response = await fetch(`${API_URL}/materi/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
},

async getMateriByDivisi(divisi) {
  const response = await fetch(`${API_URL}/materi-divisi/${divisi}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
}, 
};