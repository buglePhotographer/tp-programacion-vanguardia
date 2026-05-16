import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import ProtectedRoute from '../components/ProtectedRoute'

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

function renderWithRoutes(userValue: any) {
    vi.mocked(useAuth).mockReturnValue(userValue)
    return render(
        <MemoryRouter initialEntries={['/protected']}>
            <Routes>
                <Route path="/login" element={<div>Página de Login</div>} />
                <Route path="/dashboard" element={<div>Dashboard</div>} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/protected" element={<div>Contenido protegido</div>} />
                </Route>
                <Route element={<ProtectedRoute soloRol="admin" />}>
                    <Route path="/admin" element={<div>Solo admin</div>} />
                </Route>
            </Routes>
        </MemoryRouter>
    )
}

describe('ProtectedRoute', () => {
    test('redirige a /login si no hay usuario autenticado', () => {
        renderWithRoutes({ user: null, loading: false, login: vi.fn(), logout: vi.fn() })
        expect(screen.getByText('Página de Login')).toBeInTheDocument()
    })

    test('muestra el contenido si el usuario está autenticado', () => {
        renderWithRoutes({
            user: { id: 1, nombre: 'Test', email: 't@t.com', rol: 'estudiante' },
            loading: false, login: vi.fn(), logout: vi.fn(),
        })
        expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
    })

    test('muestra loading mientras carga', () => {
        renderWithRoutes({ user: null, loading: true, login: vi.fn(), logout: vi.fn() })
        expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })

    test('redirige a /dashboard si el rol no coincide', () => {
        vi.mocked(useAuth).mockReturnValue({
            user: { id: 1, nombre: 'Est', email: 'e@e.com', rol: 'estudiante' },
            loading: false, login: vi.fn(), logout: vi.fn(),
        })
        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route path="/dashboard" element={<div>Dashboard</div>} />
                    <Route element={<ProtectedRoute soloRol="admin" />}>
                        <Route path="/admin" element={<div>Solo admin</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
})
