import { useEffect, useRef } from "react";

/**
 * Modal peringatan sebelum auto-logout
 */
function IdleWarningModal({ countdown, formatCountdown, onContinue, onLogout }) {
  const btnRef = useRef(null);

  // Fokus tombol "Lanjutkan" saat modal muncul (aksesibilitas)
  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  // Persentase countdown untuk progress ring
  const totalSeconds = 5 * 60; // harus sama dengan warningMinutes di hook
  const pct = countdown / totalSeconds;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  // Warna berubah sesuai sisa waktu
  const ringColor =
    countdown > 120 ? "#3b82f6" : countdown > 60 ? "#f59e0b" : "#ef4444";

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-title"
    >
      {/* Card */}
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 animate-fade-in"
        style={{ animation: "fadeInScale 0.25s ease" }}
      >
        {/* ── Progress ring countdown ── */}
        <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
          <svg width="96" height="96" className="-rotate-90">
            {/* Track */}
            <circle
              cx="48" cy="48" r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="7"
            />
            {/* Progress */}
            <circle
              cx="48" cy="48" r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
            />
          </svg>
          {/* Timer label di tengah */}
          <span
            className="absolute text-lg font-bold tabular-nums"
            style={{ color: ringColor }}
          >
            {formatCountdown()}
          </span>
        </div>

        {/* ── Teks ── */}
        <div className="text-center">
          <h2
            id="idle-title"
            className="text-lg font-semibold text-gray-800 dark:text-white mb-1"
          >
            Sesi Akan Berakhir
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Anda tidak aktif. Sesi akan otomatis berakhir dalam{" "}
            <span className="font-semibold" style={{ color: ringColor }}>
              {formatCountdown()}
            </span>{" "}
            demi keamanan akun Anda.
          </p>
        </div>

        {/* ── Tombol ── */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            ref={btnRef}
            onClick={onContinue}
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ✅ Lanjutkan Sesi
          </button>
          <button
            onClick={onLogout}
            className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            🚪 Keluar Sekarang
          </button>
        </div>
      </div>

      {/* Keyframe animation (inline agar tanpa file CSS) */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default IdleWarningModal;
