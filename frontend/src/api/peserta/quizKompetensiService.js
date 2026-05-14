// src/api/peserta/quizKompetensiService.js
import axiosInstance from "../axios"

/**
 * Get all quizzes list for kompetensi
 * GET /api/peserta/kuis-kompetensi
 */
export const getDaftarKuisKompetensi = async () => {
  try {
    const response = await axiosInstance.get("/peserta/kuis-kompetensi")
    return response.data
  } catch (error) {
    console.error("Error fetching daftar kuis:", error)
    return { success: false, message: error.message, data: [] }
  }
}

/**
 * Get quiz questions by ID
 * GET /api/peserta/kuis-kompetensi/{id}/soal
 */
export const getSoalKuisKompetensi = async (id) => {
  try {
    const response = await axiosInstance.get(`/peserta/kuis-kompetensi/${id}/soal`)
    return response.data
  } catch (error) {
    console.error("Error fetching soal kuis:", error)
    return { success: false, message: error.message }
  }
}

/**
 * Submit quiz answers
 * POST /api/peserta/kuis-kompetensi/{id}/submit
 */
export const submitJawabanKuisKompetensi = async (id, jawaban) => {
  try {
    const response = await axiosInstance.post(`/peserta/kuis-kompetensi/${id}/submit`, { jawaban })
    return response.data
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return { success: false, message: error.message }
  }
}