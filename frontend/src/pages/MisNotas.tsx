import { useEffect, useState } from "react"
import { getMisMaterias } from "../services/materias.service"

interface Inscripcion {
    id: number
    materia: { nombre: string; codigo: string }
    estado: string
    nota_final?: number
}

const estadoStyle: Record<string, { bg: string; color: string }> = {
    activa:      { bg: "#dcfce7", color: "#15803d" },
    aprobada:    { bg: "#dbeafe", color: "#1d4ed8" },
    desaprobada: { bg: "#fee2e2", color: "#b91c1c" },
}

function notaConfig(nota?: number) {
    if (nota == null) return { color: "#94a3b8", bar: "#e2e8f0" }
    if (nota >= 7)    return { color: "#16a34a", bar: "#22c55e" }
    if (nota >= 4)    return { color: "#ea580c", bar: "#f97316" }
    return               { color: "#b91c1c", bar: "#f87171" }
}

export default function MisNotas() {
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])

    useEffect(() => {
        getMisMaterias().then(res => setInscripciones(res.data)).catch(() => {})
    }, [])

    const aprobadas = inscripciones.filter(i => i.estado === "aprobada").length
    const notas     = inscripciones.filter(i => i.nota_final != null).map(i => i.nota_final!)
    const promedio  = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : "—"

    const miniStats = [
        { label: "Materias cursadas", value: inscripciones.length, color: "#22c55e" },
        { label: "Aprobadas",          value: aprobadas,            color: "#3b82f6" },
        { label: "Promedio general",   value: promedio,             color: "#f97316" },
    ]

    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f9" }}>

            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #12172b 0%, #1a2555 100%)",
                padding: "2rem 2rem 1.75rem",
            }}>
                <h1 style={{ color: "white", margin: 0, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-.4px" }}>
                    📊 Mis Notas
                </h1>
                <p style={{ color: "rgba(255,255,255,.5)", margin: ".3rem 0 0", fontSize: ".85rem" }}>
                    Rendimiento académico por materia
                </p>
            </div>

            <div style={{ padding: "1.75rem 2rem" }}>

                {/* Mini stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
                    {miniStats.map(s => (
                        <div key={s.label} style={{
                            background: "white", borderRadius: 12,
                            border: "1px solid #e8ecf4",
                            boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                            padding: "1.1rem 1.4rem",
                            display: "flex", alignItems: "center", gap: "1rem",
                        }}>
                            <div style={{ width: 8, height: 44, borderRadius: 999, background: s.color, flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: "1.65rem", fontWeight: 800, lineHeight: 1, color: s.color }}>
                                    {s.value}
                                </div>
                                <div style={{ fontSize: ".7rem", color: "#6b7a99", marginTop: ".25rem",
                                    textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>
                                    {s.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabla / cards */}
                {inscripciones.length === 0 ? (
                    <div style={{ background: "white", borderRadius: 12, border: "1px solid #e8ecf4",
                        boxShadow: "0 2px 8px rgba(0,0,0,.06)", textAlign: "center",
                        padding: "3.5rem 2rem", color: "#6b7a99" }}>
                        No estás inscripto en ninguna materia.
                    </div>
                ) : (
                    <div style={{ background: "white", borderRadius: 12, border: "1px solid #e8ecf4",
                        boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>

                        {/* Cabecera tabla */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 130px 220px",
                            padding: ".7rem 1.4rem", background: "#f8fafc",
                            borderBottom: "1px solid #e8ecf4" }}>
                            {["Materia", "Código", "Estado", "Nota final"].map(h => (
                                <span key={h} style={{ fontSize: ".7rem", fontWeight: 700,
                                    textTransform: "uppercase", letterSpacing: ".07em", color: "#6b7a99" }}>
                                    {h}
                                </span>
                            ))}
                        </div>

                        {inscripciones.map((i, idx) => {
                            const nc = notaConfig(i.nota_final)
                            const est = estadoStyle[i.estado] ?? { bg: "#f1f5f9", color: "#475569" }
                            return (
                                <div key={i.id} style={{
                                    display: "grid", gridTemplateColumns: "1fr 110px 130px 220px",
                                    padding: ".95rem 1.4rem", alignItems: "center",
                                    borderBottom: idx < inscripciones.length - 1 ? "1px solid #f1f5f9" : "none",
                                    transition: "background .12s",
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#fafbff")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >
                                    {/* Nombre */}
                                    <div style={{ fontWeight: 600, fontSize: ".92rem", color: "#1a2035" }}>
                                        {i.materia.nombre}
                                    </div>

                                    {/* Código */}
                                    <div>
                                        <span style={{ background: "#f1f5f9", color: "#475569",
                                            fontSize: ".72rem", fontWeight: 700,
                                            padding: ".18rem .55rem", borderRadius: 5,
                                            letterSpacing: ".04em" }}>
                                            {i.materia.codigo}
                                        </span>
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <span style={{ ...est, fontSize: ".7rem", fontWeight: 700,
                                            padding: ".2rem .7rem", borderRadius: 999,
                                            letterSpacing: ".04em", textTransform: "uppercase" as const }}>
                                            {i.estado}
                                        </span>
                                    </div>

                                    {/* Nota con barra */}
                                    <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                                        <div style={{ flex: 1, height: 7, background: "#e8ecf4",
                                            borderRadius: 999, overflow: "hidden" }}>
                                            <div style={{
                                                width: i.nota_final != null ? `${(i.nota_final / 10) * 100}%` : "0%",
                                                height: "100%", background: nc.bar,
                                                borderRadius: 999, transition: "width .5s ease",
                                            }} />
                                        </div>
                                        <span style={{ fontWeight: 800, fontSize: "1rem",
                                            color: nc.color, minWidth: 28, textAlign: "right" }}>
                                            {i.nota_final ?? "—"}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
