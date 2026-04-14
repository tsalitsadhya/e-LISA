import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type ReadinessStatus = 'ready' | 'warning' | 'out_of_spec' | 'no_data';

interface SensorReading {
  value: number | null;
  timestamp: string | null;
  status: ReadinessStatus;
}

interface BMSLine {
  line_id: string;
  display_name: string;
  temperature: SensorReading;
  humidity: SensorReading;
  status: ReadinessStatus;
}

interface BmsData { machineName: string; temperature: number; humidity: number; lastUpdated: string; status: ReadinessStatus; }

interface HistoryRow { date: string; time: string; line: string; refreshedBy: string; }

// ─── Static / fallback ────────────────────────────────────────────────────────
const HISTORY: HistoryRow[] = [
  { date: '02/15/2026', time: '10:03', line: 'Filling 13', refreshedBy: 'Jhonathan Dermawan' },
  { date: '02/01/2026', time: '09:54', line: 'Filling 14', refreshedBy: 'Jhonathan Dermawan' },
];
const ITEMS_PER_PAGE = 3;

const STATUS_CFG = {
  ready:       { label: 'READY',        color: '#15803d', bg: '#f0fdf4', iconBg: '#22c55e', btnBg: '#22c55e', btnLabel: 'Mark as Approved', borderColor: '#86efac' },
  warning:     { label: 'WARNING',      color: '#d97706', bg: '#fffbeb', iconBg: '#f59e0b', btnBg: '#f59e0b', btnLabel: 'Calling Maintenance', borderColor: '#fde68a' },
  out_of_spec: { label: 'OUT OF SPEC',  color: '#dc2626', bg: '#fef2f2', iconBg: '#ef4444', btnBg: '#ef4444', btnLabel: 'Send Notify to Maintenance', borderColor: '#fca5a5' },
};

// ─── Modals ───────────────────────────────────────────────────────────────────
function OutOfSpecModal({ data, line, onClose }: { data: BmsData; line: string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 24, width: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Out of Specification</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, marginBottom: 20, lineHeight: 2.2 }}>
          {[['Temperature:', `${data.temperature}°C`], ['Humidity:', `${data.humidity}%`]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 16 }}>
              <span style={{ color: '#6b7280', width: 100 }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 7, border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            Send Notify to Maintenance
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmReadyModal({ data, line, onClose, onConfirm }: { data: BmsData; line: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 24, width: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Confirm Room Readiness</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, marginBottom: 8, lineHeight: 2.2 }}>
          {[['Temperature:', `${data.temperature}°C`], ['Humidity:', `${data.humidity}%`], ['Line:', line.replace('Line ','')], ['Machine Name:', data.machineName]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 16 }}>
              <span style={{ color: '#6b7280', width: 120 }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 20 }}>This action will record the room as READY for production</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', fontSize: 13, borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 24px', fontSize: 13, borderRadius: 7, border: 'none', background: '#1a7fd4', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ─── Monitoring Tab ───────────────────────────────────────────────────────────
