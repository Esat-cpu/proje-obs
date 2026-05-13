import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import OgrenciPaneli from '../../../pages/OgrenciPaneli/OgrenciPaneli'
import { ThemeProvider } from '../../../context/ThemeContext'

describe('OgrenciPaneli', () => {

    const renderComponent = () => {
        render(
            <MemoryRouter initialEntries={['/student']}>
                <ThemeProvider>
                    <AuthProvider>
                        <OgrenciPaneli />
                    </AuthProvider>
                </ThemeProvider>
            </MemoryRouter>
        )
    }

    test('panel başlığı görünür', () => {
        renderComponent()
        expect(screen.getByText('Öğrenci Paneli')).toBeInTheDocument()
    })

    test('kullanıcı adı görünür', () => {
        renderComponent()
        expect(screen.getByText('Ahmet Öztürk')).toBeInTheDocument()
    })

    test('navigasyon menüsünde Genel Bakış var', () => {
        renderComponent()
        expect(screen.getByText('Genel Bakış')).toBeInTheDocument()
    })

    test('navigasyon menüsünde Derslerim var', () => {
        renderComponent()
        expect(screen.getByText('Derslerim')).toBeInTheDocument()
    })

    test('navigasyon menüsünde Ders Kayıt var', () => {
        renderComponent()
        expect(screen.getByText('Ders Kayıt')).toBeInTheDocument()
    })

    test('navigasyon menüsünde Transkript var', () => {
        renderComponent()
        expect(screen.getByText('Transkript')).toBeInTheDocument()
    })

})