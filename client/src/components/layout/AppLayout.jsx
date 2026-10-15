import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import GlobalSearchModal from '../common/GlobalSearchModal';
import InvoiceUploadModal from '../invoices/InvoiceUploadModal';
import LoadingSkeleton from '../common/LoadingSkeleton';
import WelcomeAnimation from '../ui/WelcomeAnimation';
import ProfileDrawer from '../common/ProfileDrawer';

export const AppLayout = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const { theme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showWelcome, setShowWelcome]   = useState(false);
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  // Show welcome animation once per login (not per navigation)
  useEffect(() => {
    const key = `invoxa_welcome_${user?._id || 'user'}`;
    if (user && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      setShowWelcome(true);
    }
  }, [user]);

  // Global Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const bg = isDark ? '#1F1916' : '#FFF8F1';
  const textMain = isDark ? '#F9EFEA' : '#26332B';

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: bg }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
          <div style={{ position:'relative', width:'40px', height:'40px' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid #E8DED5' }}/>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid transparent',
              borderTopColor:'#E9A992', animation:'spin 0.8s linear infinite' }}/>
          </div>
          <p style={{ fontSize:'12px', fontWeight:700, color:'#98A39A', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            INVOXA
          </p>
        </div>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div style={{ minHeight:'100vh', background: bg, color: textMain, display:'flex', transition:'background 0.3s' }}>
      {/* Welcome overlay */}
      {showWelcome && (
        <WelcomeAnimation user={user} onComplete={() => setShowWelcome(false)} />
      )}

      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main content area — offset by sidebar width on md+ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}
        className="main-content-offset">
        <Navbar
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenUploadModal={() => setIsUploadOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
        <main style={{ flex:1, padding:'clamp(16px,4vw,32px)', maxWidth:'1440px', width:'100%', margin:'0 auto' }}>
          <Outlet />
        </main>
      </div>

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <InvoiceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onInvoiceCreated={() => navigate('/invoices')}
      />

      <style>{`
        .main-content-offset { padding-left: 0; }
        @media (min-width: 768px) { .main-content-offset { padding-left: 240px; } }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AppLayout;
