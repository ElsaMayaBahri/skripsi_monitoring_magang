// src/api/coo/quizService.js
import axiosInstance from "../axios"

// Get all quiz
export const getAllQuiz = async () => {
  const response = await axiosInstance.get("/quiz")
  return response.data
}

// Get quiz by ID
export const getQuizById = async (id) => {
  const response = await axiosInstance.get(`/quiz/${id}`)
  return response.data
}

// Create quiz
export const createQuiz = async (data) => {
  const response = await axiosInstance.post("/quiz", data)
  return response.data
}

// Update quiz
export const updateQuiz = async (id, data) => {
  const response = await axiosInstance.put(`/quiz/${id}`, data)
  return response.data
}

// Delete quiz
export const deleteQuiz = async (id) => {
  const response = await axiosInstance.delete(`/quiz/${id}`)
  return response.data
}

// Import quiz from file
export const importQuiz = async (formData) => {
  const response = await axiosInstance.post("/quiz/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

// Download template for import
export const downloadQuizTemplate = async () => {
  const response = await axiosInstance.get("/quiz/template/download", {
    responseType: "blob",
  })
  return response.data
}

// Get quiz by division
export const getQuizByDivisi = async (divisi) => {
  const response = await axiosInstance.get(`/quiz/divisi/${encodeURIComponent(divisi)}`)
  return response.data
}