// frontend/src/api/coo/materiService.js
import axiosInstance from "../axios"

// Get all materi
export const getMateri = async () => {
  const response = await axiosInstance.get("/materi-pelatihan")
  return response.data
}

// Get materi by ID
export const getMateriById = async (id) => {
  const response = await axiosInstance.get(`/materi-pelatihan/${id}`)
  return response.data
}

// Create materi (with file upload)
export const createMateri = async (formData) => {
  const response = await axiosInstance.post("/materi-pelatihan", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

// Update materi (with file upload) - FIXED: Use POST only
export const updateMateri = async (id, formData) => {
  // Langsung pakai POST, karena route sudah mendukung POST untuk update
  const response = await axiosInstance.post(`/materi-pelatihan/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

// Delete materi
export const deleteMateri = async (id) => {
  const response = await axiosInstance.delete(`/materi-pelatihan/${id}`)
  return response.data
}

// Download materi
export const downloadMateri = async (id) => {
  const response = await axiosInstance.get(`/materi-pelatihan/${id}/download`, {
    responseType: "blob",
  })
  return response.data
}

// Get materi by division
export const getMateriByDivisi = async (divisi) => {
  const response = await axiosInstance.get(`/materi-pelatihan/divisi/${encodeURIComponent(divisi)}`)
  return response.data
}