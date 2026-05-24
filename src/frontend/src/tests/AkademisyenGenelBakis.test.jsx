import { screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './testUtils';
import academicianService from '../shared/api/academicianService.js';
import GenelBakis from '../pages/AkademisyenPaneli/GenelBakis';



const mockCoursesData = {
    count: 2,
    items: [
        {
            id: 1,
            ders: {
                ders_kodu: 'MAT101',
                ad: 'Matematik I',
                min_sinif: 1,
                kredi: 5
            },
            kontenjan: 60,
            ogrenci_sayisi: 45
        },
        {
            id: 2,
            ders: {
                ders_kodu: 'FİZ101',
                ad: 'Fizik I',
                min_sinif: 2,
                kredi: 4
            },
            kontenjan: 50,
            ogrenci_sayisi: 30
        }
    ]
};

const mockPendingRequests = {
    count: 5
};

const mockApprovedRequests = {
    count: 12
};

describe('Akademisyen Genel Bakış Sayfası Test Senaryoları', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        academicianService.getDersler.mockResolvedValue(mockCoursesData);
        academicianService.getKayitIstekleri.mockImplementation(async (page, status) => {
            if (status === 'beklemede') return mockPendingRequests;
            if (status === 'onaylandi') return mockApprovedRequests;
            return { count: 0 };
        });
    });

    test('Veriler yüklenirken loading ekranı görüntüleniyor', () => {
        // Asla çözülmeyen promise dönerek yükleme durumunu simüle edelim
        academicianService.getDersler.mockReturnValue(new Promise(() => { }));

        renderWithProviders(<GenelBakis />);
        expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
    });

    test('Herhangi bir API hatası durumunda hata ekranı listeleniyor', async () => {
        academicianService.getDersler.mockRejectedValue(new Error('API Error'));

        renderWithProviders(<GenelBakis />);

        await waitFor(() => {
            expect(screen.getByText('Veriler çekilirken hata oluştu.')).toBeInTheDocument();
        });
    });

    test('Ders listesi ve kart detayları ekranda başarıyla listeleniyor', async () => {
        renderWithProviders(<GenelBakis />);

        await waitFor(() => {
            expect(screen.getByText('MAT101')).toBeInTheDocument();
        });

        // Matematik I ders kartı bilgileri
        expect(screen.getByText('Matematik I')).toBeInTheDocument();
        expect(screen.getByText('1. Sınıf')).toBeInTheDocument();
        expect(screen.getByText('5 Kredi')).toBeInTheDocument();
        expect(screen.getByText('45 Öğrenci / 60 Kontenjan')).toBeInTheDocument();

        // Fizik I ders kartı bilgileri
        expect(screen.getByText('FİZ101')).toBeInTheDocument();
        expect(screen.getByText('Fizik I')).toBeInTheDocument();
        expect(screen.getByText('2. Sınıf')).toBeInTheDocument();
        expect(screen.getByText('4 Kredi')).toBeInTheDocument();
        expect(screen.getByText('30 Öğrenci / 50 Kontenjan')).toBeInTheDocument();
    });

    test('Tüm dinamik istatistik sayaçları başarıyla hesaplanıp render ediliyor', async () => {
        renderWithProviders(<GenelBakis />);

        await waitFor(() => {
            expect(screen.getByText('MAT101')).toBeInTheDocument();
        });

        // 1. Aktif Ders Sayısı: mockCoursesData.count = 2
        expect(screen.getByText('2')).toBeInTheDocument();

        // 2. Toplam Öğrenci: 45 + 30 = 75
        expect(screen.getByText('75')).toBeInTheDocument();

        // 3. Giriş Bekleyen Notlar (Onaylanmış kayıt sayısı): mockApprovedRequests.count = 12
        expect(screen.getByText('12')).toBeInTheDocument();

        // 4. Bekleyen Kayıt Onayları: mockPendingRequests.count = 5
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('Ders listesi boş olduğunda özel boş ders uyarısı gösteriliyor', async () => {
        academicianService.getDersler.mockResolvedValue({ count: 0, items: [] });

        renderWithProviders(<GenelBakis />);

        await waitFor(() => {
            expect(screen.getByText('Henüz aktif bir dersiniz bulunmuyor.')).toBeInTheDocument();
        });
    });

});
