import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../../../context/ThemeContext'
import { AuthProvider } from '../../../context/AuthContext'
import KayitOnaylari from '../../../pages/AkademisyenPaneli/KayitOnaylari'

describe('KayitOnaylari', () => {

    const renderComponent = () => {
        render(
            <MemoryRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <KayitOnaylari />
                    </AuthProvider>
                </ThemeProvider>
            </MemoryRouter>
        )
    }

    test('öğrenci adı görünür', () => {
        renderComponent()
        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument()
    })

    test('öğrenci numarası görünür', () => {
        renderComponent()
        expect(screen.getByText('20211001')).toBeInTheDocument()
    })

    test('ders kodu görünür', () => {
        renderComponent()
        expect(screen.getByText(/CS301/)).toBeInTheDocument()
    })

    test('onay ve red butonları var', () => {
        renderComponent()
        const butonlar = screen.getAllByRole('button')
        expect(butonlar.length).toBeGreaterThanOrEqual(2)
    })

})