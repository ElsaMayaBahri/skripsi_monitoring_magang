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
    
    // 🔥 PERBAIKAN: Gunakan format yang SAMA dengan Dashboard
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    // Format ISO untuk sorting (biar sorting berdasarkan waktu benar)
    const isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`
    
    // Buat aktivitas baru
    const newActivity = {
      id: Date.now() + Math.random().toString(36).substr(2, 6),
      timestamp: isoString,
      type: type,
      target: target,
      itemName: itemName,
      user: userName,
      details: details
    }
    
    // Tambahkan ke awal array
    activities.unshift(newActivity)
    
    // Simpan hanya 100 aktivitas terakhir
    if (activities.length > 100) {
      activities = activities.slice(0, 100)
    }
    
    localStorage.setItem("system_activities", JSON.stringify(activities))
    
    // Trigger event storage
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

export const getActivities = () => {
  try {
    const activities = localStorage.getItem("system_activities")
    if (!activities) return []
    return JSON.parse(activities)
  } catch (error) {
    console.error("❌ Failed to get activities:", error)
    return []
  }
}

export const clearActivities = () => {
  localStorage.removeItem("system_activities")
  console.log("🗑️ All activities cleared")
}

export const getActivitiesByType = (type) => {
  const activities = getActivities()
  return activities.filter(a => a.type === type)
}

export const getActivitiesByTarget = (target) => {
  const activities = getActivities()
  return activities.filter(a => a.target === target)
}