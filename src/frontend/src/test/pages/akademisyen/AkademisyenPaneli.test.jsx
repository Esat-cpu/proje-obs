import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import { ThemeProvider } from '../../../context/ThemeContext'
import AkademisyenPaneli from '../../../pages/AkademisyenPaneli/AkademisyenPaneli'

describe('AkademisyenPaneli', () => {

    const renderComponent = () => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        })
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/academician']}>
                    <ThemeProvider>
                        <AuthProvider>
                            <AkademisyenPaneli />
                        </AuthProvider>
                    </ThemeProvider>
                </MemoryRouter>
            </QueryClientProvider>
        )
    }

    test('panel başlığı görünür', () => {
        renderComponent()
        expect(screen.getByText('Akademisyen Paneli')).toBeInTheDocument()
    })

    test('kullanıcı adı görünür', () => {
        renderComponent()
        expect(screen.getByText('Prof. Dr. Mehmet Öztürk')).toBeInTheDocument()
    })

    test('navigasyon menüsünde Genel Bakış var', () => {
        renderComponent()
        expect(screen.getByText('Genel Bakış')).toBeInTheDocument()
    })

    test('navigasyon menüsünde Not Girişi var', () => {
        renderComponent()
        expect(screen.getByText('Not Girişi')).toBeInTheDocument()
    })

    test('navigasyon menüsünde Kayıt Onayları var', () => {
        renderComponent()
        expect(screen.getByText('Kayıt Onayları')).toBeInTheDocument()
    })

})