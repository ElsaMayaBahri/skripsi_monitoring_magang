// frontend/src/api/mentor/nilaiService.js
import axiosInstance from "../axios"

// Get all mentor's peserta list
export const getMentorPesertaList = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/mentor/pesertas${queryString ? `?${queryString}` : ''}`)
  return response.data
}

// Get all mentor's nilai
export const getMentorNilai = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/mentor/nilai${queryString ? `?${queryString}` : ''}`)
  return response.data
}

// Save nilai (create or update)
export const saveMentorNilai = async (data) => {
  const response = await axiosInstance.post("/mentor/nilai", data)
  return response.data
}

// Finalize nilai (menentukan nilai akhir dan status kelulusan)
export const finalizeMentorNilai = async (id) => {
  const response = await axiosInstance.post(`/mentor/nilai/${id}/finalize`)
  return response.data
}

// Export nilai to Excel
export const exportMentorNilai = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/mentor/nilai/export${queryString ? `?${queryString}` : ''}`, {
    responseType: "blob",
  })
  return response.data
}