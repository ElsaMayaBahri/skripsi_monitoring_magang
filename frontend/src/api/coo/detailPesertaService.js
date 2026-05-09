import api from "../axios";

// Get detail peserta lengkap
export const getDetailPeserta = async (id) => {
  try {
    const response = await api.get(`/coo/peserta/${id}/detail`);
    return response.data;
  } catch (error) {
    console.error("Error getting detail peserta:", error);
    throw error;
  }
};

// Get riwayat kehadiran peserta
export const getRiwayatKehadiran = async (id, params = {}) => {
  try {
    const response = await api.get(`/coo/peserta/${id}/kehadiran`, { params });
    return response.data;
  } catch (error) {
    console.error("Error getting riwayat kehadiran:", error);
    throw error;
  }
};

// Get progress tugas peserta
export const getProgressTugas = async (id) => {
  try {
    const response = await api.get(`/coo/peserta/${id}/progress-tugas`);
    return response.data;
  } catch (error) {
    console.error("Error getting progress tugas:", error);
    throw error;
  }
};

// Get hasil kuis peserta
export const getHasilKuis = async (id) => {
  try {
    const response = await api.get(`/coo/peserta/${id}/hasil-kuis`);
    return response.data;
  } catch (error) {
    console.error("Error getting hasil kuis:", error);
    throw error;
  }
};

// Get laporan akhir peserta
export const getLaporanAkhir = async (id) => {
  try {
    const response = await api.get(`/coo/peserta/${id}/laporan-akhir`);
    return response.data;
  } catch (error) {
    console.error("Error getting laporan akhir:", error);
    throw error;
  }
};

// Get statistik ringkasan peserta
export const getStatistikPeserta = async (id) => {
  try {
    const response = await api.get(`/coo/peserta/${id}/statistik`);
    return response.data;
  } catch (error) {
    console.error("Error getting statistik peserta:", error);
    throw error;
  }
};

// Get aktivitas terbaru peserta
export const getAktivitasTerbaru = async (id, limit = 10) => {
  try {
    const response = await api.get(`/coo/peserta/${id}/aktivitas`, { params: { limit } });
    return response.data;
  } catch (error) {
    console.error("Error getting aktivitas terbaru:", error);
    throw error;
  }
};