import axiosInstance from "../axios";

// Get peserta dashboard data
export const getPesertaDashboard = async () => {
  const response = await axiosInstance.get("/peserta/dashboard")
  return response.data
}

// Get peserta profile
export const getPesertaProfile = async () => {
  const response = await axiosInstance.get("/peserta/profile")
  return response.data
}

// Update peserta profile
export const updatePesertaProfile = async (data) => {
  const response = await axiosInstance.put("/peserta/profile", data)
  return response.data
}

// Get peserta tasks
export const getPesertaTugas = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/peserta/tugas${queryString ? `?${queryString}` : ''}`)
  return response.data
}

// Get peserta attendance
export const getPesertaPresensi = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/peserta/presensi${queryString ? `?${queryString}` : ''}`)
  return response.data
}

// Get peserta notifications
export const getPesertaNotifications = async () => {
  const response = await axiosInstance.get("/peserta/notifications")
  return response.data
}

// Get peserta final grade
export const getPesertaNilaiAkhir = async () => {
  const response = await axiosInstance.get("/peserta/nilai-akhir")
  return response.data
}
