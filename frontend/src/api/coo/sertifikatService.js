// frontend/src/api/coo/sertifikatService.js
import axiosInstance from "../axios";

/**
 * Get all sertifikat templates (with optional filter by jenis)
 * @param {string} jenis - 'kompetensi' or 'magang'
 */
export const getSertifikatTemplates = async (jenis = 'kompetensi') => {
  try {
    const response = await axiosInstance.get(`/sertifikat/templates?jenis=${jenis}`);
    console.log('📄 Get Sertifikat Templates Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting sertifikat templates:", error);
    throw error;
  }
};

/**
 * Create/Upload new sertifikat template
 * @param {FormData} formData - Form data with file and template info
 */
export const createSertifikatTemplate = async (formData) => {
  try {
    const response = await axiosInstance.post('/sertifikat/templates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('📄 Create Sertifikat Template Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating sertifikat template:", error);
    throw error;
  }
};

/**
 * Delete sertifikat template by ID
 * @param {number} id - Template ID
 */
export const deleteSertifikatTemplate = async (id) => {
  try {
    const response = await axiosInstance.delete(`/sertifikat/templates/${id}`);
    console.log('📄 Delete Sertifikat Template Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting sertifikat template:", error);
    throw error;
  }
};

/**
 * Get all sertifikat (with optional filter by jenis)
 * @param {string} jenis - 'kompetensi' or 'magang'
 */
export const getSertifikat = async (jenis = 'kompetensi') => {
  try {
    const response = await axiosInstance.get(`/sertifikat?jenis=${jenis}`);
    console.log('📜 Get Sertifikat Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting sertifikat:", error);
    throw error;
  }
};

/**
 * Get single sertifikat by ID
 * @param {number} id - Sertifikat ID
 */
export const getSertifikatById = async (id) => {
  try {
    const response = await axiosInstance.get(`/sertifikat/${id}`);
    console.log('📜 Get Sertifikat By ID Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting sertifikat by id:", error);
    throw error;
  }
};

/**
 * Generate sertifikat for user
 * @param {Object} data - { user_id, jenis_sertifikat, template_id, nilai_akhir? }
 */
export const generateSertifikat = async (data) => {
  try {
    const response = await axiosInstance.post('/sertifikat/generate', data);
    console.log('🎓 Generate Sertifikat Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error generating sertifikat:", error);
    throw error;
  }
};

/**
 * Get divisi list for sertifikat
 */
export const getDivisiAktif = async () => {
  try {
    const response = await axiosInstance.get('/divisi/aktif');
    console.log('🏢 Get Divisi Aktif Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting divisi aktif:", error);
    throw error;
  }
};