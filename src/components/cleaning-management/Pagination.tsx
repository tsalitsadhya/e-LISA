import React from 'react';

interface Props {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<Props> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btnStyle = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    minWidth: 32, height: 32,
    padding: '0 8px',
    borderRadius: 6,
    border: active ? 'none' : '1px solid #d1d5db',
    background: active ? '#1a2744' : disabled ? '#f9fafb' : '#ffffff',
    color: active ? '#ffffff' : disabled ? '#d1d5db' : '#374151',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 13,
    fontFamily: 'inherit',
    fontWeight: active ? 600 : 400,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  });

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#6b7280' }}>
        Menampilkan {start}–{end} dari {totalItems} data
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* Prev */}
        <button
          style={btnStyle(false, currentPage === 1)}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>

        {pages.map((p, i) =>
          p === '...'
            ? <span key={`dots-${i}`} style={{ padding: '0 4px', color: '#9ca3af', fontSize: 13 }}>...</span>
            : <button
                key={p}
                style={btnStyle(p === currentPage)}
                onClick={() => onPageChange(p as number)}
                onMouseEnter={(e) => { if (p !== currentPage) e.currentTarget.style.background = '#f3f4f6'; }}
                onMouseLeave={(e) => { if (p !== currentPage) e.currentTarget.style.background = '#ffffff'; }}
              >
                {p}
              </button>
        )}

        {/* Next */}
        <button
          style={btnStyle(false, currentPage === totalPages)}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
    </div>
  );
};
