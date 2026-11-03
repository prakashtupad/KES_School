/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1A365D',
          navyDark: '#0F2342',
          navyLight: '#2A4A7F',
          gold: '#D97706',
          goldLight: '#F59E0B',
          goldSoft: '#FEF3C7',
          cream: '#F8FAFC',
          surface: '#FFFFFF',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
