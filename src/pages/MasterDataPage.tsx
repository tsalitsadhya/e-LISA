import React, { useState, useMemo } from 'react';
import {
  type MasterMachine, type MasterPart, type MachineType, type FloorKey, type StageName,
  MASTER_MACHINES_INITIAL, MASTER_PARTS_INITIAL,
  ALL_STAGES, TYPE_TO_FLOOR, FLOOR_TO_SUBLABEL, FLOOR_RULE,
  LT234_TYPES, TYPE_COLORS,
} from './masterData';

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  input: { width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const },
  select: { fontSize: 12, padding: '5px 26px 5px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', appearance: 'none' as const, WebkitAppearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' },
  label: { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, color: '#374151', marginBottom: 4 },
  field: { marginBottom: 13 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  req: { color: '#ef4444', marginLeft: 2 },
  th: { padding: '8px 12px', textAlign: 'left' as const, fontSize: 11, fontWeight: 600 as const, color: '#374151', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' as const },
  td: { padding: '9px 12px', fontSize: 12, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' as const },
};

// ─── Badges ───────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: MachineType }) {
  const c = TYPE_COLORS[type] || { bg: '#f3f4f6', color: '#374151' };
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>{type}</span>;
}

function StatusBadge({ status }: { status: 'Active' | 'Inactive' }) {
  const active = status === 'Active';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: active ? '#dcfce7' : '#f3f4f6', color: active ? '#15803d' : '#6b7280' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#22c55e' : '#d1d5db', display: 'inline-block' }} />{status}
    </span>
  );
}

function ActionBtns({ onView, onEdit, onDelete }: { onView?: () => void; onEdit: () => void; onDelete: () => void }) {
  const btn = (label: string, color: string, hoverBg: string, onClick: () => void) => (
    <button onClick={onClick} style={{ padding: '3px 9px', fontSize: 11, borderRadius: 5, border: `1px solid ${color}`, background: 'transparent', color, cursor: 'pointer', fontFamily: 'inherit' }}
      onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >{label}</button>
  );
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {onView && btn('View', '#185FA5', '#E6F1FB', onView)}
      {btn('Edit', '#854d0e', '#fef9c3', onEdit)}
      {btn('Delete', '#A32D2D', '#FCEBEB', onDelete)}
    </div>
  );
}

