import axiosInstance from "../../utils/axiosConfig"

export const getPeserta = async () => {
  const response = await axiosInstance.get("/peserta")
  return response.data
}

export const getPesertaById = async (id) => {
  const response = await axiosInstance.get(`/peserta/${id}`)
  return response.data
}

export const createPeserta = async (data) => {
  const response = await axiosInstance.post("/peserta", data)
  return response.data
}

export const updatePeserta = async (id, data) => {
  const response = await axiosInstance.put(`/peserta/${id}`, data)
  return response.data
}

export const deletePeserta = async (id) => {
  const response = await axiosInstance.delete(`/peserta/${id}`)
  return response.data
}