import React, { useEffect, useState } from 'react';

/**
 * INVOXA Personalized Greeting
 * ─────────────────────────────────────────────────────────────────────────────
 * Clean separate transition screen shown directly after successful authentication:
 *  1. Background softly fades in (warm cream with subtle peach/pista atmosphere)
 *  2. Small generated friendly waving invoice/document character appears
 *  3. Dynamic time-based greeting: "Good morning" / "Good afternoon" / "Good evening"
 *  4. Dynamic user greeting: "Hi [Name] 👋"
 *  5. Entire greeting area is interactive: user touches/clicks to enter dashboard
 *  6. Dashboard is NOT visible behind this screen
 */

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)  return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeAnimation({ user, onComplete }) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  const greeting = getTimeGreeting();
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);  // Visual fades in
    const t2 = setTimeout(() => setPhase(2), 350);  // Greeting slides in
    const t3 = setTimeout(() => setPhase(3), 650);  // "Hi [Name] 👋"
    const t4 = setTimeout(() => setPhase(4), 950);  // Interactive hint appears

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleEnterDashboard = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 450);
  };

  return (
    <div
      onClick={handleEnterDashboard}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEnterDashboard();
        }
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none cursor-pointer outline-none px-6"
      style={{
        background: 'linear-gradient(135deg, #FFF8F1 0%, #FFFCF8 55%, #F4FAF2 100%)',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      {/* Subtle atmospheric ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(246,199,182,0.4) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-120px',
          left: '-120px',
          width: '460px',
          height: '460px',
          background: 'radial-gradient(circle, rgba(191,216,184,0.35) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Main Centered Greeting Container */}
      <div
        className="group flex flex-col items-center text-center max-w-md transition-all duration-300"
        style={{
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        {/* Small Generated Friendly Waving Invoice Character */}
        <div
          style={{
            marginBottom: '28px',
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.9)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.25, 0.64, 1)',
          }}
          className="transition-transform duration-300 group-hover:scale-108 group-active:scale-96"
        >
          <svg
            width="96"
            height="96"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft Peach & Pista Halo */}
            <circle cx="50" cy="52" r="42" fill="rgba(246, 199, 182, 0.3)" />

            {/* Document sheet */}
            <g style={{ transformOrigin: '50% 60%' }}>
              <path
                d="M26 18 H62 L74 30 V80 C74 84.4 70.4 88 66 88 H26 C21.6 88 18 84.4 18 80 V26 C18 21.6 21.6 18 26 18 Z"
                fill="#FFFCF8"
                stroke="#E9A992"
                strokeWidth="2.2"
              />
              {/* Folded corner */}
              <path
                d="M62 18 V28 C62 29.5 63.5 31 65 31 H74"
                fill="#FFE8DC"
                stroke="#E9A992"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Minimal document lines */}
              <line x1="28" y1="36" x2="48" y2="36" stroke="#E8DED5" strokeWidth="2" strokeLinecap="round" />
              <line x1="28" y1="43" x2="42" y2="43" stroke="#E8DED5" strokeWidth="2" strokeLinecap="round" />

              {/* Friendly calm eyes */}
              <circle cx="38" cy="54" r="3.6" fill="#26332B" />
              <circle cx="60" cy="54" r="3.6" fill="#26332B" />
              {/* Catchlight */}
              <circle cx="39.2" cy="52.8" r="1.3" fill="#FFFFFF" />
              <circle cx="61.2" cy="52.8" r="1.3" fill="#FFFFFF" />

              {/* Soft peach blush */}
              <circle cx="31" cy="59" r="3.5" fill="rgba(246, 199, 182, 0.85)" />
              <circle cx="67" cy="59" r="3.5" fill="rgba(246, 199, 182, 0.85)" />

              {/* Friendly warm smile */}
              <path
                d="M44 63 Q49 68 54 63"
                stroke="#26332B"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Waving arm / hand (peach & pista) */}
              <g className="animate-waving-hand" style={{ transformOrigin: '70px 48px' }}>
                <path
                  d="M72 48 Q82 42 84 36"
                  stroke="#E9A992"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="85" cy="35" r="4.2" fill="#F6C7B6" stroke="#E9A992" strokeWidth="1.5" />
              </g>
            </g>
          </svg>
        </div>

        {/* Dynamic Time-based Greeting */}
        <p
          style={{
            fontSize: 'clamp(14px, 2.5vw, 17px)',
            fontWeight: 600,
            color: '#68756C',
            marginBottom: '6px',
            letterSpacing: '0.04em',
            textTransform: 'capitalize',
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.4s ease',
          }}
        >
          {greeting}
        </p>

        {/* Dynamic Personalized Name & Wave */}
        <h1
          style={{
            fontSize: 'clamp(32px, 7vw, 48px)',
            fontWeight: 900,
            color: '#26332B',
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '20px',
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.45s ease',
          }}
        >
          Hi {firstName} <span style={{ display: 'inline-block', animation: 'subtleWave 1.4s ease-in-out infinite' }}>👋</span>
        </h1>

        {/* Interactive Cue: "Touch greeting / visual to enter dashboard" */}
        <div
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(6px)',
            transition: 'all 0.5s ease',
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group-hover:scale-105"
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#6FA77A',
              letterSpacing: '0.02em',
            }}
          >
            Touch anywhere to enter dashboard →
          </span>
        </div>
      </div>

      <style>{`
        @keyframes gentleHandWave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(16deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-waving-hand {
          animation: gentleHandWave 1.8s ease-in-out infinite;
        }
        @keyframes subtleWave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(14deg); }
          75% { transform: rotate(-10deg); }
        }
      `}</style>
    </div>
  );
}
