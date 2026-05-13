import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import OgrenciGiris from '../../../pages/OgrenciGiris'

describe('OgrenciGiris Formu', () => {

    const renderComponent = () => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        })
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AuthProvider>
                        <OgrenciGiris />
                    </AuthProvider>
                </MemoryRouter>
            </QueryClientProvider>
        )
    }

    test('boş form gönderilince hata mesajları çıkar', () => {
        renderComponent()

        const buton = screen.getByText('Giriş')
        fireEvent.click(buton)

        const hatalar = screen.getAllByText('Bu alan zorunludur.')
        expect(hatalar).toHaveLength(2)
    })

    test('sadece öğrenci no girilince şifre hatası çıkar', () => {
        renderComponent()

        const ogrNoInput = screen.getByPlaceholderText('20211234567')
        fireEvent.change(ogrNoInput, { target: { value: '20211234567' } })

        const buton = screen.getByText('Giriş')
        fireEvent.click(buton)

        const hatalar = screen.getAllByText('Bu alan zorunludur.')
        expect(hatalar).toHaveLength(1)
    })

})