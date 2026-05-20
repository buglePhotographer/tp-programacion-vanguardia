import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface NavItem { label: string; to: string; icon: string }

const itemsPorRol: Record<string, NavItem[]> = {
    admin: [
        { label: "Dashboard", to: "/dashboard", icon: "🏠" },
        { label: "Materias",  to: "/materias",  icon: "📚" },
        { label: "Docentes",  to: "/docentes",  icon: "👨‍🏫" },
        { label: "Alumnos",   to: "/alumnos",   icon: "🎓" },
    ],
    docente: [
        { label: "Dashboard", to: "/dashboard", icon: "🏠" },
        { label: "Materias",  to: "/materias",  icon: "📚" },
    ],
    estudiante: [
        { label: "Dashboard",    to: "/dashboard",    icon: "🏠" },
        { label: "Materias",     to: "/materias",     icon: "📚" },
        { label: "Mis Notas",    to: "/mis-notas",    icon: "📊" },
        { label: "Mis Entregas", to: "/mis-entregas", icon: "📤" },
    ],
}

const rolColor: Record<string, string> = {
    admin: "linear-gradient(135deg,#f97316,#ea580c)",
    docente: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    estudiante: "linear-gradient(135deg,#4ade80,#16a34a)",
}

export default function Sidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const items = user ? (itemsPorRol[user.rol] ?? []) : []

    return (
        <aside style={sidebarStyle}>

            {/* Logo */}
            <div style={logoAreaStyle}>
                <div style={logoBoxStyle}>🏛️</div>
                <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: ".95rem", lineHeight: 1.15 }}>
                        Plataforma
                    </div>
                    <div style={{ color: "rgba(255,255,255,.4)", fontSize: ".7rem", letterSpacing: ".06em", textTransform: "uppercase" }}>
                        Académica
                    </div>
                </div>
            </div>

            {/* Nav */}
            <div style={{ padding: "1rem 0", flex: 1 }}>
                <div style={{ padding: "0 1rem .5rem", fontSize: ".65rem", fontWeight: 600, color: "rgba(255,255,255,.25)", letterSpacing: ".1em", textTransform: "uppercase" }}>
                    Menú
                </div>
                {items.map(item => (
                    <NavLink key={item.to} to={item.to} style={({ isActive }) => linkStyle(isActive)}>
                        {({ isActive }) => (
                            <>
                                <span style={{
                                    width: 34, height: 34, borderRadius: 9,
                                    background: isActive ? "rgba(74,222,128,.18)" : "rgba(255,255,255,.05)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1rem", flexShrink: 0,
                                    transition: "background .15s",
                                }}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Usuario */}
            <div style={userAreaStyle}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: user ? rolColor[user.rol] : "#555",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, color: "white", fontSize: ".9rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,.3)",
                }}>
                    {user?.nombre.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: ".83rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user?.nombre}
                    </div>
                    <div style={{ color: "rgba(255,255,255,.35)", fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".05em" }}>
                        {user?.rol}
                    </div>
                </div>
                <button onClick={() => { logout(); navigate("/login") }} title="Cerrar sesión" style={logoutStyle}>
                    ↩
                </button>
            </div>
        </aside>
    )
}

const sidebarStyle: React.CSSProperties = {
    width: 230,
    minHeight: "100vh",
    background: "#12172b",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    boxShadow: "4px 0 20px rgba(0,0,0,.18)",
}

const logoAreaStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: ".85rem",
    padding: "1.5rem 1.25rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,.06)",
}

const logoBoxStyle: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 10,
    background: "linear-gradient(135deg,#4ade80,#16a34a)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.2rem", flexShrink: 0,
    boxShadow: "0 4px 12px rgba(74,222,128,.35)",
}

function linkStyle(isActive: boolean): React.CSSProperties {
    return {
        display: "flex", alignItems: "center", gap: ".75rem",
        padding: ".45rem .85rem .45rem 1rem",
        margin: "2px .75rem",
        borderRadius: 10,
        color: isActive ? "white" : "rgba(255,255,255,.45)",
        textDecoration: "none",
        fontSize: ".875rem",
        fontWeight: isActive ? 600 : 400,
        background: isActive ? "rgba(255,255,255,.08)" : "transparent",
        transition: "all .15s",
    }
}

const userAreaStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: ".75rem",
    padding: "1rem 1.25rem",
    borderTop: "1px solid rgba(255,255,255,.06)",
}

const logoutStyle: React.CSSProperties = {
    background: "rgba(255,255,255,.07)",
    border: "1px solid rgba(255,255,255,.1)",
    color: "rgba(255,255,255,.5)",
    cursor: "pointer", borderRadius: 8,
    width: 30, height: 30, fontSize: ".95rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, padding: 0, transition: "all .15s",
}
