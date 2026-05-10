import React from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../../components/ui/DataTable';

const Derslerim = () => {
  const { t } = useTranslation();

  // Öğrenci ders verisi
  // NOT: 'donem' ve 'sinif' değerleri dil dosyasındaki anahtarlar (key) ile birebir aynı olmalıdır.
  const studentCourses = [
    { kodu: 'CS301', unvan: 'prof', hoca: 'Ahmet Yılmaz', donem: '2026_fall', sinif: 'grade_2', kredi: 6 },
    { kodu: 'CS302', unvan: 'doc', hoca: 'Ayşe Kaya', donem: '2026_fall', sinif: 'grade_2', kredi: 5 },
    { kodu: 'CS303', unvan: 'prof', hoca: 'Mehmet Demir', donem: '2026_fall', sinif: 'grade_2', kredi: 6 },
    { kodu: 'CS304', unvan: 'asst', hoca: 'Fatma Şahin', donem: '2026_fall', sinif: 'grade_2', kredi: 5 }
  ];

  const columns = [
    { 
      header: t('studentDashboard.courses.code'), 
      accessor: 'kodu' 
    },
    { 
      header: t('studentDashboard.courses.name'), 
      render: (row) => t(`data.courses.${row.kodu}`) 
    },
    { 
      header: t('studentDashboard.courses.instructor'), 
      render: (row) => `${t(`data.titles.${row.unvan}`)} ${row.hoca}`
    },
    { 
      header: t('studentDashboard.courses.term'), 
      render: (row) => t(`data.terms.${row.donem}`) 
    },
    { 
      header: t('studentDashboard.courses.classLevel'), 
      render: (row) => t(`data.classes.${row.sinif}`) 
    },
    { 
      header: t('studentDashboard.courses.credit'), 
      accessor: 'kredi' 
    }
  ];

  return (
    <div className="card-container no-padding">
      <div style={{ padding: '24px' }}>
        <h2 className="dash-section-title">{t('studentDashboard.courses.title')}</h2>
      </div>
      {/* Masaüstü Görünümü (Tablo) */}
      <div className="grades-table-container desktop-only">
        <DataTable columns={columns} data={studentCourses} />
      </div>

      {/* Mobil Görünümü (Kartlar) */}
      <div className="mobile-view" style={{ padding: '0 16px 16px' }}>
        {studentCourses.map((course) => (
          <div key={course.kodu} className="mobile-course-card">
            <div className="course-name">{t(`data.courses.${course.kodu}`)}</div>
            <div className="course-instructor">{t(`data.titles.${course.unvan}`)} {course.hoca}</div>
            <div className="course-badges">
              <span className="badge-pill">{course.kredi} {t('studentDashboard.courses.credit')}</span>
              <span className="badge-pill">{t(`data.terms.${course.donem}`)}</span>
              <span className="badge-pill">{t(`data.classes.${course.sinif}`)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Derslerim;