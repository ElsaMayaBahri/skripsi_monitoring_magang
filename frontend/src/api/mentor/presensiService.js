// src/api/mentor/presensiService.js
import axiosInstance from "../axios";

// Get all presensi for mentor
export const getMentorPresensi = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/mentor/presensi${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor presensi:", error);
    return { success: false, data: [], message: error.message };
  }
};

// Get presensi summary for mentor
export const getMentorPresensiSummary = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/mentor/presensi/summary${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching presensi summary:", error);
    return { success: false, data: null };
  }
};

// Get presensi by date
export const getPresensiByDate = async (date) => {
  try {
    const response = await axiosInstance.get(`/mentor/presensi/date/${date}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching presensi by date:", error);
    return { success: false, data: [] };
  }
};

// Get presensi by participant
export const getPresensiByPeserta = async (pesertaId, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/mentor/presensi/peserta/${pesertaId}${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching presensi by peserta:", error);
    return { success: false, data: [] };
  }
};

// Export presensi data
export const exportPresensi = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/mentor/presensi/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error("Error exporting presensi:", error);
    throw error;
  }
};

// Get presensi stats for dashboard
export const getPresensiStats = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/mentor/presensi/stats${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching presensi stats:", error);
    return { success: false, data: null };
  }
};

// Default export
const presensiService = {
  getMentorPresensi,
  getMentorPresensiSummary,
  getPresensiByDate,
  getPresensiByPeserta,
  exportPresensi,
  getPresensiStats
};

export default presensiService;