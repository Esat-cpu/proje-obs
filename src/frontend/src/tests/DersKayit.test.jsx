import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './testUtils';
import studentService from '../shared/api/studentService';
import DersKayit from '../pages/OgrenciPaneli/DersKayit';



// window.alert mock'luyoruz (DersKayit sayfasında alert kullanılıyor)
const mockAlert = vi.fn();
vi.stubGlobal('alert', mockAlert);

const mockAvailableCourses = [
    {
        id: 101,
        akademisyen_ad: 'Prof. Dr. Ahmet Yılmaz',
        ogrenci_sayisi: 5,
        kontenjan: 40,
        ders: {
            ders_kodu: 'MAT101',
            ad: 'Matematik I',
            kredi: 5,
            min_sinif: 1
        }
    },
    {
        id: 102,
        akademisyen_ad: 'Doç. Dr. Ayşe Kaya',
        ogrenci_sayisi: 20,
        kontenjan: 30,
        ders: {
            ders_kodu: 'FİZ101',
            ad: 'Fizik I',
            kredi: 4,
            min_sinif: 1
        }
    },
    {
        id: 103,
        akademisyen_ad: 'Dr. Öğr. Üyesi Mehmet Can',
        ogrenci_sayisi: 10,
        kontenjan: 15,
        ders: {
            ders_kodu: 'BİL101',
            ad: 'Bilgisayar Programlama',
            kredi: 6,
            min_sinif: 2
        }
    }
];

const mockTermInfo = {
    yil: '2025-2026',
    donem: 'BAHAR',
    bitis: '2026-06-30T23:59:59Z',
    max_kredi: 30,
    aktif: true
};

