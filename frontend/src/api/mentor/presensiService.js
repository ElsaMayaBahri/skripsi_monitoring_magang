import axiosInstance from "../axios"

// Get attendance records for mentor's participants
export const getMentorPresensi = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/mentor/presensi${queryString ? `?${queryString}` : ''}`)
  return response.data
}

// Get attendance summary
export const getMentorPresensiSummary = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/mentor/presensi/summary${queryString ? `?${queryString}` : ''}`)
  return response.data
}

// Export attendance report
export const exportMentorPresensi = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/mentor/presensi/export${queryString ? `?${queryString}` : ''}`, {
    responseType: "blob",
  })
  return response.data
}

// Get participant's daily report
export const getDailyReportByPeserta = async (pesertaId, tanggal) => {
  const response = await axiosInstance.get(`/daily-report/${pesertaId}?tanggal=${tanggal}`)
  return response.data
}
