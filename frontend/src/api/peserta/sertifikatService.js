// src/api/peserta/sertifikatService.js
import api from "../axios"

/**
 * Get certificate eligibility and data
 * GET /api/peserta/sertifikat
 */
export const getSertifikatData = async () => {
  try {
    const response = await api.get("/peserta/sertifikat")
    return response.data
  } catch (error) {
    console.error("Error fetching sertifikat data:", error)
    return { success: false, message: error.message, data: null }
  }
}

/**
 * Check certificate requirements
 * GET /api/peserta/sertifikat/requirements
 */
export const getSertifikatRequirements = async () => {
  try {
    const response = await api.get("/peserta/sertifikat/requirements")
    return response.data
  } catch (error) {
    console.error("Error fetching requirements:", error)
    return { success: false, message: error.message, data: [] }
  }
}

/**
 * Download certificate
 * GET /api/peserta/sertifikat/download
 */
export const downloadSertifikat = async () => {
  try {
    const response = await api.get("/peserta/sertifikat/download", {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error("Error downloading certificate:", error)
    throw error
  }
}

/**
 * Generate Sertifikat Magang
 * POST /api/peserta/sertifikat-magang/generate
 */
export const generateSertifikatMagang = async () => {
  try {
    const response = await api.post("/peserta/sertifikat-magang/generate")
    return response.data
  } catch (error) {
    console.error("Error generating sertifikat magang:", error)
    throw error
  }
}