describe('Öğrenci Ders Kayıt Sayfası Kullanıcı Akış Testleri', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAlert.mockClear();
    });

    test('Yükleme (Loading) durumu doğru şekilde görüntüleniyor', async () => {
        // API isteklerini yavaş yanıt verecek şekilde simüle ediyoruz
        studentService.getMevcutDersler.mockReturnValue(new Promise(() => {}));
        studentService.getDersler.mockResolvedValue([]);
        studentService.getAktifDonem.mockResolvedValue(mockTermInfo);

        renderWithProviders(<DersKayit />);

        expect(screen.getByText('common.loading')).toBeInTheDocument();
    });

    test('API hatası durumunda hata mesajı ekranda görüntüleniyor', async () => {
        studentService.getMevcutDersler.mockRejectedValue({
            response: { data: { detail: 'Ders yükleme hatası oluştu' } }
        });
        studentService.getDersler.mockResolvedValue([]);
        studentService.getAktifDonem.mockResolvedValue(mockTermInfo);

        renderWithProviders(<DersKayit />);

        await waitFor(() => {
            expect(screen.getByText('Ders yükleme hatası oluştu')).toBeInTheDocument();
        });
    });

    test('Dersler ve aktif dönem başarıyla yükleniyor ve listeleniyor', async () => {
        studentService.getMevcutDersler.mockResolvedValue(mockAvailableCourses);
        studentService.getDersler.mockResolvedValue([]);
        studentService.getAktifDonem.mockResolvedValue(mockTermInfo);

        renderWithProviders(<DersKayit />);

        // Aktif dönem ve son tarih başlığı kontrolü
        await waitFor(() => {
            expect(screen.getByText('studentDashboard.registration.title')).toBeInTheDocument();
        });

        // Mevcut derslerin render edildiğinin kontrolü
        expect(screen.getByText('Matematik I')).toBeInTheDocument();
        expect(screen.getByText('Prof. Dr. Ahmet Yılmaz')).toBeInTheDocument();
        expect(screen.getByText('Fizik I')).toBeInTheDocument();
    });

    test('Arama çubuğu ile ders filtreleme fonksiyonu başarıyla çalışıyor', async () => {
        const user = userEvent.setup();
        studentService.getMevcutDersler.mockResolvedValue(mockAvailableCourses);
        studentService.getDersler.mockResolvedValue([]);
        studentService.getAktifDonem.mockResolvedValue(mockTermInfo);

        renderWithProviders(<DersKayit />);

        await waitFor(() => {
            expect(screen.getByText('Matematik I')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('studentDashboard.registration.search');
        
        // Matematik dersini filtreleyelim
        await user.type(searchInput, 'MAT');

        expect(screen.getByText('Matematik I')).toBeInTheDocument();
        expect(screen.queryByText('Fizik I')).not.toBeInTheDocument();
        expect(screen.queryByText('Bilgisayar Programlama')).not.toBeInTheDocument();
    });

    test('Ders ekleme, sepet kredisinin artışı ve sepetten çıkarma akışları', async () => {
        const user = userEvent.setup();
        studentService.getMevcutDersler.mockResolvedValue(mockAvailableCourses);
        studentService.getDersler.mockResolvedValue([]);
        studentService.getAktifDonem.mockResolvedValue(mockTermInfo);

        renderWithProviders(<DersKayit />);

        await waitFor(() => {
            expect(screen.getByText('Matematik I')).toBeInTheDocument();
        });

        // Başlangıçta sepet boş olmalı ve kredi 0 olmalı
        expect(screen.getAllByText('0 / 30')[0]).toBeInTheDocument();
        expect(screen.getByText('studentDashboard.registration.empty')).toBeInTheDocument();

        // 1. Dersi Ekle
        const addButtons = screen.getAllByRole('button', { name: /studentDashboard\.registration\.add/i });
        await user.click(addButtons[0]); // Matematik I (5 Kredi)

        // Kredi güncellenmeli ve sepet boş durumundan çıkmalı
        expect(screen.getAllByText('5 / 30')[0]).toBeInTheDocument();
        expect(screen.queryByText('studentDashboard.registration.empty')).not.toBeInTheDocument();

        // 2. Dersi Ekle
        const addButtonsUpdated = screen.getAllByRole('button', { name: /studentDashboard\.registration\.add/i });
        await user.click(addButtonsUpdated[0]); // Fizik I (4 Kredi) (Matematik seçildiği için ilk sıraya Fizik kayar)

        expect(screen.getAllByText('9 / 30')[0]).toBeInTheDocument();

        // Sepette Matematik dersinin listede olduğunu doğrulayalım
        const selectedSection = screen.getByText('studentDashboard.registration.selected').parentElement;
        expect(within(selectedSection).getByText(/MAT101 - Matematik I/)).toBeInTheDocument();

        // Sepetten Çıkarma Butonuna Tıklayalım
        const removeButtons = within(selectedSection).getAllByRole('button');
        await user.click(removeButtons[0]); // İlk eklenen Matematik sepetten silinsin

        // Kredi 4'e düşmeli (Fizik I kaldı)
        expect(screen.getAllByText('4 / 30')[0]).toBeInTheDocument();
    });

    test('Sepet başarıyla kaydedildiğinde API tetiklenir ve arayüz güncellenir', async () => {
        const user = userEvent.setup();
        studentService.getMevcutDersler.mockResolvedValue(mockAvailableCourses);
        studentService.getDersler.mockResolvedValue([]);
        studentService.getAktifDonem.mockResolvedValue(mockTermInfo);
        
        // Başarılı kayıt API dönüşü
        studentService.dersKaydet.mockResolvedValue({
            basarili: [{ donem_dersi_id: 101 }],
            hatalar: []
        });

        renderWithProviders(<DersKayit />);

        await waitFor(() => {
            expect(screen.getByText('Matematik I')).toBeInTheDocument();
        });

        // Matematik dersini sepete ekleyelim
        const addButtons = screen.getAllByRole('button', { name: /studentDashboard\.registration\.add/i });
        await user.click(addButtons[0]);

        // "Kaydet" butonuna tıklayalım
        const saveButtons = screen.getAllByRole('button', { name: /common\.save/i });
        await user.click(saveButtons[0]); // Masaüstü kaydet butonu

        // API'nin çağrıldığını doğrulayalım
        expect(studentService.dersKaydet).toHaveBeenCalledWith([101]);

        // Başarılı mesajını arayüzde görelim
        await waitFor(() => {
            expect(screen.getByText('Kayıt işlemleri başarıyla tamamlandı!')).toBeInTheDocument();
        });
    });

    test('Ders kaydı sırasında bazı derslerde hata oluşursa hata mesajı listelenir', async () => {
        const user = userEvent.setup();
        studentService.getMevcutDersler.mockResolvedValue(mockAvailableCourses);
        studentService.getDersler.mockResolvedValue([]);
        studentService.getAktifDonem.mockResolvedValue(mockTermInfo);
        
        // Hatalı kayıt API dönüşü
        studentService.dersKaydet.mockResolvedValue({
            basarili: [],
            hatalar: [{ donem_dersi_id: 102, hata: 'Ders kontenjanı doludur.' }]
        });

        renderWithProviders(<DersKayit />);

        await waitFor(() => {
            expect(screen.getByText('Fizik I')).toBeInTheDocument();
        });

        // Kontenjanı dolu olan Fizik dersini ekleyelim (ikinci ders, index 1)
        const addButtons = screen.getAllByRole('button', { name: /studentDashboard\.registration\.add/i });
        await user.click(addButtons[1]);

        // Kaydet diyelim
        const saveButtons = screen.getAllByRole('button', { name: /common\.save/i });
        await user.click(saveButtons[0]);

        // Hata panelinin görüntülendiğini ve hata mesajını içerdiğini doğrulayalım
        await waitFor(() => {
            expect(screen.getByText('Bazı derslerin kayıt işlemi gerçekleştirilemedi:')).toBeInTheDocument();
            expect(screen.getByText(/FİZ101 - Fizik I:/)).toBeInTheDocument();
            expect(screen.getByText('Ders kontenjanı doludur.')).toBeInTheDocument();
        });
    });

    test('Kayıt dönemi aktif değilse ekleme, çıkarma ve kaydetme butonları engellenir', async () => {
        studentService.getMevcutDersler.mockResolvedValue(mockAvailableCourses);
        studentService.getDersler.mockResolvedValue([]);
        // Aktif dönemi pasif olarak dönüyoruz
        studentService.getAktifDonem.mockResolvedValue({
            ...mockTermInfo,
            aktif: false
        });

        renderWithProviders(<DersKayit />);

        await waitFor(() => {
            expect(screen.getByText('Ders Kayıt Dönemi Aktif Değildir')).toBeInTheDocument();
        });

        // "Ekle" butonlarının engelli (disabled) olduğunu kontrol edelim
        const addButtons = screen.getAllByRole('button', { name: /studentDashboard\.registration\.add/i });
        addButtons.forEach(button => {
            expect(button).toBeDisabled();
        });

        // "Kaydet" butonunun engelli (disabled) olduğunu kontrol edelim
        const saveButtons = screen.getAllByRole('button', { name: /common\.save/i });
        saveButtons.forEach(button => {
            expect(button).toBeDisabled();
        });
    });
});