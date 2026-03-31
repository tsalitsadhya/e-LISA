import React, { useEffect, useState } from 'react';

const NAV_ITEMS = [
  {
    label: 'Dashboard', path: '/dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  },
  {
    label: 'Cleaning Management', path: '/cleaning',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5C3.89 4 3 4.9 3 6v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>,
  },
  {
    label: 'Room Readiness', path: '/room-readiness',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>,
  },
  {
    label: 'QA Verification', path: '/qa-verification',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>,
  },
  {
    label: 'Users', path: '/users',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  },
  {
    label: 'Audit Trail', path: '/audit-trail',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 16h8v2H8zm0-4h8v2H8zm0-4h5v2H8z"/></svg>,
  },
    {
    label: 'Master Data', path: '/master-data',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>,
  },
];

interface Props {
  activePath: string;
  pageTitle: string;
  pageSubtitle?: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export const AppLayout: React.FC<Props> = ({
  activePath, pageTitle, pageSubtitle, onNavigate, onLogout, children,
}) => {
  const now = useClock();
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif", overflow: 'hidden', background: '#f0f2f5' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 215, flexShrink: 0, background: '#034586', display: 'flex', flexDirection: 'column' }}>

        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/logo-bt.png"
            alt="Bintang Toedjoe"
            style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'contain', flexShrink: 0 }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          {/* Fallback */}
          <div style={{ display: 'none', width: 52, height: 52, background: '#f5c518', borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#1a2744"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
          </div>
          <div>
            <div style={{ color: '#ffffff', fontSize: 14, fontWeight: 700, letterSpacing: 0.2, lineHeight: 1.3 }}>bintangtoedjoe</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 1 }}>A Kalbe Company</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: 'none', cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.48)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13, marginBottom: 2,
                  fontFamily: 'inherit', textAlign: 'left',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.82)'; }}}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.48)'; }}}
              >
                <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.55, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '8px 8px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: '#ff5555', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,85,85,0.13)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{ background: '#ffffff', borderBottom: '1px solid #dde1e7', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2744', letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>{pageTitle}</h1>
            {pageSubtitle && <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{pageSubtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right', lineHeight: 1.5 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2744' }}>{dateStr}</div>
              <div style={{ fontSize: 13, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
            </div>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#6b7280"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
              <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff' }} />
            </div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1a2744', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#f0f2f5' }}>{children}</div>

        {/* Footer */}
        <footer style={{ background: '#034586', borderTop: '1px solid #fff', padding: '8px 24px', fontSize: 11, textAlign: 'center', flexShrink: 0 }}>
          <span style={{ color: 'rgb(255, 255, 255)' }}>© ICMS -2026, Developed By </span>
          <span style={{ color: '#4ade80', fontWeight: 600 }}>Bintang Toedjoe</span>
          <span style={{ color: 'rgb(255, 255, 255)' }}> In Collaboration With </span>
          <span style={{ color: '#4b94ee', fontWeight: 600 }}>President</span>
          <span style={{ color: '#ff401f', fontWeight: 600 }}> University</span>
          <span style={{ color: 'rgb(255, 255, 255)' }}> (Tsalitsatul Adhya, Alfira Kamila Bilqist & Embun Aqeela Zahra)</span>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
