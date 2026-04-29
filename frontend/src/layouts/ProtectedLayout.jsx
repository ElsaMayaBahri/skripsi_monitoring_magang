import { useCallback } from "react";
import { useNavigate, Outlet, Navigate } from "react-router-dom";
import { api } from "../utils/api";
import useIdleTimeout from "../hooks/useIdleTimeout";
import IdleWarningModal from "../components/IdleWarningModal";

/**
 * ProtectedLayout
 * ──────────────────────────────────────────────────────────
 * Wrapper untuk semua halaman yang butuh autentikasi.
 * - Redirect ke /login jika tidak ada token
 * - Auto-logout setelah idle IDLE_MINUTES menit
 * - Tampilkan warning modal WARNING_MINUTES menit sebelum logout
 *
 * Cara pakai di router:
 *   <Route element={<ProtectedLayout />}>
 *     <Route path="/admin/dashboard" element={<Dashboard />} />
 *     ... semua route protected lainnya
 *   </Route>
 */

const IDLE_MINUTES    = 2; // Logout setelah X menit tidak aktif
const WARNING_MINUTES = 1;  // Tampilkan warning X menit sebelum logout

function ProtectedLayout() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  // ── Handler logout ───────────────────────────────────────────────────────
  const handleLogout = useCallback(async (isAuto = false) => {
    try {
      await api.logout();
    } catch (_) {
      // Abaikan error logout — tetap bersihkan storage
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      // Tandai bahwa ini auto-logout supaya Login.jsx bisa tampilkan notif
      if (isAuto) {
        sessionStorage.setItem("autoLogout", "true");
      }

      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ── Idle timeout hook ─────────────────────────────────────────────────────
  const { showWarning, countdown, formatCountdown, continueSession } =
    useIdleTimeout({
      idleMinutes:    IDLE_MINUTES,
      warningMinutes: WARNING_MINUTES,
      onLogout: () => handleLogout(true), // auto-logout
    });

  // ── Guard: belum login → redirect ────────────────────────────────────────
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {/* Render halaman anak */}
      <Outlet />

      {/* Warning modal muncul saat idle mendekati batas */}
      {showWarning && (
        <IdleWarningModal
          countdown={countdown}
          formatCountdown={formatCountdown}
          onContinue={continueSession}
          onLogout={() => handleLogout(false)} // manual logout dari modal
        />
      )}
    </>
  );
}

export default ProtectedLayout;