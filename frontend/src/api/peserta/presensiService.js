// frontend/src/api/peserta/presensiService.js
import axiosInstance from "../axios"

// Get peserta attendance history
export const getPesertaPresensi = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(
    `/peserta/presensi${queryString ? `?${queryString}` : ""}`
  )
  return response.data
}

// Check-in today
export const postPesertaCheckin = async (data) => {
  const response = await axiosInstance.post("/peserta/presensi/checkin", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

// Check-out today
export const postPesertaCheckout = async (data) => {
  const response = await axiosInstance.post("/peserta/presensi/checkout", data)
  return response.data
}

// Get today's presensi status
export const getPesertaPresensiToday = async () => {
  const response = await axiosInstance.get("/peserta/presensi/today")
  return response.data
}