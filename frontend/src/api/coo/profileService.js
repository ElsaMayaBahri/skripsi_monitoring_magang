// frontend/src/api/coo/profileService.js
import axiosInstance from "../axios";

/**
 * Get COO profile data
 */
export const getProfile = async () => {
  try {
    const response = await axiosInstance.get("/me");
    console.log('👤 Get Profile Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting profile:", error);
    throw error;
  }
};

/**
 * Update user profile (nama, no_telepon)
 * @param {Object} data - { nama, no_telepon }
 */
export const updateProfile = async (data) => {
  try {
    const response = await axiosInstance.post("/update-profile", data);
    console.log('👤 Update Profile Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * Upload profile photo
 * @param {File} file - Image file
 */
export const uploadPhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append("foto_profil", file);
    
    const response = await axiosInstance.post("/update-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    console.log('Upload Photo Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

/**
 * Change user password
 * @param {Object} data - { current_password, new_password, new_password_confirmation }
 */
export const changePassword = async (data) => {
  try {
    const response = await axiosInstance.post("/change-password", data);
    console.log('Change Password Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};