import { Link } from 'react-router-dom'; /* link ile pürüzsüz geçiş */
import { useTranslation } from 'react-i18next'; 
import { GraduationCap, User, Users, UserCog, Globe } from 'lucide-react'; /* ikonları getir */

const LoginHomePage = () => {
  const { t, i18n } = useTranslation(); /* useTranslation hook'u cagir nesne parcalamayla t ve i18n'i cekip al */
 
  const handleLanguageChange = (e) => { /*  dil secici kutusunda e için degisiklik oldugunda (onChange={handleLanguageChange}) tetiklenmek üzere oraya baglanmıstır. */
    i18n.changeLanguage(e.target.value); /* e(event)'nin degisikligini al i18.changeLanguage fonksiyonuna at */
  };
 
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
    <div style={styles.page}>
      
      {/* Navbar --> anasayfa yazısı & sembolü ve dil secicinin oldugu kisim */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <GraduationCap size={22} color="#3b6fd4" />
          <span style={styles.navBrandText}>{t('nav.home', 'Anasayfa')}</span>
        </div>
        {/* dil secici tasarimini jsx ile yapılandır */}
        <div style={styles.langContainer}>
          <Globe size={16} color="#3b6fd4" />
          <select 
            id="language-select"
            name="language"
            value={i18n.language} /* varsayılan dili ayarla */
            onChange={handleLanguageChange} /* tıklama ile degistirme fon. tetikler ve sayfa dili degisir*/
            aria-label={t('nav.languageSelect', 'Dil Seçimi')} /* screen reader icin */
            style={styles.langSelect}
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </div>
      </nav>
 
      {/* Main content */}
      <main style={styles.main}>
        {/* Title */}
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>{t('app.title', 'OBS - Öğrenci Bilgi Sistemi')}</h1>
          <div style={styles.titleUnderline} />
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
          {portalCards.map((card) => {/* portalCards dizisini (Ogrenci, Akademisyen ve Yönetici verilerini) alır ve kart olusum dongusune sokar. */
            const cardContent = (
              <div style={styles.card}>
                <div style={{ ...styles.cardIconWrapper, backgroundColor: card.iconBg }}>
                  {card.icon}
                </div>
                <h2 style={styles.cardTitle}>{card.title}</h2>
                <p style={styles.cardDesc}>{card.description}</p>
              </div>
            );

            return card.isExternal ? 
            ( /* isExternal true ise yani kart ile harici bir yönlendirmeye gidilecekse */
              <a key={card.to} href={card.to} style={styles.cardLink}>{/* gidilecek linki html ile sar */}
                {cardContent}
              </a>
            ) 
            : 
            ( /* isExternal false ise */
              <Link key={card.to} to={card.to} style={styles.cardLink}>
                {cardContent} {/* gidilecek router react ile sar bu sayede sayfa yenilenmeden hizlica diger arayuze gecis yap*/}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};
 
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#edf1fb',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 28px',
    backgroundColor: '#edf1fb',
  },
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
  langContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 16px',
    border: '1.5px solid #d0d7e8',
    borderRadius: '20px',
    backgroundColor: '#fff',
  },
  langSelect: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none',
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
  titleUnderline: {
    width: '48px',
    height: '3px',
    backgroundColor: '#3b6fd4',
    borderRadius: '2px',
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
  cardLink: {
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    width: '200px',
    boxShadow: '0 2px 12px rgba(59,111,212,0.07)',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    flex: 1,
  },
  cardIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  cardDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#888',
    textAlign: 'center',
    lineHeight: '1.5',
  },
};
 
export default LoginHomePage;