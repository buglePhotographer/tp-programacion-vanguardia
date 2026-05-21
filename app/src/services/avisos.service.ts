import api from "./api"

export const getAvisosGlobales = () => api.get("/avisos/")
export const getAvisosPorMateria = (materia_id: number) => api.get(`/avisos/materia/${materia_id}`)
export const crearAviso = (data: { materia_id?: number; titulo: string; contenido: string }) =>
    api.post("/avisos/", data)
export const eliminarAviso = (id: number) => api.delete(`/avisos/${id}`)
