// src/api/mentor/dashboardService.js
import axiosInstance from "../axios"

// Get mentor dashboard data
export const getMentorDashboard = async () => {
  const response = await axiosInstance.get("/mentor/dashboard")
  return response.data
}

// Get mentor's participants
export const getMentorParticipants = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString()
  const response = await axiosInstance.get(`/mentor/peserta-list${queryString ? `?${queryString}` : ''}`)
  return response.data
}

// Get mentor notifications
export const getMentorNotifications = async () => {
  const response = await axiosInstance.get("/mentor/notifications")
  return response.data
}