// src/api/peserta/profileService.js
import axiosInstance from "../axios";


export const getPesertaProfile = async () => {
  const token = localStorage.getItem("token")
  const response = await axios.get("/api/peserta/profile", {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const updateUserProfile = async (data) => {
  const token = localStorage.getItem("token")
  const response = await axios.put("/api/user/profile", data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const uploadPhoto = async (file) => {
  const token = localStorage.getItem("token")
  const formData = new FormData()
  formData.append("foto_profil", file)
  const response = await axios.post("/api/user/upload-photo", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  })
  return response.data
}

export const changePassword = async (data) => {
  const token = localStorage.getItem("token")
  const response = await axios.post("/api/user/change-password", data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}