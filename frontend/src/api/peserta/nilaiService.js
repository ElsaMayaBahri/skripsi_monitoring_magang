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
 * Get sertifikat magang template (khusus untuk sertifikat magang)
 * GET /api/sertifikat/magang/template
 */
export const getSertifikatMagangTemplate = async () => {
  try {
    // 🔥 PASTIKAN panggil endpoint yang BENAR: /sertifikat/magang/template
    const response = await api.get("/sertifikat/magang/template")
    return response.data
  } catch (error) {
    console.error("Error fetching sertifikat magang template:", error)
    throw error
  }
}

/**
 * Download file template sertifikat
 * GET /storage/{file_path}
 */
export const downloadTemplateFile = async (filePath) => {
  try {
    const response = await api.get(`/storage/${filePath}`, {
      responseType: "blob"
    })
    return response.data
  } catch (error) {
    console.error("Error downloading template file:", error)
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