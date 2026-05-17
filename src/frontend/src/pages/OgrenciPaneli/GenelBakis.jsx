import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Award, Layers, Calendar } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import studentService from '../../shared/api/studentService';
import { useQuery } from '@tanstack/react-query';

const GenelBakis = () => {
  const { t } = useTranslation();

  // Backend'den öğrenci profil bilgilerini çek
  const { data: profileData } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: studentService.getProfil,
  });

  // Backend'den aktif dönem derslerini çek
  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['studentCourses'],
    queryFn: studentService.getDersler,
  });

  // Onaylanmış dersleri filtrele (güncel dönem notları için)
  // Akademisyen veya admin panelden onaylanan tüm dersler
  const currentTermGrades = (coursesData || []).filter(
    course => course.onay_durumu === 'onaylandi'
  );

  // Dönem hesaplama: Öğrenci sınıfı ve aktif dönem bilgisine göre
  const calculateCurrentTerm = () => {
    if (!profileData || !coursesData || coursesData.length === 0) return '-';
    
    const studentClass = profileData.sinif; // Öğrencinin sınıfı (1, 2, 3, 4)
    const currentCourse = coursesData[0]; // İlk dersten dönem bilgisini al
    const currentSemester = currentCourse.donem; // "GUZ" veya "BAHAR"
    
    // Her sınıfın 2 dönemi var (Güz ve Bahar)
    // Güz = 1. dönem, Bahar = 2. dönem
    const completedTerms = (studentClass - 1) * 2; // Önceki sınıfların tamamlanmış dönemleri
    const currentTermNumber = currentSemester === 'GUZ' ? 1 : 2; // Mevcut dönem numarası
    
    return completedTerms + currentTermNumber;
  };

  // Akademik yıl ve dönem bilgisi oluştur
  const getAcademicYearAndSemester = () => {
    if (!coursesData || coursesData.length === 0) return '';
    
    const currentCourse = coursesData[0];
    const year = currentCourse.yil; // Backend'den gelen yıl (örn: 2026)
    const semester = currentCourse.donem; // "GUZ" veya "BAHAR"
    
    // Güz dönemi: Yıl-Yıl+1 (örn: 2026-2027)
    // Bahar dönemi: Yıl-1-Yıl (örn: 2025-2026)
    let academicYear;
    if (semester === 'GUZ') {
      academicYear = `${year}-${year + 1}`;
    } else {
      academicYear = `${year - 1}-${year}`;
    }
    
    const semesterText = semester === 'GUZ' ? 'Güz Dönemi' : 'Bahar Dönemi';
    return `${academicYear} ${semesterText}`;
  };

  const currentTermColumns = [
    {
      header: t('studentDashboard.overview.course'),
      render: (row) => (
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '2px' }}>{row.ders_kodu}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.ders_ad}</div>
        </div>
      )
    },
    {
      header: t('studentDashboard.courses.instructor'),
      render: (row) => (
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {row.akademisyen_ad}
        </span>
      )
    },
    {
      header: t('studentDashboard.overview.credits'),
      render: (row) => (
        <span className="badge-pill">{row.kredi}</span>
      )
    },
    {
      header: t('studentDashboard.overview.midterm'),
      render: (row) => row.vize_notu ?? '-'
    },
    {
      header: t('studentDashboard.overview.final'),
      render: (row) => row.final_notu ?? '-'
    },
    {
      header: t('studentDashboard.overview.grade'),
      render: (row) => {
        const colors = {
          'AA': { bg: '#d1fae5', text: '#065f46' },
          'BA': { bg: '#dbeafe', text: '#1e40af' },
          'BB': { bg: '#fef3c7', text: '#92400e' },
          'CB': { bg: '#fef3c7', text: '#92400e' },
          'CC': { bg: '#fef3c7', text: '#92400e' },
          'DC': { bg: '#fee2e2', text: '#991b1b' },
          'DD': { bg: '#fee2e2', text: '#991b1b' },
          'FF': { bg: '#fee2e2', text: '#991b1b' }
        };
        const style = colors[row.harf_notu] || { bg: '#f3f4f6', text: '#374151' };
        return (
          <span style={{
            backgroundColor: style.bg,
            color: style.text,
            padding: '6px 12px',
            borderRadius: '20px',
            fontWeight: '700',
            fontSize: '12px',
            display: 'inline-block',
            minWidth: '40px'
          }}>
            {row.harf_notu}
          </span>
        );
      }
    }
  ];

  // Ortalama hesaplama
  const calculateTermAverage = () => {
    if (currentTermGrades.length === 0) return '0.00';
    const gradePoints = {
      'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5,
      'CC': 2.0, 'DC': 1.5, 'DD': 1.0, 'FF': 0.0
    };
    const totalPoints = currentTermGrades.reduce((sum, course) => {
      const point = gradePoints[course.harf_notu] || 0;
      return sum + (point * course.kredi);
    }, 0);
    const totalCredits = currentTermGrades.reduce((sum, course) => sum + course.kredi, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-wrapper bg-blue-soft"><BookOpen size={24} color="#3b82f6" /></div>
          <h3 className="stat-value">{currentTermGrades.length}</h3>
          <p className="stat-label">{t('studentDashboard.overview.activeCourses')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-green-soft"><Award size={24} color="#10b981" /></div>
          <h3 className="stat-value">{calculateTermAverage()}</h3>
          <p className="stat-label">{t('studentDashboard.overview.gpa')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-purple-soft"><Layers size={24} color="#8b5cf6" /></div>
          <h3 className="stat-value">{currentTermGrades.reduce((sum, course) => sum + (course.kredi || 0), 0)}</h3>
          <p className="stat-label">{t('studentDashboard.overview.credits')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-orange-soft"><Calendar size={24} color="#f59e0b" /></div>
          <h3 className="stat-value">{calculateCurrentTerm()}</h3>
          <p className="stat-label">{t('studentDashboard.overview.term')}</p>
        </div>
      </div>

      <div>
        <h2 className="dash-section-title">{t('studentDashboard.overview.currentGradesTitle')}</h2>
        <p className="dash-section-subtitle">{getAcademicYearAndSemester()}</p>

        {isCoursesLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>{t('common.loading', 'Notlar yükleniyor...')}</div>
        ) : (
          <div className="grades-table-container card-container no-padding">
            <DataTable
              columns={currentTermColumns}
              data={currentTermGrades}
              footer={
                <tr className="table-footer-row">
                  <td colSpan="5" style={{ textAlign: 'left' }}>{t('studentDashboard.overview.termAvg')}</td>
                  <td className="text-avg">{calculateTermAverage()}</td>
                </tr>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenelBakis;