export type LantaiKey = 'lantai1' | 'lantai2' | 'lantai3' | 'lantai4';

export interface MachineOption {
  id: string;
  nama: string;
  tipe: 'RVS' | 'TOYO' | 'WB' | 'K1R' | 'MF' | 'TS' | 'DS';
  jalur: string[];
}

// ─── Per-stage parts ─────────────────────────────────────────────────────────

export type StageName =
  | '1. Pembongkaran'
  | '2. Pencucian'
  | '3. Pengeringan'
  | '4. Pembersihan bagian lain'
  | '5. Swab Test'
  | '6. Pemasangan'
  | '7. Pengencangan baut/klem';

export const STAGES: StageName[] = [
  '1. Pembongkaran',
  '2. Pencucian',
  '3. Pengeringan',
  '4. Pembersihan bagian lain',
  '5. Swab Test',
  '6. Pemasangan',
  '7. Pengencangan baut/klem',
];

export const PARTS_PER_STAGE_RVS: Record<StageName, string[]> = {
  '1. Pembongkaran':            ['Chamber', 'Nozzle', 'Auger', 'Stirrer', 'Slider'],
  '2. Pencucian':               ['Chamber', 'Nozzle', 'Auger', 'Stirrer', 'Slider'],
  '3. Pengeringan':             ['Chamber', 'Nozzle', 'Auger', 'Stirrer', 'Slider'],
  '4. Pembersihan bagian lain': ['Sealing', 'No Batch Roller', 'Scraper', 'Crown', 'Body Mesin', 'Conveyor'],
  '5. Swab Test':               ['Flexible Hose', 'Chamber', 'Nozzle', 'Auger', 'Stirrer', 'Slider', 'Pipa After', 'Flexible Hose After'],
  '6. Pemasangan':              ['Chamber', 'Nozzle', 'Auger', 'Stirrer', 'Slider'],
  '7. Pengencangan baut/klem':  ['Chamber', 'Nozzle', 'Auger', 'Stirrer', 'Slider'],
};

export const PARTS_PER_STAGE_TOYO: Record<StageName, string[]> = {
  '1. Pembongkaran':            ['Pipa Discharge', 'Valve Limitter', 'Flexible Hose', 'Pipa After Flexible Hose', 'Hopper', 'Rotary Feeder', 'Subhopper', 'Filling Shutte'],
  '2. Pencucian':               ['Pipa Discharge', 'Valve Limitter', 'Flexible Hose', 'Pipa After Flexible Hose', 'Hopper', 'Rotary Feeder', 'Subhopper', 'Filling Shutte'],
  '3. Pengeringan':             ['Pipa Discharge', 'Valve Limitter', 'Flexible Hose', 'Pipa After Flexible Hose', 'Hopper', 'Rotary Feeder', 'Subhopper', 'Filling Shutte'],
  '4. Pembersihan bagian lain': ['Sealing', 'No Batch Roller', 'Cross Knife', 'Body Mesin', 'Transverse Feed Dust Collector'],
  '5. Swab Test':               ['Pipa Discharge', 'Valve Limitter', 'Flexible Hose', 'Pipa After Flexible Hose', 'Hopper', 'Rotary Feeder', 'Subhopper', 'Filling Shutte'],
  '6. Pemasangan':              ['Pipa Discharge', 'Valve Limitter', 'Flexible Hose', 'Pipa After Flexible Hose', 'Hopper', 'Rotary Feeder', 'Subhopper', 'Filling Shutte'],
  '7. Pengencangan baut/klem':  ['Pipa Discharge', 'Valve Limitter', 'Flexible Hose', 'Pipa After Flexible Hose', 'Hopper', 'Rotary Feeder', 'Subhopper', 'Filling Shutte'],
};

// Default parts per stage untuk lantai 2/3/4
const LT234_PARTS = ['Docking Batching', 'K1T1', 'K1R2', 'K1R3', 'Filing Head'];
export const PARTS_PER_STAGE_DEFAULT: Record<StageName, string[]> = {
  '1. Pembongkaran':            LT234_PARTS,
  '2. Pencucian':               LT234_PARTS,
  '3. Pengeringan':             LT234_PARTS,
  '4. Pembersihan bagian lain': LT234_PARTS,
  '5. Swab Test':               LT234_PARTS,
  '6. Pemasangan':              LT234_PARTS,
  '7. Pengencangan baut/klem':  LT234_PARTS,
};

export function getPartsPerStage(mesinId: string): Record<StageName, string[]> {
  if (mesinId.startsWith('RVS'))  return PARTS_PER_STAGE_RVS;
  if (mesinId.startsWith('TOYO')) return PARTS_PER_STAGE_TOYO;
  return PARTS_PER_STAGE_DEFAULT;
}

