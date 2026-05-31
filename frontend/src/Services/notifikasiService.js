// src/api/notifikasiService.js
import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

const getToken = () => localStorage.getItem("token")

const headers = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
})

export const notifikasiService = {
  // Ambil semua notifikasi
  async getAll() {
    try {
      const res = await axios.get(`${BASE_URL}/notifikasi`, { headers: headers() })
      return res.data // { success, data: [...], unread: N }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      return { 
        success: false, 
        data: [], 
        unread: 0,
        message: error.response?.data?.message || "Gagal mengambil notifikasi"
      }
    }
  },

  // Tandai satu notifikasi sudah dibaca
  async markAsRead(idNotifikasi) {
    try {
      const res = await axios.patch(`${BASE_URL}/notifikasi/${idNotifikasi}/read`, {}, { headers: headers() })
      return res.data
    } catch (error) {
      console.error("Error marking notification as read:", error)
      return { 
        success: false, 
        message: error.response?.data?.message || "Gagal menandai notifikasi"
      }
    }
  },

  // Tandai semua sudah dibaca
  async markAllAsRead() {
    try {
      const res = await axios.patch(`${BASE_URL}/notifikasi/read-all`, {}, { headers: headers() })
      return res.data
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      return { 
        success: false, 
        message: error.response?.data?.message || "Gagal menandai semua notifikasi"
      }
    }
  },

  // Hapus notifikasi
  async delete(idNotifikasi) {
    try {
      const res = await axios.delete(`${BASE_URL}/notifikasi/${idNotifikasi}`, { headers: headers() })
      return res.data
    } catch (error) {
      console.error("Error deleting notification:", error)
      return { 
        success: false, 
        message: error.response?.data?.message || "Gagal menghapus notifikasi"
      }
    }
  },
}