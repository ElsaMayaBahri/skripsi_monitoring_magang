import axiosInstance from "../axios"

export const getDivisi = async () => {
  const response = await axiosInstance.get("/divisi")
  return response.data
}

export const getDivisiById = async (id) => {
  const response = await axiosInstance.get(`/divisi/${id}`)
  return response.data
}

export const createDivisi = async (data) => {
  const response = await axiosInstance.post("/divisi", data)
  return response.data
}

export const updateDivisi = async (id, data) => {
  const response = await axiosInstance.put(`/divisi/${id}`, data)
  return response.data
}

export const deleteDivisi = async (id) => {
  const response = await axiosInstance.delete(`/divisi/${id}`)
  return response.data
}