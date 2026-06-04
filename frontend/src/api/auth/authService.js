// src/api/auth/authService.js
import axiosInstance from "../axios"

export const login = async (email, password) => {
  const response = await axiosInstance.post("/login", {
    email: email.trim(),
    password,
  })

  return {
    token: response.data.token || response.data.data?.token,
    user: response.data.user || response.data.data?.user,
    role: response.data.role || response.data.data?.role,
  }
}

export const logout = async () => {
  const response = await axiosInstance.post("/logout")
  return response.data
}

export const getMe = async () => {
  const response = await axiosInstance.get("/me")
  return response.data
}