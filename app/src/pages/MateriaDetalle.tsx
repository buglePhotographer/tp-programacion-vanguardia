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

    async function handleCrearAviso(e: React.FormEvent) {
        e.preventDefault()
        await crearAviso({ ...nuevoAviso, materia_id: Number(id) })
        const r = await getAvisosPorMateria(Number(id))
        setAvisos(r.data)
        setNuevoAviso({ titulo: "", contenido: "" })
    }

    async function handleCrearTP(e: React.FormEvent) {
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

    if (!materia) return <p style={{ padding: "2rem" }}>Cargando...</p>

    return (
        <>
            <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
                <h1>{materia.nombre} <small style={{ color: "#666", fontSize: "0.7em" }}>({materia.codigo})</small></h1>
                {materia.docente && <p>Docente: {materia.docente.nombre}</p>}
                {materia.descripcion && <p>{materia.descripcion}</p>}

                {/* Avisos */}
                <section style={{ marginTop: "2rem" }}>
                    <h2>Avisos</h2>
                    {avisos.map(a => (
                        <div key={a.id} style={cardStyle}>
                            <strong>{a.titulo}</strong>
                            <p style={{ margin: "0.25rem 0 0" }}>{a.contenido}</p>
                            <small style={{ color: "#888" }}>Por {a.autor.nombre}</small>
                        </div>
                    ))}
                    {(user?.rol === "docente" || user?.rol === "admin") && (
                        <form onSubmit={handleCrearAviso} style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 500 }}>
                            <h3>Nuevo aviso</h3>
                            <input placeholder="Título" value={nuevoAviso.titulo} onChange={e => setNuevoAviso(p => ({ ...p, titulo: e.target.value }))} required style={inputStyle} />
                            <textarea placeholder="Contenido" value={nuevoAviso.contenido} onChange={e => setNuevoAviso(p => ({ ...p, contenido: e.target.value }))} required style={inputStyle} />
                            <button type="submit" style={btnStyle}>Publicar aviso</button>
                        </form>
                    )}
                </section>

                {/* Trabajos Prácticos */}
                <section style={{ marginTop: "2rem" }}>
                    <h2>Trabajos Prácticos</h2>
                    {tps.map(tp => (
                        <div key={tp.id} style={cardStyle}>
                            <strong>{tp.titulo}</strong>
                            {tp.descripcion && <p style={{ margin: "0.25rem 0" }}>{tp.descripcion}</p>}
                            <small>Entrega: {new Date(tp.fecha_entrega).toLocaleDateString()}</small>
                            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                                {user?.rol === "estudiante" && (
                                    <button onClick={() => handleEntregar(tp.id)} style={btnStyle}>Entregar</button>
                                )}
                                {user?.rol === "docente" && (
                                    <button onClick={() => verEntregas(tp.id)} style={btnStyle}>Ver entregas</button>
                                )}
                            </div>
                            {entregas[tp.id] && (
                                <table style={{ width: "100%", marginTop: "0.75rem", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: "#f0f0f0" }}>
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
                                                <td style={tdStyle}><a href={e.archivo_url} target="_blank" rel="noreferrer">Ver archivo</a></td>
                                                <td style={tdStyle}>{e.nota ?? "Sin calificar"}</td>
                                                <td style={tdStyle}>
                                                    <button onClick={() => handleCalificar(e.id, tp.id)} style={btnStyle}>Calificar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ))}
                    {user?.rol === "docente" && (
                        <form onSubmit={handleCrearTP} style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 500 }}>
                            <h3>Nuevo TP</h3>
                            <input placeholder="Título" value={nuevoTP.titulo} onChange={e => setNuevoTP(p => ({ ...p, titulo: e.target.value }))} required style={inputStyle} />
                            <textarea placeholder="Descripción" value={nuevoTP.descripcion} onChange={e => setNuevoTP(p => ({ ...p, descripcion: e.target.value }))} style={inputStyle} />
                            <input type="datetime-local" value={nuevoTP.fecha_entrega} onChange={e => setNuevoTP(p => ({ ...p, fecha_entrega: e.target.value }))} required style={inputStyle} />
                            <button type="submit" style={btnStyle}>Crear TP</button>
                        </form>
                    )}
                </section>
            </div>
        </>
    )
}

const cardStyle: React.CSSProperties = { border: "1px solid #ddd", borderRadius: 6, padding: "1rem", marginBottom: "0.75rem" }
const btnStyle: React.CSSProperties = { padding: "0.4rem 0.9rem", background: "#1e3a5f", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }
const inputStyle: React.CSSProperties = { padding: "0.5rem", fontSize: "1rem", borderRadius: 4, border: "1px solid #ccc" }
const thStyle: React.CSSProperties = { padding: "0.5rem", textAlign: "left", borderBottom: "1px solid #ddd" }
const tdStyle: React.CSSProperties = { padding: "0.5rem", borderBottom: "1px solid #eee" }
