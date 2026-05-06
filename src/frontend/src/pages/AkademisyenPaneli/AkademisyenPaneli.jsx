import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// İkonlar: Dashboard (Genel Bakış), Book (Derslerim), UserCheck (Kayıt Onayları)
import { LayoutDashboard, Book, UserCheck } from 'lucide-react'; 

// Alt Bileşenlerin İçe Aktarılması
import PanelLayout from '../../components/ui/PanelLayout';
import GenelBakis from './GenelBakis';
import VerdigimDersler from './VerdigimDersler';
import KayitOnaylari from './KayitOnaylari';

const AkademisyenPaneli = () => {
  const { t } = useTranslation();
  
  // Mockup'taki kullanıcı ismi (Normalde auth context'ten gelir)
  const mockUserName = "Prof. Dr. Mehmet Öztürk"; 

  /**
   * Navigasyon Menüsü Yapılandırması
   * t() fonksiyonu ile dil dosyalarındaki (tr.json / en.json) karşılıkları alır.
   */
  const navItems = [
    { 
      path: "/academician", 
      label: t('academician.nav.overview', 'Genel Bakış'), 
      icon: LayoutDashboard, 
      end: true 
    },
    { 
      path: "/academician/courses", 
      label: t('academician.nav.courses', 'Derslerim'), 
      icon: Book 
    },
    { 
      path: "/academician/approvals", 
      label: t('academician.nav.approvals', 'Kayıt Onayları'), 
      icon: UserCheck,
      badge: 4 // Sağdaki kırmızı bildirim rozeti (4 bekleyen talep)
    },
  ];

  return (
    <PanelLayout
      title={t('academician.panelTitle', 'Akademisyen Paneli')}
      userName={mockUserName}
      navItems={navItems}
      logoColor="#10b981" // Akademisyen temasına özel yeşil kep ikonu
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