import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Materias from "./pages/Materias"
import MateriaDetalle from "./pages/MateriaDetalle"
import MisNotas from "./pages/MisNotas"
import MisEntregas from "./pages/MisEntregas"
import AdminPanel from "./pages/AdminPanel"
import Docentes from "./pages/Docentes"
import Alumnos from "./pages/Alumnos"

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/materias" element={<Materias />} />
                    <Route path="/materias/:id" element={<MateriaDetalle />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute soloRol="estudiante" />}>
                <Route element={<Layout />}>
                    <Route path="/mis-notas" element={<MisNotas />} />
                    <Route path="/mis-entregas" element={<MisEntregas />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute soloRol="admin" />}>
                <Route element={<Layout />}>
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/docentes" element={<Docentes />} />
                    <Route path="/alumnos" element={<Alumnos />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    )
}
