export type ChecklistQAStatus = 'qa_reviewing' | 'approved' | 'waiting_qa';

export interface ChecklistRecord {
  id: string;
  waktuSubmit: string;   // ISO datetime
  machineName: string;
  subLabel: string;
  location: string;
  operator: string;
  produkSebelumnya: string | null;
  notifTelegram: boolean;
  status: ChecklistQAStatus;
}

function dt(dateStr: string, time: string): string {
  return new Date(`${dateStr}T${time}`).toISOString();
}

export const CHECKLIST_DUMMY: ChecklistRecord[] = [
  { id: 'CK-001', waktuSubmit: dt('2025-11-28','07:43'), machineName: 'RVS A', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Iwan Gunawan', produkSebelumnya: 'PEBJF', notifTelegram: true, status: 'qa_reviewing' },
  { id: 'CK-002', waktuSubmit: dt('2025-11-28','07:43'), machineName: 'RVS B', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Wahyu Ari', produkSebelumnya: 'PEBJF', notifTelegram: true, status: 'approved' },
  { id: 'CK-003', waktuSubmit: dt('2025-12-04','09:55'), machineName: 'TOYO', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Aep / Akhid', produkSebelumnya: 'PEMMA', notifTelegram: true, status: 'approved' },
  { id: 'CK-004', waktuSubmit: dt('2025-12-10','09:55'), machineName: 'WB 1', subLabel: 'Compounding - Lt4', location: 'Lantai 4', operator: 'Nio / Akhid', produkSebelumnya: null, notifTelegram: true, status: 'waiting_qa' },
  { id: 'CK-005', waktuSubmit: dt('2025-12-10','09:55'), machineName: 'WB 2', subLabel: 'Compounding - Lt4', location: 'Lantai 4', operator: 'Aep / Akhid', produkSebelumnya: null, notifTelegram: true, status: 'approved' },
  { id: 'CK-006', waktuSubmit: dt('2025-12-12','09:55'), machineName: 'WB 3', subLabel: 'Compounding - Lt4', location: 'Lantai 4', operator: 'Aep / Didi', produkSebelumnya: null, notifTelegram: true, status: 'qa_reviewing' },
  { id: 'CK-007', waktuSubmit: dt('2025-12-12','09:55'), machineName: 'K1R2', subLabel: 'Compounding - Lt3', location: 'Lantai 3', operator: 'Aep / Didi', produkSebelumnya: null, notifTelegram: true, status: 'approved' },
  { id: 'CK-008', waktuSubmit: dt('2025-12-15','06:15'), machineName: 'K1R3', subLabel: 'Compounding - Lt3', location: 'Lantai 3', operator: 'Aep / Didi', produkSebelumnya: null, notifTelegram: true, status: 'qa_reviewing' },
  { id: 'CK-009', waktuSubmit: dt('2025-12-15','06:15'), machineName: 'MF 1', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Iwan Gunawan', produkSebelumnya: 'PBSJF', notifTelegram: true, status: 'approved' },
  { id: 'CK-010', waktuSubmit: dt('2025-12-20','06:35'), machineName: 'K1R5', subLabel: 'Compounding - Lt3', location: 'Lantai 3', operator: 'Iwan Gunawan', produkSebelumnya: null, notifTelegram: true, status: 'waiting_qa' },
  { id: 'CK-011', waktuSubmit: dt('2025-12-20','06:35'), machineName: 'RVS P', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Iwan Gunawan', produkSebelumnya: null, notifTelegram: true, status: 'waiting_qa' },
];

export const CHECKLIST_SUMMARY = {
  menungguSwabQA: 5,
  sedangReviewQA: 5,
  verifikasiSelesai: 5,
};
