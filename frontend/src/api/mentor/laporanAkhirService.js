// frontend/src/api/mentor/laporanAkhirService.js
import axiosInstance from "../axios";

// Get all final reports
export const getMentorLaporanAkhir = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `/mentor/laporan-akhir${queryString ? `?${queryString}` : ''}`;
        console.log('Fetching URL:', url);
        const response = await axiosInstance.get(url);
        console.log('Response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
};

// Submit review for final report
export const submitLaporanReview = async (id, data) => {
    try {
        const response = await axiosInstance.post(`/mentor/laporan-akhir/${id}/review`, data);
        return response.data;
    } catch (error) {
        console.error('Submit Review Error:', error.response?.data || error.message);
        throw error;
    }
};

// Export all final reports
export const exportLaporanAkhir = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `/mentor/laporan-akhir/export${queryString ? `?${queryString}` : ''}`;
        const response = await axiosInstance.get(url, {
            responseType: "blob",
        });
        return response.data;
    } catch (error) {
        console.error('Export Error:', error.response?.data || error.message);
        throw error;
    }
};