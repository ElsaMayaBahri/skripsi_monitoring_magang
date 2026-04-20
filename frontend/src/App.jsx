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
import EditUser from "./pages/admin/EditUser";
import Divisi from "./pages/admin/Divisi";

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
import EditQuiz from "./pages/coo/EditQuiz";  // <-- TAMBAH IMPORT

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

      {/* ADMIN */}
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
        <Route path="edit-user/:id" element={<EditUser />} />
        <Route path="divisi" element={<Divisi />} />
      </Route>

      {/* COO */}
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
        <Route path="edit-quiz/:id" element={<EditQuiz />} />  {/* <-- TAMBAH ROUTE INI */}
        
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mt-2">Halaman tidak ditemukan</p>
        <a href="/login" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
          Kembali ke Login
        </a>
      </div>
    </div>
  );
}

export default App;