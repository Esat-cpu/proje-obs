import React from 'react';
import { useTranslation } from 'react-i18next';
import { Book, Users, ClipboardCheck, Clock } from 'lucide-react';
import {useQuery} from '@tanstack/react-query';
import { academicianService } from '../../shared/api/academicianService';

const GenelBakis = () => {
  const { t } = useTranslation();
  const {data, isLoading, isError} = useQuery({
    queryKey: ['academicianDashboardSummary'],
    queryFn: academicianService.getDashboardSummary,
  })

  if(isLoading){
      return(
      <div className='dashboard-container' style= {{display:'flex', justifyContent:'center', minHeight: '60vh'}}>
        <h3> {t('common.loading', 'Yükleniyor...')} </h3>
      </div>
      );
  }
  if(isError){
    return(
      <div className='dashboard-container'>
        <div style={{padding: '20px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px'}}>
          {t('common.error', 'veriler çekilirken hata oluştu.')}
        </div>
      </div>
    );
  }
  const stats = data?.stats || {activeCourses: 0, totalStudents: 0, pendingGrades: 0, pendingApprovals: 0};
  const courses = data?.courses || [];
  // Sabit Türkçe isimler silindi, sadece kodları (CS301, CS401) tutuyoruz

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
          <p className="stat-label">{t('academician.dashboard.pendingGrades', 'Giriş Bekleyen Not')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-orange-soft"><Clock size={24} color="#ea580c" /></div>
          <h3 className="stat-value">{stats.pendingApprovals}</h3>
          <p className="stat-label">{t('academician.dashboard.pendingApprovals', 'Kayıt Onayı Bekleyen')}</p>
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
                    <span className="course-code">{course.kodu}</span>
                    <span className="course-credit">{t(`data.classes.${course.sinif}`)}</span>
                    <span className="course-credit" style={{ backgroundColor: 'rgba(59, 111, 212, 0.1)', color: 'var(--primary-blue)' }}>
                      {course.kredi} {t('studentDashboard.overview.credits', 'Kredi')}
                    </span>
                  </div>
                  <h4 className="course-name" style={{ marginTop: '8px', marginBottom: '4px', color: 'var(--text-main)' }}>
                    {t(`data.courses.${course.kodu}`)}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <Users size={14} />
                    <span>{course.ogrenci_sayisi} {t('academician.courses.studentCount')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Henüz aktif bir dersiniz bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
};

export default GenelBakis;