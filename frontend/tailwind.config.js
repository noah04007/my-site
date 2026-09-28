/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        winter: {
          950: '#07050A',
          900: '#0E0B16',
          850: '#140F21',
          800: '#1B142D',
          700: '#2A1F45',
          600: '#3D2E63',
          purple: '#A855F7',
          violet: '#C084FC',
          lavender: '#E9D5FF',
          // Mapped for full violet overhaul
          cyan: '#A855F7',
          ice: '#DDD6FE',
          frost: '#F3E8FF',
          accent: '#9333EA',
          success: '#10B981',
          warning: '#F59E0B',
          flame: '#F97316'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'glow-purple': '0 0 28px -4px rgba(168, 85, 247, 0.45)',
        'glow-cyan': '0 0 28px -4px rgba(168, 85, 247, 0.45)',
        'glow-flame': '0 0 25px -5px rgba(249, 115, 22, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
