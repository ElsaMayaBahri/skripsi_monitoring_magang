import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

// ============================================
// AUTH PAGES
// ============================================
import Login from "./pages/auth/Login";

// ============================================
// ADMIN PAGES - Created by: Admin Developer
// ============================================
import AdminLayout from "./layouts/AdminLayout";
import DashboardAdmin from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import AddMentor from "./pages/admin/AddMentor";
import AddPeserta from "./pages/admin/AddPeserta";
import EditPeserta from "./pages/admin/EditPeserta";
import EditMentor from "./pages/admin/EditMentor";
import Divisi from "./pages/admin/Divisi";
import AdminSettings from "./pages/admin/Settings";

// ============================================
// COO PAGES - Created by: COO Developer
// ============================================
import CooLayout from "./layouts/CooLayout";
import DashboardCOO from "./pages/coo/Dashboard";
import MateriCOO from "./pages/coo/Materi";
import AddMateriCOO from "./pages/coo/AddMateri";
import EditMateriCOO from "./pages/coo/EditMateri";
import DataManagement from "./pages/coo/DataManagement";
import DetailPesertaCOO from "./pages/coo/DetailPeserta"; // Renamed to avoid conflict
import ProfileCOO from "./pages/coo/Profile";
import SettingsCOO from "./pages/coo/Settings";

// QUIZ COO PAGES
import Quiz from "./pages/coo/Quiz";
import AddQuiz from "./pages/coo/AddQuiz";
import AddQuestion from "./pages/coo/AddQuestion";
import QuizDetail from "./pages/coo/QuizDetail";
import EditQuiz from "./pages/coo/EditQuiz";

// PRESENSI COO PAGES
import PresensiCOO from "./pages/coo/Presensi";
import LaporanPresensiCOO from "./pages/coo/LaporanPresensi";

// SETTINGS COO PAGES
import SettingsAttendance from "./pages/coo/SettingsAttendance";

// ============================================
// MENTOR PAGES - Created by: Mentor Developer
// ============================================
import MentorLayout from "./layouts/MentorLayout";
import DashboardMentor from "./pages/mentor/Dashboard";
import DaftarPesertaMentor from "./pages/mentor/DaftarPeserta";
import PresensiMentor from "./pages/mentor/Presensi";
import PresensiDailyReport from "./pages/mentor/PresensiDailyReport";
import DaftarMateri from "./pages/mentor/DaftarMateri";
import AddMateri from "./pages/mentor/AddMateri";
import DaftarTugasMentor from "./pages/mentor/DaftarTugas";
import AddTugas from "./pages/mentor/AddTugas";
import ValidasiTugas from "./pages/mentor/ValidasiTugas";
import LaporanAkhir from "./pages/mentor/LaporanAkhir";
import InputNilaiManual from "./pages/mentor/InputNilaiManual";
import NilaiAkhirMentor from "./pages/mentor/NilaiAkhir";
import EditMateri from "./pages/mentor/EditMateri";
import LihatMateri from "./pages/mentor/LihatMateri";
import DetailPesertaMentor from "./pages/mentor/DetailPeserta"; // Renamed to avoid conflict

// ============================================
// PESERTA PAGES - Created by: Peserta Developer
// ============================================
import PesertaLayout from "./layouts/PesertaLayout";
import DashboardPeserta from "./pages/peserta/DashboardPeserta";
import PresensiPeserta from "./pages/peserta/PresensiPeserta";
import RiwayatPresensiPeserta from "./pages/peserta/RiwayatPresensiPeserta";
import MateriMentor from "./pages/peserta/MateriMentor";
import MateriKompetensi from "./pages/peserta/MateriKompetensi";
import KuisKompetensi from "./pages/peserta/KuisKompetensi";
import DaftarTugasPeserta from "./pages/peserta/DaftarTugas";
import DetailTugas from "./pages/peserta/DetailTugas";
import NilaiAkhirPeserta from "./pages/peserta/NilaiAkhir";
import Sertifikat from "./pages/peserta/Sertifikat";

// ============================================
// COMPONENTS
// ============================================
import ProtectedRoute from "./components/ProtectedRoute";
import useIdleTimeout from "./hooks/useIdleTimeout";
import IdleWarningModal from "./components/IdleWarningModal";

// ============================================
// AUTO LOGOUT CONFIGURATION
// ============================================
const IDLE_MINUTES = 120;
const WARNING_MINUTES = 5;

