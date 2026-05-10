import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Award, Layers, Calendar } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';

const Transcript = () => {
  const { t } = useTranslation();

  // Mock Transkript Verisi
  const transcriptData = [
    { kodu: 'CS101', kredi: 6, harf: 'AA', puan: '4.00' },
    { kodu: 'MATH101', kredi: 6, harf: 'BA', puan: '3.50' },
    { kodu: 'PHYS101', kredi: 5, harf: 'BB', puan: '3.00' },
    { kodu: 'ENG101', kredi: 3, harf: 'AA', puan: '4.00' },
    { kodu: 'CS201', kredi: 6, harf: 'AA', puan: '4.00' },
    { kodu: 'CS202', kredi: 5, harf: 'CB', puan: '2.50' },
    { kodu: 'CS203', kredi: 6, harf: 'AA', puan: '4.00' },
    { kodu: 'CS204', kredi: 5, harf: 'BA', puan: '3.50' }
  ];
  const pastTermsData = [
    { id: '2024_fall', name: "2024-2025 Güz Dönemi", avg: "3.40", count: 6 },
    { id: '2023_spring', name: "2023-2024 Bahar Dönemi", avg: "3.10", count: 5 }
  ];

  return (
    <div className="dashboard-container">
      {/* Üst Banner */}
      <div className="banner banner-purple">
        <div>
          <h2>{t('studentDashboard.transcript.title')}</h2>
          <p>Victor Osimhen - 4242424242</p>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>Bilgisayar Mühendisliği</p>
        </div>
        <button className="btn-white">
          <Download size={18} /> {t('studentDashboard.transcript.download')}
        </button>
      </div>
      {/* Özet Kartları */}
      <div className="summary-grid transcript-summary-grid">
        <div className="summary-card">
          <div className="icon-box bg-green-light"><Award color="#059669" /></div>
          <div>
            <p>{t('studentDashboard.transcript.gpa')}</p>
            <h3>3.46</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="icon-box bg-blue-light"><Layers color="#2563eb" /></div>
          <div>
            <p>{t('studentDashboard.transcript.totalCredit')}</p>
            <h3>142</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="icon-box bg-purple-light"><Calendar color="#7c3aed" /></div>
          <div>
            <p>{t('studentDashboard.transcript.term')}</p>
            <h3>6</h3>
          </div>
        </div>
      </div>
      {pastTermsData.map((term) => (
        <div key={term.id} className="card-container no-padding" style={{ marginTop: '24px' }}>
          <div className="term-header">
            <div>
              <h3>{term.name}</h3>
              <p>{term.count} {t('studentDashboard.transcript.listed')}</p>
            </div>
            <div className="term-gpa">
              <p>{t('studentDashboard.transcript.termAvg')}</p>
              <h3>{term.avg}</h3>
            </div>
          </div>
          <div className="transcript-table-container grades-table-container">
            <DataTable
              columns={[
                {
                  header: t('studentDashboard.transcript.code'),
                  accessor: 'kodu'
                },
                {
                  header: t('studentDashboard.transcript.name'),
                  render: (row) => t(`data.courses.${row.kodu}`)
                },
                {
                  header: <div style={{ textAlign: 'center' }}>{t('studentDashboard.transcript.credit')}</div>,
                  render: (row) => <div style={{ textAlign: 'center' }}>{row.kredi}</div>
                },
                {
                  header: <div style={{ textAlign: 'center' }}>{t('studentDashboard.transcript.letter')}</div>,
                  render: (row) => {
                    let badgeClass = 'badge-success';
                    if (row.harf === 'BB' || row.harf === 'CB') badgeClass = 'badge-warning';
                    if (row.harf === 'CC' || row.harf === 'DC') badgeClass = 'badge-blue';
                    if (row.harf === 'DD' || row.harf === 'FD' || row.harf === 'FF') badgeClass = 'badge-danger';
                    return (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span className={`badge ${badgeClass}`}>{row.harf}</span>
                      </div>
                    );
                  }
                },
                {
                  header: <div style={{ textAlign: 'center' }}>{t('studentDashboard.transcript.value')}</div>,
                  render: (row) => <div style={{ textAlign: 'center' }}>{row.puan}</div>
                }
              ]}
              // Not: Gerçek senaryoda her dönemin kendi verisi (term.grades) olmalı, şimdilik mock veriyi kullanıyoruz.
              data={transcriptData}
            />
          </div>
        </div>
      ))}

      {/* Dönem Tablosu */}
      <div className="card-container no-padding">
        <div className="term-header">
          <div>
            {/* Dönem ismi data.terms sözlüğünden çekiliyor */}
            <h3>{t('data.terms.2023_fall')}</h3>
            <p>8 {t('studentDashboard.transcript.listed')}</p>
          </div>
          <div className="term-gpa">
            <p>{t('studentDashboard.transcript.termAvg')}</p>
            <h3>3.25</h3>
          </div>
        </div>

        <div className="transcript-table-container grades-table-container">
          <DataTable
            columns={[
              {
                header: t('studentDashboard.transcript.code'),
                accessor: 'kodu'
              },
              {
                header: t('studentDashboard.transcript.name'),
                render: (row) => t(`data.courses.${row.kodu}`)
              },
              {
                header: <div style={{ textAlign: 'center' }}>{t('studentDashboard.transcript.credit')}</div>,
                render: (row) => <div style={{ textAlign: 'center' }}>{row.kredi}</div>
              },
              {
                header: <div style={{ textAlign: 'center' }}>{t('studentDashboard.transcript.letter')}</div>,
                render: (row) => {
                  // Nota göre dinamik renk ataması
                  let badgeClass = 'badge-success'; // AA, BA için yeşil
                  if (row.harf === 'BB' || row.harf === 'CB') badgeClass = 'badge-warning'; // Sarı
                  if (row.harf === 'CC' || row.harf === 'DC') badgeClass = 'badge-blue'; // Mavi
                  if (row.harf === 'DD' || row.harf === 'FD' || row.harf === 'FF') badgeClass = 'badge-danger'; // Kırmızı
  
                  return (
                    // display: flex ile rozeti hücrenin tam ortasına hizaladık
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span className={`badge ${badgeClass}`}>{row.harf}</span>
                    </div>
                  );
                }
              },
              {
                header: <div style={{ textAlign: 'center' }}>{t('studentDashboard.transcript.value')}</div>,
                render: (row) => <div style={{ textAlign: 'center' }}>{row.puan}</div>
              }
            ]}
            data={transcriptData}
          />
        </div>
      </div>
    </div>
  );
};

export default Transcript;