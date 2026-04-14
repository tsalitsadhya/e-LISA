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
import { formatDate } from '../../hooks/useCleaning';
import { StatusBadge } from './StatusBadge';
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
  const { filtered, summary, filters, setFilters, loading, error, refetch } = useCleaning();

  // Checklist modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLantai, setModalLantai] = useState<LantaiKey>('lantai1');
  const [modalMachineId, setModalMachineId] = useState<string | undefined>(undefined);
  const [modalMachineName, setModalMachineName] = useState<string | undefined>(undefined);

  // View detail modal state
  const [viewRow, setViewRow] = useState<CleaningRecord | null>(null);

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFiltersChange = (f: typeof filters) => { setFilters(f); setPage(1); };

  const handleAddRecord = () => {
    setModalLantai('lantai1');
    setModalMachineId(undefined);
    setModalMachineName(undefined);
    setModalOpen(true);
  };

  const handleView = (row: CleaningRecord) => setViewRow(row);

  const handleChecklist = (row: CleaningRecord) => {
    setModalLantai(locationToLantai(row.location));
    setModalMachineId(row.machineId);
    setModalMachineName(row.machineName);
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

          {error && (
            <div style={{ margin: '12px 0', padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 12, color: '#b91c1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {error}
              <button onClick={refetch} style={{ fontSize: 11, border: 'none', background: 'none', cursor: 'pointer', color: '#b91c1c', textDecoration: 'underline' }}>Retry</button>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              Memuat data jadwal cleaning...
            </div>
          ) : (
            <>
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
        </>
      )}

      {activeTab === 'history' && <HistoryTab />}
      {activeTab === 'checklist' && <ChecklistPembersihanTab />}

      {/* View Detail Modal */}
      {viewRow && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 480, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: '#034586', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{viewRow.machineName}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>{viewRow.machineCode} · {viewRow.location}</div>
              </div>
              <button onClick={() => setViewRow(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>
            </div>
            {/* Body */}
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                {[
                  { label: 'Machine Type',     value: viewRow.machineType },
                  { label: 'Line / Sub-label', value: viewRow.subLabel || '—' },
                  { label: 'Last Cleaned',     value: formatDate(viewRow.lastCleaned) },
                  { label: 'Next Cleaning',    value: formatDate(viewRow.nextCleaning) },
                  { label: 'Checklist',        value: viewRow.checklistStatus ?? 'Belum ada' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13, color: '#1a2744', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Status</div>
                  <StatusBadge status={viewRow.status} />
                </div>
              </div>
            </div>
            {/* Footer actions */}
            <div style={{ padding: '10px 18px 16px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6' }}>
              <button
                onClick={() => setViewRow(null)}
                style={{ padding: '7px 18px', fontSize: 12, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
              >
                Tutup
              </button>
              <button
                onClick={() => { setViewRow(null); handleChecklist(viewRow); }}
                style={{ padding: '7px 18px', fontSize: 12, borderRadius: 6, border: 'none', background: '#1a7fd4', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
              >
                ✓ Isi Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Modal */}
      <CleaningRecordModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); refetch(); }}
        defaultLantai={modalLantai}
        machineId={modalMachineId}
        machineName={modalMachineName}
      />
    </div>
  );
};

export default CleaningManagement;
