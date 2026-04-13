import axios from 'axios'

const API_URL = "http://localhost:8000/api"

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Interceptor untuk menambahkan token ke setiap request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor untuk handle response error (token expired)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("role")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default axiosInstance