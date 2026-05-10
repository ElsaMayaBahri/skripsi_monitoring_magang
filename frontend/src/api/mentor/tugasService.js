// src/api/mentor/tugasService.js
import axiosInstance from "../axios";

// Get all mentor tasks
export const getMentorTugas = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosInstance.get(`/mentor/tugas${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

// Get task by ID
export const getMentorTugasById = async (id) => {
  const response = await axiosInstance.get(`/mentor/tugas/${id}`);
  return response.data;
};

// Create task
export const createMentorTugas = async (formData) => {
  const response = await axiosInstance.post("/mentor/tugas", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update task
export const updateMentorTugas = async (id, data) => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    const response = await axiosInstance.post(`/mentor/tugas/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } else {
    const response = await axiosInstance.put(`/mentor/tugas/${id}`, data);
    return response.data;
  }
};

// Delete task
export const deleteMentorTugas = async (id) => {
  const response = await axiosInstance.delete(`/mentor/tugas/${id}`);
  return response.data;
};

// Send reminder to participants (untuk semua tugas)
export const sendTugasReminder = async (tugasId = null) => {
  // Menggunakan endpoint /tugas/reminder (tanpa mentor prefix) sesuai route di backend
  const url = tugasId ? `/tugas/${tugasId}/reminder` : "/tugas/reminder";
  const response = await axiosInstance.post(url);
  return response.data;
};

// Send reminder untuk tugas tertentu
export const sendTugasReminderById = async (tugasId) => {
  const response = await axiosInstance.post(`/tugas/${tugasId}/reminder`);
  return response.data;
};

// Get task submissions
export const getTugasSubmissions = async (tugasId) => {
  const response = await axiosInstance.get(`/mentor/tugas/${tugasId}/submissions`);
  return response.data;
};

// Update submission (review/revisi/selesai)
export const updateTugasSubmission = async (submissionId, data) => {
  const response = await axiosInstance.put(`/mentor/tugas/submissions/${submissionId}`, data);
  return response.data;
};

// Export semua fungsi
export default {
  getMentorTugas,
  getMentorTugasById,
  createMentorTugas,
  updateMentorTugas,
  deleteMentorTugas,
  sendTugasReminder,
  sendTugasReminderById,
  getTugasSubmissions,
  updateTugasSubmission
};