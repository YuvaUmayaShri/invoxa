import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import WelcomeAnimation from '../../components/ui/WelcomeAnimation';
import { Eye, EyeOff, Sun, Moon, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(true);
  const [loading, setLoading]           = useState(false);
  const [shakeError, setShakeError]     = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successUser, setSuccessUser]   = useState(null); // triggers welcome anim

  const { login } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleDemoSelect = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      triggerShake();
      return;
    }
    setLoading(true);
    setErrorMessage('');

    const res = await login(email, password);

    if (res.success) {
      setSuccessUser(res.user);
      // Welcome animation finishes then navigates
    } else {
      setLoading(false);
      setErrorMessage("That didn't work. Please check your email or password and try again.");
      setPassword('');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleWelcomeDone = () => {
    navigate('/dashboard');
  };

  const isDark = theme === 'dark';

  // ── Light/Dark style variables (Warm Peach Dark Theme) ─────────────────────
  const pageBg = isDark
    ? 'linear-gradient(135deg, #1F1916 0%, #261F1B 60%, #1A1513 100%)'
    : 'linear-gradient(135deg, #FFF8F1 0%, #FFFCF8 55%, #F4FAF2 100%)';
  const cardBg    = isDark ? '#29211E' : '#FFFCF8';
  const cardBorder= isDark ? '#54423A' : '#E8DED5';
  const textMain  = isDark ? '#F9EFEA' : '#26332B';
  const textSub   = isDark ? '#D6C2B6' : '#68756C';
  const textMuted = isDark ? '#A89489' : '#98A39A';
  const inputBg   = isDark ? '#221B18' : '#FFF8F4';
  const inputBorder=isDark ? '#54423A' : '#E8DED5';
  const inputFocus='#E9A992';

  return (
    <>
      {/* Welcome animation after login */}
      {successUser && (
        <WelcomeAnimation user={successUser} onComplete={handleWelcomeDone} />
      )}

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: pageBg,
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.4s',
      }}>
        {/* Atmospheric blobs */}
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'400px', height:'400px',
          background:'radial-gradient(circle, rgba(246,199,182,0.32) 0%, transparent 70%)',
          borderRadius:'50%', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-100px', left:'-100px', width:'450px', height:'450px',
          background:'radial-gradient(circle, rgba(191,216,184,0.25) 0%, transparent 70%)',
          borderRadius:'50%', pointerEvents:'none' }} />

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          position:'absolute', top:'20px', right:'20px',
          padding:'8px', borderRadius:'10px',
          border:`1px solid ${cardBorder}`, background: cardBg,
          color: textMuted, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.2s',
        }}>
          {isDark
            ? <Sun  size={16} color="#D9A441" />
            : <Moon size={16} color="#68756C" />}
        </button>

        {/* Card */}
        <div style={{
          width:'100%', maxWidth:'420px',
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '20px',
          padding: 'clamp(24px, 5vw, 40px)',
          boxShadow: isDark
            ? '0 8px 40px rgba(0,0,0,0.35)'
            : '0 4px 32px rgba(38,51,43,0.10)',
          position: 'relative', zIndex: 10,
          animation: 'fadeUp 0.55s ease forwards',
          ...(shakeError && { animation: 'shake 0.45s ease-in-out' }),
        }}>

          {/* Logo + Brand */}
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div style={{ display:'inline-flex', marginBottom:'14px' }}>
              <svg width="52" height="52" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="14" fill="#F6C7B6"/>
                <path d="M16 12h16l8 8v20a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z"
                  fill="#FFFCF8" stroke="#E9A992" strokeWidth="1.5"/>
                <polyline points="32,12 32,20 40,20" fill="none" stroke="#E9A992" strokeWidth="1.5"/>
                <path d="m20 34 4 4 9-9" stroke="#6FA77A" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{
              fontSize:'26px', fontWeight:800, color: textMain,
              fontFamily:"'Plus Jakarta Sans','Inter',sans-serif",
              letterSpacing:'-0.02em', marginBottom:'4px',
            }}>
              INVOXA
            </h1>
            <p style={{ fontSize:'12px', color: textMuted, fontWeight:500 }}>
              Intelligent Invoice Operations
            </p>
            <p style={{ fontSize:'14px', color: textSub, fontWeight:500, marginTop:'12px' }}>
              Welcome back
            </p>
            <p style={{ fontSize:'12px', color: textMuted }}>
              Sign in to continue to INVOXA
            </p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div style={{
              marginBottom:'16px', padding:'10px 14px',
              background: isDark ? 'rgba(201,107,98,0.15)' : '#FDF1EF',
              border:'1px solid rgba(201,107,98,0.35)',
              borderRadius:'10px',
              display:'flex', alignItems:'flex-start', gap:'8px',
              animation: 'fadeIn 0.25s ease',
            }}>
              <AlertTriangle size={14} color="#C96B62" style={{ marginTop:'1px', flexShrink:0 }} />
              <p style={{ fontSize:'12px', color:'#C96B62', fontWeight:500, lineHeight:'1.5' }}>
                {errorMessage}
              </p>
            </div>
          )}

          {/* Success state */}
          {successUser && !errorMessage && (
            <div style={{
              marginBottom:'16px', padding:'10px 14px',
              background: isDark ? 'rgba(111,167,122,0.15)' : '#F0FAF1',
              border:'1px solid rgba(111,167,122,0.35)',
              borderRadius:'10px',
              display:'flex', alignItems:'center', gap:'8px',
            }}>
              <CheckCircle2 size={14} color="#6FA77A" />
              <p style={{ fontSize:'12px', color:'#6FA77A', fontWeight:600 }}>
                Authenticated — loading your workspace…
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {/* Email */}
            <div>
              <label style={{ fontSize:'12px', fontWeight:600, color: textSub, display:'block', marginBottom:'6px' }}>
                Email Address
              </label>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color: textMuted }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
                  placeholder="name@company.com"
                  required
                  style={{
                    width:'100%', boxSizing:'border-box',
                    paddingLeft:'36px', paddingRight:'12px', paddingTop:'10px', paddingBottom:'10px',
                    border:`1px solid ${errorMessage ? 'rgba(201,107,98,0.5)' : inputBorder}`,
                    borderRadius:'10px', background: inputBg, color: textMain,
                    fontSize:'13px', fontWeight:500, outline:'none',
                    transition:'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = inputFocus}
                  onBlur={(e) => e.target.style.borderColor = errorMessage ? 'rgba(201,107,98,0.5)' : inputBorder}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                <label style={{ fontSize:'12px', fontWeight:600, color: textSub }}>Password</label>
                <button type="button"
                  onClick={() => showToast('Use the demo credentials below to access the platform.', 'info')}
                  style={{ fontSize:'11px', color:'#E9A992', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0 }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color: textMuted }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
                  placeholder="••••••••"
                  required
                  style={{
                    width:'100%', boxSizing:'border-box',
                    paddingLeft:'36px', paddingRight:'40px', paddingTop:'10px', paddingBottom:'10px',
                    border:`1px solid ${errorMessage ? 'rgba(201,107,98,0.5)' : inputBorder}`,
                    borderRadius:'10px', background: inputBg, color: textMain,
                    fontSize:'13px', fontWeight:500, outline:'none',
                    transition:'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = inputFocus}
                  onBlur={(e) => e.target.style.borderColor = errorMessage ? 'rgba(201,107,98,0.5)' : inputBorder}
                />
                <button type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                    color: textMuted, background:'none', border:'none', cursor:'pointer', padding:0 }}>
                  {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width:'15px', height:'15px', accentColor:'#E9A992' }}
              />
              <span style={{ fontSize:'12px', color: textMuted, fontWeight:500 }}>Remember me</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!successUser}
              style={{
                width:'100%', padding:'13px',
                background: loading || successUser ? '#E8DED5' : 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                color: loading || successUser ? textMuted : '#26332B',
                border:'none', borderRadius:'12px',
                fontSize:'14px', fontWeight:700, cursor: loading || successUser ? 'default' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                transition:'all 0.2s',
                boxShadow: loading || successUser ? 'none' : '0 4px 16px rgba(233,169,146,0.4)',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width:'14px', height:'14px', border:'2px solid rgba(38,51,43,0.3)',
                    borderTopColor:'#26332B', borderRadius:'50%', display:'inline-block',
                    animation:'spin 0.7s linear infinite' }} />
                  Authenticating…
                </>
              ) : successUser ? (
                <><CheckCircle2 size={16}/> Welcome back!</>
              ) : (
                <>Sign In →</>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop:'24px', paddingTop:'20px', borderTop:`1px solid ${cardBorder}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px' }}>
              <Zap size={13} color="#D9A441"/>
              <span style={{ fontSize:'11px', fontWeight:700, color: textMuted, letterSpacing:'0.04em', textTransform:'uppercase' }}>
                Quick Access — Demo Accounts
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
              {[
                { label:'Admin', sub:'Executive', email:'admin@example.com', pass:'Admin@123', accent:'#F6C7B6', accentDark:'rgba(246,199,182,0.15)', textColor:'#8C4E32' },
                { label:'Accounts', sub:'AP Team', email:'accounts@example.com', pass:'Accounts@123', accent:'#BFD8B8', accentDark:'rgba(191,216,184,0.15)', textColor:'#376642' },
                { label:'Vendor', sub:'ABC Tech', email:'vendor@example.com', pass:'Vendor@123', accent:'#F5E2C0', accentDark:'rgba(217,164,65,0.12)', textColor:'#A0783B' },
              ].map((role) => (
                <button
                  key={role.label}
                  type="button"
                  onClick={() => handleDemoSelect(role.email, role.pass)}
                  style={{
                    padding:'10px 6px', borderRadius:'10px',
                    border:`1px solid ${isDark ? role.accentDark.replace('0.15','0.3') : role.accent}`,
                    background: isDark ? role.accentDark : role.accent + '55',
                    color: isDark ? role.accent : role.textColor,
                    fontSize:'11px', fontWeight:700, cursor:'pointer', textAlign:'center',
                    transition:'all 0.2s',
                  }}
                >
                  <div>{role.label}</div>
                  <div style={{ fontSize:'10px', fontWeight:400, opacity:0.75, marginTop:'2px' }}>{role.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INVOXA watermark */}
        <p style={{ position:'absolute', bottom:'20px', fontSize:'11px', color: textMuted,
          opacity:0.5, letterSpacing:'0.05em' }}>
          INVOXA · Intelligent Invoice Operations
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%,60% { transform:translateX(-7px); }
          40%,80% { transform:translateX(7px); }
        }
      `}</style>
    </>
  );
};

export default LoginPage;
