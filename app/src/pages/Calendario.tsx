import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { getEventos, crearEvento, eliminarEvento } from "../services/eventos.service"
import { getMaterias } from "../services/materias.service"

interface Materia { id: number; nombre: string }
interface Evento {
    id: number
    materia_id: number | null
    materia: Materia | null
    titulo: string
    descripcion: string | null
    fecha_inicio: string
    fecha_fin: string
}

const EMPTY_FORM = { titulo: "", descripcion: "", fecha_inicio: "", fecha_fin: "", materia_id: "" }

function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
}

function formatHour(iso: string) {
    const d = new Date(iso)
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

export default function Calendario() {
    const { user } = useAuth()
    const canEdit = user?.rol === "docente" || user?.rol === "admin"

    const [eventos, setEventos] = useState<Evento[]>([])
    const [materias, setMaterias] = useState<{ id: number; nombre: string }[]>([])
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const load = () => getEventos().then(r => setEventos(r.data)).catch(() => {})

    useEffect(() => {
        load()
        getMaterias().then(r => setMaterias(r.data)).catch(() => {})
    }, [])

    const now = new Date()
    const proximos = eventos.filter(e => new Date(e.fecha_fin) >= now)
    const pasados  = eventos.filter(e => new Date(e.fecha_fin) < now)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (!form.titulo || !form.fecha_inicio || !form.fecha_fin) {
            setError("Completá título, fecha de inicio y fecha de fin.")
            return
        }
        if (new Date(form.fecha_fin) <= new Date(form.fecha_inicio)) {
            setError("La fecha de fin debe ser posterior al inicio.")
            return
        }
        setSaving(true)
        try {
            await crearEvento({
                titulo: form.titulo,
                descripcion: form.descripcion || undefined,
                fecha_inicio: form.fecha_inicio,
                fecha_fin: form.fecha_fin,
                materia_id: form.materia_id ? Number(form.materia_id) : undefined,
            })
            setForm(EMPTY_FORM)
            setShowForm(false)
            load()
        } catch {
            setError("No se pudo guardar el evento.")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        await eliminarEvento(id).catch(() => {})
        load()
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f9" }}>

            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #12172b 0%, #1a2555 100%)",
                padding: "2rem 2rem 1.75rem",
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            }}>
                <div>
                    <h1 style={{ color: "white", margin: 0, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-.4px" }}>
                        📅 Calendario
                    </h1>
                    <p style={{ color: "rgba(255,255,255,.5)", margin: ".3rem 0 0", fontSize: ".85rem" }}>
                        Eventos y fechas importantes
                    </p>
                </div>
                {canEdit && (
                    <button onClick={() => setShowForm(v => !v)} style={btnStyle}>
                        {showForm ? "✕ Cancelar" : "+ Nuevo evento"}
                    </button>
                )}
            </div>

            <div style={{ padding: "1.75rem 2rem" }}>

                {/* Formulario */}
                {showForm && (
                    <div style={{ background: "white", borderRadius: 12, border: "1px solid #e8ecf4",
                        boxShadow: "0 2px 8px rgba(0,0,0,.06)", padding: "1.5rem", marginBottom: "1.75rem" }}>
                        <h3 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700, color: "#1a2035" }}>
                            Nuevo evento
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: ".85rem" }}>
                            <input
                                placeholder="Título *"
                                value={form.titulo}
                                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                                style={inputStyle}
                            />
                            <input
                                placeholder="Descripción (opcional)"
                                value={form.descripcion}
                                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                style={inputStyle}
                            />
                            <select
                                value={form.materia_id}
                                onChange={e => setForm(f => ({ ...f, materia_id: e.target.value }))}
                                style={inputStyle}
                            >
                                <option value="">Global (sin materia)</option>
                                {materias.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".85rem" }}>
                                <div>
                                    <label style={labelStyle}>Fecha y hora de inicio *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.fecha_inicio}
                                        onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Fecha y hora de fin *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.fecha_fin}
                                        onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            {error && <p style={{ color: "#b91c1c", fontSize: ".8rem", margin: 0 }}>{error}</p>}
                            <button type="submit" disabled={saving} style={{ ...btnStyle, alignSelf: "flex-start" }}>
                                {saving ? "Guardando…" : "Guardar evento"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Próximos */}
                <Section title="Próximos eventos" eventos={proximos} canEdit={canEdit} onDelete={handleDelete} />

                {/* Pasados */}
                {pasados.length > 0 && (
                    <div style={{ marginTop: "2rem" }}>
                        <Section title="Eventos pasados" eventos={pasados} canEdit={canEdit} onDelete={handleDelete} muted />
                    </div>
                )}

                {eventos.length === 0 && (
                    <div style={{ background: "white", borderRadius: 12, border: "1px solid #e8ecf4",
                        boxShadow: "0 2px 8px rgba(0,0,0,.06)", textAlign: "center",
                        padding: "3.5rem 2rem", color: "#6b7a99" }}>
                        No hay eventos registrados.
                    </div>
                )}
            </div>
        </div>
    )
}

