import React from 'react';
import { useTranslation } from 'react-i18next';

const Derslerim = () => {
  const { t } = useTranslation();

  const studentCourses = [
    { kodu: 'CS301', unvan: 'prof', hoca: 'Ahmet Yılmaz', donem: '2026_fall', sinif: 'grade_2', kredi: 6 },
    { kodu: 'CS302', unvan: 'doc', hoca: 'Ayşe Kaya', donem: '2026_fall', sinif: 'grade_2', kredi: 5 },
    { kodu: 'CS303', unvan: 'prof', hoca: 'Mehmet Demir', donem: '2026_fall', sinif: 'grade_2', kredi: 6 },
    { kodu: 'CS304', unvan: 'asst', hoca: 'Fatma Şahin', donem: '2026_fall', sinif: 'grade_2', kredi: 4 },
  ];

  return (
    <div className="dashboard-container">
      <h2 className="dash-section-title">{t('studentDashboard.tabs.myCourses')}</h2>
      <p className="dash-section-subtitle">{t('data.terms.2026_fall')}</p>

      <div className="active-courses-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {studentCourses.map((course) => (
          <div key={course.kodu} className="active-course-card">

            <div className="course-card-top">
              <div className="course-info-header" style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="course-code">{course.kodu}</span>
                <h4 className="course-name" style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {t(`data.courses.${course.kodu}`)}
                </h4>
                <span className="course-credit-badge" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                  {course.kredi} {t('studentDashboard.courses.credit')}
                </span>
              </div>
            </div>

            <p className="teacher" style={{ margin: '4px 0 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {t(`data.titles.${course.unvan}`)} {course.hoca}
            </p>

            <div className="course-grades" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div className="grade-item">
                <span className="grade-label">{t('studentDashboard.courses.term')}</span>
                <span className="grade-value text-blue">{t(`data.terms.${course.donem}`)}</span>
              </div>
              <div className="grade-item" style={{ textAlign: 'right' }}>
                <span className="grade-label">{t('studentDashboard.courses.classLevel')}</span>
                <span className="grade-value" style={{ color: 'var(--text-muted)' }}>{t(`data.classes.${course.sinif}`)}</span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Derslerim;