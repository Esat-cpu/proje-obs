import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { AuthContext } from '../../context/AuthContext'

const renderWithAuth = (ui, { isAuthenticated, role } = {}) => {
    return render(
        <AuthContext.Provider value={{ isAuthenticated, role }}>
            <MemoryRouter initialEntries={['/test']}>
                <Routes>
                    <Route path="/test" element={ui} />
                    <Route path="/" element={<div>Ana Sayfa</div>} />
                    <Route path="/403" element={<div>403 Sayfası</div>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    )
}

describe('ProtectedRoute', () => {

    test('giriş yapılmamışsa ana sayfaya yönlendirir', () => {
        renderWithAuth(
            <ProtectedRoute allowedRoles={['Ogrenci']}>
                <div>Öğrenci Paneli</div>
            </ProtectedRoute>,
            { isAuthenticated: false, role: null }
        )
        expect(screen.getByText('Ana Sayfa')).toBeInTheDocument()
    })

    test('öğrenci rolüyle akademisyen sayfasına girince 403 e gider', () => {
        renderWithAuth(
            <ProtectedRoute allowedRoles={['Akademisyen']}>
                <div>Akademisyen Paneli</div>
            </ProtectedRoute>,
            { isAuthenticated: true, role: 'Ogrenci' }
        )
        expect(screen.getByText('403 Sayfası')).toBeInTheDocument()
    })

    test('akademisyen rolüyle öğrenci sayfasına girince 403 e gider', () => {
        renderWithAuth(
            <ProtectedRoute allowedRoles={['Ogrenci']}>
                <div>Öğrenci Paneli</div>
            </ProtectedRoute>,
            { isAuthenticated: true, role: 'Akademisyen' }
        )
        expect(screen.getByText('403 Sayfası')).toBeInTheDocument()
    })

    test('doğru rolle sayfaya girince içerik görünür', () => {
        renderWithAuth(
            <ProtectedRoute allowedRoles={['Ogrenci']}>
                <div>Öğrenci Paneli</div>
            </ProtectedRoute>,
            { isAuthenticated: true, role: 'Ogrenci' }
        )
        expect(screen.getByText('Öğrenci Paneli')).toBeInTheDocument()
    })

})