import React from 'react';
import type { CleaningRecord } from '../../types/cleaning';
import { StatusBadge } from './StatusBadge';
import { ChecklistCell } from './ChecklistCell';
import { ActionButtons } from './ActionButtons';
import { formatDate, daysUntil } from '../../hooks/useCleaning';

interface Props {
  data: CleaningRecord[];
  totalCount: number;
  onView: (row: CleaningRecord) => void;
  onChecklist: (row: CleaningRecord) => void;
  onReport: (row: CleaningRecord) => void;
}

const thStyle: React.CSSProperties = {
  background: 'var(--color-background-secondary)',
  padding: '7px 10px',
  textAlign: 'left',
  fontWeight: 500,
  fontSize: 11,
  color: 'var(--color-text-secondary)',
  borderBottom: '0.5px solid var(--color-border-tertiary)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '0.5px solid var(--color-border-tertiary)',
  verticalAlign: 'middle',
  fontSize: 12,
  color: 'var(--color-text-primary)',
};

function NextDateCell({ iso }: { iso: string | null }) {
  const days = daysUntil(iso);
  if (iso === null || days === null) return <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>;
  const color = days < 0 ? '#A32D2D' : days <= 5 ? '#854F0B' : 'var(--color-text-primary)';
  return <span style={{ color, fontWeight: days <= 5 ? 500 : 400 }}>{formatDate(iso)}</span>;
}

export const CleaningTable: React.FC<Props> = ({ data, totalCount, onView, onChecklist, onReport }) => {
  return (
    <>
      <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, overflow: 'hidden', background: 'var(--color-background-primary)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '22%' }} />
          </colgroup>
          <thead>
            <tr>
              {['Mesin', 'Lokasi', 'Last cleaning', 'Next Cleaning Date', 'Checklist', 'Status', 'Action'].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
                  Tidak ada data yang sesuai filter.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id}
                  style={{ background: i % 2 === 0 ? 'var(--color-background-primary)' : undefined }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? 'var(--color-background-primary)' : '')}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500, fontSize: 12 }}>{row.machineName}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 1 }}>{row.subLabel}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 6, fontSize: 11, background: '#FAEEDA', color: '#633806', fontWeight: 500 }}>
                      {row.location}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: row.status === 'overdue' ? '#A32D2D' : 'var(--color-text-primary)' }}>
                    {formatDate(row.lastCleaned)}
                  </td>
                  <td style={tdStyle}><NextDateCell iso={row.nextCleaning} /></td>
                  <td style={tdStyle}><ChecklistCell status={row.checklistStatus} /></td>
                  <td style={tdStyle}><StatusBadge status={row.status} /></td>
                  <td style={tdStyle}>
                    <ActionButtons row={row} onView={onView} onChecklist={onChecklist} onReport={onReport} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        Menampilkan {data.length} dari {totalCount} mesin
      </div>
    </>
  );
};
