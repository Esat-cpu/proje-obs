import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import OgrenciPaneli from './pages/OgrenciPaneli/OgrenciPaneli';
import AkademisyenPaneli from './pages/AkademisyenPaneli/AkademisyenPaneli';import LoginHomePage from './pages/LoginHomePage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/ui/PublicRoute';
import OgrenciGiris from './pages/OgrenciGiris';
import AkademisyenGiris from './pages/AkademisyenGiris';
import TopBar from './components/ui/TopBar'; // TopBar'ı geri getirdik

const NotFound = () => {
  const { t } = useTranslation();
  return <div className="page-container" style={{ padding: '24px' }}>{t('404', 'Sayfa Bulunamadı')}</div>;
};

const Forbidden = () => {
  const { t } = useTranslation();
  return <div className="page-container" style={{ padding: '24px' }}>{t('403', 'Erişim Reddedildi')}</div>;
};

function App() {
  const { t } = useTranslation();
  const location = useLocation();

  // Kullanıcının bir panelde olup olmadığını kontrol ediyoruz
  const isPanelRoute = location.pathname.startsWith('/student') || location.pathname.startsWith('/academician');

  // Ana sayfa ve login ekranları için sol üst logo/link kısmı
  const renderNavBrand = () => {
    if (location.pathname === '/') {
      return (
        <div className="nav-brand">
          <Home size={20} color="var(--primary-blue)" />
          <span>{t('anasayfa', 'Anasayfa')}</span>
        </div>
      );
    } else if (location.pathname.startsWith('/login/')) {
      return (
        <Link to="/" className="nav-brand">
          <Home size={20} color="var(--primary-blue)" />
          <span>{t('anasayfa', 'Anasayfa')}</span>
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      
      {/* Sadece panel olmayan sayfalarda (Giriş & Ana Sayfa) Global TopBar'ı göster */}
      {!isPanelRoute && <TopBar leftContent={renderNavBrand()} />}
      
      <Routes>
        {/* PUBLIC ROTALAR */}
        <Route path="/" element={
          <PublicRoute>
            <LoginHomePage />
          </PublicRoute>
        } />
        <Route path="/login/student" element={
          <PublicRoute>
            <OgrenciGiris />
          </PublicRoute>
        } />
        <Route path="/login/academician" element={
          <PublicRoute>
            <AkademisyenGiris />
          </PublicRoute>
        } />

        {/* PROTECTED ROTALAR */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={["Ogrenci"]}>
            <OgrenciPaneli />
          </ProtectedRoute>
        } />
        <Route path="/academician/*" element={
          <ProtectedRoute allowedRoles={["Akademisyen"]}>
            <AkademisyenPaneli />
          </ProtectedRoute>
        } />

        {/* HATA ROTALARI */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;