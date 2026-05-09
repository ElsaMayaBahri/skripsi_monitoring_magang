// src/api/admin/dashboardService.js
import axiosInstance from "../axios";  // ← panggil dari sini, bukan dari utils

export const getPeserta = async () => {
  try {
    const response = await axiosInstance.get("/peserta")
    console.log("API getPeserta response:", response.data)
    
    // Handle berbagai format response dari backend
    if (response.data && response.data.success === true) {
      return response.data.data || []
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data
    }
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  } catch (error) {
    console.error("Error in getPeserta:", error)
    return []
  }
}

export const getMentors = async () => {
  try {
    const response = await axiosInstance.get("/mentors")
    console.log("API getMentors response:", response.data)
    
    if (response.data && response.data.success === true) {
      return response.data.data || []
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data
    }
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  } catch (error) {
    console.error("Error in getMentors:", error)
    return []
  }
}

export const getDivisi = async () => {
  try {
    const response = await axiosInstance.get("/divisi")
    console.log("API getDivisi response:", response.data)
    
    if (response.data && response.data.success === true) {
      return response.data.data || []
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data
    }
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  } catch (error) {
    console.error("Error in getDivisi:", error)
    return []
  }
}