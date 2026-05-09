// src/api/coo/dashboardService.js
import axiosInstance from "../axios"

// Ambil semua peserta
export const getAllPeserta = async () => {
  try {
    const response = await axiosInstance.get("/peserta")
    // Handle response dari backend
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
        divisi: p.divisi?.nama_divisi || p.nama_divisi || "-",
        status: p.user?.status_akun === "aktif" || p.status_akun === "aktif",
        created_at: p.created_at
      })),
      ...mentorList.map(m => ({
        id: m.id_mentor || m.id,
        name: m.user?.nama || m.nama || m.name || "Mentor",
        email: m.user?.email || m.email,
        role: "mentor",
        divisi: m.divisi?.nama_divisi || m.nama_divisi || "-",
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

// Statistik kehadiran
export const getAttendanceStatistics = async () => {
  try {
    const response = await axiosInstance.get("/presensi/stats")
    if (response.data && response.data.success === true) {
      return {
        success: true,
        data: response.data.data
      }
    }
  } catch (error) {
    console.warn("Endpoint presensi stats belum ada, pakai data dummy")
  }
  
  // Data dummy sementara
  return {
    success: true,
    data: {
      hadir: 75,
      terlambat: 15,
      absen: 10,
      persentase: 75
    }
  }
}

// Log aktivitas terbaru
export const getRecentActivityLogs = async (limit = 10) => {
  try {
    const response = await axiosInstance.get(`/activity-logs?limit=${limit}`)
    if (response.data && response.data.success === true) {
      return {
        success: true,
        data: response.data.data
      }
    }
  } catch (error) {
    console.warn("Endpoint activity logs belum ada, pakai data dummy")
  }
  
  // Data dummy sementara
  return {
    success: true,
    data: [
      { user: "Sistem", action: "Dashboard siap digunakan", time: "Baru saja", type: "info", detail: "Selamat datang di dashboard monitoring" }
    ]
  }
}

// Hasil kuis semua divisi
export const getAllQuizResults = async () => {
  try {
    const response = await axiosInstance.get("/quiz/results/all")
    if (response.data && response.data.success === true) {
      return {
        success: true,
        data: response.data.data
      }
    }
  } catch (error) {
    console.warn("Endpoint quiz results belum ada, pakai data dummy")
  }
  
  // Data dummy sementara
  return {
    success: true,
    data: []
  }
}