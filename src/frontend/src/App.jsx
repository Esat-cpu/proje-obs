// Diğer dosyalardaki gerekli export bileşenlerini getir
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import OgrenciPaneli from './pages/OgrenciPaneli';
import AkademisyenPaneli from './pages/AkademisyenPaneli';
import LoginHomePage from './pages/LoginHomePage';
import TopBar from './components/ui/TopBar';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

//! Geçici olarak burada tanımlanan sayfa bileşenleri sonradan App.jsx'ten pages'e taşınacaklar
const OgrenciGiris = () => {
  const { t } = useTranslation();
  return <div className="panel-container">{t('login.studentPage', 'Öğrenci Giriş Sayfası')}</div>;
};
const AkademisyenGiris = () => {
  const { t } = useTranslation();
  return <div className="panel-container">{t('login.academicianPage', 'Akademisyen Giriş Sayfası')}</div>;
};
const NotFound = () => {
  const { t } = useTranslation();
  return <div className="panel-container">{t('app.notFound', '404 - Sayfa Bulunamadı')}</div>;
};

/* main.jsx motoru çalıştırıp direksiyonu App bileşenine teslim eder. App.jsx ise ekranda neyin, ne zaman gösterileceğini yöneten bileşendir. */
function App() { 
  const { t } = useTranslation();
  const location = useLocation();

  // Sol üst köşedeki logonun/butonun nerede nasıl görüneceğini belirleyen mantık
  const renderNavBrand = () => {
    if (location.pathname === '/') {
      // 1. Durum: Ana logindeysek (/) sadece düz yazı göster (tıklanamaz)
      return (
        <div className="nav-brand">
          <Home size={22} color="var(--primary-blue)" />
          <span>{t('nav.home', 'Anasayfa')}</span>
        </div>
      );
    } else if (location.pathname.startsWith('/login/')) {
      // 2. Durum: Kartlara basılıp girilen giriş sayfalarındaysak, geri dönülebilmesi için buton yap (Link)
      return (
        <Link to="/" className="nav-brand">
          <Home size={22} color="var(--primary-blue)" />
          <span>{t('nav.home', 'Anasayfa')}</span>
        </Link>
      );
    }
    // 3. Durum: Panelde veya başka bir sayfadaysak hiçbir şey gösterme
    return null;
  };

  return (
    <div className="page-container">
      {/* Global Navbar - Artık Hangi Sayfaya Gidersen Git Hep Tepede Kalacak! */}
      <TopBar 
        leftContent={renderNavBrand()}
      />

      <Routes>
      <Route path="/" element={<LoginHomePage />} />{/* Ana Login Sayfası */}

      {/* Ogrencilerin ve Akademisyenlerin Login Sayfaları */}
      <Route path="/login/student" element={<OgrenciGiris />} /> 
      <Route path="/login/academician" element={<AkademisyenGiris />} />
      
      {/* Logini geçince girilen Paneller */}
      <Route path="/student/*" element={<OgrenciPaneli />} />
      <Route path="/academician/*" element={<AkademisyenPaneli />} />
      
      {/* Hiçbir route eşleşmezse NotFound bileşeni çalışır */}
      <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
