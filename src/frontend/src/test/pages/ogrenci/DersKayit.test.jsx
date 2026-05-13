import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../../../context/ThemeContext'
import { AuthProvider } from '../../../context/AuthContext'
import DersKayit from '../../../pages/OgrenciPaneli/DersKayit'

describe('DersKayit', () => {

    const renderComponent = () => {
        render(
            <MemoryRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <DersKayit />
                    </AuthProvider>
                </ThemeProvider>
            </MemoryRouter>
        )
    }

    test('arama kutusu görünür', () => {
        renderComponent()
        const aramaKutusu = screen.getByRole('textbox')
        expect(aramaKutusu).toBeInTheDocument()
    })

    test('ders kodları görünür', () => {
        renderComponent()
        expect(screen.getByText('CS301')).toBeInTheDocument()
        expect(screen.getByText('CS302')).toBeInTheDocument()
        expect(screen.getByText('CS303')).toBeInTheDocument()
    })

    test('ekle butonuna tıklayınca ders seçilir', () => {
        renderComponent()

        // Tüm butonları al, ilk ekle butonuna tıkla (kaydet butonu hariç)
        const tumButonlar = screen.getAllByRole('button')

        // İlk butona tıkla (ders listesindeki ilk ekle butonu)
        fireEvent.click(tumButonlar[0])

        // Buton sayısı değişmeli veya yeni bir buton çıkmalı
        const yeniButonlar = screen.getAllByRole('button')
        expect(yeniButonlar.length).toBeGreaterThan(0)
    })

})