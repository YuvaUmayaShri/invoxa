import React from 'react';
import { ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// ── INVOXA StatCard ────────────────────────────────────────────────────────────
// colorScheme: 'peach' | 'pista' | 'amber' | 'success' | 'overdue'

export const StatCard = ({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  isPositive = true,
  isOverdue = false,
  colorScheme = 'peach',
  onClick,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBg      = isDark ? '#29211E' : '#FFFCF8';
  const borderColor = isDark ? '#54423A' : '#E8DED5';
  const textMain    = isDark ? '#F9EFEA' : '#26332B';
  const textMuted   = isDark ? '#A89489' : '#98A39A';

  // ── Overdue card ──────────────────────────────────────────────────────────
  if (isOverdue) {
    return (
      <div
        onClick={onClick}
        style={{
          position:'relative', overflow:'hidden',
          borderRadius:'14px',
          border:`2px solid rgba(201,107,98,0.55)`,
          background: isDark
            ? 'linear-gradient(135deg, rgba(201,107,98,0.15) 0%, #29211E 100%)'
            : 'linear-gradient(135deg, #FDF3F1 0%, #FFFCF8 100%)',
          padding:'20px',
          boxShadow:`0 4px 20px rgba(201,107,98,${isDark?'0.2':'0.12'})`,
          cursor: onClick ? 'pointer' : 'default',
          transition:'all 0.2s',
        }}
        onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 28px rgba(201,107,98,${isDark?'0.3':'0.2'})`; }}}
        onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 4px 20px rgba(201,107,98,${isDark?'0.2':'0.12'})`; }}
      >
        {/* Accent blob */}
        <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px',
          background:'rgba(201,107,98,0.12)', borderRadius:'50%', filter:'blur(12px)', pointerEvents:'none' }}/>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <span style={{ position:'relative', width:'8px', height:'8px', display:'inline-flex' }}>
              <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(201,107,98,0.5)', animation:'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}/>
              <span style={{ position:'relative', width:'8px', height:'8px', borderRadius:'50%', background:'#C96B62', display:'inline-block' }}/>
            </span>
            <span style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', color:'#C96B62' }}>
              Action Required
            </span>
          </div>
          <div style={{ padding:'8px', borderRadius:'10px', background:'rgba(201,107,98,0.15)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <AlertCircle size={18} color="#C96B62"/>
          </div>
        </div>

        <p style={{ fontSize:'12px', fontWeight:600, color: isDark ? '#D6C2B6' : '#68756C', marginBottom:'4px' }}>{title}</p>
        <p style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:'#C96B62', letterSpacing:'-0.02em', marginBottom:'8px' }}>
          {value}
        </p>

        {subvalue && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:'4px',
            padding:'3px 10px', borderRadius:'6px',
            background:`rgba(201,107,98,${isDark?'0.15':'0.12'})`,
            color:'#C96B62', fontSize:'11px', fontWeight:700 }}>
            <AlertCircle size={11}/> {subvalue}
          </div>
        )}
        <style>{`@keyframes ping { 75%,100%{transform:scale(2);opacity:0} }`}</style>
      </div>
    );
  }

  // ── Color scheme map ──────────────────────────────────────────────────────
  const schemes = {
    peach:   { icon: isDark ? 'rgba(246,199,182,0.15)' : '#F6C7B6', text: isDark ? '#F6C7B6' : '#8C4E32' },
    pista:   { icon: isDark ? 'rgba(191,216,184,0.15)' : '#BFD8B8', text: isDark ? '#BFD8B8' : '#376642' },
    amber:   { icon: isDark ? 'rgba(217,164,65,0.15)'  : '#F5E2C0', text: isDark ? '#D9A441' : '#A0783B' },
    success: { icon: isDark ? 'rgba(111,167,122,0.15)' : '#C8DFC0', text: isDark ? '#6FA77A' : '#376642' },
    brand:   { icon: isDark ? 'rgba(246,199,182,0.15)' : '#F6C7B6', text: isDark ? '#F6C7B6' : '#8C4E32' },
    blue:    { icon: isDark ? 'rgba(191,216,184,0.15)' : '#BFD8B8', text: isDark ? '#BFD8B8' : '#376642' },
    emerald: { icon: isDark ? 'rgba(111,167,122,0.15)' : '#C8DFC0', text: isDark ? '#6FA77A' : '#376642' },
  };
  const scheme = schemes[colorScheme] || schemes.peach;

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius:'14px', border:`1px solid ${borderColor}`,
        background: cardBg, padding:'20px',
        boxShadow:`0 1px 4px rgba(38,51,43,${isDark?'0.12':'0.06'})`,
        cursor: onClick ? 'pointer' : 'default',
        transition:'all 0.2s',
      }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 20px rgba(38,51,43,${isDark?'0.2':'0.1'})`; }}}
      onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 1px 4px rgba(38,51,43,${isDark?'0.12':'0.06'})`; }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
        <p style={{ fontSize:'11px', fontWeight:600, color: textMuted, textTransform:'uppercase', letterSpacing:'0.05em' }}>
          {title}
        </p>
        {Icon && (
          <div style={{ padding:'8px', borderRadius:'10px', background: scheme.icon,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={16} color={scheme.text}/>
          </div>
        )}
      </div>

      <p style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color: textMain, letterSpacing:'-0.02em', marginBottom:'8px' }}>
        {value}
      </p>

      <div style={{ fontSize:'11px' }}>
        {subvalue ? (
          <span style={{ color: textMuted, fontWeight:500 }}>{subvalue}</span>
        ) : trend ? (
          <div style={{ display:'flex', alignItems:'center', gap:'4px', fontWeight:600 }}>
            {isPositive ? (
              <span style={{ display:'inline-flex', alignItems:'center', color:'#6FA77A' }}>
                <ArrowUpRight size={12}/>{trend}
              </span>
            ) : (
              <span style={{ display:'inline-flex', alignItems:'center', color:'#C96B62' }}>
                <ArrowDownRight size={12}/>{trend}
              </span>
            )}
            <span style={{ color: textMuted, fontWeight:400 }}>{trendLabel}</span>
          </div>
        ) : (
          <span style={{ color: textMuted }}>Updated just now</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
