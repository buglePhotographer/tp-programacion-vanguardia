import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getAvisosGlobales } from "../services/avisos.service"
import api from "../services/api"
import "./Dashboard.css"

interface Aviso { id: number; titulo: string; contenido: string; autor: { nombre: string } }

interface StatCard {
    label: string; value: string | number; icon: string
    bg: string; shadow: string; sub?: string
}

export default function Dashboard() {
    const { user } = useAuth()
    const [avisos, setAvisos] = useState<Aviso[]>([])
    const [stats, setStats] = useState<StatCard[]>([])

    useEffect(() => {
        getAvisosGlobales().then(r => setAvisos(r.data)).catch(() => {})

        if (user?.rol === "admin") {
            Promise.all([
                api.get("/materias/"),
                api.get("/auth/usuarios?rol=docente"),
                api.get("/auth/usuarios?rol=estudiante"),
            ]).then(([m, d, e]) => setStats([
                { label: "Materias",   value: m.data.length, icon: "📚", bg: "linear-gradient(135deg,#4ade80,#16a34a)", shadow: "rgba(74,222,128,.35)",  sub: "activas" },
                { label: "Docentes",   value: d.data.length, icon: "👨‍🏫", bg: "linear-gradient(135deg,#818cf8,#4f46e5)", shadow: "rgba(129,140,248,.35)", sub: "registrados" },
                { label: "Alumnos",    value: e.data.length, icon: "🎓", bg: "linear-gradient(135deg,#f97316,#ea580c)", shadow: "rgba(249,115,22,.35)",  sub: "inscriptos" },
                { label: "Avisos",     value: avisos.length, icon: "📢", bg: "linear-gradient(135deg,#f472b6,#db2777)", shadow: "rgba(244,114,182,.35)", sub: "publicados" },
            ])).catch(() => {})
        }

        if (user?.rol === "estudiante") {
            api.get("/inscripciones/mis-materias").then(r => {
                const insc = r.data
                const aprobadas   = insc.filter((i: any) => i.estado === "aprobada").length
                const activas     = insc.filter((i: any) => i.estado === "activa").length
                const notas       = insc.filter((i: any) => i.nota_final != null).map((i: any) => i.nota_final)
                const promedio    = notas.length ? (notas.reduce((a: number, b: number) => a + b, 0) / notas.length).toFixed(1) : "—"
                setStats([
                    { label: "Inscripto en",  value: insc.length,  icon: "📚", bg: "linear-gradient(135deg,#4ade80,#16a34a)", shadow: "rgba(74,222,128,.35)",  sub: "materias" },
                    { label: "Aprobadas",     value: aprobadas,    icon: "✅", bg: "linear-gradient(135deg,#3b82f6,#1d4ed8)", shadow: "rgba(59,130,246,.35)",  sub: "materias" },
                    { label: "En cursada",    value: activas,      icon: "📖", bg: "linear-gradient(135deg,#f97316,#ea580c)", shadow: "rgba(249,115,22,.35)",  sub: "activas" },
                    { label: "Promedio",      value: promedio,     icon: "⭐", bg: "linear-gradient(135deg,#f472b6,#db2777)", shadow: "rgba(244,114,182,.35)", sub: "general" },
                ])
            }).catch(() => {})
        }

        if (user?.rol === "docente") {
            api.get("/materias/").then(r => setStats([
                { label: "Materias",  value: r.data.length, icon: "📚", bg: "linear-gradient(135deg,#4ade80,#16a34a)", shadow: "rgba(74,222,128,.35)", sub: "en el sistema" },
            ])).catch(() => {})
        }
    }, [user])

    // re-run stats when avisos load (for admin aviso count)
    useEffect(() => {
        if (user?.rol === "admin" && stats.length === 4) {
            setStats(prev => prev.map(s => s.label === "Avisos" ? { ...s, value: avisos.length } : s))
        }
    }, [avisos])

    const hora = new Date().getHours()
    const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches"

    return (
        <>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg,#12172b 0%,#1a2555 100%)",
                padding: "2rem 2rem 2.5rem",
                position: "relative", overflow: "hidden",
            }}>
                {/* Decoración de fondo */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200,
                    borderRadius: "50%", background: "rgba(74,222,128,.07)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, right: 100, width: 160, height: 160,
                    borderRadius: "50%", background: "rgba(129,140,248,.07)", pointerEvents: "none" }} />

                <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".8rem", marginBottom: ".3rem",
                    textTransform: "uppercase", letterSpacing: ".1em" }}>
                    {saludo}
                </p>
                <h1 style={{ color: "white", fontSize: "1.8rem", marginBottom: ".4rem" }}>
                    {user?.nombre} 👋
                </h1>
                <p style={{ color: "rgba(255,255,255,.45)", fontSize: ".85rem" }}>
                    Panel de control · Plataforma Académica
                </p>

                {/* Stat cards superpuestas */}
                {stats.length > 0 && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                        gap: "1rem",
                        marginTop: "2rem",
                    }}>
                        {stats.map(s => (
                            <div key={s.label} style={{
                                background: "rgba(255,255,255,.06)",
                                border: "1px solid rgba(255,255,255,.1)",
                                backdropFilter: "blur(8px)",
                                borderRadius: 14,
                                padding: "1.1rem 1.25rem",
                                display: "flex", alignItems: "center", gap: "1rem",
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                                    background: s.bg,
                                    boxShadow: `0 6px 16px ${s.shadow}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.3rem",
                                }}>
                                    {s.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "white", lineHeight: 1, letterSpacing: "-1px" }}>
                                        {s.value}
                                    </div>
                                    <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)", marginTop: ".25rem",
                                        textTransform: "uppercase", letterSpacing: ".06em" }}>
                                        {s.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="dash-content">

                {/* Quick links */}
                <div className="dash-section">
                    <div className="dash-section-title">Acceso rápido</div>
                    <div className="dash-links">
                        {[
                            { label: "Materias",     to: "/materias",     icon: "📚", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
                            ...(user?.rol === "estudiante" ? [
                                { label: "Mis Notas",    to: "/mis-notas",    icon: "📊", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
                                { label: "Mis Entregas", to: "/mis-entregas", icon: "📎", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
                            ] : []),
                            ...(user?.rol === "admin" ? [
                                { label: "Docentes", to: "/docentes", icon: "👨‍🏫", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
                                { label: "Alumnos",  to: "/alumnos",  icon: "🎓", color: "#be185d", bg: "#fdf2f8", border: "#fbcfe8" },
                            ] : []),
                        ].map(l => (
                            <Link key={l.to} to={l.to} className="dash-link" style={{
                                color: l.color, background: l.bg, borderColor: l.border,
                            }}>
                                <span>{l.icon}</span> {l.label} →
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Avisos */}
                <div className="dash-section">
                    <div className="dash-section-title">📢 Avisos generales</div>
                    {avisos.length === 0 ? (
                        <div className="dash-empty">No hay avisos publicados.</div>
                    ) : (
                        <div className="dash-avisos">
                            {avisos.map(a => (
                                <div key={a.id} className="aviso-card">
                                    <div className="aviso-icon">📌</div>
                                    <div className="aviso-body">
                                        <div className="aviso-titulo">{a.titulo}</div>
                                        <p className="aviso-contenido">{a.contenido}</p>
                                        <span className="aviso-autor">Por {a.autor.nombre}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
