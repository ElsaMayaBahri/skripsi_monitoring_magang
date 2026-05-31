// frontend/src/api/peserta/jamKerjaApi.js
import axiosInstance from "../axios";

const jamKerjaApi = {
  getJamKerja: async () => {
    try {
      const response = await axiosInstance.get("/jam-kerja");

      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      // Jika response tidak sesuai format yang diharapkan
      throw new Error("Invalid response format from server");
    } catch (error) {
      console.error("Error get jam kerja:", error);
      
      // Throw error agar component bisa menangani
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        "Failed to load working hours"
      );
    }
  },
};

export default jamKerjaApi;