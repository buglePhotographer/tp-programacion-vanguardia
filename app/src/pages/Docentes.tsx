import { useEffect, useState } from "react"
import { registerRequest, updateUsuario, deleteUsuario } from "../services/auth.service"
import api from "../services/api"

interface Usuario { id: number; nombre: string; email: string }

const FORM_VACIO = { nombre: "", email: "", password: "" }

export default function Docentes() {
    const [docentes, setDocentes] = useState<Usuario[]>([])
    const [form, setForm] = useState(FORM_VACIO)
    const [editando, setEditando] = useState<Usuario | null>(null)
    const [mostrarForm, setMostrarForm] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
    const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null)
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState("")

    async function cargar() {
        api.get("/auth/usuarios?rol=docente").then(r => setDocentes(r.data)).catch(() => {})
    }

    useEffect(() => { cargar() }, [])

    function iniciarEdicion(u: Usuario) {
        setEditando(u)
        setForm({ nombre: u.nombre, email: u.email, password: "" })
        setMostrarForm(true)
        setConfirmDelete(null); setMensaje(null)
    }

    function cancelarForm() {
        setEditando(null); setForm(FORM_VACIO); setMostrarForm(false); setMensaje(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setMensaje(null); setLoading(true)
        try {
            if (editando) {
                const data: Record<string, string> = { nombre: form.nombre, email: form.email }
                if (form.password) data.password = form.password
                await updateUsuario(editando.id, data)
                setMensaje({ texto: `Docente ${form.nombre} actualizado`, tipo: "ok" })
            } else {
                await registerRequest(form.nombre, form.email, form.password, "docente")
                setMensaje({ texto: `Docente ${form.nombre} creado`, tipo: "ok" })
            }
            cancelarForm(); cargar()
        } catch (err: any) {
            setMensaje({ texto: err.response?.data?.detail ?? "Error al guardar", tipo: "error" })
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: number) {
        setLoading(true); setMensaje(null)
        try {
            await deleteUsuario(id)
            setMensaje({ texto: "Docente eliminado", tipo: "ok" })
            setConfirmDelete(null)
            if (editando?.id === id) cancelarForm()
            cargar()
        } catch (err: any) {
            setMensaje({ texto: err.response?.data?.detail ?? "Error al eliminar", tipo: "error" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f9" }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg,#12172b 0%,#1a2555 100%)",
                padding: "2rem 2rem 1.75rem",
                display: "flex", alignItems: "center", gap: "1rem",
            }}>
                <div>
                    <h1 style={{ color: "white", margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>👨‍🏫 Docentes</h1>
                    <p style={{ color: "rgba(255,255,255,.5)", margin: ".3rem 0 0", fontSize: ".85rem" }}>
                        Gestión del cuerpo docente
                    </p>
                </div>
                <button
                    onClick={() => mostrarForm && !editando ? cancelarForm() : (setMostrarForm(true), setEditando(null), setForm(FORM_VACIO))}
                    style={{
                        marginLeft: "auto", flexShrink: 0,
                        padding: ".5rem 1.1rem",
                        background: mostrarForm && !editando ? "rgba(255,255,255,.1)" : "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                        color: "white", border: "none", borderRadius: 999,
                        fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
                        boxShadow: mostrarForm && !editando ? "none" : "0 4px 12px rgba(139,92,246,.4)",
                    }}
                >
                    {mostrarForm && !editando ? "✕ Cancelar" : "+ Nuevo docente"}
                </button>
            </div>

            <div style={{ padding: "1.75rem 2rem" }}>

                {mensaje && (
                    <div style={{
                        background: mensaje.tipo === "ok" ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${mensaje.tipo === "ok" ? "#86efac" : "#fca5a5"}`,
                        color: mensaje.tipo === "ok" ? "#15803d" : "#b91c1c",
                        borderRadius: 8, padding: ".7rem 1rem", marginBottom: "1.25rem",
                        fontSize: ".88rem", fontWeight: 500,
                    }}>
                        {mensaje.tipo === "ok" ? "✓" : "✕"} {mensaje.texto}
                    </div>
                )}

                {/* Formulario inline */}
                {mostrarForm && (
                    <div style={{
                        background: "white", borderRadius: 12,
                        border: "1.5px solid #ddd6fe",
                        padding: "1.25rem 1.5rem", marginBottom: "1.25rem",
                        boxShadow: "0 4px 16px rgba(139,92,246,.1)",
                    }}>
                        <h3 style={{ margin: "0 0 1rem", fontSize: ".95rem", color: "#1e3a5f" }}>
                            {editando ? `✏️ Editando: ${editando.email}` : "➕ Nuevo docente"}
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                            {[
                                { key: "nombre",   placeholder: "Nombre completo",         type: "text",     flex: 3, required: true },
                                { key: "email",    placeholder: "Email",                   type: "email",    flex: 3, required: true },
                                { key: "password", placeholder: editando ? "Nueva contraseña (opcional)" : "Contraseña", type: "password", flex: 2, required: !editando },
                            ].map(f => (
                                <div key={f.key} style={{ flex: f.flex, minWidth: 140 }}>
                                    <input
                                        type={f.type} placeholder={f.placeholder}
                                        value={form[f.key as keyof typeof form]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        required={f.required}
                                        style={{ width: "100%", boxSizing: "border-box", padding: ".55rem .8rem", fontSize: ".88rem", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", outline: "none" }}
                                        onFocus={e => { e.target.style.borderColor = "#8b5cf6"; e.target.style.background = "white" }}
                                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc" }}
                                    />
                                </div>
                            ))}
                            <div style={{ display: "flex", gap: ".5rem" }}>
                                <button type="submit" disabled={loading} style={{
                                    padding: ".55rem 1.1rem", borderRadius: 8, border: "none",
                                    background: loading ? "#a78bfa" : "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                                    color: "white", fontWeight: 700, fontSize: ".85rem",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    boxShadow: "0 3px 10px rgba(139,92,246,.3)", whiteSpace: "nowrap" as const,
                                }}>
                                    {loading ? "Guardando..." : editando ? "Guardar cambios" : "Crear docente"}
                                </button>
                                <button type="button" onClick={cancelarForm} style={{
                                    padding: ".55rem .9rem", borderRadius: 8,
                                    border: "1.5px solid #e2e8f0", background: "white",
                                    color: "#64748b", fontWeight: 600, fontSize: ".85rem", cursor: "pointer",
                                }}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Buscador */}
                <div style={{ marginBottom: "1rem", position: "relative" }}>
                    <span style={{ position: "absolute", left: ".8rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: ".9rem", pointerEvents: "none" }}>🔍</span>
                    <input
                        placeholder="Buscar por nombre o email..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box", padding: ".55rem .8rem .55rem 2.2rem", fontSize: ".88rem", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "white", outline: "none" }}
                        onFocus={e => { e.target.style.borderColor = "#8b5cf6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,.12)" }}
                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "" }}
                    />
                </div>

                {/* Lista */}
                {(() => {
                    const filtrados = docentes.filter(u =>
                        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                        u.email.toLowerCase().includes(busqueda.toLowerCase())
                    )
                    return filtrados.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#6b7a99", background: "white", borderRadius: 12 }}>
                        {busqueda ? "No hay resultados para tu búsqueda." : "No hay docentes registrados aún."}
                    </div>
                ) : (
                    <>
                    <div style={{ display: "grid", gap: ".75rem" }}>
                        {filtrados.map(u => {
                            const esBorrando = confirmDelete === u.id
                            return (
                                <div key={u.id} style={{
                                    background: "white", borderRadius: 12,
                                    border: editando?.id === u.id ? "1.5px solid #ddd6fe" : "1px solid #e8ecf4",
                                    boxShadow: editando?.id === u.id ? "0 4px 16px rgba(139,92,246,.1)" : "0 2px 8px rgba(0,0,0,.06)",
                                    padding: "1.1rem 1.4rem",
                                    display: "flex", alignItems: "center", gap: "1rem",
                                }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                                        background: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                                        color: "white", fontWeight: 700, fontSize: "1.1rem",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        boxShadow: "0 3px 10px rgba(139,92,246,.3)",
                                    }}>
                                        {u.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: ".97rem", color: "#1a2035" }}>{u.nombre}</div>
                                        <div style={{ fontSize: ".8rem", color: "#6b7a99", marginTop: ".15rem" }}>✉ {u.email}</div>
                                    </div>
                                    <span style={{ fontSize: ".72rem", fontWeight: 700, padding: ".18rem .65rem", borderRadius: 999, background: "rgba(139,92,246,.1)", color: "#7c3aed", border: "1px solid rgba(139,92,246,.2)", flexShrink: 0 }}>
                                        Docente
                                    </span>

                                    {!esBorrando ? (
                                        <div style={{ display: "flex", gap: ".5rem", flexShrink: 0 }}>
                                            <button onClick={() => editando?.id === u.id ? cancelarForm() : iniciarEdicion(u)} style={{ padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem", fontWeight: 600, cursor: "pointer", border: "none", background: editando?.id === u.id ? "#e0e7ff" : "#f1f5f9", color: editando?.id === u.id ? "#3730a3" : "#475569" }}>
                                                {editando?.id === u.id ? "Cancelar" : "✏️ Editar"}
                                            </button>
                                            <button onClick={() => { setConfirmDelete(u.id); setMensaje(null) }} style={{ padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem", fontWeight: 600, cursor: "pointer", border: "none", background: "#fff1f2", color: "#be123c" }}>
                                                🗑 Eliminar
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexShrink: 0 }}>
                                            <span style={{ fontSize: ".78rem", color: "#b91c1c", fontWeight: 600 }}>¿Confirmar?</span>
                                            <button onClick={() => handleDelete(u.id)} disabled={loading} style={{ padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem", fontWeight: 700, cursor: "pointer", border: "none", background: "#ef4444", color: "white" }}>Sí, eliminar</button>
                                            <button onClick={() => setConfirmDelete(null)} style={{ padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem", fontWeight: 600, cursor: "pointer", border: "none", background: "#f1f5f9", color: "#475569" }}>Cancelar</button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    {busqueda && filtrados.length > 0 && (
                        <p style={{ marginTop: ".75rem", fontSize: ".8rem", color: "#6b7a99" }}>
                            {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} para "{busqueda}"
                        </p>
                    )}
                    </>
                )
                })()}
            </div>
        </div>
    )
}
