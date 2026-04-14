import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CleaningFilters, CleaningRecord, CleaningSummary } from '../types/cleaning';
import api from '../lib/api';

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

// Map backend CleaningSchedule → frontend CleaningRecord
function mapSchedule(s: any): CleaningRecord {
  const statusMap: Record<string, CleaningRecord['status']> = {
    safe:        'safe',
    due:         'due',
    overdue:     'overdue',
    waiting_qa:  'qa',
    inprogress:  'inprogress',
  };

  return {
    id:              s.id,
    machineId:       s.machine_id,
    machineName:     s.machine_name,
    machineType:     s.machine_type,
    machineCode:     s.machine_code ?? '',
    subLabel:        s.line_name ?? s.machine_code ?? '',
    location:        `Lantai ${s.floor}` as CleaningRecord['location'],
    floor:           s.floor,
    lastCleaned:     s.last_cleaned   ?? null,
    nextCleaning:    s.next_cleaning  ?? null,
    lastRecordId:    s.last_record_id ?? null,
    checklistStatus: s.checklist_status === 'approved' ? 'approved'
                   : s.checklist_status === 'pending'  ? 'pending'
                   : null,
    status:          statusMap[s.status] ?? 'safe',
    hasRecord:       !!s.last_record_id,
    reportApproved:  s.checklist_status === 'approved',
  };
}

export function useCleaning() {
  const [rawData,  setRawData]  = useState<CleaningRecord[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filters,  setFilters]  = useState<CleaningFilters>({
    search: '', machineType: '', location: '', status: '', dateFrom: '', dateTo: '',
  });

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/cleaning/schedule');
      const schedules: CleaningRecord[] = (res.data.data ?? []).map(mapSchedule);
      setRawData(schedules);
    } catch {
      setError('Gagal memuat jadwal cleaning.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const filtered = useMemo(() => rawData.filter((r) => {
    if (
      filters.search &&
      !r.machineName.toLowerCase().includes(filters.search.toLowerCase()) &&
      !r.subLabel.toLowerCase().includes(filters.search.toLowerCase())
    ) return false;
    if (filters.machineType && r.machineType !== filters.machineType) return false;
    if (filters.location   && r.location    !== filters.location)    return false;
    if (filters.status     && r.status      !== filters.status)      return false;
    if (filters.dateFrom && r.nextCleaning) {
      if (new Date(r.nextCleaning) < new Date(filters.dateFrom)) return false;
    }
    if (filters.dateTo && r.nextCleaning) {
      if (new Date(r.nextCleaning) > new Date(filters.dateTo)) return false;
    }
    return true;
  }), [rawData, filters]);

  const summary: CleaningSummary = useMemo(() => ({
    total:     rawData.length,
    safe:      rawData.filter(r => r.status === 'safe').length,
    due:       rawData.filter(r => r.status === 'due').length,
    overdue:   rawData.filter(r => r.status === 'overdue').length,
    waitingQA: rawData.filter(r => r.status === 'qa').length,
  }), [rawData]);

  return { filtered, summary, filters, setFilters, loading, error, refetch: fetchSchedule };
}
