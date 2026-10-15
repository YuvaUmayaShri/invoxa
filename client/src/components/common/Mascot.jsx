import React from 'react';

/**
 * INVOXA Document Mascot ("Voxa")
 * ─────────────────────────────────────────────────────────────────────────────
 * A minimal, friendly invoice/document character.
 * Communicates: DOCUMENT + FINANCIAL FLOW + CONCERNED/ATTENTION NEEDED.
 * NO robots, NO antenna, NO angry faces.
 * Uses soft peach (#F6C7B6), pista (#BFD8B8 / #6FA77A), and terracotta (#C96B62).
 */

export const Mascot = ({ state = 'neutral', size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44',
  };

  const dim = sizeMap[size] || sizeMap.md;

  if (state === 'worried') {
    // ── Concerned Invoice Character (Overdue / Attention Needed) ──
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          className={`${dim}`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Warm Amber/Terracotta Halo */}
          <circle cx="50" cy="52" r="42" fill="rgba(246, 199, 182, 0.28)" />

          {/* Main Document Body (Folded Top Right Corner) */}
          <g className="animate-concerned-head" style={{ transformOrigin: '50% 60%' }}>
            {/* Document sheet */}
            <path
              d="M26 18 H62 L74 30 V80 C74 84.4 70.4 88 66 88 H26 C21.6 88 18 84.4 18 80 V26 C18 21.6 21.6 18 26 18 Z"
              fill="#FFFCF8"
              stroke="#F6C7B6"
              strokeWidth="2.5"
            />
            {/* Folded corner flap */}
            <path
              d="M62 18 V28 C62 29.5 63.5 31 65 31 H74"
              fill="#FFE8DC"
              stroke="#E9A992"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Document Lines */}
            <line x1="26" y1="36" x2="48" y2="36" stroke="#E8DED5" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="26" y1="44" x2="40" y2="44" stroke="#E8DED5" strokeWidth="2.5" strokeLinecap="round" />

            {/* Concerned Eyebrows (slanted slightly upward in middle) */}
            <path d="M34 52 Q38 49 42 53" stroke="#C96B62" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M58 53 Q62 49 66 52" stroke="#C96B62" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Concerned Oval Eyes (looking toward clock/due date) */}
            <ellipse cx="38" cy="60" rx="3.5" ry="4.5" fill="#26332B" />
            <ellipse cx="62" cy="60" rx="3.5" ry="4.5" fill="#26332B" />
            {/* Eye light reflection */}
            <circle cx="39.5" cy="58.5" r="1.3" fill="#FFFFFF" />
            <circle cx="63.5" cy="58.5" r="1.3" fill="#FFFFFF" />

            {/* Subtle soft blush */}
            <circle cx="31" cy="65" r="3.5" fill="rgba(246, 199, 182, 0.7)" />
            <circle cx="69" cy="65" r="3.5" fill="rgba(246, 199, 182, 0.7)" />

            {/* Gentle Wavy Concerned Mouth ("Attention Needed") */}
            <path
              d="M45 71 Q50 67 55 70"
              stroke="#C96B62"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Small Floating Clock Icon on the side */}
            <g transform="translate(64, 58)">
              <circle cx="12" cy="12" r="10" fill="#FFF5F0" stroke="#C96B62" strokeWidth="1.8" />
              <polyline points="12,7 12,12 15,14" stroke="#C96B62" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        </svg>

        <style>{`
          @keyframes concernedHead {
            0%, 100% { transform: rotate(0deg) translateY(0); }
            35% { transform: rotate(-3deg) translateY(-1px); }
            70% { transform: rotate(2deg) translateY(0); }
          }
          .animate-concerned-head {
            animation: concernedHead 4.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  if (state === 'working') {
    // ── Processing / Verifying Document Character ──
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          className={`${dim}`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="52" r="42" fill="rgba(191, 216, 184, 0.25)" />

          <g className="animate-working-bounce" style={{ transformOrigin: '50% 60%' }}>
            {/* Document sheet */}
            <path
              d="M26 18 H62 L74 30 V80 C74 84.4 70.4 88 66 88 H26 C21.6 88 18 84.4 18 80 V26 C18 21.6 21.6 18 26 18 Z"
              fill="#FFFCF8"
              stroke="#BFD8B8"
              strokeWidth="2.5"
            />
            {/* Folded corner */}
            <path
              d="M62 18 V28 C62 29.5 63.5 31 65 31 H74"
              fill="#DCE8D5"
              stroke="#6FA77A"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Focused Eyes */}
            <circle cx="38" cy="54" r="4" fill="#26332B" />
            <circle cx="62" cy="54" r="4" fill="#26332B" />
            <circle cx="39.5" cy="52.5" r="1.5" fill="#FFFFFF" />
            <circle cx="63.5" cy="52.5" r="1.5" fill="#FFFFFF" />

            {/* Reading glasses/monocle */}
            <circle cx="38" cy="54" r="7.5" stroke="#E9A992" strokeWidth="1.8" fill="rgba(255,248,241,0.4)" />
            <circle cx="62" cy="54" r="7.5" stroke="#E9A992" strokeWidth="1.8" fill="rgba(255,248,241,0.4)" />
            <line x1="45.5" y1="54" x2="54.5" y2="54" stroke="#E9A992" strokeWidth="1.8" />

            {/* Calm Small Smile */}
            <path d="M46 69 Q50 73 54 69" stroke="#6FA77A" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Processing gear / spark icon */}
            <g transform="translate(62, 60)">
              <circle cx="10" cy="10" r="9" fill="#F4FAF2" stroke="#6FA77A" strokeWidth="1.8" />
              <path d="M10 5 L10 15 M5 10 L15 10" stroke="#6FA77A" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>
        </svg>

        <style>{`
          @keyframes workingBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .animate-working-bounce {
            animation: workingBounce 2.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  if (state === 'celebrating') {
    // ── Settlement Successful / Happy Document Character ──
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          className={`${dim}`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="52" r="42" fill="rgba(191, 216, 184, 0.35)" />

          {/* Document sheet */}
          <path
            d="M26 18 H62 L74 30 V80 C74 84.4 70.4 88 66 88 H26 C21.6 88 18 84.4 18 80 V26 C18 21.6 21.6 18 26 18 Z"
            fill="#FFFCF8"
            stroke="#BFD8B8"
            strokeWidth="2.5"
          />
          {/* Folded corner */}
          <path
            d="M62 18 V28 C62 29.5 63.5 31 65 31 H74"
            fill="#DCE8D5"
            stroke="#6FA77A"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Happy Closed Arc Eyes */}
          <path d="M33 54 Q38 48 43 54" stroke="#26332B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M57 54 Q62 48 67 54" stroke="#26332B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Cheerful Blush */}
          <circle cx="31" cy="60" r="3.5" fill="rgba(246, 199, 182, 0.8)" />
          <circle cx="69" cy="60" r="3.5" fill="rgba(246, 199, 182, 0.8)" />

          {/* Happy Open Smile */}
          <path
            d="M44 65 Q50 74 56 65 Z"
            fill="#C96B62"
            stroke="#C96B62"
            strokeWidth="1.5"
          />

          {/* Green Pista Checkmark Badge */}
          <g transform="translate(60, 60)">
            <circle cx="12" cy="12" r="11" fill="#6FA77A" />
            <path d="m8 12 3 3 5-6" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    );
  }

  // ── Default / Neutral Document Character (Empty States) ──
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className={`${dim}`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="52" r="42" fill="rgba(246, 199, 182, 0.2)" />

        {/* Document sheet */}
        <path
          d="M26 18 H62 L74 30 V80 C74 84.4 70.4 88 66 88 H26 C21.6 88 18 84.4 18 80 V26 C18 21.6 21.6 18 26 18 Z"
          fill="#FFFCF8"
          stroke="#E8DED5"
          strokeWidth="2.5"
        />
        {/* Folded corner */}
        <path
          d="M62 18 V28 C62 29.5 63.5 31 65 31 H74"
          fill="#F5EDE0"
          stroke="#E8DED5"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Decorative Document Lines */}
        <line x1="28" y1="36" x2="48" y2="36" stroke="#E8DED5" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="28" y1="44" x2="42" y2="44" stroke="#E8DED5" strokeWidth="2.5" strokeLinecap="round" />

        {/* Calm Neutral Eyes */}
        <circle cx="38" cy="57" r="3.5" fill="#68756C" />
        <circle cx="62" cy="57" r="3.5" fill="#68756C" />
        <circle cx="39" cy="56" r="1.2" fill="#FFFFFF" />
        <circle cx="63" cy="56" r="1.2" fill="#FFFFFF" />

        {/* Gentle Small Smile */}
        <path d="M46 67 Q50 71 54 67" stroke="#68756C" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
};

export default Mascot;
