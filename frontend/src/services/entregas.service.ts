import api from "./api"

export const getTPs = (materia_id: number) => api.get(`/trabajos-practicos/materia/${materia_id}`)
export const crearTP = (data: { materia_id: number; titulo: string; descripcion?: string; fecha_entrega: string }) =>
    api.post("/trabajos-practicos", data)

export const getMisEntregas = () => api.get("/entregas/mis-entregas")
export const getEntregasPorTP = (tp_id: number) => api.get(`/entregas/tp/${tp_id}`)
export const entregar = (tp_id: number, archivo_url: string) =>
    api.post("/entregas", { tp_id, archivo_url })
export const calificarEntrega = (entrega_id: number, nota: number, comentario?: string) =>
    api.put(`/entregas/${entrega_id}/calificar`, { nota, comentario })