function Section({ title, eventos, canEdit, onDelete, muted = false }: {
    title: string
    eventos: Evento[]
    canEdit: boolean
    onDelete: (id: number) => void
    muted?: boolean
}) {
    if (eventos.length === 0) return null
    return (
        <div>
            <h2 style={{ fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".08em", color: muted ? "#94a3b8" : "#6b7a99",
                margin: "0 0 .85rem" }}>
                {title}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {eventos.map(ev => <EventCard key={ev.id} ev={ev} canEdit={canEdit} onDelete={onDelete} muted={muted} />)}
            </div>
        </div>
    )
}

function EventCard({ ev, canEdit, onDelete, muted }: {
    ev: Evento; canEdit: boolean; onDelete: (id: number) => void; muted: boolean
}) {
    const accent = muted ? "#94a3b8" : "#6366f1"
    return (
        <div style={{
            background: "white", borderRadius: 12, border: "1px solid #e8ecf4",
            boxShadow: "0 2px 8px rgba(0,0,0,.06)",
            display: "flex", alignItems: "stretch", overflow: "hidden",
            opacity: muted ? 0.7 : 1,
        }}>
            {/* Franja de color */}
            <div style={{ width: 5, background: accent, flexShrink: 0 }} />

            <div style={{ padding: "1rem 1.25rem", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: ".95rem", color: "#1a2035" }}>{ev.titulo}</div>
                        {ev.descripcion && (
                            <div style={{ fontSize: ".82rem", color: "#6b7a99", marginTop: ".25rem" }}>{ev.descripcion}</div>
                        )}
                    </div>
                    {canEdit && (
                        <button onClick={() => onDelete(ev.id)} title="Eliminar" style={deleteBtnStyle}>✕</button>
                    )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: ".75rem" }}>
                    <Tag icon="📆" text={`${formatDate(ev.fecha_inicio)} ${formatHour(ev.fecha_inicio)}`} />
                    <Tag icon="🏁" text={`${formatDate(ev.fecha_fin)} ${formatHour(ev.fecha_fin)}`} />
                    {ev.materia && <Tag icon="📚" text={ev.materia.nombre} />}
                    {!ev.materia && <Tag icon="🌐" text="Global" />}
                </div>
            </div>
        </div>
    )
}

function Tag({ icon, text }: { icon: string; text: string }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: ".3rem",
            background: "#f1f5f9", color: "#475569",
            fontSize: ".72rem", fontWeight: 600,
            padding: ".2rem .65rem", borderRadius: 6,
            letterSpacing: ".03em" }}>
            {icon} {text}
        </span>
    )
}

const btnStyle: React.CSSProperties = {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "white", border: "none", borderRadius: 9,
    padding: ".55rem 1.15rem", fontSize: ".82rem", fontWeight: 600,
    cursor: "pointer", whiteSpace: "nowrap",
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: ".6rem .85rem",
    border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: ".88rem", color: "#1a2035",
    outline: "none", boxSizing: "border-box",
    background: "#fafbff",
}

const labelStyle: React.CSSProperties = {
    display: "block", fontSize: ".72rem", fontWeight: 600,
    color: "#6b7a99", marginBottom: ".3rem",
    textTransform: "uppercase", letterSpacing: ".05em",
}

const deleteBtnStyle: React.CSSProperties = {
    background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)",
    color: "#ef4444", borderRadius: 7,
    width: 28, height: 28, fontSize: ".8rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0, padding: 0,
}
