import { Routes, Route } from 'react-router-dom';
import OgrenciPaneli from './pages/OgrenciPaneli';
import EgitmenPaneli from './pages/EgitmenPaneli';

// Geçici (Boş/Mock) Sayfa Bileşenleri
// Daha sonra bu bileşenleri daha önce oluşturduğunuz "pages/" klasörüne taşıyıp oradan import edebilirsiniz.
const AnaSayfa = () => <div>Ana Sayfa</div>;
const OgrenciGiris = () => <div>Öğrenci Giriş Sayfası</div>;
const EgitmenGiris = () => <div>Akademisyen Giriş Sayfası</div>;
const NotFound = () => <div>404 - Sayfa Bulunamadı</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<AnaSayfa />} />
      <Route path="/login/student" element={<OgrenciGiris />} />
      <Route path="/login/academician" element={<EgitmenGiris />} />
      <Route path="/ogrenci/*" element={<OgrenciPaneli />} />
      <Route path="/academician/*" element={<EgitmenPaneli />} />
      {/* Hiçbir route eşleşmezse NotFound bileşeni çalışır */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
