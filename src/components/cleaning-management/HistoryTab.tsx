import React, { useCallback, useEffect, useState } from 'react';
import api from '../../lib/api';
import { Pagination } from './Pagination';

const ITEMS_PER_PAGE = 10;

const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

interface HistoryRecord {
  id: string;
  machine_name: string;
  machine_type: string;
  area_name: string;
  operator_name: string;
  cleaning_date: string;
  cleaning_type: string;
  produk_sebelumnya: string;
  status: string;
}

const selectStyle: React.CSSProperties = {
  fontSize: 12, padding: '5px 26px 5px 10px', borderRadius: 6,
  border: '1px solid #d1d5db', background: '#ffffff', color: '#374151',
  fontFamily: 'inherit', outline: 'none', height: 32, cursor: 'pointer',
  appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center',
};
const thStyle: React.CSSProperties = {
  padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600,
  color: '#374151', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '9px 12px', fontSize: 12, color: '#374151',
  borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle',
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  approved:   { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
  rejected:   { bg: '#fee2e2', color: '#b91c1c', label: 'Rejected' },
  waiting_qa: { bg: '#fef9c3', color: '#854d0e', label: 'Waiting QA' },
  submitted:  { bg: '#dbeafe', color: '#1d4ed8', label: 'Submitted' },
  draft:      { bg: '#f3f4f6', color: '#6b7280', label: 'Draft' },
};

export const HistoryTab: React.FC = () => {
  const [records,  setRecords]  = useState<HistoryRecord[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth,  setFilterMonth]  = useState('');
  const [filterArea,   setFilterArea]   = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, per_page: ITEMS_PER_PAGE };
      if (search)       params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterMonth)  params.month  = filterMonth;
      if (filterArea)   params.area_id = filterArea;

      const res = await api.get('/cleaning/records', { params });
      setRecords(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      setError('Gagal memuat history cleaning.');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterMonth, filterArea]);

  useEffect(() => {
    const t = setTimeout(fetchRecords, 300);
    return () => clearTimeout(t);
  }, [fetchRecords]);

  const resetPage = () => setPage(1);

  return (
    <div>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#9ca3af"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </span>
          <input
            type="text" placeholder="Cari nama mesin..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            style={{ ...selectStyle, paddingLeft: 26, width: 180, cursor: 'text' }}
          />
        </div>

        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); resetPage(); }} style={{ ...selectStyle, width: 140 }}>
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="waiting_qa">Waiting QA</option>
          <option value="submitted">Submitted</option>
        </select>

        <select value={filterMonth} onChange={e => { setFilterMonth(e.target.value); resetPage(); }} style={{ ...selectStyle, width: 110 }}>
          <option value="">Semua Bulan</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i+1} value={String(i+1).padStart(2,'0')}>{months[i]}</option>
          ))}
        </select>

        {(search || filterStatus || filterMonth) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterMonth(''); setFilterArea(''); resetPage(); }}
            style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#6b7280', fontFamily: 'inherit' }}>
            Reset
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b7280' }}>
          {loading ? 'Memuat...' : `${total} record`}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 12, color: '#b91c1c', display: 'flex', justifyContent: 'space-between' }}>
          {error}
          <button onClick={fetchRecords} style={{ fontSize: 11, border: 'none', background: 'none', cursor: 'pointer', color: '#b91c1c', textDecoration: 'underline' }}>Retry</button>
        </div>
      )}

      {/* Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '13%' }} /><col style={{ width: '18%' }} />
            <col style={{ width: '11%' }} /><col style={{ width: '14%' }} />
            <col style={{ width: '14%' }} /><col style={{ width: '12%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead>
            <tr>
              {['Tanggal','Mesin','Area','Operator','Produk Sebelumnya','Status','Aksi'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: '2.5rem' }}>Memuat data...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: '2.5rem' }}>Tidak ada data.</td></tr>
            ) : records.map((r, i) => {
              const st = STATUS_STYLE[r.status] ?? { bg: '#f3f4f6', color: '#6b7280', label: r.status };
              return (
                <tr key={r.id}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}
                  style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={tdStyle}>{fmtDate(r.cleaning_date)}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{r.machine_name}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{r.cleaning_type || '—'}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, fontSize: 11, background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                      {r.area_name}
                    </span>
                  </td>
                  <td style={tdStyle}>{r.operator_name}</td>
                  <td style={{ ...tdStyle, color: r.produk_sebelumnya ? '#374151' : '#d1d5db' }}>
                    {r.produk_sebelumnya || '—'}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: st.color }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.color, display: 'inline-block', flexShrink: 0 }} />
                      {st.label}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={btnStyle('#185FA5')}
                        onMouseEnter={e => (e.currentTarget.style.background = '#E6F1FB')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        View
                      </button>
                      {r.status === 'approved' && (
                        <button style={btnStyle('#15803d')}
                          onMouseEnter={e => (e.currentTarget.style.background = '#dcfce7')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          ⬇ Report
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalItems={total}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />
    </div>
  );
};

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '3px 10px', fontSize: 11, borderRadius: 5,
    border: `1px solid ${color}`, background: 'transparent',
    color, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
    transition: 'background 0.15s',
  };
}
