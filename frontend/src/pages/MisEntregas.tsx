import { useEffect, useState } from "react"
import { getMisEntregas } from "../services/entregas.service"

interface Entrega {
    id: number
    tp_id: number
    trabajo_practico?: { id: number; titulo: string; fecha_entrega: string }
    archivo_url?: string
    fecha_entrega?: string
    nota?: number
    comentario?: string
}

function notaConfig(nota?: number) {
    if (nota == null) return { bg: "#fef9c3", color: "#a16207", label: "Sin calificar", big: false }
    if (nota >= 7)    return { bg: "#dcfce7", color: "#15803d", label: `${nota}`,        big: true  }
    if (nota >= 4)    return { bg: "#ffedd5", color: "#c2410c", label: `${nota}`,        big: true  }
    return               { bg: "#fee2e2", color: "#b91c1c", label: `${nota}`,        big: true  }
}

export default function MisEntregas() {
    const [entregas, setEntregas] = useState<Entrega[]>([])

    useEffect(() => {
        getMisEntregas().then(res => setEntregas(res.data)).catch(() => {})
    }, [])

    const calificadas = entregas.filter(e => e.nota != null).length
    const pendientes  = entregas.length - calificadas
    const notas       = entregas.filter(e => e.nota != null).map(e => e.nota!)
    const promedio    = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : "—"

    const miniStats = [
        { label: "Total entregadas", value: entregas.length, color: "#22c55e" },
        { label: "Calificadas",       value: calificadas,     color: "#3b82f6" },
        { label: "Promedio",          value: promedio,        color: "#f97316" },
    ]

    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f9" }}>

            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #12172b 0%, #1a2555 100%)",
                padding: "2rem 2rem 1.75rem",
            }}>
                <h1 style={{ color: "white", margin: 0, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-.4px" }}>
                    📤 Mis Entregas
                </h1>
                <p style={{ color: "rgba(255,255,255,.5)", margin: ".3rem 0 0", fontSize: ".85rem" }}>
                    Historial de trabajos prácticos entregados
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

                {/* Estado vacío */}
                {entregas.length === 0 ? (
                    <div style={{ background: "white", borderRadius: 12, border: "1px solid #e8ecf4",
                        boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                        textAlign: "center", padding: "3.5rem 2rem" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                        <div style={{ fontWeight: 700, color: "#1a2035", marginBottom: ".4rem", fontSize: "1rem" }}>
                            Todavía no hiciste ninguna entrega
                        </div>
                        <div style={{ color: "#6b7a99", fontSize: ".87rem" }}>
                            Entrá a una materia y hacé click en "Entregar" en un TP disponible.
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: ".75rem" }}>
                        {entregas.map(e => {
                            const nc = notaConfig(e.nota)
                            return (
                                <div key={e.id} style={{
                                    background: "white", borderRadius: 12,
                                    border: "1px solid #e8ecf4",
                                    boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                                    padding: "1.2rem 1.5rem",
                                    display: "flex", gap: "1.1rem", alignItems: "flex-start",
                                }}>
                                    {/* Ícono estado */}
                                    <div style={{
                                        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                                        background: e.nota == null ? "#fef9c3" : "#dcfce7",
                                        display: "flex", alignItems: "center",
                                        justifyContent: "center", fontSize: "1.3rem",
                                    }}>
                                        {e.nota == null ? "⏳" : "✅"}
                                    </div>

                                    {/* Contenido central */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: ".95rem",
                                            color: "#1a2035", marginBottom: ".25rem" }}>
                                            {e.trabajo_practico?.titulo ?? `TP #${e.tp_id}`}
                                        </div>
                                        {e.fecha_entrega && (
                                            <div style={{ fontSize: ".78rem", color: "#6b7a99", marginBottom: ".5rem" }}>
                                                📅 Entregado el {new Date(e.fecha_entrega).toLocaleDateString("es-AR", {
                                                    day: "2-digit", month: "short", year: "numeric"
                                                })}
                                            </div>
                                        )}
                                        {e.archivo_url && (
                                            <a href={e.archivo_url} target="_blank" rel="noreferrer" style={{
                                                display: "inline-flex", alignItems: "center", gap: ".35rem",
                                                fontSize: ".8rem", color: "#3b82f6",
                                                background: "#eff6ff", padding: ".3rem .8rem",
                                                borderRadius: 6, textDecoration: "none",
                                                border: "1px solid #bfdbfe", fontWeight: 500,
                                            }}>
                                                🔗 Ver archivo
                                            </a>
                                        )}
                                        {e.comentario && (
                                            <div style={{
                                                marginTop: ".75rem", padding: ".6rem .9rem",
                                                background: "#f8fafc",
                                                borderLeft: "3px solid #22c55e",
                                                borderRadius: "0 8px 8px 0",
                                                fontSize: ".83rem", color: "#475569",
                                            }}>
                                                💬 {e.comentario}
                                            </div>
                                        )}
                                    </div>

                                    {/* Nota */}
                                    <div style={{
                                        flexShrink: 0, minWidth: 78, textAlign: "center",
                                        background: nc.bg, color: nc.color,
                                        borderRadius: 12, padding: ".6rem .9rem",
                                        fontWeight: 800,
                                        fontSize: nc.big ? "1.4rem" : ".72rem",
                                        lineHeight: 1.2,
                                    }}>
                                        {nc.label}
                                        {nc.big && (
                                            <div style={{ fontSize: ".65rem", fontWeight: 500, opacity: .75, marginTop: ".15rem" }}>
                                                / 10
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Aviso pendientes */}
                {pendientes > 0 && (
                    <div style={{
                        marginTop: "1.25rem", padding: ".75rem 1.1rem",
                        background: "#fefce8", border: "1px solid #fde68a",
                        borderRadius: 8, fontSize: ".85rem", color: "#a16207", fontWeight: 500,
                    }}>
                        ⏳ Tenés <strong>{pendientes}</strong> entrega{pendientes > 1 ? "s" : ""} pendiente{pendientes > 1 ? "s" : ""} de calificación.
                    </div>
                )}
            </div>
        </div>
    )
}
