import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Login from '../pages/Login'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

const mockLogin = vi.fn()
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ login: mockLogin, user: null, logout: vi.fn(), loading: false }),
}))

function renderLogin() {
    return render(<MemoryRouter><Login /></MemoryRouter>)
}

describe('Login', () => {
    beforeEach(() => {
        mockLogin.mockReset()
        mockNavigate.mockReset()
    })

    test('renderiza el formulario con email, password y botón', () => {
        renderLogin()
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    })

    test('navega al dashboard tras login exitoso', async () => {
        mockLogin.mockResolvedValueOnce(undefined)
        renderLogin()

        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'admin@test.com' },
        })
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
            target: { value: 'admin1234' },
        })
        fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'admin1234')
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
        })
    })

    test('muestra error con credenciales incorrectas', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Unauthorized'))
        renderLogin()

        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'wrong@test.com' },
        })
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), {
            target: { value: 'wrongpass' },
        })
        fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

        await waitFor(() => {
            expect(screen.getByText(/email o contraseña incorrectos/i)).toBeInTheDocument()
        })
    })

    test('botón muestra "Ingresando..." mientras carga', async () => {
        mockLogin.mockImplementation(() => new Promise(() => {}))
        renderLogin()

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } })
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'pass' } })
        fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /ingresando/i })).toBeInTheDocument()
        })
    })
})
