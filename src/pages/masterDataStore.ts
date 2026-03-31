import { useState, useCallback } from 'react';
import { StageName, STAGES } from './machineData';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MesinTipe = 'RVS' | 'TOYO' | 'WB' | 'K1R' | 'MF' | 'TS' | 'DS';
export type LantaiKey = 'lantai1' | 'lantai2' | 'lantai3' | 'lantai4';

export interface MasterMesin {
  id: string;
  nama: string;
  tipe: MesinTipe;
  lantai: LantaiKey;
  subLabel: string;
  jalur: string[];
  isActive: boolean;
  createdAt: string;
}

export interface MasterPart {
  id: string;
  nama: string;
  tipesMesin: MesinTipe[];   // bisa berlaku untuk >1 tipe
  stages: StageName[];       // berlaku di tahap mana saja
  urutan: number;
  isActive: boolean;
  createdAt: string;
}

// ─── Initial machine data ─────────────────────────────────────────────────────

export const INITIAL_MESIN: MasterMesin[] = [
  // Lantai 1 — RVS
  ...['A','B','C','D','E','F','G','H','I','J','K','L','M','N','P'].map((l, i) => ({
    id: `RVS-${l}`, nama: `RVS ${l}`, tipe: 'RVS' as MesinTipe,
    lantai: 'lantai1' as LantaiKey, subLabel: 'Filing - Lt1',
    jalur: [], isActive: true, createdAt: '2024-01-01',
  })),
  // Lantai 1 — TOYO
  ...['A','B','C','D','E','F','G','H','J','K','L','M','N','S','T','W'].map(l => ({
    id: `TOYO-${l}`, nama: `TOYO Line ${l}`, tipe: 'TOYO' as MesinTipe,
    lantai: 'lantai1' as LantaiKey, subLabel: 'Filing - Lt1',
    jalur: [], isActive: true, createdAt: '2024-01-01',
  })),
  // Lantai 2 — Batching
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `BS-K1T${i+1}`, nama: `Batching Station K1T${i+1}`, tipe: 'TS' as MesinTipe,
    lantai: 'lantai2' as LantaiKey, subLabel: 'Compounding - Lt2',
    jalur: [`K1T${i+1}P01DP001`, `K1T${i+1}P02DP001`, `K1T${i+1}P03DP001`],
    isActive: true, createdAt: '2024-01-01',
  })),
  // Lantai 3 — Tipping
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `TS-K1R${i+1}`, nama: `Tipping Station K1R${i+1}`, tipe: 'K1R' as MesinTipe,
    lantai: 'lantai3' as LantaiKey, subLabel: 'Compounding - Lt3',
    jalur: [`K1R${i+1}P01DP001`, `K1R${i+1}P02DP001`, `K1R${i+1}P03DP001`, `K1R${i+1}P04DP001`],
    isActive: true, createdAt: '2024-01-01',
  })),
  { id: 'DS-001', nama: 'Dumping Station', tipe: 'DS' as MesinTipe,
    lantai: 'lantai3' as LantaiKey, subLabel: 'Compounding - Lt3',
    jalur: ['DSP01DP001', 'DSP02DP001', 'DSP03DP001'], isActive: true, createdAt: '2024-01-01' },
  // Lantai 4
  ...[1,2,3].map(n => ({
    id: `WB-${n}`, nama: `Weighing Booth WB${n}`, tipe: 'WB' as MesinTipe,
    lantai: 'lantai4' as LantaiKey, subLabel: 'Compounding - Lt4',
    jalur: [`WB${n}P01DP001`, `WB${n}P02DP001`], isActive: true, createdAt: '2024-01-01',
  })),
  { id: 'PT-centong', nama: 'Peralatan Timbang (Centong)', tipe: 'MF' as MesinTipe,
    lantai: 'lantai4' as LantaiKey, subLabel: 'Compounding - Lt4',
    jalur: ['PTP01DP001'], isActive: true, createdAt: '2024-01-01' },
];

// ─── Initial part data ────────────────────────────────────────────────────────

const RVS_MAIN_STAGES: StageName[] = [
  '1. Pembongkaran','2. Pencucian','3. Pengeringan','6. Pemasangan','7. Pengencangan baut/klem'
];

