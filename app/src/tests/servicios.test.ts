import { vi, describe, test, expect, beforeEach } from 'vitest'

const { mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => ({
    mockGet:    vi.fn(),
    mockPost:   vi.fn(),
    mockPut:    vi.fn(),
    mockDelete: vi.fn(),
}))

vi.mock('../services/api', () => ({
    default: { get: mockGet, post: mockPost, put: mockPut, delete: mockDelete },
}))

import { loginRequest, getMeRequest, registerRequest } from '../services/auth.service'
import { getMaterias, getMateria, getMisMaterias, inscribirse } from '../services/materias.service'
import { getAvisosGlobales, getAvisosPorMateria, crearAviso, eliminarAviso } from '../services/avisos.service'
import { getEventos, getEventosPorMateria, crearEvento, eliminarEvento } from '../services/eventos.service'

beforeEach(() => {
    mockGet.mockReset()
    mockPost.mockReset()
    mockPut.mockReset()
    mockDelete.mockReset()
})

describe('auth.service', () => {
    test('loginRequest llama a POST /auth/login con email y password', () => {
        mockPost.mockResolvedValue({ data: { access_token: 'tok' } })
        loginRequest('user@test.com', 'pass123')
        expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'user@test.com', password: 'pass123' })
    })

    test('getMeRequest llama a GET /auth/me', () => {
        mockGet.mockResolvedValue({ data: {} })
        getMeRequest()
        expect(mockGet).toHaveBeenCalledWith('/auth/me')
    })

    test('registerRequest llama a POST /auth/register con los datos correctos', () => {
        mockPost.mockResolvedValue({ data: {} })
        registerRequest('Juan', 'juan@test.com', 'pass123', 'estudiante')
        expect(mockPost).toHaveBeenCalledWith('/auth/register', {
            nombre: 'Juan', email: 'juan@test.com', password: 'pass123', rol: 'estudiante',
        })
    })
})

describe('materias.service', () => {
    test('getMaterias llama a GET /materias/', () => {
        mockGet.mockResolvedValue({ data: [] })
        getMaterias()
        expect(mockGet).toHaveBeenCalledWith('/materias/')
    })

    test('getMateria llama a GET /materias/:id', () => {
        mockGet.mockResolvedValue({ data: {} })
        getMateria(5)
        expect(mockGet).toHaveBeenCalledWith('/materias/5')
    })

    test('getMisMaterias llama a GET /inscripciones/mis-materias', () => {
        mockGet.mockResolvedValue({ data: [] })
        getMisMaterias()
        expect(mockGet).toHaveBeenCalledWith('/inscripciones/mis-materias')
    })

    test('inscribirse llama a POST /inscripciones/ con el materia_id', () => {
        mockPost.mockResolvedValue({ data: {} })
        inscribirse(3)
        expect(mockPost).toHaveBeenCalledWith('/inscripciones/', { materia_id: 3 })
    })
})

describe('avisos.service', () => {
    test('getAvisosGlobales llama a GET /avisos/', () => {
        mockGet.mockResolvedValue({ data: [] })
        getAvisosGlobales()
        expect(mockGet).toHaveBeenCalledWith('/avisos/')
    })

    test('getAvisosPorMateria llama a GET /avisos/materia/:id', () => {
        mockGet.mockResolvedValue({ data: [] })
        getAvisosPorMateria(2)
        expect(mockGet).toHaveBeenCalledWith('/avisos/materia/2')
    })

    test('crearAviso llama a POST /avisos/ con los datos', () => {
        mockPost.mockResolvedValue({ data: {} })
        crearAviso({ titulo: 'Aviso test', contenido: 'Contenido', materia_id: 1 })
        expect(mockPost).toHaveBeenCalledWith('/avisos/', { titulo: 'Aviso test', contenido: 'Contenido', materia_id: 1 })
    })

    test('eliminarAviso llama a DELETE /avisos/:id', () => {
        mockDelete.mockResolvedValue({})
        eliminarAviso(7)
        expect(mockDelete).toHaveBeenCalledWith('/avisos/7')
    })
})

describe('eventos.service', () => {
    test('getEventos llama a GET /eventos/', () => {
        mockGet.mockResolvedValue({ data: [] })
        getEventos()
        expect(mockGet).toHaveBeenCalledWith('/eventos/')
    })

    test('getEventosPorMateria llama a GET /eventos/materia/:id', () => {
        mockGet.mockResolvedValue({ data: [] })
        getEventosPorMateria(4)
        expect(mockGet).toHaveBeenCalledWith('/eventos/materia/4')
    })

    test('crearEvento llama a POST /eventos/ con los datos', () => {
        mockPost.mockResolvedValue({ data: {} })
        crearEvento({ titulo: 'Parcial', fecha_inicio: '2026-06-10T09:00:00', fecha_fin: '2026-06-10T11:00:00' })
        expect(mockPost).toHaveBeenCalledWith('/eventos/', {
            titulo: 'Parcial', fecha_inicio: '2026-06-10T09:00:00', fecha_fin: '2026-06-10T11:00:00',
        })
    })

    test('eliminarEvento llama a DELETE /eventos/:id', () => {
        mockDelete.mockResolvedValue({})
        eliminarEvento(3)
        expect(mockDelete).toHaveBeenCalledWith('/eventos/3')
    })
})
