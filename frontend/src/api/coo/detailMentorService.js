// src/api/coo/detailMentorService.js
import api from "../axios";

// ==================== API FUNCTIONS ====================
export const getDetailMentor = async (id) => {
  try {
    const response = await api.get(`/mentor/${id}`);
    console.log("✅ getDetailMentor response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting detail mentor:", error);
    throw error;
  }
};

export const getPesertaBimbingan = async (id) => {
  try {
    const response = await api.get(`/coo/mentor/${id}/peserta-bimbingan`);
    return response.data;
  } catch (error) {
    console.error("Error getting peserta bimbingan:", error);
    throw error;
  }
};

export const getStatistikMentor = async (id) => {
  try {
    const response = await api.get(`/coo/mentor/${id}/statistik`);
    return response.data;
  } catch (error) {
    console.error("Error getting statistik mentor:", error);
    throw error;
  }
};