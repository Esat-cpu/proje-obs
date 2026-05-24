import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './testUtils';
import authService from '../shared/api/authServices';
import AkademisyenGiris from '../pages/AkademisyenGiris';



// useNavigate mock'luyoruz
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// useAuth mock'luyoruz
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin
    })
}));

describe('Akademisyen Giriş Sayfası Kullanıcı Akış Testleri', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Bileşen doğru yükleniyor ve boş form gönderildiğinde UI validasyon hatası veriyor', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AkademisyenGiris />);

        // Başlık ekranda mı? (Akademisyen)
        expect(screen.getByRole('heading', { name: /akademisyen/i })).toBeInTheDocument();

        // Giriş butonuna tıklayalım (Giriş)
        const loginButton = screen.getByRole('button', { name: /giriş/i });
        await user.click(loginButton);

        // Kırmızı zorunlu alan uyarıları çıkmalı
        await waitFor(() => {
            const errorMessages = screen.getAllByText('Bu alan zorunludur.');
            expect(errorMessages.length).toBe(2);
        });
    });

    test('Şifre gizleme/gösterme butonuna tıklandığında şifre input tipi password ve text olarak değişiyor', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AkademisyenGiris />);

        const passwordInput = screen.getByPlaceholderText('••••••••');
        expect(passwordInput.type).toBe('password');

        // Şifre göster/gizle butonunu input'un yanından bulalım
        const toggleButton = passwordInput.parentElement.querySelector('button');
        await user.click(toggleButton);

        // input tipi text olmalı
        expect(passwordInput.type).toBe('text');

        // Tekrar tıklayalım
        await user.click(toggleButton);
        expect(passwordInput.type).toBe('password');
    });

    test('Kullanıcı bilgilerini doldurup gönderdiğinde başarılı giriş ve yönlendirme yapılıyor', async () => {
        const user = userEvent.setup();
        authService.login.mockResolvedValue({
            access: 'mock-academician-token',
            refresh: 'mock-refresh-token',
            role: 'Akademisyen'
        });

        renderWithProviders(<AkademisyenGiris />);

        const usernameInput = screen.getByPlaceholderText('Kullanıcı Adı');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const loginButton = screen.getByRole('button', { name: /giriş/i });

        await user.type(usernameInput, 'hoca123');
        await user.type(passwordInput, 'sifre123');
        await user.click(loginButton);

        // API'nin çağrıldığını doğrulayalım
        await waitFor(() => {
            expect(authService.login).toHaveBeenCalled();
        });
        expect(authService.login.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                username: 'hoca123',
                password: 'sifre123'
            })
        );

        // useAuth.login fonksiyonunun çağrıldığını doğrulayalım
        expect(mockLogin).toHaveBeenCalledWith('mock-academician-token', 'Akademisyen', 'mock-refresh-token');

        // Yönlendirmenin yapıldığını doğrulayalım
        expect(mockNavigate).toHaveBeenCalledWith('/academician');
    });

    test('Hatalı giriş bilgilerinde APIden dönen hata mesajı ekranda listeleniyor', async () => {
        const user = userEvent.setup();
        authService.login.mockRejectedValue({
            response: { data: { detail: 'Kullanıcı adı veya şifre hatalı.' } }
        });

        renderWithProviders(<AkademisyenGiris />);

        const usernameInput = screen.getByPlaceholderText('Kullanıcı Adı');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const loginButton = screen.getByRole('button', { name: /giriş/i });

        await user.type(usernameInput, 'hoca123');
        await user.type(passwordInput, 'yanlis_sifre');
        await user.click(loginButton);

        // Hata mesajının arayüzde gösterilmesini bekleyelim
        await waitFor(() => {
            expect(screen.getByText('Kullanıcı adı veya şifre hatalı.')).toBeInTheDocument();
        });
    });
});
