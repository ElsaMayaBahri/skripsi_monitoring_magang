// frontend/src/api/mentor/laporanAkhirService.js
import axiosInstance from "../axios";

// Get all final reports
export const getMentorLaporanAkhir = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `/mentor/laporan-akhir${queryString ? `?${queryString}` : ''}`;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
};

// Get single laporan detail
export const getLaporanDetail = async (id) => {
    try {
        const response = await axiosInstance.get(`/mentor/laporan-akhir/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get Detail Error:', error.response?.data || error.message);
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

// Download laporan file
export const downloadLaporanFile = async (id) => {
    try {
        const response = await axiosInstance.get(`/mentor/laporan-akhir/${id}/download`, {
            responseType: 'blob'
        });
        
        let filename = 'laporan_akhir.pdf';
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        
        return { success: true, data: response.data, filename };
    } catch (error) {
        console.error('Download Error:', error.response?.data || error.message);
        throw error;
    }
};

// Export all final reports - DIRECT DOWNLOAD
export const exportLaporanAkhir = async (params = {}) => {
    try {
        const token = localStorage.getItem('token');
        const queryString = new URLSearchParams(params).toString();
        const url = `http://localhost:8000/api/mentor/laporan-akhir/export?${queryString}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        
        // Get filename from Content-Disposition or create from format
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `laporan_akhir_${new Date().toISOString().split('T')[0]}.${params.format === 'pdf' ? 'html' : 'csv'}`;
        
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match) filename = match[1];
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        return { success: true };
    } catch (error) {
        console.error('Export Error:', error);
        throw error;
    }
};