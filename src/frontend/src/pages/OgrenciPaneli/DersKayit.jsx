import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, Clock, Plus, Trash2, Info } from 'lucide-react';

const DersKayit = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Mock Açılan Dersler Verisi (Ünvanlar ayrıldı ve key olarak eklendi)
  const availableCourses = [
    { kodu: 'CS301', kredi: 6, sinif: 'grade_2', kontenjan: '45/50', unvan: 'prof', hoca: 'Ahmet Yılmaz' },
    { kodu: 'CS303', kredi: 5, sinif: 'grade_2', kontenjan: '38/40', unvan: 'asst', hoca: 'Mehmet Demir' },
    { kodu: 'CS302', kredi: 6, sinif: 'grade_2', kontenjan: '25/50', unvan: 'doc', hoca: 'Ayşe Kaya' },
    { kodu: 'CS304', kredi: 5, sinif: 'grade_2', kontenjan: '15/30', unvan: 'asst', hoca: 'Fatma Şahin' }
  ];

  const totalCredits = selectedCourses.reduce((sum, course) => sum + course.kredi, 0);

  const handleAddCourse = (course) => {
    if (!selectedCourses.find(c => c.kodu === course.kodu)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleRemoveCourse = (courseCode) => {
    setSelectedCourses(selectedCourses.filter(c => c.kodu !== courseCode));
  };

  return (
    <div className="dashboard-container">
      {/* 1. Mavi Bilgilendirme Bannerı */}
      <div className="banner banner-blue">
        <div className="banner-content">
          <h2>{t('studentDashboard.registration.title')}</h2>
          <p>{t('studentDashboard.registration.subtitle')}</p>
          <div className="banner-details" style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> {t('studentDashboard.registration.deadline')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} /> {t('studentDashboard.registration.maxCredit')}
            </span>
          </div>
        </div>
      </div>

      <div className="registration-grid">
        {/* 2. Sol Taraf: Açılan Dersler Listesi */}
        <div className="reg-left">
          <div className="reg-header">
            <h3>{t('studentDashboard.registration.available')}</h3>
            <span className="badge-gray">4 {t('studentDashboard.registration.left')}</span>
          </div>

          {/* Arama Kutusu */}
          <div className="search-box">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder={t('studentDashboard.registration.search')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="reg-courses-list">
            {availableCourses.map((course) => (
              <div key={course.kodu} className="reg-course-card">
                <div className="reg-course-info">
                  <div className="tags" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span className="course-code">{course.kodu}</span>
                    <span className="quota-tag warning" style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      {course.kontenjan} {t('studentDashboard.registration.quota')}
                    </span>
                  </div>
                  {/* Ders adı data bloğundan dinamik olarak çekiliyor */}
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-main)' }}>
                    {t(`data.courses.${course.kodu}`)}
                  </h4>
                  {/* Öğretim Üyesi ünvanı data.titles'dan çekiliyor */}
                  <p className="teacher" style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {t(`data.titles.${course.unvan}`)} {course.hoca}
                  </p>
                  <p className="details" style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    {t('studentDashboard.courses.credit')}: {course.kredi} | 
                    {t('studentDashboard.courses.classLevel')}: {t(`data.classes.${course.sinif}`)}
                  </p>
                </div>
                <button 
                  className="btn-add"
                  disabled={selectedCourses.find(c => c.kodu === course.kodu)}
                  onClick={() => handleAddCourse(course)}
                  style={{ opacity: selectedCourses.find(c => c.kodu === course.kodu) ? 0.5 : 1, cursor: selectedCourses.find(c => c.kodu === course.kodu) ? 'not-allowed' : 'pointer' }}
                >
                  <Plus size={18} /> {t('studentDashboard.registration.add')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Sağ Taraf: Seçilen Dersler Özeti */}
        <div className="reg-right">
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-main)' }}>{t('studentDashboard.registration.selected')}</h3>
          
          <div className="credit-summary" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('studentDashboard.registration.totalCredit')}</span>
            <span className="font-bold" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{totalCredits} / 30</span>
          </div>

          {selectedCourses.length === 0 ? (
            <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', margin: '40px 0' }}>
              <BookOpen size={40} opacity={0.5} />
              <p>{t('studentDashboard.registration.empty')}</p>
            </div>
          ) : (
            <div className="selected-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedCourses.map(course => (
                <div key={course.kodu} className="selected-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{course.kodu} - {t(`data.courses.${course.kodu}`)}</span>
                  <button className="btn-remove" onClick={() => handleRemoveCourse(course.kodu)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="btn-add" style={{ width: '100%', marginTop: '24px', padding: '12px', display: 'flex', justifyContent: 'center' }}>
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DersKayit;