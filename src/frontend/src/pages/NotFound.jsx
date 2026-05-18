import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ejderyaLogo from '../../assets/ejderya.jpg';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Kullanıcının hangi panelde olduğunu kontrol et
  const isStudentPanel = location.pathname.startsWith('/student');
  const isAcademicianPanel = location.pathname.startsWith('/academician');

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleBackToPanel = () => {
    if (user?.role === 'Ogrenci') {
      navigate('/student/overview');
    } else if (user?.role === 'Akademisyen') {
      navigate('/academician/overview');
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '48px 24px',
      textAlign: 'center'
    }}>
      {/* 404 İkonu */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: 'var(--error-light, #fee)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <AlertCircle size={64} color="var(--error-color, #dc3545)" />
      </div>

      {/* Başlık */}
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '16px'
      }}>
        {t('notFound.title', '404 - Sayfa Bulunamadı')}
      </h1>

      {/* Açıklama */}
      <p style={{
        fontSize: '1.1rem',
        color: 'var(--text-secondary)',
        marginBottom: '32px',
        maxWidth: '500px'
      }}>
        {t('notFound.message', 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.')}
      </p>

      {/* Butonlar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Ana Sayfaya Dön Butonu */}
        <button
          onClick={handleBackToHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: 'var(--primary-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-blue-dark, #0056b3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-blue)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Home size={20} />
          {t('notFound.backToHome', 'Ana Sayfaya Dön')}
        </button>

        {/* Panele Dön Butonu (sadece giriş yapmış kullanıcılar için) */}
        {user && (isStudentPanel || isAcademicianPanel) && (
          <button
            onClick={handleBackToPanel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: 'var(--primary-blue)',
              border: '2px solid var(--primary-blue)',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-blue)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--primary-blue)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <ArrowLeft size={20} />
            {t('notFound.backToPanel', 'Panele Dön')}
          </button>
        )}
      </div>
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
          <img 
            src={ejderyaLogo} 
            alt="Ejderya" 
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              objectFit: 'cover'
            }} 
          />
        </div>
    </div>
  );
};

export default NotFound;
