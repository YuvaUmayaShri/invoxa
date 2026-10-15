/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── INVOXA Primary Brand Colors ──────────────────────────────
        peach: {
          50:  '#FFF5F0',
          100: '#FFE8DC',
          200: '#FFD0B5',
          300: '#F6C7B6',   // PRIMARY PEACH
          400: '#EDB89E',
          500: '#E9A992',   // PEACH ACCENT
          600: '#D4896C',
          700: '#B36849',
          800: '#8C4E32',
          900: '#6A3820',
          950: '#3D1F10',
        },
        pista: {
          50:  '#F4FAF2',
          100: '#DCE8D5',   // LIGHT PISTA
          200: '#C8DFC0',
          300: '#BFD8B8',   // PRIMARY PISTA
          400: '#A9C8A0',
          500: '#8BB882',
          600: '#6FA77A',   // SUCCESS green
          700: '#4E8A5A',
          800: '#376642',
          900: '#24472E',
          950: '#132918',
        },
        cream: {
          50:  '#FFFCF8',   // WARM WHITE
          100: '#FFF8F1',   // WARM CREAM
          200: '#F5EDE0',
          300: '#EDE0CE',
          400: '#DCCDB8',
          500: '#C9B89F',
        },
        // ── Text Colors ───────────────────────────────────────────────
        ink: {
          DEFAULT: '#26332B',  // PRIMARY TEXT
          secondary: '#68756C', // SECONDARY TEXT
          muted: '#98A39A',    // MUTED TEXT
        },
        // ── Dark Mode (Warm Charcoal, NOT cold green) ──────────────────
        dark: {
          bg:    '#20251F',
          card:  '#2A3029',
          warm:  '#302B27',
          border:'#51463F',
          hover: '#3A3430',
        },
        // ── Semantic ──────────────────────────────────────────────────
        success:  '#6FA77A',
        warning:  '#D9A441',
        overdue:  '#C96B62',
        border:   '#E8DED5',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        // Text reveal letter by letter
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-6px)' },
        },
        subtlePulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,107,98,0.25)' },
          '50%':       { boxShadow: '0 0 0 6px rgba(201,107,98,0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up':       'fadeUp 0.5s ease forwards',
        'fade-in':       'fadeIn 0.4s ease forwards',
        'slide-up':      'slideUp 0.5s ease forwards',
        'shake':         'shake 0.4s ease-in-out',
        'float':         'float 4s ease-in-out infinite',
        'overdue-pulse': 'subtlePulse 2.5s infinite',
        'scale-in':      'scaleIn 0.35s ease forwards',
        'shimmer':       'shimmer 2s infinite linear',
      },
      backgroundImage: {
        'warm-cream': 'linear-gradient(135deg, #FFF8F1 0%, #FFFCF8 50%, #F4FAF2 100%)',
        'peach-soft': 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DC 100%)',
        'pista-soft': 'linear-gradient(135deg, #F4FAF2 0%, #DCE8D5 100%)',
      },
    },
  },
  plugins: [],
};
