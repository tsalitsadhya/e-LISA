import React, { useState, useEffect } from 'react';
import { MasterPart, MesinTipe } from './masterDataStore';
import { STAGES, StageName } from './machineData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (part: Omit<MasterPart, 'id' | 'createdAt'>) => void;
  editData?: MasterPart | null;
}

const TIPE_OPTIONS: MesinTipe[] = ['RVS', 'TOYO', 'WB', 'K1R', 'MF', 'TS', 'DS'];

const inputS: React.CSSProperties = {
  width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6,
  border: '1px solid #d1d5db', background: '#fff', color: '#111827',
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
const labelS: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4,
};
const req = <span style={{ color: '#ef4444' }}>*</span>;

export const PartModal: React.FC<Props> = ({ isOpen, onClose, onSave, editData }) => {
  const [nama, setNama] = useState('');
  const [tipes, setTipes] = useState<MesinTipe[]>([]);
  const [stages, setStages] = useState<StageName[]>([]);
  const [urutan, setUrutan] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setNama(editData.nama);
      setTipes(editData.tipesMesin);
      setStages(editData.stages);
      setUrutan(editData.urutan);
      setIsActive(editData.isActive);
    } else {
      setNama(''); setTipes([]); setStages([]); setUrutan(1); setIsActive(true);
    }
    setError('');
  }, [editData, isOpen]);

  const toggleTipe = (t: MesinTipe) =>
    setTipes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const toggleStage = (s: StageName) =>
    setStages(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    if (!nama.trim()) { setError('Nama part wajib diisi.'); return; }
    if (tipes.length === 0) { setError('Pilih minimal 1 tipe mesin.'); return; }
    if (stages.length === 0) { setError('Pilih minimal 1 tahap cleaning.'); return; }
    onSave({ nama: nama.trim(), tipesMesin: tipes, stages, urutan, isActive });
    onClose();
  };

  if (!isOpen) return null;

  const TIPE_COLORS: Record<string, string> = {
    RVS: '#185FA5', TOYO: '#534AB7', WB: '#0F6E56',
    K1R: '#854F0B', MF: '#993556', TS: '#854F0B', DS: '#5F5E5A',
  };
  const TIPE_BG: Record<string, string> = {
    RVS: '#E6F1FB', TOYO: '#EEEDFE', WB: '#E1F5EE',
    K1R: '#FAEEDA', MF: '#FBEAF0', TS: '#FAEEDA', DS: '#F1EFE8',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2744' }}>
              {editData ? 'Edit Item Part' : 'Tambah Item Part Baru'}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
              Part akan otomatis muncul di checklist cleaning sesuai tipe mesin & tahap
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Nama */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelS}>Nama Part / Komponen {req}</label>
            <input
              type="text" value={nama} onChange={e => setNama(e.target.value)}
              placeholder="contoh: Chamber, Nozzle, Pipa Discharge..."
              style={inputS}
            />
          </div>

          {/* Tipe Mesin */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelS}>Berlaku untuk Tipe Mesin {req}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {TIPE_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTipe(t)}
                  style={{
                    padding: '5px 14px', fontSize: 12, borderRadius: 99, cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: tipes.includes(t) ? 700 : 400,
                    border: `1.5px solid ${tipes.includes(t) ? TIPE_COLORS[t] : '#e5e7eb'}`,
                    background: tipes.includes(t) ? TIPE_BG[t] : '#fff',
                    color: tipes.includes(t) ? TIPE_COLORS[t] : '#9ca3af',
                    transition: 'all 0.15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
              Pilih lebih dari satu jika part ini sama di beberapa tipe mesin
            </div>
          </div>

          {/* Tahap Cleaning */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelS}>Berlaku di Tahap Cleaning {req}</label>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginTop: 4 }}>
              {STAGES.map((stage, i) => (
                <label
                  key={stage}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', cursor: 'pointer',
                    borderBottom: i < STAGES.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: stages.includes(stage) ? '#f0f9ff' : '#fff',
                    transition: 'background 0.1s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={stages.includes(stage)}
                    onChange={() => toggleStage(stage)}
                    style={{ width: 15, height: 15, accentColor: '#1a7fd4', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: stages.includes(stage) ? '#1a7fd4' : '#374151', fontWeight: stages.includes(stage) ? 600 : 400 }}>
                    {stage}
                  </span>
                  {stages.includes(stage) && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, background: '#dbeafe', color: '#1d4ed8', padding: '1px 7px', borderRadius: 99, fontWeight: 600 }}>
                      Aktif
                    </span>
                  )}
                </label>
              ))}
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button onClick={() => setStages([...STAGES])} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151', fontFamily: 'inherit' }}>
                Pilih semua
              </button>
              <button onClick={() => setStages([])} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151', fontFamily: 'inherit' }}>
                Hapus pilihan
              </button>
            </div>
          </div>

          {/* Urutan & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelS}>Urutan tampil di checklist</label>
              <input
                type="number" min={1} max={99} value={urutan}
                onChange={e => setUrutan(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ ...inputS, width: '100%' }}
              />
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                Part diurutkan dari kecil ke besar
              </div>
            </div>
            <div>
              <label style={labelS}>Status</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {[true, false].map(v => (
                  <button
                    key={String(v)}
                    onClick={() => setIsActive(v)}
                    style={{
                      flex: 1, padding: '7px 0', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                      fontFamily: 'inherit', fontWeight: isActive === v ? 600 : 400,
                      border: `1.5px solid ${isActive === v ? (v ? '#22c55e' : '#ef4444') : '#e5e7eb'}`,
                      background: isActive === v ? (v ? '#f0fdf4' : '#fef2f2') : '#fff',
                      color: isActive === v ? (v ? '#15803d' : '#dc2626') : '#9ca3af',
                    }}
                  >
                    {v ? 'Aktif' : 'Nonaktif'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {nama && tipes.length > 0 && stages.length > 0 && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Preview — akan muncul di checklist
              </div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.8 }}>
                <div><span style={{ color: '#6b7280' }}>Nama:</span> <strong>{nama}</strong></div>
                <div><span style={{ color: '#6b7280' }}>Tipe mesin:</span> {tipes.join(', ')}</div>
                <div><span style={{ color: '#6b7280' }}>Tahap:</span> {stages.length} tahap dipilih</div>
                <div><span style={{ color: '#6b7280' }}>Urutan:</span> #{urutan}</div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 7, padding: '8px 12px', fontSize: 12, color: '#dc2626', marginTop: 12 }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 16px', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
            Batal
          </button>
          <button onClick={handleSave} style={{ padding: '7px 20px', fontSize: 13, borderRadius: 6, border: 'none', background: '#1a7fd4', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
            {editData ? 'Simpan Perubahan' : 'Tambah Part'}
          </button>
        </div>
      </div>
    </div>
  );
};
