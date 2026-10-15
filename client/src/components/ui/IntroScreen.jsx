import React, { useEffect, useState } from 'react';

/**
 * INVOXA Intro Screen
 * ─────────────────────────────────────────────────────────────────────────────
 * Minimal, pristine intro:
 *  - Absolutely NO quotes, NO introductory text, NO buttons, NO palette descriptions.
 *  - Begins directly with the slow, elegant INVOXA letter-by-letter reveal.
 *  - Once revealed, the INVOXA emblem and name are INTERACTIVE.
 *  - Touching/clicking INVOXA smoothly transitions directly into the Login screen.
 */

const LETTERS = ['I', 'N', 'V', 'O', 'X', 'A'];

export default function IntroScreen({ onComplete }) {
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [readyToInteract, setReadyToInteract] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Elegant slow letter-by-letter reveal
    const timers = [];
    LETTERS.forEach((_, i) => {
      const t = setTimeout(() => {
        setVisibleLetters(i + 1);
      }, 400 + i * 260);
      timers.push(t);
    });

    // Mark as ready for interaction after animation finishes
    const readyTimer = setTimeout(() => {
      setReadyToInteract(true);
    }, 400 + LETTERS.length * 260 + 200);
    timers.push(readyTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const handleInteraction = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onComplete, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none px-4"
      style={{
        background: 'linear-gradient(135deg, #FFF8F1 0%, #FFFCF8 55%, #F4FAF2 100%)',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      {/* Subtle atmospheric peach & pista ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '460px',
          height: '460px',
          background: 'radial-gradient(circle, rgba(246,199,182,0.35) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-140px',
          left: '-140px',
          width: '520px',
          height: '520px',
          background: 'radial-gradient(circle, rgba(191,216,184,0.32) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Main Interactive INVOXA Brand Element */}
      <div
        onClick={handleInteraction}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleInteraction();
          }
        }}
        className="group flex flex-col items-center text-center cursor-pointer outline-none transition-all duration-300"
        style={{
          transform: readyToInteract ? 'translateY(0)' : 'translateY(4px)',
        }}
      >
        {/* INVOXA Folded Document + Verified Check Emblem */}
        <div
          style={{
            marginBottom: '24px',
            opacity: visibleLetters > 0 ? 1 : 0,
            transform: visibleLetters > 0 ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.9)',
            transition: 'all 0.6s cubic-bezier(0.34, 1.3, 0.64, 1)',
          }}
          className="transition-transform duration-300 group-hover:scale-108 group-active:scale-96"
        >
          <div
            className="p-4 rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-md"
            style={{
              background: 'linear-gradient(135deg, #FFE8DC 0%, #DCE8D5 100%)',
              border: '1.5px solid #F6C7B6',
            }}
          >
            <svg width="52" height="52" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="56" height="56" rx="14" fill="#F6C7B6" />
              <path
                d="M16 12h16l8 8v20a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z"
                fill="#FFFCF8"
                stroke="#E9A992"
                strokeWidth="1.6"
              />
              <polyline points="32,12 32,20 40,20" fill="#FFE8DC" stroke="#E9A992" strokeWidth="1.6" />
              <path
                d="m20 34 4 4 9-9"
                stroke="#6FA77A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* INVOXA letter-by-letter reveal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          className="transition-transform duration-300 group-hover:scale-104 group-active:scale-98"
        >
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              style={{
                fontSize: 'clamp(48px, 12vw, 84px)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
                color: '#26332B',
                opacity: visibleLetters > i ? 1 : 0,
                transform: visibleLetters > i ? 'translateY(0)' : 'translateY(14px)',
                transition: 'all 0.45s cubic-bezier(0.34, 1.25, 0.64, 1)',
                display: 'inline-block',
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
