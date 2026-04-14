import React, { useState } from 'react';
import { AuthProvider } from './lib/AuthContext';
import type { UserInfo } from './lib/auth';
import { AppLayout } from './layouts/AppLayout';
import { CleaningManagement } from './components/cleaning-management/CleaningManagement';

import DashboardAdjustmentPage from './pages/DashboardAdjustment';
import DashboardAdminPage from './pages/DashboardAdminPage';
import DashboardUserPage from './pages/DashboardUserPage';
import QAVerificationPage from './pages/QAVerificationPage.tsx';
import ProductionReadinessPage from './pages/ProductionReadinessPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPages';
import RoomReadinessPage from './pages/RoomReadinessPage';
import UserAdminPOV from './pages/user_adminPOV';
import MasterDataPage from './pages/MasterDataPage';
import AuditTrailPage from './pages/AuditTrailPage';
import UsersPage from './pages/UsersPage';


type Page =
  | '/dashboard'
  | '/dashboard-admin'
  | '/dashboard-user'
  | '/cleaning'
  | '/production-readiness'
  | '/qa-verification'
  | '/schedules'
  | '/login'
  | '/signup'
  | '/room-readiness'
  | '/users'
  | '/audit-trail'
  | '/user-admin'
  | '/master-data';

const PAGE_META: Record<Page, { title: string; subtitle?: string }> = {
  '/dashboard': {
    title: 'Production Readiness Dashboard',
    subtitle: 'Visualisasi kesiapan line produksi Lantai 1 — mesin RVS & Toyo',
  },
  '/dashboard-admin': { 
    title: 'Dashboard Admin',
    subtitle: 'Overview of key metrics and performance indicators related to production floor activities',

   },
  '/dashboard-user': { 
    title: 'Dashboard' ,
    subtitle: 'Overview of key metrics and performance indicators related to production floor activities',

  
  },

  '/cleaning': {
    title: 'Cleaning Management',
    subtitle: 'Log of all cleaning activities performed in production floor facility',
  },
  '/production-readiness': { title: 'Production Readiness' },
  '/qa-verification': {
    title: 'QA Verification',
    subtitle: 'Review and verify cleaning records for quality assurance and compliance monitoring',
  },
  '/schedules': { title: 'Schedules' },
  '/login': { title: 'Login' },
  '/signup': { title: 'Sign Up' },
  '/room-readiness': { title: 'Room Readiness', subtitle: 'Monitoring environmental in the first floor' },
  '/users':       { 
    title: 'Users',       
    subtitle: 'Manage user accounts, roles, and access permissions' },
  '/audit-trail': { 
    title: 'Audit Trail', 
    subtitle: "Log all's users activity in the system" },
  '/master-data': { 
    title: 'Master Data', 
    subtitle: 'Kelola data mesin, lantai, dan item part' },
  '/user-admin': {
    title: 'User Admin',
    subtitle: 'Admin point of view page',
},
};

const isValidPage = (path: string): path is Page => {
  return path in PAGE_META;
};

const DASH_TABS = [
  { id: 'overview',    label: 'Dashboard' },
  { id: 'adjustment',  label: 'Production Line' },
] as const;
type DashTab = typeof DASH_TABS[number]['id'];

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '11px 20px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: active ? 700 : 500,
  color: active ? '#1d4ed8' : '#6b7280',
  borderBottom: `2.5px solid ${active ? '#1d4ed8' : 'transparent'}`,
  marginBottom: -1,
  fontFamily: 'inherit',
  transition: 'color 0.15s',
});

export const App: React.FC = () => {
  const [page, setPage]         = useState<Page>('/login');
  const [dashTab, setDashTab]   = useState<DashTab>('overview');
  const meta = PAGE_META[page] ?? { title: 'Unknown Page' };

  const handleNavigate = (path: string) => {
    if (isValidPage(path)) {
      setPage(path);
      if (path !== '/dashboard-admin' && path !== '/dashboard-user') {
        setDashTab('overview');
      }
    } else {
      console.warn('Invalid path:', path);
      setPage('/cleaning');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('elisa_token');
    localStorage.removeItem('elisa_user');
    setPage('/login');
  };

  const handleLogin = (_role: string, _name: string, user: UserInfo) => {
    if (user.role === 'admin')                             setPage('/dashboard-admin');
    else if (user.role === 'qa')                           setPage('/qa-verification');
    else if (user.role === 'supervisor' || user.role === 'site_head') setPage('/cleaning');
    else                                                   setPage('/dashboard-user');
  };

  if (page === '/login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoToSignUp={() => setPage('/signup')}
      />
    );
  }

  if (page === '/signup') {
    return (
      <SignUpPage
        onBackToLogin={() => setPage('/login')}
        onRegister={() => setPage('/login')}
      />
    );
  }

  return (
    <AppLayout
      activePath={page}
      pageTitle={meta.title}
      pageSubtitle={meta.subtitle}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {page === '/dashboard' && <DashboardAdjustmentPage />}

      {(page === '/dashboard-admin' || page === '/dashboard-user') && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* ── Blue tab bar ── */}
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', background: '#fff', padding: '0 24px', flexShrink: 0 }}>
            {DASH_TABS.map(tab => (
              <button key={tab.id} onClick={() => setDashTab(tab.id)} style={tabStyle(dashTab === tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {dashTab === 'overview' && page === '/dashboard-admin' && (
              <DashboardAdminPage onNavigate={handleNavigate} />
            )}
            {dashTab === 'overview' && page === '/dashboard-user' && (
              <DashboardUserPage role="user" onNavigate={handleNavigate} />
            )}
            {dashTab === 'adjustment' && <DashboardAdjustmentPage />}
          </div>
        </div>
      )}

      {page === '/cleaning' && <CleaningManagement />}

      {page === '/production-readiness' && <ProductionReadinessPage />}

      {page === '/qa-verification' && <QAVerificationPage />}

      {page === '/schedules' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
          Halaman Schedules belum diimplementasikan.
        </div>
      )}
      {page === '/user-admin' && <UserAdminPOV />}
      {page === '/room-readiness' && <RoomReadinessPage />}
      {page === '/users'       && <UsersPage />}
      {page === '/audit-trail' && <AuditTrailPage />}
      {page === '/master-data' && <MasterDataPage />}
    </AppLayout>
  );
};

const AppWithAuth: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithAuth;