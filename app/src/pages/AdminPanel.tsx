import { useEffect, useState } from "react"
import { getMaterias, createMateria, updateMateria, deleteMateria } from "../services/materias.service"

interface Materia {
    id: number
    nombre: string
    codigo: string
    descripcion?: string
    docente?: { nombre: string }
}

const FORM_VACIO = { nombre: "", codigo: "", descripcion: "" }

export default function AdminPanel() {
    const [materias, setMaterias] = useState<Materia[]>([])
    const [form, setForm] = useState(FORM_VACIO)
    const [editando, setEditando] = useState<Materia | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
    const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null)
    const [loading, setLoading] = useState(false)

    async function cargar() {
        getMaterias().then(r => setMaterias(r.data)).catch(() => {})
    }

    useEffect(() => { cargar() }, [])

    function iniciarEdicion(m: Materia) {
        setEditando(m)
        setForm({ nombre: m.nombre, codigo: m.codigo, descripcion: m.descripcion ?? "" })
        setMensaje(null)
        setConfirmDelete(null)
    }

    function cancelarEdicion() {
        setEditando(null)
        setForm(FORM_VACIO)
        setMensaje(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true); setMensaje(null)
        try {
            if (editando) {
                await updateMateria(editando.id, form)
                setMensaje({ texto: `Materia "${form.nombre}" actualizada correctamente`, tipo: "ok" })
                setEditando(null)
            } else {
                await createMateria(form)
                setMensaje({ texto: `Materia "${form.nombre}" creada correctamente`, tipo: "ok" })
            }
            setForm(FORM_VACIO)
            cargar()
        } catch (err: any) {
            setMensaje({ texto: err.response?.data?.detail ?? "Error al guardar la materia", tipo: "error" })
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: number) {
        setLoading(true)
        try {
            await deleteMateria(id)
            setMensaje({ texto: "Materia eliminada correctamente", tipo: "ok" })
            setConfirmDelete(null)
            if (editando?.id === id) cancelarEdicion()
            cargar()
        } catch (err: any) {
            setMensaje({ texto: err.response?.data?.detail ?? "Error al eliminar la materia", tipo: "error" })
        } finally {
            setLoading(false)
        }
    }

    const accentColor = "#3b82f6"
    const accentGrad = "linear-gradient(135deg,#3b82f6,#1d4ed8)"

    return (
        <>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg,#12172b 0%,#1a2555 100%)",
                padding: "2rem 2rem 2.5rem",
                position: "relative", overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200,
                    borderRadius: "50%", background: "rgba(59,130,246,.08)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, right: 120, width: 150, height: 150,
                    borderRadius: "50%", background: "rgba(29,78,216,.06)", pointerEvents: "none" }} />

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                        background: accentGrad,
                        boxShadow: "0 6px 20px rgba(59,130,246,.4)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
                    }}>⚙️</div>
                    <div>
                        <h1 style={{ color: "white", margin: 0, fontSize: "1.6rem" }}>Panel de Administración</h1>
                        <p style={{ color: "rgba(255,255,255,.45)", margin: 0, fontSize: ".85rem" }}>
                            Gestión de materias
                        </p>
                    </div>
                    <div style={{
                        marginLeft: "auto",
                        background: "rgba(59,130,246,.2)", border: "1px solid rgba(59,130,246,.35)",
                        color: "#93c5fd", borderRadius: 999, padding: ".35rem .9rem",
                        fontSize: ".82rem", fontWeight: 600,
                    }}>
                        {materias.length} materia{materias.length !== 1 ? "s" : ""}
                    </div>
                </div>
            </div>

            <div style={{ padding: "1.5rem 2rem 2rem", display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>

                {/* Lista */}
                <section>
                    {mensaje && (
                        <div style={{
                            background: mensaje.tipo === "ok" ? "#d1fae5" : "#fee2e2",
                            border: `1px solid ${mensaje.tipo === "ok" ? "#6ee7b7" : "#fca5a5"}`,
                            color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b",
                            borderRadius: 8, padding: ".65rem .9rem", fontSize: ".85rem",
                            marginBottom: "1rem", display: "flex", alignItems: "center", gap: ".5rem",
                        }}>
                            {mensaje.tipo === "ok" ? "✓" : "✕"} {mensaje.texto}
                        </div>
                    )}

                    {materias.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>📚</div>
                            No hay materias cargadas aún.
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: ".6rem" }}>
                            {materias.map(m => {
                                const esEditando = editando?.id === m.id
                                const esBorrando = confirmDelete === m.id
                                return (
                                    <div key={m.id} className="card" style={{
                                        padding: "1rem 1.25rem",
                                        borderLeft: `3px solid ${esEditando ? accentColor : "#e2e8f0"}`,
                                        transition: "border-color .15s, box-shadow .15s",
                                        boxShadow: esEditando ? "0 4px 16px rgba(59,130,246,.12)" : "",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div style={{
                                                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                                                background: esEditando ? accentGrad : "linear-gradient(135deg,#1a2555,#2563eb)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "1.1rem",
                                            }}>📖</div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
                                                    <span style={{ fontWeight: 700, fontSize: ".95rem" }}>{m.nombre}</span>
                                                    <span style={{
                                                        background: "#f1f5f9", color: "#475569",
                                                        fontSize: ".7rem", fontWeight: 700,
                                                        padding: ".15rem .55rem", borderRadius: 5, letterSpacing: ".04em",
                                                    }}>{m.codigo}</span>
                                                </div>
                                                {m.descripcion && (
                                                    <div style={{ fontSize: ".8rem", color: "var(--text-muted)", marginTop: ".15rem",
                                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {m.descripcion}
                                                    </div>
                                                )}
                                                {m.docente && (
                                                    <div style={{ fontSize: ".78rem", color: "var(--text-muted)", marginTop: ".1rem" }}>
                                                        👨‍🏫 {m.docente.nombre}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Acciones */}
                                            {!esBorrando ? (
                                                <div style={{ display: "flex", gap: ".5rem", flexShrink: 0 }}>
                                                    <button
                                                        onClick={() => esEditando ? cancelarEdicion() : iniciarEdicion(m)}
                                                        style={{
                                                            padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem",
                                                            fontWeight: 600, cursor: "pointer", border: "none",
                                                            background: esEditando ? "#e0e7ff" : "#f1f5f9",
                                                            color: esEditando ? "#3730a3" : "#475569",
                                                        }}>
                                                        {esEditando ? "Cancelar" : "✏️ Editar"}
                                                    </button>
                                                    <button
                                                        onClick={() => { setConfirmDelete(m.id); setMensaje(null) }}
                                                        style={{
                                                            padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem",
                                                            fontWeight: 600, cursor: "pointer", border: "none",
                                                            background: "#fff1f2", color: "#be123c",
                                                        }}>
                                                        🗑 Eliminar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexShrink: 0 }}>
                                                    <span style={{ fontSize: ".78rem", color: "#b91c1c", fontWeight: 600 }}>
                                                        ¿Confirmar?
                                                    </span>
                                                    <button
                                                        onClick={() => handleDelete(m.id)}
                                                        disabled={loading}
                                                        style={{
                                                            padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem",
                                                            fontWeight: 700, cursor: "pointer", border: "none",
                                                            background: "#ef4444", color: "white",
                                                        }}>
                                                        Sí, eliminar
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(null)}
                                                        style={{
                                                            padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem",
                                                            fontWeight: 600, cursor: "pointer", border: "none",
                                                            background: "#f1f5f9", color: "#475569",
                                                        }}>
                                                        Cancelar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* Formulario */}
                <section className="card" style={{ padding: "1.5rem", position: "sticky", top: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1.25rem" }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: accentGrad,
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem",
                        }}>
                            {editando ? "✏️" : "➕"}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1rem" }}>
                                {editando ? "Editar materia" : "Nueva materia"}
                            </h2>
                            {editando && (
                                <p style={{ margin: 0, fontSize: ".75rem", color: "var(--text-muted)" }}>
                                    Modificando: {editando.codigo}
                                </p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
                        {[
                            { key: "nombre",      label: "Nombre",      type: "text",     placeholder: "Ej: Bases de Datos Avanzadas" },
                            { key: "codigo",      label: "Código",      type: "text",     placeholder: "Ej: BDA202" },
                            { key: "descripcion", label: "Descripción", type: "text",     placeholder: "Descripción breve (opcional)", required: false },
                        ].map(f => (
                            <div key={f.key}>
                                <label style={{
                                    display: "block", fontSize: ".75rem", fontWeight: 600,
                                    color: "var(--text-muted)", marginBottom: ".3rem",
                                    textTransform: "uppercase", letterSpacing: ".05em",
                                }}>
                                    {f.label}
                                </label>
                                <input
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={form[f.key as keyof typeof form]}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    required={f.required !== false}
                                    style={{
                                        width: "100%", boxSizing: "border-box",
                                        padding: ".55rem .8rem", fontSize: ".88rem",
                                        border: "1.5px solid #e2e8f0", borderRadius: 8,
                                        background: "#f8fafc", outline: "none",
                                        transition: "border-color .15s, box-shadow .15s",
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = accentColor
                                        e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.12)"
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

                        <div style={{ display: "flex", gap: ".5rem", marginTop: ".4rem" }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1, padding: ".65rem",
                                    background: loading ? "#93c5fd" : accentGrad,
                                    color: "white", border: "none", borderRadius: 8,
                                    fontWeight: 600, fontSize: ".88rem",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    boxShadow: loading ? "none" : "0 4px 12px rgba(59,130,246,.3)",
                                }}
                            >
                                {loading ? "Guardando..." : editando ? "Guardar cambios" : "Crear materia"}
                            </button>
                            {editando && (
                                <button
                                    type="button"
                                    onClick={cancelarEdicion}
                                    style={{
                                        padding: ".65rem .9rem", border: "1.5px solid #e2e8f0",
                                        background: "white", borderRadius: 8, fontWeight: 600,
                                        fontSize: ".88rem", cursor: "pointer", color: "#475569",
                                    }}
                                >
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
