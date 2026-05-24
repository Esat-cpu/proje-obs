import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './testUtils';
import studentService from '../shared/api/studentService';
import Transkript from '../pages/OgrenciPaneli/Transkript';



// URL mock'lama (Blob URL işlemleri için)
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-pdf-url');
const mockRevokeObjectURL = vi.fn();
vi.stubGlobal('URL', {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL
});

const mockTranskriptData = {
    ogrenci_ad: 'Muhammed Barbir',
    ogrenci_no: '202612345',
    bolum: 'Bilgisayar Mühendisliği',
    gpa: '3.28',
    kayitlar: [
        {
            yil: '2025-2026',
            donem: 'GUZ',
            dersler: [
                {
                    ders_kodu: 'MAT101',
                    ders_ad: 'Matematik I',
                    kredi: 5,
                    harf_notu: 'AA',
                    ortalama: '92.00'
                },
                {
                    ders_kodu: 'FİZ101',
                    ders_ad: 'Fizik I',
                    kredi: 4,
                    harf_notu: 'BA',
                    ortalama: '86.00'
                }
            ]
        },
        {
            yil: '2025-2026',
            donem: 'BAHAR',
            dersler: [
                {
                    ders_kodu: 'BİL101',
                    ders_ad: 'Bilgisayar Programlama',
                    kredi: 6,
                    harf_notu: 'CB',
                    ortalama: '74.00'
                }
            ]
        }
    ]
};

describe('Öğrenci Transkript Sayfası Test Senaryoları', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCreateObjectURL.mockClear();
        mockRevokeObjectURL.mockClear();
    });

    test('Yükleme (Loading) durumu doğru şekilde görüntüleniyor', async () => {
        studentService.getTranskript.mockReturnValue(new Promise(() => { }));

        renderWithProviders(<Transkript />);

        expect(screen.getByText('common.loading')).toBeInTheDocument();
    });

    test('API hatası durumunda hata mesajı ekranda listeleniyor', async () => {
        studentService.getTranskript.mockRejectedValue({
            response: { data: { detail: 'Transkript verisi yüklenemedi.' } }
        });

        renderWithProviders(<Transkript />);

        await waitFor(() => {
            expect(screen.getByText('Transkript verisi yüklenemedi.')).toBeInTheDocument();
        });
    });

    test('Öğrenci transkript özet bilgileri ve kart sayaçları doğru render ediliyor', async () => {
        studentService.getTranskript.mockResolvedValue(mockTranskriptData);

        renderWithProviders(<Transkript />);

        await waitFor(() => {
            expect(screen.getByText('Muhammed Barbir - 202612345')).toBeInTheDocument();
        });

        // Bölüm bilgisi
        expect(screen.getByText('Bilgisayar Mühendisliği')).toBeInTheDocument();

        // GNO kartı (3.28)
        expect(screen.getByText('3.28')).toBeInTheDocument();

        // Toplam kredi (MAT101: 5 + FİZ101: 4 + BİL101: 6 = 15 Kredi)
        expect(screen.getByText('15')).toBeInTheDocument();

        // Dönem sayısı kartı (Güz ve Bahar olmak üzere 2)
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('Dönem başlıkları, ders listesi ve harf notları DataTable içinde listeleniyor', async () => {
        studentService.getTranskript.mockResolvedValue(mockTranskriptData);

        renderWithProviders(<Transkript />);

        await waitFor(() => {
            expect(screen.getByText('Muhammed Barbir - 202612345')).toBeInTheDocument();
        });

        // 1. Dönem Başlığı
        expect(screen.getByText('2025-2026 Güz Dönemi')).toBeInTheDocument();
        expect(screen.getByText('2 studentDashboard.transcript.listed')).toBeInTheDocument();

        // 2. Dönem Başlığı
        expect(screen.getByText('2025-2026 Bahar Dönemi')).toBeInTheDocument();
        expect(screen.getByText('1 studentDashboard.transcript.listed')).toBeInTheDocument();

        // Dönem GNO hesaplamaları
        // Güz GPA = (4.0 * 5 + 3.5 * 4) / 9 = (20 + 14) / 9 = 34 / 9 = 3.78
        expect(screen.getByText('3.78')).toBeInTheDocument();
        // Bahar GPA = (2.5 * 6) / 6 = 2.50
        expect(screen.getByText('2.50')).toBeInTheDocument();

        // Ders detayları
        expect(screen.getByText('MAT101')).toBeInTheDocument();
        expect(screen.getByText('Matematik I')).toBeInTheDocument();
        expect(screen.getByText('AA')).toBeInTheDocument();
        expect(screen.getByText('92.00')).toBeInTheDocument();

        expect(screen.getByText('BİL101')).toBeInTheDocument();
        expect(screen.getByText('Bilgisayar Programlama')).toBeInTheDocument();
        expect(screen.getByText('CB')).toBeInTheDocument();
        expect(screen.getByText('74.00')).toBeInTheDocument();
    });

    test('PDF İndir butonuna basıldığında API çağrısı yapılır ve tarayıcı indirmesi tetiklenir', async () => {
        const user = userEvent.setup();
        studentService.getTranskript.mockResolvedValue(mockTranskriptData);

        const mockPdfBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
        studentService.indirTranskriptPDF.mockResolvedValue({
            data: mockPdfBlob,
            headers: { 'content-disposition': 'attachment; filename="transkript.pdf"' }
        });

        renderWithProviders(<Transkript />);

        await waitFor(() => {
            expect(screen.getByText('Muhammed Barbir - 202612345')).toBeInTheDocument();
        });

        const downloadButton = screen.getByRole('button', { name: /studentDashboard\.transcript\.download/i });
        await user.click(downloadButton);

        // API'nin çağrıldığını doğrulayalım
        expect(studentService.indirTranskriptPDF).toHaveBeenCalled();

        // Blob URL'sinin oluşturulduğunu doğrulayalım
        expect(mockCreateObjectURL).toHaveBeenCalledWith(mockPdfBlob);
    });
});
