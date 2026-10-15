import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Moon, Sunrise, Coffee, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * INVOXA GreetingAnimation
 * ─────────────────────────────────────────────────────────────────────────────
 * Beautiful Peach & Pista animated banner.
 * Sequence:
 *  1. Warm time-of-day greeting: "Good morning, have a wonderful day!"
 *  2. Smooth transition into: "Welcome to INVOXA — Intelligent Invoice Operations"
 *  3. Interactive toggle & subtle peach-pista glowing gradient animations.
 */

export const GreetingAnimation = ({ userName = '', onActionClick, showAction = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [greetingText, setGreetingText] = useState('');
  const [subText, setSubText] = useState('');
  const [phase, setPhase] = useState(0); // 0: Good morning/day, 1: Morphing to INVOXA
  const [isFading, setIsFading] = useState(false);

  // Determine time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    let timeSub = 'Wishing you a productive and wonderful day ahead.';

    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
      timeSub = 'Keep up the momentum. Have a great day.';
    } else if (hour >= 17 && hour < 22) {
      timeGreeting = 'Good evening';
      timeSub = 'Wrapping up your day with seamless finances.';
    } else if (hour >= 22 || hour < 5) {
      timeGreeting = 'Good night';
      timeSub = 'Late night productivity — your invoices are safe with us.';
    }

    const name = userName ? `, ${userName}` : '';
    const initialGreeting = `${timeGreeting}${name}! Have a good day.`;
    const invoxaGreeting = `Welcome to INVOXA`;
    const invoxaSub = `Intelligent Invoice Operations`;

    // Phase alternation loop
    const cycle = () => {
      setIsFading(true);
      setTimeout(() => {
        setPhase((prev) => {
          const next = prev === 0 ? 1 : 0;
          if (next === 0) {
            setGreetingText(initialGreeting);
            setSubText(timeSub);
          } else {
            setGreetingText(invoxaGreeting);
            setSubText(invoxaSub);
          }
          setIsFading(false);
          return next;
        });
      }, 500); // 500ms fade transition
    };

    // Set initial
    setGreetingText(initialGreeting);
    setSubText(timeSub);

    // Swap text every 4.5 seconds
    const interval = setInterval(cycle, 4500);
    return () => clearInterval(interval);
  }, [userName]);

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return <Sunrise className="w-5 h-5 text-[#E9A992] animate-bounce" />;
    if (hour >= 12 && hour < 18) return <Sun className="w-5 h-5 text-[#D9A441] animate-spin" style={{ animationDuration: '10s' }} />;
    return <Moon className="w-5 h-5 text-[#BFD8B8]" />;
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 mb-6 transition-all duration-500 shadow-sm"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(42,48,41,0.95) 0%, rgba(32,37,31,0.95) 100%)'
          : 'linear-gradient(135deg, #FFF5F0 0%, #FFFCF8 45%, #F4FAF2 100%)',
        border: isDark ? '1px solid #51463F' : '1px solid #E8DED5',
        boxShadow: isDark
          ? '0 4px 20px -2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 4px 20px -2px rgba(233,169,146,0.15), 0 2px 6px -1px rgba(191,216,184,0.2)',
      }}
    >
      {/* Decorative ambient glowing orbs */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 w-44 h-44 rounded-full blur-2xl"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(233,169,146,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(246,199,182,0.45) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -left-12 -bottom-12 w-44 h-44 rounded-full blur-2xl"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(191,216,184,0.10) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(191,216,184,0.40) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Greeting Icon & Text */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #352924 0%, #29211E 100%)'
                : 'linear-gradient(135deg, #FFE8DC 0%, #F4FAF2 100%)',
              border: isDark ? '1px solid #54423A' : '1px solid #F6C7B6',
            }}
          >
            {phase === 0 ? getTimeIcon() : <Sparkles className="w-5 h-5 text-[#6FA77A]" />}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: isDark ? 'rgba(191,216,184,0.15)' : '#DCE8D5',
                  color: isDark ? '#A9C8A0' : '#376642',
                  border: isDark ? '1px solid rgba(191,216,184,0.2)' : '1px solid #BFD8B8',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#6FA77A] animate-pulse" />
                {phase === 0 ? 'Daily Greeting' : 'INVOXA System'}
              </span>
              <span
                className="text-[11px] font-medium"
                style={{ color: isDark ? '#9AA69C' : '#98A39A' }}
              >
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Morphing headline */}
            <h2
              className="text-base sm:text-lg font-bold transition-all duration-500 ease-in-out"
              style={{
                opacity: isFading ? 0 : 1,
                transform: isFading ? 'translateY(6px)' : 'translateY(0)',
                color: isDark ? '#EDE8E0' : '#26332B',
              }}
            >
              {phase === 1 ? (
                <span>
                  Welcome to <span style={{ color: '#E9A992', fontWeight: 800 }}>INVOXA</span>
                </span>
              ) : (
                greetingText
              )}
            </h2>

            {/* Subtitle */}
            <p
              className="text-xs transition-all duration-500 ease-in-out mt-0.5"
              style={{
                opacity: isFading ? 0 : 1,
                transform: isFading ? 'translateY(4px)' : 'translateY(0)',
                color: isDark ? '#9AA69C' : '#68756C',
              }}
            >
              {subText}
            </p>
          </div>
        </div>

        {/* Right: Quick Action / Brand Badge */}
        <div className="flex items-center gap-2 sm:self-center">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: isDark ? '#29211E' : '#FFFDFC',
              border: isDark ? '1px solid #54423A' : '1px solid #E8DED5',
              color: isDark ? '#E9A992' : '#4E8A5A',
            }}
          >
            <Coffee className="w-3.5 h-3.5 text-[#E9A992]" />
            <span>Productive Day Ahead</span>
          </div>

          {showAction && onActionClick && (
            <button
              onClick={onActionClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
              }}
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GreetingAnimation;
