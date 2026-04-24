import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import trTranslation from './locales/tr.json';
import enTranslation from './locales/en.json';

const resources = {
  tr: {
    translation: trTranslation
  },
  en: {
    translation: enTranslation
  }
};

i18n
  .use(LanguageDetector) // Tarayıcı dilini otomatik algılar
  .use(initReactI18next) // i18next'i React'e bağlar
  .init({
    resources,
    supportedLngs: ['tr', 'en'], // Uygulamanın desteklediği diller
    load: 'languageOnly', // 'tr-TR' veya 'en-US' algılanırsa sadece 'tr' veya 'en' kullan
    fallbackLng: 'tr', // Desteklenmeyen bir dil gelirse varsayılan olarak Türkçe kullan
    detection: {
      order: ['localStorage', 'cookie'], // Sadece depolanan tercihlere bakılır. Yoksa mecburen 'tr' kullanılır.
      caches: ['localStorage', 'cookie'], // Kullanıcının seçtiği dili tarayıcıda saklar
    },
    interpolation: {
      escapeValue: false // React zaten XSS korumasına sahip olduğu için escape işlemini kapatıyoruz
    }
  });

export default i18n;