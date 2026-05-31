// src/api/coo/daftarHasilKuisService.js
import api from "../axios";

/**
 * Get all quiz results (for COO dashboard)
 * GET /api/quiz/all-results
 */
export const getAllQuizResults = async () => {
  const response = await api.get("/quiz/all-results");
  return response.data;
};

/**
 * Export all quiz results to Excel/CSV
 * GET /api/quiz/results/export
 */
export const exportAllQuizResults = async () => {
  const response = await api.get("/quiz/results/export", {
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers['content-disposition'];
  let filename = `hasil_kuis_all_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '');
    }
  }
  
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return { success: true };
};