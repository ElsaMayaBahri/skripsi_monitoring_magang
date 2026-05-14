// src/api/peserta/materiService.js
import api from "../axios"

/**
 * Get all materi for peserta
 * GET /api/peserta/materi
 */
export const getMateriPeserta = async () => {
  try {
    const response = await api.get("/peserta/materi")
    return response.data
  } catch (error) {
    console.error("Error fetching materi peserta:", error)
    throw error
  }
}

/**
 * Get single materi by ID for peserta
 * GET /api/peserta/materi/{id}
 */
export const getMateriPesertaById = async (id) => {
  try {
    const response = await api.get(`/peserta/materi/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching materi detail:", error)
    throw error
  }
}

/**
 * Mark materi as completed/accessed
 * POST /api/peserta/materi/{id}/selesai
 */
export const tandaiMateriSelesai = async (id) => {
  try {
    const response = await api.post(`/peserta/materi/${id}/selesai`)
    return response.data
  } catch (error) {
    console.error("Error marking materi as completed:", error)
    throw error
  }
}