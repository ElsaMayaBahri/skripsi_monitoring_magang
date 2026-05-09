// src/api/coo/settingsAttendanceService.js
import axiosInstance from "../axios"

// ==================== JAM KERJA ====================
export const getJamKerja = async () => {
  const response = await axiosInstance.get("/jam-kerja")
  return response.data
}

export const createJamKerja = async (data) => {
  const response = await axiosInstance.post("/jam-kerja", data)
  return response.data
}

export const updateJamKerja = async (id, data) => {
  const response = await axiosInstance.put(`/jam-kerja/${id}`, data)
  return response.data
}

export const deleteJamKerja = async (id) => {
  const response = await axiosInstance.delete(`/jam-kerja/${id}`)
  return response.data
}

// ==================== HARI LIBUR ====================
export const getHariLibur = async () => {
  const response = await axiosInstance.get("/hari-libur")
  return response.data
}

export const createHariLibur = async (data) => {
  const response = await axiosInstance.post("/hari-libur", data)
  return response.data
}

export const updateHariLibur = async (id, data) => {
  const response = await axiosInstance.put(`/hari-libur/${id}`, data)
  return response.data
}

export const deleteHariLibur = async (id) => {
  const response = await axiosInstance.delete(`/hari-libur/${id}`)
  return response.data
}