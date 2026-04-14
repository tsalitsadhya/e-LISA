import React, { useState, useCallback, useEffect } from 'react';
import api from '../../lib/api';
import {
  type LantaiKey, MESIN_BY_LANTAI, getMesinById,
  PRODUK_OPTIONS, CATEGORY_CLEANING,
  STAGES, type StageName, getPartsPerStage,
} from './machineData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MesinEntry {
  uid: string;
  mesinId: string;
  categoryC: string;
  waktuMulai: string;
  waktuSelesai: string;
  durasi: string;
  jalurChecked: Record<string, boolean>;
}

interface PartRow {
  checked: boolean;
  keterangan: string;
  signature: string;
  signatureTime: string;
}

interface StageData {
  jamMulai: string;
  jamSelesai: string;
  durasi: string;
  parts: Record<string, PartRow>;
}

type ChecklistState = Record<StageName, StageData>;

interface FormState {
  lantai: LantaiKey;
  tanggal: string;
  operator: string;
  mesinId: string;
  produkSesudahnya: string;
  produkSebelumnya: string;
  categoryGlobal: string;
  mesinList: MesinEntry[];
  waktuMulai: string;
  waktuSelesai: string;
  durasi: string;
  catatanUmum: string;
}

interface ApiMachine {
  id: string;
  machine_name: string;
  machine_type: string;
  floor: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultLantai?: LantaiKey;
  machineId?: string;
  machineName?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 8); }

function calcDurasi(mulai: string, selesai: string): string {
  if (!mulai || !selesai) return '';
  const [mh, mm] = mulai.split(':').map(Number);
  const [sh, sm] = selesai.split(':').map(Number);
  let diff = (sh * 60 + sm) - (mh * 60 + mm);
  if (diff < 0) diff += 1440;
  return `${diff} menit`;
}

function nowTimestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

function emptyMesin(): MesinEntry {
  return { uid: uid(), mesinId: '', categoryC: 'Minor', waktuMulai: '07:00', waktuSelesai: '', durasi: '', jalurChecked: {} };
}

function initChecklist(mesinId: string): ChecklistState {
  const perStage = getPartsPerStage(mesinId);
  const state = {} as ChecklistState;
  STAGES.forEach(s => {
    const partsMap: Record<string, PartRow> = {};
    (perStage[s] ?? []).forEach(p => {
      partsMap[p] = { checked: false, keterangan: '', signature: '', signatureTime: '' };
    });
    state[s] = { jamMulai: '', jamSelesai: '', durasi: '', parts: partsMap };
  });
  return state;
}

function stageStatus(stage: StageData): 'selesai' | 'sebagian' | 'belum' {
  const rows = Object.values(stage.parts);
  if (!rows.length) return 'belum';
  const done = rows.filter(r => r.checked).length;
  if (done === rows.length && stage.jamMulai && stage.jamSelesai) return 'selesai';
  if (done > 0 || stage.jamMulai) return 'sebagian';
  return 'belum';
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const inputS: React.CSSProperties = {
  width: '100%', padding: '6px 9px', fontSize: 12, borderRadius: 5,
  border: '1px solid #d1d5db', background: '#fff', color: '#111827',
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
const selectS: React.CSSProperties = {
  ...inputS, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: 24,
};
const labelS: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 3 };
const fieldS: React.CSSProperties = { marginBottom: 12 };
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };
const req = <span style={{ color: '#ef4444' }}>*</span>;

// ─── StepBar ─────────────────────────────────────────────────────────────────

