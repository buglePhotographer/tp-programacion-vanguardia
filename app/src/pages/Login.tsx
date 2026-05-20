import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Login.css"

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
        <div className="login-root">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-icon">🎓</span>
                    <h1 className="login-title">Plataforma Académica</h1>
                    <p className="login-subtitle">Ingresá tus credenciales para continuar</p>
                </div>

                {error && <div className="msg-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Ingresando..." : "Iniciar sesión"}
                    </button>
                </form>

                <div className="login-footer">
                    Programación de Vanguardia · 2026
                </div>
            </div>
        </div>
    )
}
