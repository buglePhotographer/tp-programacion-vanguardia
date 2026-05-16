import { useEffect, useState } from "react"
import { registerRequest, updateUsuario, deleteUsuario } from "../services/auth.service"
import api from "../services/api"

interface Usuario { id: number; nombre: string; email: string }

const FORM_VACIO = { nombre: "", email: "", password: "" }
const ACCENT = { grad: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "#8b5cf6", shadow: "rgba(139,92,246,.35)", bg: "rgba(139,92,246,.1)", border: "rgba(139,92,246,.2)", text: "#7c3aed" }

export default function Docentes() {
    const [docentes, setDocentes] = useState<Usuario[]>([])
    const [form, setForm] = useState(FORM_VACIO)
    const [editando, setEditando] = useState<Usuario | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
    const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null)
    const [loading, setLoading] = useState(false)

    async function cargar() {
        api.get("/auth/usuarios?rol=docente").then(r => setDocentes(r.data)).catch(() => {})
    }

    useEffect(() => { cargar() }, [])

    function iniciarEdicion(u: Usuario) {
        setEditando(u)
        setForm({ nombre: u.nombre, email: u.email, password: "" })
        setMensaje(null); setConfirmDelete(null)
    }

    function cancelarEdicion() {
        setEditando(null); setForm(FORM_VACIO); setMensaje(null)
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
                setEditando(null)
            } else {
                await registerRequest(form.nombre, form.email, form.password, "docente")
                setMensaje({ texto: `Docente ${form.nombre} creado`, tipo: "ok" })
            }
            setForm(FORM_VACIO); cargar()
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
            if (editando?.id === id) cancelarEdicion()
            cargar()
        } catch (err: any) {
            setMensaje({ texto: err.response?.data?.detail ?? "Error al eliminar", tipo: "error" })
        } finally {
            setLoading(false)
        }
    }

    const campos = [
        { key: "nombre",   label: "Nombre completo",    type: "text",     placeholder: "Ej: María González",      required: true },
        { key: "email",    label: "Correo electrónico", type: "email",    placeholder: "docente@plataforma.com",  required: true },
        { key: "password", label: editando ? "Nueva contraseña (opcional)" : "Contraseña", type: "password", placeholder: "Mínimo 8 caracteres", required: !editando },
    ]

    return (
        <>
            <div style={{ background: "linear-gradient(135deg,#12172b 0%,#1a2555 100%)", padding: "2rem 2rem 2.5rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,.08)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: ACCENT.grad, boxShadow: `0 6px 20px ${ACCENT.shadow}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>👨‍🏫</div>
                    <div>
                        <h1 style={{ color: "white", margin: 0, fontSize: "1.6rem" }}>Docentes</h1>
                        <p style={{ color: "rgba(255,255,255,.45)", margin: 0, fontSize: ".85rem" }}>Gestión del cuerpo docente</p>
                    </div>
                    <div style={{ marginLeft: "auto", background: "rgba(139,92,246,.2)", border: "1px solid rgba(139,92,246,.35)", color: "#c4b5fd", borderRadius: 999, padding: ".35rem .9rem", fontSize: ".82rem", fontWeight: 600 }}>
                        {docentes.length} registrado{docentes.length !== 1 ? "s" : ""}
                    </div>
                </div>
            </div>

            <div style={{ padding: "1.5rem 2rem 2rem", display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
                <section>
                    {mensaje && (
                        <div style={{ background: mensaje.tipo === "ok" ? "#d1fae5" : "#fee2e2", border: `1px solid ${mensaje.tipo === "ok" ? "#6ee7b7" : "#fca5a5"}`, color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b", borderRadius: 8, padding: ".65rem .9rem", fontSize: ".83rem", marginBottom: ".85rem", display: "flex", gap: ".5rem" }}>
                            {mensaje.tipo === "ok" ? "✓" : "✕"} {mensaje.texto}
                        </div>
                    )}

                    {docentes.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>👨‍🏫</div>
                            No hay docentes registrados aún.
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: ".6rem" }}>
                            {docentes.map(u => {
                                const esBorrando = confirmDelete === u.id
                                return (
                                    <div key={u.id} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderLeft: `3px solid ${editando?.id === u.id ? ACCENT.color : "#e2e8f0"}`, boxShadow: editando?.id === u.id ? `0 4px 16px ${ACCENT.shadow}` : "" }}>
                                        <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: ACCENT.grad, color: "white", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 10px ${ACCENT.shadow}` }}>
                                            {u.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: ".95rem" }}>{u.nombre}</div>
                                            <div style={{ fontSize: ".8rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✉ {u.email}</div>
                                        </div>
                                        <div style={{ fontSize: ".72rem", fontWeight: 600, padding: ".25rem .7rem", borderRadius: 999, background: ACCENT.bg, color: ACCENT.text, border: `1px solid ${ACCENT.border}`, flexShrink: 0 }}>Docente</div>

                                        {!esBorrando ? (
                                            <div style={{ display: "flex", gap: ".5rem", flexShrink: 0 }}>
                                                <button onClick={() => editando?.id === u.id ? cancelarEdicion() : iniciarEdicion(u)} style={{ padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem", fontWeight: 600, cursor: "pointer", border: "none", background: editando?.id === u.id ? "#e0e7ff" : "#f1f5f9", color: editando?.id === u.id ? "#3730a3" : "#475569" }}>
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
                    )}
                </section>

                <section className="card" style={{ padding: "1.5rem", position: "sticky", top: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1.25rem" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: ACCENT.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem" }}>
                            {editando ? "✏️" : "➕"}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1rem" }}>{editando ? "Editar docente" : "Nuevo docente"}</h2>
                            {editando && <p style={{ margin: 0, fontSize: ".75rem", color: "var(--text-muted)" }}>Modificando: {editando.email}</p>}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
                        {campos.map(f => (
                            <div key={f.key}>
                                <label style={{ display: "block", fontSize: ".75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: ".3rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{f.label}</label>
                                <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required={f.required}
                                    style={{ width: "100%", boxSizing: "border-box", padding: ".55rem .8rem", fontSize: ".88rem", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", outline: "none" }}
                                    onFocus={e => { e.target.style.borderColor = ACCENT.color; e.target.style.boxShadow = `0 0 0 3px rgba(139,92,246,.12)`; e.target.style.background = "white" }}
                                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = ""; e.target.style.background = "#f8fafc" }}
                                />
                            </div>
                        ))}
                        <div style={{ display: "flex", gap: ".5rem", marginTop: ".4rem" }}>
                            <button type="submit" disabled={loading} style={{ flex: 1, padding: ".65rem", background: loading ? "#a78bfa" : ACCENT.grad, color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: ".88rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : `0 4px 12px ${ACCENT.shadow}` }}>
                                {loading ? "Guardando..." : editando ? "Guardar cambios" : "Crear docente"}
                            </button>
                            {editando && (
                                <button type="button" onClick={cancelarEdicion} style={{ padding: ".65rem .9rem", border: "1.5px solid #e2e8f0", background: "white", borderRadius: 8, fontWeight: 600, fontSize: ".88rem", cursor: "pointer", color: "#475569" }}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </section>
            </div>
        </>
    )
}
