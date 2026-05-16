import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            await login(email, password)
            navigate("/dashboard")
        } catch {
            setError("Email o contraseña incorrectos")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "100px auto", padding: "2rem", border: "1px solid #ccc", borderRadius: 8 }}>
            <h1 style={{ marginBottom: "1.5rem" }}>Iniciar sesión</h1>
            {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    style={{ padding: "0.5rem", fontSize: "1rem" }}
                />
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                    style={{ padding: "0.5rem", fontSize: "1rem" }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: "0.75rem", background: "#1e3a5f", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "1rem" }}
                >
                    {loading ? "Ingresando..." : "Entrar"}
                </button>
            </form>
        </div>
    )
}
