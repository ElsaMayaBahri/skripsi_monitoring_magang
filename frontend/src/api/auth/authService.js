// src/api/auth/authService.js
import axiosInstance from "../axios"

export const login = async (email, password) => {
  const response = await axiosInstance.post("/login", {
    email: email.trim(),
    password,
  })

  return {
    success: response.data.success,
    token: response.data.token || response.data.data?.token,
    user: response.data.user || response.data.data?.user,
    role: response.data.role || response.data.data?.role,
    message: response.data.message,
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

// ✅ TAMBAHKAN FUNGSI FORGOT PASSWORD
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post("/forgot-password", { email })
    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Gagal mengirim link reset password")
    }
    throw new Error("Tidak bisa connect ke server")
  }
}

// ✅ TAMBAHKAN FUNGSI RESET PASSWORD
export const resetPassword = async (email, password, passwordConfirmation, token) => {
  try {
    const response = await axiosInstance.post("/reset-password", {
      email,
      password,
      password_confirmation: passwordConfirmation,
      token
    })
    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Gagal mereset password")
    }
    throw new Error("Terjadi kesalahan, silakan coba lagi")
  }
}