function MonitoringTab() {
  const [bmsLines,   setBmsLines]   = useState<BMSLine[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');
  const [page,       setPage]       = useState(1);
  const [modal,      setModal]      = useState<'out_of_spec' | 'confirm_ready' | null>(null);
  const [approved,   setApproved]   = useState(false);

  const fetchBMS = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    setError('');
    try {
      const res = await api.get('/room/bms');
      const lines: BMSLine[] = res.data.data ?? [];
      setBmsLines(lines);
      if (!selectedId && lines.length > 0) setSelectedId(lines[0].line_id);
    } catch {
      setError('BMS tidak tersedia. Pastikan koneksi ke ICONICS aktif.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedId]);

  useEffect(() => { fetchBMS(); }, []);

  // Auto-refresh setiap 60 detik
  useEffect(() => {
    const t = setInterval(() => fetchBMS(), 60_000);
    return () => clearInterval(t);
  }, [fetchBMS]);

  const current = bmsLines.find(l => l.line_id === selectedId) ?? null;
  const status  = approved ? 'ready' : (current?.status ?? 'no_data');
  const cfg     = STATUS_CFG[status === 'no_data' ? 'warning' : status as keyof typeof STATUS_CFG];
  const totalPages   = Math.ceil(HISTORY.length / ITEMS_PER_PAGE);
  const pagedHistory = HISTORY.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const fmtTs = (ts: string | null) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const selectStyle = (w?: number): React.CSSProperties => ({
    fontSize: 13, padding: '5px 26px 5px 10px', borderRadius: 6, border: '1px solid #d1d5db',
    background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
    appearance: 'none', WebkitAppearance: 'none', width: w,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
  });

  return (
    <div style={{ padding: '16px 24px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Error banner */}
      {error && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#b91c1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button onClick={() => fetchBMS(true)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#b91c1c', textDecoration: 'underline', fontSize: 12 }}>Retry</button>
        </div>
      )}

      {/* Line selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Line:</span>
        <select
          value={selectedId}
          onChange={e => { setSelectedId(e.target.value); setApproved(false); }}
          style={selectStyle(180)}
          disabled={loading || bmsLines.length === 0}>
          {loading
            ? <option>Memuat...</option>
            : bmsLines.map(l => <option key={l.line_id} value={l.line_id}>{l.display_name}</option>)}
        </select>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Lantai 1 — ICONICS HH</span>
      </div>

      {/* BMS Card */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1a2744' }}>Temperature & Humidity Data (BMS)</span>
          <button onClick={() => fetchBMS(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, borderRadius: 6, border: 'none', background: '#1a7fd4', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
            {refreshing ? 'Refreshing...' : 'Refresh Data BMS'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: 13 }}>Menghubungkan ke ICONICS Hyper Historian…</div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Sensor data */}
          <div style={{ background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', padding: '16px 20px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 16 }}>
              {current?.display_name ?? '—'} <span style={{ fontWeight: 400, color: '#9ca3af' }}>(Source: BMS)</span>
            </div>
            {[
              { icon: '🌡', label: 'Temperature:', value: current?.temperature.value != null ? `${current.temperature.value.toFixed(1)}°C` : '—', sub: current?.temperature.status, ts: current?.temperature.timestamp, iconBg: '#fee2e2' },
              { icon: '💧', label: 'Humidity:',    value: current?.humidity.value    != null ? `${current.humidity.value.toFixed(1)}%`   : '—', sub: current?.humidity.status,    ts: current?.humidity.timestamp,    iconBg: '#dbeafe' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1a2744' }}>{item.value}</div>
                </div>
                {item.sub && item.sub !== 'no_data' && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: item.sub === 'ready' ? '#dcfce7' : item.sub === 'warning' ? '#fef9c3' : '#fee2e2', color: item.sub === 'ready' ? '#15803d' : item.sub === 'warning' ? '#854d0e' : '#b91c1c' }}>
                    {item.sub === 'ready' ? 'OK' : item.sub === 'warning' ? 'WARNING' : 'OUT OF SPEC'}
                  </span>
                )}
              </div>
            ))}
            <div style={{ fontSize: 11, color: '#9ca3af', borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 4 }}>
              Last Updated: {fmtTs(current?.temperature.timestamp ?? null)}
            </div>
          </div>
          {/* Status panel */}
          <div style={{ background: cfg.bg, borderRadius: 8, border: `1px solid ${cfg.borderColor}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: cfg.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {status === 'ready'
                  ? <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                  : <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                }
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}>{cfg.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Room Condition Status</div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              {[{ dot: '#22c55e', label: 'Within Spec (≤25°C, ≤65% RH)' }, { dot: '#f59e0b', label: 'Warning (≤27°C, ≤70% RH)' }, { dot: '#ef4444', label: 'Out of Spec — calling maintenance' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.dot, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{l.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { if (status === 'ready') setModal('confirm_ready'); else setModal('out_of_spec'); }}
              style={{ width: '100%', padding: '10px 0', fontSize: 13, fontWeight: 700, borderRadius: 7, border: 'none', background: cfg.btnBg, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {status !== 'ready' && <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>}
              {cfg.btnLabel}
            </button>
          </div>
        </div>
        )}
      </div>

      {/* History */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a2744', marginBottom: 16 }}>History</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Date','Time','Line','Refreshed by'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 12, borderBottom: '1px solid #e5e7eb' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {pagedHistory.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background='#f9fafb')} onMouseLeave={e => (e.currentTarget.style.background='#fff')} style={{ background: '#fff' }}>
                {[row.date, row.time, row.line, row.refreshedBy].map((v, j) => <td key={j} style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {(page-1)*ITEMS_PER_PAGE+1}–{Math.min(page*ITEMS_PER_PAGE, HISTORY.length)} total data</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ minWidth: 30, height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: p===page?'#1a2744':'#fff', color: p===page?'#fff':'#374151', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>{p}</button>
            ))}
            {page < totalPages && <button onClick={() => setPage(p=>p+1)} style={{ padding: '0 10px', height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Next &gt;</button>}
          </div>
        </div>
      </div>

      {modal === 'out_of_spec' && current && <OutOfSpecModal
        data={{ machineName: current.display_name, temperature: current.temperature.value ?? 0, humidity: current.humidity.value ?? 0, lastUpdated: fmtTs(current.temperature.timestamp), status: 'out_of_spec' }}
        line={current.display_name} onClose={() => setModal(null)} />}
      {modal === 'confirm_ready' && current && <ConfirmReadyModal
        data={{ machineName: current.display_name, temperature: current.temperature.value ?? 0, humidity: current.humidity.value ?? 0, lastUpdated: fmtTs(current.temperature.timestamp), status: 'ready' }}
        line={current.display_name} onClose={() => setModal(null)} onConfirm={() => { setApproved(true); setModal(null); }} />}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Review Data Tab (Lembar Review) ─────────────────────────────────────────
function ReviewDataTab() {
  const [site, setSite]           = useState('Cikarang');
  const [area, setArea]           = useState('Cikarang');
  const [paramSuhu, setParamSuhu] = useState(true);
  const [paramRH, setParamRH]     = useState(true);
  const [paramDP, setParamDP]     = useState(false);
  const [periode, setPeriode]     = useState('September 2023');
  const [dateStart, setDateStart] = useState('');
  const [timeStart, setTimeStart] = useState('07:00');
  const [dateEnd, setDateEnd]     = useState('');
  const [timeEnd, setTimeEnd]     = useState('07:00');
  const [reviewedBy, setReviewedBy]   = useState('');
  const [approvedBy, setApprovedBy]   = useState('');
  const [reviewedBy2, setReviewedBy2] = useState('');
  const [reviewDate, setReviewDate]   = useState('');
  const [notes, setNotes]             = useState('');
  const [submitted, setSubmitted]     = useState(false);

  const inputS: React.CSSProperties = { width: '100%', fontSize: 12, padding: '7px 10px', borderRadius: 5, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const };
  const selectS: React.CSSProperties = { ...inputS, appearance: 'none' as const, WebkitAppearance: 'none' as const, cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: 28 };
  const labelS: React.CSSProperties  = { fontSize: 11, fontWeight: 600, color: '#374151', minWidth: 80, flexShrink: 0 };
  const roS: React.CSSProperties     = { ...inputS, background: '#f9fafb', color: '#374151', borderColor: '#e5e7eb' };
  const req = <span style={{ color: '#ef4444' }}> *</span>;

  const sectionHead = (title: string) => (
    <div style={{ fontWeight: 700, fontSize: 12, color: '#1a2744', background: '#f3f4f6', padding: '8px 14px', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>{title}</div>
  );

  if (submitted) {
    return (
      <div style={{ padding: '3rem 24px', textAlign: 'center', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 26 }}>✓</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Lembar Review berhasil disubmit!</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Laporan telah di-generate dan dikirim ke sistem.</div>
        <button onClick={() => setSubmitted(false)} style={{ padding: '8px 22px', fontSize: 13, borderRadius: 6, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Buat Lembar Review Baru</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 24px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {/* Title bar */}
        <div style={{ background: '#f3f4f6', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2744', letterSpacing: 0.5 }}>LEMBAR REVIEW</span>
        </div>

        {/* General Information */}
        {sectionHead('General Information')}
        <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={labelS}>Site {req}</label>
            <select value={site} onChange={e => setSite(e.target.value)} style={selectS}>
              <option>Deltamas</option><option>Pulogadung</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={labelS}>Area {req}</label>
            <select value={area} onChange={e => setArea(e.target.value)} style={selectS}>
              <option>Produksi</option><option>Warehouse</option>
              <option>QC</option><option>PD</option>
              <option>Andev</option><option>Engineering</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={labelS}>Parameter {req}</label>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[['Suhu', paramSuhu, setParamSuhu], ['RH', paramRH, setParamRH], ['Perbedaan Tekanan', paramDP, setParamDP]].map(([label, val, setter]) => (
                <label key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={val as boolean} onChange={e => (setter as (v: boolean) => void)(e.target.checked)} style={{ accentColor: '#185FA5', width: 14, height: 14 }} />
                  {label as string}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={labelS}>Periode {req}</label>
            <select value={periode} onChange={e => setPeriode(e.target.value)} style={selectS}>
              {['September 2023','Oktober 2023','November 2023','Desember 2023','Januari 2024','Maret 2026'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Monitoring Result */}
        {sectionHead('Monitoring Result')}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Periode</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#6b7280', width: 80 }}>Date Start {req}</span>
                  <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} style={{ ...inputS, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#6b7280', width: 80 }}>Time Start {req}</span>
                  <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} style={{ ...inputS, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#6b7280', width: 80 }}>Date End {req}</span>
                  <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} style={{ ...inputS, flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#6b7280', width: 80 }}>Time End {req}</span>
                  <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} style={{ ...inputS, flex: 1 }} />
                </div>
              </div>
            </div>
            {/* Suhu stats */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Data Suhu</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[['Suhu Minimum','20.8°C'],['Suhu Maximum','25.5°C'],['Suhu Rata-rata','23.2°C'],['Syarat','20-28°C']].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#6b7280', width: 90 }}>{k}</span>
                    <input value={v} readOnly style={{ ...roS, flex: 1, fontSize: 11 }} />
                  </div>
                ))}
              </div>
            </div>
            {/* RH stats */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Data RH</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[['RH Minimum','40%'],['RH Maximum','67%'],['RH Rata-rata','56.7%'],['Syarat','< 70%']].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#6b7280', width: 90 }}>{k}</span>
                    <input value={v} readOnly style={{ ...roS, flex: 1, fontSize: 11 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Approval & Submit */}
        {sectionHead('Approval & Submit')}
        <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['Reviewed by:', reviewedBy, setReviewedBy, 'Masukan nama Supervisor'],
              ['Approved by:', approvedBy, setApprovedBy, 'Masukan nama Manager Area'],
              ['Reviewed by:', reviewedBy2, setReviewedBy2, 'Masukan nama Manager QA']
            ].map(([label, val, setter, placeholder]) => (
              <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', width: 90, flexShrink: 0 }}>{label as string} {req}</label>
                <input value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)} placeholder={placeholder as string} style={inputS} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', width: 90, flexShrink: 0 }}>Review Date {req}</label>
              <input type="date" value={reviewDate} onChange={e => setReviewDate(e.target.value)} style={inputS} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', width: 90, flexShrink: 0, marginTop: 8 }}>Notes {req}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Masukan catatan..." rows={3} style={{ ...inputS, resize: 'vertical', minHeight: 68 }} />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setSubmitted(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', fontSize: 13, borderRadius: 7, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            Submit & Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const RoomReadinessPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'review'>('monitoring');
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 18px', fontSize: 14, border: 'none', background: 'transparent',
    cursor: 'pointer', fontFamily: 'inherit',
    color: active ? '#185FA5' : '#6b7280', fontWeight: active ? 700 : 400,
    borderBottom: active ? '2.5px solid #185FA5' : '2.5px solid transparent',
    marginBottom: -2, transition: 'color 0.15s',
  });
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', padding: '0 24px', background: '#fff' }}>
        <button style={tabStyle(activeTab === 'monitoring')} onClick={() => setActiveTab('monitoring')}>Monitoring</button>
        <button style={tabStyle(activeTab === 'review')} onClick={() => setActiveTab('review')}>Review Data</button>
      </div>
      {activeTab === 'monitoring' && <MonitoringTab />}
      {activeTab === 'review'     && <ReviewDataTab />}
    </div>
  );
};

export default RoomReadinessPage;
