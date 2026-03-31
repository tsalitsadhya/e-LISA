// ─── Types ────────────────────────────────────────────────────────────────────

export type MachineType = 'RVS' | 'TOYO' | 'WB' | 'K1R' | 'MF' | 'TS' | 'DS';
export type FloorKey = 'Lantai 1' | 'Lantai 2' | 'Lantai 3' | 'Lantai 4';
export type MachineStatus = 'Active' | 'Inactive';

export interface MasterMachine {
  id: string;
  name: string;
  type: MachineType;
  location: FloorKey;
  subLabel: string;
  kode: string;
  status: MachineStatus;
  createdAt: string;
  jalur: string[];
}

export type StageName =
  | '1. Pembongkaran'
  | '2. Pencucian'
  | '3. Pengeringan'
  | '4. Pembersihan bagian lain'
  | '5. Swab test'
  | '6. Pemasangan'
  | '7. Pengencangan baut, klem';

export const ALL_STAGES: StageName[] = [
  '1. Pembongkaran',
  '2. Pencucian',
  '3. Pengeringan',
  '4. Pembersihan bagian lain',
  '5. Swab test',
  '6. Pemasangan',
  '7. Pengencangan baut, klem',
];

export interface MasterPart {
  id: string;
  name: string;
  machineTypes: MachineType[];
  stages: StageName[];
  urutan: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

// ─── Dummy Machine Data ───────────────────────────────────────────────────────

export const MASTER_MACHINES_INITIAL: MasterMachine[] = [
  { id: 'RVS-T',  name: 'RVS T',  type: 'RVS',  location: 'Lantai 1', subLabel: 'Filing - Lt1',        kode: 'RVSA1AH3', status: 'Inactive', createdAt: 'September 2029', jalur: [] },
  { id: 'RVS-U',  name: 'RVS U',  type: 'RVS',  location: 'Lantai 1', subLabel: 'Filing - Lt1',        kode: 'RVSB2AH3', status: 'Active',   createdAt: 'Agustus 2029',   jalur: [] },
  { id: 'TOYO-D', name: 'TOYO D', type: 'TOYO', location: 'Lantai 1', subLabel: 'Filing - Lt1',        kode: 'TOYOC1HS', status: 'Active',   createdAt: 'Agustus 2029',   jalur: [] },
  { id: 'WB-5',   name: 'WB 5',   type: 'WB',   location: 'Lantai 4', subLabel: 'Compounding - Lt4',   kode: 'WB1DO04',  status: 'Active',   createdAt: 'Agustus 2029',   jalur: ['WB5P01DP001','WB5P02DP001'] },
  { id: 'WB-6',   name: 'WB 6',   type: 'WB',   location: 'Lantai 4', subLabel: 'Compounding - Lt4',   kode: 'WB2ECO4',  status: 'Active',   createdAt: 'Agustus 2029',   jalur: ['WB6P01DP001','WB6P02DP001'] },
  { id: 'WB-21',  name: 'WB 21',  type: 'WB',   location: 'Lantai 4', subLabel: 'Compounding - Lt4',   kode: 'WB3FO04',  status: 'Active',   createdAt: 'Oktober 2028',   jalur: ['WB21P01DP001'] },
  { id: 'K1R-2',  name: 'K1R2',   type: 'K1R',  location: 'Lantai 3', subLabel: 'Compounding - Lt3',   kode: 'K1R2CGH3', status: 'Active',   createdAt: 'Oktober 2028',   jalur: ['K1R2P01DP001','K1R2P02DP001','K1R2P03DP001'] },
  { id: 'K1R-3',  name: 'K1R3',   type: 'K1R',  location: 'Lantai 3', subLabel: 'Compounding - Lt3',   kode: 'K1R3CGH3', status: 'Active',   createdAt: 'Oktober 2028',   jalur: ['K1R3P01DP001','K1R3P02DP001'] },
  { id: 'MF-1',   name: 'MF 1',   type: 'MF',   location: 'Lantai 1', subLabel: 'Filing - Lt1',        kode: 'MF1FLG1',  status: 'Active',   createdAt: 'Oktober 2028',   jalur: [] },
  { id: 'K1R-5',  name: 'K1R5',   type: 'K1R',  location: 'Lantai 3', subLabel: 'Compounding - Lt3',   kode: 'K1R5DGH3', status: 'Inactive', createdAt: 'Desember 2028',  jalur: ['K1R5P01DP001'] },
  { id: 'RVS-Y',  name: 'RVS Y',  type: 'RVS',  location: 'Lantai 1', subLabel: 'Filing - Lt1',        kode: 'RVSP3JAH3',status: 'Active',   createdAt: 'Desember 2026',  jalur: [] },
];

// ─── Dummy Part Data ──────────────────────────────────────────────────────────

export const MASTER_PARTS_INITIAL: MasterPart[] = [
  { id: 'P-001', name: 'Chamber',      machineTypes: ['RVS'], stages: ['1. Pembongkaran','2. Pencucian','3. Pengeringan','5. Swab test','6. Pemasangan','7. Pengencangan baut, klem'], urutan: 1, status: 'Active', createdAt: 'September 2028' },
  { id: 'P-002', name: 'Nozzle',       machineTypes: ['RVS'], stages: ['1. Pembongkaran','2. Pencucian','3. Pengeringan','5. Swab test','6. Pemasangan','7. Pengencangan baut, klem'], urutan: 2, status: 'Active', createdAt: 'Agustus 2029' },
  { id: 'P-003', name: 'Auger',        machineTypes: ['RVS'], stages: ['1. Pembongkaran','2. Pencucian','3. Pengeringan','5. Swab test','6. Pemasangan','7. Pengencangan baut, klem'], urutan: 3, status: 'Active', createdAt: 'Agustus 2029' },
  { id: 'P-004', name: 'Stirrer',      machineTypes: ['RVS'], stages: ['1. Pembongkaran','2. Pencucian','3. Pengeringan','5. Swab test','6. Pemasangan','7. Pengencangan baut, klem'], urutan: 4, status: 'Active', createdAt: 'Agustus 2029' },
  { id: 'P-005', name: 'Slider',       machineTypes: ['RVS'], stages: ['1. Pembongkaran','2. Pencucian','3. Pengeringan','5. Swab test','6. Pemasangan','7. Pengencangan baut, klem'], urutan: 5, status: 'Active', createdAt: 'Agustus 2029' },
  { id: 'P-006', name: 'Sealing',      machineTypes: ['RVS'], stages: ['4. Pembersihan bagian lain'], urutan: 1, status: 'Active', createdAt: 'Oktober 2028' },
  { id: 'P-007', name: 'Pipa Discharge',      machineTypes: ['TOYO'], stages: ['1. Pembongkaran','2. Pencucian','3. Pengeringan','5. Swab test','6. Pemasangan','7. Pengencangan baut, klem'], urutan: 1, status: 'Active', createdAt: 'Oktober 2029' },
  { id: 'P-008', name: 'Valve Limitter',      machineTypes: ['TOYO'], stages: ['1. Pembongkaran','2. Pencucian','3. Pengeringan','5. Swab test','6. Pemasangan','7. Pengencangan baut, klem'], urutan: 2, status: 'Active', createdAt: 'Oktober 2029' },
  { id: 'P-009', name: 'Flexible Hose',       machineTypes: ['TOYO'], stages: ['2. Pencucian','3. Pengeringan','5. Swab test'], urutan: 3, status: 'Active', createdAt: 'Oktober 2029' },
  { id: 'P-010', name: 'Hopper',              machineTypes: ['TOYO'], stages: ['1. Pembongkaran','2. Pencucian','3. Pengeringan','5. Swab test','6. Pemasangan','7. Pengencangan baut, klem'], urutan: 5, status: 'Active', createdAt: 'Desember 2029' },
  { id: 'P-011', name: 'Subhopper',           machineTypes: ['TOYO'], stages: ['2. Pencucian','3. Pengeringan'], urutan: 6, status: 'Active', createdAt: 'Desember 2029' },
];

// ─── Helper: auto sub-label & rule ───────────────────────────────────────────

export const TYPE_TO_FLOOR: Record<MachineType, FloorKey> = {
  RVS:  'Lantai 1', TOYO: 'Lantai 1', MF: 'Lantai 1',
  WB:   'Lantai 4',
  K1R:  'Lantai 3', TS:   'Lantai 3', DS: 'Lantai 3',
};

export const FLOOR_TO_SUBLABEL: Record<FloorKey, string> = {
  'Lantai 1': 'Filling - Lantai 1',
  'Lantai 2': 'Compounding - Lantai 2',
  'Lantai 3': 'Compounding - Lantai 3',
  'Lantai 4': 'Compounding - Lantai 4',
};

export const FLOOR_RULE: Record<FloorKey, string> = {
  'Lantai 1': 'Rolling 35 hari (window 30-35 hari)',
  'Lantai 2': 'Maksimal 7 hari (hard deadline)',
  'Lantai 3': 'Maksimal 7 hari (hard deadline)',
  'Lantai 4': 'Maksimal 7 hari (hard deadline)',
};

export const LT234_TYPES: MachineType[] = ['WB', 'K1R', 'TS', 'DS'];

export const TYPE_COLORS: Record<MachineType, { bg: string; color: string }> = {
  RVS:  { bg: '#dbeafe', color: '#1d4ed8' },
  TOYO: { bg: '#fef9c3', color: '#854d0e' },
  WB:   { bg: '#fce7f3', color: '#9d174d' },
  K1R:  { bg: '#fce7f3', color: '#9d174d' },
  MF:   { bg: '#ede9fe', color: '#6d28d9' },
  TS:   { bg: '#fce7f3', color: '#9d174d' },
  DS:   { bg: '#fce7f3', color: '#9d174d' },
};
