import { useTranslation } from 'react-i18next';

const OgrenciPaneli = () => {
  const { t } = useTranslation();

  return (
    <div className="panel-container">
      <h1>{t('studentPanel.title', 'Öğrenci Paneli')}</h1>
      <p>{t('studentPanel.desc', 'Burada öğrenciye ait dersler, notlar ve devamsızlık gibi bilgiler yer alacak.')}</p>
    </div>
  );
};

export default OgrenciPaneli;