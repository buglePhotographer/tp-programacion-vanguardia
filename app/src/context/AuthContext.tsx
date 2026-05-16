import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { loginRequest, getMeRequest } from "../services/auth.service"

interface Usuario {
    id: number
    nombre: string
    email: string
    rol: "estudiante" | "docente" | "admin"
}

interface AuthContextType {
    user: Usuario | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    loading: boolean
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Usuario | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            getMeRequest()
                .then(res => setUser(res.data))
                .catch(() => localStorage.removeItem("token"))
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    async function login(email: string, password: string) {
        const res = await loginRequest(email, password)
        localStorage.setItem("token", res.data.access_token)
        const me = await getMeRequest()
        setUser(me.data)
    }

    function logout() {
        localStorage.removeItem("token")
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
