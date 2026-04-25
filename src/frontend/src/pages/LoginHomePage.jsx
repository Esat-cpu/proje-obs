import { useTranslation } from 'react-i18next'; 
import { User, Users, UserCog, Home, GraduationCap } from 'lucide-react'; /* ikonları getir */
import TopBar from '../components/ui/TopBar';
import ActionCard from '../components/ui/ActionCard';

const LoginHomePage = () => {
  const { t } = useTranslation(); /* useTranslation hook'u cagir nesne parcalamayla t'yi cekip al */
 
  const portalCards = [ /* 3'lü kart yapısı */
    {
      to: '/login/student',/* bu ilk karta basınca /login/student 'e yönlendir */
      icon: <User size={32} color="#3b6fd4" />,
      iconBg: '#dce8fb',
      /* en.jsona gidip portal basligina bak eger student anahtarı yoksa Öğrenci kalsın*/
      title: t('portal.student', 'Öğrenci'),
      description: t('portal.studentDesc', 'Ders seçimi, notlar ve Transkript'),
    },
    {
      to: '/login/academician',
      icon: <Users size={32} color="#2e9e6b" />,
      iconBg: '#d4f0e4',
      title: t('portal.academician', 'Akademisyen'),
      description: t('portal.academicianDesc', 'Ders yönetimi ve not girişi'),
    },
    {
      to: 'http://localhost:8000/admin/',
      isExternal: true,/* bu kart harici bir linke gidiyor */
      icon: <UserCog size={32} color="#7c5cbf" />,
      iconBg: '#ece6f8',
      title: t('portal.admin', 'Yönetici'),
      description: t('portal.adminDesc', 'Sistem ve kullanıcı yönetimi'),
    },
  ];
 
  return (
    <div className="page-container">
      
      {/* Global Navbar Bileşeni */}
      <TopBar 
        leftContent={
          <div style={styles.navBrand}>
            <Home size={22} color="#3b6fd4" />
            <span style={styles.navBrandText}>{t('nav.home', 'Anasayfa')}</span>
          </div>
        }
        /* rightContent boş geçildiği için TopBar otomatik olarak LanguageSwitcher'ı gösterecektir */
      />
 
      {/* Main content */}
      <main style={styles.main}>
        {/* Title */}
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>{t('app.title', 'OBS - Öğrenci Bilgi Sistemi')}</h1>
          <div className="title-underline" />
        </div>
 
        {/* UniversiteLogo Kartı */}
        <div style={styles.logoCard}>
          <div style={styles.logoIconWrapper}>
            <GraduationCap size={64} color="#3b6fd4" />
          </div>
          <p style={styles.logoLabel}>{t('app.universityLogo', 'Üniversite Logosu')}</p>
        </div>
 
        {/* Panel Giris Kartları */}
        <div style={styles.cardsRow}>
          {portalCards.map((card) => (
            <ActionCard 
              key={card.to}
              to={card.to}
              isExternal={card.isExternal}
              icon={card.icon}
              iconBg={card.iconBg}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
 
const styles = {
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: '#222',
    fontWeight: '600',
    fontSize: '15px',
  },
  navBrandText: {
    color: '#222',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '36px',
    paddingBottom: '48px',
    gap: '32px',
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  logoCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px 48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 2px 12px rgba(59,111,212,0.07)',
    width: '220px',
  },
  logoIconWrapper: {
    width: '100px',
    height: '100px',
    backgroundColor: '#dce8fb',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLabel: {
    margin: 0,
    fontSize: '13px',
    color: '#666',
    fontWeight: '500',
  },
  cardsRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
};
 
export default LoginHomePage;