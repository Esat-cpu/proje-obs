import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './testUtils';
import academicianService from '../shared/api/academicianService.js';
import VerdigimDersler from '../pages/AkademisyenPaneli/VerdigimDersler';



// alert mock'lama
const mockAlert = vi.fn();
vi.stubGlobal('alert', mockAlert);

const mockCoursesData = {
    count: 2,
    items: [
        {
            id: 501,
            ders: {
                ders_kodu: 'MAT101',
                ad: 'Matematik I',
                kredi: 5,
                min_sinif: 1
            }
        },
        {
            id: 502,
            ders: {
                ders_kodu: 'FİZ101',
                ad: 'Fizik I',
                kredi: 4,
                min_sinif: 1
            }
        }
    ]
};

const mockStudentsData = {
    count: 2,
    items: [
        {
            id: 901,
            ogrenci_no: '202210101',
            ogrenci_ad: 'Caner Özdemir',
            vize_notu: 75,
            final_notu: 85
        },
        {
            id: 902,
            ogrenci_no: '202310102',
            ogrenci_ad: 'Zeynep Solmaz',
            vize_notu: null,
            final_notu: null
        }
    ]
};

describe('Akademisyen Verdiğim Dersler ve Not Giriş Test Senaryoları', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAlert.mockClear();

        academicianService.getDersler.mockResolvedValue(mockCoursesData);
        academicianService.getDersOgrencileri.mockResolvedValue(mockStudentsData);
        academicianService.notGir.mockResolvedValue({ success: true });
    });

    test('Verilen dersler tablosu ve mobil ders kartları başarıyla listeleniyor', async () => {
        renderWithProviders(<VerdigimDersler />);

        await waitFor(() => {
            expect(screen.getAllByText('MAT101')[0]).toBeInTheDocument();
        });

        // Ders listesinin yüklenmesi
        expect(screen.getAllByText('MAT101')[0]).toBeInTheDocument();
        expect(screen.getAllByText('FİZ101')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Matematik I')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Fizik I')[0]).toBeInTheDocument();
    });

    test('Ders tıklandığında ilgili dersin öğrencilerinin listelendiği not giriş tablosu yükleniyor', async () => {
        const user = userEvent.setup();
        renderWithProviders(<VerdigimDersler />);

        await waitFor(() => {
            expect(screen.getAllByText('MAT101')[0]).toBeInTheDocument();
        });

        // "Öğrenci Listesi / Not Gir" butonuna tıklayalım (İlk ders için)
        const actionButtons = screen.getAllByRole('button', { name: /öğrenci listesi \/ not gir/i });
        await user.click(actionButtons[0]);

        // Öğrenci listesinin yüklenmesini bekleyelim
        await waitFor(() => {
            expect(screen.getByText('Caner Özdemir')).toBeInTheDocument();
        });

        // Sayfa başlığının seçilen ders olması
        expect(screen.getByRole('heading', { name: /MAT101 - Matematik I/i })).toBeInTheDocument();
        expect(screen.getByText('202210101')).toBeInTheDocument(); // Caner no
        expect(screen.getByText('Zeynep Solmaz')).toBeInTheDocument(); // Zeynep ad
    });

    test('Not girildiğinde ortalama ve harf notu önizlemesi anlık ve otomatik güncelleniyor', async () => {
        const user = userEvent.setup();
        renderWithProviders(<VerdigimDersler />);

        await waitFor(() => {
            expect(screen.getAllByText('MAT101')[0]).toBeInTheDocument();
        });

        const actionButtons = screen.getAllByRole('button', { name: /öğrenci listesi \/ not gir/i });
        await user.click(actionButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Caner Özdemir')).toBeInTheDocument();
        });

        // Caner Özdemir'in notları: vize 75, final 85. Ortalama = 75*0.4 + 85*0.6 = 30 + 51 = 81. Harf notu BB
        expect(screen.getByText('81.00')).toBeInTheDocument();
        expect(screen.getByText('BB')).toBeInTheDocument();

        // Zeynep Solmaz'ın notları null. Not kutuları boş olmalı.
        // Zeynep'in vize ve final inputlarını bulalım
        const zeynepRow = screen.getByText('Zeynep Solmaz').closest('tr');
        const inputs = within(zeynepRow).getAllByRole('spinbutton'); // number inputlar
        const vizeInput = inputs[0];
        const finalInput = inputs[1];

        expect(vizeInput.value).toBe('');
        expect(finalInput.value).toBe('');

        // Zeynep'e vize 100, final 90 girelim. Ortalama = 100*0.4 + 90*0.6 = 40 + 54 = 94. Harf notu AA olmalı
        await user.type(vizeInput, '100');
        await user.type(finalInput, '90');

        // Ortalama ve harf notunun anlık olarak güncellendiğini doğrulayalım
        await waitFor(() => {
            expect(within(zeynepRow).getByText('94.00')).toBeInTheDocument();
            expect(within(zeynepRow).getByText('AA')).toBeInTheDocument();
        });
    });

    test('Not sınır koruyucu güvenlik duvarı 100den büyük veya 0dan küçük not girişlerini sınırlandırıyor', async () => {
        const user = userEvent.setup();
        renderWithProviders(<VerdigimDersler />);

        await waitFor(() => {
            expect(screen.getAllByText('MAT101')[0]).toBeInTheDocument();
        });

        const actionButtons = screen.getAllByRole('button', { name: /öğrenci listesi \/ not gir/i });
        await user.click(actionButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Zeynep Solmaz')).toBeInTheDocument();
        });

        const zeynepRow = screen.getByText('Zeynep Solmaz').closest('tr');
        const inputs = within(zeynepRow).getAllByRole('spinbutton');
        const vizeInput = inputs[0];
        const finalInput = inputs[1];

        // 100'den büyük not (150) girmeyi deneyelim, 100'e sabitlenmeli
        await user.type(vizeInput, '150');
        expect(vizeInput.value).toBe('100');

        // 0'dan küçük not (-20) girmeyi deneyelim, 0'a sabitlenmeli
        await user.type(finalInput, '-20');
        expect(finalInput.value).toBe('0');
    });

    test('Notları Kaydet tıklandığında değişen notlar API servisine başarıyla aktarılıyor', async () => {
        const user = userEvent.setup();
        renderWithProviders(<VerdigimDersler />);

        await waitFor(() => {
            expect(screen.getAllByText('MAT101')[0]).toBeInTheDocument();
        });

        const actionButtons = screen.getAllByRole('button', { name: /öğrenci listesi \/ not gir/i });
        await user.click(actionButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Zeynep Solmaz')).toBeInTheDocument();
        });

        const zeynepRow = screen.getByText('Zeynep Solmaz').closest('tr');
        const inputs = within(zeynepRow).getAllByRole('spinbutton');
        const vizeInput = inputs[0];
        const finalInput = inputs[1];

        await user.type(vizeInput, '80');
        await user.type(finalInput, '70');

        // Notları kaydet butonuna basalılm
        const saveButton = screen.getByRole('button', { name: /notları kaydet/i });
        await user.click(saveButton);

        // API'nin çağrıldığını doğrulayalım (Zeynep ID'si: "902")
        expect(academicianService.notGir).toHaveBeenCalledWith('902', {
            vize_notu: 80,
            final_notu: 70
        });
    });
});
