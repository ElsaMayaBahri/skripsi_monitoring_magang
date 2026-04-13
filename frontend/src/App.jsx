import { Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"

// 🔥 AUTH
import Login from "./pages/auth/Login"

// 🔥 ADMIN
import AdminLayout from "./layouts/AdminLayout"
import DashboardAdmin from "./pages/admin/Dashboard"
import Users from "./pages/admin/Users"
import AddMentor from "./pages/admin/AddMentor"
import AddPeserta from "./pages/admin/AddPeserta"
import EditUser from "./pages/admin/EditUser"
import Divisi from "./pages/admin/Divisi"

// 🔥 COO/MENTOR
import CooLayout from "./layouts/CooLayout"
import DashboardCOO from "./pages/coo/Dashboard"
import Materi from "./pages/coo/Materi"
import AddMateri from "./pages/coo/AddMateri"
import EditMateri from "./pages/coo/EditMateri"

// 🔥 QUIZ (COO/MENTOR)
import Quiz from "./pages/coo/Quiz"
import AddQuiz from "./pages/coo/AddQuiz"
import AddQuestion from "./pages/coo/AddQuestion"
import QuizDetail from "./pages/coo/QuizDetail"

// 🔥 COMPONENTS
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"))

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"))
      setUserRole(localStorage.getItem("role"))
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* ROOT REDIRECT */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            userRole === "admin" ? <Navigate to="/admin/dashboard" replace /> :
            userRole === "coo" || userRole === "mentor" ? <Navigate to="/coo/dashboard" replace /> :
            <Navigate to="/login" replace />
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

        {/* MATERI */}
        <Route path="materi" element={<Materi />} />
        <Route path="add-materi" element={<AddMateri />} />
        <Route path="edit-materi/:id" element={<EditMateri />} />

        {/* QUIZ */}
        <Route path="quiz" element={<Quiz />} />
        <Route path="add-quiz" element={<AddQuiz />} />
        <Route path="add-question/:quizId" element={<AddQuestion />} />
        <Route path="quiz/:id" element={<QuizDetail />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// 404 COMPONENT
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
  )
}

export default App