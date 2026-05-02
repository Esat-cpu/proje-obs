import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import OgrenciPaneli from './pages/OgrenciPaneli';
import AkademisyenPaneli from './pages/AkademisyenPaneli';
import LoginHomePage from './pages/LoginHomePage';
import TopBar from './components/ui/TopBar';
import ProtectedRoute from './components/ProtectedRoute';

const NotFound = () => {
  const { t } = useTranslation();
  return <div className="page-container">{t('404')}</div>;
};

const Forbidden = () => {
  const { t } = useTranslation();
  return <div className="page-container">{t('403')}</div>;
};

function App() {
  const { t } = useTranslation();
  const location = useLocation();

  const renderNavBrand = () => {
    if (location.pathname === '/') {
      return (
        <div className="nav-brand">
          <Home size={20} color="var(--primary-blue)" />
          <span>{t('anasayfa')}</span>
        </div>
      );
    } else if (location.pathname.startsWith('/login/')) {
      return (
        <Link to="/" className="nav-brand">
          <Home size={20} color="var(--primary-blue)" />
          <span>{t('anasayfa')}</span>
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <TopBar leftContent={renderNavBrand()} />
      <Routes>
        <Route path="/" element={<LoginHomePage />} />
        <Route path="/login/student" element={<LoginHomePage />} />
        <Route path="/login/academician" element={<LoginHomePage />} />
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={["Ogrenci"]}>
            <OgrenciPaneli />
          </ProtectedRoute>
        } />
        <Route path="/academician" element={
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