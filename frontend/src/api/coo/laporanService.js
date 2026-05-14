import axiosInstance from "../axios"
// Get attendance report
export const getLaporanPresensi = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/laporan/presensi${queryString ? `?${queryString}` : ''}`)
  return response.data
}

// Export attendance report to PDF
export const exportLaporanPresensi = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/laporan/presensi/export${queryString ? `?${queryString}` : ''}`, {
    responseType: "blob",
  })
  return response.data
}

// Get report statistics
export const getLaporanStats = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/laporan/presensi/stats${queryString ? `?${queryString}` : ''}`)
  return response.data
}

// Get all divisions for filter
export const getAllDivisi = async () => {
  const response = await axiosInstance.get("/divisi")
  return response.data
}
