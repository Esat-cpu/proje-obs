import React from 'react';
import { useTranslation } from 'react-i18next';
import { Book, Users, ClipboardCheck, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import academicianService from '../../shared/api/academicianService.js';

const GenelBakis = () => {
  const { t } = useTranslation();
  const { data: coursesData, isLoading: isCoursesLoading, isError: isCoursesError } = useQuery({
    queryKey: ['academicianCourses', 1],
    queryFn: () => academicianService.getDersler(1),
  });

  // 2. GERÇEK VERİ: Bekleyen Kayıt İstekleri
  const { data: pendingRequestsData, isLoading: isPendingRequestsLoading, isError: isPendingRequestsError } = useQuery({
    queryKey: ['academicianPendingRequestsCount'],
    queryFn: () => academicianService.getKayitIstekleri(1, 'beklemede'),
  });

  // 3. GERÇEK VERİ: Onaylanmış Kayıt İstekleri (Not giriş bekleyenler)
  const { data: approvedRequestsData, isLoading: isApprovedRequestsLoading, isError: isApprovedRequestsError } = useQuery({
    queryKey: ['academicianApprovedRequestsCount'],
    queryFn: () => academicianService.getKayitIstekleri(1, 'onaylandi'),
  });

  // Herhangi biri yükleniyorsa loading göster
  if (isCoursesLoading || isPendingRequestsLoading || isApprovedRequestsLoading) {
    return (
      <div className='dashboard-container' style={{ display: 'flex', justifyContent: 'center', minHeight: '60vh' }}>
        <h3> {t('common.loading', 'Yükleniyor...')} </h3>
      </div>
    );
  }
  
  // Herhangi birinde hata varsa error göster
  if (isCoursesError || isPendingRequestsError || isApprovedRequestsError) {
    return (
      <div className='dashboard-container'>
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px' }}>
          {t('common.error', 'Veriler çekilirken hata oluştu.')}
        </div>
      </div>
    );
  }

  // Gelen verileri al (Yoksa boş dizi olarak ayarla)
  const courses = coursesData?.items || [];

  // İstatistikleri dinamik olarak hesapla!
  const stats = {
    activeCourses: coursesData?.count || courses.length, // Toplam ders sayısı
    totalStudents: courses.reduce((toplam, course) => toplam + (course.ogrenci_sayisi || 0), 0), // Derslerdeki toplam öğrenci sayısı
    pendingGrades: approvedRequestsData?.count || 0, // Onaylanmış kayıtların sayısı (Not girişi bekleyenler)
    pendingApprovals: pendingRequestsData?.count || 0, // Bekleyen kayıtların sayısı
  };
  return (
    <div className="dashboard-container">
      {/* İstatistik Kartları */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-wrapper bg-green-soft"><Book size={24} color="#10b981" /></div>
          <h3 className="stat-value">{stats.activeCourses}</h3>
          <p className="stat-label">{t('academician.dashboard.activeCourses')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-blue-soft"><Users size={24} color="#2563eb" /></div>
          <h3 className="stat-value">{stats.totalStudents}</h3>
          <p className="stat-label">{t('academician.dashboard.totalStudents')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-purple-soft"><ClipboardCheck size={24} color="#8b5cf6" /></div>
          <h3 className="stat-value">{stats.pendingGrades}</h3>
          <p className="stat-label">{t('academician.dashboard.pendingGrades', 'Giriş Bekleyen Notlar')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-orange-soft"><Clock size={24} color="#ea580c" /></div>
          <h3 className="stat-value">{stats.pendingApprovals}</h3>
          <p className="stat-label">{t('academician.dashboard.pendingApprovals', 'Bekleyen Kayıt Onayları')}</p>
        </div>
      </div>

      {/* Aktif Dersler Listesi */}
      <div className="active-courses-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {courses.length > 0 ? (
          courses.map((course, index) => (
            <div key={index} className="active-course-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="course-content-left">
                  <div className="course-head">
                    <span className="course-code">{course.ders.ders_kodu}</span>
                    <span className="course-credit">{t('data.classes.grade_' + course.ders.min_sinif, `${course.ders.min_sinif}. Sınıf`)}</span>
                    <span className="course-credit" style={{ backgroundColor: 'rgba(59, 111, 212, 0.1)', color: 'var(--primary-blue)' }}>
                      {course.ders.kredi} {t('studentDashboard.overview.credits', 'Kredi')}
                    </span>
                  </div>
                  <h4 className="course-name" style={{ marginTop: '8px', marginBottom: '4px', color: 'var(--text-main)' }}>
                    {t('data.courses.' + course.ders.ders_kodu, course.ders.ad)}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <Users size={14} />
                    <span>{course.ogrenci_sayisi||0} {t('academician.courses.student', 'Öğrenci')} / {course.kontenjan} {t('academician.courses.quota', 'Kontenjan')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('academician.dashboard.noActiveCourses', 'Henüz aktif bir dersiniz bulunmuyor.')}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenelBakis;