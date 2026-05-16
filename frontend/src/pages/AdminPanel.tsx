import { useState } from "react"
import api from "../services/api"

export default function AdminPanel() {
    const [materiaForm, setMateriaForm] = useState({ nombre: "", codigo: "", descripcion: "" })
    const [mensaje, setMensaje] = useState("")

    async function handleCrearMateria(e: React.FormEvent) {
        e.preventDefault()
        try {
            await api.post("/materias/", materiaForm)
            setMensaje(`Materia "${materiaForm.nombre}" creada correctamente`)
            setMateriaForm({ nombre: "", codigo: "", descripcion: "" })
        } catch (err: any) {
            setMensaje(err.response?.data?.detail ?? "Error al crear materia")
        }
    }

    return (
        <div style={{ padding: "2rem", maxWidth: 500 }}>
            <h1>Panel de Administración</h1>
            {mensaje && <p style={{ color: "green", marginBottom: "1rem" }}>{mensaje}</p>}

            <h2 style={{ marginTop: "1.5rem" }}>Nueva materia</h2>
            <form onSubmit={handleCrearMateria} style={formStyle}>
                <input placeholder="Nombre" value={materiaForm.nombre} onChange={e => setMateriaForm(p => ({ ...p, nombre: e.target.value }))} required style={inputStyle} />
                <input placeholder="Código (ej: MAT101)" value={materiaForm.codigo} onChange={e => setMateriaForm(p => ({ ...p, codigo: e.target.value }))} required style={inputStyle} />
                <input placeholder="Descripción (opcional)" value={materiaForm.descripcion} onChange={e => setMateriaForm(p => ({ ...p, descripcion: e.target.value }))} style={inputStyle} />
                <button type="submit" style={btnStyle}>Crear materia</button>
            </form>
        </div>
    )
}

const formStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.75rem" }
const inputStyle: React.CSSProperties = { padding: "0.5rem", fontSize: "1rem", borderRadius: 4, border: "1px solid #ccc" }
const btnStyle: React.CSSProperties = { padding: "0.6rem 1.2rem", background: "#1e3a5f", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "1rem" }
