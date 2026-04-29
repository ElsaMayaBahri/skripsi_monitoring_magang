// src/utils/activityLogger.js

/**
 * Mencatat aktivitas ke localStorage
 * @param {string} type - 'create', 'update', 'delete'
 * @param {string} target - 'peserta', 'mentor', 'divisi'
 * @param {string} itemName - Nama item yang diubah
 * @param {object} details - Detail tambahan (opsional)
 */
export const logActivity = (type, target, itemName, details = {}) => {
  try {
    // Ambil aktivitas yang sudah ada
    const existingActivities = localStorage.getItem("system_activities")
    let activities = existingActivities ? JSON.parse(existingActivities) : []
    
    // Dapatkan user yang sedang login
    let userName = "Admin"
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        userName = user.nama || user.name || "Admin"
      }
    } catch (e) {
      userName = "Admin"
    }
    
    // Buat aktivitas baru
    const newActivity = {
      id: Date.now() + Math.random().toString(36).substr(2, 6),
      timestamp: new Date().toISOString(),
      type: type, // 'create', 'update', 'delete'
      target: target, // 'peserta', 'mentor', 'divisi'
      itemName: itemName,
      user: userName,
      details: details
    }
    
    // Tambahkan ke awal array (yang terbaru di atas)
    activities.unshift(newActivity)
    
    // Simpan hanya 100 aktivitas terakhir
    if (activities.length > 100) {
      activities = activities.slice(0, 100)
    }
    
    localStorage.setItem("system_activities", JSON.stringify(activities))
    
    // Trigger event storage agar halaman lain bisa update
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'system_activities',
      newValue: JSON.stringify(activities)
    }))
    
    console.log(`✅ Activity logged: ${type} ${target} - ${itemName}`)
    return true
  } catch (error) {
    console.error("❌ Failed to log activity:", error)
    return false
  }
}

/**
 * Mendapatkan semua aktivitas
 */
export const getActivities = () => {
  try {
    const activities = localStorage.getItem("system_activities")
    return activities ? JSON.parse(activities) : []
  } catch (error) {
    console.error("❌ Failed to get activities:", error)
    return []
  }
}

/**
 * Menghapus semua aktivitas (untuk debugging)
 */
export const clearActivities = () => {
  localStorage.removeItem("system_activities")
  console.log("🗑️ All activities cleared")
}

/**
 * Mendapatkan aktivitas berdasarkan filter
 */
export const getActivitiesByType = (type) => {
  const activities = getActivities()
  return activities.filter(a => a.type === type)
}

/**
 * Mendapatkan aktivitas berdasarkan target
 */
export const getActivitiesByTarget = (target) => {
  const activities = getActivities()
  return activities.filter(a => a.target === target)
}