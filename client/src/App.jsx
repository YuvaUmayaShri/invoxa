import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import AppLayout from './components/layout/AppLayout';
import IntroScreen from './components/ui/IntroScreen';

// Lazy load pages
const LoginPage        = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage    = lazy(() => import('./pages/dashboard/DashboardPage'));
const InvoicesPage     = lazy(() => import('./pages/invoices/InvoicesPage'));
const VendorsPage      = lazy(() => import('./pages/vendors/VendorsPage'));
const VendorDetailPage = lazy(() => import('./pages/vendors/VendorDetailPage'));
const ApprovalsPage    = lazy(() => import('./pages/approvals/ApprovalsPage'));
const PaymentsPage     = lazy(() => import('./pages/payments/PaymentsPage'));
const TransactionsPage = lazy(() => import('./pages/transactions/TransactionsPage'));
const VerificationPage = lazy(() => import('./pages/verification/VerificationPage'));
const ReportsPage      = lazy(() => import('./pages/reports/ReportsPage'));
const SettingsPage     = lazy(() => import('./pages/settings/SettingsPage'));
const ActivityLogPage  = lazy(() => import('./pages/activity/ActivityLogPage'));

// ── Page loader in INVOXA brand colors ───────────────────────────────────────
const PageLoader = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FFF8F1' }}>
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>
      <div style={{ position:'relative', width:'40px', height:'40px' }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid #E8DED5' }}/>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid transparent',
          borderTopColor:'#E9A992', animation:'spin 0.8s linear infinite' }}/>
      </div>
      <p style={{ fontSize:'12px', fontWeight:600, color:'#98A39A', letterSpacing:'0.04em' }}>
        INVOXA
      </p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Route guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Main routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<DashboardPage />} />
          <Route path="invoices"     element={<InvoicesPage />} />
          <Route path="vendors"      element={<VendorsPage />} />
          <Route path="vendors/:id"  element={<VendorDetailPage />} />
          <Route path="approvals"    element={<ApprovalsPage />} />
          <Route path="payments"     element={<PaymentsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="reports"      element={<ReportsPage />} />
          <Route path="activity"     element={<ActivityLogPage />} />
          <Route path="settings"     element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

// ── Root App — handles intro screen (shown only on first visit per session) ───
function App() {
  // Show intro once per browser session
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem('invoxa_intro_shown')
  );

  const handleIntroComplete = () => {
    sessionStorage.setItem('invoxa_intro_shown', '1');
    setShowIntro(false);
  };

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
              {!showIntro && <AppRoutes />}
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
