import { Routes, Route } from "react-router-dom"

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

// 🔥 COO
import CooLayout from "./layouts/CooLayout"
import DashboardCOO from "./pages/coo/Dashboard"
import Materi from "./pages/coo/Materi"
import AddMateri from "./pages/coo/AddMateri"


// 🔥 QUIZ
import Quiz from "./pages/coo/Quiz"
import AddQuiz from "./pages/coo/AddQuiz"
import AddQuestion from "./pages/coo/AddQuestion"
import QuizDetail from "./pages/coo/QuizDetail"

function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/" element={<Login />} />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="users" element={<Users />} />
        <Route path="add-mentor" element={<AddMentor />} />
        <Route path="add-peserta" element={<AddPeserta />} />
        <Route path="edit-user/:id" element={<EditUser />} />
        <Route path="divisi" element={<Divisi />} />
      </Route>

      {/* COO */}
     <Route path="/coo" element={<CooLayout />}>
      <Route path="dashboard" element={<DashboardCOO />} />

      {/* 🔥 MATERI */}
      <Route path="materi" element={<Materi />} />
      <Route path="add-materi" element={<AddMateri />} />

      {/* 🔥 QUIZ */}
      <Route path="quiz" element={<Quiz />} />
      <Route path="add-quiz" element={<AddQuiz />} />
      <Route path="add-question" element={<AddQuestion />} />
      <Route path="quiz/:id" element={<QuizDetail />} />
    </Route>

    </Routes>
  )
}

export default App