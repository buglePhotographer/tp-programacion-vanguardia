import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface Props {
    soloRol?: "estudiante" | "docente" | "admin"
}

export default function ProtectedRoute({ soloRol }: Props) {
    const { user, loading } = useAuth()

    if (loading) return <p>Cargando...</p>
    if (!user) return <Navigate to="/login" />
    if (soloRol && user.rol !== soloRol) return <Navigate to="/dashboard" />

    return <Outlet />
}