const StepBar: React.FC<{ step: number }> = ({ step }) => {
  const steps = ['Informasi sesi', 'Checklist Pembersihan', 'Review & Submit'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0 14px' }}>
      {steps.map((s, i) => {
        const n = i + 1; const done = step > n; const active = step === n;
        return (
          <React.Fragment key={n}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: done ? '#22c55e' : active ? '#1a7fd4' : '#e5e7eb', color: done || active ? '#fff' : '#9ca3af' }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? '#1a7fd4' : done ? '#22c55e' : '#9ca3af', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? '#22c55e' : '#e5e7eb', margin: '0 8px' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Step 1A — Lantai 1 ──────────────────────────────────────────────────────

const Step1Lantai1: React.FC<{ form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>; apiMachines: ApiMachine[]; lockedMachineName?: string }> = ({ form, setForm, apiMachines, lockedMachineName }) => {
  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div>
      <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>Isi informasi dasar sesi cleaning dan pilih mesin</p>
      <div style={{ fontWeight: 700, fontSize: 11, color: '#1a2744', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Informasi Sesi</div>
      <div style={grid2}>
        <div style={fieldS}><label style={labelS}>Tanggal {req}</label><input type="date" value={form.tanggal} onChange={e => set('tanggal', e.target.value)} style={inputS} /></div>
        <div style={fieldS}><label style={labelS}>Operator {req}</label><input type="text" placeholder="Nama PIC cleaning" value={form.operator} onChange={e => set('operator', e.target.value)} style={inputS} /></div>
      </div>
      <div style={grid2}>
        <div style={fieldS}>
          <label style={labelS}>Mesin {req}</label>
          {lockedMachineName ? (
            <input value={lockedMachineName} readOnly style={{ ...inputS, background: '#f0f9ff', color: '#1a2744', fontWeight: 600, border: '1px solid #bae6fd' }} />
          ) : (
            <select value={form.mesinId} onChange={e => set('mesinId', e.target.value)} style={selectS}>
              <option value="">Pilih mesin...</option>
              {apiMachines.filter(m => m.floor === 1).map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
            </select>
          )}
        </div>
        <div style={fieldS}>
          <label style={labelS}>Rule Type {req}</label>
          <input value={form.mesinId ? 'Rolling 35 Days' : ''} readOnly placeholder="Otomatis terisi" style={{ ...inputS, background: '#f0f9ff', color: '#1a7fd4', fontWeight: 600, border: '1px solid #bae6fd' }} />
        </div>
      </div>
      <div style={grid2}>
        <div style={fieldS}>
          <label style={labelS}>Produk Sebelumnya {req}</label>
          <select value={form.produkSebelumnya} onChange={e => set('produkSebelumnya', e.target.value)} style={selectS}>
            <option value="">Pilih produk...</option>
            {PRODUK_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={fieldS}>
          <label style={labelS}>Produk Sesudahnya {req}</label>
          <input type="text" placeholder="Masukan kode produk" value={form.produkSesudahnya} onChange={e => set('produkSesudahnya', e.target.value)} style={inputS} />
        </div>
      </div>
      <div style={grid2}>
        <div style={fieldS}>
          <label style={labelS}>Waktu Mulai {req}</label>
          <input type="text" placeholder="HH:MM" maxLength={5} value={form.waktuMulai} onChange={e => { set('waktuMulai', e.target.value); set('durasi', calcDurasi(e.target.value, form.waktuSelesai)); }} style={inputS} />
        </div>
        <div style={fieldS}>
          <label style={labelS}>Waktu Selesai {req}</label>
          <input type="text" placeholder="HH:MM" maxLength={5} value={form.waktuSelesai} onChange={e => { set('waktuSelesai', e.target.value); set('durasi', calcDurasi(form.waktuMulai, e.target.value)); }} style={inputS} />
        </div>
      </div>
      <div style={{ ...fieldS, width: '50%' }}>
        <label style={labelS}>Durasi</label>
        <input value={form.durasi} readOnly placeholder="Otomatis" style={{ ...inputS, background: '#f9fafb', border: '1px solid #e5e7eb' }} />
      </div>
      <div style={fieldS}>
        <label style={labelS}>Catatan Umum {req}</label>
        <textarea rows={2} placeholder="Masukan kondisi khusus..." value={form.catatanUmum} onChange={e => set('catatanUmum', e.target.value)} style={{ ...inputS, resize: 'vertical', minHeight: 56 }} />
      </div>
    </div>
  );
};

// ─── Step 1B — Lantai 2/3/4 ──────────────────────────────────────────────────

const MesinCard: React.FC<{
  entry: MesinEntry; index: number; lantai: LantaiKey;
  onUpdate: (uid: string, p: Partial<MesinEntry>) => void;
  onRemove: (uid: string) => void; canRemove: boolean;
}> = ({ entry, index, lantai, onUpdate, onRemove, canRemove }) => {
  const jalurList = getMesinById(entry.mesinId)?.jalur ?? [];
  const handleMesinChange = (id: string) => {
    const jalurChecked: Record<string, boolean> = {};
    (getMesinById(id)?.jalur ?? []).forEach(j => { jalurChecked[j] = false; });
    onUpdate(entry.uid, { mesinId: id, jalurChecked });
  };
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 7, padding: 12, marginBottom: 10, background: '#fafafa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#1a2744' }}>Mesin {index + 1}</span>
        {canRemove && <button onClick={() => onRemove(entry.uid)} style={{ padding: '2px 9px', fontSize: 11, borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit' }}>Hapus</button>}
      </div>
      <div style={grid2}>
        <div style={fieldS}>
          <label style={labelS}>Nama Mesin {req}</label>
          <select value={entry.mesinId} onChange={e => handleMesinChange(e.target.value)} style={selectS}>
            <option value="">Pilih mesin...</option>
            {MESIN_BY_LANTAI[lantai].map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
          </select>
        </div>
        <div style={fieldS}>
          <label style={labelS}>Category Cleaning {req}</label>
          <select value={entry.categoryC} onChange={e => onUpdate(entry.uid, { categoryC: e.target.value })} style={selectS}>
            {CATEGORY_CLEANING.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={grid2}>
        <div style={fieldS}>
          <label style={labelS}>Waktu Mulai {req}</label>
          <input type="text" placeholder="HH:MM" maxLength={5} value={entry.waktuMulai} onChange={e => onUpdate(entry.uid, { waktuMulai: e.target.value, durasi: calcDurasi(e.target.value, entry.waktuSelesai) })} style={inputS} />
        </div>
        <div style={fieldS}>
          <label style={labelS}>Waktu Selesai {req}</label>
          <input type="text" placeholder="HH:MM" maxLength={5} value={entry.waktuSelesai} onChange={e => onUpdate(entry.uid, { waktuSelesai: e.target.value, durasi: calcDurasi(entry.waktuMulai, e.target.value) })} style={inputS} />
        </div>
      </div>
      <div style={{ ...fieldS, width: '50%' }}>
        <label style={labelS}>Durasi</label>
        <input value={entry.durasi} readOnly style={{ ...inputS, background: '#f9fafb', border: '1px solid #e5e7eb' }} />
      </div>
      <div style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 10, background: '#dbeafe', color: '#1d4ed8', fontWeight: 600, marginBottom: jalurList.length ? 8 : 0 }}>
        Khusus lantai {lantai.replace('lantai', '')}
      </div>
      {jalurList.length > 0 && (
        <div style={fieldS}>
          <label style={labelS}>Jalur/Part <span style={{ fontWeight: 400, color: '#9ca3af' }}>(auto-generate per mesin)</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {jalurList.map(j => (
              <label key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!entry.jalurChecked[j]} onChange={() => onUpdate(entry.uid, { jalurChecked: { ...entry.jalurChecked, [j]: !entry.jalurChecked[j] } })} style={{ width: 14, height: 14, accentColor: '#1a7fd4', cursor: 'pointer' }} />
                <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: entry.jalurChecked[j] ? '#dbeafe' : '#f3f4f6', color: entry.jalurChecked[j] ? '#1d4ed8' : '#6b7280', border: `1px solid ${entry.jalurChecked[j] ? '#93c5fd' : '#e5e7eb'}` }}>{j}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Step1Lantai234: React.FC<{ form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }> = ({ form, setForm }) => {
  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));
  const updateMesin = useCallback((uid: string, patch: Partial<MesinEntry>) => setForm(f => ({ ...f, mesinList: f.mesinList.map(m => m.uid === uid ? { ...m, ...patch } : m) })), [setForm]);
  const removeMesin = useCallback((uid: string) => setForm(f => ({ ...f, mesinList: f.mesinList.filter(m => m.uid !== uid) })), [setForm]);
  const addMesin = () => setForm(f => ({ ...f, mesinList: [...f.mesinList, emptyMesin()] }));
  return (
    <div>
      <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>Isi informasi dasar sesi cleaning dan pilih mesin</p>
      <div style={{ fontWeight: 700, fontSize: 11, color: '#1a2744', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Informasi Sesi</div>
      <div style={grid2}>
        <div style={fieldS}><label style={labelS}>Tanggal {req}</label><input type="date" value={form.tanggal} onChange={e => set('tanggal', e.target.value)} style={inputS} /></div>
        <div style={fieldS}><label style={labelS}>Operator {req}</label><input type="text" placeholder="Nama PIC cleaning" value={form.operator} onChange={e => set('operator', e.target.value)} style={inputS} /></div>
      </div>
      <div style={grid2}>
        <div style={fieldS}>
          <label style={labelS}>Produk Sebelumnya {req}</label>
          <select value={form.produkSebelumnya} onChange={e => set('produkSebelumnya', e.target.value)} style={selectS}>
            <option value="">Pilih produk...</option>
            {PRODUK_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={fieldS}>
          <label style={labelS}>Category Cleaning {req}</label>
          <select value={form.categoryGlobal} onChange={e => set('categoryGlobal', e.target.value)} style={selectS}>
            <option value="">Pilih kategori...</option>
            {CATEGORY_CLEANING.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={fieldS}><label style={labelS}>Catatan Umum {req}</label><textarea rows={2} placeholder="Masukan kondisi khusus..." value={form.catatanUmum} onChange={e => set('catatanUmum', e.target.value)} style={{ ...inputS, resize: 'vertical', minHeight: 52 }} /></div>
      <div style={{ fontWeight: 700, fontSize: 11, color: '#1a2744', margin: '4px 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Mesin yang Dibersihkan</div>
      {form.mesinList.map((entry, i) => <MesinCard key={entry.uid} entry={entry} index={i} lantai={form.lantai} onUpdate={updateMesin} onRemove={removeMesin} canRemove={form.mesinList.length > 1} />)}
      <button onClick={addMesin} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '7px 0', fontSize: 12, borderRadius: 6, border: '1.5px dashed #93c5fd', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, justifyContent: 'center', marginTop: 4 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Tambah mesin lain
      </button>
    </div>
  );
};

// ─── Step 2 — Checklist Accordion ────────────────────────────────────────────

const StatusPill: React.FC<{ s: 'selesai' | 'sebagian' | 'belum' }> = ({ s }) => {
  const cfg = {
    selesai:  { label: 'Selesai',        bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    sebagian: { label: 'Diisi sebagian', bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
    belum:    { label: 'Belum diisi',    bg: '#f3f4f6', color: '#6b7280', dot: '#d1d5db' },
  }[s];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
};

const StageAccordion: React.FC<{
  stageName: StageName;
  data: StageData;
  operator: string;
  onChange: (d: StageData) => void;
}> = ({ stageName, data, operator, onChange }) => {
  const [open, setOpen] = useState(stageName === '1. Pembongkaran');
  const status = stageStatus(data);
  const parts = Object.keys(data.parts);

  const setJam = (field: 'jamMulai' | 'jamSelesai', v: string) => {
    const next = { ...data, [field]: v };
    next.durasi = calcDurasi(field === 'jamMulai' ? v : data.jamMulai, field === 'jamSelesai' ? v : data.jamSelesai);
    onChange(next);
  };

  const toggleCheck = (part: string) => {
    const prev = data.parts[part];
    const nowChecked = !prev.checked;
    onChange({
      ...data,
      parts: {
        ...data.parts,
        [part]: {
          checked: nowChecked,
          keterangan: nowChecked && !prev.keterangan ? 'OK' : prev.keterangan,
          signature: nowChecked && !prev.signature ? (operator || 'Operator') : prev.signature,
          signatureTime: nowChecked && !prev.signatureTime ? nowTimestamp() : prev.signatureTime,
        },
      },
    });
  };

  const setPart = (part: string, patch: Partial<PartRow>) =>
    onChange({ ...data, parts: { ...data.parts, [part]: { ...data.parts[part], ...patch } } });

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 7, marginBottom: 6, overflow: 'hidden' }}>
      {/* Accordion header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: open ? '#f0f9ff' : '#f9fafb', cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ fontWeight: 700, fontSize: 12, color: '#1a2744' }}>{stageName}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusPill s={status} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#6b7280" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M7 10l5 5 5-5z"/></svg>
        </div>
      </div>

      {open && (
        <div style={{ padding: '10px 12px' }}>
          {/* Time row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={labelS}>Jam mulai {req}</label>
              <input type="text" placeholder="HH:MM" maxLength={5} value={data.jamMulai} onChange={e => setJam('jamMulai', e.target.value)} style={{ ...inputS, fontSize: 12 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelS}>Jam selesai {req}</label>
              <input type="text" placeholder="HH:MM" maxLength={5} value={data.jamSelesai} onChange={e => setJam('jamSelesai', e.target.value)} style={{ ...inputS, fontSize: 12 }} />
            </div>
            <div style={{ flex: 0.6 }}>
              <label style={labelS}>Durasi</label>
              <input value={data.durasi} readOnly style={{ ...inputS, fontSize: 12, background: '#f9fafb', border: '1px solid #e5e7eb' }} />
            </div>
          </div>

          {/* Parts table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '27%' }} />
              <col style={{ width: '30%' }} />
              <col style={{ width: '38%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '5px 6px', textAlign: 'center', fontWeight: 600, fontSize: 11, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>✓</th>
                <th style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Item/Part</th>
                <th style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Keterangan</th>
                <th style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Signature</th>
              </tr>
            </thead>
            <tbody>
              {parts.map(part => {
                const row = data.parts[part];
                return (
                  <tr key={part} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <input type="checkbox" checked={row.checked} onChange={() => toggleCheck(part)} style={{ width: 14, height: 14, accentColor: '#1a7fd4', cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '6px', verticalAlign: 'middle', color: row.checked ? '#111827' : '#6b7280', fontWeight: row.checked ? 500 : 400 }}>{part}</td>
                    <td style={{ padding: '4px 6px', verticalAlign: 'middle' }}>
                      <select
                        value={row.keterangan}
                        onChange={e => setPart(part, { keterangan: e.target.value })}
                        style={{
                          ...selectS, fontSize: 11, padding: '4px 22px 4px 7px',
                          background: row.keterangan === 'OK' ? '#f0fdf4' : row.keterangan === 'Others' ? '#fffbeb' : '#fff',
                          borderColor: row.keterangan === 'OK' ? '#86efac' : row.keterangan === 'Others' ? '#fde68a' : '#d1d5db',
                          color: row.keterangan === 'OK' ? '#15803d' : row.keterangan === 'Others' ? '#854d0e' : '#9ca3af',
                        }}
                      >
                        <option value="">—</option>
                        <option value="OK">OK</option>
                        <option value="Others">Others</option>
                      </select>
                    </td>
                    <td style={{ padding: '4px 6px', verticalAlign: 'middle' }}>
                      {row.signature
                        ? <div><div style={{ fontSize: 11, fontWeight: 600, color: '#1a2744' }}>{row.signature}</div><div style={{ fontSize: 9, color: '#9ca3af' }}>{row.signatureTime}</div></div>
                        : <span style={{ fontSize: 11, color: '#d1d5db' }}>—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Step2: React.FC<{ form: FormState; checklist: ChecklistState; setChecklist: (c: ChecklistState) => void }> = ({ form, checklist, setChecklist }) => {
  const mesinId = form.lantai === 'lantai1' ? form.mesinId : form.mesinList[0]?.mesinId ?? '';
  const tipe = mesinId.startsWith('RVS') ? 'RVS' : mesinId.startsWith('TOYO') ? 'TOYO' : `lantai ${form.lantai.replace('lantai', '')}`;
  const doneStages = STAGES.filter(s => stageStatus(checklist[s]) === 'selesai').length;

  return (
    <div>
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, padding: '7px 11px', marginBottom: 12, fontSize: 11, color: '#0369a1' }}>
        Checklist mengikuti template <strong>{tipe}</strong> — item part sudah ditentukan per mesin
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 5, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(doneStages / STAGES.length) * 100}%`, background: doneStages === STAGES.length ? '#22c55e' : '#1a7fd4', borderRadius: 99, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: doneStages === STAGES.length ? '#15803d' : '#374151', whiteSpace: 'nowrap' }}>
          {doneStages}/{STAGES.length} tahap
        </span>
      </div>
      {STAGES.map(stage => (
        <StageAccordion
          key={stage}
          stageName={stage}
          data={checklist[stage]}
          operator={form.operator}
          onChange={d => setChecklist({ ...checklist, [stage]: d })}
        />
      ))}
    </div>
  );
};

// ─── Step 3 — Review & Submit ─────────────────────────────────────────────────

const Step3: React.FC<{ form: FormState; checklist: ChecklistState }> = ({ form, checklist }) => {
  const isLt1 = form.lantai === 'lantai1';
  const mesinNama = isLt1
    ? (getMesinById(form.mesinId)?.nama ?? '—') + ` - Lantai 1`
    : (getMesinById(form.mesinList[0]?.mesinId)?.nama ?? '—') + ` - ${form.lantai.replace('lantai', 'Lantai ')}`;

  const totalMenit = STAGES.reduce((acc, s) => {
    const m = parseInt(checklist[s].durasi ?? '');
    return acc + (isNaN(m) ? 0 : m);
  }, 0);

  const doneStages = STAGES.filter(s => stageStatus(checklist[s]) === 'selesai').length;

  const jalurDibersihkan = !isLt1
    ? form.mesinList.flatMap(m => Object.entries(m.jalurChecked).filter(([, v]) => v).map(([k]) => k)).join(', ') || '—'
    : null;

  const telegramPreview = isLt1
    ? `${getMesinById(form.mesinId)?.nama ?? '?'} (Lt.1) sudah dibersihkan\nOperator: ${form.operator || '?'}\nProduk: ${form.produkSebelumnya || '?'} → ${form.produkSesudahnya || '?'}\nWaktu: ${fmtDate(form.tanggal)} ${form.waktuMulai}–${form.waktuSelesai}\n→ Mohon lakukan swab`
    : `${getMesinById(form.mesinList[0]?.mesinId)?.nama ?? '?'} (Lt.${form.lantai.replace('lantai','')}) sudah dibersihkan\nOperator: ${form.operator || '?'}\nProduk: ${form.produkSebelumnya || '?'}\nJalur: ${jalurDibersihkan}\nWaktu: ${fmtDate(form.tanggal)}\n→ Mohon lakukan swab`;

  const rowS: React.CSSProperties = { display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12 };
  const lS: React.CSSProperties = { color: '#6b7280', width: 150, flexShrink: 0 };
  const vS: React.CSSProperties = { color: '#111827', flex: 1, fontWeight: 500 };

  return (
    <div>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', marginBottom: 10, background: '#fff' }}>
        <div style={rowS}><span style={lS}>Mesin</span><span style={vS}>{mesinNama}</span></div>
        <div style={rowS}><span style={lS}>Operator</span><span style={vS}>{form.operator || '—'}</span></div>
        <div style={rowS}><span style={lS}>Produk Sebelumnya</span><span style={vS}>{form.produkSebelumnya || '—'}</span></div>
        {isLt1 && <div style={rowS}><span style={lS}>Produk Sesudahnya</span><span style={vS}>{form.produkSesudahnya || '—'}</span></div>}
        {!isLt1 && jalurDibersihkan && <div style={rowS}><span style={lS}>Jalur dibersihkan</span><span style={vS}>{jalurDibersihkan}</span></div>}
        {!isLt1 && <div style={rowS}><span style={lS}>Category</span><span style={vS}>{form.categoryGlobal || '—'}</span></div>}
        <div style={rowS}><span style={lS}>Total Waktu</span><span style={vS}>{totalMenit > 0 ? `${totalMenit} menit` : '—'}</span></div>
        <div style={{ ...rowS, borderBottom: 'none' }}>
          <span style={lS}>Tahapan Selesai</span>
          <span style={{ ...vS, color: doneStages === 7 ? '#15803d' : '#374151' }}>{doneStages}/7 {doneStages === 7 ? '✓' : ''}</span>
        </div>
      </div>
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 7, padding: '10px 13px', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 14 }}>⚠</span>
          <span style={{ fontWeight: 700, fontSize: 12, color: '#92400e' }}>QA Section – aktif setelah submit</span>
        </div>
        <p style={{ fontSize: 11, color: '#78350f', margin: 0 }}>Hasil swab, sign-off QA, dan remarks akan diisi oleh QA setelah menerima notifikasi</p>
      </div>
      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 7, padding: '10px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 12, color: '#15803d' }}>Preview Notifikasi Telegram ke QA</span>
        </div>
        <div style={{ background: '#dcfce7', borderRadius: 6, padding: '9px 11px', fontSize: 11, color: '#14532d', fontFamily: 'monospace', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
          {telegramPreview}
        </div>
      </div>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const INIT_FORM = (lantai: LantaiKey): FormState => ({
  lantai, tanggal: new Date().toISOString().split('T')[0],
  operator: '', mesinId: '', produkSesudahnya: '',
  produkSebelumnya: '', categoryGlobal: 'Minor',
  mesinList: [emptyMesin()],
  waktuMulai: '07:00', waktuSelesai: '', durasi: '', catatanUmum: '',
});

const LANTAI_OPTS: { value: LantaiKey; label: string }[] = [
  { value: 'lantai1', label: 'Lantai 1' }, { value: 'lantai2', label: 'Lantai 2' },
  { value: 'lantai3', label: 'Lantai 3' }, { value: 'lantai4', label: 'Lantai 4' },
];

export const CleaningRecordModal: React.FC<Props> = ({ isOpen, onClose, defaultLantai = 'lantai1', machineId, machineName }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INIT_FORM(defaultLantai));
  const [checklist, setChecklist] = useState<ChecklistState>(() => initChecklist(''));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [apiMachines, setApiMachines] = useState<ApiMachine[]>([]);
  // Track which machine the checklist was initialised for — only reset on machine change
  const [checklistMid, setChecklistMid] = useState('');

  const isLt1 = form.lantai === 'lantai1';

  // Pre-fill machineId from prop (when opened from a specific row)
  useEffect(() => {
    if (isOpen && machineId) {
      setForm(f => ({ ...f, mesinId: machineId }));
    }
  }, [isOpen, machineId]);

  // Fetch machines from backend
  useEffect(() => {
    api.get('/machines').then(res => {
      setApiMachines(res.data.data ?? []);
    }).catch(() => {});
  }, []);

  const resetAndClose = () => {
    setStep(1); setForm(INIT_FORM(defaultLantai));
    setChecklist(initChecklist('')); setChecklistMid('');
    setSubmitted(false); setSubmitting(false); setSubmitError('');
    onClose();
  };

  const handleLantaiChange = (l: LantaiKey) => {
    setForm(INIT_FORM(l));
    setChecklist(initChecklist(''));
    setChecklistMid('');
    setStep(1);
  };

  const goNext = () => {
    if (step === 1) {
      const mid = isLt1 ? form.mesinId : form.mesinList[0]?.mesinId ?? '';
      // Only reset checklist when the selected machine actually changes
      if (mid !== checklistMid) {
        setChecklist(initChecklist(mid));
        setChecklistMid(mid);
      }
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const activeMachineId = machineId ?? form.mesinId;
      if (!activeMachineId) {
        setSubmitError('Pilih mesin terlebih dahulu.');
        setSubmitting(false);
        return;
      }

      // Build checklist items from checklist state
      const items: object[] = [];
      (Object.entries(checklist) as [StageName, StageData][]).forEach(([stageName, stageData]) => {
        const stageId = parseInt(stageName.split('.')[0], 10);
        Object.entries(stageData.parts).forEach(([partName, part]) => {
          const durasiMulai = stageData.jamMulai && stageData.jamSelesai
            ? (() => {
                const [mh, mm] = stageData.jamMulai.split(':').map(Number);
                const [sh, sm] = stageData.jamSelesai.split(':').map(Number);
                let diff = (sh * 60 + sm) - (mh * 60 + mm);
                if (diff < 0) diff += 1440;
                return diff;
              })()
            : 0;
          items.push({
            stage_id:       stageId,
            part_id:        '',
            part_name:      partName,
            jam_mulai:      stageData.jamMulai || '',
            jam_selesai:    stageData.jamSelesai || '',
            durasi_menit:   durasiMulai,
            is_checked:     part.checked,
            keterangan:     part.keterangan || '',
            notes:          '',
            signature_name: part.signature || '',
          });
        });
      });

      const durasiMenit = form.durasi ? parseInt(form.durasi, 10) : 0;

      await api.post('/cleaning/records', {
        machine_id:         activeMachineId,
        cleaning_date:      form.tanggal,
        cleaning_type:      form.categoryGlobal || 'Minor',
        produk_sebelumnya:  form.produkSebelumnya,
        produk_sesudahnya:  form.produkSesudahnya,
        waktu_mulai:        form.waktuMulai || '',
        waktu_selesai:      form.waktuSelesai || '',
        durasi_menit:       isNaN(durasiMenit) ? 0 : durasiMenit,
        catatan:            form.catatanUmum,
        items,
      });

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? 'Gagal submit. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 640, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 18px 0', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ paddingBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2744', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Cleaning Record</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {LANTAI_OPTS.map(o => (
                <button key={o.value} onClick={() => handleLantaiChange(o.value)} style={{ padding: '2px 10px', fontSize: 11, borderRadius: 99, border: `1.5px solid ${form.lantai === o.value ? '#1a7fd4' : '#e5e7eb'}`, background: form.lantai === o.value ? '#eff6ff' : '#fff', color: form.lantai === o.value ? '#1a7fd4' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit', fontWeight: form.lantai === o.value ? 700 : 400 }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={resetAndClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, padding: 4, lineHeight: 1 }}>✕</button>
        </div>

        {!submitted && <div style={{ padding: '0 18px' }}><StepBar step={step} /></div>}

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 14px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>✓</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 5 }}>Berhasil disubmit!</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>Notifikasi Telegram ke QA sudah terkirim. Menunggu approval QA.</div>
              <button onClick={resetAndClose} style={{ padding: '7px 22px', fontSize: 13, borderRadius: 6, border: 'none', background: '#1a7fd4', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Tutup</button>
            </div>
          ) : step === 1 ? (
            isLt1 ? <Step1Lantai1 form={form} setForm={setForm} apiMachines={apiMachines} lockedMachineName={machineName} /> : <Step1Lantai234 form={form} setForm={setForm} />
          ) : step === 2 ? (
            <Step2 form={form} checklist={checklist} setChecklist={setChecklist} />
          ) : (
            <Step3 form={form} checklist={checklist} />
          )}
        </div>

        {!submitted && (
          <div style={{ padding: '10px 18px', borderTop: '1px solid #e5e7eb' }}>
            {submitError && (
              <div style={{ marginBottom: 8, padding: '6px 10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 11, color: '#b91c1c' }}>
                {submitError}
              </div>
            )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>Step {step} dari 3</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => step > 1 ? setStep(s => s - 1) : resetAndClose()} style={{ padding: '7px 15px', fontSize: 12, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                {step === 1 ? 'Batal' : 'Kembali'}
              </button>
              {step < 3
                ? <button onClick={goNext} style={{ padding: '7px 16px', fontSize: 12, borderRadius: 6, border: 'none', background: '#1a7fd4', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                    Lanjut ke {step === 1 ? 'Checklist' : 'Review'} →
                  </button>
                : <button onClick={handleSubmit} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', fontSize: 12, borderRadius: 6, border: 'none', background: submitting ? '#93c5fd' : '#1a7fd4', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    {submitting ? 'Menyimpan...' : 'Submit & Notify to QA'}
                  </button>
              }
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CleaningRecordModal;
