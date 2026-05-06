import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, FileText, Clock, CheckCircle, XCircle, User, BookOpen } from 'lucide-react';

const KayitOnaylari = () => {
  const { t } = useTranslation();

  const requests = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      studentId: "20211001",
      status: t('academician.approvals.pending'),
      course: "CS301",
      grade: "grade_3",
      currentCourses: 5,
      totalCredits: 26,
      gpa: "3.45"
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Banner */}
      <div className="approval-banner">
        <h2>{t('academician.approvals.bannerTitle')}</h2>
        <p>{t('academician.approvals.bannerDesc')}</p>
      </div>

      {/* İstatistikler */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="icon-wrapper bg-blue-soft"><FileText size={20} color="#2563eb" /></div>
          <div className="summary-info"><span className="summary-label">{t('academician.approvals.total')}</span><h3 className="summary-value">6</h3></div>
        </div>
        <div className="summary-card">
          <div className="icon-wrapper bg-orange-soft"><Clock size={20} color="#ea580c" /></div>
          <div className="summary-info"><span className="summary-label">{t('academician.approvals.pending')}</span><h3 className="summary-value">4</h3></div>
        </div>
        <div className="summary-card">
          <div className="icon-wrapper bg-green-soft"><CheckCircle size={20} color="#10b981" /></div>
          <div className="summary-info"><span className="summary-label">{t('academician.approvals.approved')}</span><h3 className="summary-value">1</h3></div>
        </div>
        <div className="summary-card">
          <div className="icon-wrapper bg-red-soft"><XCircle size={20} color="#ef4444" /></div>
          <div className="summary-info"><span className="summary-label">{t('academician.approvals.rejected')}</span><h3 className="summary-value">1</h3></div>
        </div>
      </div>

      {/* Filtre */}
      <div className="filter-row">
        <div className="search-input-wrapper">
          <Search size={18} color="var(--text-muted)" />
          <input type="text" placeholder={t('academician.approvals.searchPlaceholder')} />
        </div>
        <select className="status-select">
          <option>{t('academician.approvals.pending')}</option>
          <option>{t('academician.approvals.approved')}</option>
        </select>
      </div>

      {/* Onay Kartları */}
      {requests.map((req) => (
        <div key={req.id} className="approval-card">
          <div className="approval-card-left">
            <div className="student-header">
              <User size={18} className="text-muted" /><span className="student-name">{req.name}</span>
              <span className="student-id">{req.studentId}</span><span className="badge-yellow">{req.status}</span>
            </div>
            
            <div className="course-info-section">
              <p className="section-subtitle-small">{t('academician.approvals.courseInfo')}</p>
              <div className="course-pill">
                <BookOpen size={14} color="#3b82f6" />
                {/* DERS ADI VE SINIF BURADA ÇEVRİLİYOR */}
                <span>
                  {req.course} - {t(`data.courses.${req.course}`)} | <strong className="text-green">{t(`data.classes.${req.grade}`)}</strong>
                </span>
              </div>
            </div>

            <div className="academic-stats">
              <div className="stat-item"><label>{t('academician.approvals.currentCourses')}</label><span>{req.currentCourses}</span></div>
              <div className="stat-item"><label>{t('academician.approvals.totalCredits')}</label><span>{req.totalCredits}</span></div>
              <div className="stat-item"><label>{t('academician.approvals.gpa')}</label><span className="text-green font-bold">{req.gpa}</span></div>
            </div>
          </div>
          <div className="approval-actions">
            <button className="btn-approve"><CheckCircle size={18} /> {t('academician.approvals.approveBtn')}</button>
            <button className="btn-reject"><XCircle size={18} /> {t('academician.approvals.rejectBtn')}</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KayitOnaylari;