import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, FileText, ShieldCheck, CheckSquare,
  Building2, CreditCard, Receipt, BarChart3, Settings,
  History, LogOut, Sun, Moon, ChevronLeft, ChevronRight,
} from 'lucide-react';

// ── INVOXA Logo SVG ────────────────────────────────────────────────────────────
const InvoxaLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="56" height="56" rx="12" fill="#F6C7B6"/>
    <path d="M16 12h16l8 8v20a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z"
      fill="#FFFCF8" stroke="#E9A992" strokeWidth="1.5"/>
    <polyline points="32,12 32,20 40,20" fill="none" stroke="#E9A992" strokeWidth="1.5"/>
    <path d="m20 34 4 4 9-9" stroke="#6FA77A" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Sidebar = ({ isMobileOpen, setIsMobileOpen, onOpenProfile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    sessionStorage.removeItem('invoxa_intro_shown');
    sessionStorage.removeItem('invoxa_welcome_shown');
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard',           path: '/dashboard',    icon: LayoutDashboard, roles: ['ADMIN', 'ACCOUNTS TEAM', 'VENDOR'] },
    { label: 'Invoices',            path: '/invoices',     icon: FileText,        roles: ['ADMIN', 'ACCOUNTS TEAM', 'VENDOR'] },
    { label: 'Doc Intelligence',    path: '/verification', icon: ShieldCheck,     roles: ['ADMIN', 'ACCOUNTS TEAM'] },
    { label: 'Approvals',           path: '/approvals',    icon: CheckSquare,     roles: ['ADMIN', 'ACCOUNTS TEAM'] },
    { label: 'Activity Log',        path: '/activity',     icon: History,         roles: ['ADMIN', 'ACCOUNTS TEAM', 'VENDOR'] },
    { label: 'Vendors',             path: '/vendors',      icon: Building2,       roles: ['ADMIN', 'ACCOUNTS TEAM'] },
    { label: 'Payments',            path: '/payments',     icon: CreditCard,      roles: ['ADMIN', 'ACCOUNTS TEAM', 'VENDOR'] },
    { label: 'Transactions',        path: '/transactions', icon: Receipt,         roles: ['ADMIN', 'ACCOUNTS TEAM', 'VENDOR'] },
    { label: 'Reports',             path: '/reports',      icon: BarChart3,       roles: ['ADMIN', 'ACCOUNTS TEAM'] },
    { label: 'Settings',            path: '/settings',     icon: Settings,        roles: ['ADMIN', 'ACCOUNTS TEAM', 'VENDOR'] },
  ];

  const userRole = user?.role || 'ACCOUNTS TEAM';
  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));

  // ── Color tokens (Warm Peach Dark Theme) ─────────────────────────────────────
  const sidebarBg     = isDark ? '#29211E' : '#FFFCF8';
  const borderColor   = isDark ? '#54423A' : '#E8DED5';
  const textMain      = isDark ? '#F9EFEA' : '#26332B';
  const textMuted     = isDark ? '#A89489' : '#68756C';
  const activeBg      = isDark ? 'rgba(233,169,146,0.22)' : '#F6C7B6';
  const activeText    = isDark ? '#E9A992' : '#26332B';
  const hoverBg       = isDark ? 'rgba(233,169,146,0.10)' : '#FFF0E8';
  const avatarBg      = isDark ? 'rgba(233,169,146,0.22)' : '#F6C7B6';
  const avatarText    = isDark ? '#E9A992' : '#26332B';

  const sidebarContent = (
    <div style={{
      display:'flex', flexDirection:'column', height:'100%',
      background: sidebarBg, borderRight:`1px solid ${borderColor}`,
      transition:'all 0.3s',
    }}>
      {/* Brand Header */}
      <div style={{
        height:'64px', display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'0 12px',
        borderBottom:`1px solid ${borderColor}`,
        flexShrink:0,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', overflow:'hidden' }}>
          <div style={{ flexShrink:0 }}>
            <InvoxaLogo size={collapsed ? 32 : 36} />
          </div>
          {!collapsed && (
            <div>
              <div style={{
                fontSize:'16px', fontWeight:800, color: textMain,
                fontFamily:"'Plus Jakarta Sans','Inter',sans-serif",
                letterSpacing:'-0.02em', lineHeight:1.1,
              }}>
                INVOXA
              </div>
              <div style={{ fontSize:'9px', color: textMuted, fontWeight:600,
                letterSpacing:'0.06em', textTransform:'uppercase', marginTop:'1px' }}>
                Invoice Operations
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display:'none', padding:'5px', borderRadius:'8px',
            border:`1px solid ${borderColor}`, background:'transparent',
            color: textMuted, cursor:'pointer',
          }}
          className="lg-flex-sidebar-toggle"
        >
          {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex:1, overflowY:'auto', padding:'12px 8px' }}>
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              style={{ textDecoration:'none' }}
            >
              {({ isActive }) => (
                <div style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding: collapsed ? '10px 12px' : '9px 12px',
                  borderRadius:'10px', marginBottom:'2px',
                  background: isActive ? activeBg : 'transparent',
                  color: isActive ? activeText : textMuted,
                  fontWeight: isActive ? 700 : 500,
                  fontSize:'13px',
                  cursor:'pointer',
                  transition:'all 0.18s',
                  position:'relative',
                }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = hoverBg; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={16} style={{ flexShrink:0 }}/>
                  {!collapsed && <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</span>}
                  {/* Tooltip */}
                  {collapsed && (
                    <div style={{
                      position:'absolute', left:'calc(100% + 10px)', top:'50%', transform:'translateY(-50%)',
                      background:'#26332B', color:'#FFFCF8', fontSize:'11px', fontWeight:600,
                      padding:'4px 10px', borderRadius:'6px', whiteSpace:'nowrap',
                      pointerEvents:'none', opacity:0, transition:'opacity 0.15s',
                      zIndex:999,
                    }}
                      className="sidebar-tooltip">
                      {item.label}
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:'8px', borderTop:`1px solid ${borderColor}`, flexShrink:0 }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          width:'100%', display:'flex', alignItems:'center', gap:'10px',
          padding:'8px 12px', borderRadius:'10px', marginBottom:'6px',
          background:'transparent', border:'none', color: textMuted,
          fontSize:'12px', fontWeight:600, cursor:'pointer',
          transition:'background 0.15s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {isDark
            ? <Sun size={15} color="#D9A441"/>
            : <Moon size={15} color="#68756C"/>}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User card */}
        <div
          onClick={() => onOpenProfile?.()}
          title="Click to view profile drawer"
          style={{
            display:'flex', alignItems:'center', gap:'8px',
            padding:'8px 10px', borderRadius:'12px',
            background: isDark ? 'rgba(246,199,182,0.07)' : '#FFF0E8',
            cursor:'pointer', transition:'all 0.18s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(246,199,182,0.12)' : '#FFE6DB'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? 'rgba(246,199,182,0.07)' : '#FFF0E8'; }}
        >
          <div style={{
            width:'32px', height:'32px', borderRadius:'9px',
            background: avatarBg, color: avatarText,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'13px', fontWeight:800, flexShrink:0,
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'12px', fontWeight:700, color: textMain, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize:'10px', color:'#E9A992', fontWeight:600 }}>
                {userRole}
              </div>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            title="Sign Out"
            style={{
              padding:'5px', borderRadius:'8px', background:'transparent',
              border:'none', color: textMuted, cursor:'pointer',
              transition:'color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#C96B62'}
            onMouseLeave={(e) => e.currentTarget.style.color = textMuted}
          >
            <LogOut size={14}/>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        position:'fixed', top:0, left:0, bottom:0,
        zIndex:30, width: collapsed ? '64px' : '240px',
        transition:'width 0.3s',
        display:'none',
      }}
        className="md-sidebar-desktop">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex' }}>
          <div onClick={() => setIsMobileOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(38,51,43,0.55)', backdropFilter:'blur(4px)' }}/>
          <div style={{ position:'relative', width:'240px', maxWidth:'80vw', height:'100%', zIndex:10, boxShadow:'4px 0 24px rgba(0,0,0,0.15)' }}>
            {sidebarContent}
          </div>
        </div>
      )}

      <style>{`
        .md-sidebar-desktop { display: none !important; }
        @media (min-width: 768px) { .md-sidebar-desktop { display: block !important; } }
        .lg-flex-sidebar-toggle { display: none !important; }
        @media (min-width: 1024px) { .lg-flex-sidebar-toggle { display: flex !important; } }
        nav a div:hover .sidebar-tooltip { opacity: 1 !important; }
      `}</style>
    </>
  );
};

export default Sidebar;
