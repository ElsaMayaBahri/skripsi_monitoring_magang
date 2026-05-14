
// Menjadi ini (pakai axios.js yang sudah ada):
import axiosInstance from "../axios"  // ← karena di folder api/

export const getMentor = async () => {
  const response = await axiosInstance.get("/mentors")
  return response.data
}

export const getMentorById = async (id) => {
  const response = await axiosInstance.get(`/mentors/${id}`)
  return response.data
}

export const createMentor = async (data) => {
  const response = await axiosInstance.post("/mentors", data)
  return response.data
}

export const updateMentor = async (id, data) => {
  const response = await axiosInstance.put(`/mentors/${id}`, data)
  return response.data
}

export const deleteMentor = async (id) => {
  const response = await axiosInstance.delete(`/mentors/${id}`)
  return response.data
}