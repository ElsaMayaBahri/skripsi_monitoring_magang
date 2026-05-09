// src/api/mentor/dailyReportService.js
import axiosInstance from "../axios";
import { getMentorPesertaList } from "./pesertaService";

/**
 * Get all daily reports for mentor's participants on a specific date
 * GET /api/daily-report?tanggal=YYYY-MM-DD
 */
export const getAllDailyReports = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/daily-report${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all daily reports:', error);
    throw error;
  }
};

/**
 * Get daily report for a specific peserta on a specific date
 * GET /api/daily-report/{peserta_id}?tanggal=YYYY-MM-DD
 */
export const getDailyReport = async (pesertaId, tanggal) => {
  try {
    const response = await axiosInstance.get(`/daily-report/${pesertaId}`, {
      params: { tanggal }
    });
    return response.data;
  } catch (error) {
    // Handle 404 gracefully - this is normal when report doesn't exist
    if (error.response?.status === 404) {
      return {
        success: true,
        data: null,
        message: 'Laporan belum diisi'
      };
    }
    console.error('Error fetching daily report:', error);
    throw error;
  }
};

/**
 * Submit feedback for a daily report
 * POST /api/daily-report/{peserta_id}/feedback
 */
export const submitDailyReportFeedback = async (pesertaId, tanggal, feedback) => {
  try {
    const response = await axiosInstance.post(`/daily-report/${pesertaId}/feedback`, {
      tanggal,
      feedback
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

/**
 * Export daily report to Excel
 * GET /api/daily-report/export?tanggal=YYYY-MM-DD
 */
export const exportDailyReport = async (tanggal) => {
  try {
    const response = await axiosInstance.get('/daily-report/export', {
      params: { tanggal }
    });
    
    // Return data for Excel generation
    return response.data;
  } catch (error) {
    console.error('Error exporting daily report:', error);
    throw error;
  }
};

// Re-export getMentorPesertaList
export { getMentorPesertaList };

export default {
  getAllDailyReports,
  getDailyReport,
  submitDailyReportFeedback,
  exportDailyReport,
  getMentorPesertaList
};