// src/api/mentor/materiMentorService.js
import axiosInstance from "../axios"

export const getMentorMateri = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/mentor/materi', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMentorMateriById = async (id) => {
  try {
    const response = await axiosInstance.get(`/mentor/materi/${id}`)
    return response.data
  } catch (error) {
    throw error;
  }
};

export const createMentorMateri = async (formData) => {
  try {
    const response = await axiosInstance.post('/mentor/materi', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PERBAIKAN: Gunakan PUT dengan FormData (dengan _method PUT)
export const updateMentorMateri = async (id, formData) => {
  try {
    // Tambahkan _method=PUT ke FormData untuk Laravel
    formData.append('_method', 'PUT');
    
    const response = await axiosInstance.post(`/mentor/materi/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error in updateMentorMateri:', error);
    throw error;
  }
};

export const deleteMentorMateri = async (id) => {
  try {
    const response = await axiosInstance.delete(`/mentor/materi/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMentorDivisiList = async () => {
  try {
    const response = await axiosInstance.get("/mentor/materi/divisi-list")
    return response.data
  } catch (error) {
    throw error;
  }
};

export const getMateriDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/mentor/materi/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMentorInfo = async () => {
  try {
    const response = await axiosInstance.get('/mentor/materi/mentor-info');
    return response.data;
  } catch (error) {
    console.error('Error in getMentorInfo:', error);
    throw error;
  }
};

export const getMateriForPeserta = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/peserta/materi', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};