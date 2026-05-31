// frontend/src/api/coo/profileService.js
import axiosInstance from "../axios";

export const getProfile = async () => {
  try {
    const response = await axiosInstance.get("/me");
    return response.data;
  } catch (error) {
    console.error("Error getting profile:", error);
    throw error;
  }
};

export const updateProfile = async (data) => {
  try {
    // Coba beberapa kemungkinan endpoint
    const endpoints = [
      { url: "/me", method: "put" },
      { url: "/me", method: "post" },
      { url: "/profile", method: "put" },
      { url: "/profile", method: "post" },
      { url: "/user/profile", method: "put" },
      { url: "/user/profile", method: "post" },
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axiosInstance[endpoint.method](endpoint.url, data);
        console.log(`✅ Update profile success with ${endpoint.method.toUpperCase()} ${endpoint.url}`);
        return response.data;
      } catch (error) {
        if (error.response?.status !== 405 && error.response?.status !== 404) {
          throw error;
        }
        // Lanjut ke endpoint berikutnya
      }
    }
    
    throw new Error("Tidak ada endpoint yang tersedia untuk update profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const uploadPhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append("foto_profil", file);
    
    const endpoints = [
      "/me/photo",
      "/upload-photo",
      "/profile/photo",
      "/user/photo"
    ];
    
    for (const url of endpoints) {
      try {
        const response = await axiosInstance.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        console.log(`✅ Upload photo success with ${url}`);
        return response.data;
      } catch (error) {
        if (error.response?.status !== 404 && error.response?.status !== 405) {
          throw error;
        }
      }
    }
    
    throw new Error("Tidak ada endpoint yang tersedia untuk upload foto");
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

export const changePassword = async (data) => {
  try {
    const response = await axiosInstance.post("/change-password", data);
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};