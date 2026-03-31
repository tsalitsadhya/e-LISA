import React, { useMemo, useState } from 'react';
import { CHECKLIST_DUMMY, CHECKLIST_SUMMARY, type ChecklistQAStatus } from './checklistDummyData';
import { Pagination } from './Pagination';

const ITEMS_PER_PAGE = 10;

const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
  const diffLabel = diffMin < 60
    ? `${diffMin} menit yang lalu`
    : diffMin < 1440
    ? `${Math.round(diffMin / 60)} jam yang lalu`
    : `${Math.round(diffMin / 1440)} hari yang lalu`;
  return { date, time, diffLabel };
}

const STATUS_CFG: Record<ChecklistQAStatus, { label: string; color: string; bg: string; dot: string }> = {
  qa_reviewing: { label: 'QA Reviewing', color: '#1d4ed8', bg: '#dbeafe', dot: '#3b82f6' },
  approved:     { label: 'Approved',     color: '#15803d', bg: '#dcfce7', dot: '#22c55e' },
  waiting_qa:   { label: 'Waiting QA',  color: '#7c3aed', bg: '#ede9fe', dot: '#8b5cf6' },
};

const selectStyle: React.CSSProperties = {
  fontSize: 12, padding: '5px 26px 5px 10px', borderRadius: 6,
  border: '1px solid #d1d5db', background: '#ffffff', color: '#374151',
  fontFamily: 'inherit', outline: 'none', height: 32, cursor: 'pointer',
  appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center',
};

const thStyle: React.CSSProperties = {
  padding: '8px 10px', textAlign: 'left', fontSize: 12, fontWeight: 600,
  color: '#374151', borderBottom: '1px solid #e5e7eb', background: '#f9fafb',
  whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '9px 10px', fontSize: 12, color: '#374151',
  borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle',
};

export const ChecklistPembersihanTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterLoc, setFilterLoc] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return CHECKLIST_DUMMY.filter(r => {
      if (search && !r.machineName.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterLoc && r.location !== filterLoc) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      return true;
    });
  }, [search, filterLoc, filterStatus]);

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <SummaryCard label="Menunggu Swab QA" value={CHECKLIST_SUMMARY.menungguSwabQA} color="#9333ea" bg="#f5f3ff" border="#e9d5ff" />
        <SummaryCard label="Sedang di review QA" value={CHECKLIST_SUMMARY.sedangReviewQA} color="#1d4ed8" bg="#eff6ff" border="#bfdbfe" />
        <SummaryCard label="Verifikasi Selesai Hari Ini" value={CHECKLIST_SUMMARY.verifikasiSelesai} color="#15803d" bg="#f0fdf4" border="#bbf7d0" />
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#9ca3af"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </span>
          <input type="text" placeholder="Cari nama mesin..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...selectStyle, paddingLeft: 26, width: 170, cursor: 'text' }}
          />
        </div>
        <select value={filterLoc} onChange={(e) => { setFilterLoc(e.target.value); setPage(1); }} style={{ ...selectStyle, width: 130 }}>
          <option value="">All Location</option>
          <option>Lantai 1</option><option>Lantai 2</option>
          <option>Lantai 3</option><option>Lantai 4</option>
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} style={{ ...selectStyle, width: 150 }}>
          <option value="">All Status</option>
          <option value="qa_reviewing">QA Reviewing</option>
          <option value="approved">Approved</option>
          <option value="waiting_qa">Waiting QA</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '14%' }} /><col style={{ width: '13%' }} />
            <col style={{ width: '9%' }} /><col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} /><col style={{ width: '11%' }} />
            <col style={{ width: '14%' }} /><col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr>
              {['Waktu Submit','Mesin','Lantai','Operator','Produk Sebelumnya','Notif Telegram','Status','Action'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdStyle, textAlign:'center', color:'#9ca3af', padding:'2rem' }}>Tidak ada data.</td></tr>
            ) : paginated.map((r, i) => {
              const { date, time, diffLabel } = fmtDateTime(r.waktuSubmit);
              const s = STATUS_CFG[r.status];
              return (
                <tr key={r.id}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}
                  style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500, fontSize: 12 }}>{date}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{time} · {diffLabel}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{r.machineName}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{r.subLabel}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:5, fontSize:11, background:'#fef3c7', color:'#92400e', fontWeight:600 }}>
                      {r.location}
                    </span>
                  </td>
                  <td style={tdStyle}>{r.operator}</td>
                  <td style={{ ...tdStyle, color: r.produkSebelumnya ? '#374151' : '#d1d5db' }}>
                    {r.produkSebelumnya ?? '—'}
                  </td>
                  <td style={tdStyle}>
                    {r.notifTelegram
                      ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, color:'#15803d', fontSize:11, fontWeight:600, background:'#dcfce7', padding:'2px 8px', borderRadius:5 }}>✓ Terkirim</span>
                      : <span style={{ color:'#9ca3af', fontSize:11 }}>—</span>
                    }
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:5, fontSize:11, fontWeight:600, background:s.bg, color:s.color }}>
                      <span style={{ width:6,height:6,borderRadius:'50%',background:s.dot,flexShrink:0,display:'inline-block' }}/>
                      {s.label}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', gap:4 }}>
                      <button style={actionBtn('#185FA5')}>View</button>
                      <button style={actionBtn('#7c3aed')}>Swab</button>
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
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />
    </div>
  );
};

function SummaryCard({ label, value, color, bg, border }: { label: string; value: number; color: string; bg: string; border: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '12px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function actionBtn(color: string): React.CSSProperties {
  return {
    padding: '3px 10px', fontSize: 11, borderRadius: 5,
    border: `1px solid ${color}`, background: 'transparent',
    color, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  };
}
