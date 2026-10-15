import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { Menu, Search, Bell, Sun, Moon, Plus, Settings, LogOut, CheckCircle2, AlertTriangle, FileText, Clock, User } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const Navbar = ({ onOpenMobileSidebar, onOpenSearch, onOpenUploadModal, onOpenProfile }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu]           = useState(false);
  const notifRef = useRef(null);
  const userRef  = useRef(null);
  const navigate = useNavigate();
  const isDark   = theme === 'dark';

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    sessionStorage.removeItem('invoxa_intro_shown');
    sessionStorage.removeItem(`invoxa_welcome_${user?._id || 'user'}`);
    await logout();
    navigate('/login');
  };

  // ── Color tokens (Warm Peach Dark Theme) ─────────────────────────────────────
  const navBg      = isDark ? 'rgba(41,33,30,0.96)' : 'rgba(255,252,248,0.92)';
  const borderColor = isDark ? '#54423A' : '#E8DED5';
  const textMain    = isDark ? '#F9EFEA' : '#26332B';
  const textMuted   = isDark ? '#A89489' : '#68756C';
  const cardBg      = isDark ? '#29211E' : '#FFFCF8';
  const hoverBg     = isDark ? 'rgba(233,169,146,0.12)' : '#FFF0E8';
  const dropdownBg  = isDark ? '#29211E' : '#FFFCF8';
  const dropdownBorder = isDark ? '#54423A' : '#E8DED5';

  const iconBtn = {
    padding:'8px', borderRadius:'10px', border:`1px solid ${borderColor}`,
    background: cardBg, color: textMuted, cursor:'pointer',
    display:'flex', alignItems:'center', justifyContent:'center',
    transition:'all 0.18s', position:'relative',
  };

  const notifTypeIcon = (type) => {
    const map = { OVERDUE: <AlertTriangle size={12} color="#C96B62"/>, APPROVAL: <CheckCircle2 size={12} color="#6FA77A"/>, DUE_SOON: <Clock size={12} color="#D9A441"/>, DUPLICATE: <AlertTriangle size={12} color="#E9A992"/> };
    return map[type] || <FileText size={12} color="#98A39A"/>;
  };

  return (
    <header style={{
      position:'sticky', top:0, zIndex:20, height:'60px',
      background: navBg, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
      borderBottom:`1px solid ${borderColor}`,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 20px', gap:'12px',
      transition:'background 0.3s',
    }}>
      {/* Left: mobile menu + search */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', flex:1, maxWidth:'400px' }}>
        <button onClick={onOpenMobileSidebar}
          style={{ ...iconBtn, display:'flex' }}
          className="md-hide-menu"
        >
          <Menu size={16}/>
        </button>

        <button onClick={onOpenSearch} style={{
          flex:1, display:'flex', alignItems:'center', gap:'8px',
          padding:'8px 14px', borderRadius:'10px',
          border:`1px solid ${borderColor}`, background: isDark ? '#231C19' : '#FFF5EE',
          color: textMuted, cursor:'pointer', textAlign:'left',
          fontSize:'12px', fontWeight:500, transition:'all 0.18s',
          maxWidth:'280px',
        }}>
          <Search size={13}/>
          <span style={{ flex:1 }}>Search invoices, vendors…</span>
          <span style={{
            fontSize:'10px', padding:'2px 6px', borderRadius:'5px',
            border:`1px solid ${borderColor}`, color: textMuted, whiteSpace:'nowrap',
          }}>⌘K</span>
        </button>
      </div>

      {/* Right: actions */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        {/* Upload invoice */}
        <button onClick={onOpenUploadModal} style={{
          display:'flex', alignItems:'center', gap:'6px',
          padding:'8px 14px', borderRadius:'10px',
          background:'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
          color:'#26332B', border:'none', cursor:'pointer',
          fontSize:'12px', fontWeight:700, transition:'all 0.18s',
          boxShadow:'0 2px 8px rgba(233,169,146,0.35)',
          whiteSpace:'nowrap',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(233,169,146,0.45)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(233,169,146,0.35)'; }}
        >
          <Plus size={13}/>
          <span className="hide-on-mobile">Upload Invoice</span>
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={iconBtn}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
          onMouseLeave={(e) => e.currentTarget.style.background = cardBg}
        >
          {isDark ? <Sun size={15} color="#D9A441"/> : <Moon size={15} color="#68756C"/>}
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position:'relative' }}>
          <button onClick={() => setShowNotifications(!showNotifications)} style={{...iconBtn}}
            onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
            onMouseLeave={(e) => e.currentTarget.style.background = cardBg}
          >
            <Bell size={15}/>
            {unreadCount > 0 && (
              <span style={{
                position:'absolute', top:'-3px', right:'-3px',
                minWidth:'16px', height:'16px', borderRadius:'8px',
                background:'#E9A992', color:'#26332B',
                fontSize:'9px', fontWeight:800, display:'flex',
                alignItems:'center', justifyContent:'center',
                padding:'0 4px', border:`2px solid ${cardBg}`,
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div style={{
              position:'absolute', right:0, top:'calc(100% + 8px)',
              width:'320px', background: dropdownBg,
              border:`1px solid ${dropdownBorder}`, borderRadius:'14px',
              boxShadow:`0 8px 32px rgba(38,51,43,${isDark?'0.4':'0.12'})`,
              overflow:'hidden', zIndex:100,
              animation:'scaleIn 0.2s ease',
            }}>
              <div style={{ padding:'14px 16px', borderBottom:`1px solid ${dropdownBorder}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'13px', fontWeight:700, color: textMain }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={{
                    fontSize:'11px', color:'#E9A992', fontWeight:600,
                    background:'none', border:'none', cursor:'pointer', padding:0,
                  }}>Mark all read</button>
                )}
              </div>
              <div style={{ maxHeight:'320px', overflowY:'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding:'32px 16px', textAlign:'center', color: textMuted, fontSize:'13px' }}>
                    <Bell size={24} style={{ margin:'0 auto 8px', opacity:0.3, display:'block' }}/>
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0,12).map((n) => (
                    <div key={n._id} onClick={() => markAsRead(n._id)} style={{
                      padding:'12px 16px', cursor:'pointer',
                      background: n.read ? 'transparent' : (isDark ? 'rgba(246,199,182,0.05)' : '#FFF8F4'),
                      borderBottom:`1px solid ${isDark ? 'rgba(84,66,58,0.5)' : '#F0E8E0'}`,
                      display:'flex', gap:'10px', alignItems:'flex-start',
                      transition:'background 0.15s',
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                      onMouseLeave={(e) => e.currentTarget.style.background = n.read ? 'transparent' : (isDark ? 'rgba(233,169,146,0.08)' : '#FFF8F4')}
                    >
                      <div style={{ width:'24px', height:'24px', borderRadius:'6px', background: isDark ? '#352924' : '#F0E8E0',
                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'1px' }}>
                        {notifTypeIcon(n.type)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:'12px', fontWeight: n.read ? 500 : 700, color: textMain, marginBottom:'2px', lineHeight:'1.4' }}>{n.message}</p>
                        <p style={{ fontSize:'10px', color: textMuted }}>{formatDateTime(n.createdAt)}</p>
                      </div>
                      {!n.read && <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#E9A992', flexShrink:0, marginTop:'5px' }}/>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar menu */}
        <div ref={userRef} style={{ position:'relative' }}>
          <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
            width:'36px', height:'36px', borderRadius:'10px',
            background: isDark ? 'rgba(246,199,182,0.15)' : '#F6C7B6',
            color: isDark ? '#F6C7B6' : '#26332B',
            border:'none', cursor:'pointer', fontSize:'13px', fontWeight:800,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.18s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity='0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity='1'}
          >
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </button>

          {showUserMenu && (
            <div style={{
              position:'absolute', right:0, top:'calc(100% + 8px)',
              width:'200px', background: dropdownBg,
              border:`1px solid ${dropdownBorder}`, borderRadius:'14px',
              boxShadow:`0 8px 32px rgba(38,51,43,${isDark?'0.4':'0.12'})`,
              overflow:'hidden', zIndex:100,
              animation:'scaleIn 0.2s ease',
            }}>
              {/* User info header */}
              <div
                style={{ padding:'14px 16px', borderBottom:`1px solid ${dropdownBorder}`, cursor:'pointer' }}
                onClick={() => { setShowUserMenu(false); onOpenProfile?.(); }}
                title="Click to view profile drawer"
              >
                <p style={{ fontSize:'13px', fontWeight:700, color: textMain }}>{user?.name || 'User'}</p>
                <p style={{ fontSize:'11px', color:'#E9A992', fontWeight:600 }}>{user?.role}</p>
                <p style={{ fontSize:'10px', color: textMuted, marginTop:'2px' }}>{user?.email}</p>
              </div>

              {[
                { label:'Member Profile', icon:<User size={13}/>, action:() => { setShowUserMenu(false); onOpenProfile?.(); } },
                { label:'Settings', icon:<Settings size={13}/>, action:() => { setShowUserMenu(false); navigate('/settings'); } },
              ].map((item) => (
                <button key={item.label} onClick={item.action} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:'10px',
                  padding:'10px 16px', background:'transparent', border:'none',
                  color: textMuted, fontSize:'12px', fontWeight:600, cursor:'pointer',
                  textAlign:'left', transition:'background 0.15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {item.icon} {item.label}
                </button>
              ))}

              <div style={{ borderTop:`1px solid ${dropdownBorder}` }}>
                <button onClick={handleLogout} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:'10px',
                  padding:'10px 16px', background:'transparent', border:'none',
                  color:'#C96B62', fontSize:'12px', fontWeight:600, cursor:'pointer',
                  textAlign:'left', transition:'background 0.15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = (isDark ? 'rgba(201,107,98,0.1)' : '#FDF1EF')}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={13}/> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .md-hide-menu { display: flex; }
        @media (min-width: 768px) { .md-hide-menu { display: none !important; } }
        .hide-on-mobile { display: inline; }
        @media (max-width: 480px) { .hide-on-mobile { display: none; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.94) translateY(-4px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>
    </header>
  );
};

export default Navbar;
