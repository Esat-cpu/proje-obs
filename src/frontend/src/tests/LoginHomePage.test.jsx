import { screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import React from 'react';
import { renderWithProviders } from './testUtils';
import LoginHomePage from '../pages/LoginHomePage';

describe('Giriş Portalı Ana Sayfası Test Senaryoları', () => {

    test('Uygulama başlığı, logosu ve tüm portal kartları ekranda başarıyla listeleniyor', () => {
        renderWithProviders(<LoginHomePage />);

        // Başlık kontrolü
        expect(screen.getByRole('heading', { name: /OBS - Öğrenci Bilgi Sistemi/i })).toBeInTheDocument();

        // Üniversite logosu kartı
        expect(screen.getByText('Üniversite Logosu')).toBeInTheDocument();

        // Kart başlıkları kontrolü
        expect(screen.getByRole('heading', { name: /öğrenci$/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /akademisyen$/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /yönetici$/i })).toBeInTheDocument();

        // Açıklama metinleri
        expect(screen.getByText('Ders seçimi, notlar ve Transkript')).toBeInTheDocument();
        expect(screen.getByText('Ders yönetimi ve not girişi')).toBeInTheDocument();
        expect(screen.getByText('Sistem ve kullanıcı yönetimi')).toBeInTheDocument();
    });

    test('Öğrenci portal kartı doğru sayfaya yönlendiriyor', () => {
        renderWithProviders(<LoginHomePage />);

        const studentLink = screen.getByRole('link', { name: /öğrenci/i });
        expect(studentLink).toBeInTheDocument();
        expect(studentLink.getAttribute('href')).toBe('/login/student');
    });

    test('Akademisyen portal kartı doğru sayfaya yönlendiriyor', () => {
        renderWithProviders(<LoginHomePage />);

        const academicianLink = screen.getByRole('link', { name: /akademisyen/i });
        expect(academicianLink).toBeInTheDocument();
        expect(academicianLink.getAttribute('href')).toBe('/login/academician');
    });

    test('Yönetici portal kartı harici admin arayüzüne yönlendiriyor', () => {
        renderWithProviders(<LoginHomePage />);

        const adminLink = screen.getByRole('link', { name: /yönetici/i });
        expect(adminLink).toBeInTheDocument();
        expect(adminLink.getAttribute('href')).toContain('/admin/');
    });

});
