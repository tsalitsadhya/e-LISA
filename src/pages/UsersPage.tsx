import React, { useState, useMemo, useEffect, useCallback } from 'react';
import api from '../lib/api';

type BackendRole = 'admin' | 'operator' | 'qa' | 'site_head' | 'supervisor';

interface UserData {
  id: string;
  full_name: string;
  username: string;
  role: BackendRole;
  area: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const ROLE_COLORS: Record<BackendRole, { bg: string; color: string }> = {
  operator:   { bg: '#dbeafe', color: '#1d4ed8' },
  admin:      { bg: '#fef9c3', color: '#854d0e' },
  qa:         { bg: '#dcfce7', color: '#15803d' },
  supervisor: { bg: '#fce7f3', color: '#be185d' },
  site_head:  { bg: '#f3e8ff', color: '#7e22ce' },
};

const ROLE_LABELS: Record<BackendRole, string> = {
  operator:   'Operator',
  admin:      'Admin',
  qa:         'QA',
  supervisor: 'Supervisor',
  site_head:  'Site Head',
};

function formatLastLogin(ts: string | null): string {
  if (!ts) return '—';
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  initial?: UserData;
  onSave: (data: { full_name: string; username: string; role: BackendRole; area: string; password?: string }) => void;
  onClose: () => void;
  loading: boolean;
}

function UserModal({ initial, onSave, onClose, loading }: ModalProps) {
  const [fullName, setFullName] = useState(initial?.full_name ?? '');
  const [username, setUsername] = useState(initial?.username ?? '');
  const [role,     setRole]     = useState<BackendRole>(initial?.role ?? 'operator');
  const [area,     setArea]     = useState(initial?.area ?? '');
  const [password, setPassword] = useState('');

  const inputS: React.CSSProperties = {
    width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 6,
    border: '1px solid #d1d5db', background: '#fff', color: '#111827',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  };
  const selS: React.CSSProperties = {
    ...inputS, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28,
  };
  const labelS: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 };

