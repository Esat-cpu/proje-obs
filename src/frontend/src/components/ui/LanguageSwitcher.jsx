import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div style={styles.langContainer}>
      <Globe size={16} color="#3b6fd4" />
      <select 
        id="language-select"
        name="language"
        value={i18n.language}
        onChange={handleLanguageChange}
        aria-label={t('nav.languageSelect', 'Dil Seçimi')}
        style={styles.langSelect}
      >
        <option value="tr">Türkçe</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};

const styles = {
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
};

export default LanguageSwitcher;
