/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // X-MMHF Design System
        brand: {
          50:  '#f0f4ff',
          100: '#dce7ff',
          200: '#b9cfff',
          300: '#85abff',
          400: '#4d7eff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e3070',
        },
        surface: {
          900: '#0a0d1a',
          800: '#0f1629',
          750: '#131c35',
          700: '#1a2440',
          600: '#1e2d4e',
          500: '#243358',
          400: '#2d4070',
          300: '#3a5285',
        },
        accent: {
          cyan:   '#06b6d4',
          purple: '#8b5cf6',
          emerald:'#10b981',
          amber:  '#f59e0b',
          rose:   '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glow:    { '0%': { boxShadow: '0 0 5px #2563eb40' }, '100%': { boxShadow: '0 0 20px #2563eb80' } },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
