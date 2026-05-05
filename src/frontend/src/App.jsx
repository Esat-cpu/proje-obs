import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import OgrenciPaneli from './pages/OgrenciPaneli';
import AkademisyenPaneli from './pages/AkademisyenPaneli';
import LoginHomePage from './pages/LoginHomePage';
import TopBar from './components/ui/TopBar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/ui/PublicRoute';
import OgrenciGiris from './pages/OgrenciGiris';
import AkademisyenGiris from './pages/AkademisyenGiris';

const NotFound = () => {
  const { t } = useTranslation();
  return <div className="page-container">{t('404', 'Sayfa Bulunamadı')}</div>;
};

const Forbidden = () => {
  const { t } = useTranslation();
  return <div className="page-container">{t('403','Erişim Reddedildi')}</div>;
};

function App() {
  const { t } = useTranslation();
  const location = useLocation();

  const renderNavBrand = () => {
    if (location.pathname === '/') {
      return (
        <div className="nav-brand">
          <Home size={20} color="var(--primary-blue)" />
          <span>{t('Anasayfa')}</span>
        </div>
      );
    } else if (location.pathname.startsWith('/login/')) {
      return (
        <Link to="/" className="nav-brand">
          <Home size={20} color="var(--primary-blue)" />
          <span>{t('Anasayfa')}</span>
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <TopBar leftContent={renderNavBrand()} />
      <Routes>
        {/* PUBLIC ROTALAR: Giriş yapmış kullanıcılar buralara giremez, panele atılır */}
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

        {/* PROTECTED ROTALAR: Giriş yapmamış kullanıcılar buralara giremez, logine atılır */}
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
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;