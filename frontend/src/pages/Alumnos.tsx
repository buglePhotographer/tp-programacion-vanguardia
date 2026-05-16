import { useEffect, useState } from "react"
import { registerRequest } from "../services/auth.service"
import api from "../services/api"

interface Usuario { id: number; nombre: string; email: string }

export default function Alumnos() {
    const [alumnos, setAlumnos] = useState<Usuario[]>([])
    const [form, setForm] = useState({ nombre: "", email: "", password: "" })
    const [mensaje, setMensaje] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState("")

    async function cargar() {
        api.get("/auth/usuarios?rol=estudiante").then(r => setAlumnos(r.data)).catch(() => {})
    }

    useEffect(() => { cargar() }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(""); setMensaje(""); setLoading(true)
        try {
            await registerRequest(form.nombre, form.email, form.password, "estudiante")
            setMensaje(`Alumno ${form.nombre} creado correctamente`)
            setForm({ nombre: "", email: "", password: "" })
            cargar()
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Error al crear alumno")
        } finally {
            setLoading(false)
        }
    }

    const filtrados = alumnos.filter(a =>
        a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.email.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #12172b 0%, #1a2555 100%)",
                padding: "2rem 2rem 2.5rem",
                position: "relative", overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200,
                    borderRadius: "50%", background: "rgba(244,114,182,.08)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, right: 120, width: 150, height: 150,
                    borderRadius: "50%", background: "rgba(219,39,119,.06)", pointerEvents: "none" }} />

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        background: "linear-gradient(135deg,#f472b6,#db2777)",
                        boxShadow: "0 6px 20px rgba(244,114,182,.4)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
                    }}>🎓</div>
                    <div>
                        <h1 style={{ color: "white", margin: 0, fontSize: "1.6rem" }}>Alumnos</h1>
                        <p style={{ color: "rgba(255,255,255,.45)", margin: 0, fontSize: ".85rem" }}>
                            Gestión de estudiantes inscriptos
                        </p>
                    </div>
                    <div style={{
                        marginLeft: "auto",
                        background: "rgba(244,114,182,.2)", border: "1px solid rgba(244,114,182,.35)",
                        color: "#f9a8d4", borderRadius: 999, padding: ".35rem .9rem",
                        fontSize: ".82rem", fontWeight: 600,
                    }}>
                        {alumnos.length} inscripto{alumnos.length !== 1 ? "s" : ""}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: "1.5rem 2rem 2rem", display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>

                {/* Lista */}
                <section>
                    {/* Buscador */}
                    <div style={{ marginBottom: "1rem", position: "relative" }}>
                        <span style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)",
                            color: "#94a3b8", fontSize: ".9rem", pointerEvents: "none" }}>🔍</span>
                        <input
                            placeholder="Buscar por nombre o email..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            style={{
                                width: "100%", boxSizing: "border-box",
                                padding: ".55rem .8rem .55rem 2.2rem",
                                fontSize: ".88rem", border: "1.5px solid #e2e8f0",
                                borderRadius: 8, background: "white", outline: "none",
                            }}
                            onFocus={e => { e.target.style.borderColor = "#f472b6"; e.target.style.boxShadow = "0 0 0 3px rgba(244,114,182,.12)" }}
                            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "" }}
                        />
                    </div>

                    {filtrados.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>🎓</div>
                            {busqueda ? "No hay resultados para tu búsqueda." : "No hay alumnos registrados aún."}
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: ".6rem" }}>
                            {filtrados.map(u => (
                                <div key={u.id} className="card" style={{
                                    display: "flex", alignItems: "center", gap: "1rem",
                                    padding: "1rem 1.25rem",
                                    borderLeft: "3px solid #f472b6",
                                    transition: "transform .15s, box-shadow .15s",
                                }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.transform = "translateX(3px)"
                                        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(244,114,182,.12)"
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.transform = ""
                                        ;(e.currentTarget as HTMLDivElement).style.boxShadow = ""
                                    }}
                                >
                                    <div style={{
                                        width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                                        background: "linear-gradient(135deg,#f472b6,#db2777)",
                                        color: "white", fontWeight: 700, fontSize: "1rem",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        boxShadow: "0 3px 10px rgba(244,114,182,.3)",
                                    }}>
                                        {u.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{u.nombre}</div>
                                        <div style={{ fontSize: ".8rem", color: "var(--text-muted)", marginTop: ".1rem",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            ✉ {u.email}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: ".72rem", fontWeight: 600, padding: ".25rem .7rem",
                                        borderRadius: 999, background: "rgba(244,114,182,.1)",
                                        color: "#be185d", border: "1px solid rgba(244,114,182,.2)",
                                        flexShrink: 0,
                                    }}>
                                        Estudiante
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {busqueda && filtrados.length > 0 && (
                        <p style={{ marginTop: ".75rem", fontSize: ".8rem", color: "var(--text-muted)" }}>
                            {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} para "{busqueda}"
                        </p>
                    )}
                </section>

                {/* Formulario */}
                <section className="card" style={{ padding: "1.5rem", position: "sticky", top: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1.25rem" }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: "linear-gradient(135deg,#f472b6,#db2777)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem",
                        }}>➕</div>
                        <h2 style={{ margin: 0, fontSize: "1rem" }}>Nuevo alumno</h2>
                    </div>

                    {mensaje && (
                        <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46",
                            borderRadius: 8, padding: ".65rem .9rem", fontSize: ".83rem", marginBottom: ".85rem",
                            display: "flex", alignItems: "center", gap: ".5rem" }}>
                            ✓ {mensaje}
                        </div>
                    )}
                    {error && (
                        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b",
                            borderRadius: 8, padding: ".65rem .9rem", fontSize: ".83rem", marginBottom: ".85rem",
                            display: "flex", alignItems: "center", gap: ".5rem" }}>
                            ✕ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
                        {[
                            { key: "nombre",   label: "Nombre completo",    type: "text",     placeholder: "Ej: Lucía Ramírez" },
                            { key: "email",    label: "Correo electrónico", type: "email",    placeholder: "alumno@plataforma.com" },
                            { key: "password", label: "Contraseña",         type: "password", placeholder: "Mínimo 8 caracteres" },
                        ].map(f => (
                            <div key={f.key}>
                                <label style={{ display: "block", fontSize: ".75rem", fontWeight: 600,
                                    color: "var(--text-muted)", marginBottom: ".3rem", textTransform: "uppercase",
                                    letterSpacing: ".05em" }}>
                                    {f.label}
                                </label>
                                <input
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={form[f.key as keyof typeof form]}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    required
                                    style={{
                                        width: "100%", boxSizing: "border-box",
                                        padding: ".55rem .8rem", fontSize: ".88rem",
                                        border: "1.5px solid #e2e8f0", borderRadius: 8,
                                        background: "#f8fafc", outline: "none",
                                        transition: "border-color .15s, box-shadow .15s",
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = "#f472b6"
                                        e.target.style.boxShadow = "0 0 0 3px rgba(244,114,182,.12)"
                                        e.target.style.background = "white"
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = "#e2e8f0"
                                        e.target.style.boxShadow = ""
                                        e.target.style.background = "#f8fafc"
                                    }}
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: ".4rem",
                                padding: ".65rem",
                                background: loading ? "#f9a8d4" : "linear-gradient(135deg,#f472b6,#db2777)",
                                color: "white", border: "none", borderRadius: 8,
                                fontWeight: 600, fontSize: ".88rem", cursor: loading ? "not-allowed" : "pointer",
                                boxShadow: loading ? "none" : "0 4px 12px rgba(244,114,182,.35)",
                                transition: "opacity .15s, box-shadow .15s",
                            }}
                        >
                            {loading ? "Creando..." : "Crear alumno"}
                        </button>
                    </form>
                </section>
            </div>
        </>
    )
}
