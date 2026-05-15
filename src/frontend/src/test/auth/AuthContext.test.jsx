import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../context/AuthContext'

const TestComponent = () => {
    const { isAuthenticated, role, token, login, logout } = useAuth()

    return (
        <div>
            <span data-testid="isAuthenticated">{String(isAuthenticated)}</span>
            <span data-testid="role">{role}</span>
            <span data-testid="token">{token}</span>
            <button onClick={() => login('test-token', 'Ogrenci', 'test-refresh')}>
                Giriş
            </button>
            <button onClick={logout}>
                Çıkış
            </button>
        </div>
    )
}

describe('AuthContext', () => {

    beforeEach(() => {
        localStorage.clear()
    })

    test('başlangıçta giriş yapılmamış olmalı', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
        expect(screen.getByTestId('role').textContent).toBe('')
        expect(screen.getByTestId('token').textContent).toBe('')
    })

    test('login çağrılınca isAuthenticated true olmalı', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        act(() => {
            screen.getByText('Giriş').click()
        })

        expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
        expect(screen.getByTestId('role').textContent).toBe('Ogrenci')
        expect(screen.getByTestId('token').textContent).toBe('test-token')
    })

    test('login çağrılınca localStorage a kaydedilmeli', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        act(() => {
            screen.getByText('Giriş').click()
        })

        // Ekip access_token ve refresh_token kullanıyor
        expect(localStorage.getItem('access_token')).toBe('test-token')
        expect(localStorage.getItem('role')).toBe('Ogrenci')
        expect(localStorage.getItem('refreshToken')).toBe('test-refresh')
    })

    test('logout çağrılınca isAuthenticated false olmalı', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        act(() => {
            screen.getByText('Giriş').click()
        })

        act(() => {
            screen.getByText('Çıkış').click()
        })

        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
        expect(screen.getByTestId('role').textContent).toBe('')
        expect(screen.getByTestId('token').textContent).toBe('')
    })

    test('logout çağrılınca localStorage temizlenmeli', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        act(() => {
            screen.getByText('Giriş').click()
        })

        act(() => {
            screen.getByText('Çıkış').click()
        })

        expect(localStorage.getItem('access_token')).toBeNull()
        expect(localStorage.getItem('role')).toBeNull()
        expect(localStorage.getItem('refresh_token')).toBeNull()
    })

})