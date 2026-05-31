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

// Send reminder for all tasks
export const sendTugasReminder = async () => {
  const response = await axiosInstance.post("/mentor/tugas/reminder");
  return response.data;
};

// Send reminder for specific task
export const sendTugasReminderById = async (tugasId) => {
  const response = await axiosInstance.post(`/mentor/tugas/${tugasId}/reminder`);
  return response.data;
};

// Get task submissions by tugas ID
export const getTugasSubmissions = async (tugasId) => {
  const response = await axiosInstance.get(`/mentor/tugas/${tugasId}/submissions`);
  return response.data;
};

// Get all submissions for a specific participant - DIPERBAIKI
export const getMentorTugasSubmissions = async (pesertaId) => {
  try {
    // Gunakan endpoint yang sudah ditambahkan di backend
    const response = await axiosInstance.get(`/mentor/tugas/submissions`, {
      params: { id_peserta: pesertaId }
    });
    
    console.log(`Submissions for peserta ${pesertaId}:`, response.data);
    
    if (response.data && response.data.success) {
      return response.data;
    }
    
    return { success: true, data: [] };
  } catch (error) {
    console.error(`Error fetching tugas submissions for peserta ${pesertaId}:`, error);
    return { success: false, data: [], message: error.message };
  }
};

// Get participant's task progress summary
export const getPesertaTugasProgress = async (pesertaId) => {
  try {
    const response = await axiosInstance.get(`/mentor/peserta/${pesertaId}/tugas-progress`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tugas progress:", error);
    return {
      success: false,
      data: {
        progress: 0,
        tugas_selesai: 0,
        total_tugas: 0
      }
    };
  }
};

// Update submission
export const updateTugasSubmission = async (submissionId, data) => {
  const response = await axiosInstance.put(`/mentor/tugas/submissions/${submissionId}`, data);
  return response.data;
};

// Get peserta by mentor
export const getPesertaByMentor = async () => {
  const response = await axiosInstance.get("/mentor/peserta");
  return response.data;
};

// Default export
const tugasService = {
  getMentorTugas,
  getMentorTugasById,
  createMentorTugas,
  updateMentorTugas,
  deleteMentorTugas,
  sendTugasReminder,
  sendTugasReminderById,
  getTugasSubmissions,
  getMentorTugasSubmissions,
  getPesertaTugasProgress,
  updateTugasSubmission,
  getPesertaByMentor
};

export default tugasService;