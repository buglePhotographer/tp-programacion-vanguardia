import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerRequest } from "../services/auth.service"
import "./Login.css"

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ nombre: "", email: "", password: "", confirm: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    function set(field: string) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm(f => ({ ...f, [field]: e.target.value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        if (form.password !== form.confirm) {
            setError("Las contraseñas no coinciden")
            return
        }
        if (form.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres")
            return
        }
        setLoading(true)
        try {
            await registerRequest(form.nombre, form.email, form.password, "estudiante")
            navigate("/login", { state: { registered: true } })
        } catch (err: any) {
            setError(err.response?.data?.detail ?? "Error al registrarse")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-root">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-icon">🎓</span>
                    <h1 className="login-title">Crear cuenta</h1>
                    <p className="login-subtitle">Registrate como estudiante para acceder a la plataforma</p>
                </div>

                {error && <div className="msg-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="nombre">Nombre completo</label>
                        <input
                            id="nombre"
                            type="text"
                            value={form.nombre}
                            onChange={set("nombre")}
                            placeholder="Juan Pérez"
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={set("email")}
                            placeholder="tu@email.com"
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={set("password")}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="login-field">
                        <label htmlFor="confirm">Confirmar contraseña</label>
                        <input
                            id="confirm"
                            type="password"
                            value={form.confirm}
                            onChange={set("confirm")}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Registrando..." : "Crear cuenta"}
                    </button>
                </form>

                <div className="login-footer">
                    ¿Ya tenés cuenta?{" "}
                    <Link to="/login" style={{ color: "#16a34a", fontWeight: 700, textDecoration: "none" }}>
                        Iniciá sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
