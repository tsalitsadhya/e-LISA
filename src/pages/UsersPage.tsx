import React, { useState, useMemo } from 'react';

type RoleType = 'Operator' | 'Admin' | 'QA';
type UserStatus = 'On' | 'Off';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  lastLogin: string;
  status: UserStatus;
}

const DUMMY_USERS: UserData[] = [
  { id: '1', name: 'Iwan Gunawan',  email: 'operatorEmail@gmail.com', role: 'Operator', lastLogin: '30 minutes ago', status: 'Off' },
  { id: '2', name: 'Michael',       email: 'adminEmail@gmail.com',    role: 'Admin',    lastLogin: '10 minutes ago', status: 'On'  },
  { id: '3', name: 'Wahyu Ari',     email: 'adminEmail@gmail.com',    role: 'Admin',    lastLogin: '10 minutes ago', status: 'On'  },
  { id: '4', name: 'Aep',           email: 'adminEmail@gmail.com',    role: 'Admin',    lastLogin: '10 minutes ago', status: 'On'  },
  { id: '5', name: 'Akhid',         email: 'adminEmail@gmail.com',    role: 'Admin',    lastLogin: '10 minutes ago', status: 'On'  },
  { id: '6', name: 'Didi',          email: 'adminEmail@gmail.com',    role: 'Admin',    lastLogin: '10 minutes ago', status: 'On'  },
  { id: '7', name: 'Nio',           email: 'operatorEmail@gmail.com', role: 'Operator', lastLogin: '1 hour ago',     status: 'On'  },
  { id: '8', name: 'Reza',          email: 'qaEmail@gmail.com',       role: 'QA',       lastLogin: '2 hours ago',    status: 'On'  },
  { id: '9', name: 'Siti',          email: 'operatorEmail@gmail.com', role: 'Operator', lastLogin: '3 hours ago',    status: 'Off' },
  { id: '10',name: 'Budi',          email: 'qaEmail@gmail.com',       role: 'QA',       lastLogin: '5 minutes ago',  status: 'On'  },
  { id: '11',name: 'Rina',          email: 'operatorEmail@gmail.com', role: 'Operator', lastLogin: '20 minutes ago', status: 'On'  },
  { id: '12',name: 'Hendra',        email: 'operatorEmail@gmail.com', role: 'Operator', lastLogin: '1 day ago',      status: 'Off' },
  { id: '13',name: 'Lestari',       email: 'operatorEmail@gmail.com', role: 'Operator', lastLogin: '2 days ago',     status: 'Off' },
  { id: '14',name: 'Agus',          email: 'adminEmail@gmail.com',    role: 'Admin',    lastLogin: '10 minutes ago', status: 'On'  },
  { id: '15',name: 'Dewi',          email: 'qaEmail@gmail.com',       role: 'QA',       lastLogin: '15 minutes ago', status: 'On'  },
  { id: '16',name: 'Fauzi',         email: 'operatorEmail@gmail.com', role: 'Operator', lastLogin: '45 minutes ago', status: 'On'  },
  { id: '17',name: 'Gita',          email: 'operatorEmail@gmail.com', role: 'Operator', lastLogin: '3 days ago',     status: 'Off' },
];

const ITEMS_PER_PAGE = 6;

const ROLE_COLORS: Record<RoleType, { bg: string; color: string }> = {
  Operator: { bg: '#dbeafe', color: '#1d4ed8' },
  Admin:    { bg: '#fef9c3', color: '#854d0e' },
  QA:       { bg: '#dcfce7', color: '#15803d' },
};

