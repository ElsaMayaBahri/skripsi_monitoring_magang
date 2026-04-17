// API Helper untuk mengakses backend Laravel
const API_URL = "http://localhost:8000/api";

// Helper untuk mendapatkan token dari localStorage
const getToken = () => localStorage.getItem("auth_token");

// Helper untuk header request
const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getToken();
  console.log(
    "Token being sent:",
    token ? "Yes (length: " + token.length + ")" : "No",
  );

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("No auth_token found in localStorage");
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  // Check if response is OK
  if (!response.ok) {
    // Try to get error message from response
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // If response is not JSON, get text
      const text = await response.text();
      console.error("Non-JSON response:", text.substring(0, 200));
      errorMessage = `Server error: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  // Parse JSON response
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON response:", text.substring(0, 200));
    throw new Error("Server returned non-JSON response");
  }

  return response.json();
};

// API Functions
export const api = {
  // Mentor
  async getMentors() {
    const response = await fetch(`${API_URL}/mentors`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Peserta
  async getPeserta() {
    const response = await fetch(`${API_URL}/peserta`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async addPeserta(pesertaData) {
    const response = await fetch(`${API_URL}/peserta`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(pesertaData),
    });

    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    return handleResponse(response);
  },

  async updatePeserta(id, pesertaData) {
    const response = await fetch(`${API_URL}/peserta/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(pesertaData),
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

  async getDivisiList() {
    const response = await fetch(`${API_URL}/divisi-list`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getMentorList() {
    const response = await fetch(`${API_URL}/mentor-list`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async addMentor(mentorData) {
    const response = await fetch(`${API_URL}/mentors`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(mentorData),
    });

    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }

    return handleResponse(response);
  },

  async updateMentor(id, mentorData) {
    console.log("Sending update mentor request:", {
      url: `${API_URL}/mentors/${id}`,
      method: "PUT",
      data: mentorData,
    });

    const response = await fetch(`${API_URL}/mentors/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(mentorData),
    });

    // Log response status
    console.log("Response status:", response.status);

    // Jika error 422, ambil detail validation errors
    if (response.status === 422) {
      const errorData = await response.json();
      console.error("Validation errors:", errorData.errors);
      throw new Error(errorData.message || "Validation failed");
    }

    return handleResponse(response);
  },

  async deleteMentor(id) {
    const response = await fetch(`${API_URL}/mentors/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  //Divisi
   async getDivisi() {
    const response = await fetch(`${API_URL}/divisi`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async addDivisi(divisiData) {
    const response = await fetch(`${API_URL}/divisi`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(divisiData),
    });

    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    return handleResponse(response);
  },

  async updateDivisi(id, divisiData) {
    const response = await fetch(`${API_URL}/divisi/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(divisiData),
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

  // Auth
  async login(credentials) {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
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
};

// Untuk kompatibilitas dengan kode lama
export const getUsers = () => api.getMentors();
export const addUser = (user) => api.addMentor(user);
export const updateUser = (id, user) => api.updateMentor(id, user);
export const deleteUser = (id) => api.deleteMentor(id);
export const getDivisi = () => api.getDivisiList();
