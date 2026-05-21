// src/api/axios.js
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor untuk token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // TAMBAHKAN: Debug logging
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    console.log("[API Request] Headers:", config.headers);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk response
axiosInstance.interceptors.response.use(
  (response) => {
    // TAMBAHKAN: Debug logging untuk response
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`);
    console.log("[API Response] Status:", response.status);
    console.log("[API Response] Data:", response.data);
    
    return response;
  },
  (error) => {
    // TAMBAHKAN: Debug logging untuk error
    console.error("[API Error] Config:", error.config);
    console.error("[API Error] Response:", error.response);
    console.error("[API Error] Message:", error.message);
    
    if (error.response?.status === 401 && !error.config?.url?.includes("/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;