  const handleSubmit = () => {
    if (!fullName.trim()) { alert('Nama lengkap wajib diisi.'); return; }
    if (!initial && !username.trim()) { alert('Username wajib diisi.'); return; }
    if (!initial && !password.trim()) { alert('Password wajib diisi.'); return; }
    onSave({ full_name: fullName.trim(), username: username.trim(), role, area: area.trim(), password: password || undefined });
  };

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
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Masukan nama..." style={inputS} />
          </div>
          {!initial && (
            <div style={{ marginBottom: 13 }}>
              <label style={labelS}>Username *</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" style={inputS} />
            </div>
          )}
          <div style={{ marginBottom: 13 }}>
            <label style={labelS}>Role *</label>
            <select value={role} onChange={e => setRole(e.target.value as BackendRole)} style={selS}>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
              <option value="qa">QA</option>
              <option value="supervisor">Supervisor</option>
              <option value="site_head">Site Head</option>
            </select>
          </div>
          <div style={{ marginBottom: 13 }}>
            <label style={labelS}>Area</label>
            <input value={area} onChange={e => setArea(e.target.value)} placeholder="Contoh: Lantai 1, Lantai 2..." style={inputS} />
          </div>
          {!initial && (
            <div style={{ marginBottom: 13 }}>
              <label style={labelS}>Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukan password..." style={inputS} />
            </div>
          )}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={loading} style={{ padding: '7px 14px', fontSize: 12, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: '7px 18px', fontSize: 12, borderRadius: 6, border: 'none', background: loading ? '#93c5fd' : '#185FA5', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            {loading ? 'Menyimpan...' : (initial ? 'Simpan Perubahan' : 'Tambah User')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const UsersPage: React.FC = () => {
  const [users,       setUsers]       = useState<UserData[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [fRole,       setFRole]       = useState('');
  const [page,        setPage]        = useState(1);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState<UserData | undefined>();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (fRole)  params.role   = fRole;
      if (search) params.search = search;
      const res = await api.get('/users', { params });
      setUsers(res.data.data ?? []);
    } catch {
      setError('Gagal memuat data users.');
    } finally {
      setLoading(false);
    }
  }, [fRole, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const filtered   = users; // filtering done server-side
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalUser  = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const opCount    = users.filter(u => u.role === 'operator').length;
  const qaCount    = users.filter(u => u.role === 'qa').length;
  const svCount    = users.filter(u => u.role === 'supervisor').length;
  const shCount    = users.filter(u => u.role === 'site_head').length;

  const toggleStatus = async (user: UserData) => {
    try {
      await api.patch(`/users/${user.id}/toggle`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch {
      alert('Gagal mengubah status user.');
    }
  };

  const handleSave = async (data: { full_name: string; username: string; role: BackendRole; area: string; password?: string }) => {
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/users/${editTarget.id}`, { full_name: data.full_name, role: data.role, area: data.area });
      } else {
        await api.post('/users', { full_name: data.full_name, username: data.username, role: data.role, area: data.area, password: data.password });
      }
      setModalOpen(false);
      setEditTarget(undefined);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Gagal menyimpan user.';
      alert(msg);
    } finally {
      setSaving(false);
    }
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0,1fr))', gap: 10, marginBottom: 16 }}>
        {[
          {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#0369a1" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/></svg>,
            label: 'Total', value: totalUser, sub: 'Semua akun', bg: '#f0f9ff', border: '#bae6fd', color: '#0369a1',
          },
          {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#92400e" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/></svg>,
            label: 'Admin', value: adminCount, sub: 'Full control', bg: '#fffbeb', border: '#fde68a', color: '#92400e',
          },
          {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#15803d" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/></svg>,
            label: 'Operator', value: opCount, sub: 'Input cleaning', bg: '#f0fdf4', border: '#86efac', color: '#15803d',
          },
          {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#1d4ed8" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8"/></svg>,
            label: 'QA', value: qaCount, sub: 'Verifikasi cleaning', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8',
          },
          {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#be185d" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.029 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/></svg>,
            label: 'Supervisor', value: svCount, sub: 'Manajer produksi', bg: '#fdf2f8', border: '#fbcfe8', color: '#be185d',
          },
          {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#7e22ce" viewBox="0 0 16 16"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.029 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/><path d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/></svg>,
            label: 'Site Head', value: shCount, sub: 'Pimpinan pabrik', bg: '#faf5ff', border: '#d8b4fe', color: '#7e22ce',
          },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              {c.icon}
              <span style={{ fontSize: 11, fontWeight: 600, color: c.color }}>{c.label}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: c.color, marginLeft: 'auto' }}>{c.value}</span>
            </div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter + search + add */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {/* Role filter */}
        <select value={fRole} onChange={e => { setFRole(e.target.value); setPage(1); }} style={{ ...selStyle, width: 130, flexShrink: 0 }}>
          <option value="">All Roles</option>
          <option value="operator">Operator</option>
          <option value="admin">Admin</option>
          <option value="qa">QA</option>
          <option value="supervisor">Supervisor</option>
          <option value="site_head">Site Head</option>
        </select>

        {/* Search  */}
        <div style={{ position: 'relative', flex: '1 1 0', minWidth: 0, maxWidth: 500 }}>
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#9ca3af"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </span>
          <input
            placeholder="Cari nama / username..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ ...selStyle, paddingLeft: 28, width: '100%', cursor: 'text', fontSize: 12 }}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Add User — always at far right */}
        <button
          onClick={() => { setEditTarget(undefined); setModalOpen(true); }}
          style={{ padding: '7px 16px', fontSize: 12, borderRadius: 6, border: '1px solid #185FA5', background: 'transparent', color: '#185FA5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
          + Add User
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 12, color: '#b91c1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button onClick={fetchUsers} style={{ fontSize: 11, border: 'none', background: 'none', cursor: 'pointer', color: '#b91c1c', textDecoration: 'underline' }}>Retry</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2744' }}>Users</span>
          {loading && <span style={{ fontSize: 11, color: '#6b7280' }}>Memuat...</span>}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '22%' }} /><col style={{ width: '16%' }} />
            <col style={{ width: '16%' }} /><col style={{ width: '12%' }} />
            <col style={{ width: '14%' }} /><col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr>{['Nama','Username','Area','Role','Last Login','Status','Aksi'].map(h => <th key={h} style={thS}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading && users.length === 0
              ? <tr><td colSpan={7} style={{ ...tdS, textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Memuat data...</td></tr>
              : paginated.length === 0
              ? <tr><td colSpan={7} style={{ ...tdS, textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Tidak ada user.</td></tr>
              : paginated.map((u, i) => {
                const rc = ROLE_COLORS[u.role] ?? { bg: '#f3f4f6', color: '#374151' };
                return (
                  <tr key={u.id}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}
                    style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={tdS}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#c2410c"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td style={{ ...tdS, color: '#6b7280', fontFamily: 'monospace', fontSize: 11 }}>{u.username}</td>
                    <td style={{ ...tdS, color: '#6b7280' }}>{u.area || '—'}</td>
                    <td style={tdS}>
                      <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: rc.bg, color: rc.color }}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td style={{ ...tdS, color: '#9ca3af' }}>{formatLastLogin(u.last_login)}</td>
                    <td style={tdS}>
                      <div onClick={() => toggleStatus(u)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <div style={{ width: 36, height: 20, borderRadius: 99, background: u.is_active ? '#22c55e' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                          <div style={{ position: 'absolute', top: 2, left: u.is_active ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: u.is_active ? '#15803d' : '#9ca3af' }}>{u.is_active ? 'On' : 'Off'}</span>
                      </div>
                    </td>
                    <td style={tdS}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => { setEditTarget(u); setModalOpen(true); }}
                          style={{ padding: '3px 9px', fontSize: 11, borderRadius: 5, border: '1px solid #185FA5', background: 'transparent', color: '#185FA5', cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#E6F1FB')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          Edit
                        </button>
                        <button onClick={() => toggleStatus(u)}
                          style={{ padding: '3px 9px', fontSize: 11, borderRadius: 5, border: `1px solid ${u.is_active ? '#ef4444' : '#22c55e'}`, background: 'transparent', color: u.is_active ? '#ef4444' : '#15803d', cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={e => (e.currentTarget.style.background = u.is_active ? '#fee2e2' : '#dcfce7')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} users
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onClick={() => setPage(1)} disabled={page === 1}
              style={{ padding: '0 8px', height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: '#fff', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'default' : 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              «
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '0 10px', height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: '#fff', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'default' : 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              ‹ Prev
            </button>
            {(() => {
              const MAX = 5;
              let start = Math.max(1, page - Math.floor(MAX / 2));
              let end   = start + MAX - 1;
              if (end > totalPages) { end = totalPages; start = Math.max(1, end - MAX + 1); }
              return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ minWidth: 30, height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: p === page ? '#1a2744' : '#fff', color: p === page ? '#fff' : '#374151', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                  {p}
                </button>
              ));
            })()}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              style={{ padding: '0 10px', height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: '#fff', color: page === totalPages || totalPages === 0 ? '#d1d5db' : '#374151', cursor: page === totalPages || totalPages === 0 ? 'default' : 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              Next ›
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages || totalPages === 0}
              style={{ padding: '0 8px', height: 30, borderRadius: 5, border: '1px solid #d1d5db', background: '#fff', color: page === totalPages || totalPages === 0 ? '#d1d5db' : '#374151', cursor: page === totalPages || totalPages === 0 ? 'default' : 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              »
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <UserModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(undefined); }}
          loading={saving}
        />
      )}
    </div>
  );
};

export default UsersPage;
