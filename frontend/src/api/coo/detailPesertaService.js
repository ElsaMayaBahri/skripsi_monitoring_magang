// src/api/coo/detailPesertaService.js
import api from "../axios";
import { getPeserta } from "../admin/dashboardService";

// Get detail peserta dari data yang sudah ada
export const getDetailPeserta = async (id) => {
  try {
    // Ambil semua data peserta
    const response = await getPeserta();
    
    let pesertaList = [];
    if (response && response.success && Array.isArray(response.data)) {
      pesertaList = response.data;
    } else if (Array.isArray(response)) {
      pesertaList = response;
    } else if (response && Array.isArray(response.data)) {
      pesertaList = response.data;
    }
    
    // Cari peserta berdasarkan ID
    const peserta = pesertaList.find(p => {
      const pesertaId = p.id_peserta || p.id;
      return pesertaId == id;
    });
    
    if (peserta) {
      // Tentukan status dari status_magang atau user status
      let status = "non_aktif";
      if (peserta.status_magang === "aktif") {
        status = "aktif";
      } else if (peserta.user?.status_akun === "aktif" || peserta.user?.status_akun === "active") {
        status = "aktif";
      } else if (peserta.status === "aktif" || peserta.status === "active") {
        status = "aktif";
      }
      
      // Dapatkan nama mentor
      let mentorName = "-";
      if (peserta.mentor) {
        if (typeof peserta.mentor === 'object') {
          mentorName = peserta.mentor.user?.nama || peserta.mentor.nama || peserta.mentor.name || "-";
        } else if (typeof peserta.mentor === 'string') {
          mentorName = peserta.mentor;
        }
      } else if (peserta.id_mentor && mentorList) {
        // Jika perlu cari dari list mentor
        const foundMentor = mentorList.find(m => (m.id_mentor || m.id_user || m.id) == peserta.id_mentor);
        if (foundMentor) {
          mentorName = foundMentor.user?.nama || foundMentor.nama || foundMentor.name || "-";
        }
      }
      
      // Dapatkan nama divisi
      let divisiName = "-";
      if (peserta.divisi) {
        if (typeof peserta.divisi === 'object') {
          divisiName = peserta.divisi.nama_divisi || peserta.divisi.nama || "-";
        } else if (typeof peserta.divisi === 'string') {
          divisiName = peserta.divisi;
        }
      } else if (peserta.id_divisi && divisiList) {
        const foundDivisi = divisiList.find(d => (d.id_divisi || d.id) == peserta.id_divisi);
        if (foundDivisi) divisiName = foundDivisi.nama_divisi || foundDivisi.nama || "-";
      }
      
      // Data dari database - LANGSUNG dari kolom tabel
      const asalKampus = peserta.asal_kampus || peserta.user?.asal_kampus || "-";
      const programStudi = peserta.prodi || peserta.user?.prodi || "-";
      const nomorTelepon = peserta.user?.phone || peserta.user?.no_telepon || peserta.phone || "-";
      const fotoProfil = peserta.user?.foto || peserta.foto || null;
      
      return {
        success: true,
        data: {
          id: peserta.id_peserta || peserta.id,
          nama: peserta.user?.nama || peserta.nama || peserta.name || "Tidak ada nama",
          email: peserta.user?.email || peserta.email || "-",
          divisi: divisiName,
          status: status,
          mentor: mentorName,
          tanggal_mulai: peserta.tanggal_mulai || peserta.start_date,
          tanggal_selesai: peserta.tanggal_selesai || peserta.end_date,
          foto: fotoProfil,
          phone: nomorTelepon,
          asal_kampus: asalKampus,
          prodi: programStudi
        }
      };
    }
    
    throw new Error("Peserta tidak ditemukan");
  } catch (error) {
    console.error("Error getting detail peserta:", error);
    throw error;
  }
};

// Fungsi-fungsi lain yang tidak digunakan (tetap disediakan untuk kompatibilitas)
export const getRiwayatKehadiran = async (id) => {
  return { success: true, data: [] };
};

export const getProgressTugas = async (id) => {
  return { success: true, data: [] };
};

export const getHasilKuis = async (id) => {
  return { success: true, data: [] };
};

export const getLaporanAkhir = async (id) => {
  return { success: true, data: null };
};

export const getStatistikPeserta = async (id) => {
  return {
    success: true,
    data: { progress: 0, kehadiran: 0, rataNilai: 0, totalTugas: 0, totalKuis: 0 }
  };
};

export const getAktivitasTerbaru = async (id, limit = 10) => {
  return { success: true, data: [] };
};