import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, BookOpen, UserPlus, FileText } from 'lucide-react';
import PanelLayout from '../../components/ui/PanelLayout';

// Alt sayfaların import edilmesi
import GenelBakis from './GenelBakis';
import Derslerim from './Derslerim';
import DersKayit from './DersKayit';
import Transkript from './Transkript';

const OgrenciPaneli = () => {
  const { t } = useTranslation();
  const mockUserName = "Ahmet Öztürk"; 

  // Sol/Üst Menü navigasyon ayarları
  const navItems = [
    { path: "/student", label: t('studentDashboard.tabs.overview', 'Genel Bakış'), icon: LayoutDashboard, end: true },
    { path: "/student/courses", label: t('studentDashboard.tabs.myCourses', 'Derslerim'), icon: BookOpen },
    { path: "/student/registration", label: t('studentDashboard.tabs.courseRegistration', 'Ders Kayıt'), icon: UserPlus },
    { path: "/student/transcript", label: t('studentDashboard.tabs.transcript', 'Transkript'), icon: FileText },
  ];

  return (
    <PanelLayout
      title={t('studentDashboard.panelTitle', 'Öğrenci Paneli')}
      userName={mockUserName}
      navItems={navItems}
    >
      {/* URL'ye göre ilgili alt bileşeni (sayfayı) render eder */}
      <Routes>
        <Route path="/" element={<GenelBakis />} />
        <Route path="/courses" element={<Derslerim />} />
        <Route path="/registration" element={<DersKayit />} />
        <Route path="/transcript" element={<Transkript />} />
      </Routes>
    </PanelLayout>
  );
};

export default OgrenciPaneli;