import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import MisNotas from '../pages/MisNotas'

const mockGetMisMaterias = vi.fn()

vi.mock('../services/materias.service', () => ({
    getMisMaterias: () => mockGetMisMaterias(),
}))

function renderMisNotas() {
    return render(<MemoryRouter><MisNotas /></MemoryRouter>)
}

describe('MisNotas', () => {
    beforeEach(() => mockGetMisMaterias.mockReset())

    test('muestra el título de la página', () => {
        mockGetMisMaterias.mockResolvedValue({ data: [] })
        renderMisNotas()
        expect(screen.getByText(/Mis Notas/i)).toBeInTheDocument()
    })

    test('muestra estado vacío cuando no hay inscripciones', async () => {
        mockGetMisMaterias.mockResolvedValue({ data: [] })
        renderMisNotas()
        await waitFor(() => {
            expect(screen.getByText(/No estás inscripto en ninguna materia/i)).toBeInTheDocument()
        })
    })

    test('muestra las materias con sus datos cuando hay inscripciones', async () => {
        mockGetMisMaterias.mockResolvedValue({
            data: [
                { id: 1, materia: { nombre: 'Matemática', codigo: 'MAT01' }, estado: 'activa', nota_final: null },
                { id: 2, materia: { nombre: 'Historia', codigo: 'HIS01' }, estado: 'aprobada', nota_final: 8 },
            ],
        })
        renderMisNotas()
        await waitFor(() => {
            expect(screen.getByText('Matemática')).toBeInTheDocument()
            expect(screen.getByText('Historia')).toBeInTheDocument()
        })
    })

    test('muestra el código de cada materia', async () => {
        mockGetMisMaterias.mockResolvedValue({
            data: [{ id: 1, materia: { nombre: 'Física', codigo: 'FIS01' }, estado: 'activa', nota_final: null }],
        })
        renderMisNotas()
        await waitFor(() => {
            expect(screen.getByText('FIS01')).toBeInTheDocument()
        })
    })

    test('muestra la nota cuando está disponible', async () => {
        mockGetMisMaterias.mockResolvedValue({
            data: [{ id: 1, materia: { nombre: 'Física', codigo: 'FIS01' }, estado: 'aprobada', nota_final: 9 }],
        })
        renderMisNotas()
        await waitFor(() => {
            expect(screen.getByText('9')).toBeInTheDocument()
        })
    })

    test('muestra "—" cuando no hay nota', async () => {
        mockGetMisMaterias.mockResolvedValue({
            data: [{ id: 1, materia: { nombre: 'Química', codigo: 'QUI01' }, estado: 'activa', nota_final: null }],
        })
        renderMisNotas()
        await waitFor(() => {
            expect(screen.getByText('—')).toBeInTheDocument()
        })
    })

    test('calcula el promedio general correctamente', async () => {
        mockGetMisMaterias.mockResolvedValue({
            data: [
                { id: 1, materia: { nombre: 'A', codigo: 'A01' }, estado: 'aprobada', nota_final: 8 },
                { id: 2, materia: { nombre: 'B', codigo: 'B01' }, estado: 'aprobada', nota_final: 6 },
            ],
        })
        renderMisNotas()
        await waitFor(() => {
            expect(screen.getByText('7.0')).toBeInTheDocument()
        })
    })

    test('muestra el conteo correcto en los mini stats', async () => {
        mockGetMisMaterias.mockResolvedValue({
            data: [
                { id: 1, materia: { nombre: 'A', codigo: 'A01' }, estado: 'aprobada', nota_final: 8 },
                { id: 2, materia: { nombre: 'B', codigo: 'B01' }, estado: 'activa', nota_final: null },
            ],
        })
        renderMisNotas()
        await waitFor(() => {
            expect(screen.getByText('2')).toBeInTheDocument()
            expect(screen.getByText('1')).toBeInTheDocument()
        })
    })
})