// ============================================
// MAIN APP COMPONENT - Created by: System Architect
// ============================================
function App() {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    console.log("App.jsx - Role from localStorage:", role);
    setIsAuthenticated(!!token);
    setUserRole(role);
    setLoading(false);
  }, []);

  // Sync authentication state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      setIsAuthenticated(!!token);
      setUserRole(role);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Handle auto logout when idle
  const handleAutoLogout = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:8000/api/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      sessionStorage.setItem("autoLogout", "true");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const { showWarning, countdown, formatCountdown, continueSession } =
    useIdleTimeout({
      idleMinutes: IDLE_MINUTES,
      warningMinutes: WARNING_MINUTES,
      onLogout: handleAutoLogout,
      enabled: isAuthenticated,
    });

  if (loading) return null;

  console.log("App.jsx - Current userRole:", userRole);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Root Redirect based on role */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              userRole === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : userRole === "coo" ? (
                <Navigate to="/coo/dashboard" replace />
              ) : userRole === "mentor" ? (
                <Navigate to="/mentor/dashboard" replace />
              ) : userRole === "peserta" ? (
                <Navigate to="/peserta/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ============================================ */}
        {/* ADMIN ROUTES - Created by: Admin Developer */}
        {/* ============================================ */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="users" element={<Users />} />
          <Route path="add-mentor" element={<AddMentor />} />
          <Route path="add-peserta" element={<AddPeserta />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="users/edit-peserta/:id" element={<EditPeserta />} />
          <Route path="users/edit-mentor/:id" element={<EditMentor />} />
          <Route path="divisi" element={<Divisi />} />
        </Route>

        {/* ============================================ */}
        {/* COO ROUTES - Created by: COO Developer */}
        {/* ============================================ */}
        <Route
          path="/coo"
          element={
            <ProtectedRoute allowedRoles={["coo"]}>
              <CooLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardCOO />} />
          <Route path="materi" element={<MateriCOO />} />
          <Route path="add-materi" element={<AddMateriCOO />} />
          <Route path="edit-materi/:id" element={<EditMateriCOO />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/:id" element={<QuizDetail />} />
          <Route path="add-quiz" element={<AddQuiz />} />
          <Route path="add-question/:quizId" element={<AddQuestion />} />
          <Route path="edit-quiz/:id" element={<EditQuiz />} />
          <Route path="presensi" element={<PresensiCOO />} />
          <Route path="laporan-presensi" element={<LaporanPresensiCOO />} />
          <Route path="settings-attendance" element={<SettingsAttendance />} />
          <Route path="data-management" element={<DataManagement />} />
          <Route path="peserta/:id/detail" element={<DetailPesertaCOO />} />
          <Route path="profile" element={<ProfileCOO />} />
          <Route path="settings" element={<SettingsCOO />} />
        </Route>

        {/* ============================================ */}
        {/* MENTOR ROUTES - Created by: Mentor Developer */}
        {/* ============================================ */}
        <Route
          path="/mentor"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardMentor />} />
          <Route path="daftar-peserta" element={<DaftarPesertaMentor />} />
          <Route path="peserta" element={<DaftarPesertaMentor />} />
          <Route path="peserta/:id" element={<DetailPesertaMentor />} />
          <Route path="presensi" element={<PresensiMentor />} />
          <Route path="presensi-daily-report" element={<PresensiDailyReport />} />
          
          {/* Materi Mentor Routes */}
          <Route path="materi" element={<DaftarMateri />} />
          <Route path="add-materi" element={<AddMateri />} />
          <Route path="edit-materi/:id" element={<EditMateri />} />
          <Route path="materi/:id" element={<LihatMateri />} />
          
          {/* Tugas Mentor Routes */}
          <Route path="tugas" element={<DaftarTugasMentor />} />
          <Route path="add-tugas" element={<AddTugas />} />
          <Route path="validasi-tugas" element={<ValidasiTugas />} />
          <Route path="validasi-tugas/:id" element={<ValidasiTugas />} />
          
          {/* Nilai & Laporan Routes */}
          <Route path="laporan-akhir" element={<LaporanAkhir />} />
          <Route path="input-nilai-manual" element={<InputNilaiManual />} />
          <Route path="penilaian-manual" element={<InputNilaiManual />} />
          <Route path="nilai-akhir" element={<NilaiAkhirMentor />} />
        </Route>

        {/* ============================================ */}
        {/* PESERTA ROUTES - Created by: Peserta Developer */}
        {/* ============================================ */}
        <Route
          path="/peserta"
          element={
            <ProtectedRoute allowedRoles={["peserta"]}>
              <PesertaLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPeserta />} />
          <Route path="presensi" element={<PresensiPeserta />} />
          <Route path="riwayat-presensi" element={<RiwayatPresensiPeserta />} />
          <Route path="materi-mentor" element={<MateriMentor />} />
          <Route path="materi-kompetensi" element={<MateriKompetensi />} />
          
          {/* Kuis Routes */}
          <Route path="kuis-kompetensi" element={<KuisKompetensi />} />
          <Route path="kuis-kompetensi/:id" element={<KuisKompetensi />} />
          
          {/* Tugas Routes */}
          <Route path="tugas" element={<DaftarTugasPeserta />} />
          <Route path="tugas/:id" element={<DetailTugas />} />
          
          {/* Nilai & Sertifikat Routes */}
          <Route path="nilai-akhir" element={<NilaiAkhirPeserta />} />
          <Route path="sertifikat" element={<Sertifikat />} />
        </Route>

        {/* ============================================ */}
        {/* 404 NOT FOUND ROUTE - Created by: System Architect */}
        {/* ============================================ */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Auto Logout Warning Modal */}
      {isAuthenticated && showWarning && (
        <IdleWarningModal
          countdown={countdown}
          formatCountdown={formatCountdown}
          onContinue={continueSession}
          onLogout={handleAutoLogout}
        />
      )}
    </>
  );
}

// ============================================
// NOT FOUND COMPONENT 
// ============================================
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/30">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md mx-4">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-4xl font-bold text-white">404</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-slate-500 mb-6">Maaf, halaman yang Anda cari tidak tersedia.</p>
        <a 
          href="/login" 
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
        >
          Kembali ke Login
        </a>
      </div>
    </div>
  );
}

export default App;