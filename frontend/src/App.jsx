import { Routes, Route } from "react-router-dom"
import AdminLayout from "./layouts/AdminLayout"

import Login from "./pages/auth/Login"
import DashboardAdmin from "./pages/admin/Dashboard"
import Users from "./pages/admin/Users"
import AddMentor from "./pages/admin/AddMentor"
import AddPeserta from "./pages/admin/AddPeserta"
import EditUser from "./pages/admin/EditUser"
import Divisi from "./pages/admin/Divisi"

function App() {
  return (
    <Routes>

      {/* LOGIN (NO SIDEBAR) */}
      <Route path="/" element={<Login />} />

      {/* 🔥 SEMUA HALAMAN ADMIN PAKAI ADMIN LAYOUT */}
     <Route element={<AdminLayout />}>
      <Route path="/admin/dashboard" element={<DashboardAdmin />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/divisi" element={<Divisi />} /> {/* 🔥 TAMBAH INI */}
      <Route path="/admin/add-mentor" element={<AddMentor />} />
      <Route path="/admin/add-peserta" element={<AddPeserta />} />
      <Route path="/admin/edit-user/:id" element={<EditUser />} />
    </Route>

    </Routes>
  )
}

export default App