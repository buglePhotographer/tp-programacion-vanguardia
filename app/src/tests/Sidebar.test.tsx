import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Sidebar from '../components/Sidebar'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

function renderSidebar(rol: string, nombre = 'Usuario Test') {
    vi.mocked(useAuth).mockReturnValue({
        user: { id: 1, nombre, email: 'test@test.com', rol: rol as any },
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
    })
    return render(<MemoryRouter><Sidebar /></MemoryRouter>)
}

describe('Sidebar — navegación por rol', () => {
    test('admin ve Materias, Docentes y Alumnos', () => {
        renderSidebar('admin')
        expect(screen.getByText('Materias')).toBeInTheDocument()
        expect(screen.getByText('Docentes')).toBeInTheDocument()
        expect(screen.getByText('Alumnos')).toBeInTheDocument()
    })

    test('admin no ve Mis Notas ni Mis Entregas', () => {
        renderSidebar('admin')
        expect(screen.queryByText('Mis Notas')).not.toBeInTheDocument()
        expect(screen.queryByText('Mis Entregas')).not.toBeInTheDocument()
    })

    test('estudiante ve Materias, Mis Notas y Mis Entregas', () => {
        renderSidebar('estudiante')
        expect(screen.getByText('Materias')).toBeInTheDocument()
        expect(screen.getByText('Mis Notas')).toBeInTheDocument()
        expect(screen.getByText('Mis Entregas')).toBeInTheDocument()
    })

    test('estudiante no ve Docentes ni Alumnos', () => {
        renderSidebar('estudiante')
        expect(screen.queryByText('Docentes')).not.toBeInTheDocument()
        expect(screen.queryByText('Alumnos')).not.toBeInTheDocument()
    })

    test('docente solo ve Materias', () => {
        renderSidebar('docente')
        expect(screen.getByText('Materias')).toBeInTheDocument()
        expect(screen.queryByText('Docentes')).not.toBeInTheDocument()
        expect(screen.queryByText('Mis Notas')).not.toBeInTheDocument()
    })

    test('muestra el nombre del usuario', () => {
        renderSidebar('admin', 'María González')
        expect(screen.getByText('María González')).toBeInTheDocument()
    })

    test('logout llama a logout y navega a /login', () => {
        const mockLogout = vi.fn()
        vi.mocked(useAuth).mockReturnValue({
            user: { id: 1, nombre: 'Test', email: 't@t.com', rol: 'admin' as any },
            login: vi.fn(),
            logout: mockLogout,
            loading: false,
        })
        render(<MemoryRouter><Sidebar /></MemoryRouter>)
        fireEvent.click(screen.getByTitle('Cerrar sesión'))
        expect(mockLogout).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
})
