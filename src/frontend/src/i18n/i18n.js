/* import bölümü */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// kullanıcının tarayıcı ayarlarından, sayfa dilini otomatik olarak algılamaya yarayan bir i18next eklentisi
import LanguageDetector from 'i18next-browser-languagedetector';

// türkçe ve ingilizce çeviri dosyalarını trTranslation ve enTranslation değişkenleri aracılığıyla içeri aktar
import trTranslation from './locales/tr.json';
import enTranslation from './locales/en.json';

const resources = { /* çeviri kaynaklarını tanımlayan nesne */
  tr: { 
    translation: trTranslation
  }, //tr ve en nesne anahtarı, translation standart i18n nesne anahtarı
  en: { 
    translation: enTranslation}
};

/* i18n nesnesini yapılandır */
i18n
  //.use ile eklentileri dahil et(LanguageDetector eklentisini ve i18next'in uyumluluğunu sağlayan eklentiyi)
  .use(LanguageDetector) 
  .use(initReactI18next)
  
  //.init ile çalıştır ve ilk değerleri ata
  .init({
    resources,
    supportedLngs: ['tr', 'en'],//bu iki dil dışındakileri dikkate alma
    load: 'languageOnly',//! tarayıcı dili bölge kodlu gelse bile (örn: tr-TR, en-US) sadece ana dil kodunu (tr, en) dikkate al
    fallbackLng: 'tr',//varsayılan dil ve yedek dil türkçedir
    detection: {
      order: ['localStorage', 'cookie'],//! sistem dil tercihini ilk olarak tarayıcı yerel deposunda sonra çerezlerinde ara
      caches: ['localStorage', 'cookie'],//kullanıcı dil değiştirirse bunu iki yere de kaydet
    },
    interpolation: {
      escapeValue: false //* react zaten xss korumalıdır bu yüzden i18n'in korumasını çakışma olmasın diye devre dışı bırak
    }
  })
;

export default i18n;// yapılandırılan i18n nesnesi dış dosyaya aktarılabilir