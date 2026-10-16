import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import WelcomeAnimation from '../../components/ui/WelcomeAnimation';
import {
  User, Mail, Lock, Eye, EyeOff, Building2, Phone,
  Sun, Moon, Shield, FileCheck2, Store, AlertCircle, CheckCircle2
} from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole]                     = useState('ACCOUNTS TEAM');
  const [companyName, setCompanyName]       = useState('');
  const [phone, setPhone]                   = useState('');

  const [showPass, setShowPass]             = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading]               = useState(false);
  const [errorMessage, setErrorMessage]     = useState('');
  const [shakeError, setShakeError]         = useState(false);
  const [successUser, setSuccessUser]       = useState(null);

  const isDark = theme === 'dark';

  // ── Theme tokens (Warm Peach & Pista Design System) ────────────────────────
  const pageBg    = isDark
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

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      triggerShake();
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      triggerShake();
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password.');
      triggerShake();
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      triggerShake();
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      triggerShake();
      return;
    }
    if (role === 'VENDOR' && !companyName.trim()) {
      setErrorMessage('Please enter your business / vendor company name.');
      triggerShake();
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      role,
      ...(role === 'VENDOR' && {
        companyName: companyName.trim(),
        vendorName: companyName.trim(),
        phone: phone.trim() || '+91 98000 00000',
        contactNumber: phone.trim() || '+91 98000 00000',
      }),
    };

    const res = await register(payload);

    if (res.success) {
      setSuccessUser(res.user);
    } else {
      setLoading(false);
      setErrorMessage(res.error || 'Failed to create account. Please try again.');
      triggerShake();
    }
  };

  const handleWelcomeDone = () => {
    navigate('/dashboard');
  };

  return (
    <>
      {successUser && (
        <WelcomeAnimation user={successUser} onComplete={handleWelcomeDone} />
      )}

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
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
          width:'100%', maxWidth:'460px',
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '20px',
          padding: 'clamp(24px, 5vw, 36px)',
          boxShadow: isDark
            ? '0 8px 40px rgba(0,0,0,0.35)'
            : '0 4px 32px rgba(38,51,43,0.10)',
          position: 'relative', zIndex: 10,
          animation: 'fadeUp 0.55s ease forwards',
          ...(shakeError && { animation: 'shake 0.45s ease-in-out' }),
        }}>

          {/* Logo + Brand */}
          <div style={{ textAlign:'center', marginBottom:'22px' }}>
            <div style={{ display:'inline-flex', marginBottom:'12px' }}>
              <svg width="48" height="48" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="14" fill="#F6C7B6"/>
                <path d="M16 12h16l8 8v20a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z"
                  fill="#FFFCF8" stroke="#E9A992" strokeWidth="1.5"/>
                <polyline points="32,12 32,20 40,20" fill="none" stroke="#E9A992" strokeWidth="1.5"/>
                <path d="m20 34 4 4 9-9" stroke="#6FA77A" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{
              fontSize:'22px', fontWeight:800, color: textMain,
              fontFamily:"'Plus Jakarta Sans','Inter',sans-serif",
              letterSpacing:'-0.02em', margin:0,
            }}>
              Create Your INVOXA Account
            </h1>
            <p style={{ fontSize:'13px', color: textSub, marginTop:'4px' }}>
              Register for automated invoice operations & vendor payments
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              display:'flex', alignItems:'center', gap:'8px',
              padding:'10px 14px', borderRadius:'10px',
              background: isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2',
              border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#FCA5A5'}`,
              color: isDark ? '#FCA5A5' : '#DC2626',
              fontSize:'12px', fontWeight:500, marginBottom:'18px',
            }}>
              <AlertCircle size={15} style={{ flexShrink:0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {/* Full Name */}
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:600, color: textSub, marginBottom:'5px' }}>
                Full Name *
              </label>
              <div style={{ position:'relative' }}>
                <User size={15} color={textMuted} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Yuva Umaya Shri"
                  style={{
                    width:'100%', padding:'10px 12px 10px 36px',
                    borderRadius:'10px', border:`1px solid ${inputBorder}`,
                    background: inputBg, color: textMain, fontSize:'13px',
                    outline:'none', boxSizing:'border-box',
                    transition:'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = inputFocus)}
                  onBlur={(e)  => (e.target.style.borderColor = inputBorder)}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:600, color: textSub, marginBottom:'5px' }}>
                Email Address *
              </label>
              <div style={{ position:'relative' }}>
                <Mail size={15} color={textMuted} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{
                    width:'100%', padding:'10px 12px 10px 36px',
                    borderRadius:'10px', border:`1px solid ${inputBorder}`,
                    background: inputBg, color: textMain, fontSize:'13px',
                    outline:'none', boxSizing:'border-box',
                    transition:'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = inputFocus)}
                  onBlur={(e)  => (e.target.style.borderColor = inputBorder)}
                />
              </div>
            </div>

            {/* Account Type dropdown: Exactly 3 options */}
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:600, color: textSub, marginBottom:'5px' }}>
                Account Type *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width:'100%', padding:'10px 12px',
                  borderRadius:'10px', border:`1px solid ${inputBorder}`,
                  background: inputBg, color: textMain, fontSize:'13px',
                  fontWeight: 600, outline:'none', boxSizing:'border-box',
                  cursor:'pointer', transition:'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = inputFocus)}
                onBlur={(e)  => (e.target.style.borderColor = inputBorder)}
              >
                <option value="ADMIN">1. Admin — Executive Management & Governance</option>
                <option value="ACCOUNTS TEAM">2. Accounts Team — Verification & Payment Processing</option>
                <option value="VENDOR">3. Vendor — Invoice Ingestion & Settlement Status</option>
              </select>
            </div>

            {/* Dynamic Vendor Fields */}
            {role === 'VENDOR' && (
              <div style={{
                display:'flex', flexDirection:'column', gap:'12px',
                padding:'12px', borderRadius:'12px',
                border:`1px dashed ${isDark ? '#6FA77A' : '#BFD8B8'}`,
                background: isDark ? 'rgba(111,167,122,0.1)' : '#F4FAF2',
                animation:'fadeIn 0.3s ease forwards',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <Store size={15} color="#6FA77A" />
                  <span style={{ fontSize:'12px', fontWeight:700, color: isDark ? '#BFD8B8' : '#26332B' }}>
                    Vendor Organization Details
                  </span>
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:600, color: textSub, marginBottom:'4px' }}>
                    Vendor / Business Name *
                  </label>
                  <div style={{ position:'relative' }}>
                    <Building2 size={14} color={textMuted} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }} />
                    <input
                      type="text"
                      required={role === 'VENDOR'}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Infotech Pvt Ltd"
                      style={{
                        width:'100%', padding:'9px 12px 9px 34px',
                        borderRadius:'8px', border:`1px solid ${inputBorder}`,
                        background: inputBg, color: textMain, fontSize:'12px',
                        outline:'none', boxSizing:'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'11px', fontWeight:600, color: textSub, marginBottom:'4px' }}>
                    Contact Number
                  </label>
                  <div style={{ position:'relative' }}>
                    <Phone size={14} color={textMuted} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98400 12345"
                      style={{
                        width:'100%', padding:'9px 12px 9px 34px',
                        borderRadius:'8px', border:`1px solid ${inputBorder}`,
                        background: inputBg, color: textMain, fontSize:'12px',
                        outline:'none', boxSizing:'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:600, color: textSub, marginBottom:'5px' }}>
                Password (min 6 characters) *
              </label>
              <div style={{ position:'relative' }}>
                <Lock size={15} color={textMuted} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width:'100%', padding:'10px 40px 10px 36px',
                    borderRadius:'10px', border:`1px solid ${inputBorder}`,
                    background: inputBg, color: textMain, fontSize:'13px',
                    outline:'none', boxSizing:'border-box',
                    transition:'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = inputFocus)}
                  onBlur={(e)  => (e.target.style.borderColor = inputBorder)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color: textMuted, padding:'4px',
                  }}
                >
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:600, color: textSub, marginBottom:'5px' }}>
                Confirm Password *
              </label>
              <div style={{ position:'relative' }}>
                <Lock size={15} color={textMuted} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }} />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width:'100%', padding:'10px 40px 10px 36px',
                    borderRadius:'10px', border:`1px solid ${inputBorder}`,
                    background: inputBg, color: textMain, fontSize:'13px',
                    outline:'none', boxSizing:'border-box',
                    transition:'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = inputFocus)}
                  onBlur={(e)  => (e.target.style.borderColor = inputBorder)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{
                    position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color: textMuted, padding:'4px',
                  }}
                >
                  {showConfirmPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!successUser}
              style={{
                width:'100%', padding:'13px', marginTop:'6px',
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
                  Creating Account…
                </>
              ) : successUser ? (
                <><CheckCircle2 size={16}/> Account Created!</>
              ) : (
                <>Create Account →</>
              )}
            </button>

            {/* Already have an account? Login link */}
            <div style={{ textAlign:'center', marginTop:'12px' }}>
              <span style={{ fontSize:'13px', color: textMuted }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    background:'none',
                    border:'none',
                    color: isDark ? '#E9A992' : '#C76A47',
                    fontSize:'13px',
                    fontWeight:700,
                    cursor:'pointer',
                    padding:0,
                    textDecoration:'underline',
                  }}
                >
                  Login
                </button>
              </span>
            </div>
          </form>
        </div>

        {/* Watermark */}
        <p style={{ position:'absolute', bottom:'14px', fontSize:'11px', color: textMuted,
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

export default RegisterPage;
