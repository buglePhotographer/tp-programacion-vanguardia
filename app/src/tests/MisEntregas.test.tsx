import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import MisEntregas from '../pages/MisEntregas'

const mockGetMisEntregas = vi.fn()

vi.mock('../services/entregas.service', () => ({
    getMisEntregas: () => mockGetMisEntregas(),
    getTPs: vi.fn(),
    crearTP: vi.fn(),
    entregar: vi.fn(),
    getEntregasPorTP: vi.fn(),
    calificarEntrega: vi.fn(),
}))

function renderMisEntregas() {
    return render(<MemoryRouter><MisEntregas /></MemoryRouter>)
}

describe('MisEntregas', () => {
    beforeEach(() => mockGetMisEntregas.mockReset())

    test('muestra el título de la página', () => {
        mockGetMisEntregas.mockResolvedValue({ data: [] })
        renderMisEntregas()
        expect(screen.getByText(/Mis Entregas/i)).toBeInTheDocument()
    })

    test('muestra estado vacío cuando no hay entregas', async () => {
        mockGetMisEntregas.mockResolvedValue({ data: [] })
        renderMisEntregas()
        await waitFor(() => {
            expect(screen.getByText(/Todavía no hiciste ninguna entrega/i)).toBeInTheDocument()
        })
    })

    test('muestra las entregas cuando existen', async () => {
        mockGetMisEntregas.mockResolvedValue({
            data: [{
                id: 1, tp_id: 10,
                trabajo_practico: { id: 10, titulo: 'TP 1 - Arrays', fecha_entrega: '2026-06-01T00:00:00' },
                archivo_url: 'https://drive.google.com/tp1',
                fecha_entrega: '2026-05-20T10:00:00',
                nota: null, comentario: null,
            }],
        })
        renderMisEntregas()
        await waitFor(() => {
            expect(screen.getByText('TP 1 - Arrays')).toBeInTheDocument()
        })
    })

    test('muestra "Sin calificar" cuando la entrega no tiene nota', async () => {
        mockGetMisEntregas.mockResolvedValue({
            data: [{
                id: 1, tp_id: 10,
                trabajo_practico: { id: 10, titulo: 'TP pendiente de nota', fecha_entrega: '2026-06-01T00:00:00' },
                nota: null, comentario: null,
            }],
        })
        renderMisEntregas()
        await waitFor(() => {
            expect(screen.getByText('Sin calificar')).toBeInTheDocument()
        })
    })

    test('muestra la nota cuando la entrega está calificada', async () => {
        mockGetMisEntregas.mockResolvedValue({
            data: [{
                id: 1, tp_id: 10,
                trabajo_practico: { id: 10, titulo: 'TP calificado', fecha_entrega: '2026-06-01T00:00:00' },
                nota: 9, comentario: null,
            }],
        })
        renderMisEntregas()
        await waitFor(() => {
            expect(screen.getByText('9')).toBeInTheDocument()
        })
    })

    test('muestra el comentario del docente cuando existe', async () => {
        mockGetMisEntregas.mockResolvedValue({
            data: [{
                id: 1, tp_id: 10,
                trabajo_practico: { id: 10, titulo: 'TP con comentario', fecha_entrega: '2026-06-01T00:00:00' },
                nota: 7, comentario: 'Buen trabajo, mejorar la documentación',
            }],
        })
        renderMisEntregas()
        await waitFor(() => {
            expect(screen.getByText(/Buen trabajo, mejorar la documentación/i)).toBeInTheDocument()
        })
    })

    test('muestra aviso de entregas pendientes de calificación', async () => {
        mockGetMisEntregas.mockResolvedValue({
            data: [
                { id: 1, tp_id: 1, trabajo_practico: { id: 1, titulo: 'TP A', fecha_entrega: '2026-06-01T00:00:00' }, nota: null, comentario: null },
                { id: 2, tp_id: 2, trabajo_practico: { id: 2, titulo: 'TP B', fecha_entrega: '2026-06-01T00:00:00' }, nota: 8, comentario: null },
            ],
        })
        renderMisEntregas()
        await waitFor(() => {
            expect(screen.getByText(/pendiente.*calificación/i)).toBeInTheDocument()
        })
    })

    test('los mini stats muestran el total correcto', async () => {
        mockGetMisEntregas.mockResolvedValue({
            data: [
                { id: 1, tp_id: 1, trabajo_practico: { id: 1, titulo: 'TP A', fecha_entrega: '2026-06-01T00:00:00' }, nota: 8, comentario: null },
                { id: 2, tp_id: 2, trabajo_practico: { id: 2, titulo: 'TP B', fecha_entrega: '2026-06-01T00:00:00' }, nota: 6, comentario: null },
            ],
        })
        renderMisEntregas()
        await waitFor(() => {
            expect(screen.getByText('Total entregadas')).toBeInTheDocument()
            expect(screen.getByText('7.0')).toBeInTheDocument()
        })
    })
})
