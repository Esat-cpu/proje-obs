import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, Clock, Plus, Trash2, Info } from 'lucide-react';
import studentService from '../../shared/api/studentService';

const DersKayit = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donemBilgisi, setDonemBilgisi] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Tüm mevcut dersleri al
        const mevcutDersler = await studentService.getMevcutDersler();
        
        // Öğrencinin kayıtlı olduğu dersleri al
        const kayitliDersler = await studentService.getDersler();
        
        // Kayıtlı ders ID'lerini bir Set'e koy (hızlı arama için)
        const kayitliDersIds = new Set(
          kayitliDersler.map(kayit => kayit.donem_dersi_id || kayit.id)
        );
        
        // Öğrencinin henüz kayıt olmadığı dersleri filtrele
        const filtrelenmisDersler = mevcutDersler.filter(
          ders => !kayitliDersIds.has(ders.id)
        );
        
        setAvailableCourses(filtrelenmisDersler);
        
        // Aktif dönem bilgisini al
        try {
          const donemData = await studentService.getAktifDonem();
          setDonemBilgisi(donemData);
        } catch (donemErr) {
          console.warn('Aktif dönem bilgisi alınamadı:', donemErr);
          setDonemBilgisi(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('Mevcut dersler yüklenirken hata:', err);
        setError(err.response?.data?.detail || 'Dersler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dönem ismini formatla
  const formatTermName = () => {
    if (!donemBilgisi) return t('studentDashboard.registration.subtitle');
    
    const donemMap = {
      'GUZ': 'Güz',
      'BAHAR': 'Bahar',
      'guz': 'Güz',
      'bahar': 'Bahar'
    };
    
    const donemAdi = donemMap[donemBilgisi.donem] || donemBilgisi.donem;
    return `${donemBilgisi.yil} ${donemAdi} Dönemi - Ders Kayıt Dönemi`;
  };

  // Son tarihi formatla
  const formatDeadline = () => {
    if (!donemBilgisi?.bitis) return t('studentDashboard.registration.deadline');
    
    const date = new Date(donemBilgisi.bitis);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return `Son Tarih: ${date.toLocaleDateString('tr-TR', options)}`;
  };

  // Maksimum kredi
  const maxKredi = donemBilgisi?.max_kredi || 30;

  const totalCredits = selectedCourses.reduce((sum, course) => sum + course.kredi, 0);

  // Arama filtresi
  const filteredCourses = availableCourses.filter(course => {
    const searchLower = searchTerm.toLowerCase();
    return (
      course.ders?.ders_kodu?.toLowerCase().includes(searchLower) ||
      course.ders?.ad?.toLowerCase().includes(searchLower) ||
      course.akademisyen_ad?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddCourse = (course) => {
    if (!selectedCourses.find(c => c.kodu === course.kodu)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleRemoveCourse = (courseCode) => {
    setSelectedCourses(selectedCourses.filter(c => c.kodu !== courseCode));
  };

  const handleSave = async () => {
    if (selectedCourses.length === 0) {
      alert('Lütfen en az bir ders seçin.');
      return;
    }

    try {
      const dersIdListesi = selectedCourses.map(course => course.id);
      await studentService.dersKaydet(dersIdListesi);
      alert('Ders kayıt işlemi başarıyla tamamlandı!');
      setSelectedCourses([]);
      
      // Verileri yeniden yükle
      const mevcutDersler = await studentService.getMevcutDersler();
      const kayitliDersler = await studentService.getDersler();
      const kayitliDersIds = new Set(
        kayitliDersler.map(kayit => kayit.donem_dersi_id || kayit.id)
      );
      const filtrelenmisDersler = mevcutDersler.filter(
        ders => !kayitliDersIds.has(ders.id)
      );
      setAvailableCourses(filtrelenmisDersler);
    } catch (err) {
      console.error('Ders kayıt hatası:', err);
      alert(err.response?.data?.detail || 'Ders kaydı yapılamadı. Lütfen tekrar deneyin.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="card-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p>{t('common.loading') || 'Yükleniyor...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="card-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#dc2626' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* 1. Mavi Bilgilendirme Bannerı */}
      <div className="banner banner-blue">
        <div className="banner-content">
          <h2>{t('studentDashboard.registration.title')}</h2>
          <p>{formatTermName()}</p>
          <div className="banner-details" style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> {formatDeadline()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} /> Maksimum Kredi: {maxKredi}
            </span>
          </div>
        </div>
      </div>

      <div className="registration-grid">
        {/* 2. Sol Taraf: Açılan Dersler Listesi */}
        <div className="reg-left">
          <div className="reg-header">
            <h3>{t('studentDashboard.registration.available')}</h3>
            <span className="badge-gray">{filteredCourses.length} {t('studentDashboard.registration.left')}</span>
          </div>

          {/* Arama Kutusu (Sticky) */}
          <div className="search-box sticky-search">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder={t('studentDashboard.registration.search')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="reg-courses-list">
            {filteredCourses.map((course) => (
              <div key={course.id} className="reg-course-card">
                <div className="reg-course-info">
                  <div className="tags" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span className="course-code">{course.ders?.ders_kodu}</span>
                    <span className="quota-tag warning" style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      {course.ogrenci_sayisi}/{course.kontenjan} {t('studentDashboard.registration.quota')}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-main)' }}>
                    {course.ders?.ad || t(`data.courses.${course.ders?.ders_kodu}`) || course.ders?.ders_kodu}
                  </h4>
                  <p className="teacher" style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {course.akademisyen_ad || '-'}
                  </p>
                  <p className="details" style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    {t('studentDashboard.courses.credit')}: {course.ders?.kredi} |
                    {t('studentDashboard.courses.classLevel')}: {course.ders?.min_sinif}. Sınıf
                  </p>
                </div>
                {selectedCourses.find(c => c.id === course.id) ? (
                  <button
                    className="btn-remove-mobile"
                    onClick={() => handleRemoveCourse(course.id)}
                    style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Trash2 size={18} /> {t('common.remove')}
                  </button>
                ) : (
                  <button
                    className="btn-add"
                    disabled={course.ogrenci_sayisi >= course.kontenjan}
                    onClick={() => handleAddCourse(course)}
                    style={{
                      opacity: course.ogrenci_sayisi >= course.kontenjan ? 0.5 : 1,
                      cursor: course.ogrenci_sayisi >= course.kontenjan ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Plus size={18} /> {t('studentDashboard.registration.add')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Sağ Taraf: Seçilen Dersler Özeti (Masaüstü: Sağda, Mobil: Altta) */}
        <div className="reg-right">
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-main)' }}>{t('studentDashboard.registration.selected')}</h3>
          
          <div className="credit-summary" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('studentDashboard.registration.totalCredit')}</span>
            <span className="font-bold" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{totalCredits} / {maxKredi}</span>
          </div>

          {selectedCourses.length === 0 ? (
            <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', margin: '40px 0' }}>
              <BookOpen size={40} opacity={0.5} />
              <p>{t('studentDashboard.registration.empty')}</p>
            </div>
          ) : (
            <div className="selected-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedCourses.map(course => (
                <div key={course.id} className="selected-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    {course.ders?.ders_kodu} - {course.ders?.ad || t(`data.courses.${course.ders?.ders_kodu}`) || course.ders?.ders_kodu}
                  </span>
                  <button className="btn-remove" onClick={() => handleRemoveCourse(course.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-add"
            onClick={handleSave}
            disabled={selectedCourses.length === 0}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'center',
              opacity: selectedCourses.length === 0 ? 0.5 : 1,
              cursor: selectedCourses.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {t('common.save')}
          </button>
        </div>
      </div>

      {/* Mobil Yapışkan Sepet (Sticky Bottom Bar) */}
      <div className="mobile-sticky-basket">
        <div className="basket-info">
          <span className="basket-label">{t('studentDashboard.registration.totalCredit')}:</span>
          <span className="basket-value">{totalCredits} / {maxKredi}</span>
        </div>
        <button
          className="btn-save-mobile"
          onClick={handleSave}
          disabled={selectedCourses.length === 0}
          style={{
            opacity: selectedCourses.length === 0 ? 0.5 : 1,
            cursor: selectedCourses.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  );
};

export default DersKayit;