import api from "../axios";

// Get all holidays
export const getHariLibur = async () => {
  try {
    const response = await api.get('/hari-libur');
    return response.data;
  } catch (error) {
    console.error("Error getting holidays:", error);
    throw error;
  }
};

// Create holiday
export const createHariLibur = async (data) => {
  try {
    const response = await api.post('/hari-libur', data);
    return response.data;
  } catch (error) {
    console.error("Error creating holiday:", error);
    throw error;
  }
};

// Update holiday
export const updateHariLibur = async (id, data) => {
  try {
    const response = await api.put(`/hari-libur/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating holiday:", error);
    throw error;
  }
};

// Delete holiday
export const deleteHariLibur = async (id) => {
  try {
    const response = await api.delete(`/hari-libur/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting holiday:", error);
    throw error;
  }
};

// Get working hours
export const getJamKerja = async () => {
  try {
    const response = await api.get('/jam-kerja');
    return response.data;
  } catch (error) {
    console.error("Error getting working hours:", error);
    throw error;
  }
};

// Create working hours
export const createJamKerja = async (data) => {
  try {
    const response = await api.post('/jam-kerja', data);
    return response.data;
  } catch (error) {
    console.error("Error creating working hours:", error);
    throw error;
  }
};

// Update working hours
export const updateJamKerja = async (id, data) => {
  try {
    const response = await api.put(`/jam-kerja/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating working hours:", error);
    throw error;
  }
};