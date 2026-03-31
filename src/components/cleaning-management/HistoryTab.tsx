import React, { useMemo, useState } from 'react';
import { HISTORY_DUMMY } from './historyDummyData';
import { Pagination } from './Pagination';

const ITEMS_PER_PAGE = 10;

const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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
  color: '#374151', borderBottom: '1px solid #e5e7eb', background: '#f9fafb',
  whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '9px 12px', fontSize: 12, color: '#374151',
  borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle',
};

export const HistoryTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterLoc, setFilterLoc] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return HISTORY_DUMMY.filter(r => {
      if (search && !r.machineName.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterLoc && r.location !== filterLoc) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterMonth) {
        const d = new Date(r.tanggal);
        if (String(d.getMonth() + 1).padStart(2, '0') !== filterMonth) return false;
      }
      return true;
    });
  }, [search, filterLoc, filterStatus, filterMonth]);

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilter = () => setPage(1);

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
            onChange={(e) => { setSearch(e.target.value); handleFilter(); }}
            style={{ ...selectStyle, paddingLeft: 26, width: 170, cursor: 'text' }}
          />
        </div>

        <select value={filterLoc} onChange={(e) => { setFilterLoc(e.target.value); handleFilter(); }} style={{ ...selectStyle, width: 130 }}>
          <option value="">All Location</option>
          <option>Lantai 1</option><option>Lantai 2</option>
          <option>Lantai 3</option><option>Lantai 4</option>
        </select>

        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); handleFilter(); }} style={{ ...selectStyle, width: 120 }}>
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); handleFilter(); }} style={{ ...selectStyle, width: 110 }}>
          <option value="">Month</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i+1} value={String(i+1).padStart(2,'0')}>{months[i]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '13%' }} /><col style={{ width: '14%' }} />
            <col style={{ width: '9%' }} /><col style={{ width: '13%' }} />
            <col style={{ width: '13%' }} /><col style={{ width: '12%' }} />
            <col style={{ width: '26%' }} />
          </colgroup>
          <thead>
            <tr>
              {['Tanggal','Mesin','Lantai','Operator','Produk Sebelumnya','Status','Action'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Tidak ada data.</td></tr>
            ) : paginated.map((r, i) => (
              <tr key={r.id}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}
                style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}
              >
                <td style={tdStyle}>{fmtDate(r.tanggal)}</td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{r.machineName}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{r.subLabel}</div>
                </td>
                <td style={tdStyle}>
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, fontSize: 11, background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                    {r.location}
                  </span>
                </td>
                <td style={tdStyle}>{r.operator}</td>
                <td style={{ ...tdStyle, color: r.produkSebelumnya ? '#374151' : '#d1d5db' }}>
                  {r.produkSebelumnya ?? '—'}
                </td>
                <td style={tdStyle}>
                  {r.status === 'approved'
                    ? <span style={{ display:'inline-flex', alignItems:'center', gap:5, color:'#15803d', fontWeight:600, fontSize:12 }}><span style={{ width:8,height:8,borderRadius:'50%',background:'#22c55e',display:'inline-block' }}/>Approved</span>
                    : <span style={{ display:'inline-flex', alignItems:'center', gap:5, color:'#b91c1c', fontWeight:600, fontSize:12 }}><span style={{ width:8,height:8,borderRadius:'50%',background:'#ef4444',display:'inline-block' }}/>Rejected</span>
                  }
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={actionBtn('#185FA5','#E6F1FB')}>View</button>
                    {r.hasReport
                      ? r.status === 'approved'
                        ? <button style={actionBtn('#15803d','#dcfce7')}>⬇ Download Report</button>
                        : <button style={actionBtn('#6b7280','#f3f4f6')}>⬇ Draft Report</button>
                      : <button style={{ ...actionBtn('#d1d5db','#f9fafb'), cursor:'not-allowed' }} disabled>Report</button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />
    </div>
  );
};

function actionBtn(color: string, _hoverBg: string): React.CSSProperties {
  return {
    padding: '3px 10px', fontSize: 11, borderRadius: 5,
    border: `1px solid ${color}`, background: 'transparent',
    color, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  };
}
