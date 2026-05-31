// src/api/peserta/laporanAkhirService.js
import axiosInstance from "../axios";

export const getLaporanAkhir = async () => {
  try {
    const response = await axiosInstance.get("/peserta/laporan-akhir");
    return response.data;
  } catch (error) {
    console.error("Error get laporan akhir:", error);
    throw error;
  }
};

export const uploadLaporanAkhir = async (formData) => {
  try {
    const response = await axiosInstance.post("/peserta/laporan-akhir", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error upload laporan akhir:", error);
    throw error;
  }
};

export const deleteLaporanAkhir = async () => {
  try {
    const response = await axiosInstance.delete("/peserta/laporan-akhir");
    return response.data;
  } catch (error) {
    console.error("Error delete laporan akhir:", error);
    throw error;
  }
};