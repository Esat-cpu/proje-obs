import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// İkonlar: Dashboard (Genel Bakış), Book (Derslerim), UserCheck (Kayıt Onayları)
import { LayoutDashboard, Book, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import academicianService from '../../shared/api/academicianService.js';
// Alt Bileşenlerin İçe Aktarılması
import PanelLayout from '../../components/ui/PanelLayout';
import GenelBakis from './GenelBakis';
import VerdigimDersler from './VerdigimDersler';
import KayitOnaylari from './KayitOnaylari';

const AkademisyenPaneli = () => {
  const { t } = useTranslation();
  // Mockup'taki kullanıcı ismi (Normalde auth context'ten gelir)
  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ['academicianProfile'],
    queryFn: academicianService.getProfil,
  });

  // Yükleniyorsa "...", yüklendiyse gelen isim, hata varsa "İsim Bulunamadı"
  const displayUserName = isProfileLoading
    ? "..."
    : (profileData?.user 
        ? `${profileData.unvan_goster} ${profileData.user.ad} ${profileData.user.soyad}` 
        : t('academician.nameNotFound', 'İsim Bulunamadı'));

  // Bekleyen kayıt taleplerini getir (sadece sayı ve ilk sayfa)
  const { data: requestsData, isError: isRequestsError } = useQuery({
    queryKey: ['academicianPendingRequestsCount'],
    queryFn: () => academicianService.getKayitIstekleri(1, 'beklemede'),
  });

  const hasError = isProfileError || isRequestsError;

  // Bekleyen talep sayısını hesapla
  const pendingRequestCount = requestsData?.count || 0;

  const navItems = [
    {
      path: "/academician",
      label: t('academician.nav.overview', 'Genel Bakış'),
      icon: LayoutDashboard,
      end: true
    },
    {
      path: "/academician/courses",
      label: t('academician.nav.courses', 'Not Girişi'),
      icon: Book
    },
    {
      path: "/academician/approvals",
      label: t('academician.nav.approvals', 'Kayıt Onayları'),
      icon: UserCheck,
      badge: pendingRequestCount // Bekleyen talep sayısına göre dinamik badge
    },
  ];

  return (
    <PanelLayout
      title={t('academician.panelTitle', 'Akademisyen Paneli')}
      userName={displayUserName}
      navItems={navItems}
      logoColor="#10b981"
    >
      {hasError && (
        <div style={{
          padding: '16px',
          marginBottom: '20px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          borderRadius: '10px'
        }}>
          {t('common.error', 'Veriler çekilirken hata oluştu.')}
        </div>
      )}
      <Routes>
        {/* 1. Dashboard Ekranı: İstatistikler ve Ders Özetleri */}
        <Route path="/" element={<GenelBakis />} />

        {/* 2. Derslerim Ekranı: Liste görünümü ve Not Giriş tablosu */}
        <Route path="/courses" element={<VerdigimDersler />} />

        {/* 3. Kayıt Onayları Ekranı: Öğrenci taleplerini onaylama/reddetme */}
        <Route path="/approvals" element={<KayitOnaylari />} />
      </Routes>
    </PanelLayout>
  );
};

export default AkademisyenPaneli;