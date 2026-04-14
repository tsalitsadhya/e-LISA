import React, { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

interface AuditLog {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  target_type: string;
  target_id: string;
  ip_address: string;
  created_at: string;
}

const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function fmtDatetime(raw: string) {
  if (!raw) return { date: '—', time: '—' };
  // Normalize PostgreSQL format ("2026-04-10 13:33:31+07") to ISO 8601
  const normalized = raw.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');
  const d = new Date(normalized);
  if (isNaN(d.getTime())) {
    // Fallback: just slice the string directly
    return { date: raw.slice(0, 10), time: raw.slice(11, 19) };
  }
  const date = `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { date, time };
}

// Action display config
const ACTION_STYLE: Record<string, { bg: string; color: string }> = {
  login:               { bg: '#e0f2fe', color: '#0369a1' },
  logout:              { bg: '#f3f4f6', color: '#6b7280' },
  create_record:       { bg: '#dbeafe', color: '#1d4ed8' },
  submit_record:       { bg: '#dcfce7', color: '#15803d' },
  verify_record:       { bg: '#dcfce7', color: '#15803d' },
  create_user:         { bg: '#ede9fe', color: '#6d28d9' },
  update_user:         { bg: '#fef9c3', color: '#854d0e' },
  toggle_user_status:  { bg: '#fef3c7', color: '#92400e' },
  create_machine:      { bg: '#d1fae5', color: '#065f46' },
  update_machine:      { bg: '#fef9c3', color: '#854d0e' },
  delete_machine:      { bg: '#fee2e2', color: '#b91c1c' },
};

const ACTION_LABEL: Record<string, string> = {
  login:               'Login',
  logout:              'Logout',
  create_record:       'Create Record',
  submit_record:       'Submit Cleaning',
  verify_record:       'QA Verify',
  create_user:         'Add User',
  update_user:         'Edit User',
  toggle_user_status:  'Toggle Status',
  create_machine:      'Add Machine',
  update_machine:      'Edit Machine',
  delete_machine:      'Delete Machine',
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', operator: 'Operator', qa: 'QA',
  supervisor: 'Supervisor', site_head: 'Site Head', system: 'System',
};

const ITEMS_PER_PAGE = 15;

const selStyle: React.CSSProperties = {
  fontSize: 13, padding: '7px 28px 7px 10px', borderRadius: 6,
  border: '1px solid #d1d5db', background: '#fff', color: '#374151',
  fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
  appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', height: 36,
};

const thS: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600,
  color: '#374151', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0',
  whiteSpace: 'nowrap', userSelect: 'none',
};

const tdS: React.CSSProperties = {
  padding: '11px 14px', fontSize: 13, color: '#374151',
  borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle',
};

const btnPage = (active: boolean, disabled = false): React.CSSProperties => ({
  minWidth: 32, height: 32, borderRadius: 6,
  border: `1px solid ${active ? '#1a2744' : '#d1d5db'}`,
  background: active ? '#1a2744' : '#fff',
  color: disabled ? '#d1d5db' : active ? '#fff' : '#374151',
  cursor: disabled ? 'default' : 'pointer',
  fontSize: 13, fontFamily: 'inherit', padding: '0 8px',
});

// SVG icons
const IconTotal = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
  </svg>
);
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
  </svg>
);
const IconSubmit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
  </svg>
);
const IconQA = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8"/>
  </svg>
);

const AuditTrailPage: React.FC = () => {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [counts,  setCounts]  = useState({ total: 0, edit: 0, submit: 0, qa: 0 });

  const [fAction,   setFAction]   = useState('');
  const [fRole,     setFRole]     = useState('');
  const [fDateFrom, setFDateFrom] = useState('');
  const [fDateTo,   setFDateTo]   = useState('');
  const [search,    setSearch]    = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, per_page: ITEMS_PER_PAGE };
      if (fAction)   params.action    = fAction;
      if (fRole)     params.role      = fRole;
      if (search)    params.search    = search;
      if (fDateFrom) params.date_from = fDateFrom;
      if (fDateTo)   params.date_to   = fDateTo;

      const [logsRes, totalRes, editRes, submitRes, qaRes] = await Promise.all([
        api.get('/audit-logs', { params }),
        api.get('/audit-logs', { params: { per_page: 1 } }),
        api.get('/audit-logs', { params: { action: 'update_record', per_page: 1 } }),
        api.get('/audit-logs', { params: { action: 'submit_record', per_page: 1 } }),
        api.get('/audit-logs', { params: { action: 'verify_record', per_page: 1 } }),
      ]);

      setLogs(logsRes.data.data ?? []);
      setTotal(logsRes.data.total ?? 0);
      setCounts({
        total:  totalRes.data.total  ?? 0,
        edit:   editRes.data.total   ?? 0,
        submit: submitRes.data.total ?? 0,
        qa:     qaRes.data.total     ?? 0,
      });
    } catch {
      setError('Gagal memuat audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, fAction, fRole, search, fDateFrom, fDateTo]);

  useEffect(() => {
    const t = setTimeout(fetchLogs, 300);
    return () => clearTimeout(t);
  }, [fetchLogs]);

  const totalPages  = Math.ceil(total / ITEMS_PER_PAGE);
  const maxVisible  = 4;
  const pageStart   = Math.max(1, Math.min(page - 1, totalPages - maxVisible + 1));
  const pageNums    = Array.from({ length: Math.min(maxVisible, totalPages) }, (_, k) => pageStart + k);

  const resetAll = () => { setFAction(''); setFRole(''); setFDateFrom(''); setFDateTo(''); setSearch(''); setPage(1); };
  const hasFilter = fAction || fRole || fDateFrom || fDateTo || search;

  const from = total === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const to   = Math.min(page * ITEMS_PER_PAGE, total);

  return (
    <div style={{ padding: '16px 24px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* ── SUMMARY CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {([
          {
            Icon: IconTotal, label: 'Total Log Hari Ini', value: counts.total,
            sub: 'All log activity users accounts',
            iconBg: '#dbeafe', iconColor: '#1d4ed8', border: '#bfdbfe',
          },
          {
            Icon: IconEdit, label: 'Edit record', value: counts.edit,
            sub: 'Full system control & permissions',
            iconBg: '#fef9c3', iconColor: '#854d0e', border: '#fde68a',
          },
          {
            Icon: IconSubmit, label: 'Submit Cleaning', value: counts.submit,
            sub: 'Input cleaning & readiness data',
            iconBg: '#dcfce7', iconColor: '#15803d', border: '#86efac',
          },
          {
            Icon: IconQA, label: 'QA Verify', value: counts.qa,
            sub: 'Verify, approve and rejected readiness',
            iconBg: '#dbeafe', iconColor: '#1d4ed8', border: '#bfdbfe',
          },
        ] as const).map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: c.iconBg, color: c.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <c.Icon />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{c.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2744', lineHeight: 1.2 }}>
                  {loading ? '…' : c.value}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={fAction} onChange={e => { setFAction(e.target.value); setPage(1); }} style={{ ...selStyle, width: 148 }}>
          <option value="">All Action</option>
          {Object.entries(ACTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <select value={fRole} onChange={e => { setFRole(e.target.value); setPage(1); }} style={{ ...selStyle, width: 128 }}>
          <option value="">All Role</option>
          {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <input type="date" value={fDateFrom} onChange={e => { setFDateFrom(e.target.value); setPage(1); }}
          title="Date from"
          style={{ ...selStyle, width: 148, paddingLeft: 10, backgroundImage: 'none' }} />

        <span style={{ fontSize: 13, color: '#9ca3af' }}>–</span>

        <input type="date" value={fDateTo} onChange={e => { setFDateTo(e.target.value); setPage(1); }}
          title="Date to"
          style={{ ...selStyle, width: 148, paddingLeft: 10, backgroundImage: 'none' }} />

        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#9ca3af">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </span>
          <input type="text" placeholder="Search Users, machine, or action..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ ...selStyle, paddingLeft: 32, width: '100%', cursor: 'text', backgroundImage: 'none', boxSizing: 'border-box' }} />
        </div>

        {hasFilter && (
          <button onClick={resetAll}
            style={{ height: 36, padding: '0 14px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#6b7280', fontFamily: 'inherit', fontSize: 13 }}>
            Reset
          </button>
        )}
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#b91c1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button onClick={fetchLogs} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#b91c1c', textDecoration: 'underline', fontSize: 12, fontFamily: 'inherit' }}>Retry</button>
        </div>
      )}

      {/* ── TABLE ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>

        {/* Table header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2744', letterSpacing: 0.3 }}>ACTIVITY</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: '16%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '17%' }} />
          </colgroup>
          <thead>
            <tr>
              {['Timestamp ↓', 'User ↓', 'Role ↓', 'Action', 'IP Address'].map(h => (
                <th key={h} style={thS}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 ? (
              <tr><td colSpan={5} style={{ ...tdS, textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Memuat data...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} style={{ ...tdS, textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Tidak ada log yang sesuai filter.</td></tr>
            ) : logs.map((log, i) => {
              const { date, time } = fmtDatetime(log.created_at);
              const aStyle = ACTION_STYLE[log.action] ?? { bg: '#f3f4f6', color: '#374151' };
              return (
                <tr key={log.id}
                  style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}>

                  {/* Timestamp */}
                  <td style={tdS}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{date}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{time}</div>
                  </td>

                  {/* User */}
                  <td style={tdS}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{log.user_name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{ROLE_LABEL[log.user_role] ?? log.user_role}</div>
                  </td>

                  {/* Role */}
                  <td style={tdS}>
                    <span style={{ fontSize: 12, color: '#374151' }}>
                      {ROLE_LABEL[log.user_role] ?? log.user_role}
                    </span>
                  </td>

                  {/* Action */}
                  <td style={tdS}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 99,
                      fontSize: 12, fontWeight: 600,
                      background: aStyle.bg, color: aStyle.color,
                    }}>
                      {ACTION_LABEL[log.action] ?? log.action}
                    </span>
                  </td>

                  {/* IP Address */}
                  <td style={{ ...tdS, fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>
                    {log.ip_address || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ── PAGINATION ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {total === 0 ? 'Tidak ada data' : `Showing ${from}–${to} out of ${total} total log's`}
          </span>

          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={btnPage(false, page === 1)}>‹</button>

            {pageNums.map(p => (
              <button key={p} onClick={() => setPage(p)} style={btnPage(p === page)}>{p}</button>
            ))}

            {totalPages > pageStart + maxVisible - 1 && (
              <span style={{ fontSize: 13, color: '#9ca3af', padding: '0 4px' }}>…</span>
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              style={{ ...btnPage(false, page === totalPages || totalPages === 0), padding: '0 12px', fontSize: 13 }}>
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailPage;
