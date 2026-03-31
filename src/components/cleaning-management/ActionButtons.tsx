import React from 'react';
import type { CleaningRecord } from '../../types/cleaning';

interface Props {
  row: CleaningRecord;
  onView: (row: CleaningRecord) => void;
  onChecklist: (row: CleaningRecord) => void;
  onReport: (row: CleaningRecord) => void;
}

const btnBase: React.CSSProperties = {
  padding: '3px 9px',
  fontSize: 11,
  borderRadius: 6,
  border: '0.5px solid',
  background: 'transparent',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
};

export const ActionButtons: React.FC<Props> = ({ row, onView, onChecklist, onReport }) => {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
      <button
        style={{ ...btnBase, borderColor: '#185FA5', color: '#185FA5' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#E6F1FB')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        onClick={() => onView(row)}
      >
        View
      </button>

      <button
        style={{ ...btnBase, borderColor: '#534AB7', color: '#534AB7' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#EEEDFE')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        onClick={() => onChecklist(row)}
      >
        ✓ Checklist
      </button>

      {!row.hasRecord ? (
        <button style={{ ...btnBase, borderColor: '#ccc', color: '#aaa', cursor: 'not-allowed' }} disabled>
          Report
        </button>
      ) : row.reportApproved ? (
        <button
          style={{ ...btnBase, borderColor: '#3B6D11', color: '#3B6D11' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#EAF3DE')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          onClick={() => onReport(row)}
        >
          Download Report
        </button>
      ) : (
        <button
          style={{ ...btnBase, borderColor: '#888', color: '#888' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          onClick={() => onReport(row)}
        >
          Draft Report
        </button>
      )}
    </div>
  );
};
