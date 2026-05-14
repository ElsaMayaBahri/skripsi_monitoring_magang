// src/api/peserta/nilaiService.js
import api from "../axios"

/**
 * Get nilai akhir peserta
 * GET /api/peserta/nilai-akhir
 */
export const getNilaiAkhir = async () => {
  try {
    const response = await api.get("/peserta/nilai-akhir")
    return response.data
  } catch (error) {
    console.error("Error fetching nilai akhir:", error)
    throw error
  }
}

/**
 * Download sertifikat
 * GET /api/peserta/sertifikat/download
 */
export const downloadSertifikat = async () => {
  try {
    const response = await api.get("/peserta/sertifikat/download", {
      responseType: "blob"
    })
    return response.data
  } catch (error) {
    console.error("Error downloading sertifikat:", error)
    throw error
  }
}

/**
 * Download transkrip nilai
 * GET /api/peserta/transkrip/download
 */
export const downloadTranskrip = async () => {
  try {
    const response = await api.get("/peserta/transkrip/download", {
      responseType: "blob"
    })
    return response.data
  } catch (error) {
    console.error("Error downloading transkrip:", error)
    throw error
  }
}