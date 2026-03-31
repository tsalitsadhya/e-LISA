import React, { useState } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { CleaningManagement } from './components/cleaning-management/CleaningManagement';

import DashboardAdjustmentPage from './pages/DashboardAdjustment';
import DashboardAdminPage from './pages/DashboardAdminPage';
import DashboardUserPage from './pages/DashboardUserPage';
import QAVerificationPage from './pages/QAVerificationPage';
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
  | '/room-readiness-ok'
  | '/room-readiness-warning'
  | '/users'
  | '/audit-trail'
  | '/user-admin'
  | '/master-data';

const PAGE_META: Record<Page, { title: string; subtitle?: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Overview of key metrics and performance indicators related to production floor activities',
  },
  '/dashboard-admin': { 
    title: 'Dashboard Admin',
    subtitle: 'Overview of key metrics and performance indicators related to production floor activities',

   },
  '/dashboard-user': { title: 'Dashboard' },
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
};

const isValidPage = (path: string): path is Page => {
  return path in PAGE_META;
};

export const App: React.FC = () => {
  const [page, setPage] = useState<Page>('/cleaning');
  const meta = PAGE_META[page] ?? { title: 'Unknown Page' };

  const handleNavigate = (path: string) => {
    if (isValidPage(path)) {
      setPage(path);
    } else {
      console.warn('Invalid path:', path);
      setPage('/cleaning');
    }
  };

  const handleLogout = () => {
    setPage('/login');
  };

  if (page === '/login') {
    return (
      <LoginPage
        onLogin={() => setPage('/dashboard-user')}
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

      {page === '/dashboard-admin' && (
        <DashboardAdminPage onNavigate={handleNavigate} />
      )}

      {page === '/dashboard-user' && (
        <DashboardUserPage role="user" onNavigate={handleNavigate} />
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

export default App;