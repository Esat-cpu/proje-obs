import { Routes, Route } from 'react-router-dom';
import OgrenciPaneli from './pages/OgrenciPaneli';
import AkademisyenPaneli from './pages/AkademisyenPaneli';
import LoginHomePage from './pages/LoginHomePage';

// Geçici (Boş/Mock) Sayfa Bileşenleri
// Daha sonra bu bileşenleri daha önce oluşturduğunuz "pages/" klasörüne taşıyıp oradan import edebilirsiniz.
const OgrenciGiris = () => <div>Öğrenci Giriş Sayfası</div>;
const AkademisyenGiris = () => <div>Akademisyen Giriş Sayfası</div>;
const NotFound = () => <div>404 - Sayfa Bulunamadı</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginHomePage />} />
      <Route path="/login/student" element={<OgrenciGiris />} />
      <Route path="/login/academician" element={<AkademisyenGiris />} />
      <Route path="/student/*" element={<OgrenciPaneli />} />
      <Route path="/academician/*" element={<AkademisyenPaneli />} />
      {/* Hiçbir route eşleşmezse NotFound bileşeni çalışır */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
