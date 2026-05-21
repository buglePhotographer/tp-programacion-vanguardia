import api from "./api"

export const getMaterias = () => api.get("/materias/")
export const getMateria = (id: number) => api.get(`/materias/${id}`)
export const createMateria = (data: { nombre: string; codigo: string; descripcion?: string; docente_id?: number }) =>
    api.post("/materias/", data)
export const updateMateria = (id: number, data: { nombre?: string; codigo?: string; descripcion?: string; docente_id?: number }) =>
    api.put(`/materias/${id}`, data)
export const deleteMateria = (id: number) => api.delete(`/materias/${id}`)

export const getMisMaterias = () => api.get("/inscripciones/mis-materias")
export const inscribirse = (materia_id: number) => api.post("/inscripciones/", { materia_id })
export const getAlumnosDeMateria = (materia_id: number) => api.get(`/inscripciones/materia/${materia_id}`)
export const cargarNotaFinal = (inscripcion_id: number, nota: number) =>
    api.put(`/inscripciones/${inscripcion_id}/nota-final?nota=${nota}`)
