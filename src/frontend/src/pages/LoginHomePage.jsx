import { useTranslation } from 'react-i18next'; 
import { User, Users, UserCog, GraduationCap } from 'lucide-react'; /* ikonları getir */
import ActionCard from '../components/ui/ActionCard';


const LoginHomePage = () => {
  const { t } = useTranslation(); /* useTranslation hook'u cagir nesne parcalamayla t'yi cekip al */
 
  const portalCards = [ /* 3'lü kart yapısı */
    {
      to: '/login/student',/* bu ilk karta basınca /login/student 'e yönlendir */
      icon: <User size={32} color="var(--primary-blue)" />,
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
      to: import.meta.env.VITE_API_BASE_URL + '/admin/',
      isExternal: true,/* bu kart harici bir linke gidiyor */
      icon: <UserCog size={32} color="#7c5cbf" />,
      iconBg: '#ece6f8',
      title: t('portal.admin', 'Yönetici'),
      description: t('portal.adminDesc', 'Sistem ve kullanıcı yönetimi'),
    },
  ];
 
  return (
    <>
      {/* Main content */}
      <main className="login-home-main">
        {/* Title */}
        <div className="login-home-title-block">
          <h1 className="login-home-title">{t('app.title', 'OBS - Öğrenci Bilgi Sistemi')}</h1>
          <div className="title-underline" />
        </div>
 
        {/* UniversiteLogo Kartı */}
        <div className="university-logo-card">
          <div className="logo-icon-wrapper">
            <GraduationCap size={64} color="var(--primary-blue)" />
          </div>
          <p className="logo-label">{t('app.universityLogo', 'Üniversite Logosu')}</p>
        </div>
 
        {/* Panel Giris Kartları */}
        <div className="cards-row">
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
    </>
  );
};
 
export default LoginHomePage;