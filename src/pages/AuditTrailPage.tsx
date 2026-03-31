import React, { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType =
  | 'Submit cleaning record'
  | 'Generate report'
  | 'QA Approve'
  | 'QA Reject'
  | 'Kirim notif telegram'
  | 'Login'
  | 'Logout'
  | 'Edit record'
  | 'Add machine'
  | 'Edit machine';

type RoleType = 'Operator' | 'Admin' | 'QA' | 'System';

interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: RoleType;
  action: ActionType;
  ipAddress: string;
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_LOGS: AuditLog[] = [
  { id: '1',  timestamp: '08 November 2026\n09:15:04', userName: 'Iwan Gunawan', userRole: 'Operator', action: 'Submit cleaning record',   ipAddress: '10.127.28.1' },
  { id: '2',  timestamp: '08 November 2026\n09:15:04', userName: 'Iwan Gunawan', userRole: 'Operator', action: 'Generate report',           ipAddress: '10.127.28.1' },
  { id: '3',  timestamp: '08 November 2026\n09:09:04', userName: 'Michael',      userRole: 'QA',       action: 'QA Approve',                ipAddress: '10.127.28.1' },
  { id: '4',  timestamp: '08 November 2026\n09:09:04', userName: 'System',       userRole: 'System',   action: 'Kirim notif telegram',      ipAddress: '10.127.28.1' },
  { id: '5',  timestamp: '08 November 2026\n09:09:04', userName: 'Akhid',        userRole: 'Operator', action: 'Login',                     ipAddress: '10.127.28.1' },
  { id: '6',  timestamp: '08 November 2026\n09:09:04', userName: 'Michael',      userRole: 'QA',       action: 'QA Reject',                 ipAddress: '10.127.28.1' },
  { id: '7',  timestamp: '07 November 2026\n14:30:10', userName: 'Wahyu Ari',    userRole: 'Operator', action: 'Submit cleaning record',    ipAddress: '10.127.28.2' },
  { id: '8',  timestamp: '07 November 2026\n13:22:05', userName: 'Admin',        userRole: 'Admin',    action: 'Add machine',               ipAddress: '10.127.28.3' },
  { id: '9',  timestamp: '07 November 2026\n11:10:44', userName: 'Admin',        userRole: 'Admin',    action: 'Edit machine',              ipAddress: '10.127.28.3' },
  { id: '10', timestamp: '07 November 2026\n10:05:22', userName: 'Aep',          userRole: 'Operator', action: 'Login',                     ipAddress: '10.127.28.4' },
  { id: '11', timestamp: '06 November 2026\n16:45:33', userName: 'Michael',      userRole: 'QA',       action: 'QA Approve',                ipAddress: '10.127.28.1' },
  { id: '12', timestamp: '06 November 2026\n15:30:11', userName: 'System',       userRole: 'System',   action: 'Kirim notif telegram',      ipAddress: '10.127.28.1' },
  { id: '13', timestamp: '06 November 2026\n14:20:00', userName: 'Iwan Gunawan', userRole: 'Operator', action: 'Edit record',               ipAddress: '10.127.28.1' },
  { id: '14', timestamp: '06 November 2026\n09:00:15', userName: 'Akhid',        userRole: 'Operator', action: 'Submit cleaning record',    ipAddress: '10.127.28.2' },
  { id: '15', timestamp: '05 November 2026\n17:55:42', userName: 'Michael',      userRole: 'QA',       action: 'Generate report',           ipAddress: '10.127.28.1' },
  { id: '16', timestamp: '05 November 2026\n16:40:30', userName: 'Admin',        userRole: 'Admin',    action: 'Edit record',               ipAddress: '10.127.28.3' },
  { id: '17', timestamp: '05 November 2026\n10:15:00', userName: 'Wahyu Ari',    userRole: 'Operator', action: 'Login',                     ipAddress: '10.127.28.2' },
  { id: '18', timestamp: '04 November 2026\n15:00:00', userName: 'System',       userRole: 'System',   action: 'Kirim notif telegram',      ipAddress: '10.127.28.1' },
  { id: '19', timestamp: '04 November 2026\n13:45:22', userName: 'Michael',      userRole: 'QA',       action: 'QA Reject',                 ipAddress: '10.127.28.1' },
  { id: '20', timestamp: '04 November 2026\n09:30:10', userName: 'Aep',          userRole: 'Operator', action: 'Submit cleaning record',    ipAddress: '10.127.28.4' },
  { id: '21', timestamp: '03 November 2026\n16:10:05', userName: 'Iwan Gunawan', userRole: 'Operator', action: 'Generate report',           ipAddress: '10.127.28.1' },
  { id: '22', timestamp: '03 November 2026\n14:00:00', userName: 'Admin',        userRole: 'Admin',    action: 'Add machine',               ipAddress: '10.127.28.3' },
];

// ─── Action badge colors ──────────────────────────────────────────────────────

const ACTION_STYLE: Record<string, { bg: string; color: string }> = {
  'Submit cleaning record': { bg: '#dbeafe', color: '#1d4ed8' },
  'Generate report':        { bg: '#e0e7ff', color: '#4338ca' },
  'QA Approve':             { bg: '#dcfce7', color: '#15803d' },
  'QA Reject':              { bg: '#fee2e2', color: '#b91c1c' },
  'Kirim notif telegram':   { bg: '#ede9fe', color: '#7c3aed' },
  'Login':                  { bg: '#f3f4f6', color: '#374151' },
  'Logout':                 { bg: '#fef3c7', color: '#92400e' },
  'Edit record':            { bg: '#fef9c3', color: '#854d0e' },
  'Add machine':            { bg: '#dcfce7', color: '#15803d' },
  'Edit machine':           { bg: '#fef9c3', color: '#854d0e' },
};

const ITEMS_PER_PAGE = 6;

// ─── Main Component ───────────────────────────────────────────────────────────

const AuditTrailPage: React.FC = () => {
  const [fAction, setFAction]   = useState('');
  const [fUser, setFUser]       = useState('');
  const [fRole, setFRole]       = useState('');
  const [fDate, setFDate]       = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);

  const filtered = useMemo(() => DUMMY_LOGS.filter(l => {
    if (fAction && l.action !== fAction) return false;
    if (fRole && l.userRole !== fRole) return false;
    if (search && !l.userName.toLowerCase().includes(search.toLowerCase()) &&
        !l.action.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [fAction, fUser, fRole, fDate, search]);

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated   = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const todayTotal      = DUMMY_LOGS.length;
  const editCount       = DUMMY_LOGS.filter(l => l.action === 'Edit record' || l.action === 'Edit machine').length;
  const submitCount     = DUMMY_LOGS.filter(l => l.action === 'Submit cleaning record').length;
  const qaCount         = DUMMY_LOGS.filter(l => l.action === 'QA Approve' || l.action === 'QA Reject').length;

  const selStyle: React.CSSProperties = {
    fontSize: 12, padding: '6px 26px 6px 10px', borderRadius: 6,
    border: '1px solid #d1d5db', background: '#fff', color: '#374151',
    fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
    appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center',
  };

  return (
    <div style={{ padding: '16px 24px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 16 }}>
        {[
          { icon: '👥', label: 'Total Log Hari ini', value: todayTotal, sub: 'All log activity users accounts', bg: '#f0f9ff', border: '#bae6fd', color: '#0369a1' },
          { icon: '✏️', label: 'Edit record',        value: editCount,  sub: 'Full system control & permissions', bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
          { icon: '▶',  label: 'Submit Cleaning',    value: submitCount,sub: 'Input cleaning & readiness data',   bg: '#f0fdf4', border: '#86efac', color: '#15803d' },
          { icon: '✓',  label: 'QA Verify',          value: qaCount,    sub: 'Verify, approve and rejected readiness', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{c.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.label}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: c.color, marginLeft: 'auto' }}>{c.value}</span>
            </div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={fAction} onChange={e => { setFAction(e.target.value); setPage(1); }} style={{ ...selStyle, width: 130 }}>
          <option value="">All Action</option>
          {Object.keys(ACTION_STYLE).map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={fUser} onChange={e => { setFUser(e.target.value); setPage(1); }} style={{ ...selStyle, width: 120 }}>
          <option value="">All User's</option>
          {[...new Set(DUMMY_LOGS.map(l => l.userName))].map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={fRole} onChange={e => { setFRole(e.target.value); setPage(1); }} style={{ ...selStyle, width: 110 }}>
          <option value="">All Role</option>
          {(['Operator','Admin','QA','System'] as RoleType[]).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div style={{ position: 'relative' }}>
          <input type="date" value={fDate} onChange={e => { setFDate(e.target.value); setPage(1); }}
            style={{ ...selStyle, width: 150, paddingLeft: 10 }} />
        </div>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#9ca3af"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </span>
          <input type="text" placeholder="Search Users, machine, or action..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ ...selStyle, paddingLeft: 28, width: '100%', cursor: 'text' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2744' }}>ACTIVITY</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '20%' }} /><col style={{ width: '22%' }} />
            <col style={{ width: '12%' }} /><col style={{ width: '28%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Timestamp ↓','User ↓','Role ↓','Action','IP Address'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0
              ? <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Tidak ada log yang sesuai filter.</td></tr>
              : paginated.map((log, i) => {
                const aStyle = ACTION_STYLE[log.action] ?? { bg: '#f3f4f6', color: '#374151' };
                const lines = log.timestamp.split('\n');
                return (
                  <tr key={log.id}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}
                    style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                  >
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{lines[0]}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{lines[1]}</div>
                    </td>
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{log.userName}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{log.userRole}</div>
                    </td>
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle', borderBottom: '1px solid #f3f4f6', fontSize: 12, color: '#374151' }}>
                      {log.userRole}
                    </td>
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: aStyle.bg, color: aStyle.color }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle', borderBottom: '1px solid #f3f4f6', fontSize: 12, color: '#374151' }}>
                      {log.ipAddress}
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Showing {Math.min((page-1)*ITEMS_PER_PAGE+1, filtered.length)}–{Math.min(page*ITEMS_PER_PAGE, filtered.length)} out of {filtered.length} total log's today
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ minWidth: 30, height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: p === page ? '#1a2744' : '#fff', color: p === page ? '#fff' : '#374151', cursor: 'pointer', fontSize: 12, fontWeight: p === page ? 600 : 400, fontFamily: 'inherit' }}>
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button onClick={() => setPage(p => p+1)} style={{ padding: '0 10px', height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Next &gt;</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailPage;
