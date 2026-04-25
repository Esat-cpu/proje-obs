import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="lang-switcher">
      <Globe size={16} color="var(--primary-blue)" />
      <select 
        id="language-select"
        name="language"
        value={i18n.language}
        onChange={handleLanguageChange}
        aria-label={t('nav.languageSelect', 'Dil Seçimi')}
        className="lang-select"
      >
        <option value="tr" className="lang-option">Türkçe</option>
        <option value="en" className="lang-option">English</option>
      </select>
    </div>
  );
};
export default LanguageSwitcher;
