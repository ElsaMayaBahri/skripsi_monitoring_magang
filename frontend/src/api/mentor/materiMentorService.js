// src/api/mentor/materiMentorService.js
import axiosInstance from "../axios"

export const getMentorMateri = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/mentor/materi${queryString ? `?${queryString}` : ''}`)
  return response.data
}

export const getMentorMateriById = async (id) => {
  const response = await axiosInstance.get(`/mentor/materi/${id}`)
  return response.data
}

export const createMentorMateri = async (formData) => {
  // Debug: Log apa yang dikirim
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }
  
  const response = await axiosInstance.post("/mentor/materi", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

export const updateMentorMateri = async (id, formData) => {
  const response = await axiosInstance.post(`/mentor/materi/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

export const deleteMentorMateri = async (id) => {
  const response = await axiosInstance.delete(`/mentor/materi/${id}`)
  return response.data
}

export const getMentorDivisiList = async () => {
  const response = await axiosInstance.get("/mentor/materi/divisi-list")
  return response.data
}