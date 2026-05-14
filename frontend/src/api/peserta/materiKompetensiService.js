// src/api/peserta/materiKompetensiService.js
import axiosInstance from "../axios"

/**
 * Get all materi kompetensi for peserta (dari COO)
 * GET /api/peserta/materi-kompetensi
 */
export const getMateriKompetensi = async () => {
  try {
    const response = await axiosInstance.get("/peserta/materi-kompetensi")
    return response.data
  } catch (error) {
    console.error("Error fetching materi kompetensi:", error)
    return { success: false, message: error.message, data: [] }
  }
}

/**
 * Get single materi kompetensi by ID
 * GET /api/peserta/materi-kompetensi/{id}
 */
export const getMateriKompetensiById = async (id) => {
  try {
    const response = await axiosInstance.get(`/peserta/materi-kompetensi/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching materi kompetensi detail:", error)
    throw error
  }
}

/**
 * Mark materi kompetensi as accessed
 * POST /api/peserta/materi-kompetensi/{id}/akses
 */
export const markMateriKompetensiAccessed = async (id) => {
  try {
    const response = await axiosInstance.post(`/peserta/materi-kompetensi/${id}/akses`)
    return response.data
  } catch (error) {
    console.error("Error marking materi kompetensi as accessed:", error)
    return { success: false, message: error.message }
  }
}