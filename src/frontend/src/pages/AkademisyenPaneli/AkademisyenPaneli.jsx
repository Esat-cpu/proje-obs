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
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['academicianProfile'],
    queryFn: academicianService.getProfil,
  });

  // Yükleniyorsa "...", yüklendiyse gelen isim, hata varsa "İsim Bulunamadı"
  const displayUserName = isProfileLoading
    ? "..."
    : (profileData?.user 
        ? `${profileData.unvan_goster} ${profileData.user.ad} ${profileData.user.soyad}` 
        : "İsim Bulunamadı");

  // Bekleyen kayıt taleplerini getir
  const { data: requestsData } = useQuery({
    queryKey: ['academicianRequests'],
    queryFn: academicianService.getKayitIstekleri,
  });

  // Bekleyen talep sayısını hesapla
  const pendingRequestCount = requestsData?.filter(r => r.onay_durumu === 'beklemede').length;

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