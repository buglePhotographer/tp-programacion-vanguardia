import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getMaterias, getMisMaterias, inscribirse, createMateria, updateMateria, deleteMateria } from "../services/materias.service"
import api from "../services/api"

interface Materia {
    id: number
    nombre: string
    codigo: string
    descripcion?: string
    docente?: { id: number; nombre: string }
}

interface Inscripcion {
    id: number
    materia_id: number
    estado: string
    nota_final?: number
}

const estadoStyle: Record<string, React.CSSProperties> = {
    activa:      { background: "#dcfce7", color: "#15803d" },
    aprobada:    { background: "#dbeafe", color: "#1d4ed8" },
    desaprobada: { background: "#fee2e2", color: "#b91c1c" },
}

interface Docente { id: number; nombre: string }

const FORM_VACIO = { nombre: "", codigo: "", descripcion: "", docente_id: "" }

export default function Materias() {
    const { user } = useAuth()
    const esAdmin = user?.rol === "admin"
    const esEstudiante = user?.rol === "estudiante"

    const [materias, setMaterias] = useState<Materia[]>([])
    const [docentes, setDocentes] = useState<Docente[]>([])
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
    const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null)
    const [loadingId, setLoadingId] = useState<number | null>(null)

    // ABM state
    const [mostrarForm, setMostrarForm] = useState(false)
    const [editando, setEditando] = useState<Materia | null>(null)
    const [form, setForm] = useState(FORM_VACIO)
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const [busqueda, setBusqueda] = useState("")

    async function cargar() {
        const res = await getMaterias()
        setMaterias(res.data)
        if (esEstudiante) {
            const resI = await getMisMaterias()
            setInscripciones(resI.data.map((i: any) => ({ ...i, materia_id: i.materia.id })))
        }
    }

    useEffect(() => {
        cargar()
        if (esAdmin) api.get("/auth/usuarios?rol=docente").then(r => setDocentes(r.data)).catch(() => {})
    }, [user])

    function inscripcionDe(materiaId: number) {
        return inscripciones.find(i => i.materia_id === materiaId)
    }

    async function handleInscribirse(materia_id: number) {
        setLoadingId(materia_id)
        try {
            await inscribirse(materia_id)
            setMensaje({ texto: "¡Inscripción exitosa!", tipo: "ok" })
            cargar()
        } catch (e: any) {
            setMensaje({ texto: e.response?.data?.detail ?? "Error al inscribirse", tipo: "error" })
        } finally {
            setLoadingId(null)
        }
    }

    function iniciarEdicion(m: Materia) {
        setEditando(m)
        setForm({ nombre: m.nombre, codigo: m.codigo, descripcion: m.descripcion ?? "", docente_id: m.docente ? String(m.docente.id) : "" })
        setMostrarForm(true)
        setConfirmDelete(null)
        setMensaje(null)
    }

    function cancelarForm() {
        setEditando(null)
        setForm(FORM_VACIO)
        setMostrarForm(false)
        setMensaje(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true); setMensaje(null)
        const payload = { ...form, docente_id: form.docente_id ? Number(form.docente_id) : undefined }
        try {
            if (editando) {
                await updateMateria(editando.id, payload)
                setMensaje({ texto: `Materia "${form.nombre}" actualizada`, tipo: "ok" })
            } else {
                await createMateria(payload)
                setMensaje({ texto: `Materia "${form.nombre}" creada`, tipo: "ok" })
            }
            cancelarForm()
            cargar()
        } catch (err: any) {
            setMensaje({ texto: err.response?.data?.detail ?? "Error al guardar", tipo: "error" })
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: number) {
        setSaving(true)
        try {
            await deleteMateria(id)
            setMensaje({ texto: "Materia eliminada", tipo: "ok" })
            setConfirmDelete(null)
            if (editando?.id === id) cancelarForm()
            cargar()
        } catch (err: any) {
            setMensaje({ texto: err.response?.data?.detail ?? "Error al eliminar", tipo: "error" })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f9" }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #12172b 0%, #1a2555 100%)",
                padding: "2rem 2rem 1.75rem",
                display: "flex", alignItems: "center", gap: "1rem",
            }}>
                <div>
                    <h1 style={{ color: "white", margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>
                        📚 Materias
                    </h1>
                    <p style={{ color: "rgba(255,255,255,.5)", margin: ".3rem 0 0", fontSize: ".85rem" }}>
                        {esEstudiante ? "Inscribite a las materias disponibles" : "Catálogo de materias"}
                    </p>
                </div>
                {esAdmin && (
                    <button
                        onClick={() => mostrarForm && !editando ? cancelarForm() : (setMostrarForm(true), setEditando(null), setForm(FORM_VACIO))}
                        style={{
                            marginLeft: "auto", flexShrink: 0,
                            padding: ".5rem 1.1rem",
                            background: mostrarForm && !editando ? "rgba(255,255,255,.1)" : "linear-gradient(135deg,#4ade80,#16a34a)",
                            color: "white", border: "none", borderRadius: 999,
                            fontWeight: 700, fontSize: ".82rem", cursor: "pointer",
                            boxShadow: mostrarForm && !editando ? "none" : "0 4px 12px rgba(74,222,128,.35)",
                        }}
                    >
                        {mostrarForm && !editando ? "✕ Cancelar" : "+ Nueva materia"}
                    </button>
                )}
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

                {/* Formulario ABM (solo admin) */}
                {esAdmin && mostrarForm && (
                    <div style={{
                        background: "white", borderRadius: 12, border: "1.5px solid #bfdbfe",
                        padding: "1.25rem 1.5rem", marginBottom: "1.25rem",
                        boxShadow: "0 4px 16px rgba(59,130,246,.1)",
                    }}>
                        <h3 style={{ margin: "0 0 1rem", fontSize: ".95rem", color: "#1e3a5f" }}>
                            {editando ? `✏️ Editando: ${editando.codigo}` : "➕ Nueva materia"}
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                            {[
                                { key: "nombre",      placeholder: "Nombre",      flex: 3 },
                                { key: "codigo",      placeholder: "Código",      flex: 1 },
                                { key: "descripcion", placeholder: "Descripción (opcional)", flex: 4, required: false },
                            ].map(f => (
                                <div key={f.key} style={{ flex: f.flex, minWidth: 120 }}>
                                    <input
                                        placeholder={f.placeholder}
                                        value={form[f.key as keyof typeof form]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        required={f.required !== false}
                                        style={{
                                            width: "100%", boxSizing: "border-box",
                                            padding: ".55rem .8rem", fontSize: ".88rem",
                                            border: "1.5px solid #e2e8f0", borderRadius: 8,
                                            background: "#f8fafc", outline: "none",
                                        }}
                                        onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "white" }}
                                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc" }}
                                    />
                                </div>
                            ))}
                            <div style={{ flex: 2, minWidth: 160 }}>
                                <select
                                    value={form.docente_id}
                                    onChange={e => setForm(p => ({ ...p, docente_id: e.target.value }))}
                                    style={{
                                        width: "100%", boxSizing: "border-box",
                                        padding: ".55rem .8rem", fontSize: ".88rem",
                                        border: "1.5px solid #e2e8f0", borderRadius: 8,
                                        background: "#f8fafc", outline: "none", color: form.docente_id ? "#1a2035" : "#94a3b8",
                                    }}
                                >
                                    <option value="">Sin docente asignado</option>
                                    {docentes.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: ".5rem" }}>
                                <button type="submit" disabled={saving} style={{
                                    padding: ".55rem 1.1rem", borderRadius: 8, border: "none",
                                    background: saving ? "#93c5fd" : "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                                    color: "white", fontWeight: 700, fontSize: ".85rem", cursor: saving ? "not-allowed" : "pointer",
                                    boxShadow: "0 3px 10px rgba(59,130,246,.25)", whiteSpace: "nowrap" as const,
                                }}>
                                    {saving ? "Guardando..." : editando ? "Guardar cambios" : "Crear materia"}
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
                        placeholder="Buscar por nombre, código o docente..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box", padding: ".55rem .8rem .55rem 2.2rem", fontSize: ".88rem", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "white", outline: "none" }}
                        onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.12)" }}
                        onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "" }}
                    />
                </div>

                {(() => {
                    const filtrados = materias.filter(m =>
                        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                        m.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
                        (m.docente?.nombre ?? "").toLowerCase().includes(busqueda.toLowerCase())
                    )
                    if (filtrados.length === 0) return (
                        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7a99", background: "white", borderRadius: 12 }}>
                            {busqueda ? "No hay resultados para tu búsqueda." : "No hay materias disponibles."}
                        </div>
                    )
                    return (
                <>
                <div style={{ display: "grid", gap: ".75rem" }}>
                    {filtrados.map(materia => {
                        const insc = inscripcionDe(materia.id)
                        const esBorrando = confirmDelete === materia.id
                        return (
                            <div key={materia.id} style={{
                                background: "white", borderRadius: 12,
                                border: editando?.id === materia.id ? "1.5px solid #bfdbfe" : "1px solid #e8ecf4",
                                boxShadow: editando?.id === materia.id ? "0 4px 16px rgba(59,130,246,.1)" : "0 2px 8px rgba(0,0,0,.06)",
                                padding: "1.1rem 1.4rem",
                                display: "flex", alignItems: "center", gap: "1rem",
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                                    background: "linear-gradient(135deg,#1a2555,#2563eb)",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                                }}>📖</div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".25rem", flexWrap: "wrap" }}>
                                        <Link to={`/materias/${materia.id}`} style={{ fontWeight: 700, fontSize: ".97rem", color: "#1a2035", textDecoration: "none" }}>
                                            {materia.nombre}
                                        </Link>
                                        <span style={{ background: "#f1f5f9", color: "#475569", fontSize: ".72rem", fontWeight: 700, padding: ".15rem .55rem", borderRadius: 5, letterSpacing: ".04em" }}>
                                            {materia.codigo}
                                        </span>
                                        {insc && (
                                            <span style={{ ...(estadoStyle[insc.estado] ?? {}), fontSize: ".7rem", fontWeight: 700, padding: ".18rem .65rem", borderRadius: 999, letterSpacing: ".04em", textTransform: "uppercase" as const }}>
                                                {insc.estado}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: ".8rem", color: "#6b7a99", display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                                        {materia.docente && <span>👨‍🏫 {materia.docente.nombre}</span>}
                                        {materia.descripcion && (
                                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>
                                                {materia.descripcion}
                                            </span>
                                        )}
                                    </div>
                                    {insc?.nota_final != null && (
                                        <div style={{ marginTop: ".35rem", fontSize: ".82rem", color: "#1d4ed8", fontWeight: 700 }}>
                                            Nota final: {insc.nota_final}
                                        </div>
                                    )}
                                </div>

                                {/* Acciones según rol */}
                                {esAdmin && !esBorrando && (
                                    <div style={{ display: "flex", gap: ".5rem", flexShrink: 0 }}>
                                        <button onClick={() => editando?.id === materia.id ? cancelarForm() : iniciarEdicion(materia)} style={{
                                            padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem", fontWeight: 600,
                                            cursor: "pointer", border: "none",
                                            background: editando?.id === materia.id ? "#e0e7ff" : "#f1f5f9",
                                            color: editando?.id === materia.id ? "#3730a3" : "#475569",
                                        }}>
                                            {editando?.id === materia.id ? "Cancelar" : "✏️ Editar"}
                                        </button>
                                        <button onClick={() => { setConfirmDelete(materia.id); setMensaje(null) }} style={{
                                            padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem", fontWeight: 600,
                                            cursor: "pointer", border: "none", background: "#fff1f2", color: "#be123c",
                                        }}>
                                            🗑 Eliminar
                                        </button>
                                    </div>
                                )}

                                {esAdmin && esBorrando && (
                                    <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexShrink: 0 }}>
                                        <span style={{ fontSize: ".78rem", color: "#b91c1c", fontWeight: 600 }}>¿Confirmar?</span>
                                        <button onClick={() => handleDelete(materia.id)} disabled={saving} style={{
                                            padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem", fontWeight: 700,
                                            cursor: "pointer", border: "none", background: "#ef4444", color: "white",
                                        }}>
                                            Sí, eliminar
                                        </button>
                                        <button onClick={() => setConfirmDelete(null)} style={{
                                            padding: ".35rem .8rem", borderRadius: 7, fontSize: ".78rem", fontWeight: 600,
                                            cursor: "pointer", border: "none", background: "#f1f5f9", color: "#475569",
                                        }}>
                                            Cancelar
                                        </button>
                                    </div>
                                )}

                                {esEstudiante && !insc && (
                                    <button onClick={() => handleInscribirse(materia.id)} disabled={loadingId === materia.id} style={{
                                        flexShrink: 0, padding: ".45rem 1.15rem",
                                        background: loadingId === materia.id ? "#86efac" : "linear-gradient(135deg,#22c55e,#16a34a)",
                                        color: "white", border: "none", borderRadius: 999,
                                        fontWeight: 700, fontSize: ".8rem",
                                        cursor: loadingId === materia.id ? "default" : "pointer",
                                        boxShadow: "0 4px 12px rgba(34,197,94,.3)", whiteSpace: "nowrap" as const,
                                    }}>
                                        {loadingId === materia.id ? "Inscribiendo…" : "+ Inscribirse"}
                                    </button>
                                )}

                                {esEstudiante && insc && (
                                    <Link to={`/materias/${materia.id}`} style={{
                                        flexShrink: 0, padding: ".45rem 1.1rem",
                                        background: "#f0f4ff", color: "#3b82f6",
                                        border: "1.5px solid #bfdbfe", borderRadius: 999,
                                        fontWeight: 600, fontSize: ".8rem", textDecoration: "none", whiteSpace: "nowrap" as const,
                                    }}>
                                        Ver materia →
                                    </Link>
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
