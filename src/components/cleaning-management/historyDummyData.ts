export interface HistoryRecord {
  id: string;
  tanggal: string;      
  machineName: string;
  machineType: string;
  subLabel: string;
  location: string;
  operator: string;
  produkSebelumnya: string | null;
  status: 'approved' | 'rejected';
  hasReport: boolean;
}

function d(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

export const HISTORY_DUMMY: HistoryRecord[] = [
  { id: 'H-001', tanggal: d('2025-11-23'), machineName: 'RVS A', machineType: 'RVS', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Iwan Gunawan', produkSebelumnya: 'PEBJF', status: 'approved', hasReport: true },
  { id: 'H-002', tanggal: d('2025-11-25'), machineName: 'RVS B', machineType: 'RVS', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Wahyu Ari', produkSebelumnya: 'PEBJF', status: 'approved', hasReport: true },
  { id: 'H-003', tanggal: d('2025-12-04'), machineName: 'TOYO', machineType: 'TOYO', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Aep / Akhid', produkSebelumnya: 'PEMMA', status: 'rejected', hasReport: true },
  { id: 'H-004', tanggal: d('2025-12-10'), machineName: 'WB 1', machineType: 'WB', subLabel: 'Compounding - Lt4', location: 'Lantai 4', operator: 'Nio / Akhid', produkSebelumnya: null, status: 'rejected', hasReport: false },
  { id: 'H-005', tanggal: d('2025-12-10'), machineName: 'WB 2', machineType: 'WB', subLabel: 'Compounding - Lt4', location: 'Lantai 4', operator: 'Aep / Akhid', produkSebelumnya: null, status: 'approved', hasReport: true },
  { id: 'H-006', tanggal: d('2025-12-12'), machineName: 'WB 3', machineType: 'WB', subLabel: 'Compounding - Lt4', location: 'Lantai 4', operator: 'Aep / Didi', produkSebelumnya: null, status: 'approved', hasReport: true },
  { id: 'H-007', tanggal: d('2025-12-12'), machineName: 'K1R2', machineType: 'K1R', subLabel: 'Compounding - Lt3', location: 'Lantai 3', operator: 'Aep / Didi', produkSebelumnya: null, status: 'rejected', hasReport: true },
  { id: 'H-008', tanggal: d('2025-12-15'), machineName: 'K1R3', machineType: 'K1R', subLabel: 'Compounding - Lt3', location: 'Lantai 3', operator: 'Aep / Didi', produkSebelumnya: null, status: 'approved', hasReport: true },
  { id: 'H-009', tanggal: d('2025-12-15'), machineName: 'MF 1', machineType: 'MF', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Iwan Gunawan', produkSebelumnya: 'PBSJF', status: 'approved', hasReport: true },
  { id: 'H-010', tanggal: d('2025-12-20'), machineName: 'K1R5', machineType: 'K1R', subLabel: 'Compounding - Lt3', location: 'Lantai 3', operator: 'Iwan Gunawan', produkSebelumnya: null, status: 'approved', hasReport: true },
  { id: 'H-011', tanggal: d('2025-12-20'), machineName: 'RVS P', machineType: 'RVS', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Iwan Gunawan', produkSebelumnya: null, status: 'rejected', hasReport: true },
  { id: 'H-012', tanggal: d('2026-01-05'), machineName: 'RVS A', machineType: 'RVS', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Wahyu Ari', produkSebelumnya: 'PEMMA', status: 'approved', hasReport: true },
  { id: 'H-013', tanggal: d('2026-01-08'), machineName: 'TOYO', machineType: 'TOYO', subLabel: 'Filing - Lt1', location: 'Lantai 1', operator: 'Aep / Akhid', produkSebelumnya: 'PEBJF', status: 'approved', hasReport: true },
  { id: 'H-014', tanggal: d('2026-01-12'), machineName: 'WB 1', machineType: 'WB', subLabel: 'Compounding - Lt4', location: 'Lantai 4', operator: 'Nio / Akhid', produkSebelumnya: null, status: 'approved', hasReport: true },
  { id: 'H-015', tanggal: d('2026-01-15'), machineName: 'K1R2', machineType: 'K1R', subLabel: 'Compounding - Lt3', location: 'Lantai 3', operator: 'Aep / Didi', produkSebelumnya: null, status: 'rejected', hasReport: true },
];
