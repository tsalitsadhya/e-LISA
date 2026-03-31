import React, { useState } from 'react';
import type { CleaningRecord } from '../../types/cleaning';
import { useCleaning } from '../../hooks/useCleaning';
import { SummaryCards } from './SummaryCards';
import { FilterBar } from './FilterBar';
import { CleaningTable } from './CleaningTable';
import { HistoryTab } from './HistoryTab';
import { ChecklistPembersihanTab } from './ChecklistPembersihanTab';
import { Pagination } from './Pagination';
import { CleaningRecordModal } from './CleaningRecordModal';
import type { LantaiKey } from './machineData';

type Tab = 'schedule' | 'history' | 'checklist';
const ITEMS_PER_PAGE = 10;

const TABS: { key: Tab; label: string }[] = [
  { key: 'schedule', label: 'Schedule' },
  { key: 'history', label: 'History' },
  { key: 'checklist', label: 'Checklist pembersihan' },
];

function locationToLantai(location: string): LantaiKey {
  if (location === 'Lantai 2') return 'lantai2';
  if (location === 'Lantai 3') return 'lantai3';
  if (location === 'Lantai 4') return 'lantai4';
  return 'lantai1';
}

export const CleaningManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [page, setPage] = useState(1);
  const { filtered, summary, filters, setFilters } = useCleaning();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLantai, setModalLantai] = useState<LantaiKey>('lantai1');

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFiltersChange = (f: typeof filters) => { setFilters(f); setPage(1); };

  const handleAddRecord = () => {
    setModalLantai('lantai1');
    setModalOpen(true);
  };

  const handleView = (row: CleaningRecord) => console.log('view', row.id);

  const handleChecklist = (row: CleaningRecord) => {
    setModalLantai(locationToLantai(row.location));
    setModalOpen(true);
  };

  const handleReport = (row: CleaningRecord) => console.log('report', row.id);

  return (
    <div style={{ padding: '16px 24px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            style={{
              padding: '10px 18px', fontSize: 14, border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: activeTab === tab.key ? '#1a7fd4' : '#6b7280',
              fontWeight: activeTab === tab.key ? 700 : 400,
              borderBottom: activeTab === tab.key ? '2.5px solid #1a7fd4' : '2.5px solid transparent',
              marginBottom: -2, fontFamily: 'inherit', transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && (
        <>
          <SummaryCards summary={summary} />
          <FilterBar filters={filters} onChange={handleFiltersChange} onAddRecord={handleAddRecord} />
          <CleaningTable
            data={paginated}
            totalCount={summary.total}
            onView={handleView}
            onChecklist={handleChecklist}
            onReport={handleReport}
          />
          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPage}
          />
        </>
      )}

      {activeTab === 'history' && <HistoryTab />}
      {activeTab === 'checklist' && <ChecklistPembersihanTab />}

      {/* Modal */}
      <CleaningRecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultLantai={modalLantai}
      />
    </div>
  );
};

export default CleaningManagement;
