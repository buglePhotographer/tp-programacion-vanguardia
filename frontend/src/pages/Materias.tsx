import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getMaterias, getMisMaterias, inscribirse } from "../services/materias.service"

interface Materia {
    id: number
    nombre: string
    codigo: string
    descripcion?: string
    docente?: { nombre: string }
}

interface Inscripcion {
    id: number
    materia_id: number
    estado: string
    nota_final?: number
}

const estadoStyle: Record<string, React.CSSProperties> = {
    activa:       { background: "#dcfce7", color: "#15803d" },
    aprobada:     { background: "#dbeafe", color: "#1d4ed8" },
    desaprobada:  { background: "#fee2e2", color: "#b91c1c" },
}

export default function Materias() {
    const { user } = useAuth()
    const [materias, setMaterias] = useState<Materia[]>([])
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
    const [mensaje, setMensaje] = useState("")
    const [loadingId, setLoadingId] = useState<number | null>(null)

    const esEstudiante = user?.rol === "estudiante"

    async function cargar() {
        const res = await getMaterias()
        setMaterias(res.data)
        if (esEstudiante) {
            const resI = await getMisMaterias()
            setInscripciones(resI.data.map((i: any) => ({ ...i, materia_id: i.materia.id })))
        }
    }

    useEffect(() => { cargar() }, [user])

    function inscripcionDe(materiaId: number) {
        return inscripciones.find(i => i.materia_id === materiaId)
    }

    async function handleInscribirse(materia_id: number) {
        setLoadingId(materia_id)
        try {
            await inscribirse(materia_id)
            setMensaje("¡Inscripción exitosa!")
            cargar()
        } catch (e: any) {
            setMensaje(e.response?.data?.detail ?? "Error al inscribirse")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f9" }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #12172b 0%, #1a2555 100%)",
                padding: "2rem 2rem 1.75rem",
            }}>
                <h1 style={{ color: "white", margin: 0, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-.4px" }}>
                    📚 Materias
                </h1>
                <p style={{ color: "rgba(255,255,255,.5)", margin: ".3rem 0 0", fontSize: ".85rem" }}>
                    {esEstudiante ? "Inscribite a las materias disponibles" : "Catálogo de materias"}
                </p>
            </div>

            <div style={{ padding: "1.75rem 2rem" }}>

                {mensaje && (
                    <div style={{
                        background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d",
                        borderRadius: 8, padding: ".7rem 1rem", marginBottom: "1.25rem",
                        fontSize: ".88rem", fontWeight: 500,
                    }}>
                        ✓ {mensaje}
                    </div>
                )}

                {materias.length === 0 && (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#6b7a99", background: "white", borderRadius: 12 }}>
                        No hay materias disponibles.
                    </div>
                )}

                <div style={{ display: "grid", gap: ".75rem" }}>
                    {materias.map(materia => {
                        const insc = inscripcionDe(materia.id)
                        return (
                            <div key={materia.id} style={{
                                background: "white",
                                borderRadius: 12,
                                border: "1px solid #e8ecf4",
                                boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                                padding: "1.1rem 1.4rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                transition: "box-shadow .15s",
                            }}>
                                {/* Icono materia */}
                                <div style={{
                                    width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                                    background: "linear-gradient(135deg,#1a2555,#2563eb)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.2rem",
                                }}>
                                    📖
                                </div>

                                {/* Contenido */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".25rem", flexWrap: "wrap" }}>
                                        <Link to={`/materias/${materia.id}`} style={{
                                            fontWeight: 700, fontSize: ".97rem", color: "#1a2035",
                                            textDecoration: "none",
                                        }}>
                                            {materia.nombre}
                                        </Link>
                                        <span style={{
                                            background: "#f1f5f9", color: "#475569",
                                            fontSize: ".72rem", fontWeight: 700,
                                            padding: ".15rem .55rem", borderRadius: 5,
                                            letterSpacing: ".04em",
                                        }}>
                                            {materia.codigo}
                                        </span>
                                        {insc && (
                                            <span style={{
                                                ...(estadoStyle[insc.estado] ?? {}),
                                                fontSize: ".7rem", fontWeight: 700,
                                                padding: ".18rem .65rem", borderRadius: 999,
                                                letterSpacing: ".04em", textTransform: "uppercase" as const,
                                            }}>
                                                {insc.estado}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: ".8rem", color: "#6b7a99", display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
                                        {materia.docente && (
                                            <span>👨‍🏫 {materia.docente.nombre}</span>
                                        )}
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

                                {/* Botón / estado derecha */}
                                {esEstudiante && !insc ? (
                                    <button
                                        onClick={() => handleInscribirse(materia.id)}
                                        disabled={loadingId === materia.id}
                                        style={{
                                            flexShrink: 0,
                                            padding: ".45rem 1.15rem",
                                            background: loadingId === materia.id
                                                ? "#86efac"
                                                : "linear-gradient(135deg,#22c55e,#16a34a)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: 999,
                                            fontFamily: "inherit",
                                            fontWeight: 700,
                                            fontSize: ".8rem",
                                            cursor: loadingId === materia.id ? "default" : "pointer",
                                            boxShadow: "0 4px 12px rgba(34,197,94,.3)",
                                            whiteSpace: "nowrap" as const,
                                            letterSpacing: ".02em",
                                        }}
                                    >
                                        {loadingId === materia.id ? "Inscribiendo…" : "+ Inscribirse"}
                                    </button>
                                ) : insc && (
                                    <Link to={`/materias/${materia.id}`} style={{
                                        flexShrink: 0,
                                        padding: ".45rem 1.1rem",
                                        background: "#f0f4ff",
                                        color: "#3b82f6",
                                        border: "1.5px solid #bfdbfe",
                                        borderRadius: 999,
                                        fontWeight: 600,
                                        fontSize: ".8rem",
                                        textDecoration: "none",
                                        whiteSpace: "nowrap" as const,
                                    }}>
                                        Ver materia →
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
