import { LayoutDashboard, ClipboardList, CalendarCheck, MapPin, CheckCircle, LogOut, Server, Users, FileText } from 'lucide-react'

export default function Sidebar({ activePage, onNavigate, role, onLogout }) {
  const items = role === 'admin'
    ? [
        { id: 'dashboard',  label: 'Dashboard',           icon: LayoutDashboard },
        { id: 'cleaning',   label: 'Cleaning Management', icon: ClipboardList   },
        { id: 'production', label: 'Machine Status',      icon: Server          },
        { id: 'room',       label: 'Room Readiness',      icon: MapPin          },
        { id: 'qa',         label: 'QA Verification',     icon: CheckCircle     },
        { id: 'users',      label: 'Users',               icon: Users          },
        { id: 'audit',      label: 'Audit Trail',         icon: FileText       },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard',           icon: LayoutDashboard },
        { id: 'cleaning',  label: 'Cleaning Management', icon: ClipboardList   },
        { id: 'schedules', label: 'Schedules',           icon: CalendarCheck   },
        { id: 'room',      label: 'Room Readiness',      icon: MapPin          },
        { id: 'qa',        label: 'QA Verification',     icon: CheckCircle     },
      ]

  return (
    <aside style={S.sidebar}>
      <div style={S.logoArea}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={S.logoText}>bintangtoedjoe</div>
          <div style={S.logoSub}>A Kalbe Company</div>
        </div>
      </div>

      <nav style={S.nav}>
        {items.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{ ...S.navItem, ...(active ? S.navActive : {}) }}
            >
              <Icon size={17} color={active ? '#fff' : '#7fa8cc'} />
              <span style={{ color: active ? '#fff' : '#a0b4cc', fontSize: 13 }}>{label}</span>
            </button>
          )
        })}
      </nav>

      <button style={S.logoutBtn} onClick={onLogout}>
        <LogOut size={17} color="#ef4444" />
        <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>Logout</span>
      </button>
    </aside>
  )
}

const S = {
  sidebar: { width: 220, minWidth: 220, background: '#0f4c81', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh' },
  logoArea: { display: 'flex', alignItems: 'center', gap: 10, padding: '18px 14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' },

  logoText: { color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1.3 },
  logoSub: { color: '#7fa8cc', fontSize: 10 },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: 2 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 6, background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' },
  navActive: { background: 'rgba(255,255,255,0.15)' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 10, margin: '0 8px 36px', padding: '9px 12px', borderRadius: 6, background: 'transparent', border: 'none' },
}