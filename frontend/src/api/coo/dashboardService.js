// src/api/coo/dashboardService.js
import axiosInstance from "../axios"

// Ambil semua peserta
export const getAllPeserta = async () => {
  try {
    const response = await axiosInstance.get("/peserta")
    if (response.data && response.data.success === true) {
      return response.data.data || []
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error) {
    console.error("Error get peserta:", error)
    return []
  }
}

// Ambil semua mentor
export const getAllMentor = async () => {
  try {
    const response = await axiosInstance.get("/mentors")
    if (response.data && response.data.success === true) {
      return response.data.data || []
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error) {
    console.error("Error get mentor:", error)
    return []
  }
}

// Ambil semua divisi
export const getAllDivisi = async () => {
  try {
    const response = await axiosInstance.get("/divisi")
    if (response.data && response.data.success === true) {
      return response.data.data || []
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error) {
    console.error("Error get divisi:", error)
    return []
  }
}

// Ambil semua user (peserta + mentor) untuk dashboard
export const getAllUsers = async () => {
  try {
    const [peserta, mentor] = await Promise.all([
      getAllPeserta(),
      getAllMentor()
    ])
    
    const pesertaList = Array.isArray(peserta) ? peserta : []
    const mentorList = Array.isArray(mentor) ? mentor : []
    
    const semuaUser = [
      ...pesertaList.map(p => ({
        id: p.id_peserta || p.id,
        name: p.user?.nama || p.nama || "Peserta",
        email: p.user?.email || p.email,
        role: "peserta",
        divisi: p.divisi?.nama_divisi || p.nama_divisi || p.divisi || "-",
        status: p.user?.status_akun === "aktif" || p.status_akun === "aktif",
        created_at: p.created_at
      })),
      ...mentorList.map(m => ({
        id: m.id_mentor || m.id,
        name: m.user?.nama || m.nama || m.name || "Mentor",
        email: m.user?.email || m.email,
        role: "mentor",
        divisi: m.divisi?.nama_divisi || m.nama_divisi || m.divisi || "-",
        status: m.user?.status_akun === "aktif" || m.status_akun === "aktif",
        created_at: m.created_at
      }))
    ]
    
    return { success: true, data: semuaUser }
  } catch (error) {
    console.error("Error get all users:", error)
    return { success: true, data: [] }
  }
}

// Statistik kehadiran - dari PresensiController
export const getAttendanceStatistics = async () => {
  try {
    const response = await axiosInstance.get("/presensi/stats")
    console.log("Attendance stats response:", response.data)
    
    if (response.data && response.data.success === true) {
      const data = response.data.data
      return {
        success: true,
        data: {
          hadir: data.hadir || data.total_hadir || 0,
          terlambat: data.terlambat || data.total_terlambat || 0,
          absen: data.absen || data.total_absen || 0,
          persentase: data.persenKehadiran || data.persentase || 0
        }
      }
    }
    
    return {
      success: true,
      data: {
        hadir: 0,
        terlambat: 0,
        absen: 0,
        persentase: 0
      }
    }
  } catch (error) {
    console.error("Error get attendance statistics:", error)
    return {
      success: true,
      data: {
        hadir: 0,
        terlambat: 0,
        absen: 0,
        persentase: 0
      }
    }
  }
}

// Log aktivitas terbaru - dari ActivityLogController
export const getRecentActivityLogs = async (limit = 10) => {
  try {
    const response = await axiosInstance.get(`/activity-logs?limit=${limit}`)
    console.log("Activity logs response:", response.data)
    
    if (response.data && response.data.success === true) {
      return {
        success: true,
        data: response.data.data
      }
    }
    
    return {
      success: true,
      data: []
    }
  } catch (error) {
    console.error("Error get activity logs:", error)
    return {
      success: true,
      data: []
    }
  }
}

// Hasil kuis semua divisi - FIXED: ambil data dari response.data.data
export const getAllQuizResults = async () => {
  try {
    const response = await axiosInstance.get("/quiz/results/all")
    console.log("Quiz results response:", response.data)
    
    // FIX: Response API berbentuk { success: true, data: [...] }
    if (response.data && response.data.success === true) {
      // Ambil data dari response.data.data (bukan response.data langsung)
      const resultsData = response.data.data || []
      console.log("Quiz results data array length:", resultsData.length)
      
      return {
        success: true,
        data: resultsData  // Kirim array data
      }
    }
    
    return {
      success: true,
      data: []
    }
  } catch (error) {
    console.error("Error get quiz results:", error)
    return {
      success: true,
      data: []
    }
  }
}