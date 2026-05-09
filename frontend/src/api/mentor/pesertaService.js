// src/api/mentor/pesertaService.js
import axiosInstance from "../axios";

// Get mentor's participants list
export const getMentorPesertaList = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axiosInstance.get(`/mentor/peserta-list${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

// Get mentor's participants (alternative endpoint)
export const getMyPesertas = async () => {
  const response = await axiosInstance.get("/mentor/pesertas");
  return response.data;
};

// Get detail of a specific participant
export const getDetailPeserta = async (idPeserta) => {
  const response = await axiosInstance.get(`/mentor/pesertas/${idPeserta}`);
  return response.data;
};

// Get mentor filters (divisi, periode, etc.)
export const getMentorFilters = async () => {
  const response = await axiosInstance.get("/mentor/filters");
  return response.data;
};

export default {
  getMentorPesertaList,
  getMyPesertas,
  getDetailPeserta,
  getMentorFilters
};