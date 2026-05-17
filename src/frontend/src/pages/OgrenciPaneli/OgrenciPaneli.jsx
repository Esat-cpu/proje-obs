import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, UserPlus, FileText } from 'lucide-react';
import PanelLayout from '../../components/ui/PanelLayout';
import { useQuery } from '@tanstack/react-query';
import studentService from '../../shared/api/studentService';

// Alt sayfaların import edilmesi
import GenelBakis from './GenelBakis';
import DersKayit from './DersKayit';
import Transkript from './Transkript';

const OgrenciPaneli = () => {
  const { t } = useTranslation();

  // Backend'den öğrenci profil bilgilerini çek
  const { data: profileData } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: studentService.getProfil,
  });

  // Kullanıcı adını backend'den al
  const userName = profileData?.user ? `${profileData.user.ad} ${profileData.user.soyad}` : '';

  // Sol/Üst Menü navigasyon ayarları
  const navItems = [
    { path: "/student", label: t('studentDashboard.tabs.overview', 'Genel Bakış'), icon: LayoutDashboard, end: true },
    { path: "/student/registration", label: t('studentDashboard.tabs.courseRegistration', 'Ders Kayıt'), icon: UserPlus },
    { path: "/student/transcript", label: t('studentDashboard.tabs.transcript', 'Transkript'), icon: FileText },
  ];

  return (
    <PanelLayout
      title={t('studentDashboard.panelTitle', 'Öğrenci Paneli')}
      userName={userName}
      navItems={navItems}
    >
      {/* URL'ye göre ilgili alt bileşeni (sayfayı) render eder */}
      <Routes>
        <Route path="/" element={<GenelBakis />} />
        <Route path="/registration" element={<DersKayit />} />
        <Route path="/transcript" element={<Transkript />} />
      </Routes>
    </PanelLayout>
  );
};

export default OgrenciPaneli;