export function getPartsFlatUnique(mesinId: string): string[] {
  const perStage = getPartsPerStage(mesinId);
  return [...new Set(Object.values(perStage).flat())];
}

// ─── Machine lists ────────────────────────────────────────────────────────────

export const MESIN_LANTAI1: MachineOption[] = [
  { id: 'RVS-A', nama: 'RVS A', tipe: 'RVS', jalur: [] },
  { id: 'RVS-B', nama: 'RVS B', tipe: 'RVS', jalur: [] },
  { id: 'TOYO-C', nama: 'TOYO Line C', tipe: 'TOYO', jalur: [] },
  { id: 'RVS-D', nama: 'RVS D', tipe: 'RVS', jalur: [] },
  { id: 'RVS-E', nama: 'RVS E', tipe: 'RVS', jalur: [] },
  { id: 'RVS-F', nama: 'RVS F', tipe: 'RVS', jalur: [] },
  { id: 'RVS-G', nama: 'RVS G', tipe: 'RVS', jalur: [] },
  { id: 'RVS-H', nama: 'RVS H', tipe: 'RVS', jalur: [] },
  { id: 'RVS-J', nama: 'RVS J', tipe: 'RVS', jalur: [] },
  { id: 'RVS-K', nama: 'RVS K', tipe: 'RVS', jalur: [] },
  { id: 'RVS-L', nama: 'RVS L', tipe: 'RVS', jalur: [] },
  { id: 'RVS-M', nama: 'RVS M', tipe: 'RVS', jalur: [] },
  { id: 'RVS-N', nama: 'RVS N', tipe: 'RVS', jalur: [] },
  { id: 'RVS-S', nama: 'RVS S', tipe: 'RVS', jalur: [] },
  { id: 'RVS-T', nama: 'RVS T', tipe: 'RVS', jalur: [] },
  { id: 'RVS-P', nama: 'RVS P', tipe: 'RVS', jalur: [] },
  { id: 'MF-1', nama: 'MF 1', tipe: 'MF', jalur: [] },
  { id: 'MF-2', nama: 'MF 2', tipe: 'MF', jalur: [] },
];

export const MESIN_LANTAI2: MachineOption[] = Array.from({ length: 8 }, (_, i) => ({
  id: `BS-K1T${i+1}`,
  nama: `Batching Station K1T${i+1}`,
  tipe: 'TS' as const,
  jalur: [`K1T${i+1}P01DP001`, `K1T${i+1}P02DP001`, `K1T${i+1}P03DP001`],
}));

export const MESIN_LANTAI3: MachineOption[] = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `TS-K1R${i+1}`,
    nama: `Tipping Station K1R${i+1}`,
    tipe: 'TS' as const,
    jalur: [`K1R${i+1}P01DP001`, `K1R${i+1}P02DP001`, `K1R${i+1}P03DP001`, `K1R${i+1}P04DP001`],
  })),
  { id: 'DS-001', nama: 'Dumping Station', tipe: 'DS' as const, jalur: ['DSP01DP001', 'DSP02DP001', 'DSP03DP001'] },
];

export const MESIN_LANTAI4: MachineOption[] = [
  { id: 'WB-1', nama: 'Weighing Booth WB1', tipe: 'WB' as const, jalur: ['WB1P01DP001', 'WB1P02DP001'] },
  { id: 'WB-2', nama: 'Weighing Booth WB2', tipe: 'WB' as const, jalur: ['WB2P01DP001', 'WB2P02DP001'] },
  { id: 'WB-3', nama: 'Weighing Booth WB3', tipe: 'WB' as const, jalur: ['WB3P01DP001', 'WB3P02DP001'] },
  { id: 'PT-centong', nama: 'Peralatan Timbang (Centong)', tipe: 'MF' as const, jalur: ['PTP01DP001'] },
];

export const MESIN_BY_LANTAI: Record<LantaiKey, MachineOption[]> = {
  lantai1: MESIN_LANTAI1,
  lantai2: MESIN_LANTAI2,
  lantai3: MESIN_LANTAI3,
  lantai4: MESIN_LANTAI4,
};

export function getMesinById(id: string): MachineOption | undefined {
  return [...MESIN_LANTAI1, ...MESIN_LANTAI2, ...MESIN_LANTAI3, ...MESIN_LANTAI4].find(m => m.id === id);
}

export const PRODUK_OPTIONS: string[] = [
  'XEBJ3', 'PEBJ3',
  'XBSJ1', 'PBSJ1',
  'XEGA2', 'PEGA2',
  'XEMA2', 'PEMA2',
  'XENT1', 'PENT1',
  'XEOM1', 'PEOM1',
  'XEGM1', 'PEGM1',
  'XEBK1', 'PEBK1',
  '2AS00600J',
  '2AC00600J',
  '2AS012000'
];

export const CATEGORY_CLEANING = ['Minor', 'Mayor'];
