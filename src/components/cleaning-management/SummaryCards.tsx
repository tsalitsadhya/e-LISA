import React from 'react';
import type { CleaningSummary } from '../../types/cleaning';

interface Props {
  summary: CleaningSummary;
}

interface CardConfig {
  key: keyof CleaningSummary;
  label: string;
  sublabel: string;
  bg: string;
  border: string;
  numColor: string;
  labelColor: string;
}

const CARDS: CardConfig[] = [
  {
    key: 'total',
    label: 'Total mesin',
    sublabel: '',
    bg: 'var(--color-background-secondary)',
    border: 'var(--color-border-tertiary)',
    numColor: 'var(--color-text-primary)',
    labelColor: 'var(--color-text-secondary)',
  },
  {
    key: 'safe',
    label: 'Safe',
    sublabel: 'belum waktunya cleaning',
    bg: '#EAF3DE',
    border: '#C0DD97',
    numColor: '#27500A',
    labelColor: '#3B6D11',
  },
  {
    key: 'due',
    label: 'Due Soon',
    sublabel: 'mendekati jadwal cleaning',
    bg: '#FAEEDA',
    border: '#FAC775',
    numColor: '#633806',
    labelColor: '#854F0B',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    sublabel: 'sudah lewat jadwal cleaning',
    bg: '#FCEBEB',
    border: '#F7C1C1',
    numColor: '#791F1F',
    labelColor: '#A32D2D',
  },
  {
    key: 'waitingQA',
    label: 'Waiting QA Verification',
    sublabel: 'menunggu hasil verifikasi QA',
    bg: '#EEEDFE',
    border: '#CECBF6',
    numColor: '#3C3489',
    labelColor: '#534AB7',
  },
];

export const SummaryCards: React.FC<Props> = ({ summary }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10, marginBottom: 14 }}>
      {CARDS.map((card) => (
        <div
          key={card.key}
          style={{
            background: card.bg,
            border: `0.5px solid ${card.border}`,
            borderRadius: 8,
            padding: '10px 12px',
          }}
        >
          <div style={{ fontSize: 10, color: card.labelColor, marginBottom: 2, lineHeight: 1.4 }}>
            {card.label}
            {card.sublabel && <span style={{ opacity: 0.8 }}> — {card.sublabel}</span>}
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, color: card.numColor }}>
            {summary[card.key]}
          </div>
        </div>
      ))}
    </div>
  );
};
