import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';

const VerdigimDersler = () => {
  const { t } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Mock veriden sabit ders adları temizlendi
  const courses = [
    { id: 1, kodu: 'CS301', sinif: 'grade_3', ogrenciSayisi: 45 },
    { id: 2, kodu: 'CS401', sinif: 'grade_4', ogrenciSayisi: 32 },
  ];

  const students = [
    { id: '2021001', ad: 'Ali Yılmaz', vize: 75, final: 80 },
    { id: '2021005', ad: 'Ayşe Demir', vize: 90, final: 85 },
  ];

  const calculateGrade = (vize, final) => {
    const avg = Math.round(vize * 0.4 + final * 0.6);
    let letter = 'FF', colorClass = 'badge-danger';
    if (avg >= 88) { letter = 'AA'; colorClass = 'badge-success'; }
    else if (avg >= 74) { letter = 'BB'; colorClass = 'badge-warning'; }
    else if (avg >= 60) { letter = 'CC'; colorClass = 'badge-blue'; }
    return { avg, letter, colorClass };
  };

  // Detay (Not Giriş) Ekranı
  if (selectedCourse) {
    return (
      <div className="card-container" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button className="logout-btn" style={{ backgroundColor: '#64748b', color: 'white' }} onClick={() => setSelectedCourse(null)}>
            <ChevronLeft size={18} /> {t('academician.courses.backBtn')}
          </button>
          {/* DERS ADI BURADA ÇEVRİLİYOR */}
          <h2 style={{ margin: 0 }}>{selectedCourse.kodu} - {t(`data.courses.${selectedCourse.kodu}`)}</h2>
        </div>
        <DataTable 
          columns={[
            { header: t('academician.table.studentId'), accessor: 'id' },
            { header: t('academician.table.fullName'), accessor: 'ad' },
            { header: t('studentDashboard.overview.midterm'), render: (row) => <input type="number" className="grade-input" defaultValue={row.vize} /> },
            { header: t('studentDashboard.overview.final'), render: (row) => <input type="number" className="grade-input" defaultValue={row.final} /> },
            { header: t('academician.table.average'), render: (row) => <strong>{calculateGrade(row.vize, row.final).avg}</strong> },
            { header: t('academician.table.letterGrade'), render: (row) => {
              const res = calculateGrade(row.vize, row.final);
              return <span className={`badge ${res.colorClass}`}>{res.letter}</span>
            }}
          ]} 
          data={students} 
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn-add">{t('academician.courses.saveBtn')}</button>
        </div>
      </div>
    );
  }

  // Liste Ekranı
  return (
    <div className="card-container no-padding">
      <div style={{ padding: '24px' }}><h2 className="dash-section-title">{t('academician.courses.title')}</h2></div>
      {/* Masaüstü Görünümü */}
      <div className="desktop-only">
        <DataTable 
          columns={[
            { header: t('academician.courses.code'), accessor: 'kodu', render: (row) => <strong>{row.kodu}</strong> },
            { 
              header: t('academician.courses.name'), 
              // TABLODAKİ DERS ADI BURADA ÇEVRİLİYOR
              render: (row) => t(`data.courses.${row.kodu}`) 
            },
            { header: t('academician.courses.class'), render: (row) => t(`data.classes.${row.sinif}`) },
            { header: t('academician.courses.studentCount'), accessor: 'ogrenciSayisi' },
            { header: '', render: (row) => (
              <button className="btn-add" onClick={() => setSelectedCourse(row)}>{t('academician.courses.actionBtn')}</button>
            )}
          ]} 
          data={courses} 
        />
      </div>

      {/* Mobil Görünümü */}
      <div className="mobile-view" style={{ padding: '0 16px 16px' }}>
        {courses.map((course) => (
          <div key={course.id} className="mobile-grade-entry-card">
            <h4 className="course-name">{t(`data.courses.${course.kodu}`)}</h4>
            <div className="course-info">{course.kodu} • {t(`data.classes.${course.sinif}`)} • {course.ogrenciSayisi} {t('academician.courses.studentCount')}</div>
            <button className="btn-grade-entry-mobile" onClick={() => setSelectedCourse(course)}>
              {t('academician.courses.actionBtn')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerdigimDersler;