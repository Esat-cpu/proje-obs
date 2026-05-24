import { screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './testUtils';
import studentService from '../shared/api/studentService';
import GenelBakis from '../pages/OgrenciPaneli/GenelBakis';



const mockProfileData = {
    sinif: 2,
    gpa: '3.15'
};

const mockCoursesData = [
    {
        id: 1,
        ders_kodu: 'MAT101',
        ders_ad: 'Matematik I',
        akademisyen_ad: 'Doç. Dr. Ahmet Yılmaz',
        kredi: 5,
        vize_notu: 80,
        final_notu: 90,
        ortalama: 86.00,
        harf_notu: 'BA',
        onay_durumu: 'onaylandi',
        yil: 2026,
        donem: 'GUZ'
    },
    {
        id: 2,
        ders_kodu: 'FİZ101',
        ders_ad: 'Fizik I',
        akademisyen_ad: 'Prof. Dr. Mehmet Kaya',
        kredi: 4,
        vize_notu: 70,
        final_notu: 60,
        ortalama: 64.00,
        harf_notu: 'CC',
        onay_durumu: 'onaylandi',
        yil: 2026,
        donem: 'GUZ'
    },
    {
        id: 3,
        ders_kodu: 'KİM101',
        ders_ad: 'Kimya I',
        akademisyen_ad: 'Dr. Ayşe Yılmaz',
        kredi: 3,
        vize_notu: 40,
        final_notu: 50,
        ortalama: 46.00,
        harf_notu: 'FF',
        onay_durumu: 'beklemede', // Bekleyen dersler genel bakışta listelenmez!
        yil: 2026,
        donem: 'GUZ'
    }
];

describe('Öğrenci Genel Bakış Sayfası Test Senaryoları', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        studentService.getProfil.mockResolvedValue(mockProfileData);
        studentService.getDersler.mockResolvedValue(mockCoursesData);
    });

    test('Dersler yüklenirken loading göstergesi görüntüleniyor', async () => {
        // Yükleniyor durumunu simüle etmek için asla çözümlenmeyen bir promise dönüyoruz
        studentService.getDersler.mockReturnValue(new Promise(() => {}));

        renderWithProviders(<GenelBakis />);
        expect(screen.getByText('Notlar yükleniyor...')).toBeInTheDocument();
    });

    test('Öğrenci aktif dönem dersleri ve notları DataTable içinde başarıyla listeleniyor', async () => {
        renderWithProviders(<GenelBakis />);

        // Derslerin yüklendiğini bekleyelim
        await waitFor(() => {
            expect(screen.getByText('MAT101')).toBeInTheDocument();
        });

        // Sadece onaylanmış dersler listelenmeli
        expect(screen.getByText('FİZ101')).toBeInTheDocument();
        expect(screen.queryByText('KİM101')).toBeNull(); // beklemede olan listelenmemeli

        // Akademisyen isimleri
        expect(screen.getByText('Doç. Dr. Ahmet Yılmaz')).toBeInTheDocument();
        expect(screen.getByText('Prof. Dr. Mehmet Kaya')).toBeInTheDocument();

        // Notlar
        expect(screen.getByText('80')).toBeInTheDocument(); // MAT101 vize
        expect(screen.getByText('90')).toBeInTheDocument(); // MAT101 final
        expect(screen.getByText('BA')).toBeInTheDocument();

        expect(screen.getByText('70')).toBeInTheDocument(); // FİZ101 vize
        expect(screen.getByText('60')).toBeInTheDocument(); // FİZ101 final
        expect(screen.getByText('CC')).toBeInTheDocument();
    });

    test('Akademik yıl ve aktif dönem metni doğru şekilde hesaplanıyor', async () => {
        renderWithProviders(<GenelBakis />);

        await waitFor(() => {
            expect(screen.getByText('MAT101')).toBeInTheDocument();
        });

        // 2026 GUZ -> 2026-2027 Güz Dönemi olmalı
        expect(screen.getByText('2026-2027 Güz Dönemi')).toBeInTheDocument();
    });

    test('Profil istatistik kartları (Ders sayısı, Dönem GPA, Toplam Kredi ve Dönem) doğru şekilde hesaplanıyor', async () => {
        renderWithProviders(<GenelBakis />);

        await waitFor(() => {
            expect(screen.getByText('MAT101')).toBeInTheDocument();
        });

        // 1. Aktif Ders Sayısı (Onaylanmış 2 ders olmalı: MAT101 ve FİZ101)
        expect(screen.getByText('2')).toBeInTheDocument();

        // 2. Kredi Toplamı (5 + 4 = 9 olmalı)
        expect(screen.getByText('9')).toBeInTheDocument();

        // 3. Dönem Sayısı (Sınıf 2, GUZ dönemi -> (2-1)*2 + 1 = 3. Dönem olmalı)
        expect(screen.getByText('3')).toBeInTheDocument();

        // 4. Dönem GPA'i:
        // MAT101: 5 kredi, BA (3.5) -> 5 * 3.5 = 17.5 weighted
        // FİZ101: 4 kredi, CC (2.0) -> 4 * 2.0 = 8.0 weighted
        // Toplam weighted = 25.5
        // Toplam kredi = 9
        // Dönem Ortalama GPA = 25.5 / 9 = 2.8333... -> 2.83
        // GPA hem kartta hem de footer'da render ediliyor. Bu yüzden en az 1 tanesi 2.83 olmalı.
        expect(screen.getAllByText('2.83').length).toBeGreaterThanOrEqual(1);
    });

});
