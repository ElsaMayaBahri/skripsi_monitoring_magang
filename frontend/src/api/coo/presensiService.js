import axiosInstance from "../axios"

// Get all attendance data
export const getAllPresensi = async () => {
  const response = await axiosInstance.get("/presensi")
  return response.data
}

// Get attendance by date
export const getPresensiByDate = async (date) => {
  const response = await axiosInstance.get(`/presensi?tanggal=${date}`)
  return response.data
}

// Get attendance by division
export const getPresensiByDivisi = async (divisi) => {
  const response = await axiosInstance.get(`/presensi?divisi=${encodeURIComponent(divisi)}`)
  return response.data
}

// Get attendance statistics
export const getPresensiStats = async () => {
  const response = await axiosInstance.get("/presensi/stats")
  return response.data
}

// Export attendance report
export const exportPresensiReport = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/presensi/export${queryString ? `?${queryString}` : ''}`, {
    responseType: "blob",
  })
  return response.data
}
