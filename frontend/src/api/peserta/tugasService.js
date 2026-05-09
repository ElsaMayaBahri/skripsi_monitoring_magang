import axiosInstance from "../../utils/axiosConfig"

// Get all peserta tasks
export const getPesertaTugas = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const url = `/peserta/tugas${queryString ? `?${queryString}` : ''}`
  
  console.log("[DEBUG] getPesertaTugas - URL:", url)
  console.log("[DEBUG] getPesertaTugas - BaseURL:", axiosInstance.defaults.baseURL)
  console.log("[DEBUG] getPesertaTugas - Full URL:", axiosInstance.defaults.baseURL + url)
  console.log("[DEBUG] getPesertaTugas - Token:", localStorage.getItem("token") ? "Ada" : "Tidak ada")
  
  try {
    const response = await axiosInstance.get(url)
    console.log("[DEBUG] getPesertaTugas - Response:", response.data)
    
    // Pastikan response memiliki struktur yang konsisten
    let responseData = []
    if (response.data) {
      // Handle berbagai kemungkinan struktur response
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
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    })
    
    // Kembalikan response yang konsisten meskipun error
    let errorMessage = "Gagal mengambil data tugas"
    if (error.code === "ERR_NETWORK") {
      errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi atau pastikan server backend berjalan di http://localhost:8000"
    } else if (error.response?.status === 401) {
      errorMessage = "Sesi Anda telah berakhir. Silakan login kembali."
    } else if (error.response?.status === 404) {
      errorMessage = "Endpoint tidak ditemukan. Periksa kembali URL API."
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    return {
      success: false,
      data: [],
      message: errorMessage,
      error: error,
      isNetworkError: error.code === "ERR_NETWORK"
    }
  }
}

// Get task by ID
export const getPesertaTugasById = async (id) => {
  const url = `/peserta/tugas/${id}`
  console.log("[DEBUG] getPesertaTugasById - URL:", url)
  
  try {
    const response = await axiosInstance.get(url)
    let responseData = null
    if (response.data) {
      responseData = response.data.data || response.data
    }
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
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    return {
      success: false,
      data: null,
      message: errorMessage,
      error: error
    }
  }
}

// Submit task (upload file)
export const submitPesertaTugas = async (id, formData) => {
  const url = `/peserta/tugas/${id}/submit`
  console.log("[DEBUG] submitPesertaTugas - URL:", url)
  
  try {
    const response = await axiosInstance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
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
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    return {
      success: false,
      data: null,
      message: errorMessage,
      error: error
    }
  }
}

// Get task submission history
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
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    return {
      success: false,
      data: null,
      message: errorMessage,
      error: error
    }
  }
}
