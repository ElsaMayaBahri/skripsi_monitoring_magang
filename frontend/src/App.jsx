import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// AUTH
import Login from "./pages/auth/Login";

// ADMIN
import AdminLayout from "./layouts/AdminLayout";
import DashboardAdmin from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import AddMentor from "./pages/admin/AddMentor";
import AddPeserta from "./pages/admin/AddPeserta";
import EditPeserta from "./pages/admin/EditPeserta";
import EditMentor from "./pages/admin/EditMentor";
import Divisi from "./pages/admin/Divisi";
import AdminSettings from "./pages/admin/Settings";

// COO
import CooLayout from "./layouts/CooLayout";
import DashboardCOO from "./pages/coo/Dashboard";
import Materi from "./pages/coo/Materi";
import AddMateri from "./pages/coo/AddMateri";
import EditMateri from "./pages/coo/EditMateri";

// QUIZ
import Quiz from "./pages/coo/Quiz";
import AddQuiz from "./pages/coo/AddQuiz";
import AddQuestion from "./pages/coo/AddQuestion";
import QuizDetail from "./pages/coo/QuizDetail";
import EditQuiz from "./pages/coo/EditQuiz";

// PRESENSI
import Presensi from "./pages/coo/Presensi";
import LaporanPresensi from "./pages/coo/LaporanPresensi";

// SETTINGS
import SettingsAttendance from "./pages/coo/SettingsAttendance";

// COMPONENT
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    setIsAuthenticated(!!token);
    setUserRole(role);
    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      setIsAuthenticated(!!token);
      setUserRole(role);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            userRole === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : userRole === "coo" || userRole === "mentor" ? (
              <Navigate to="/coo/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ADMIN ROUTES */}
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
        {/* EDIT ROUTES - Dipisah untuk Peserta dan Mentor */}
        <Route path="users/edit-peserta/:id" element={<EditPeserta />} />
        <Route path="users/edit-mentor/:id" element={<EditMentor />} />
        <Route path="divisi" element={<Divisi />} />
      </Route>

      {/* COO ROUTES */}
      <Route
        path="/coo"
        element={
          <ProtectedRoute allowedRoles={["coo", "mentor"]}>
            <CooLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardCOO />} />
        
        {/* Materi Routes */}
        <Route path="materi" element={<Materi />} />
        <Route path="add-materi" element={<AddMateri />} />
        <Route path="edit-materi/:id" element={<EditMateri />} />
        
        {/* Quiz Routes */}
        <Route path="quiz" element={<Quiz />} />
        <Route path="quiz/:id" element={<QuizDetail />} />
        <Route path="add-quiz" element={<AddQuiz />} />
        <Route path="add-question/:quizId" element={<AddQuestion />} />
        <Route path="edit-quiz/:id" element={<EditQuiz />} />
        
        {/* Presensi Routes */}
        <Route path="presensi" element={<Presensi />} />
        <Route path="laporan-presensi" element={<LaporanPresensi />} />
        
        {/* Settings Routes */}
        <Route path="settings-attendance" element={<SettingsAttendance />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

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