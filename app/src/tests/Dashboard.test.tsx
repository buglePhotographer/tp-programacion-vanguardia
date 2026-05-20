import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Dashboard from '../pages/Dashboard'

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}))
vi.mock('../services/avisos.service', () => ({
    getAvisosGlobales: () => Promise.resolve({ data: [] }),
}))
vi.mock('../services/api', () => ({
    default: { get: () => Promise.resolve({ data: [] }) },
}))

import { useAuth } from '../context/AuthContext'

function renderDashboard(rol: string, nombre = 'Test User') {
    vi.mocked(useAuth).mockReturnValue({
        user: { id: 1, nombre, email: 'test@test.com', rol: rol as any },
        login: vi.fn(), logout: vi.fn(), loading: false,
    })
    return render(<MemoryRouter><Dashboard /></MemoryRouter>)
}

describe('Dashboard', () => {
    test('muestra la sección de acceso rápido', () => {
        renderDashboard('admin')
        expect(screen.getByText(/acceso rápido/i)).toBeInTheDocument()
    })

    test('muestra la sección de avisos generales', () => {
        renderDashboard('admin')
        expect(screen.getByText(/avisos generales/i)).toBeInTheDocument()
    })

    test('admin ve links a Materias, Docentes y Alumnos', () => {
        renderDashboard('admin')
        expect(screen.getByText(/Materias/)).toBeInTheDocument()
        expect(screen.getByText(/Docentes/)).toBeInTheDocument()
        expect(screen.getByText(/Alumnos/)).toBeInTheDocument()
    })

    test('admin no ve links de Mis Notas ni Mis Entregas', () => {
        renderDashboard('admin')
        expect(screen.queryByText(/Mis Notas/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Mis Entregas/)).not.toBeInTheDocument()
    })

    test('estudiante ve links a Mis Notas y Mis Entregas', () => {
        renderDashboard('estudiante')
        expect(screen.getByText(/Mis Notas/)).toBeInTheDocument()
        expect(screen.getByText(/Mis Entregas/)).toBeInTheDocument()
    })

    test('estudiante no ve links de Docentes ni Alumnos', () => {
        renderDashboard('estudiante')
        expect(screen.queryByText(/Docentes/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Alumnos/)).not.toBeInTheDocument()
    })

    test('muestra el nombre del usuario en el saludo', () => {
        renderDashboard('admin', 'María González')
        expect(screen.getByText(/María González/)).toBeInTheDocument()
    })

    test('muestra el estado vacío cuando no hay avisos', () => {
        renderDashboard('admin')
        expect(screen.getByText(/No hay avisos publicados/i)).toBeInTheDocument()
    })
})
