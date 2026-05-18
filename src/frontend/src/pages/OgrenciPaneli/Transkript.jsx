import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Award, Layers, Calendar } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import studentService from '../../shared/api/studentService';

const Transcript = () => {
  const { t } = useTranslation();
  const [transkriptData, setTranskriptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTranskript = async () => {
      try {
        setLoading(true);
        const data = await studentService.getTranskript();
        setTranskriptData(data);
        setError(null);
      } catch (err) {
        console.error('Transkript yüklenirken hata:', err);
        setError(err.response?.data?.detail || 'Transkript yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchTranskript();
  }, []);

  const handleDownloadPDF = async () => {
    try {
      const response = await studentService.indirTranskriptPDF();

      const pdfBlob = response.data;

      // content-disposition header'ı
      const contentDisposition = response.headers['content-disposition'];

      let filename = 'transkript.pdf';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);

        if (match?.[1]) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('PDF indirme hatası:', err);
      alert('PDF indirilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Dönem ismini formatla (Backend'den gelen GUZ/BAHAR'ı Türkçe'ye çevir)
  const formatTermName = (yil, donem) => {
    const donemMap = {
      'GUZ': 'Güz',
      'BAHAR': 'Bahar',
      'guz': 'Güz',
      'bahar': 'Bahar'
    };
    
    const donemAdi = donemMap[donem] || donem;
    return `${yil} ${donemAdi} Dönemi`;
  };

  // Dönem toplam kredisini hesapla
  const calculateTermCredit = (dersler) => {
    return dersler.reduce((total, ders) => total + ders.kredi, 0);
  };

  // Dönem GPA'sını hesapla (4.0 üzerinden - harf notlarından)
  const calculateTermGPA = (dersler) => {
    if (!dersler || dersler.length === 0) return '0.00';
    
    let totalWeightedGrade = 0;
    let totalCredit = 0;

    dersler.forEach(ders => {
      if (ders.harf_notu && ders.kredi) {
        const gradeValue = convertLetterToGPA(ders.harf_notu);
        totalWeightedGrade += gradeValue * ders.kredi;
        totalCredit += ders.kredi;
      }
    });

    return totalCredit > 0 ? (totalWeightedGrade / totalCredit).toFixed(2) : '0.00';
  };

  // Harf notunu GPA'ya çevir
  const convertLetterToGPA = (harf) => {
    const gradeMap = {
      'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5, 'CC': 2.0,
      'DC': 1.5, 'DD': 1.0, 'FD': 0.5, 'FF': 0.0
    };
    return gradeMap[harf] || 0.0;
  };

  // Toplam kredi hesapla
  const calculateTotalCredit = () => {
    if (!transkriptData?.kayitlar) return 0;
    return transkriptData.kayitlar.reduce((total, donem) => {
      return total + calculateTermCredit(donem.dersler);
    }, 0);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="card-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p>{t('common.loading') || 'Yükleniyor...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="card-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#dc2626' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!transkriptData) {
    return (
      <div className="dashboard-container">
        <div className="card-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p>{t('studentDashboard.transcript.noData') || 'Transkript verisi bulunamadı'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Üst Banner */}
      <div className="banner banner-purple">
        <div>
          <h2>{t('studentDashboard.transcript.title')}</h2>
          <p>{transkriptData.ogrenci_ad} - {transkriptData.ogrenci_no}</p>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>{transkriptData.bolum}</p>
        </div>
        <button className="btn-white" onClick={handleDownloadPDF}>
          <Download size={18} /> {t('studentDashboard.transcript.download')}
        </button>
      </div>

      {/* Özet Kartları */}
      <div className="summary-grid transcript-summary-grid">
        <div className="summary-card">
          <div className="icon-box bg-green-light"><Award color="#059669" /></div>
          <div>
            <p>{t('studentDashboard.transcript.gpa')}</p>
            <h3>{transkriptData.gpa ? Number(transkriptData.gpa).toFixed(2) : '0.00'}</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="icon-box bg-blue-light"><Layers color="#2563eb" /></div>
          <div>
            <p>{t('studentDashboard.transcript.totalCredit')}</p>
            <h3>{calculateTotalCredit()}</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="icon-box bg-purple-light"><Calendar color="#7c3aed" /></div>
          <div>
            <p>{t('studentDashboard.transcript.term')}</p>
            <h3>{transkriptData.kayitlar?.length || 0}</h3>
          </div>
        </div>
      </div>

      {/* Dönem Tabloları */}
      {transkriptData.kayitlar && transkriptData.kayitlar.length > 0 ? (
        transkriptData.kayitlar.map((donem, index) => {
          const termGPA = calculateTermGPA(donem.dersler);
          
          return (
            <div key={index} className="card-container no-padding" style={{ marginTop: index === 0 ? '0' : '24px' }}>
              <div className="term-header">
                <div>
                  <h3>{formatTermName(donem.yil, donem.donem)}</h3>
                  <p>{donem.dersler.length} {t('studentDashboard.transcript.listed')}</p>
                </div>
                <div className="term-gpa">
                  <p>{t('studentDashboard.transcript.termAvg')}</p>
                  <h3>{termGPA}</h3>
                </div>
              </div>

              <div className="transcript-table-container grades-table-container">
                <DataTable
                  columns={[
                    {
                      header: t('studentDashboard.transcript.code'),
                      accessor: 'ders_kodu'
                    },
                    {
                      header: t('studentDashboard.transcript.name'),
                      render: (row) => row.ders_ad || t(`data.courses.${row.ders_kodu}`) || row.ders_kodu
                    },
                    {
                      header: <div style={{ textAlign: 'center' }}>{t('studentDashboard.transcript.credit')}</div>,
                      render: (row) => <div style={{ textAlign: 'center' }}>{row.kredi}</div>
                    },
                    {
                      header: <div style={{ textAlign: 'center' }}>{t('studentDashboard.transcript.letter')}</div>,
                      render: (row) => {
                        let badgeClass = 'badge-success';
                        if (row.harf_notu === 'BB' || row.harf_notu === 'CB') badgeClass = 'badge-warning';
                        if (row.harf_notu === 'CC' || row.harf_notu === 'DC') badgeClass = 'badge-blue';
                        if (row.harf_notu === 'DD' || row.harf_notu === 'FD' || row.harf_notu === 'FF') badgeClass = 'badge-danger';
                        
                        return (
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <span className={`badge ${badgeClass}`}>{row.harf_notu || '-'}</span>
                          </div>
                        );
                      }
                    },
                    {
                      header: <div style={{ textAlign: 'center' }}>{t('studentDashboard.transcript.value')}</div>,
                      render: (row) => (
                        <div style={{ textAlign: 'center' }}>
                          {row.ortalama ? Number(row.ortalama).toFixed(2) : '-'}
                        </div>
                      )
                    }
                  ]}
                  data={donem.dersler}
                />
              </div>
            </div>
          );
        })
      ) : (
        <div className="card-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p>{t('studentDashboard.transcript.noTerms') || 'Henüz tamamlanmış dönem bulunmuyor'}</p>
        </div>
      )}
    </div>
  );
};

export default Transcript;