// ─── Summary Cards ─────────────────────────────────────────────────────────────
function SummaryCards({ machines }: { machines: MasterMachine[] }) {
  const total = machines.length;
  const rvs   = machines.filter(m => m.type === 'RVS').length;
  const toyo  = machines.filter(m => m.type === 'TOYO').length;
  const lt234 = machines.filter(m => m.type !== 'RVS' && m.type !== 'TOYO').length;
  const cards = [
    { label: 'Total mesin', value: total, bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc' },
    { label: 'RVS (Lantai 1)', value: rvs, bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
    { label: 'TOYO (Lantai 1)', value: toyo, bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    { label: 'Lantai 2/3/4', value: lt234, bg: '#fce7f3', color: '#9d174d', border: '#f9a8d4' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 14 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: c.color, marginBottom: 4 }}>{c.label}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Modal: Tambah/Edit Mesin ─────────────────────────────────────────────────
function MesinModal({ initial, onSave, onClose }: { initial?: MasterMachine; onSave: (m: MasterMachine) => void; onClose: () => void }) {
  const [name, setName]         = useState(initial?.name ?? '');
  const [type, setType]         = useState<MachineType | ''>(initial?.type ?? '');
  const [floor, setFloor]       = useState<FloorKey>(initial?.location ?? 'Lantai 1');
  const [subLabel, setSubLabel] = useState(initial?.subLabel ?? '');
  const [kode, setKode]         = useState(initial?.kode ?? '');
  const [jalur, setJalur]       = useState<string[]>(initial?.jalur ?? []);
  const [newJalur, setNewJalur] = useState('');

  const autoId    = type && name ? `${type}-${name.replace(/\s+/g, '-').toUpperCase()}` : '';
  const displayId = kode || autoId || '(isi nama & tipe dulu)';
  const isLt234   = type ? LT234_TYPES.includes(type) : false;
  const fieldsDone = [name, type].filter(Boolean).length;

  const handleTypeChange = (t: MachineType) => {
    setType(t);
    const lt = TYPE_TO_FLOOR[t];
    setFloor(lt);
    setSubLabel(FLOOR_TO_SUBLABEL[lt]);
    if (!LT234_TYPES.includes(t)) setJalur([]);
  };

  const handleSave = () => {
    if (!name || !type) { alert('Nama mesin dan tipe wajib diisi.'); return; }
    onSave({ id: initial?.id ?? `${type}-${Date.now()}`, name, type, location: floor, subLabel, kode: kode || autoId, status: initial?.status ?? 'Active', createdAt: initial?.createdAt ?? new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }), jalur });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{initial ? `Edit Mesin — ${initial.name}` : 'Tambah Mesin Baru'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Informasi Dasar</div>
          <div style={S.grid2}>
            <div style={S.field}>
              <label style={S.label}>Nama Mesin <span style={S.req}>*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="contoh : RVS Q" style={S.input} />
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>Nama yang tampil di tabel & form cleaning</div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Tipe Mesin <span style={S.req}>*</span></label>
              <select value={type} onChange={e => handleTypeChange(e.target.value as MachineType)} style={{ ...S.select, width: '100%', fontSize: 13, padding: '7px 28px 7px 10px' }}>
                <option value="">Pilih tipe...</option>
                {(['RVS','TOYO','WB','K1R','MF','TS','DS'] as MachineType[]).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>Menentukan template checklist & aturan cleaning</div>
            </div>
          </div>
          <div style={S.grid2}>
            <div style={S.field}>
              <label style={S.label}>Lantai <span style={S.req}>*</span></label>
              <select value={floor} onChange={e => { setFloor(e.target.value as FloorKey); setSubLabel(FLOOR_TO_SUBLABEL[e.target.value as FloorKey]); }} style={{ ...S.select, width: '100%', fontSize: 13, padding: '7px 28px 7px 10px' }}>
                {(['Lantai 1','Lantai 2','Lantai 3','Lantai 4'] as FloorKey[]).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Sub Label <span style={S.req}>*</span></label>
              <input value={subLabel} readOnly style={{ ...S.input, background: subLabel ? '#f0f9ff' : '#f9fafb', borderColor: subLabel ? '#bae6fd' : '#e5e7eb', color: '#0369a1', fontWeight: subLabel ? 500 : 400 }} />
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>Otomatis terisi berdasarkan tipe & lantai</div>
            </div>
          </div>
          {FLOOR_RULE[floor] && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, padding: '7px 12px', fontSize: 11, color: '#374151', marginBottom: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#6b7280"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              Aturan cleaning : {FLOOR_RULE[floor]}
            </div>
          )}
          <div style={S.field}>
            <label style={S.label}>ID/Kode Mesin <span style={S.req}>*</span></label>
            <input value={kode} onChange={e => setKode(e.target.value)} placeholder="contoh : RVS Q" style={S.input} />
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>kode harus unik</div>
            <div style={{ marginTop: 6, padding: '6px 10px', borderRadius: 5, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 12, color: '#1d4ed8' }}>
              ID yang akan digunakan: {displayId}
            </div>
          </div>
          {isLt234 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '6px 0 4px' }}>Jalur/Part (Khusus Lantai 2/3/4)</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>Jalur yang muncul sebagai checkbox di form input cleaning record</div>
              {jalur.map((j, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, marginBottom: 5 }}>
                  <span style={{ flex: 1, fontSize: 12 }}>{j}</span>
                  <button onClick={() => setJalur(prev => prev.filter((_, idx) => idx !== i))} style={{ padding: '2px 9px', fontSize: 11, borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit' }}>Hapus</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <input value={newJalur} onChange={e => setNewJalur(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newJalur.trim()) { setJalur(j => [...j, newJalur.trim()]); setNewJalur(''); }}} placeholder={`Kode jalur baru, contoh : K1R${jalur.length + 1}P01DP001`} style={{ ...S.input, flex: 1, fontSize: 12 }} />
                <button onClick={() => { if (newJalur.trim()) { setJalur(j => [...j, newJalur.trim()]); setNewJalur(''); }}} style={{ padding: '7px 12px', fontSize: 12, borderRadius: 6, border: '1px solid #185FA5', background: '#185FA5', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>+ Tambah Jalur</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: fieldsDone >= 2 ? '#15803d' : '#9ca3af' }}>{fieldsDone >= 2 ? '✓ Siap disimpan' : `${fieldsDone}/2 field wajib terisi`}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '7px 14px', fontSize: 12, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
            <button onClick={handleSave} style={{ padding: '7px 18px', fontSize: 12, borderRadius: 6, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Simpan Mesin</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Tambah/Edit Part ──────────────────────────────────────────────────
function PartModal({ initial, onSave, onClose }: { initial?: MasterPart; onSave: (p: MasterPart) => void; onClose: () => void }) {
  const [name, setName]     = useState(initial?.name ?? '');
  const [types, setTypes]   = useState<MachineType[]>(initial?.machineTypes ?? []);
  const [stages, setStages] = useState<StageName[]>(initial?.stages ?? []);
  const [urutan, setUrutan] = useState(initial?.urutan ?? 1);
  const ALL_TYPES: MachineType[] = ['RVS','TOYO','WB','K1R','MF'];
  const toggleType  = (t: MachineType) => setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const toggleAll   = () => setTypes(prev => prev.length === ALL_TYPES.length ? [] : [...ALL_TYPES]);
  const toggleStage = (s: StageName) => setStages(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const fieldsDone  = [name, types.length > 0, stages.length > 0].filter(Boolean).length;
  const handleSave  = () => {
    if (!name || types.length === 0) { alert('Nama part dan tipe mesin wajib diisi.'); return; }
    if (stages.length === 0) { alert('Pilih minimal 1 tahap cleaning.'); return; }
    onSave({ id: initial?.id ?? `P-${Date.now()}`, name, machineTypes: types, stages, urutan, status: initial?.status ?? 'Active', createdAt: initial?.createdAt ?? new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 600, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Tambah Item Part/ Checklist</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#1d4ed8', marginBottom: 14, display: 'flex', gap: 7 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            Part yang ditambah akan otomatis muncul di checklist form cleaning sesuai tipe mesin & tahap yang dipilih.
          </div>
          <div style={S.field}>
            <label style={S.label}>Nama Part <span style={S.req}>*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="contoh : Rotary Valve, dll" style={S.input} />
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>Nama yang tampil di tabel checklist saat operator mengisi form cleaning</div>
          </div>
          <div style={S.field}>
            <label style={S.label}>Berlaku untuk Tipe Mesin <span style={S.req}>*</span></label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {ALL_TYPES.map(t => {
                const active = types.includes(t);
                const c = TYPE_COLORS[t];
                return <button key={t} onClick={() => toggleType(t)} style={{ padding: '4px 14px', fontSize: 12, borderRadius: 99, border: `1px solid ${active ? c.color : '#d1d5db'}`, background: active ? c.bg : '#fff', color: active ? c.color : '#6b7280', cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 600 : 400 }}>{t}</button>;
              })}
              <button onClick={toggleAll} style={{ padding: '4px 14px', fontSize: 12, borderRadius: 99, border: `1px solid ${types.length === ALL_TYPES.length ? '#374151' : '#d1d5db'}`, background: types.length === ALL_TYPES.length ? '#f3f4f6' : '#fff', color: types.length === ALL_TYPES.length ? '#111827' : '#6b7280', cursor: 'pointer', fontFamily: 'inherit', fontWeight: types.length === ALL_TYPES.length ? 600 : 400 }}>Semua Tipe</button>
            </div>
          </div>
          <div style={S.field}>
            <label style={S.label}>Muncul di Tahap Mana <span style={S.req}>*</span></label>
            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>Centang tahap cleaning di mana part ini perlu dicek</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {ALL_STAGES.map(s => {
                const active = stages.includes(s);
                return (
                  <label key={s} onClick={() => toggleStage(s)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: `1px solid ${active ? '#185FA5' : '#e5e7eb'}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, background: active ? '#eff6ff' : '#fff', color: active ? '#185FA5' : '#374151', fontWeight: active ? 500 : 400, userSelect: 'none' }}>
                    <input type="checkbox" checked={active} onChange={() => toggleStage(s)} style={{ width: 14, height: 14, accentColor: '#185FA5', cursor: 'pointer' }} />
                    {s}
                  </label>
                );
              })}
            </div>
          </div>
          <div style={{ ...S.field, maxWidth: 200 }}>
            <label style={S.label}>Urutan Tampil</label>
            <input type="number" value={urutan} min={1} max={99} onChange={e => setUrutan(+e.target.value)} style={S.input} />
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>Urutan part dalam tabel checklist (angka kecil = tampil lebih dulu)</div>
          </div>
          {name && types.length > 0 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 7, padding: '10px 13px', marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#15803d', marginBottom: 8 }}>Preview — akan ditambahkan sebagai</div>
              {[['Nama Part', name], ['Tipe mesin', types.join(', ')], ['Urutan', String(urutan)]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#6b7280', width: 90 }}>{k}</span>
                  <span style={{ fontWeight: 500, color: '#111827' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'flex-start' }}>
                <span style={{ color: '#6b7280', width: 90, flexShrink: 0 }}>Muncul di tahap</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {stages.map(s => <span key={s} style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, background: '#dcfce7', color: '#15803d', fontWeight: 500 }}>{s}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: fieldsDone >= 3 ? '#15803d' : '#9ca3af' }}>{fieldsDone >= 3 ? '✓ Siap disimpan' : `${fieldsDone}/3 field wajib terisi`}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '7px 14px', fontSize: 12, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
            <button onClick={handleSave} style={{ padding: '7px 18px', fontSize: 12, borderRadius: 6, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Simpan Part</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Daftar Mesin ────────────────────────────────────────────────────────
function DaftarMesinTab() {
  const [machines, setMachines] = useState<MasterMachine[]>(MASTER_MACHINES_INITIAL);
  const [search, setSearch]     = useState('');
  const [fType, setFType]       = useState('');
  const [fLoc, setFLoc]         = useState('');
  const [fStatus, setFStatus]   = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<MasterMachine | undefined>();

  const filtered = useMemo(() => machines.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fType && m.type !== fType) return false;
    if (fLoc && m.location !== fLoc) return false;
    if (fStatus && m.status !== fStatus) return false;
    return true;
  }), [machines, search, fType, fLoc, fStatus]);

  const handleSave = (m: MasterMachine) => {
    setMachines(prev => { const idx = prev.findIndex(x => x.id === m.id); return idx >= 0 ? prev.map(x => x.id === m.id ? m : x) : [...prev, m]; });
    setModalOpen(false); setEditTarget(undefined);
  };

  const sel = (w = 130) => ({ ...S.select, width: w, height: 34 });

  return (
    <div>
      <SummaryCards machines={machines} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="#9ca3af"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span>
          <input placeholder="Cari nama mesin..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, paddingLeft: 28, width: 180, height: 34, cursor: 'text' }} />
        </div>
        <select value={fType} onChange={e => setFType(e.target.value)} style={sel()}>
          <option value="">All Machines</option>
          {(['RVS','TOYO','WB','K1R','MF'] as MachineType[]).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={fLoc} onChange={e => setFLoc(e.target.value)} style={sel()}>
          <option value="">All Location</option>
          {(['Lantai 1','Lantai 2','Lantai 3','Lantai 4'] as FloorKey[]).map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={sel(110)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button onClick={() => { setEditTarget(undefined); setModalOpen(true); }} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', fontSize: 12, borderRadius: 6, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', height: 34 }}>+ Add machine</button>
      </div>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup><col style={{ width:'16%' }}/><col style={{ width:'10%' }}/><col style={{ width:'11%' }}/><col style={{ width:'14%' }}/><col style={{ width:'10%' }}/><col style={{ width:'14%' }}/><col style={{ width:'25%' }}/></colgroup>
          <thead><tr>{['Mesin','Tipe','Lokasi','Kode Mesin','Status','Dibuat','Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} style={{ ...S.td, textAlign:'center', color:'#9ca3af', padding:'2rem' }}>Tidak ada data.</td></tr>
              : filtered.map((m, i) => (
                <tr key={m.id} onMouseEnter={e => (e.currentTarget.style.background='#f9fafb')} onMouseLeave={e => (e.currentTarget.style.background=i%2===0?'#fff':'#fafafa')} style={{ background: i%2===0?'#fff':'#fafafa' }}>
                  <td style={{ ...S.td, fontWeight: 500 }}>{m.name}</td>
                  <td style={S.td}><TypeBadge type={m.type} /></td>
                  <td style={{ ...S.td, fontSize: 11 }}>{m.location}</td>
                  <td style={{ ...S.td, fontSize: 11, color: '#6b7280' }}>{m.kode}</td>
                  <td style={S.td}><StatusBadge status={m.status} /></td>
                  <td style={{ ...S.td, fontSize: 11, color: '#9ca3af' }}>{m.createdAt}</td>
                  <td style={S.td}><ActionBtns onEdit={() => { setEditTarget(m); setModalOpen(true); }} onDelete={() => { if (confirm('Yakin hapus?')) setMachines(prev => prev.filter(x => x.id !== m.id)); }} /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#9ca3af' }}>Menampilkan {filtered.length} dari {machines.length} mesin</div>
      {modalOpen && <MesinModal initial={editTarget} onSave={handleSave} onClose={() => { setModalOpen(false); setEditTarget(undefined); }} />}
    </div>
  );
}

// ─── Tab: Item Part / Checklist ───────────────────────────────────────────────
function ItemPartTab({ machines }: { machines: MasterMachine[] }) {
  const [parts, setParts]       = useState<MasterPart[]>(MASTER_PARTS_INITIAL);
  const [search, setSearch]     = useState('');
  const [fType, setFType]       = useState('');
  const [fStage, setFStage]     = useState('');
  const [fStatus, setFStatus]   = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<MasterPart | undefined>();

  const filtered = useMemo(() => parts.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fType && !p.machineTypes.includes(fType as MachineType)) return false;
    if (fStage && !p.stages.includes(fStage as StageName)) return false;
    if (fStatus && p.status !== fStatus) return false;
    return true;
  }), [parts, search, fType, fStage, fStatus]);

  const handleSave = (p: MasterPart) => {
    setParts(prev => { const idx = prev.findIndex(x => x.id === p.id); return idx >= 0 ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]; });
    setModalOpen(false); setEditTarget(undefined);
  };

  const sel = (w = 140) => ({ ...S.select, width: w, height: 34 });

  return (
    <div>
      <SummaryCards machines={machines} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="#9ca3af"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span>
          <input placeholder="Cari nama part..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, paddingLeft: 28, width: 180, height: 34, cursor: 'text' }} />
        </div>
        <select value={fType} onChange={e => setFType(e.target.value)} style={sel()}>
          <option value="">All Machines</option>
          {(['RVS','TOYO','WB','K1R','MF'] as MachineType[]).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={fStage} onChange={e => setFStage(e.target.value)} style={sel(160)}>
          <option value="">All Location</option>
          {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={sel(110)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button onClick={() => { setEditTarget(undefined); setModalOpen(true); }} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', fontSize: 12, borderRadius: 6, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', height: 34 }}>+ Add Item Part</button>
      </div>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup><col style={{ width:'18%' }}/><col style={{ width:'11%' }}/><col style={{ width:'22%' }}/><col style={{ width:'8%' }}/><col style={{ width:'10%' }}/><col style={{ width:'13%' }}/><col style={{ width:'18%' }}/></colgroup>
          <thead><tr>{['Nama Part','Tipe','Tahap Cleaning','Urutan','Status','Dibuat','Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} style={{ ...S.td, textAlign:'center', color:'#9ca3af', padding:'2rem' }}>Tidak ada data.</td></tr>
              : filtered.map((p, i) => (
                <tr key={p.id} onMouseEnter={e => (e.currentTarget.style.background='#f9fafb')} onMouseLeave={e => (e.currentTarget.style.background=i%2===0?'#fff':'#fafafa')} style={{ background: i%2===0?'#fff':'#fafafa' }}>
                  <td style={{ ...S.td, fontWeight: 500 }}>{p.name}</td>
                  <td style={S.td}><div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>{p.machineTypes.map(t => <TypeBadge key={t} type={t} />)}</div></td>
                  <td style={{ ...S.td, fontSize: 11 }}>
                    <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                      {p.stages.slice(0,2).map(s => <span key={s} style={{ padding:'1px 6px', borderRadius:99, fontSize:10, background:'#f3f4f6', color:'#374151' }}>{s}</span>)}
                      {p.stages.length > 2 && <span style={{ fontSize:10, color:'#9ca3af' }}>+{p.stages.length-2}</span>}
                    </div>
                  </td>
                  <td style={{ ...S.td, textAlign:'center' }}>{p.urutan}</td>
                  <td style={S.td}><StatusBadge status={p.status} /></td>
                  <td style={{ ...S.td, fontSize:11, color:'#9ca3af' }}>{p.createdAt}</td>
                  <td style={S.td}><ActionBtns onView={() => {}} onEdit={() => { setEditTarget(p); setModalOpen(true); }} onDelete={() => { if (confirm('Yakin hapus?')) setParts(prev => prev.filter(x => x.id !== p.id)); }} /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#9ca3af' }}>Menampilkan {filtered.length} dari {parts.length} part</div>
      {modalOpen && <PartModal initial={editTarget} onSave={handleSave} onClose={() => { setModalOpen(false); setEditTarget(undefined); }} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const MasterDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mesin' | 'part'>('mesin');
  const [machines] = useState<MasterMachine[]>(MASTER_MACHINES_INITIAL);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', fontSize: 14, border: 'none', background: 'transparent',
    cursor: 'pointer', fontFamily: 'inherit',
    color: active ? '#185FA5' : '#6b7280', fontWeight: active ? 700 : 400,
    borderBottom: active ? '2.5px solid #185FA5' : '2.5px solid transparent',
    marginBottom: -2, transition: 'color 0.15s',
  });

  return (
    <div style={{ padding: '16px 24px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 16 }}>
        <button style={tabStyle(activeTab === 'mesin')} onClick={() => setActiveTab('mesin')}>Daftar Mesin</button>
        <button style={tabStyle(activeTab === 'part')} onClick={() => setActiveTab('part')}>Item Part / Checklist</button>
      </div>
      {activeTab === 'mesin' && <DaftarMesinTab />}
      {activeTab === 'part' && <ItemPartTab machines={machines} />}
    </div>
  );
};

export default MasterDataPage;
