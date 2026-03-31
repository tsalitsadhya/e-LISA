import { useMemo, useState } from 'react';
import type { CleaningFilters, CleaningRecord, CleaningSummary } from '../types/cleaning';
import { CLEANING_DUMMY_DATA } from './cleaningDummyData';

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function useCleaning() {
  const [filters, setFilters] = useState<CleaningFilters>({
    search: '',
    machineType: '',
    location: '',
    status: '',
  });

  // NOTE: swap CLEANING_DUMMY_DATA with API call when backend is ready
  const allData: CleaningRecord[] = CLEANING_DUMMY_DATA;

  const filtered = useMemo(() => {
    return allData.filter((r) => {
      if (
        filters.search &&
        !r.machineName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !r.subLabel.toLowerCase().includes(filters.search.toLowerCase())
      ) return false;
      if (filters.machineType && r.machineType !== filters.machineType) return false;
      if (filters.location && r.location !== filters.location) return false;
      if (filters.status && r.status !== filters.status) return false;
      return true;
    });
  }, [allData, filters]);

  const summary: CleaningSummary = useMemo(() => ({
    total: allData.length,
    safe: allData.filter((r) => r.status === 'safe').length,
    due: allData.filter((r) => r.status === 'due').length,
    overdue: allData.filter((r) => r.status === 'overdue').length,
    waitingQA: allData.filter((r) => r.status === 'qa').length,
  }), [allData]);

  return { filtered, summary, filters, setFilters };
}
