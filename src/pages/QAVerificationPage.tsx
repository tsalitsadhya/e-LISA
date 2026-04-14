import React, { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

interface CleaningRecord {
  id: string;
  machine_name: string;
  machine_type: string;
  area_name: string;
  operator_name: string;
  cleaning_date: string;
  cleaning_type: string;
  produk_sebelumnya: string;
  produk_sesudahnya: string;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  catatan: string;
  submitted_at: string | null;
  status: string;
}

const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function fmtDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ─── Verify Modal ─────────────────────────────────────────────────────────────
interface VerifyModalProps {
  record: CleaningRecord;
  onClose: () => void;
  onSubmit: (id: string, decision: 'approved' | 'rejected', remarks: string, correctiveAction: string) => Promise<void>;
  submitting: boolean;
}

function VerifyModal({ record, onClose, onSubmit, submitting }: VerifyModalProps) {
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('');
  const [remarks, setRemarks] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');

  const inputS: React.CSSProperties = {
    width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 6,
    border: '1px solid #d1d5db', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', resize: 'vertical',
  };
  const labelS: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 };

  const handleSubmit = async () => {
    if (!decision) { alert('Pilih keputusan QA terlebih dahulu.'); return; }
    if (decision === 'rejected' && !remarks.trim()) { alert('Remarks wajib diisi untuk Rejected.'); return; }
    await onSubmit(record.id, decision, remarks, correctiveAction);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>QA Verification</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>✕</button>
        </div>

        {/* Record summary */}
        <div style={{ padding: '14px 18px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 12 }}>
            {[
              ['Mesin',       record.machine_name],
              ['Area',        record.area_name],
              ['Operator',    record.operator_name],
              ['Tgl Cleaning', fmtDate(record.cleaning_date)],
              ['Produk Sebelum', record.produk_sebelumnya || '—'],
              ['Produk Sesudah', record.produk_sesudahnya || '—'],
              ['Waktu Mulai', record.waktu_mulai || '—'],
              ['Waktu Selesai', record.waktu_selesai || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <span style={{ color: '#6b7280' }}>{k}: </span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
              </div>
            ))}
          </div>
          {record.catatan && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              Catatan: <span style={{ color: '#374151' }}>{record.catatan}</span>
            </div>
          )}
        </div>

        {/* Decision */}
        <div style={{ padding: '16px 18px' }}>
          <label style={{ ...labelS, marginBottom: 8 }}>Keputusan QA *</label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <button
              onClick={() => setDecision('approved')}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: `2px solid ${decision === 'approved' ? '#16a34a' : '#e5e7eb'}`, background: decision === 'approved' ? '#f0fdf4' : '#fff', color: decision === 'approved' ? '#15803d' : '#6b7280', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
              ✓ Approve
            </button>
            <button
              onClick={() => setDecision('rejected')}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: `2px solid ${decision === 'rejected' ? '#dc2626' : '#e5e7eb'}`, background: decision === 'rejected' ? '#fef2f2' : '#fff', color: decision === 'rejected' ? '#b91c1c' : '#6b7280', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
              ✕ Reject
            </button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelS}>Remarks {decision === 'rejected' ? '*' : '(opsional)'}</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Catatan hasil verifikasi..."
              rows={3}
              style={inputS}
            />
          </div>

          {decision === 'rejected' && (
            <div style={{ marginBottom: 12 }}>
              <label style={labelS}>Corrective Action</label>
              <textarea
                value={correctiveAction}
                onChange={e => setCorrectiveAction(e.target.value)}
                placeholder="Tindakan perbaikan yang diperlukan..."
                rows={2}
                style={inputS}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={submitting} style={{ padding: '7px 14px', fontSize: 12, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !decision}
            style={{
              padding: '7px 20px', fontSize: 12, borderRadius: 6, border: 'none', fontFamily: 'inherit', fontWeight: 700, cursor: submitting || !decision ? 'not-allowed' : 'pointer',
              background: decision === 'rejected' ? '#dc2626' : decision === 'approved' ? '#16a34a' : '#9ca3af',
              color: '#fff',
            }}>
            {submitting ? 'Menyimpan...' : decision === 'approved' ? 'Approve' : decision === 'rejected' ? 'Reject' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const thS: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#334155', padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', whiteSpace: 'nowrap' };
const tdS: React.CSSProperties = { fontSize: 12, color: '#334155', padding: '9px 12px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9' };

export default function QAVerificationPage() {
  const [pending,    setPending]    = useState<CleaningRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [totalPend,  setTotalPend]  = useState(0);
  const [totalVerif, setTotalVerif] = useState(0);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [verifyTarget, setVerifyTarget] = useState<CleaningRecord | null>(null);
  const [submitting,   setSubmitting]   = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pendRes, verifRes] = await Promise.all([
        api.get('/cleaning/records', { params: { status: 'waiting_qa', page, per_page: ITEMS_PER_PAGE, search: search || undefined } }),
        api.get('/cleaning/records', { params: { status: 'approved', per_page: 1 } }),
      ]);
      setPending(pendRes.data.data ?? []);
      setTotalPend(pendRes.data.total ?? 0);
      setTotalVerif(verifRes.data.total ?? 0);
    } catch {
      setError('Gagal memuat data verifikasi.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const handleVerify = async (id: string, decision: 'approved' | 'rejected', remarks: string, correctiveAction: string) => {
    setSubmitting(true);
    try {
      await api.post(`/cleaning/records/${id}/verify`, { decision, remarks, corrective_action: correctiveAction });
      setVerifyTarget(null);
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Gagal menyimpan verifikasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalPend / ITEMS_PER_PAGE);

  const selStyle: React.CSSProperties = {
    fontSize: 12, padding: '5px 26px 5px 10px', borderRadius: 6, border: '1px solid #d1d5db',
    background: '#fff', color: '#374151', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
    appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', height: 32,
  };

  return (
    <div style={{ padding: '18px 24px', fontFamily: "'Segoe UI', Arial, sans-serif", background: '#e8eef7', minHeight: '100%' }}>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ width: 48, height: 48, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#1565c0" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Pending Reviews</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#1e293b', lineHeight: 1.1 }}>{loading ? '…' : totalPend}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Cleaning records awaiting QA review</div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ width: 48, height: 48, background: '#f0fdf4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#16a34a" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Verified Cleanings</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#1e293b', lineHeight: 1.1 }}>{loading ? '…' : totalVerif}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Cleaning records marked as approved</div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 12, color: '#b91c1c', display: 'flex', justifyContent: 'space-between' }}>
          {error}
          <button onClick={fetchData} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#b91c1c', textDecoration: 'underline', fontSize: 11 }}>Retry</button>
        </div>
      )}

      {/* Table card */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Pending Cleaning Records</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: '#64748b' }}>{loading ? '' : `${totalPend} menunggu verifikasi`}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#9ca3af"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            </span>
            <input placeholder="Cari mesin..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ ...selStyle, paddingLeft: 26, width: 200, cursor: 'text', appearance: 'none', backgroundImage: 'none' }} />
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '12%' }} /><col style={{ width: '17%' }} />
            <col style={{ width: '14%' }} /><col style={{ width: '14%' }} />
            <col style={{ width: '13%' }} /><col style={{ width: '14%' }} />
            <col style={{ width: '16%' }} />
          </colgroup>
          <thead>
            <tr>{['Tgl Cleaning','Mesin','Area','Operator','Produk Sebelum','Submitted','Aksi'].map(h => <th key={h} style={thS}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ ...tdS, textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>Memuat data...</td></tr>
            ) : pending.length === 0 ? (
              <tr><td colSpan={7} style={{ ...tdS, textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                Tidak ada record yang menunggu verifikasi.
              </td></tr>
            ) : pending.map((r, i) => (
              <tr key={r.id}
                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}
                style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={tdS}>{fmtDate(r.cleaning_date)}</td>
                <td style={tdS}>
                  <div style={{ fontWeight: 600 }}>{r.machine_name}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{r.machine_type}</div>
                </td>
                <td style={tdS}>{r.area_name}</td>
                <td style={tdS}>{r.operator_name}</td>
                <td style={{ ...tdS, color: r.produk_sebelumnya ? '#374151' : '#d1d5db' }}>{r.produk_sebelumnya || '—'}</td>
                <td style={{ ...tdS, color: '#64748b' }}>
                  <div>{fmtDate(r.submitted_at)}</div>
                  <div style={{ fontSize: 10 }}>{fmtTime(r.submitted_at)}</div>
                </td>
                <td style={tdS}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => setVerifyTarget(r)}
                      style={{ padding: '4px 10px', fontSize: 11, borderRadius: 5, border: '1px solid #1565c0', background: '#1565c0', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1e40af')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#1565c0')}>
                      Verifikasi
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {totalPend === 0 ? 'Tidak ada data' : `Showing ${Math.min((page-1)*ITEMS_PER_PAGE+1, totalPend)}–${Math.min(page*ITEMS_PER_PAGE, totalPend)} of ${totalPend}`}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              style={{ padding: '0 10px', height: 28, borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff', color: page===1?'#d1d5db':'#374151', cursor: page===1?'default':'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              return start + i;
            }).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ minWidth: 28, height: 28, borderRadius: 5, border: '1px solid #e2e8f0', background: p===page?'#1565c0':'#fff', color: p===page?'#fff':'#374151', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages||totalPages===0}
              style={{ padding: '0 10px', height: 28, borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff', color: page===totalPages||totalPages===0?'#d1d5db':'#374151', cursor: page===totalPages||totalPages===0?'default':'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* Verify Modal */}
      {verifyTarget && (
        <VerifyModal
          record={verifyTarget}
          onClose={() => setVerifyTarget(null)}
          onSubmit={handleVerify}
          submitting={submitting}
        />
      )}
    </div>
  );
}
