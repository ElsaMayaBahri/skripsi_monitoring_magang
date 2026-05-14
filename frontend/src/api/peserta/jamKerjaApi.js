// frontend/src/api/peserta/jamKerjaApi.js
import axiosInstance from "../axios"

const jamKerjaApi = {
  // Get jam kerja
  getJamKerja: async () => {
    try {
      const response = await axiosInstance.get('/jam-kerjas')
      console.log('Jam kerja response:', response.data)
      
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data
        }
      }
      
      // Jika data kosong, return default
      return {
        success: true,
        data: {
          jam_masuk: '08:00:00',
          jam_pulang: '17:00:00',
          batas_terlambat: 15
        }
      }
    } catch (error) {
      console.error('Error get jam kerja:', error)
      // Return default jika API error
      return {
        success: true,
        data: {
          jam_masuk: '08:00:00',
          jam_pulang: '17:00:00',
          batas_terlambat: 15
        }
      }
    }
  }
}

export default jamKerjaApi