// Modal: Add/Edit User
function UserModal({ initial, onSave, onClose }: {
  initial?: UserData;
  onSave: (u: UserData) => void;
  onClose: () => void;
}) {
  const [name, setName]   = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [role, setRole]   = useState<RoleType>(initial?.role ?? 'Operator');

  const inputS: React.CSSProperties = { width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const selS: React.CSSProperties   = { ...inputS, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28 };
  const labelS: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{initial ? 'Edit User' : 'Tambah User Baru'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>✕</button>
        </div>
        <div style={{ padding: '16px 18px' }}>
          <div style={{ marginBottom: 13 }}>
            <label style={labelS}>Nama Lengkap *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Masukan nama..." style={inputS} />
          </div>
          <div style={{ marginBottom: 13 }}>
            <label style={labelS}>Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" style={inputS} />
          </div>
          <div style={{ marginBottom: 13 }}>
            <label style={labelS}>Role *</label>
            <select value={role} onChange={e => setRole(e.target.value as RoleType)} style={selS}>
              <option value="Operator">Operator</option>
              <option value="Admin">Admin</option>
              <option value="QA">QA</option>
            </select>
          </div>
          {!initial && (
            <div style={{ marginBottom: 13 }}>
              <label style={labelS}>Password *</label>
              <input type="password" placeholder="Masukan password..." style={inputS} />
            </div>
          )}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 14px', fontSize: 12, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
          <button onClick={() => {
            if (!name || !email) { alert('Nama dan email wajib diisi.'); return; }
            onSave({ id: initial?.id ?? String(Date.now()), name, email, role, lastLogin: 'Just now', status: 'On' });
          }} style={{ padding: '7px 18px', fontSize: 12, borderRadius: 6, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            {initial ? 'Simpan Perubahan' : 'Tambah User'}
          </button>
        </div>
      </div>
    </div>
  );
}

const UsersPage: React.FC = () => {
  const [users, setUsers]         = useState<UserData[]>(DUMMY_USERS);
  const [search, setSearch]       = useState('');
  const [fRole, setFRole]         = useState('');
  const [page, setPage]           = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserData | undefined>();

  const filtered = useMemo(() => users.filter(u => {
    if (fRole && u.role !== fRole) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [users, search, fRole]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const totalUser = users.length;
  const adminCount = users.filter(u => u.role === 'Admin').length;
  const opCount    = users.filter(u => u.role === 'Operator').length;
  const qaCount    = users.filter(u => u.role === 'QA').length;

  const toggleStatus = (id: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'On' ? 'Off' : 'On' } : u));
  const handleSave = (u: UserData) => {
    setUsers(prev => { const idx = prev.findIndex(x => x.id === u.id); return idx >= 0 ? prev.map(x => x.id === u.id ? u : x) : [...prev, u]; });
    setModalOpen(false); setEditTarget(undefined);
  };

  const selStyle: React.CSSProperties = {
    fontSize: 12, padding: '6px 26px 6px 10px', borderRadius: 6, border: '1px solid #d1d5db',
    background: '#fff', color: '#374151', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
    appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center',
  };

  const thS: React.CSSProperties = { padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#374151', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' };
  const tdS: React.CSSProperties = { padding: '10px 14px', fontSize: 12, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' };

  return (
    <div style={{ padding: '16px 24px', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 16 }}>
        {[
          { icon: '👥', label: 'Total User',       value: totalUser,  sub: 'All registered system accounts',       bg: '#f0f9ff', border: '#bae6fd', color: '#0369a1' },
          { icon: '⚙️', label: 'Admins',           value: adminCount, sub: 'Full system control & permissions',    bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
          { icon: '🏭', label: 'Production Staff', value: opCount,    sub: 'Input cleaning & readiness data',      bg: '#f0fdf4', border: '#86efac', color: '#15803d' },
          { icon: '✓',  label: 'QA staff',         value: qaCount,    sub: 'Verify and approve readiness',         bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
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

      {/* Filter + search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <select value={fRole} onChange={e => { setFRole(e.target.value); setPage(1); }} style={{ ...selStyle, width: 120 }}>
          <option value="">All Roles</option>
          <option value="Operator">Operator</option>
          <option value="Admin">Admin</option>
          <option value="QA">QA</option>
        </select>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#9ca3af"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </span>
          <input placeholder="Search Users" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ ...selStyle, paddingLeft: 28, width: '100%', cursor: 'text', fontSize: 13 }} />
        </div>
        <button style={{ padding: '7px 18px', fontSize: 13, borderRadius: 6, border: 'none', background: '#1a2744', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
          Search Users
        </button>
        <button onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
          style={{ padding: '7px 14px', fontSize: 13, borderRadius: 6, border: '1px solid #185FA5', background: 'transparent', color: '#185FA5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
          + Add User
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2744' }}>Users</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '24%' }} /><col style={{ width: '28%' }} />
            <col style={{ width: '13%' }} /><col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} /><col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr>{['Name ↓','Email ↓','Role ↓','Last Login','Status','Action'].map(h => <th key={h} style={thS}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {paginated.length === 0
              ? <tr><td colSpan={6} style={{ ...tdS, textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Tidak ada user.</td></tr>
              : paginated.map((u, i) => {
                const rc = ROLE_COLORS[u.role];
                return (
                  <tr key={u.id}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = i%2===0?'#fff':'#fafafa')}
                    style={{ background: i%2===0?'#fff':'#fafafa' }}
                  >
                    <td style={tdS}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#c2410c"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ ...tdS, color: '#6b7280' }}>{u.email}</td>
                    <td style={tdS}><span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: rc.bg, color: rc.color }}>{u.role}</span></td>
                    <td style={{ ...tdS, color: '#9ca3af' }}>{u.lastLogin}</td>
                    <td style={tdS}>
                      {/* Toggle switch */}
                      <div onClick={() => toggleStatus(u.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <div style={{ width: 36, height: 20, borderRadius: 99, background: u.status === 'On' ? '#22c55e' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                          <div style={{ position: 'absolute', top: 2, left: u.status === 'On' ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: u.status === 'On' ? '#15803d' : '#9ca3af' }}>{u.status}</span>
                      </div>
                    </td>
                    <td style={tdS}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => { setEditTarget(u); setModalOpen(true); }}
                          style={{ padding: '3px 9px', fontSize: 11, borderRadius: 5, border: '1px solid #185FA5', background: 'transparent', color: '#185FA5', cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={e => (e.currentTarget.style.background='#E6F1FB')}
                          onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                          Edit
                        </button>
                        <button onClick={() => toggleStatus(u.id)}
                          style={{ padding: '3px 9px', fontSize: 11, borderRadius: 5, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={e => (e.currentTarget.style.background='#fee2e2')}
                          onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                          {u.status === 'On' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {Math.min((page-1)*ITEMS_PER_PAGE+1, filtered.length)}–{Math.min(page*ITEMS_PER_PAGE, filtered.length)} out of {filtered.length} total users</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ minWidth: 30, height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: p===page?'#1a2744':'#fff', color: p===page?'#fff':'#374151', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>{p}</button>
            ))}
            {page < totalPages && <button onClick={() => setPage(p=>p+1)} style={{ padding: '0 10px', height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Next &gt;</button>}
          </div>
        </div>
      </div>

      {modalOpen && <UserModal initial={editTarget} onSave={handleSave} onClose={() => { setModalOpen(false); setEditTarget(undefined); }} />}
    </div>
  );
};

export default UsersPage;
