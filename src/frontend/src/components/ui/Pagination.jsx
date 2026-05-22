import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ currentPage, totalCount, pageSize, onPageChange }) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  // Sayfa numarası butonlarını oluştur
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Az sayfa varsa hepsini göster
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // İlk sayfa her zaman
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Baştaysa daha fazla sağa göster
      if (currentPage <= 3) {
        start = 2;
        end = Math.min(totalPages - 1, maxVisible - 1);
      }
      // Sondaysa daha fazla sola göster
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 2);
        end = totalPages - 1;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      // Son sayfa her zaman
      pages.push(totalPages);
    }

    return pages;
  };

  const buttonBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '7px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minWidth: '36px',
  };

  const disabledStyle = {
    opacity: 0.45,
    cursor: 'not-allowed',
    color: 'var(--text-muted)',
  };

  const activeStyle = {
    backgroundColor: 'var(--primary-blue)',
    color: '#fff',
    borderColor: 'var(--primary-blue)',
    fontWeight: '700',
  };

  const ellipsisStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 4px',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'default',
    userSelect: 'none',
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '6px',
      marginTop: '20px',
      padding: '10px 0',
      flexWrap: 'wrap',
    }}>
      {/* Önceki butonu */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          ...buttonBase,
          ...(currentPage === 1 ? disabledStyle : {}),
        }}
      >
        <ChevronLeft size={16} />
        {t('common.prev', 'Önceki')}
      </button>

      {/* Sayfa numaraları */}
      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} style={ellipsisStyle}>…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              ...buttonBase,
              ...(page === currentPage ? activeStyle : {}),
            }}
          >
            {page}
          </button>
        )
      )}

      {/* Sonraki butonu */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          ...buttonBase,
          ...(currentPage === totalPages ? disabledStyle : {}),
        }}
      >
        {t('common.next', 'Sonraki')}
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
