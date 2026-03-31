import React from 'react';
import type { CleaningStatus } from '../../types/cleaning';

interface StatusConfig {
  label: string;
  dotColor: string;
  textColor: string;
}

const STATUS_CONFIG: Record<CleaningStatus, StatusConfig> = {
  safe: { label: 'Safe', dotColor: '#3B6D11', textColor: '#27500A' },
  due: { label: 'Due Soon', dotColor: '#854F0B', textColor: '#633806' },
  overdue: { label: 'Overdue', dotColor: '#A32D2D', textColor: '#791F1F' },
  qa: { label: 'Waiting QA', dotColor: '#185FA5', textColor: '#0C447C' },
  changeover: { label: 'Changeover Required', dotColor: '#534AB7', textColor: '#3C3489' },
  inprogress: { label: 'Cleaning In Progress', dotColor: '#0F6E56', textColor: '#085041' },
};

interface Props {
  status: CleaningStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: cfg.textColor, whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dotColor, flexShrink: 0, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
};
