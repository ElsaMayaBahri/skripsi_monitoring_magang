import axios from "axios";

const API_URL = "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false, // pakai token Bearer, bukan cookie
  timeout: 10000, // optional biar ga ngegantung
});

// ================= REQUEST INTERCEPTOR =================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("Token dipakai:", token);

    // ✅ pastikan headers selalu ada
    config.headers = config.headers || {};

    // ✅ set header default
    config.headers["Accept"] = "application/json";
    config.headers["Content-Type"] = "application/json";

    // ✅ attach token kalau ada
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

// ================= RESPONSE INTERCEPTOR =================
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("RESPONSE ERROR:", error.response || error);

    // ✅ handle unauthorized
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Token mungkin invalid / expired");

      // hapus session
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      // ⚠️ jangan redirect kalau lagi di login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;