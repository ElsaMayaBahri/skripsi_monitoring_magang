// frontend/src/context/NotifikasiContext.jsx

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"

const NotifikasiContext = createContext(null)

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

// Interval polling (ms) — setiap 30 detik cek notifikasi baru
const POLL_INTERVAL = 30_000

export function NotifikasiProvider({ children }) {
  const [notifikasi, setNotifikasi]     = useState([])
  const [unreadCount, setUnreadCount]   = useState(0)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const pollingRef                       = useRef(null)

  // ─── Helper: ambil token dari localStorage ───────────────────────────────
  const getToken = () => localStorage.getItem("token")

  // ─── Fetch notifikasi dari server ─────────────────────────────────────────
  const fetchNotifikasi = useCallback(async (showLoading = true) => {
    const token = getToken()
    if (!token) return

    if (showLoading) setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${BASE_URL}/notifikasi`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!res.ok) {
        // Jika 401 (token expired/invalid), hentikan polling
        if (res.status === 401) {
          stopPolling()
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }

      const json = await res.json()

      if (json.success) {
        setNotifikasi(json.data || [])
        setUnreadCount(json.unread_count ?? 0)
      }
    } catch (err) {
      // Jangan tampilkan error jaringan ke UI, cukup log
      console.warn("[NotifikasiContext] fetch error:", err.message)
      setError(err.message)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  // ─── Tandai satu notifikasi sebagai dibaca ────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    const token = getToken()
    if (!token) return

    // Optimistic update
    setNotifikasi(prev =>
      prev.map(n =>
        n.id_notifikasi === id ? { ...n, status_baca: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await fetch(`${BASE_URL}/notifikasi/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
    } catch (err) {
      console.warn("[NotifikasiContext] markAsRead error:", err.message)
      // Rollback jika gagal
      await fetchNotifikasi(false)
    }
  }, [fetchNotifikasi])

  // ─── Tandai semua notifikasi sebagai dibaca ───────────────────────────────
  const markAllAsRead = useCallback(async () => {
    const token = getToken()
    if (!token) return

    // Optimistic update
    setNotifikasi(prev => prev.map(n => ({ ...n, status_baca: true })))
    setUnreadCount(0)

    try {
      await fetch(`${BASE_URL}/notifikasi/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
    } catch (err) {
      console.warn("[NotifikasiContext] markAllAsRead error:", err.message)
      await fetchNotifikasi(false)
    }
  }, [fetchNotifikasi])

  // ─── Hapus satu notifikasi ────────────────────────────────────────────────
  const hapus = useCallback(async (id) => {
    const token = getToken()
    if (!token) return

    // Optimistic update
    setNotifikasi(prev => {
      const target = prev.find(n => n.id_notifikasi === id)
      const newList = prev.filter(n => n.id_notifikasi !== id)
      if (target && !target.status_baca) {
        setUnreadCount(c => Math.max(0, c - 1))
      }
      return newList
    })

    try {
      await fetch(`${BASE_URL}/notifikasi/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
    } catch (err) {
      console.warn("[NotifikasiContext] hapus error:", err.message)
      await fetchNotifikasi(false)
    }
  }, [fetchNotifikasi])

  // ─── Polling ──────────────────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollingRef.current) return // sudah berjalan
    pollingRef.current = setInterval(() => {
      fetchNotifikasi(false) // silent refresh (tanpa loading spinner)
    }, POLL_INTERVAL)
  }, [fetchNotifikasi])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Fetch pertama kali
    fetchNotifikasi(true)
    // Mulai polling
    startPolling()

    return () => {
      stopPolling()
    }
  }, [fetchNotifikasi, startPolling, stopPolling])

  // ─── Value ────────────────────────────────────────────────────────────────
  const value = {
    notifikasi,
    unreadCount,
    loading,
    error,
    fetchNotifikasi,
    markAsRead,
    markAllAsRead,
    hapus,
  }

  return (
    <NotifikasiContext.Provider value={value}>
      {children}
    </NotifikasiContext.Provider>
  )
}

/**
 * Hook untuk mengakses notifikasi dari komponen manapun
 * yang dibungkus oleh <NotifikasiProvider>
 */
export function useNotifikasi() {
  const ctx = useContext(NotifikasiContext)
  if (!ctx) {
    throw new Error("useNotifikasi harus digunakan di dalam <NotifikasiProvider>")
  }
  return ctx
}

export default NotifikasiContext
