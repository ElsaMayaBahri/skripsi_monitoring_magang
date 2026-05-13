import api from "../axios";

// Flag untuk mode development - set ke false jika API sudah siap
const USE_DUMMY = true;
const SHOW_DUMMY_WARNING = true;

// Data dummy untuk mock
const getDummyDetailPeserta = (id) => ({
  success: true,
  data: {
    id: parseInt(id),
    nama: "Ahmad Rizki Pratama",
    email: "ahmad.rizki@example.com",
    divisi: "IT - Software Engineering",
    status: "aktif",
    mentor: "Budi Santoso, S.Kom",
    tanggal_mulai: "2026-01-15",
    tanggal_selesai: "2026-04-15",
    phone: "081234567890",
    foto: null
  }
});

const getDummyRiwayatKehadiran = (id) => ({
  success: true,
  data: [
    { date: "2026-05-01", status: "hadir", keterangan: "Hadir tepat waktu" },
    { date: "2026-05-02", status: "hadir", keterangan: "Hadir tepat waktu" },
    { date: "2026-05-03", status: "hadir", keterangan: "Hadir tepat waktu" },
    { date: "2026-05-04", status: "izin", keterangan: "Izin sakit" },
    { date: "2026-05-05", status: "hadir", keterangan: "Hadir tepat waktu" },
    { date: "2026-05-06", status: "hadir", keterangan: "Hadir tepat waktu" },
    { date: "2026-05-07", status: "hadir", keterangan: "Hadir tepat waktu" },
    { date: "2026-05-08", status: "hadir", keterangan: "Hadir tepat waktu" },
    { date: "2026-05-09", status: "hadir", keterangan: "Hadir tepat waktu" },
    { date: "2026-05-10", status: "hadir", keterangan: "Hadir tepat waktu" }
  ]
});

const getDummyProgressTugas = (id) => ({
  success: true,
  data: [
    { id: 1, judul: "Membuat Landing Page", progress: 100, nilai: 90, deadline: "2026-05-10" },
    { id: 2, judul: "Integrasi API Backend", progress: 85, nilai: 85, deadline: "2026-05-15" },
    { id: 3, judul: "Membuat Dashboard Admin", progress: 70, nilai: 80, deadline: "2026-05-20" },
    { id: 4, judul: "Testing & Debugging", progress: 50, nilai: null, deadline: "2026-05-25" },
    { id: 5, judul: "Dokumentasi Proyek", progress: 30, nilai: null, deadline: "2026-05-30" }
  ]
});

const getDummyHasilKuis = (id) => ({
  success: true,
  data: [
    { id: 1, judul: "Quiz HTML & CSS", nilai: 85, tanggal: "2026-04-20", durasi: 30 },
    { id: 2, judul: "Quiz JavaScript Dasar", nilai: 78, tanggal: "2026-04-25", durasi: 30 },
    { id: 3, judul: "Quiz React.js", nilai: 92, tanggal: "2026-05-01", durasi: 45 },
    { id: 4, judul: "Quiz Database & SQL", nilai: 70, tanggal: "2026-05-05", durasi: 30 },
    { id: 5, judul: "Quiz Laravel", nilai: 88, tanggal: "2026-05-10", durasi: 45 }
  ]
});

const getDummyLaporanAkhir = (id) => ({
  success: true,
  data: {
    id: 1,
    nilai_akhir: 85,
    kesimpulan: "Peserta telah menyelesaikan magang dengan baik, mampu mengerjakan tugas-tugas yang diberikan dengan kualitas yang memuaskan.",
    saran: "Perlu meningkatkan pemahaman tentang konsep database dan optimalisasi query.",
    file_url: null
  }
});

const getDummyStatistik = (id) => ({
  success: true,
  data: {
    progress: 75,
    kehadiran: 90,
    rataNilai: 83,
    totalTugas: 5,
    totalKuis: 5,
    nilaiTertinggi: 92,
    peringkat: 5,
    totalPeserta: 25
  }
});

const getDummyAktivitas = (id, limit) => ({
  success: true,
  data: [
    { type: "tugas", title: "Mengumpulkan Tugas", description: "Membuat Landing Page", time: "2 hari lalu", created_at: "2026-05-08" },
    { type: "kuis", title: "Mengerjakan Kuis", description: "Quiz React.js - Skor 92", time: "5 hari lalu", created_at: "2026-05-05" },
    { type: "tugas", title: "Mengumpulkan Tugas", description: "Integrasi API Backend", time: "1 minggu lalu", created_at: "2026-05-01" },
    { type: "kehadiran", title: "Check-in", description: "Hadir tepat waktu", time: "1 hari lalu", created_at: "2026-05-09" }
  ]
});

// Get detail peserta lengkap
export const getDetailPeserta = async (id) => {
  try {
    const response = await api.get(`/coo/peserta/${id}/detail`);
    if (SHOW_DUMMY_WARNING && USE_DUMMY) {
      console.log("✅ [Real Data] API getDetailPeserta berhasil");
    }
    return response.data;
  } catch (error) {
    if (USE_DUMMY) {
      console.warn(`⚠️ [Dummy Mode] API getDetailPeserta belum tersedia (${error.response?.status || error.message}), menggunakan dummy data`);
      return getDummyDetailPeserta(id);
    }
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
    if (USE_DUMMY) {
      console.warn(`⚠️ [Dummy Mode] API getRiwayatKehadiran belum tersedia, menggunakan dummy data`);
      return getDummyRiwayatKehadiran(id);
    }
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
    if (USE_DUMMY) {
      console.warn(`⚠️ [Dummy Mode] API getProgressTugas belum tersedia, menggunakan dummy data`);
      return getDummyProgressTugas(id);
    }
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
    if (USE_DUMMY) {
      console.warn(`⚠️ [Dummy Mode] API getHasilKuis belum tersedia, menggunakan dummy data`);
      return getDummyHasilKuis(id);
    }
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
    if (USE_DUMMY) {
      console.warn(`⚠️ [Dummy Mode] API getLaporanAkhir belum tersedia, menggunakan dummy data`);
      return getDummyLaporanAkhir(id);
    }
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
    if (USE_DUMMY) {
      console.warn(`⚠️ [Dummy Mode] API getStatistikPeserta belum tersedia, menggunakan dummy data`);
      return getDummyStatistik(id);
    }
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
    if (USE_DUMMY) {
      console.warn(`⚠️ [Dummy Mode] API getAktivitasTerbaru belum tersedia, menggunakan dummy data`);
      return getDummyAktivitas(id, limit);
    }
    console.error("Error getting aktivitas terbaru:", error);
    throw error;
  }
};