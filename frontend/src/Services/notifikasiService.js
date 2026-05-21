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
    const res = await axios.get(`${BASE_URL}/notifikasi`, { headers: headers() })
    return res.data // { success, data: [...], unread: N }
  },

  // Tandai satu notifikasi sudah dibaca
  async markAsRead(idNotifikasi) {
    const res = await axios.patch(`${BASE_URL}/notifikasi/${idNotifikasi}/read`, {}, { headers: headers() })
    return res.data
  },

  // Tandai semua sudah dibaca
  async markAllAsRead() {
    const res = await axios.patch(`${BASE_URL}/notifikasi/read-all`, {}, { headers: headers() })
    return res.data
  },

  // Hapus notifikasi
  async delete(idNotifikasi) {
    const res = await axios.delete(`${BASE_URL}/notifikasi/${idNotifikasi}`, { headers: headers() })
    return res.data
  },
}