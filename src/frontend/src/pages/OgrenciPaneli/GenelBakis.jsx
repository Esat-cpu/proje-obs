import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Award, Layers, Calendar } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';

const GenelBakis = () => {
  const { t } = useTranslation();

  const activeCourses = [
    { kodu: 'CS301', kredi: 6, unvan: 'prof', hoca: 'Ahmet Yılmaz', vize: 85, final: '-' },
    { kodu: 'CS302', kredi: 5, unvan: 'doc', hoca: 'Ayşe Kaya', vize: 90, final: '-' }
  ];

  const pastGrades = [
    { kodu: 'CS201', vize: 85, final: 90, harf: 'AA' },
    { kodu: 'CS202', vize: 75, final: 80, harf: 'BB' },
    { kodu: 'CS203', vize: 90, final: 92, harf: 'AA' },
    { kodu: 'CS204', vize: 80, final: 85, harf: 'BA' }
  ];

  const activeColumns = [
    {
      header: t('studentDashboard.overview.course'),
      render: (row) => (
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '2px' }}>{row.kodu}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t(`data.courses.${row.kodu}`)}</div>
        </div>
      )
    },
    {
      header: t('studentDashboard.courses.instructor'),
      render: (row) => (
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {t(`data.titles.${row.unvan}`)} {row.hoca}
        </span>
      )
    },
    {
      header: t('studentDashboard.overview.credits'),
      render: (row) => (
        <span className="badge-pill">{row.kredi}</span>
      )
    },
    { header: t('studentDashboard.overview.midterm'), accessor: 'vize' },
    { header: t('studentDashboard.overview.final'), accessor: 'final' },
  ];

  const pastColumns = [
    {
      header: t('studentDashboard.overview.course'),
      render: (row) => (
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '2px' }}>{row.kodu}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t(`data.courses.${row.kodu}`)}</div>
        </div>
      )
    },
    { header: t('studentDashboard.overview.midterm'), accessor: 'vize' },
    { header: t('studentDashboard.overview.final'), accessor: 'final' },
    {
      header: t('studentDashboard.overview.grade'),
      render: (row) => {
        const colors = {
          'AA': { bg: '#d1fae5', text: '#065f46' },
          'BA': { bg: '#dbeafe', text: '#1e40af' },
          'BB': { bg: '#fef3c7', text: '#92400e' }
        };
        const style = colors[row.harf] || { bg: '#f3f4f6', text: '#374151' };
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
            {row.harf}
          </span>
        );
      }
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-wrapper bg-blue-soft"><BookOpen size={24} color="#3b82f6" /></div>
          <h3 className="stat-value">4</h3>
          <p className="stat-label">{t('studentDashboard.overview.activeCourses')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-green-soft"><Award size={24} color="#10b981" /></div>
          <h3 className="stat-value">3.45</h3>
          <p className="stat-label">{t('studentDashboard.overview.gpa')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-purple-soft"><Layers size={24} color="#8b5cf6" /></div>
          <h3 className="stat-value">22</h3>
          <p className="stat-label">{t('studentDashboard.overview.credits')}</p>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper bg-orange-soft"><Calendar size={24} color="#f59e0b" /></div>
          <h3 className="stat-value">6</h3>
          <p className="stat-label">{t('studentDashboard.overview.term')}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <h2 className="dash-section-title">{t('studentDashboard.overview.activeCoursesNotes')}</h2>
          <p className="dash-section-subtitle">{t('data.terms.2025_spring')}</p>

          <div className="grades-table-container desktop-only card-container no-padding">
            <DataTable columns={activeColumns} data={activeCourses} />
          </div>

          <div className="mobile-view" style={{ padding: '0 0 16px' }}>
            {activeCourses.map((course) => (
              <div key={course.kodu} className="mobile-course-card">
                <div className="course-name">{t(`data.courses.${course.kodu}`)}</div>
                <div className="course-instructor">{t(`data.titles.${course.unvan}`)} {course.hoca}</div>
                <div className="course-badges">
                  <span className="badge-pill">{course.kredi} {t('studentDashboard.overview.credits')}</span>
                  <span className="badge-pill">{t('studentDashboard.overview.midterm')}: {course.vize}</span>
                  <span className="badge-pill">{t('studentDashboard.overview.final')}: {course.final}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="dash-section-title">{t('studentDashboard.overview.currentGradesTitle')}</h2>
          <p className="dash-section-subtitle">{t('studentDashboard.overview.currentTerm')}</p>

          <div className="grades-table-container card-container no-padding">
            <DataTable
              columns={pastColumns}
              data={pastGrades}
              footer={
                <tr className="table-footer-row">
                  <td colSpan="3" style={{ textAlign: 'left' }}>{t('studentDashboard.overview.termAvg')}</td>
                  <td className="text-avg">3.50</td>
                </tr>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenelBakis;