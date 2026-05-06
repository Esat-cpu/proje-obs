import React from 'react';
import { useTranslation } from 'react-i18next';
import { Book, Users, ClipboardCheck, Clock } from 'lucide-react';

const GenelBakis = () => {
  const { t } = useTranslation();

  // Sabit Türkçe isimler silindi, sadece kodları (CS301, CS401) tutuyoruz
  const courses = [
    { id: 1, kodu: 'CS301', sinif: 'grade_3', kredi: 6, ogrenci: 45 },
    { id: 2, kodu: 'CS401', sinif: 'grade_4', kredi: 6, ogrenci: 32 }
  ];

  return (
    <div className="dashboard-container">
      {/* İstatistik Kartları */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-wrapper bg-green-soft"><Book size={24} color="#10b981" /></div>
          <h3 className="stat-value">2</h3>
          <p className="stat-label">{t('academician.dashboard.activeCourses')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-blue-soft"><Users size={24} color="#2563eb" /></div>
          <h3 className="stat-value">77</h3>
          <p className="stat-label">{t('academician.dashboard.totalStudents')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-purple-soft"><ClipboardCheck size={24} color="#8b5cf6" /></div>
          <h3 className="stat-value">12</h3>
          <p className="stat-label">{t('academician.dashboard.pendingGrades')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-orange-soft"><Clock size={24} color="#ea580c" /></div>
          <h3 className="stat-value">4</h3>
          <p className="stat-label">{t('academician.dashboard.pendingApprovals')}</p>
        </div>
      </div>

      <div className="card-container">
        <h2 className="dash-section-title">{t('academician.dashboard.myCourses')}</h2>
        <p className="dash-section-subtitle">{t('academician.dashboard.currentSemester')}</p>
        
        <div className="active-courses-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {courses.map(course => (
            <div key={course.id} className="active-course-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="course-content-left">
                  <div className="course-head">
                    <span className="course-code">{course.kodu}</span>
                    <span className="course-credit">{t(`data.classes.${course.sinif}`)}</span>
                    <span className="course-credit" style={{ backgroundColor: 'rgba(59, 111, 212, 0.1)', color: 'var(--primary-blue)' }}>
                      {course.kredi} {t('studentDashboard.overview.credits', 'Kredi')}
                    </span>
                  </div>
                  {/* DERS ADI BURADA ÇEVRİLİYOR */}
                  <h4 className="course-name" style={{ marginTop: '8px', marginBottom: '4px', color: 'var(--text-main)' }}>
                    {t(`data.courses.${course.kodu}`)}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <Users size={14} />
                    <span>{course.ogrenci} {t('academician.courses.studentCount')}</span>
                  </div>
                </div>
                <button className="btn-add" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10b981' }}>
                  <ClipboardCheck size={18} /> {t('academician.dashboard.notEntry')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenelBakis;