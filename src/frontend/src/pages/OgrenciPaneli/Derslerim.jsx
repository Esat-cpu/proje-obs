import React from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../../components/ui/DataTable';

const Derslerim = () => {
  const { t } = useTranslation();

  // Öğrenci ders verisi
  // NOT: 'donem' ve 'sinif' değerleri dil dosyasındaki anahtarlar (key) ile birebir aynı olmalıdır.
  const studentCourses = [
    { kodu: 'CS301', hoca: 'Prof. Dr. Ahmet Yılmaz', donem: '2026_fall', sinif: 'grade_2', kredi: 6 },
    { kodu: 'CS302', hoca: 'Doç. Dr. Ayşe Kaya', donem: '2026_fall', sinif: 'grade_2', kredi: 5 },
    { kodu: 'CS303', hoca: 'Prof. Dr. Mehmet Demir', donem: '2026_fall', sinif: 'grade_2', kredi: 6 },
    { kodu: 'CS304', hoca: 'Dr. Öğr. Üyesi Fatma Şahin', donem: '2026_fall', sinif: 'grade_2', kredi: 5 }
  ];

  const columns = [
    { 
      header: t('studentDashboard.courses.code'), 
      accessor: 'kodu' 
    },
    { 
      header: t('studentDashboard.courses.name'), 
      // t(`data.courses.CS301`) -> "Veri Yapıları" veya "Data Structures"
      render: (row) => t(`data.courses.${row.kodu}`) 
    },
    { 
      header: t('studentDashboard.courses.instructor'), 
      accessor: 'hoca' 
    },
    { 
      header: t('studentDashboard.courses.term'), 
      // t(`data.terms.2026_fall`) -> "2026 Güz" veya "Fall 2026"
      render: (row) => t(`data.terms.${row.donem}`) 
    },
    { 
      header: t('studentDashboard.courses.classLevel'), 
      // t(`data.classes.grade_2`) -> "2. Sınıf" veya "2nd Grade"
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
      <div className="grades-table-container">
        <DataTable columns={columns} data={studentCourses} />
      </div>
    </div>
  );
};

export default Derslerim;