import api from "./api"

export const loginRequest = (email: string, password: string) =>
    api.post("/auth/login", { email, password })

export const registerRequest = (nombre: string, email: string, password: string, rol: string) =>
    api.post("/auth/register", { nombre, email, password, rol })

export const getMeRequest = () => api.get("/auth/me")

export const updateUsuario = (id: number, data: { nombre?: string; email?: string; password?: string }) =>
    api.put(`/auth/usuarios/${id}`, data)

export const deleteUsuario = (id: number) => api.delete(`/auth/usuarios/${id}`)
