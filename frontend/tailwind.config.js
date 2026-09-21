/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: '#070b11',
          900: '#0b111a',
          850: '#0f1724',
          800: '#141e2e',
          700: '#1e2d42',
        },
        neon: {
          green: '#10b981',
          emerald: '#059669',
          cyan: '#06b6d4',
          gold: '#f59e0b',
          amber: '#d97706',
          crimson: '#ef4444',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 0 25px rgba(16, 185, 129, 0.35)',
        'neon-cyan': '0 0 25px rgba(6, 182, 212, 0.35)',
        'neon-gold': '0 0 25px rgba(245, 158, 11, 0.35)',
        'neon-red': '0 0 25px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}
