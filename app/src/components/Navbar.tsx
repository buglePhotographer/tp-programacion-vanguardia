import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate("/login")
    }

    return (
        <nav style={{ display: "flex", gap: "1rem", padding: "1rem", background: "#1e3a5f", color: "white" }}>
            <Link to="/dashboard" style={{ color: "white", fontWeight: "bold" }}>Plataforma Académica</Link>
            <Link to="/materias" style={{ color: "white" }}>Materias</Link>
            {user?.rol === "estudiante" && (
                <>
                    <Link to="/mis-notas" style={{ color: "white" }}>Mis Notas</Link>
                    <Link to="/mis-entregas" style={{ color: "white" }}>Mis Entregas</Link>
                </>
            )}
            {user?.rol === "admin" && (
                <Link to="/admin" style={{ color: "white" }}>Panel Admin</Link>
            )}
            <span style={{ marginLeft: "auto" }}>{user?.nombre} ({user?.rol})</span>
            <button onClick={handleLogout} style={{ color: "white", background: "transparent", border: "1px solid white", cursor: "pointer", padding: "0.2rem 0.8rem" }}>
                Salir
            </button>
        </nav>
    )
}
