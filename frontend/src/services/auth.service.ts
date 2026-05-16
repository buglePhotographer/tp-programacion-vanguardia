import api from "./api"

export const loginRequest = (email: string, password: string) =>
    api.post("/auth/login", { email, password })

export const registerRequest = (nombre: string, email: string, password: string, rol: string) =>
    api.post("/auth/register", { nombre, email, password, rol })

export const getMeRequest = () => api.get("/auth/me")
