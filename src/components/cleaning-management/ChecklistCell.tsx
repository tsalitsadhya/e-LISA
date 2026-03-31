import React from 'react';
import type { ChecklistStatus } from '../../types/cleaning';

interface Props {
  status: ChecklistStatus;
}

export const ChecklistCell: React.FC<Props> = ({ status }) => {
  if (status === 'approved') {
    return (
      <span style={{ color: '#3B6D11', fontSize: 12, fontWeight: 500 }}>
        ✓ Approved
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '2px 8px', borderRadius: 6, fontSize: 11,
        background: '#FAEEDA', color: '#633806', fontWeight: 500,
      }}>
        Pending QA
      </span>
    );
  }
  return <span style={{ color: 'var(--color-text-tertiary, #aaa)', fontSize: 12 }}>Belum ada</span>;
};
