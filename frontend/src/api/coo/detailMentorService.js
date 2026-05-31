// src/api/coo/detailMentorService.js
import api from "../axios";
import { getMentors } from "../admin/dashboardService";
import { getPeserta } from "../admin/dashboardService";
import { getDivisi } from "../admin/dashboardService";

// Get detail mentor dari data yang sudah ada
export const getDetailMentor = async (id) => {
  try {
    // Ambil semua data mentor dan divisi
    const [mentorsResponse, divisiResponse] = await Promise.all([
      getMentors(),
      getDivisi()
    ]);
    
    let mentorList = [];
    if (mentorsResponse && mentorsResponse.success && Array.isArray(mentorsResponse.data)) {
      mentorList = mentorsResponse.data;
    } else if (Array.isArray(mentorsResponse)) {
      mentorList = mentorsResponse;
    }
    
    // Handle berbagai kemungkinan struktur data divisi
    let divisiList = [];
    
    console.log("Raw DIVISI Response:", divisiResponse);
    
    if (divisiResponse?.success && Array.isArray(divisiResponse.data)) {
      divisiList = divisiResponse.data;
    } 
    else if (divisiResponse?.data?.data && Array.isArray(divisiResponse.data.data)) {
      divisiList = divisiResponse.data.data;
    }
    else if (divisiResponse?.data && Array.isArray(divisiResponse.data)) {
      divisiList = divisiResponse.data;
    }
    else if (Array.isArray(divisiResponse)) {
      divisiList = divisiResponse;
    }
    else if (divisiResponse && typeof divisiResponse === 'object') {
      for (const key in divisiResponse) {
        if (Array.isArray(divisiResponse[key])) {
          divisiList = divisiResponse[key];
          break;
        }
      }
    }
    
    console.log("FIXED DIVISI LIST:", divisiList);
    console.log("MENTOR LIST:", mentorList);
    
    // FIX: Cari mentor berdasarkan id_mentor SAJA (bukan id_user)
    const mentor = mentorList.find(m => {
      return String(m.id_mentor) === String(id);
    });
    
    console.log("FOUND MENTOR:", mentor);
    
    if (mentor) {
      // Cari nama divisi - prioritas dari data mentor langsung
      let divisiName = "-";
      
      // Pertama cek apakah mentor sudah punya object divisi langsung
      if (mentor.divisi) {
        if (typeof mentor.divisi === 'object') {
          divisiName = mentor.divisi.nama_divisi || 
                       mentor.divisi.nama || 
                       mentor.divisi.divisi || 
                       mentor.divisi.name || 
                       "-";
        } else if (typeof mentor.divisi === 'string') {
          divisiName = mentor.divisi;
        }
      }
      
      // Jika belum, coba cari dari nama_divisi langsung
      if (divisiName === "-" && mentor.nama_divisi) {
        divisiName = mentor.nama_divisi;
      }
      
      // Jika masih belum, cari dari id_divisi ke divisiList
      if (divisiName === "-" && mentor.id_divisi) {
        const divisi = divisiList.find(d => {
          const divisiId = d.id_divisi || d.id || d.divisi_id || d.ID;
          return String(divisiId) === String(mentor.id_divisi);
        });
        console.log("DIVISI FOUND FROM LIST:", divisi);
        if (divisi) {
          divisiName = divisi.nama_divisi || 
                       divisi.nama || 
                       divisi.divisi || 
                       divisi.name || 
                       divisi.namaDivisi ||
                       "-";
        }
      }
      
      console.log("FINAL DIVISI:", divisiName);
      
      return {
        success: true,
        data: {
          id: mentor.id_mentor,
          nama: mentor.user?.nama || mentor.nama || mentor.name || "-",
          email: mentor.user?.email || mentor.email || "-",
          divisi: divisiName,
          jabatan: mentor.jabatan || mentor.user?.jabatan || mentor.role || "-",
          status: mentor.user?.status_akun || mentor.status || "non_aktif",
          foto: mentor.user?.foto || mentor.foto || null,
          phone: mentor.user?.phone || mentor.phone || null,
          created_at: mentor.created_at || mentor.user?.created_at || null
        }
      };
    }
    
    throw new Error("Mentor tidak ditemukan");
  } catch (error) {
    console.error("Error getting detail mentor:", error);
    throw error;
  }
};

// Get daftar peserta bimbingan mentor
export const getPesertaBimbingan = async (id) => {
  try {
    // Ambil semua data peserta
    const pesertaResponse = await getPeserta();
    
    let pesertaList = [];
    if (pesertaResponse && pesertaResponse.success && Array.isArray(pesertaResponse.data)) {
      pesertaList = pesertaResponse.data;
    } else if (Array.isArray(pesertaResponse)) {
      pesertaList = pesertaResponse;
    } else if (pesertaResponse?.data?.data && Array.isArray(pesertaResponse.data.data)) {
      pesertaList = pesertaResponse.data.data;
    }
    
    console.log("PESERTA LIST:", pesertaList);
    
    // FIX: Filter peserta berdasarkan id_mentor SAJA
    const bimbingan = pesertaList.filter(p => {
      return String(p.id_mentor) === String(id);
    }).map(p => ({
      id: p.id_peserta || p.id,
      nama: p.user?.nama || p.nama || p.name || "-",
      divisi: p.divisi?.nama_divisi || p.divisi || "-",
      progress: p.progress || 0
    }));
    
    console.log("BIMBINGAN LIST:", bimbingan);
    
    return {
      success: true,
      data: bimbingan
    };
  } catch (error) {
    console.error("Error getting peserta bimbingan:", error);
    return {
      success: true,
      data: []
    };
  }
};

// Get statistik mentor
export const getStatistikMentor = async (id) => {
  try {
    const pesertaResponse = await getPeserta();
    
    let pesertaList = [];
    if (pesertaResponse && pesertaResponse.success && Array.isArray(pesertaResponse.data)) {
      pesertaList = pesertaResponse.data;
    } else if (Array.isArray(pesertaResponse)) {
      pesertaList = pesertaResponse;
    } else if (pesertaResponse?.data?.data && Array.isArray(pesertaResponse.data.data)) {
      pesertaList = pesertaResponse.data.data;
    }
    
    // Filter peserta berdasarkan id_mentor SAJA
    const bimbingan = pesertaList.filter(p => {
      return String(p.id_mentor) === String(id);
    });
    
    return {
      success: true,
      data: {
        totalBimbingan: bimbingan.length,
       
      }
    };
  } catch (error) {
    console.error("Error getting statistik mentor:", error);
    return {
      success: true,
      data: {
        totalBimbingan: 0,
        
      }
    };
  }
};