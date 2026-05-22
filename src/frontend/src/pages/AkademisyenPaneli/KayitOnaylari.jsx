import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, FileText, Clock, CheckCircle, XCircle, User, BookOpen, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import academicianService from '../../shared/api/academicianService.js';

const KayitOnaylari = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState(null);

  // --- SEKME (TAB) HAFIZASI ---
  const [activeTab, setActiveTab] = useState('bekleyen');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- SEÇİLİ ÖĞRENCİLER (Onaylananlar sekmesi için) ---
  const [selectedStudents, setSelectedStudents] = useState([]);

  // GERÇEK BACKEND VERİSİ (Tüm kayıtları getirir)
  const { data: requestsData, isLoading, isError } = useQuery({
    queryKey: ['academicianRequests'],
    queryFn: academicianService.getKayitIstekleri,
  });

  // --- LİSTELERİ AYIRMA İŞLEMİ ---
  const allRequests = requestsData || [];
  const pendingRequests = allRequests.filter(r => r.onay_durumu === 'beklemede');
  const approvedRequests = allRequests.filter(r => r.onay_durumu === 'onaylandi');
  const rejectedRequests = allRequests.filter(r => r.onay_durumu === 'reddedildi');

  // Aşağıda map() ile döneceğimiz asıl liste, aktif sekmeye göre değişir
  const baseRequests =
    activeTab === 'bekleyen' ? pendingRequests :
    activeTab === 'onaylanan' ? approvedRequests : rejectedRequests;

  // Arama filtresi uygula
  const displayedRequests = searchTerm.trim()
    ? baseRequests.filter(req => {
        const q = searchTerm.toLowerCase();
        return (
          req.ogrenci_ad?.toLowerCase().includes(q) ||
          req.ogrenci_no?.toLowerCase().includes(q) ||
          req.ders_ad?.toLowerCase().includes(q) ||
          req.ders_kodu?.toLowerCase().includes(q)
        );
      })
    : baseRequests;

  const stats = {
    total: allRequests.length,
    pending: pendingRequests.length,
    approved: approvedRequests.length,
    rejected: rejectedRequests.length
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

  // --- TOPLU REDDETME İŞLEMİ ---
  const topluReddetMutation = useMutation({
    mutationFn: async (kayitIdleri) => {
      // Her bir kayıt için reddetme işlemi yap
      const promises = kayitIdleri.map(id => academicianService.reddetKayit(id));
      return Promise.all(promises);
    },
    onSuccess: () => {
      setErrorMessage(null);
      setSelectedStudents([]); // Seçimleri temizle
      queryClient.invalidateQueries({ queryKey: ['academicianRequests'] });
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.detail || 'Toplu reddetme işleminde hata oluştu.');
    },
  });

  // --- TOPLU ONAYLAMA İŞLEMİ ---
  const topluOnayMutation = useMutation({
    mutationFn: async (kayitIdleri) => {
      // Her bir kayıt için onaylama işlemi yap
      const promises = kayitIdleri.map(id => academicianService.onaylaKayit(id));
      return Promise.all(promises);
    },
    onSuccess: () => {
      setErrorMessage(null);
      setSelectedStudents([]); // Seçimleri temizle
      queryClient.invalidateQueries({ queryKey: ['academicianRequests'] });
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.detail || 'Toplu onaylama işleminde hata oluştu.');
    },
  });

  // Checkbox toggle fonksiyonu
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Tümünü seç/kaldır
  const toggleSelectAll = () => {
    if (selectedStudents.length === displayedRequests.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(displayedRequests.map(req => req.id));
    }
  };

  // Toplu reddetme işlemi
  const handleBulkReject = () => {
    if (selectedStudents.length === 0) return;
    if (window.confirm(t('academician.approvals.bulkRejectConfirm', { count: selectedStudents.length }))) {
      topluReddetMutation.mutate(selectedStudents);
    }
  };

  // Toplu onaylama işlemi
  const handleBulkApprove = () => {
    if (selectedStudents.length === 0) return;
    if (window.confirm(t('academician.approvals.bulkApproveConfirm', { count: selectedStudents.length }))) {
      topluOnayMutation.mutate(selectedStudents);
    }
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
          {activeTab === 'bekleyen' && t('academician.approvals.pendingTitle', 'Bekleyen Onay Talepleri')}
          {activeTab === 'onaylanan' && t('academician.approvals.approvedTitle', 'Onaylanmış Öğrenciler Geçmişi')}
          {activeTab === 'reddedilen' && t('academician.approvals.rejectedTitle', 'Reddedilmiş Öğrenciler Geçmişi')}
        </h3>
      </div>

      {/* Filtre ve Toplu İşlem Butonları */}
      <div className="filter-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="search-input-wrapper">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder={t('academician.approvals.searchPlaceholder', 'Öğrenci veya ders ara...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Onaylananlar sekmesinde toplu işlem butonları */}
        {activeTab === 'onaylanan' && displayedRequests.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={toggleSelectAll}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text-main)',
                transition: 'all 0.2s'
              }}
            >
              {selectedStudents.length === displayedRequests.length 
                ? t('academician.approvals.deselectAll', 'Seçimi Kaldır') 
                : t('academician.approvals.selectAll', 'Tümünü Seç')}
            </button>
            
            {selectedStudents.length > 0 && (
              <button
                onClick={handleBulkReject}
                disabled={topluReddetMutation.isPending}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  cursor: topluReddetMutation.isPending ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  color: '#dc2626',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  opacity: topluReddetMutation.isPending ? 0.6 : 1
                }}
              >
                <Trash2 size={16} />
                {topluReddetMutation.isPending 
                  ? t('common.processing', 'İşlem yapılıyor...') 
                  : t('academician.approvals.rejectSelected', { count: selectedStudents.length })}
              </button>
            )}
          </div>
        )}

        {/* Reddedilenler sekmesinde toplu işlem butonları */}
        {activeTab === 'reddedilen' && displayedRequests.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={toggleSelectAll}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text-main)',
                transition: 'all 0.2s'
              }}
            >
              {selectedStudents.length === displayedRequests.length 
                ? t('academician.approvals.deselectAll', 'Seçimi Kaldır') 
                : t('academician.approvals.selectAll', 'Tümünü Seç')}
            </button>
            
            {selectedStudents.length > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={topluOnayMutation.isPending}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: '6px',
                  cursor: topluOnayMutation.isPending ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  color: '#16a34a',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  opacity: topluOnayMutation.isPending ? 0.6 : 1
                }}
              >
                <CheckCircle size={16} />
                {topluOnayMutation.isPending 
                  ? t('common.processing', 'İşlem yapılıyor...') 
                  : t('academician.approvals.approveSelected', { count: selectedStudents.length })}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Onay Kartları (Aktif sekmeye göre değişiyor) */}
      {displayedRequests.length > 0 ? (
        displayedRequests.map((req, index) => (
          <div key={req.id || index} className="approval-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            
            {/* Checkbox (Onaylananlar ve Reddedilenler sekmelerinde) */}
            {(activeTab === 'onaylanan' || activeTab === 'reddedilen') && (
              <div style={{ paddingTop: '20px' }}>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(req.id)}
                  onChange={() => toggleStudentSelection(req.id)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6'
                  }}
                />
              </div>
            )}
            
            <div className="approval-card-left" style={{ flex: 1 }}>
              <div className="student-header">
                <User size={18} className="text-muted" />
                <span className="student-name">{req.ogrenci_ad}</span>
                <span className="student-id">{req.ogrenci_no}</span>
                <span className={`badge-yellow ${req.onay_durumu === 'onaylandi' ? 'bg-green-soft text-green' : req.onay_durumu === 'reddedildi' ? 'bg-red-soft text-red' : ''}`}>
                  {t(`academician.approvals.${req.onay_durumu === 'beklemede' ? 'pending' : req.onay_durumu === 'onaylandi' ? 'approved' : 'rejected'}`).toUpperCase()}
                </span>
              </div>

              <div className="course-info-section" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <div className="course-pill">
                  <BookOpen size={14} color="#3b82f6" />
                  <span>
                    {req.ders_kodu} - {t('data.courses.' + req.ders_kodu, req.ders_ad)}
                  </span>
                </div>

                <div className="stat-item credits-stat">
                  <label>{t('academician.approvals.courseCredit', 'Ders Kredisi')}</label>
                  <span>{req.kredi}</span>
                </div>

                <div className="stat-item gpa-stat">
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {t('academician.approvals.gpa', 'GNO')}
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

              {/* Sekme: Onaylananlar - Sadece görüntüleme */}
              {activeTab === 'onaylanan' && (
                <div style={{ padding: '8px 16px', backgroundColor: '#f0fdf4', color: '#10b981', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                  ✓ {t('academician.approvals.approved', 'Onaylandı')}
                </div>
              )}

              {/* Sekme: Reddedilenler - Sadece görüntüleme */}
              {activeTab === 'reddedilen' && (
                <div style={{ padding: '8px 16px', backgroundColor: '#fff0f0', color: '#ef4444', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                  ✗ {t('academician.approvals.rejected', 'Reddedildi')}
                </div>
              )}

            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          {activeTab === 'bekleyen' && t('academician.approvals.noRequests', 'Henüz onay bekleyen bir kayıt talebi bulunmuyor.')}
          {activeTab === 'onaylanan' && t('academician.approvals.noApproved', 'Onaylanmış öğrenci bulunmuyor.')}
          {activeTab === 'reddedilen' && t('academician.approvals.noRejected', 'Reddedilmiş öğrenci bulunmuyor.')}
        </div>
      )}
    </div>
  );
};

export default KayitOnaylari;