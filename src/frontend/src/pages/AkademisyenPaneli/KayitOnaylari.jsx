import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, FileText, Clock, CheckCircle, XCircle, User, BookOpen, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import academicianService from '../../shared/api/academicianService.js';

const KayitOnaylari = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState(null);

  // --- SEKME (TAB) HAFIZASI ---
  const [activeTab, setActiveTab] = useState('bekleyen');

  // --- SAHTE GEÇMİŞ (MOCK DATA) ---
  const [mockHistory, setMockHistory] = useState([
    { id: 901, ogrenci_ad: 'Ayşe Kaya', ogrenci_no: '25100011020', onay_durumu: 'onaylandi', ders_kodu: '42', ders_ad: 'merhaba', kredi: 2, ortalama: '85.00' },
    { id: 902, ogrenci_ad: 'Mehmet Demir', ogrenci_no: '25100011021', onay_durumu: 'reddedildi', ders_kodu: '32', ders_ad: 'algoritmalar', kredi: 3, ortalama: '45.00' },
  ]);

  // GERÇEK BACKEND VERİSİ (Sadece Bekleyenleri Getirir)
  const { data: requestsData, isLoading, isError } = useQuery({
    queryKey: ['academicianRequests'],
    queryFn: academicianService.getKayitIstekleri,
  });

  // --- LİSTELERİ AYIRMA İŞLEMİ ---
  const pendingRequests = requestsData || [];
  const approvedMockRequests = mockHistory.filter(r => r.onay_durumu === 'onaylandi');
  const rejectedMockRequests = mockHistory.filter(r => r.onay_durumu === 'reddedildi');

  // Aşağıda map() ile döneceğimiz asıl liste, aktif sekmeye göre değişir
  const displayedRequests = 
    activeTab === 'bekleyen' ? pendingRequests :
    activeTab === 'onaylanan' ? approvedMockRequests : rejectedMockRequests;

  const stats = {
    total: pendingRequests.length + mockHistory.length,
    pending: pendingRequests.length,
    approved: approvedMockRequests.length,
    rejected: rejectedMockRequests.length
  };

  // --- GERÇEK BACKEND İŞLEMLERİ (Bekleyenler) ---
  const onayMutation = useMutation({
    mutationFn: (enrollmentRequestId) => academicianService.onaylaKayit(enrollmentRequestId),
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['academicianRequests'] });
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.detail || 'Onaylama işleminde hata oluştu.');
    },
  });

  const reddetMutation = useMutation({
    mutationFn: (enrollmentRequestId) => academicianService.reddetKayit(enrollmentRequestId),
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['academicianRequests'] });
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.detail || 'Reddetme işleminde hata oluştu.');
    },
  });

  // --- SAHTE İŞLEMLER (Mock verinin yerini değiştirmek için) ---
  const toggleMockStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'onaylandi' ? 'reddedildi' : 'onaylandi';
    setMockHistory(prev => prev.map(item => item.id === id ? { ...item, onay_durumu: newStatus } : item));
  };

  if (isLoading) {
    return (
      <div className='dashboard-container' style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <h3>{t('common.loading', 'Yükleniyor...')}</h3>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px' }}>
          {t('common.error', 'Veriler çekilirken hata oluştu.')}
        </div>
      </div>
    );
  }

  // Aktif sekmeyi belirginleştirmek için stil hilesi
  const getCardStyle = (tabName) => ({
    cursor: 'pointer',
    border: activeTab === tabName ? '2px solid var(--primary-color, #3b82f6)' : '1px solid transparent',
    opacity: activeTab !== tabName ? 0.7 : 1,
    transition: 'all 0.2s ease',
  });

  return (
    <div className="dashboard-container">

      {/* İstatistikler (Tıklanabilir Sekmeler) */}
      <div className="summary-grid">
        <div className="summary-card" onClick={() => setActiveTab('bekleyen')} style={{ cursor: 'pointer' }}>
          <div className="icon-wrapper bg-blue-soft"><FileText size={20} color="#2563eb" /></div>
          <div className="summary-info"><span className="summary-label">{t('academician.approvals.total')}</span><h3 className="summary-value">{stats.total}</h3></div>
        </div>
        <div className="summary-card" onClick={() => setActiveTab('bekleyen')} style={getCardStyle('bekleyen')}>
          <div className="icon-wrapper bg-orange-soft"><Clock size={20} color="#ea580c" /></div>
          <div className="summary-info"><span className="summary-label">{t('academician.approvals.pending')}</span><h3 className="summary-value">{stats.pending}</h3></div>
        </div>
        <div className="summary-card" onClick={() => setActiveTab('onaylanan')} style={getCardStyle('onaylanan')}>
          <div className="icon-wrapper bg-green-soft"><CheckCircle size={20} color="#10b981" /></div>
          <div className="summary-info"><span className="summary-label">{t('academician.approvals.approved')}</span><h3 className="summary-value">{stats.approved}</h3></div>
        </div>
        <div className="summary-card" onClick={() => setActiveTab('reddedilen')} style={getCardStyle('reddedilen')}>
          <div className="icon-wrapper bg-red-soft"><XCircle size={20} color="#ef4444" /></div>
          <div className="summary-info"><span className="summary-label">{t('academician.approvals.rejected')}</span><h3 className="summary-value">{stats.rejected}</h3></div>
        </div>
      </div>

      {/* Hata Mesajı */}
      {errorMessage && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca' }}>
          {errorMessage}
        </div>
      )}

      {/* Aktif Sekme Başlığı */}
      <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: 0, color: '#334155' }}>
          {activeTab === 'bekleyen' && 'Bekleyen Onay Talepleri'}
          {activeTab === 'onaylanan' && 'Onaylanmış Öğrenciler Geçmişi'}
          {activeTab === 'reddedilen' && 'Reddedilmiş Öğrenciler Geçmişi'}
        </h3>
      </div>

      {/* Filtre */}
      <div className="filter-row">
        <div className="search-input-wrapper">
          <Search size={18} color="var(--text-muted)" />
          <input type="text" placeholder={t('academician.approvals.searchPlaceholder', 'Öğrenci Ara...')} />
        </div>
      </div>

      {/* Onay Kartları (Aktif sekmeye göre değişiyor) */}
      {displayedRequests.length > 0 ? (
        displayedRequests.map((req, index) => (
          <div key={req.id || index} className="approval-card">
            <div className="approval-card-left">
              <div className="student-header">
                <User size={18} className="text-muted" />
                <span className="student-name">{req.ogrenci_ad}</span>
                <span className="student-id">{req.ogrenci_no}</span>
                <span className={`badge-yellow ${req.onay_durumu === 'onaylandi' ? 'bg-green-soft text-green' : req.onay_durumu === 'reddedildi' ? 'bg-red-soft text-red' : ''}`}>
                  {req.onay_durumu.toUpperCase()}
                </span>
              </div>

              <div className="course-info-section" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div className="course-pill">
                  <BookOpen size={14} color="#3b82f6" />
                  <span>
                    {req.ders_kodu} - {req.ders_ad}
                  </span>
                </div>

                <div className="stat-item credits-stat">
                  <label>{t('academician.approvals.totalCredits', 'Ders Kredisi')}</label>
                  <span>{req.kredi}</span>
                </div>

                <div className="stat-item gpa-stat">
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {t('academician.approvals.gpa', 'Ortalama')}
                  </label>
                  <span className="text-green font-bold" style={{ fontSize: '14px' }}>{req.ortalama}</span>
                </div>
              </div>
            </div>

            {/* SEKMELERE GÖRE DEĞİŞEN BUTONLAR */}
            <div className="approval-actions">
              
              {/* Sekme: Bekleyenler (Gerçek Backend) */}
              {activeTab === 'bekleyen' && req.onay_durumu === 'beklemede' && (
                <>
                  <button 
                    className="btn-approve"
                    onClick={() => onayMutation.mutate(req.id)}
                    disabled={onayMutation.isPending || reddetMutation.isPending}
                  >
                    <CheckCircle size={18} /> {onayMutation.isPending ? t('common.processing') : t('academician.approvals.approveBtn', 'Onayla')}
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => reddetMutation.mutate(req.id)}
                    disabled={onayMutation.isPending || reddetMutation.isPending}
                  >
                    <XCircle size={18} /> {reddetMutation.isPending ? t('common.processing') : t('academician.approvals.rejectBtn', 'Reddet')}
                  </button>
                </>
              )}

              {/* Sekme: Onaylananlar (Fikrini değiştirip reddet) */}
              {activeTab === 'onaylanan' && (
                <button 
                  className="btn-reject" 
                  onClick={() => toggleMockStatus(req.id, req.onay_durumu)} 
                  style={{ backgroundColor: '#fff0f0', color: '#ef4444', border: '1px solid #fecaca' }}
                >
                  <RefreshCw size={18} /> İptal Et ve Reddet
                </button>
              )}

              {/* Sekme: Reddedilenler (Fikrini değiştirip onayla) */}
              {activeTab === 'reddedilen' && (
                <button 
                  className="btn-approve" 
                  onClick={() => toggleMockStatus(req.id, req.onay_durumu)} 
                  style={{ backgroundColor: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0' }}
                >
                  <RefreshCw size={18} /> Fikrimi Değiştir, Onayla
                </button>
              )}

            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          {activeTab === 'bekleyen' && t('academician.approvals.noRequests', 'Henüz onay bekleyen bir kayıt talebi bulunmuyor.')}
          {activeTab === 'onaylanan' && 'Onaylanmış öğrenci bulunmuyor.'}
          {activeTab === 'reddedilen' && 'Reddedilmiş öğrenci bulunmuyor.'}
        </div>
      )}
    </div>
  );
};

export default KayitOnaylari;