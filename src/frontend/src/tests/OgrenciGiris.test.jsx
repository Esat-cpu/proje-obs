import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import React from 'react';
import OgrenciGiris from '../pages/OgrenciGiris'; // Dosya konumunuz tam burası
import { renderWithProviders } from './testUtils';
import authService from '../shared/api/authServices';



// 2. AuthContext bağımlılığını simüle ediyoruz
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

describe('Öğrenci Giriş Sayfası Kullanıcı Akışları', () => {

    test('Bileşen doğru yükleniyor ve boş form gönderildiğinde UI validasyon hatası veriyor', async () => {
        const user = userEvent.setup();
        renderWithProviders(<OgrenciGiris />);

        // Kullanıcı oranına odaklı doğrulama (Başlık ekranda mı?)
        expect(screen.getByRole('heading', { name: /öğrenci/i })).toBeInTheDocument();

        // Giriş butonunu bul ve tıkla
        const loginButton = screen.getByRole('button', { name: /giriş/i });
        await user.click(loginButton);

        // Durum değişimlerinin UI'a yansıması (İki alan için de uyarı çıkmalı)
        await waitFor(() => {
            const errorMessages = screen.getAllByText('Bu alan zorunludur.');
            expect(errorMessages.length).toBe(2);
        });
    });

    test('Kullanıcı bilgilerini doldurup gönderdiğinde login servisi tetikleniyor', async () => {
        const user = userEvent.setup();
        authService.login.mockResolvedValue({ access: 'mock-token', role: 'Ogrenci' });

        renderWithProviders(<OgrenciGiris />);

        // Kullanıcı etkileşimleri (Giriş / Klavye)
        const ogrNoInput = screen.getByPlaceholderText('20211234567');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const loginButton = screen.getByRole('button', { name: /giriş/i });

        await user.type(ogrNoInput, '202612345');
        await user.type(passwordInput, 'sifre123');
        await user.click(loginButton);

        // Detay koda takılmadan temel kullanıcı akışının doğrulanması
        expect(authService.login).toHaveBeenCalled();
    });

});