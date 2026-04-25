import { useTranslation } from 'react-i18next';

const AkademisyenPaneli = () => {
  const { t } = useTranslation();

  return (
    <div className="panel-container">
      <h1>{t('academicianPanel.title', 'Akademisyen Paneli')}</h1>
      <p>{t('academicianPanel.desc', 'Burada akademisyene ait verdiği dersler, not girişi ve öğrenci listeleri yer alacak.')}</p>
    </div>
  );
};

export default AkademisyenPaneli;