import api from "./api"

export interface EventoCreate {
    materia_id?: number
    titulo: string
    descripcion?: string
    fecha_inicio: string
    fecha_fin: string
}

export const getEventos = () => api.get("/eventos/")
export const getEventosPorMateria = (materia_id: number) => api.get(`/eventos/materia/${materia_id}`)
export const crearEvento = (data: EventoCreate) => api.post("/eventos/", data)
export const eliminarEvento = (id: number) => api.delete(`/eventos/${id}`)
