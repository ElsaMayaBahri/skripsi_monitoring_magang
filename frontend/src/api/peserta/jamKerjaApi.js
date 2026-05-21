// frontend/src/api/peserta/jamKerjaApi.js
import axiosInstance from "../axios";

const jamKerjaApi = {
  getJamKerja: async () => {
    try {
      // PERBAIKAN: route backend adalah /jam-kerja, bukan /jam-kerjas
      const response = await axiosInstance.get("/jam-kerja");

      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: true,
        data: {
          jam_masuk: "08:00:00",
          jam_pulang: "17:00:00",
          batas_terlambat: 15,
        },
      };
    } catch (error) {
      console.error("Error get jam kerja:", error);

      return {
        success: true,
        data: {
          jam_masuk: "08:00:00",
          jam_pulang: "17:00:00",
          batas_terlambat: 15,
        },
      };
    }
  },
};

export default jamKerjaApi;
