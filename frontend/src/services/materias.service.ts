import api from "./api"

export const getMaterias = () => api.get("/materias/")
export const getMateria = (id: number) => api.get(`/materias/${id}`)
export const getMisMaterias = () => api.get("/inscripciones/mis-materias")
export const inscribirse = (materia_id: number) => api.post("/inscripciones/", { materia_id })
export const getAlumnosDeMateria = (materia_id: number) => api.get(`/inscripciones/materia/${materia_id}`)
export const cargarNotaFinal = (inscripcion_id: number, nota: number) =>
    api.put(`/inscripciones/${inscripcion_id}/nota-final?nota=${nota}`)
