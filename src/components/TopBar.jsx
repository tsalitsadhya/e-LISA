import { Bell, User, ChevronDown } from 'lucide-react'

export default function TopBar({ title, subtitle, browserTitle }) {
  return (
    <>
      <div style={S.winBar}>
      </div>
      <header style={S.header}>
        <div>
          <h1 style={S.title}>{title}</h1>
          {subtitle && <p style={S.sub}>{subtitle}</p>}
        </div>
        <div style={S.right}>
          <button style={S.iconBtn}><Bell size={19} color="#334155" /><ChevronDown size={13} color="#334155" /></button>
          <button style={S.iconBtn}><User size={19} color="#334155" /></button>
        </div>
      </header>
    </>
  )
}

const S = {
  winBar: { background: '#1e293b', padding: '4px 16px', minHeight: 26, display: 'flex', alignItems: 'center' },
  winTitle: { color: '#94a3b8', fontSize: 12 },
  header: { background: '#fff', borderBottom: '3px solid #1565c0', padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 21, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 },
  sub: { fontSize: 13, color: '#64748b' },
  right: { display: 'flex', gap: 6, alignItems: 'center' },
  iconBtn: { display: 'flex', alignItems: 'center', gap: 2, background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px 7px', borderRadius: 6 },
}