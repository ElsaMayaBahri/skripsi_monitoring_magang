import React, { useState, useRef, useEffect } from "react"
import { Bell, Check, Trash2, CheckCheck } from "lucide-react"
import { useNotifikasi } from "../context/NotifikasiContext"

function NotifikasiBell() {
  const { notifikasi, unreadCount, loading, markAsRead, markAllAsRead, hapus } = useNotifikasi()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e) => { 
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const getIkonJudul = (judul = "") => {
    if (!judul) return "🔔"
    if (judul.includes("Deadline"))  return "⚠️"
    if (judul.includes("Revisi"))    return "🔄"
    if (judul.includes("Disetujui")) return "✅"
    if (judul.includes("Tugas Baru")) return "📋"
    if (judul.includes("Pengingat")) return "🔔"
    if (judul.includes("Dikumpulkan")) return "📝"
    if (judul.includes("Kuis"))      return "❗"
    return "🔔"
  }

  return (
    <div className="relative" ref={ref}>
      {/* Tombol Bell */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Notifikasi</h4>
              {unreadCount > 0 && (
                <p className="text-[10px] text-gray-400">{unreadCount} belum dibaca</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                <CheckCheck size={12} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List notifikasi */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading && notifikasi.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">Memuat...</div>
            ) : notifikasi.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-400">Belum ada notifikasi</p>
              </div>
            ) : (
              notifikasi.map((n) => (
                <div
                  key={n.id_notifikasi}
                  className={`px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors ${!n.status_baca ? "bg-teal-50/40" : ""}`}
                >
                  {/* Ikon */}
                  <div className="text-lg leading-none mt-0.5 select-none">
                    {getIkonJudul(n.judul)}
                  </div>
                  {/* Konten */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold text-gray-800 truncate ${!n.status_baca ? "text-teal-800" : ""}`}>
                      {n.judul}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.pesan}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1">{n.waktu || "Baru saja"}</p>
                  </div>
                  {/* Aksi */}
                  <div className="flex flex-col gap-1 shrink-0">
                    {!n.status_baca && (
                      <button
                        onClick={() => markAsRead(n.id_notifikasi)}
                        title="Tandai dibaca"
                        className="p-1 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => hapus(n.id_notifikasi)}
                      title="Hapus"
                      className="p-1 rounded-lg hover:bg-red-100 text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifikasi.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <a href="/peserta/notifikasi" className="text-[11px] text-teal-600 hover:text-teal-700 font-medium transition-colors">
                Lihat semua notifikasi →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotifikasiBell