import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './testUtils';
import academicianService from '../shared/api/academicianService.js';
import KayitOnaylari from '../pages/AkademisyenPaneli/KayitOnaylari';



// confirm mock'luyoruz (toplu onay/ret onay kutuları için)
const mockConfirm = vi.fn().mockReturnValue(true);
vi.stubGlobal('confirm', mockConfirm);

const mockPendingRequests = [
    {
        id: 1,
        ogrenci_ad: 'Caner Özdemir',
        ogrenci_no: '202210101',
        onay_durumu: 'beklemede',
        ders_kodu: 'MAT101',
        ders_ad: 'Matematik I',
        kredi: 5,
        ortalama: '2.85'
    },
    {
        id: 2,
        ogrenci_ad: 'Zeynep Solmaz',
        ogrenci_no: '202310102',
        onay_durumu: 'beklemede',
        ders_kodu: 'FİZ101',
        ders_ad: 'Fizik I',
        kredi: 4,
        ortalama: '3.42'
    }
];

const mockApprovedRequests = [
    {
        id: 3,
        ogrenci_ad: 'Ali Demir',
        ogrenci_no: '202110103',
        onay_durumu: 'onaylandi',
        ders_kodu: 'MAT101',
        ders_ad: 'Matematik I',
        kredi: 5,
        ortalama: '3.10'
    }
];

const mockRejectedRequests = [
    {
        id: 4,
        ogrenci_ad: 'Fatma Şahin',
        ogrenci_no: '202210104',
        onay_durumu: 'reddedildi',
        ders_kodu: 'BİL101',
        ders_ad: 'Bilgisayar Programlama',
        kredi: 6,
        ortalama: '1.95'
    }
];

describe('Akademisyen Kayıt Onayları Sayfası Test Senaryoları', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockConfirm.mockClear();

        // getKayitIstekleri metodunu dinamik parametrelere göre mock'luyoruz
        academicianService.getKayitIstekleri.mockImplementation(async (page, status) => {
            if (status === 'beklemede') {
                return {
                    count: mockPendingRequests.length,
                    items: mockPendingRequests
                };
            }
            if (status === 'onaylandi') {
                return {
                    count: mockApprovedRequests.length,
                    items: mockApprovedRequests
                };
            }
            if (status === 'reddedildi') {
                return {
                    count: mockRejectedRequests.length,
                    items: mockRejectedRequests
                };
            }
            return { count: 0, items: [] };
        });
    });

    test('Bileşen başarıyla yükleniyor, sekmeler ve sayaçlar doğru görüntüleniyor', async () => {
        renderWithProviders(<KayitOnaylari />);

        // Sayfa yüklendiğinde ve loading bittiğinde bekleyen isteklerin yüklenmesini bekleyelim
        await waitFor(() => {
            expect(screen.getByText('Caner Özdemir')).toBeInTheDocument();
        });

        // İstatistik kartlarının doğru sayıları gösterip göstermediği kontrol edilir
        expect(screen.getByText('academician.approvals.total')).toBeInTheDocument();

        // Toplam = 2 beklemede + 1 onaylanan + 1 reddedilen = 4
        expect(screen.getAllByText('4')[0]).toBeInTheDocument(); // Toplam kart değeri
        expect(screen.getAllByText('2')[0]).toBeInTheDocument(); // Bekleyen kart değeri
        expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // Onaylanan kart değeri

        // Varsayılan olarak bekleyen istekler listelenmeli
        expect(screen.getByText('202210101')).toBeInTheDocument();
        expect(screen.getByText('Zeynep Solmaz')).toBeInTheDocument();
    });

    test('Arama filtresi girilen kritere göre öğrencileri başarıyla filtreliyor', async () => {
        const user = userEvent.setup();
        renderWithProviders(<KayitOnaylari />);

        await waitFor(() => {
            expect(screen.getByText('Caner Özdemir')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Öğrenci veya ders ara...');
        
        // Zeynep araması yapalım
        await user.type(searchInput, 'Zeynep');

        expect(screen.getByText('Zeynep Solmaz')).toBeInTheDocument();
        expect(screen.queryByText('Caner Özdemir')).not.toBeInTheDocument();
    });

    test('Tekil onaylama ve tekil reddetme butonları başarıyla çalışıyor', async () => {
        const user = userEvent.setup();
        academicianService.onaylaKayit.mockResolvedValue({ success: true });
        academicianService.reddetKayit.mockResolvedValue({ success: true });

        renderWithProviders(<KayitOnaylari />);

        await waitFor(() => {
            expect(screen.getByText('Caner Özdemir')).toBeInTheDocument();
        });

        // Caner Özdemir'in kartındaki "Onayla" butonunu bulalım
        const canerName = screen.getByText('Caner Özdemir');
        const canerCard = canerName.closest('.approval-card');
        
        const approveButton = within(canerCard).getByRole('button', { name: /onayla/i });
        await user.click(approveButton);

        // API'ye doğru parametrenin gittiğini doğrulayalım
        expect(academicianService.onaylaKayit).toHaveBeenCalledWith(1);

        // Zeynep Solmaz'ın kartındaki "Reddet" butonuna tıklayalım
        const zeynepName = screen.getByText('Zeynep Solmaz');
        const zeynepCard = zeynepName.closest('.approval-card');
        
        const rejectButton = within(zeynepCard).getByRole('button', { name: /reddet/i });
        await user.click(rejectButton);

        expect(academicianService.reddetKayit).toHaveBeenCalledWith(2);
    });

    test('Sekmeler arası geçiş yapıldığında ilgili listenin içeriği yükleniyor', async () => {
        const user = userEvent.setup();
        renderWithProviders(<KayitOnaylari />);

        await waitFor(() => {
            expect(screen.getByText('Caner Özdemir')).toBeInTheDocument();
        });

        // Onaylananlar sekme kartına tıklayalım
        const approvedTab = screen.getByText('academician.approvals.approved').closest('.summary-card');
        await user.click(approvedTab);

        // Onaylanan listedeki Ali Demir görünmeli, bekleyenler görünmemeli
        await waitFor(() => {
            expect(screen.getByText('Ali Demir')).toBeInTheDocument();
        });
        expect(screen.queryByText('Caner Özdemir')).not.toBeInTheDocument();

        // Reddedilenler sekme kartına tıklayalım
        const rejectedTab = screen.getByText('academician.approvals.rejected').closest('.summary-card');
        await user.click(rejectedTab);

        // Reddedilen listedeki Fatma Şahin görünmeli
        await waitFor(() => {
            expect(screen.getByText('Fatma Şahin')).toBeInTheDocument();
        });
        expect(screen.queryByText('Ali Demir')).not.toBeInTheDocument();
    });

    test('Onaylanmış sekmelerde toplu reddetme (Bulk Reject) akışı başarıyla çalışıyor', async () => {
        const user = userEvent.setup();
        academicianService.reddetKayit.mockResolvedValue({ success: true });

        renderWithProviders(<KayitOnaylari />);

        // Önce sayfanın yüklenmesini ve yükleme durumunun bitmesini bekleyelim
        await waitFor(() => {
            expect(screen.getByText('Caner Özdemir')).toBeInTheDocument();
        });

        // Onaylananlar sekmesini açalım
        const approvedTab = screen.getByText('academician.approvals.approved').closest('.summary-card');
        await user.click(approvedTab);

        await waitFor(() => {
            expect(screen.getByText('Ali Demir')).toBeInTheDocument();
        });

        // "Tümünü Seç" butonuna tıklayalım
        const selectAllButton = screen.getByRole('button', { name: /tümünü seç/i });
        await user.click(selectAllButton);

        // "Seçilenleri Reddet" butonu görünmeli ve tıklayalım
        const bulkRejectButton = screen.getByRole('button', { name: /rejectSelected/i });
        await user.click(bulkRejectButton);

        // confirm onayından sonra api çağrısını doğrula
        expect(mockConfirm).toHaveBeenCalled();
        expect(academicianService.reddetKayit).toHaveBeenCalledWith(3);
    });

    test('Reddedilmiş sekmelerde toplu onaylama (Bulk Approve) akışı başarıyla çalışıyor', async () => {
        const user = userEvent.setup();
        academicianService.onaylaKayit.mockResolvedValue({ success: true });

        renderWithProviders(<KayitOnaylari />);

        // Önce sayfanın yüklenmesini ve yükleme durumunun bitmesini bekleyelim
        await waitFor(() => {
            expect(screen.getByText('Caner Özdemir')).toBeInTheDocument();
        });

        // Reddedilenler sekmesini açalım
        const rejectedTab = screen.getByText('academician.approvals.rejected').closest('.summary-card');
        await user.click(rejectedTab);

        await waitFor(() => {
            expect(screen.getByText('Fatma Şahin')).toBeInTheDocument();
        });

        // "Tümünü Seç" butonuna tıklayalım
        const selectAllButton = screen.getByRole('button', { name: /tümünü seç/i });
        await user.click(selectAllButton);

        // "Seçilenleri Onayla" butonu görünmeli ve tıklayalım
        const bulkApproveButton = screen.getByRole('button', { name: /approveSelected/i });
        await user.click(bulkApproveButton);

        // confirm onayından sonra api çağrısını doğrula
        expect(mockConfirm).toHaveBeenCalled();
        expect(academicianService.onaylaKayit).toHaveBeenCalledWith(4);
    });
});