export const INITIAL_PARTS: MasterPart[] = [
  // RVS — main stages
  ...['Chamber','Nozzle','Auger','Stirrer','Slider'].map((nama, i) => ({
    id: `RVS-MAIN-${i+1}`, nama, tipesMesin: ['RVS'] as MesinTipe[],
    stages: RVS_MAIN_STAGES, urutan: i+1, isActive: true, createdAt: '2024-01-01',
  })),
  // RVS — Pembersihan bagian lain
  ...['Sealing','No Batch Roller','Scraper','Crown','Body Mesin','Conveyor'].map((nama, i) => ({
    id: `RVS-PBL-${i+1}`, nama, tipesMesin: ['RVS'] as MesinTipe[],
    stages: ['4. Pembersihan bagian lain'] as StageName[], urutan: i+1, isActive: true, createdAt: '2024-01-01',
  })),
  // RVS — Swab Test
  ...['Flexible Hose','Chamber','Nozzle','Auger','Stirrer','Slider','Pipa After','Flexible Hose After'].map((nama, i) => ({
    id: `RVS-SWAB-${i+1}`, nama, tipesMesin: ['RVS'] as MesinTipe[],
    stages: ['5. Swab Test'] as StageName[], urutan: i+1, isActive: true, createdAt: '2024-01-01',
  })),
  // TOYO — main stages
  ...['Pipa Discharge','Valve Limitter','Flexible Hose','Pipa After Flexible Hose','Hopper','Rotary Feeder','Subhopper','Filling Shutte'].map((nama, i) => ({
    id: `TOYO-MAIN-${i+1}`, nama, tipesMesin: ['TOYO'] as MesinTipe[],
    stages: ['1. Pembongkaran','2. Pencucian','3. Pengeringan','5. Swab Test','6. Pemasangan','7. Pengencangan baut/klem'] as StageName[],
    urutan: i+1, isActive: true, createdAt: '2024-01-01',
  })),
  // TOYO — Pembersihan bagian lain
  ...['Sealing','No Batch Roller','Cross Knife','Body Mesin','Transverse Feed Dust Collector'].map((nama, i) => ({
    id: `TOYO-PBL-${i+1}`, nama, tipesMesin: ['TOYO'] as MesinTipe[],
    stages: ['4. Pembersihan bagian lain'] as StageName[], urutan: i+1, isActive: true, createdAt: '2024-01-01',
  })),
];

// ─── Helper: build per-stage parts map from MasterPart[] ─────────────────────

export function buildPartsPerStage(
  parts: MasterPart[],
  tipe: MesinTipe
): Record<StageName, string[]> {
  const result = {} as Record<StageName, string[]>;
  STAGES.forEach(stage => {
    result[stage] = parts
      .filter(p => p.isActive && p.tipesMesin.includes(tipe) && p.stages.includes(stage))
      .sort((a, b) => a.urutan - b.urutan)
      .map(p => p.nama);
  });
  return result;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMasterData() {
  const [mesinList, setMesinList] = useState<MasterMesin[]>(INITIAL_MESIN);
  const [partList, setPartList] = useState<MasterPart[]>(INITIAL_PARTS);

  // ── Mesin operations ──────────────────────────────────────────────────────

  const addMesin = useCallback((mesin: Omit<MasterMesin, 'id' | 'createdAt'>) => {
    const id = `${mesin.tipe}-${mesin.nama.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`;
    setMesinList(prev => [...prev, { ...mesin, id, createdAt: new Date().toISOString().split('T')[0] }]);
  }, []);

  const updateMesin = useCallback((id: string, patch: Partial<MasterMesin>) => {
    setMesinList(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  }, []);

  const toggleMesinActive = useCallback((id: string) => {
    setMesinList(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  }, []);

  // ── Part operations ───────────────────────────────────────────────────────

  const addPart = useCallback((part: Omit<MasterPart, 'id' | 'createdAt'>) => {
    const id = `PART-${Date.now()}`;
    setPartList(prev => [...prev, { ...part, id, createdAt: new Date().toISOString().split('T')[0] }]);
  }, []);

  const updatePart = useCallback((id: string, patch: Partial<MasterPart>) => {
    setPartList(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }, []);

  const deletePart = useCallback((id: string) => {
    setPartList(prev => prev.filter(p => p.id !== id));
  }, []);

  const togglePartActive = useCallback((id: string) => {
    setPartList(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  }, []);

  // ── Derived helpers ───────────────────────────────────────────────────────

  const getActiveMesinByLantai = useCallback((lantai: LantaiKey) =>
    mesinList.filter(m => m.lantai === lantai && m.isActive),
  [mesinList]);

  const getPartsPerStageForTipe = useCallback((tipe: MesinTipe) =>
    buildPartsPerStage(partList, tipe),
  [partList]);

  return {
    mesinList, partList,
    addMesin, updateMesin, toggleMesinActive,
    addPart, updatePart, deletePart, togglePartActive,
    getActiveMesinByLantai, getPartsPerStageForTipe,
  };
}

export type MasterDataStore = ReturnType<typeof useMasterData>;
