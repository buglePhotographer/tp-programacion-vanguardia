import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getMateria } from "../services/materias.service"
import { getTPs, crearTP, entregar, getEntregasPorTP, calificarEntrega } from "../services/entregas.service"
import { getAvisosPorMateria, crearAviso } from "../services/avisos.service"

export default function MateriaDetalle() {
    const { id } = useParams()
    const { user } = useAuth()
    const [materia, setMateria] = useState<any>(null)
    const [tps, setTps] = useState<any[]>([])
    const [avisos, setAvisos] = useState<any[]>([])
    const [nuevoAviso, setNuevoAviso] = useState({ titulo: "", contenido: "" })
    const [nuevoTP, setNuevoTP] = useState({ titulo: "", descripcion: "", fecha_entrega: "" })
    const [entregas, setEntregas] = useState<Record<number, any[]>>({})

    useEffect(() => {
        if (!id) return
        getMateria(Number(id)).then(r => setMateria(r.data))
        getTPs(Number(id)).then(r => setTps(r.data))
        getAvisosPorMateria(Number(id)).then(r => setAvisos(r.data))
    }, [id])

    async function handleCrearAviso(e: React.BaseSyntheticEvent) {
        e.preventDefault()
        await crearAviso({ ...nuevoAviso, materia_id: Number(id) })
        const r = await getAvisosPorMateria(Number(id))
        setAvisos(r.data)
        setNuevoAviso({ titulo: "", contenido: "" })
    }

    async function handleCrearTP(e: React.BaseSyntheticEvent) {
        e.preventDefault()
        await crearTP({ ...nuevoTP, materia_id: Number(id) })
        const r = await getTPs(Number(id))
        setTps(r.data)
        setNuevoTP({ titulo: "", descripcion: "", fecha_entrega: "" })
    }

    async function handleEntregar(tp_id: number) {
        const url = prompt("URL del archivo (link a Google Drive, GitHub, etc.):")
        if (!url) return
        await entregar(tp_id, url)
        alert("Entrega registrada")
    }

    async function verEntregas(tp_id: number) {
        const r = await getEntregasPorTP(tp_id)
        setEntregas(prev => ({ ...prev, [tp_id]: r.data }))
    }

    async function handleCalificar(entrega_id: number, tp_id: number) {
        const nota = prompt("Nota (0-10):")
        const comentario = prompt("Comentario (opcional):") ?? undefined
        if (nota === null) return
        await calificarEntrega(entrega_id, Number(nota), comentario)
        await verEntregas(tp_id)
    }

    if (!materia) return (
        <div style={{ padding: "3rem", textAlign: "center", color: "#6b7a99" }}>Cargando...</div>
    )

    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f9" }}>

            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #12172b 0%, #1a2555 100%)",
                padding: "2rem 2rem 1.75rem",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap", marginBottom: ".4rem" }}>
                    <h1 style={{ color: "white", margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>
                        {materia.nombre}
                    </h1>
                    <span style={{
                        background: "rgba(74,222,128,.18)", color: "#4ade80",
                        fontSize: ".72rem", fontWeight: 700, padding: ".2rem .65rem",
                        borderRadius: 999, letterSpacing: ".05em",
                        border: "1px solid rgba(74,222,128,.3)",
                    }}>
                        {materia.codigo}
                    </span>
                </div>
                {materia.docente && (
                    <p style={{ color: "rgba(255,255,255,.55)", margin: 0, fontSize: ".85rem" }}>
                        Docente:{" "}
                        <span style={{ color: "rgba(255,255,255,.9)", fontWeight: 600 }}>
                            {materia.docente.nombre}
                        </span>
                    </p>
                )}
                {materia.descripcion && (
                    <p style={{ color: "rgba(255,255,255,.45)", margin: ".2rem 0 0", fontSize: ".82rem" }}>
                        {materia.descripcion}
                    </p>
                )}
            </div>

            <div style={{ padding: "1.75rem 2rem" }}>

                {/* Avisos */}
                <section style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: "1rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2035" }}>Avisos</h2>
                        <span style={{
                            background: "#e8ecf4", color: "#6b7a99",
                            borderRadius: 999, padding: ".1rem .55rem",
                            fontSize: ".72rem", fontWeight: 600,
                        }}>
                            {avisos.length}
                        </span>
                    </div>

                    {avisos.length === 0 && (
                        <div style={{ ...cardBase, padding: "1.5rem", textAlign: "center", color: "#6b7a99", fontSize: ".88rem" }}>
                            Sin avisos por ahora.
                        </div>
                    )}

                    <div style={{ display: "grid", gap: ".75rem" }}>
                        {avisos.map(a => (
                            <div key={a.id} style={cardBase}>
                                <strong style={{ fontSize: ".95rem", color: "#1a2035" }}>{a.titulo}</strong>
                                <p style={{ margin: ".4rem 0 .6rem", color: "#374151", lineHeight: 1.6, fontSize: ".88rem" }}>
                                    {a.contenido}
                                </p>
                                <small style={{ color: "#6b7a99", fontSize: ".78rem" }}>
                                    Publicado por {a.autor.nombre}
                                </small>
                            </div>
                        ))}
                    </div>

                    {(user?.rol === "docente" || user?.rol === "admin") && (
                        <div style={formCard}>
                            <h3 style={formTitle}>Nuevo aviso</h3>
                            <form onSubmit={handleCrearAviso} style={{ display: "flex", flexDirection: "column", gap: ".6rem", maxWidth: 500 }}>
                                <input
                                    placeholder="Título"
                                    value={nuevoAviso.titulo}
                                    onChange={e => setNuevoAviso(p => ({ ...p, titulo: e.target.value }))}
                                    required
                                    style={inputStyle}
                                />
                                <textarea
                                    placeholder="Contenido"
                                    rows={3}
                                    value={nuevoAviso.contenido}
                                    onChange={e => setNuevoAviso(p => ({ ...p, contenido: e.target.value }))}
                                    required
                                    style={inputStyle}
                                />
                                <button type="submit" style={btnGreen}>Publicar aviso</button>
                            </form>
                        </div>
                    )}
                </section>

                {/* Trabajos Prácticos */}
                <section>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: "1rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2035" }}>Trabajos Prácticos</h2>
                        <span style={{
                            background: "#e8ecf4", color: "#6b7a99",
                            borderRadius: 999, padding: ".1rem .55rem",
                            fontSize: ".72rem", fontWeight: 600,
                        }}>
                            {tps.length}
                        </span>
                    </div>

                    {tps.length === 0 && (
                        <div style={{ ...cardBase, padding: "1.5rem", textAlign: "center", color: "#6b7a99", fontSize: ".88rem" }}>
                            Sin trabajos prácticos por ahora.
                        </div>
                    )}

                    <div style={{ display: "grid", gap: ".75rem" }}>
                        {tps.map(tp => {
                            const vence = new Date(tp.fecha_entrega)
                            const vencido = vence < new Date()
                            return (
                                <div key={tp.id} style={cardBase}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".5rem", flexWrap: "wrap" }}>
                                        <strong style={{ fontSize: "1rem", color: "#1a2035" }}>{tp.titulo}</strong>
                                        <span style={{
                                            ...(vencido
                                                ? { background: "#fee2e2", color: "#b91c1c" }
                                                : { background: "#dcfce7", color: "#15803d" }
                                            ),
                                            fontSize: ".7rem", fontWeight: 700,
                                            padding: ".18rem .65rem", borderRadius: 999,
                                            letterSpacing: ".04em", whiteSpace: "nowrap" as const,
                                        }}>
                                            {vencido ? "Vencido" : "Activo"} · {vence.toLocaleDateString()}
                                        </span>
                                    </div>
                                    {tp.descripcion && (
                                        <p style={{ margin: ".5rem 0 0", color: "#6b7a99", fontSize: ".88rem" }}>
                                            {tp.descripcion}
                                        </p>
                                    )}
                                    <div style={{ marginTop: "1rem", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                                        {user?.rol === "estudiante" && (
                                            <button onClick={() => handleEntregar(tp.id)} style={btnGreen}>
                                                Entregar
                                            </button>
                                        )}
                                        {user?.rol === "docente" && (
                                            <button onClick={() => verEntregas(tp.id)} style={btnOutline}>
                                                Ver entregas
                                            </button>
                                        )}
                                    </div>
                                    {entregas[tp.id] && (
                                        <div style={{ marginTop: "1rem", overflowX: "auto", borderRadius: 8, border: "1px solid #e8ecf4" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                                <thead>
                                                    <tr style={{ background: "#f8fafc" }}>
                                                        <th style={thStyle}>Estudiante</th>
                                                        <th style={thStyle}>Archivo</th>
                                                        <th style={thStyle}>Nota</th>
                                                        <th style={thStyle}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {entregas[tp.id].map(e => (
                                                        <tr key={e.id}>
                                                            <td style={tdStyle}>{e.estudiante.nombre}</td>
                                                            <td style={tdStyle}>
                                                                <a href={e.archivo_url} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontWeight: 500 }}>
                                                                    Ver archivo
                                                                </a>
                                                            </td>
                                                            <td style={tdStyle}>
                                                                {e.nota != null ? (
                                                                    <span style={{
                                                                        ...(e.nota >= 6
                                                                            ? { background: "#dbeafe", color: "#1d4ed8" }
                                                                            : { background: "#fee2e2", color: "#b91c1c" }
                                                                        ),
                                                                        fontSize: ".72rem", fontWeight: 700,
                                                                        padding: ".18rem .6rem", borderRadius: 999,
                                                                    }}>
                                                                        {e.nota}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ background: "#fef9c3", color: "#a16207", fontSize: ".72rem", fontWeight: 700, padding: ".18rem .6rem", borderRadius: 999 }}>
                                                                        Sin calificar
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td style={tdStyle}>
                                                                <button onClick={() => handleCalificar(e.id, tp.id)} style={btnSmall}>
                                                                    Calificar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {user?.rol === "docente" && (
                        <div style={formCard}>
                            <h3 style={formTitle}>Nuevo TP</h3>
                            <form onSubmit={handleCrearTP} style={{ display: "flex", flexDirection: "column", gap: ".6rem", maxWidth: 500 }}>
                                <input
                                    placeholder="Título"
                                    value={nuevoTP.titulo}
                                    onChange={e => setNuevoTP(p => ({ ...p, titulo: e.target.value }))}
                                    required
                                    style={inputStyle}
                                />
                                <textarea
                                    placeholder="Descripción (opcional)"
                                    rows={3}
                                    value={nuevoTP.descripcion}
                                    onChange={e => setNuevoTP(p => ({ ...p, descripcion: e.target.value }))}
                                    style={inputStyle}
                                />
                                <div>
                                    <label style={{ fontSize: ".8rem", color: "#6b7a99", fontWeight: 500, display: "block", marginBottom: ".25rem" }}>
                                        Fecha límite de entrega
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={nuevoTP.fecha_entrega}
                                        onChange={e => setNuevoTP(p => ({ ...p, fecha_entrega: e.target.value }))}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                                <button type="submit" style={btnGreen}>Crear TP</button>
                            </form>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

const cardBase: React.CSSProperties = {
    background: "white",
    borderRadius: 12,
    border: "1px solid #e8ecf4",
    boxShadow: "0 2px 8px rgba(0,0,0,.06)",
    padding: "1.1rem 1.4rem",
}

const formCard: React.CSSProperties = {
    background: "white",
    borderRadius: 12,
    border: "1.5px solid #bfdbfe",
    boxShadow: "0 4px 16px rgba(59,130,246,.08)",
    padding: "1.25rem 1.4rem",
    marginTop: "1rem",
}

const formTitle: React.CSSProperties = {
    margin: "0 0 1rem",
    fontSize: ".82rem",
    fontWeight: 700,
    color: "#1e3a5f",
    textTransform: "uppercase",
    letterSpacing: ".05em",
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: ".55rem .8rem",
    fontSize: ".88rem",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    background: "#f8fafc",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
}

const btnGreen: React.CSSProperties = {
    padding: ".5rem 1.2rem",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: ".85rem",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(34,197,94,.25)",
    whiteSpace: "nowrap",
}

const btnOutline: React.CSSProperties = {
    padding: ".45rem 1rem",
    background: "white",
    color: "#475569",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: ".82rem",
    cursor: "pointer",
}

const btnSmall: React.CSSProperties = {
    padding: ".3rem .75rem",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: ".78rem",
    cursor: "pointer",
}

const thStyle: React.CSSProperties = {
    padding: ".6rem 1rem",
    textAlign: "left",
    fontSize: ".72rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    color: "#6b7a99",
    borderBottom: "1px solid #e8ecf4",
}

const tdStyle: React.CSSProperties = {
    padding: ".7rem 1rem",
    borderBottom: "1px solid #f0f2f9",
    fontSize: ".87rem",
}
