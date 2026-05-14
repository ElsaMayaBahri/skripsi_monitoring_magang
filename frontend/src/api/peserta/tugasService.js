// src/api/peserta/tugasService.js
import axiosInstance from "../axios";

/**
 * Get all tugas untuk peserta
 * GET /api/peserta/tugas
 */
export const getPesertaTugas = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const url = `/peserta/tugas${queryString ? `?${queryString}` : ''}`
  
  console.log("[DEBUG] getPesertaTugas - URL:", url)
  console.log("[DEBUG] getPesertaTugas - BaseURL:", axiosInstance.defaults.baseURL)
  console.log("[DEBUG] getPesertaTugas - Token:", localStorage.getItem("token") ? "Ada" : "Tidak ada")
  
  try {
    const response = await axiosInstance.get(url)
    console.log("[DEBUG] getPesertaTugas - Response:", response.data)
    
    // Handle berbagai kemungkinan struktur response
    let responseData = []
    if (response.data) {
      if (Array.isArray(response.data)) {
        responseData = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        responseData = response.data.data
      } else if (response.data.tugas && Array.isArray(response.data.tugas)) {
        responseData = response.data.tugas
      } else if (response.data.results && Array.isArray(response.data.results)) {
        responseData = response.data.results
      } else {
        responseData = []
      }
    }
    
    return {
      success: true,
      data: responseData,
      message: response.data?.message || "Berhasil mengambil data tugas"
    }
  } catch (error) {
    console.error("[DEBUG] getPesertaTugas - Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    
    let errorMessage = "Gagal mengambil data tugas"
    let isNetworkError = false
    
    if (error.code === "ERR_NETWORK") {
      errorMessage = "Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:8000"
      isNetworkError = true
    } else if (error.response?.status === 401) {
      errorMessage = "Sesi Anda telah berakhir. Silakan login kembali."
    } else if (error.response?.status === 404) {
      errorMessage = "Endpoint tidak ditemukan. Backend perlu membuat: GET /api/peserta/tugas"
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    return {
      success: false,
      data: [],
      message: errorMessage,
      isNetworkError: isNetworkError
    }
  }
}

/**
 * Get detail tugas by ID
 * GET /api/peserta/tugas/{id}
 */
export const getPesertaTugasById = async (id) => {
  const url = `/peserta/tugas/${id}`
  console.log("[DEBUG] getPesertaTugasById - URL:", url)
  
  try {
    const response = await axiosInstance.get(url)
    let responseData = response.data?.data || response.data
    return {
      success: true,
      data: responseData,
      message: response.data?.message || "Berhasil mengambil detail tugas"
    }
  } catch (error) {
    console.error("[DEBUG] getPesertaTugasById - Error:", error)
    
    let errorMessage = "Gagal mengambil detail tugas"
    if (error.code === "ERR_NETWORK") {
      errorMessage = "Tidak dapat terhubung ke server"
    } else if (error.response?.status === 404) {
      errorMessage = `Tugas dengan ID ${id} tidak ditemukan`
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    return {
      success: false,
      data: null,
      message: errorMessage
    }
  }
}

/**
 * Submit tugas (upload file)
 * POST /api/peserta/tugas/{id}/submit
 */
export const submitPesertaTugas = async (id, formData) => {
  const url = `/peserta/tugas/${id}/submit`
  console.log("[DEBUG] submitPesertaTugas - URL:", url)
  
  try {
    const response = await axiosInstance.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || "Tugas berhasil dikumpulkan"
    }
  } catch (error) {
    console.error("[DEBUG] submitPesertaTugas - Error:", error)
    
    let errorMessage = "Gagal mengumpulkan tugas"
    if (error.code === "ERR_NETWORK") {
      errorMessage = "Tidak dapat terhubung ke server"
    } else if (error.response?.status === 404) {
      errorMessage = "Endpoint tidak ditemukan. Backend perlu membuat: POST /api/peserta/tugas/{id}/submit"
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    return {
      success: false,
      data: null,
      message: errorMessage
    }
  }
}

/**
 * Get submission history untuk tugas
 * GET /api/peserta/tugas/{id}/submission
 */
export const getPesertaTugasSubmission = async (id) => {
  const url = `/peserta/tugas/${id}/submission`
  console.log("[DEBUG] getPesertaTugasSubmission - URL:", url)
  
  try {
    const response = await axiosInstance.get(url)
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || "Berhasil mengambil riwayat pengumpulan"
    }
  } catch (error) {
    console.error("[DEBUG] getPesertaTugasSubmission - Error:", error)
    
    let errorMessage = "Gagal mengambil riwayat pengumpulan"
    if (error.code === "ERR_NETWORK") {
      errorMessage = "Tidak dapat terhubung ke server"
    } else if (error.response?.status === 404) {
      errorMessage = "Endpoint tidak ditemukan. Backend perlu membuat: GET /api/peserta/tugas/{id}/submission"
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    return {
      success: false,
      data: null,
      message: errorMessage
    }
  }
}