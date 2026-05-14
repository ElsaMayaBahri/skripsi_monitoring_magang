// src/api/coo/detailMentorService.js
import api from "../axios";

// Flag untuk mode development - set ke false jika API sudah siap
const USE_DUMMY = true;

// ==================== DUMMY DATA ====================
const getDummyDetailMentor = (id) => ({
  success: true,
  data: {
    id: parseInt(id),
    nama: "Budi Santoso, S.Kom, M.Kom",
    email: "budi.santoso@example.com",
    divisi: "IT - Software Engineering",
    jabatan: "Senior Software Engineer",
    status: "aktif",
    phone: "081234567891",
    foto: null,
    created_at: "2024-01-15"
  }
});

const getDummyPesertaBimbingan = (id) => ({
  success: true,
  data: [
    { id: 1, nama: "Ahmad Rizki Pratama", divisi: "IT", progress: 85, rataNilai: 88 },
    { id: 2, nama: "Siti Nurhaliza", divisi: "IT", progress: 75, rataNilai: 82 },
    { id: 3, nama: "Budi Santoso", divisi: "IT", progress: 90, rataNilai: 91 },
    { id: 4, nama: "Dewi Lestari", divisi: "IT", progress: 60, rataNilai: 75 }
  ]
});

const getDummyStatistikMentor = (id) => ({
  success: true,
  data: {
    totalBimbingan: 8,
    rataNilaiBimbingan: 84,
    tugasDiberikan: 24,
    tugasDinilai: 20
  }
});

// ==================== API FUNCTIONS ====================
export const getDetailMentor = async (id) => {
  try {
    const response = await api.get(`/coo/mentor/${id}/detail`);
    return response.data;
  } catch (error) {
    if (USE_DUMMY) {
      console.warn(`⚠️ [Dummy Mode] API getDetailMentor belum tersedia, menggunakan dummy data`);
      return getDummyDetailMentor(id);
    }
    console.error("Error getting detail mentor:", error);
    throw error;
  }
};

export const getPesertaBimbingan = async (id) => {
  try {
    const response = await api.get(`/coo/mentor/${id}/peserta-bimbingan`);
    return response.data;
  } catch (error) {
    if (USE_DUMMY) {
      console.warn(`⚠️ [Dummy Mode] API getPesertaBimbingan belum tersedia, menggunakan dummy data`);
      return getDummyPesertaBimbingan(id);
    }
    console.error("Error getting peserta bimbingan:", error);
    throw error;
  }
};

export const getStatistikMentor = async (id) => {
  try {
    const response = await api.get(`/coo/mentor/${id}/statistik`);
    return response.data;
  } catch (error) {
    if (USE_DUMMY) {
      console.warn(`⚠️ [Dummy Mode] API getStatistikMentor belum tersedia, menggunakan dummy data`);
      return getDummyStatistikMentor(id);
    }
    console.error("Error getting statistik mentor:", error);
    throw error;
  }
};