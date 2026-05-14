// src/api/peserta/sertifikatService.js
import axiosInstance from "../axios"

/**
 * Get certificate eligibility and data
 * GET /api/peserta/sertifikat
 */
export const getSertifikatData = async () => {
  try {
    const response = await axiosInstance.get("/peserta/sertifikat")
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
    const response = await axiosInstance.get("/peserta/sertifikat/requirements")
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
    const response = await axiosInstance.get("/peserta/sertifikat/download", {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error("Error downloading certificate:", error)
    throw error
  }
}