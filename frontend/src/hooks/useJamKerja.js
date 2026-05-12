// frontend/src/hooks/useJamKerja.js
import { useState, useEffect } from 'react'
import jamKerjaApi from '../api/peserta/jamKerjaApi'

const useJamKerja = () => {
  const [jamKerja, setJamKerja] = useState({
    jam_masuk: '08:00:00',
    jam_pulang: '17:00:00',
    batas_terlambat: 15
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadJamKerja()
  }, [])

  const loadJamKerja = async () => {
    try {
      setLoading(true)
      const response = await jamKerjaApi.getJamKerja()
      if (response.success && response.data) {
        setJamKerja({
          jam_masuk: response.data.jam_masuk || '08:00:00',
          jam_pulang: response.data.jam_pulang || '17:00:00',
          batas_terlambat: response.data.batas_terlambat || 15
        })
      }
    } catch (err) {
      console.error('Error load jam kerja:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Konversi waktu string ke menit
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0
    const parts = timeStr.split(':')
    const hours = parseInt(parts[0], 10) || 0
    const minutes = parseInt(parts[1], 10) || 0
    return hours * 60 + minutes
  }

  // Validasi apakah sekarang dalam jam kerja
  const isWithinWorkingHours = (date = null) => {
    const now = date ? new Date(date) : new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    const currentTotalMinutes = currentHour * 60 + currentMinute
    const masukTotalMinutes = timeToMinutes(jamKerja.jam_masuk)
    const pulangTotalMinutes = timeToMinutes(jamKerja.jam_pulang)
    
    return currentTotalMinutes >= masukTotalMinutes && currentTotalMinutes <= pulangTotalMinutes
  }

  // Cek apakah check-in terlambat
  const isLate = (checkinDate = null) => {
    const now = checkinDate ? new Date(checkinDate) : new Date()
    const [masukHour, masukMinute] = jamKerja.jam_masuk.split(':').map(Number)
    const masukTime = new Date(now)
    masukTime.setHours(masukHour, masukMinute, 0, 0)
    
    // Tambah batas keterlambatan (menit)
    masukTime.setMinutes(masukTime.getMinutes() + (jamKerja.batas_terlambat || 15))
    
    return now > masukTime
  }

  // Get status keterlambatan
  const getLateStatus = (checkinTime) => {
    if (!checkinTime) return null
    const late = isLate(checkinTime)
    return {
      is_late: late,
      message: late ? `⚠️ Terlambat (batas: ${jamKerja.batas_terlambat} menit)` : '✅ Tepat waktu'
    }
  }

  // Get sisa waktu check-in
  const getRemainingCheckinTime = () => {
    const now = new Date()
    const [masukHour, masukMinute] = jamKerja.jam_masuk.split(':').map(Number)
    const masukTime = new Date(now)
    masukTime.setHours(masukHour, masukMinute, 0, 0)
    
    if (now > masukTime) {
      return { expired: true, remaining: '⏰ Waktu check-in sudah lewat untuk hari ini' }
    }
    
    const diffMs = masukTime - now
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffMinutes = diffMins % 60
    
    let remainingText = ''
    if (diffHours > 0) {
      remainingText = `${diffHours} jam ${diffMinutes} menit lagi`
    } else if (diffMinutes > 0) {
      remainingText = `${diffMinutes} menit lagi`
    } else {
      remainingText = 'sebentar lagi'
    }
    
    return {
      expired: false,
      remaining: remainingText
    }
  }

  // Get sisa waktu check-out
  const getRemainingCheckoutTime = () => {
    const now = new Date()
    const [pulangHour, pulangMinute] = jamKerja.jam_pulang.split(':').map(Number)
    const pulangTime = new Date(now)
    pulangTime.setHours(pulangHour, pulangMinute, 0, 0)
    
    if (now > pulangTime) {
      return { expired: true, remaining: '⏰ Waktu check-out sudah lewat untuk hari ini' }
    }
    
    const diffMs = pulangTime - now
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffMinutes = diffMins % 60
    
    let remainingText = ''
    if (diffHours > 0) {
      remainingText = `${diffHours} jam ${diffMinutes} menit`
    } else if (diffMinutes > 0) {
      remainingText = `${diffMinutes} menit`
    } else {
      remainingText = 'sebentar lagi'
    }
    
    return {
      expired: false,
      remaining: remainingText
    }
  }

  // Format waktu untuk display
  const formatJamKerja = () => {
    const masuk = jamKerja.jam_masuk.substring(0, 5)
    const pulang = jamKerja.jam_pulang.substring(0, 5)
    return `${masuk} - ${pulang} WIB`
  }

  return {
    jamKerja,
    loading,
    error,
    isWithinWorkingHours,
    isLate,
    getLateStatus,
    getRemainingCheckinTime,
    getRemainingCheckoutTime,
    formatJamKerja
  }
}

export default useJamKerja