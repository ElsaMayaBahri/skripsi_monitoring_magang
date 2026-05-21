import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { notifikasiService } from "../services/notifikasiService"

const NotifikasiContext = createContext(null)

export function NotifikasiProvider({ children }) {
  const [notifikasi, setNotifikasi]   = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading]         = useState(false)

  const fetchNotifikasi = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      setLoading(true)
      const res = await notifikasiService.getAll()
      setNotifikasi(res.data)
      setUnreadCount(res.unread)
    } catch (err) {
      console.error("Gagal memuat notifikasi:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = async (id) => {
    await notifikasiService.markAsRead(id)
    setNotifikasi(prev =>
      prev.map(n => n.id_notifikasi === id ? { ...n, status_baca: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    await notifikasiService.markAllAsRead()
    setNotifikasi(prev => prev.map(n => ({ ...n, status_baca: true })))
    setUnreadCount(0)
  }

  const hapus = async (id) => {
    await notifikasiService.delete(id)
    const target = notifikasi.find(n => n.id_notifikasi === id)
    setNotifikasi(prev => prev.filter(n => n.id_notifikasi !== id))
    if (target && !target.status_baca) setUnreadCount(prev => Math.max(0, prev - 1))
  }

  useEffect(() => {
    fetchNotifikasi()
    // Polling setiap 60 detik untuk notifikasi baru
    const interval = setInterval(fetchNotifikasi, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifikasi])

  return (
    <NotifikasiContext.Provider value={{ notifikasi, unreadCount, loading, fetchNotifikasi, markAsRead, markAllAsRead, hapus }}>
      {children}
    </NotifikasiContext.Provider>
  )
}

export const useNotifikasi = () => {
  const ctx = useContext(NotifikasiContext)
  if (!ctx) throw new Error("useNotifikasi harus dipakai dalam NotifikasiProvider")
  return ctx
}