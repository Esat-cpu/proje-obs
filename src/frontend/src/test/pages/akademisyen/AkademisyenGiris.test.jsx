import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../../context/AuthContext'
import AkademisyenGiris from '../../../pages/AkademisyenGiris'

describe('AkademisyenGiris Formu', () => {

    const renderComponent = () => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        })
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <AuthProvider>
                        <AkademisyenGiris />
                    </AuthProvider>
                </MemoryRouter>
            </QueryClientProvider>
        )
    }

    test('boş form gönderilince iki hata mesajı çıkar', () => {
        renderComponent()

        const buton = screen.getByText('Giriş')
        fireEvent.click(buton)

        const hatalar = screen.getAllByText('Bu alan zorunludur.')
        expect(hatalar).toHaveLength(2)
    })

    test('sadece kullanıcı adı girilince şifre hatası çıkar', () => {
        renderComponent()

        const usernameInput = screen.getByPlaceholderText('Kullanıcı Adı')
        fireEvent.change(usernameInput, { target: { value: 'mehmet.hoca' } })

        const buton = screen.getByText('Giriş')
        fireEvent.click(buton)

        const hatalar = screen.getAllByText('Bu alan zorunludur.')
        expect(hatalar).toHaveLength(1)
    })

})