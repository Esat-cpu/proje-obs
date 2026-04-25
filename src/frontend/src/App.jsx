// Diğer dosyalardaki gerekli export bileşenlerini getir
import { Routes, Route } from 'react-router-dom';
import OgrenciPaneli from './pages/OgrenciPaneli';
import AkademisyenPaneli from './pages/AkademisyenPaneli';
import LoginHomePage from './pages/LoginHomePage';

//! Geçici olarak burada tanımlanan sayfa bileşenleri sonradan App.jsx'ten pages'e taşınacaklar
const OgrenciGiris = () => <div>Öğrenci Giriş Sayfası</div>;
const AkademisyenGiris = () => <div>Akademisyen Giriş Sayfası</div>;
const NotFound = () => <div>404 - Sayfa Bulunamadı</div>;

/* main.jsx motoru çalıştırıp direksiyonu App bileşenine teslim eder. App.jsx ise ekranda neyin, ne zaman gösterileceğini yöneten bileşendir. */
function App() { 
  return (
    /* pathlerin yönlendirmelerini gerçekleştir */
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
  );
}

export default App;
