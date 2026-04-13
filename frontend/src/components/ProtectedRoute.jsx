import { Navigate } from "react-router-dom"

function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token")
  const userRole = localStorage.getItem("role")
  
  // Cek apakah user sudah login
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  // Cek apakah role diizinkan
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect ke dashboard sesuai role masing-masing
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />
    } else if (userRole === "coo" || userRole === "mentor") {
      return <Navigate to="/coo/dashboard" replace />
    }
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default ProtectedRoute